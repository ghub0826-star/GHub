import id from './locales/id';
import en from './locales/en';
import ms from './locales/ms';
import th from './locales/th';
import vi from './locales/vi';
import ja from './locales/ja';
import zh from './locales/zh';

export const locales = { id, en, ms, th, vi, ja, zh };

export const LANGUAGE_NAMES = {
  id: 'Bahasa Indonesia',
  en: 'English',
  ms: 'Bahasa Melayu',
  th: 'ไทย',
  vi: 'Tiếng Việt',
  ja: '日本語',
  zh: '简体中文',
};

const DEFAULT_LANG = 'id';

// Deep merge fallback to id
function merge(base, override) {
  const out = { ...base };
  for (const key of Object.keys(override || {})) {
    const bv = base[key];
    const ov = override[key];
    if (bv && typeof bv === 'object' && ov && typeof ov === 'object') {
      out[key] = merge(bv, ov);
    } else {
      out[key] = ov !== undefined ? ov : bv;
    }
  }
  return out;
}

export function getTranslations(lang) {
  const base = locales[DEFAULT_LANG] || en;
  const l = locales[lang];
  if (!l || lang === DEFAULT_LANG) return base;
  return merge(base, l);
}

export function detectLanguage() {
  const stored = localStorage.getItem('ghub_lang');
  if (stored && locales[stored]) return stored;
  const nav = (navigator.language || 'id').toLowerCase().split('-')[0];
  if (locales[nav]) return nav;
  return DEFAULT_LANG;
}

export function setLanguage(lang) {
  if (locales[lang]) {
    localStorage.setItem('ghub_lang', lang);
    window.dispatchEvent(new Event('ghub_lang_changed'));
  }
}

export default { locales, getTranslations, detectLanguage, setLanguage, LANGUAGE_NAMES };
