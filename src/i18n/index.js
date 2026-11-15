import { STRINGS } from './strings';

export const LANGUAGES = {
  en: { name: 'English', speech: 'en-US', recognition: 'en-US' },
  fil: { name: 'Filipino', speech: 'fil-PH', recognition: 'fil-PH' },
};

let language = 'en';

export const setLanguage = (lang) => {
  language = STRINGS[lang] ? lang : 'en';
};
export const getLanguage = () => language;
export const speechLocale = () => LANGUAGES[language].speech;
export const recognitionLocale = () => LANGUAGES[language].recognition;

/** True if a string exists (in the current language or English), without warning. */
export const has = (key) => key in (STRINGS[language] ?? {}) || key in STRINGS.en;

/**
 * Looks up a string (or calls a string function with `args`) in the current
 * language, falling back to English if a translation is missing.
 */
export function t(key, ...args) {
  const value = STRINGS[language]?.[key] ?? STRINGS.en[key];
  if (value === undefined) {
    console.warn(`missing string: ${key}`);
    return key;
  }
  return typeof value === 'function' ? value(...args) : value;
}
