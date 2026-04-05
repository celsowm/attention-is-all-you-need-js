import { AutoModelForCausalLM, AutoTokenizer, env } from '@huggingface/transformers';

env.allowLocalModels = false;

env.useFS = true;

const MODEL_ID = process.env.MODEL_ID || 'Xenova/gpt2';

let state = {
  modelId: MODEL_ID,
  tokenizer: null,
  model: null,
  loadingPromise: null,
  error: null,
  loadedAt: null,
};

export async function getModelState() {
  if (state.model && state.tokenizer) return state;
  if (state.loadingPromise) {
    await state.loadingPromise;
    return state;
  }

  state.loadingPromise = (async () => {
    try {
      const tokenizer = await AutoTokenizer.from_pretrained(state.modelId);
      const model = await AutoModelForCausalLM.from_pretrained(state.modelId, {
        dtype: 'q8',
        device: 'cpu',
      });

      state = {
        ...state,
        tokenizer,
        model,
        error: null,
        loadedAt: new Date().toISOString(),
      };
    } catch (error) {
      state = {
        ...state,
        tokenizer: null,
        model: null,
        error: error instanceof Error ? error.message : String(error),
      };
      throw error;
    } finally {
      state.loadingPromise = null;
    }
  })();

  await state.loadingPromise;
  return state;
}

export function getModelMeta() {
  return {
    modelId: state.modelId,
    loaded: Boolean(state.model && state.tokenizer),
    loadedAt: state.loadedAt,
    error: state.error,
  };
}
