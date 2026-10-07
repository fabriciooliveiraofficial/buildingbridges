import React from 'react';
import { useTranslation } from 'react-i18next';
import { SEO } from '../components/SEO';

export const TermsPage: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="max-w-4xl mx-auto px-6 py-20">
      <SEO titleKey="terms" descriptionKey="terms" />
      <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-8">{t('terms.title')}</h1>
      <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-400 space-y-6">
        <p>{t('terms.p1')}</p>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-8">{t('terms.h1')}</h2>
        <p>{t('terms.p2')}</p>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-8">{t('terms.h2')}</h2>
        <p>{t('terms.p3')}</p>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-8">{t('terms.h3')}</h2>
        <p>{t('terms.p4')}</p>
      </div>
    </div>
  );
};
