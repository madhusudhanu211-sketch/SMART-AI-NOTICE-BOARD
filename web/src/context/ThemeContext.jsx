import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(localStorage.getItem('app_theme') || 'light');
  const [language, setLanguage] = useState(localStorage.getItem('app_language') || 'English');

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('app_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('app_language', lang);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, language, changeLanguage }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
