import React from 'react';
import { useTranslation } from 'react-i18next';

export const PrivacyPage: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="max-w-4xl mx-auto px-6 py-20">
      <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-8">{t('footer.privacy')}</h1>
      <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-400 space-y-6">
        <p>Your privacy is important to us. This Privacy Policy explains how Building Bridges collects, uses, and protects your personal information when you use our website and services.</p>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-8">1. Information We Collect</h2>
        <p>We collect information you provide directly to us, such as when you make a donation, sign up for our newsletter, or contact us for support.</p>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-8">2. How We Use Your Information</h2>
        <p>We use the information we collect to process donations, provide transparency reports, and communicate with you about our impact and missions.</p>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-8">3. Data Security</h2>
        <p>We implement a variety of security measures to maintain the safety of your personal information. All sensitive/credit information is transmitted via Secure Socket Layer (SSL) technology.</p>
      </div>
    </div>
  );
};
