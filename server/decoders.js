
export const DECODING_STRATEGIES = ['greedy', 'top-k', 'top-p'];

export function createSeededRandom(seed = 1234) {
  let state = Math.abs(Math.trunc(Number(seed) || 1234)) % 2147483647;
  if (state === 0) state = 1;
  return () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
}

export function selectTopP(sortedItems, topP = 0.9) {
  const selected = [];
  let cumulative = 0;
  for (const item of sortedItems) {
    selected.push(item);
    cumulative += item.probability;
    if (cumulative >= topP) break;
  }
  return selected;
}

function normalizePool(pool) {
  const total = pool.reduce((sum, item) => sum + Number(item.probability || 0), 0);
  if (total <= 0) {
    return {
      pool: pool.map((item, index) => ({ ...item, normalizedProbability: index === 0 ? 1 : 0 })),
      totalProbability: 1,
      entropy: 0,
    };
  }

  let entropy = 0;
  const normalizedPool = pool.map((item) => {
    const normalizedProbability = Number(item.probability || 0) / total;
    if (normalizedProbability > 0) entropy += -(normalizedProbability * Math.log2(normalizedProbability));
    return { ...item, normalizedProbability: Number(normalizedProbability.toFixed(6)) };
  });

  return {
    pool: normalizedPool,
    totalProbability: Number(total.toFixed(6)),
    entropy: Number(entropy.toFixed(4)),
  };
}

function sampleFromPool(normalizedPool, random) {
  const draw = random();
  let cumulative = 0;
  for (const item of normalizedPool) {
    cumulative += item.normalizedProbability;
    if (draw <= cumulative) return { chosen: item, draw: Number(draw.toFixed(6)) };
  }
  return { chosen: normalizedPool.at(-1), draw: Number(draw.toFixed(6)) };
}

function buildCandidatePool(sortedItems, strategy, topK, topP) {
  if (strategy === 'greedy') return sortedItems.slice(0, 1);
  if (strategy === 'top-k') return sortedItems.slice(0, topK);
  return selectTopP(sortedItems, topP);
}

export function chooseNextToken({ sortedItems, strategy = 'greedy', topK = 8, topP = 0.9, random = Math.random }) {
  const normalized = DECODING_STRATEGIES.includes(strategy) ? strategy : 'greedy';
  const candidatePool = buildCandidatePool(sortedItems, normalized, topK, topP);
  const normalizedPool = normalizePool(candidatePool);

  if (normalized === 'greedy') {
    return {
      strategy: normalized,
      chosen: sortedItems[0],
      candidatePool: normalizedPool.pool,
      candidateProbabilityMass: normalizedPool.totalProbability,
      sampled: false,
      draw: 0,
      entropy: normalizedPool.entropy,
      explanation: 'highest_probability',
    };
  }

  const sampled = sampleFromPool(normalizedPool.pool, random);
  return {
    strategy: normalized,
    chosen: sampled.chosen,
    candidatePool: normalizedPool.pool,
    candidateProbabilityMass: normalizedPool.totalProbability,
    sampled: true,
    draw: sampled.draw,
    entropy: normalizedPool.entropy,
    explanation: normalized === 'top-k' ? 'sampled_from_top_k' : 'sampled_from_top_p',
  };
}

export function buildStrategyComparison(sortedItems, { topK = 8, topP = 0.9, baseSeed = 1234 } = {}) {
  return DECODING_STRATEGIES.map((strategy, index) => {
    const random = createSeededRandom(Number(baseSeed || 1234) + (index + 1) * 97);
    const result = chooseNextToken({ sortedItems, strategy, topK, topP, random });
    const normalizedChosen = result.candidatePool.find((item) => item.index === result.chosen.index);
    return {
      strategy: result.strategy,
      chosenTokenId: result.chosen.index,
      chosenToken: result.chosen.token,
      probability: result.chosen.probability,
      normalizedProbability: normalizedChosen?.normalizedProbability ?? result.chosen.probability,
      poolSize: result.candidatePool.length,
      poolMass: result.candidateProbabilityMass,
      entropy: result.entropy,
      sampled: result.sampled,
      explanation: result.explanation,
    };
  });
}
