import { displayToken, tensorToArray } from './traceUtils.js';

export function summarizeEmbedding(hiddenStates, tokens, tokenIds) {
  if (!hiddenStates?.length) return [];
  const lastLayer = hiddenStates.at(-1);
  const dims = lastLayer?.dims ?? [];
  if (dims.length !== 3) return [];

  const [, seqLen, hiddenSize] = dims;
  const flat = tensorToArray(lastLayer);

  return Array.from({ length: seqLen }, (_, tokenIndex) => {
    const start = tokenIndex * hiddenSize;
    const values = flat.slice(start, start + Math.min(hiddenSize, 12)).map((value) => Number(Number(value).toFixed(4)));
    return {
      token: tokens[tokenIndex] ?? `#${tokenIndex}`,
      tokenDisplay: displayToken(tokens[tokenIndex] ?? `#${tokenIndex}`),
      id: tokenIds[tokenIndex] ?? null,
      values,
    };
  });
}

export function summarizeAttention(attentions, tokens, focusIndex) {
  if (!attentions?.length) return { available: false, focusToken: tokens[focusIndex] ?? null, focusIndex, attention: [], matrix: [] };

  const lastLayer = attentions.at(-1);
  const dims = lastLayer?.dims ?? [];
  if (dims.length !== 4) return { available: false, focusToken: tokens[focusIndex] ?? null, focusIndex, attention: [], matrix: [] };

  const [batch, heads, seqLen, sourceLen] = dims;
  if (batch !== 1) return { available: false, focusToken: tokens[focusIndex] ?? null, focusIndex, attention: [], matrix: [] };

  const flat = tensorToArray(lastLayer);
  const matrix = [];

  for (let targetIndex = 0; targetIndex < seqLen; targetIndex += 1) {
    const row = [];
    for (let sourceIndex = 0; sourceIndex < sourceLen; sourceIndex += 1) {
      let sum = 0;
      for (let headIndex = 0; headIndex < heads; headIndex += 1) {
        const offset = (((headIndex * seqLen) + targetIndex) * sourceLen) + sourceIndex;
        sum += flat[offset] ?? 0;
      }
      row.push(Number((sum / heads).toFixed(4)));
    }
    matrix.push(row);
  }

  return {
    available: true,
    focusToken: tokens[focusIndex] ?? null,
    focusTokenDisplay: displayToken(tokens[focusIndex] ?? null),
    focusIndex,
    attention: matrix[focusIndex].map((weight, sourceIndex) => ({
      source: tokens[sourceIndex] ?? `#${sourceIndex}`,
      sourceDisplay: displayToken(tokens[sourceIndex] ?? `#${sourceIndex}`),
      sourceIndex,
      weight,
    })),
    matrix,
    tokensDisplay: tokens.map(displayToken),
  };
}
