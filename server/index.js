
import cors from 'cors';
import express from 'express';
import { getModelMeta, getModelState } from './modelService.js';
import { getServerMessage, normalizeServerLocale } from './messages.js';
import { buildTrace } from './traceBuilder.js';

const app = express();
const port = Number(process.env.PORT || 8787);

app.use(cors());
app.use(express.json({ limit: '2mb' }));

app.get('/api/health', async (_req, res) => {
  res.json({ ok: true, ...getModelMeta() });
});

app.post('/api/load-model', async (req, res) => {
  const locale = normalizeServerLocale(req.body?.locale);
  try {
    await getModelState();
    res.json({ ok: true, ...getModelMeta() });
  } catch (error) {
    console.error('load-model error:', error);
    res.status(500).json({
      ok: false,
      ...getModelMeta(),
      message: error instanceof Error ? error.message : getServerMessage(locale, 'loadModelFailed'),
    });
  }
});

app.post('/api/infer', async (req, res) => {
  const locale = normalizeServerLocale(req.body?.locale);
  try {
    const prompt = String(req.body?.prompt || '').slice(0, 800);
    if (!prompt.trim()) {
      return res.status(400).json({ ok: false, model: getModelMeta(), message: getServerMessage(locale, 'emptyPrompt') });
    }
    const maxNewTokens = Math.max(1, Math.min(Number(req.body?.maxNewTokens || process.env.MAX_NEW_TOKENS || 2), 6));
    const topK = Math.max(3, Math.min(Number(req.body?.topK || process.env.TOP_K || 8), 20));
    const topP = Math.min(1, Math.max(0.1, Number(req.body?.topP || 0.9)));
    const temperature = Math.min(2, Math.max(0.2, Number(req.body?.temperature || 1)));
    const seed = Math.max(1, Math.min(Number(req.body?.seed || 1234), 999999));
    const decodingStrategy = ['greedy', 'top-k', 'top-p'].includes(req.body?.decodingStrategy) ? req.body.decodingStrategy : 'greedy';

    const { tokenizer, model } = await getModelState();
    const trace = await buildTrace({ tokenizer, model, prompt, maxNewTokens, topK, topP, temperature, decodingStrategy, locale, seed });

    res.json({ ok: true, model: getModelMeta(), trace });
  } catch (error) {
    console.error('infer error:', error);
    res.status(500).json({
      ok: false,
      model: getModelMeta(),
      message: error instanceof Error ? error.message : getServerMessage(locale, 'inferFailed'),
    });
  }
});

app.listen(port, () => {
  console.log(`attention-is-all-you-need-js backend em http://localhost:${port}`);
});
