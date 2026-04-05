import { getServerMessage } from './messages.js';

export function tensorToArray(tensor) {
  if (!tensor) return [];
  return Array.from(tensor.data ?? tensor);
}

export function pickLastTokenLogits(logitsTensor, locale = 'en') {
  const dims = logitsTensor.dims ?? [];
  if (dims.length !== 3) throw new Error(`${getServerMessage(locale, 'invalidLogits')}: ${JSON.stringify(dims)}`);

  const [batch, seqLen, vocabSize] = dims;
  if (batch !== 1) throw new Error(`${getServerMessage(locale, 'invalidBatch')}: ${batch}`);

  const flat = tensorToArray(logitsTensor);
  const start = (seqLen - 1) * vocabSize;
  return { seqLen, vocabSize, values: flat.slice(start, start + vocabSize) };
}

export function topKIndices(values, k) {
  return Array.from(values, (value, index) => ({ index, value: Number(value) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, k);
}

export function logSumExpDenominator(values, temperature = 1) {
  const safeTemperature = Math.max(0.2, Number(temperature || 1));
  let max = -Infinity;
  for (let i = 0; i < values.length; i += 1) {
    const v = Number(values[i]) / safeTemperature;
    if (v > max) max = v;
  }
  let denom = 0;
  for (let i = 0; i < values.length; i += 1) denom += Math.exp((Number(values[i]) / safeTemperature) - max);
  return { max, denom, temperature: safeTemperature };
}

export function normalizeTokenText(text) {
  if (!text) return '∅';
  return String(text).replace(/\n/g, '\\n');
}

export function displayToken(token) {
  if (token == null) return '∅';
  return String(token).replace(/\n/g, '⏎').replace(/\t/g, '⇥').replace(/ /g, '␠');
}
