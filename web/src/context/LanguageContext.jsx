import React, { createContext, useContext, useState, useEffect } from 'react';
import { translateKey, SUPPORTED_LANGUAGES } from '../i18n';
import api from '../services/api';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  // Read saved preference from localStorage under 'smartNoticeBoardLanguage', strictly fallback to 'en'
  const [language, setLanguageState] = useState(() => {
    const saved = localStorage.getItem('smartNoticeBoardLanguage');
    if (saved && ['en', 'te', 'hi', 'ta'].includes(saved)) {
      return saved;
    }
    // Also check legacy storage if present
    const legacy = localStorage.getItem('app_language');
    if (legacy === 'Telugu') return 'te';
    if (legacy === 'Hindi') return 'hi';
    if (legacy === 'Tamil') return 'ta';
    if (legacy === 'English') return 'en';
    return 'en'; // Strict Default: English
  });

  const activeLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  const changeLanguage = async (newLangCode) => {
    if (!['en', 'te', 'hi', 'ta'].includes(newLangCode)) return;
    setLanguageState(newLangCode);
    localStorage.setItem('smartNoticeBoardLanguage', newLangCode);
    localStorage.setItem('app_language', newLangCode === 'te' ? 'Telugu' : newLangCode === 'hi' ? 'Hindi' : newLangCode === 'ta' ? 'Tamil' : 'English');

    // Attempt to persist in backend if authenticated
    try {
      await api.put('/users/language', { language: newLangCode });
    } catch (e) {
      // Graceful fallback to localStorage
    }
  };

  const t = (keyPath, fallback = '') => {
    return translateKey(language, keyPath, fallback);
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        speechLangCode: activeLangObj.speechCode,
        supportedLanguages: SUPPORTED_LANGUAGES,
        changeLanguage,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
