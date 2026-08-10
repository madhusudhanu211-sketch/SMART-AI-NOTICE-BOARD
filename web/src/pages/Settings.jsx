import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { Settings as SettingsIcon, Sun, Moon, Globe, Check, Bell } from 'lucide-react';

export default function Settings() {
  const { theme, toggleTheme } = useTheme();
  const { language, changeLanguage, t, supportedLanguages } = useLanguage();

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          <span>{t('settings.title', 'Portal Settings & Preferences')}</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {t('settings.sub', 'Customize application theme, language, notifications, and security')}
        </p>
      </div>

      {/* Language Settings Card */}
      <div className="glass-card p-6 space-y-4 border-indigo-500/30">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              🌐 {t('settings.displayLangTitle', 'Display Language')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t('settings.displayLangSub', 'Select interface and voice assistant language')}
            </p>
          </div>
        </div>

        <p className="text-[11px] text-slate-400 italic">
          {t('settings.langSelectNote', 'Default language for new users is English. Only your selection will change the language.')}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {supportedLanguages.map((l) => {
            const isSelected = language === l.code;
            return (
              <button
                key={l.code}
                type="button"
                onClick={() => changeLanguage(l.code)}
                className={`p-4 rounded-2xl border text-xs font-bold transition-all text-left flex items-center justify-between shadow-sm ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 ring-2 ring-indigo-500/50 shadow-indigo-600/30 scale-102'
                    : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-indigo-500/40'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">{l.label}</span>
                </div>
                {isSelected && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-black">
                    <Check className="w-3.5 h-3.5" />
                    <span>Selected</span>
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Theme Settings Card */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-500">
            {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {t('settings.themeTitle', 'Appearance Theme')}
            </h3>
            <p className="text-xs text-slate-500">
              {t('settings.themeSub', 'Switch between light and dark visual modes')}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {t('settings.currentTheme', 'Current Theme')}: {theme.toUpperCase()}
          </span>
          <button
            onClick={toggleTheme}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow"
          >
            {t('settings.switchTo', 'Switch to')} {theme === 'light' ? 'Dark' : 'Light'} {t('settings.mode', 'Mode')}
          </button>
        </div>
      </div>

      {/* Privacy & Notifications */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Notification Preferences</h3>
            <p className="text-xs text-slate-500">Manage email, push, and emergency broadcast alerts</p>
          </div>
        </div>

        <div className="space-y-3 text-xs pt-2">
          <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
            <span>Emergency Broadcast Alerts</span>
            <input type="checkbox" defaultChecked className="rounded text-indigo-600" />
          </label>
          <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
            <span>Assignment & Exam Due Reminders</span>
            <input type="checkbox" defaultChecked className="rounded text-indigo-600" />
          </label>
        </div>
      </div>
    </div>
  );
}
