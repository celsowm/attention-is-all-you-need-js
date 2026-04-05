import { SUPPORTED_LOCALES } from './translations';

const LANGUAGE_NAMES = {
  'pt-BR': 'lang.pt-BR',
  en: 'lang.en',
  es: 'lang.es',
  fr: 'lang.fr',
  de: 'lang.de',
};

const LANGUAGE_RULES = {
  'pt-BR': { words: [' que ', ' não ', ' você ', ' uma ', ' para ', ' com ', ' de ', ' do ', ' da '], chars: /[ãõçáéíóúâêô]/i },
  es: { words: [' que ', ' una ', ' para ', ' con ', ' los ', ' las ', ' por ', ' en '], chars: /[ñáéíóú¡¿]/i },
  fr: { words: [' le ', ' la ', ' les ', ' avec ', ' pour ', ' une ', ' des ', ' dans '], chars: /[àâçéèêëîïôûùüÿœ]/i },
  de: { words: [' der ', ' die ', ' das ', ' und ', ' mit ', ' für ', ' ist ', ' nicht ', ' ein '], chars: /[äöüß]/i },
  en: { words: [' the ', ' and ', ' with ', ' you ', ' what ', ' how ', ' for ', ' is ', ' are '], chars: /[a-z]/i },
};

function normalizeLocale(locale) {
  if (!locale) return 'en';
  const lower = String(locale).toLowerCase();
  if (lower.startsWith('pt')) return 'pt-BR';
  if (lower.startsWith('es')) return 'es';
  if (lower.startsWith('fr')) return 'fr';
  if (lower.startsWith('de')) return 'de';
  return 'en';
}

export function detectBrowserLocale() {
  const candidates = [...(globalThis?.navigator?.languages ?? []), globalThis?.navigator?.language].filter(Boolean);
  for (const candidate of candidates) {
    const normalized = normalizeLocale(candidate);
    if (SUPPORTED_LOCALES.includes(normalized)) return normalized;
  }
  return 'en';
}

export function detectPromptLocale(prompt) {
  const text = ` ${String(prompt || '').trim().toLowerCase()} `;
  if (!text.trim()) return null;

  const scores = Object.entries(LANGUAGE_RULES)
    .map(([locale, rule]) => {
      let score = 0;
      if (rule.chars.test(text)) score += 2;
      for (const word of rule.words) {
        if (text.includes(word)) score += 1;
      }
      return { locale, score };
    })
    .sort((a, b) => b.score - a.score);

  if (!scores.length || scores[0].score === 0) return null;
  if (scores[0].score === scores[1]?.score) return null;
  return scores[0].locale;
}

export function getLanguageNameKey(locale) {
  return LANGUAGE_NAMES[locale] ?? 'lang.unknown';
}
