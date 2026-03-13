import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from './UI';
import { Languages } from 'lucide-react';

export const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-2">
      <Languages className="w-4 h-4 text-slate-400" />
      <div className="flex bg-slate-100 p-1 rounded-xl">
        {(['en', 'hi', 'mr'] as const).map((lang) => (
          <button
            key={lang}
            onClick={() => setLanguage(lang)}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
              language === lang
                ? 'bg-white text-emerald-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {lang === 'en' ? 'EN' : lang === 'hi' ? 'हिं' : 'मरा'}
          </button>
        ))}
      </div>
    </div>
  );
};
