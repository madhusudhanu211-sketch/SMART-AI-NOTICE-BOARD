import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { Settings as SettingsIcon, Sun, Moon, Globe, Check, Bell, Shield, Smartphone, Save, CheckCircle2 } from 'lucide-react';

export default function Settings() {
  const { theme, toggleTheme } = useTheme();
  const { language, changeLanguage, t, supportedLanguages } = useLanguage();

  const [notifPrefs, setNotifPrefs] = useState({
    emergencyAlerts: true,
    assignmentReminders: true,
    examSchedule: true,
    placementDrives: true,
    newNotice: false,
    eventRegistrations: true,
  });

  const [saveStatus, setSaveStatus] = useState('');
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);

  const handleSavePrefs = () => {
    setSaveStatus('success');
    setTimeout(() => setSaveStatus(''), 3000);
  };

  const togglePref = (key) => {
    setNotifPrefs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const notifSettings = [
    { key: 'emergencyAlerts', label: 'Emergency Broadcast Alerts', desc: 'Campus closures, weather alerts, urgent notices' },
    { key: 'assignmentReminders', label: 'Assignment Due Reminders', desc: '24 hours before submission deadline' },
    { key: 'examSchedule', label: 'Exam Schedule Alerts', desc: 'When new exam dates or hall tickets are released' },
    { key: 'placementDrives', label: 'Placement Drive Notifications', desc: 'New company drives and application deadlines' },
    { key: 'newNotice', label: 'New Notice Published', desc: 'Notify for every new notice on the board' },
    { key: 'eventRegistrations', label: 'Event Registration Open', desc: 'When campus events open for registration' },
  ];

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

        <div className="flex items-center gap-3 flex-wrap">
          {['light', 'dark'].map(mode => (
            <button
              key={mode}
              onClick={() => { if (theme !== mode) toggleTheme(); }}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl border text-xs font-bold transition-all ${
                theme === mode
                  ? 'bg-indigo-600 text-white border-indigo-600 ring-2 ring-indigo-500/30 shadow-lg shadow-indigo-600/20'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
              }`}
            >
              {mode === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              {mode.charAt(0).toUpperCase() + mode.slice(1)} Mode
              {theme === mode && <Check className="w-3.5 h-3.5" />}
            </button>
          ))}
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Notification Preferences</h3>
            <p className="text-xs text-slate-500">Manage alerts for notices, exams, assignments &amp; placements</p>
          </div>
        </div>

        <div className="space-y-3 pt-1">
          {notifSettings.map(setting => (
            <div key={setting.key} className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">{setting.label}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{setting.desc}</p>
              </div>
              <button
                onClick={() => togglePref(setting.key)}
                className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${notifPrefs[setting.key] ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}
              >
                <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${notifPrefs[setting.key] ? 'translate-x-5' : ''}`} />
              </button>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleSavePrefs}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-xl shadow-emerald-600/30 flex items-center gap-2 transition-all"
          >
            <Save className="w-4 h-4" />
            Save Preferences
          </button>
          {saveStatus === 'success' && (
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-bold animate-in fade-in">
              <CheckCircle2 className="w-4 h-4" />
              Preferences saved!
            </span>
          )}
        </div>
      </div>

      {/* Security */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-rose-500/10 text-rose-600">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Security &amp; Privacy</h3>
            <p className="text-xs text-slate-500">Account security, two-factor authentication &amp; session management</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-slate-400" />
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Two-Factor Authentication</p>
                <p className="text-[11px] text-slate-500">Add an extra layer of account security</p>
              </div>
            </div>
            <button
              onClick={() => setTwoFAEnabled(prev => !prev)}
              className={`relative w-11 h-6 rounded-full transition-colors ${twoFAEnabled ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}
            >
              <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${twoFAEnabled ? 'translate-x-5' : ''}`} />
            </button>
          </div>

          <button className="w-full text-left px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:border-indigo-400 transition-colors flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Change Account Password
          </button>
        </div>
      </div>
    </div>
  );
}
