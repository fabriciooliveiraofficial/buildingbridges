import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';

const languages = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'pt', label: 'Português', flag: '🇧🇷' },
  { code: 'es', label: 'Español', flag: '🇲🇽' },
];

export const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const currentLanguage = languages.find(l => i18n.language.startsWith(l.code)) || languages[0];

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="absolute bottom-16 right-0 mb-2 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden min-w-[160px]"
          >
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold transition-colors hover:bg-slate-50 ${
                  currentLanguage.code === lang.code ? 'text-orange-500 bg-orange-50/50' : 'text-slate-700'
                }`}
              >
                <span className="text-xl leading-none">{lang.flag}</span>
                <span>{lang.label}</span>
                {currentLanguage.code === lang.code && (
                  <span className="material-symbols-outlined text-sm ml-auto">check</span>
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-full shadow-2xl border border-slate-200 flex items-center justify-center text-xl sm:text-2xl hover:border-orange-500 transition-colors group relative"
      >
        <span className="leading-none">{currentLanguage.flag}</span>
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center border-2 border-white">
          <span className="material-symbols-outlined text-[10px] text-white font-black">
            {isOpen ? 'close' : 'language'}
          </span>
        </div>
      </motion.button>
    </div>
  );
};
