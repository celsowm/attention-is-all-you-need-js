
import { useEffect, useMemo, useRef, useState } from 'react';
import { inferTrace, loadModel } from '../lib/api';

const EMPTY_TRACE = {
  prompt: '',
  tokens: [],
  ids: [],
  nextToken: '',
  finalText: '',
  metrics: { totalMs: 0, averageStepMs: 0, seed: 1234 },
  generationSteps: [],
  decoding: { strategy: 'greedy', topK: 8, topP: 0.9, temperature: 1, seed: 1234 },
  steps: [{ id: 'prompt', payload: { prompt: '', length: 0 } }],
};

export function useInferenceTrace(initialPrompt = 'We the people') {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [maxNewTokens, setMaxNewTokens] = useState(2);
  const [topK, setTopK] = useState(8);
  const [topP, setTopP] = useState(0.9);
  const [temperature, setTemperature] = useState(1);
  const [seed, setSeed] = useState(1234);
  const [decodingStrategy, setDecodingStrategy] = useState('greedy');
  const [activeStep, setActiveStep] = useState(0);
  const [trace, setTrace] = useState(EMPTY_TRACE);
  const [model, setModel] = useState({ loaded: false, modelId: 'Xenova/gpt2', loadedAt: null });
  const [loadingModel, setLoadingModel] = useState(false);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');
  const requestRef = useRef(null);

  const currentStep = useMemo(() => trace.steps?.[activeStep] ?? trace.steps?.[0] ?? null, [trace, activeStep]);

  const ensureModelLoaded = async (locale = 'en') => {
    setLoadingModel(true);
    setError('');
    try {
      const data = await loadModel({ locale });
      setModel(data);
    } catch (err) {
      setError(err.message || String(err));
      throw err;
    } finally {
      setLoadingModel(false);
    }
  };

  const runInference = async (locale = 'en') => {
    requestRef.current?.abort?.();
    const controller = new AbortController();
    requestRef.current = controller;

    setRunning(true);
    setError('');
    try {
      const data = await inferTrace({ prompt, maxNewTokens, topK, topP, temperature, seed, decodingStrategy }, { signal: controller.signal, locale });
      setTrace(data.trace);
      setModel(data.model);
      setActiveStep(0);
    } catch (err) {
      if (controller.signal.aborted) return;
      setError(err.message || String(err));
    } finally {
      if (requestRef.current === controller) requestRef.current = null;
      setRunning(false);
    }
  };

  useEffect(() => {
    ensureModelLoaded().catch(() => {});
    return () => requestRef.current?.abort?.();
  }, []);

  const goNext = () => setActiveStep((current) => Math.min(current + 1, Math.max((trace.steps?.length || 1) - 1, 0)));
  const goBack = () => setActiveStep((current) => Math.max(current - 1, 0));
  const reset = () => setActiveStep(0);

  return {
    prompt, setPrompt, maxNewTokens, setMaxNewTokens, topK, setTopK, topP, setTopP, temperature, setTemperature, seed, setSeed,
    decodingStrategy, setDecodingStrategy, activeStep, setActiveStep, trace, currentStep, model, loadingModel, running, error,
    goNext, goBack, reset, ensureModelLoaded, runInference,
  };
}
