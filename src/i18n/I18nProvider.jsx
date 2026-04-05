import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { detectBrowserLocale, detectPromptLocale, getLanguageNameKey } from './localeDetection';
import { interpolate, translations } from './translations';

const I18nContext = createContext(null);
const STORAGE_KEY = 'attention-js.localePreference';

function getStoredLocalePreference() {
  const raw = globalThis?.localStorage?.getItem(STORAGE_KEY);
  return raw || 'auto';
}

export function I18nProvider({ prompt = '', children }) {
  const [localePreference, setLocalePreference] = useState(getStoredLocalePreference);
  const browserLocale = useMemo(() => detectBrowserLocale(), []);
  const promptLocale = useMemo(() => detectPromptLocale(prompt), [prompt]);
  const locale = localePreference === 'auto' ? (promptLocale || browserLocale) : localePreference;

  useEffect(() => {
    globalThis?.localStorage?.setItem(STORAGE_KEY, localePreference);
  }, [localePreference]);

  const value = useMemo(() => {
    const dictionary = translations[locale] ?? translations.en;
    const fallback = translations.en;

    const t = (key, params) => {
      const template = dictionary[key] ?? fallback[key] ?? key;
      return interpolate(template, params);
    };

    return {
      locale,
      localePreference,
      setLocalePreference,
      browserLocale,
      promptLocale,
      getLanguageLabel: (value) => t(getLanguageNameKey(value)),
      t,
    };
  }, [locale, localePreference, browserLocale, promptLocale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useI18n must be used within I18nProvider');
  return context;
}
