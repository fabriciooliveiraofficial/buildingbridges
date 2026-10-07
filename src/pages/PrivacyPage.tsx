import React from 'react';
import { useTranslation } from 'react-i18next';
import { SEO } from '../components/SEO';

export const PrivacyPage: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="max-w-4xl mx-auto px-6 py-20">
      <SEO titleKey="privacy" descriptionKey="privacy" />
      <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-8">{t('privacy.title')}</h1>
      <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-400 space-y-6">
        <p>{t('privacy.p1')}</p>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-8">{t('privacy.h1')}</h2>
        <p>{t('privacy.p2')}</p>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-8">{t('privacy.h2')}</h2>
        <p>{t('privacy.p3')}</p>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-8">{t('privacy.h3')}</h2>
        <p>{t('privacy.p4')}</p>
      </div>
    </div>
  );
};
