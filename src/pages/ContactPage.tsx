import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SEO } from '../components/SEO';

export const ContactPage: React.FC = () => {
  const { t } = useTranslation();
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 text-center">
        <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-8">
          <span className="material-symbols-outlined text-4xl text-orange-500">send</span>
        </div>
        <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-4">{t('contact.successTitle')}</h1>
        <p className="text-slate-600 dark:text-slate-400 text-lg mb-10">
          {t('contact.successDesc')}
        </p>
        <button onClick={() => setSubmitted(false)} className="bg-primary text-white px-8 py-3 rounded-full font-bold shadow-lg hover:opacity-90 transition-opacity">
          {t('contact.sendAnother')}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-20">
      <SEO titleKey="contact" descriptionKey="contact" />
      <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-8">{t('contact.title')}</h1>
      <p className="text-slate-600 dark:text-slate-400 text-lg mb-12">
        {t('contact.subtitle')}
      </p>
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{t('contact.nameLabel')}</label>
            <input required className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-bold" type="text" placeholder={t('contact.namePlaceholder')} />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{t('contact.emailLabel')}</label>
            <input required className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-bold" type="email" placeholder={t('contact.emailPlaceholder')} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{t('contact.subjectLabel')}</label>
          <input required className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-bold" type="text" placeholder={t('contact.subjectPlaceholder')} />
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{t('contact.messageLabel')}</label>
          <textarea required rows={6} className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none resize-none font-bold" placeholder={t('contact.messagePlaceholder')}></textarea>
        </div>
        <button type="submit" className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg shadow-xl hover:opacity-90 transition-opacity">
          {t('contact.submitBtn')}
        </button>
      </form>
    </div>
  );
};
