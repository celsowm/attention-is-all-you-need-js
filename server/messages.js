
export const SUPPORTED_SERVER_LOCALES = ['pt-BR', 'en', 'es', 'fr', 'de'];

const messages = {
  en: {
    networkAbort: 'The request was canceled.',
    networkFailure: 'Network failure while talking to the backend.',
    unexpectedResponse: 'Unexpected response',
    inferFailed: 'Inference failed.',
    loadModelFailed: 'Failed to load the model.',
    invalidLogits: 'Unexpected logits format',
    invalidBatch: 'This demo expects batch=1',
    emptyPrompt: 'Please provide a prompt.',
  },
  'pt-BR': {
    networkAbort: 'A requisição foi cancelada.',
    networkFailure: 'Falha de rede ao falar com o backend.',
    unexpectedResponse: 'Resposta inesperada',
    inferFailed: 'Falha ao gerar a inferência.',
    loadModelFailed: 'Falha ao carregar o modelo.',
    invalidLogits: 'Formato inesperado para logits',
    invalidBatch: 'Este demo espera batch=1',
    emptyPrompt: 'Forneça um prompt.',
  },
  es: {
    networkAbort: 'La solicitud fue cancelada.',
    networkFailure: 'Fallo de red al comunicarse con el backend.',
    unexpectedResponse: 'Respuesta inesperada',
    inferFailed: 'No se pudo generar la inferencia.',
    loadModelFailed: 'No se pudo cargar el modelo.',
    invalidLogits: 'Formato inesperado para logits',
    invalidBatch: 'Este demo espera batch=1',
    emptyPrompt: 'Proporciona un prompt.',
  },
  fr: {
    networkAbort: 'La requête a été annulée.',
    networkFailure: 'Échec réseau lors de la communication avec le backend.',
    unexpectedResponse: 'Réponse inattendue',
    inferFailed: "Échec de l'inférence.",
    loadModelFailed: 'Impossible de charger le modèle.',
    invalidLogits: 'Format inattendu pour les logits',
    invalidBatch: 'Cette démo attend batch=1',
    emptyPrompt: 'Veuillez fournir un prompt.',
  },
  de: {
    networkAbort: 'Die Anfrage wurde abgebrochen.',
    networkFailure: 'Netzwerkfehler bei der Kommunikation mit dem Backend.',
    unexpectedResponse: 'Unerwartete Antwort',
    inferFailed: 'Die Inferenz konnte nicht erzeugt werden.',
    loadModelFailed: 'Das Modell konnte nicht geladen werden.',
    invalidLogits: 'Unerwartetes Logit-Format',
    invalidBatch: 'Diese Demo erwartet batch=1',
    emptyPrompt: 'Bitte gib einen Prompt ein.',
  },
};

export function normalizeServerLocale(locale) {
  if (!locale) return 'en';
  const lower = String(locale).toLowerCase();
  if (lower.startsWith('pt')) return 'pt-BR';
  if (lower.startsWith('es')) return 'es';
  if (lower.startsWith('fr')) return 'fr';
  if (lower.startsWith('de')) return 'de';
  return 'en';
}

export function getServerMessage(locale, key) {
  const normalized = normalizeServerLocale(locale);
  return messages[normalized]?.[key] ?? messages.en[key] ?? key;
}
