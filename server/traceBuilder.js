
import { buildStrategyComparison, chooseNextToken, createSeededRandom } from './decoders.js';
import { summarizeAttention, summarizeEmbedding } from './traceSummaries.js';
import { displayToken, logSumExpDenominator, normalizeTokenText, pickLastTokenLogits, topKIndices } from './traceUtils.js';

function summarizeDistribution(sortedItems) {
  const top1 = sortedItems[0];
  const top2 = sortedItems[1];
  const entropy = sortedItems.slice(0, 32).reduce((sum, item) => {
    const p = Number(item.probability || 0);
    if (p <= 0) return sum;
    return sum - (p * Math.log2(p));
  }, 0);

  return {
    entropy: Number(entropy.toFixed(4)),
    top1Probability: Number((top1?.probability || 0).toFixed(6)),
    top2Probability: Number((top2?.probability || 0).toFixed(6)),
    confidenceGap: Number(((top1?.probability || 0) - (top2?.probability || 0)).toFixed(6)),
  };
}

export async function buildTrace({
  tokenizer,
  model,
  prompt,
  maxNewTokens = 1,
  topK = 8,
  topP = 0.9,
  temperature = 1,
  decodingStrategy = 'greedy',
  locale = 'en',
  seed = 1234,
}) {
  const startedAt = Date.now();
  const steps = [];
  const generationSteps = [];
  let currentText = String(prompt || '');
  let finalText = currentText;
  let finalNextToken = '';

  let initialTokens = [];
  let initialTokenIds = [];
  let initialTokensDisplay = [];
  let latestEmbeddings = [];
  let latestAttention = { available: false, focusToken: null, focusIndex: 0, attention: [], matrix: [] };
  let latestResidual = [];
  let latestLogits = [];
  let latestStrategyComparison = [];
  let traceMetrics = { totalMs: 0, averageStepMs: 0, seed: Number(seed || 1234) };

  for (let decodeStep = 0; decodeStep < maxNewTokens; decodeStep += 1) {
    const rawTokens = tokenizer.tokenize(currentText);
    const rawTokenIds = tokenizer.encode(currentText, { add_special_tokens: false });

    const stepStart = Date.now();
    const modelInputs = await tokenizer(currentText, { truncation: true, padding: false });
    const outputs = await model({ ...modelInputs, output_attentions: true, output_hidden_states: true });
    const forwardMs = Date.now() - stepStart;

    const { values: lastTokenLogits } = pickLastTokenLogits(outputs.logits, locale);
    const { max, denom, temperature: appliedTemperature } = logSumExpDenominator(lastTokenLogits, temperature);
    const ranked = topKIndices(lastTokenLogits, lastTokenLogits.length).map((item) => ({
      ...item,
      tokenId: item.index,
      token: normalizeTokenText(tokenizer.decode([item.index], { skip_special_tokens: false })),
      logit: Number(item.value.toFixed(4)),
      probability: Number((Math.exp((item.value / appliedTemperature) - max) / denom).toFixed(6)),
    }));

    const random = createSeededRandom(Number(seed || 1234) + decodeStep * 1009);
    const decision = chooseNextToken({ sortedItems: ranked, strategy: decodingStrategy, topK, topP, random });
    const comparison = buildStrategyComparison(ranked, { topK, topP, baseSeed: Number(seed || 1234) + decodeStep * 997 });
    const chosen = decision.chosen;
    const chosenTokenText = tokenizer.decode([chosen.index], { skip_special_tokens: false });
    const nextText = currentText + chosenTokenText;
    const focusIndex = Math.max(0, rawTokens.length - 1);
    const embeddings = summarizeEmbedding(outputs.hidden_states, rawTokens, rawTokenIds);
    const attentionSummary = summarizeAttention(outputs.attentions, rawTokens, focusIndex);
    const residual = embeddings.at(-1)?.values ?? [];
    const visibleTop = ranked.slice(0, topK);
    const distribution = summarizeDistribution(ranked);

    generationSteps.push({
      step: decodeStep,
      inputText: currentText,
      tokens: rawTokens,
      tokensDisplay: rawTokens.map(displayToken),
      tokenIds: rawTokenIds,
      focusIndex,
      focusToken: rawTokens[focusIndex] ?? null,
      topLogits: visibleTop,
      chosenTokenId: chosen.index,
      chosenTokenText: normalizeTokenText(chosenTokenText),
      completion: nextText,
      attentionAvailable: attentionSummary.available,
      attention: attentionSummary,
      residual,
      strategy: decision.strategy,
      sampled: decision.sampled,
      sampleDraw: decision.draw,
      candidatePoolSize: decision.candidatePool.length,
      candidatePoolMass: decision.candidateProbabilityMass,
      candidatePool: decision.candidatePool,
      entropy: decision.entropy,
      topP,
      topK,
      temperature: appliedTemperature,
      strategyComparison: comparison,
      metrics: {
        forwardMs,
        ...distribution,
      },
    })

    if (decodeStep === 0) {
      initialTokens = rawTokens;
      initialTokenIds = rawTokenIds;
      initialTokensDisplay = rawTokens.map(displayToken);
      latestEmbeddings = embeddings;
      latestAttention = attentionSummary;
      latestResidual = residual;
      latestLogits = visibleTop;
      latestStrategyComparison = comparison;
      finalNextToken = normalizeTokenText(chosenTokenText);
    }

    currentText = nextText;
    finalText = nextText;
  }

  traceMetrics = {
    totalMs: Date.now() - startedAt,
    averageStepMs: generationSteps.length ? Number((generationSteps.reduce((sum, step) => sum + step.metrics.forwardMs, 0) / generationSteps.length).toFixed(2)) : 0,
    seed: Number(seed || 1234),
  };

  const pushStep = (id, payload) => steps.push({ id, payload });
  pushStep('prompt', { prompt, length: String(prompt || '').length });
  pushStep('tokenization', { tokens: initialTokens, tokensDisplay: initialTokensDisplay, ids: initialTokenIds });
  pushStep('embedding', { embeddings: latestEmbeddings });
  pushStep('attention', latestAttention);
  pushStep('residual', { residual: latestResidual });
  pushStep('logits', { logits: latestLogits, strategyComparison: latestStrategyComparison, decodingStrategy, topP, topK, temperature, seed: Number(seed || 1234) });
  pushStep('decode', { nextToken: finalNextToken, completion: finalText, generationSteps, decodingStrategy, topP, topK, temperature, seed: Number(seed || 1234), metrics: traceMetrics });

  return {
    prompt,
    tokens: initialTokens,
    tokensDisplay: initialTokensDisplay,
    ids: initialTokenIds,
    nextToken: finalNextToken,
    finalText,
    generationSteps,
    steps,
    metrics: traceMetrics,
    decoding: { strategy: decodingStrategy, topP, topK, temperature, seed: Number(seed || 1234) },
  };
}
