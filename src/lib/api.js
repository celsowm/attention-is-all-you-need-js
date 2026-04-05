
const DEFAULT_LOCALE = 'en';

const CLIENT_MESSAGES = {
  en: {
    requestCanceled: 'The request was canceled.',
    networkFailure: 'Network failure while talking to the backend.',
    unexpectedResponse: 'Unexpected response',
  },
  'pt-BR': {
    requestCanceled: 'A requisição foi cancelada.',
    networkFailure: 'Falha de rede ao falar com o backend.',
    unexpectedResponse: 'Resposta inesperada',
  },
  es: {
    requestCanceled: 'La solicitud fue cancelada.',
    networkFailure: 'Fallo de red al comunicarse con el backend.',
    unexpectedResponse: 'Respuesta inesperada',
  },
  fr: {
    requestCanceled: 'La requête a été annulée.',
    networkFailure: 'Échec réseau lors de la communication avec le backend.',
    unexpectedResponse: 'Réponse inattendue',
  },
  de: {
    requestCanceled: 'Die Anfrage wurde abgebrochen.',
    networkFailure: 'Netzwerkfehler bei der Kommunikation mit dem Backend.',
    unexpectedResponse: 'Unerwartete Antwort',
  },
};

function normalizeLocale(locale) {
  const value = String(locale || '').toLowerCase();
  if (value.startsWith('pt')) return 'pt-BR';
  if (value.startsWith('es')) return 'es';
  if (value.startsWith('fr')) return 'fr';
  if (value.startsWith('de')) return 'de';
  return 'en';
}

function getMessage(locale, key) {
  const normalized = normalizeLocale(locale);
  return CLIENT_MESSAGES[normalized]?.[key] ?? CLIENT_MESSAGES.en[key];
}

async function parseResponse(response, locale) {
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) return response.json();
  const text = await response.text();
  return { ok: false, message: text || `${getMessage(locale, 'unexpectedResponse')} (${response.status})` };
}

export async function postJson(url, body, { signal, locale = DEFAULT_LOCALE } = {}) {
  let response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...body, locale }),
      signal,
    });
  } catch (error) {
    if (error?.name === 'AbortError') throw new Error(getMessage(locale, 'requestCanceled'));
    throw new Error(getMessage(locale, 'networkFailure'));
  }

  const data = await parseResponse(response, locale);
  if (!response.ok || data.ok === false) throw new Error(data.message || `Error in ${url}`);
  return data;
}

export async function loadModel(options) {
  return postJson('/api/load-model', {}, options);
}

export async function inferTrace(payload, options) {
  return postJson('/api/infer', payload, options);
}
