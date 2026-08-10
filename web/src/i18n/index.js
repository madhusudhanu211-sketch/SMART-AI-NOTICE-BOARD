import en from './en';
import te from './te';
import hi from './hi';
import ta from './ta';

export const dictionaries = {
  en,
  te,
  hi,
  ta,
};

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English (Default)', speechCode: 'en-IN' },
  { code: 'te', label: 'తెలుగు (Telugu)', speechCode: 'te-IN' },
  { code: 'hi', label: 'हिन्दी (Hindi)', speechCode: 'hi-IN' },
  { code: 'ta', label: 'தமிழ் (Tamil)', speechCode: 'ta-IN' },
];

export function getNestedTranslation(obj, path) {
  return path.split('.').reduce((prev, curr) => (prev && prev[curr] !== undefined ? prev[curr] : null), obj);
}

export function translateKey(langCode, keyPath, fallback = '') {
  const dict = dictionaries[langCode] || dictionaries['en'];
  const res = getNestedTranslation(dict, keyPath);
  if (res !== null && res !== undefined) return res;

  // Fallback to English if not found in target language
  const enRes = getNestedTranslation(dictionaries['en'], keyPath);
  return enRes !== null && enRes !== undefined ? enRes : fallback || keyPath;
}
