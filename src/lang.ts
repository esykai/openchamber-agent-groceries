// The UI language is a per-device preference. Every surface reads it through
// this module; changing it reloads the page so the card can be rebuilt.
export type Lang = 'ru' | 'en';

let current: Lang = 'ru';

export const isLang = (value: unknown): value is Lang => value === 'ru' || value === 'en';

export const setLang = (lang: Lang): void => {
  current = lang;
};

export const getLang = (): Lang => current;

export const localeFor = (lang: Lang): string => (lang === 'en' ? 'en-US' : 'ru-RU');
