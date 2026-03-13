import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { Card, Button } from '../components/UI';
import { Settings as SettingsIcon, Moon, Sun, Monitor, Globe } from 'lucide-react';
import { motion } from 'motion/react';

export const Settings = () => {
  const { t, language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();

  const themes = [
    { id: 'light', label: 'Light', icon: Sun },
    { id: 'dark', label: 'Dark', icon: Moon },
    { id: 'system', label: 'System', icon: Monitor },
  ] as const;

  const languages = [
    { id: 'en', label: 'English' },
    { id: 'hi', label: 'हिंदी (Hindi)' },
    { id: 'mr', label: 'मराठी (Marathi)' },
  ] as const;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <header>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">{t('settings')}</h1>
        <p className="text-slate-500 font-medium">Manage your SehatSetu preferences and application appearance.</p>
      </header>

      <div className="grid gap-6">
        {/* Appearance Settings */}
        <Card className="p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
              <Sun className="w-5 h-5 text-slate-700" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Appearance</h2>
              <p className="text-sm text-slate-500">Customize how SehatSetu looks on your device.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {themes.map((tOp) => {
              const Icon = tOp.icon;
              const isActive = theme === tOp.id;
              
              return (
                <button
                  key={tOp.id}
                  onClick={() => setTheme(tOp.id)}
                  className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                    isActive 
                      ? 'border-emerald-500 bg-emerald-50/50' 
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2 rounded-lg ${isActive ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-600'}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${isActive ? 'border-emerald-500' : 'border-slate-300'}`}>
                      {isActive && <div className="w-2 h-2 rounded-full bg-emerald-500" />}
                    </div>
                  </div>
                  <span className={`font-semibold ${isActive ? 'text-emerald-900' : 'text-slate-700'}`}>
                    {tOp.label} Mode
                  </span>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Language Settings */}
        <Card className="p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Globe className="w-5 h-5 text-blue-700" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{t('language')}</h2>
              <p className="text-sm text-slate-500">Choose your preferred language for the application.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {languages.map((lang) => {
              const isActive = language === lang.id;
              
              return (
                <button
                  key={lang.id}
                  onClick={() => setLanguage(lang.id)}
                  className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                    isActive 
                      ? 'border-blue-500 bg-blue-50/50' 
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className={`font-semibold text-lg ${isActive ? 'text-blue-900' : 'text-slate-700'}`}>
                      {lang.label}
                    </span>
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${isActive ? 'border-blue-500' : 'border-slate-300'}`}>
                      {isActive && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
};
