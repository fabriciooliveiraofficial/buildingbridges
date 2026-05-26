import React from 'react';
import { useTranslation } from 'react-i18next';

export const TermsPage: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="max-w-4xl mx-auto px-6 py-20">
      <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-8">{t('footer.terms')}</h1>
      <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-400 space-y-6">
        <p>By using the Building Bridges website, you agree to comply with and be bound by the following terms and conditions of use.</p>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-8">1. Acceptance of Terms</h2>
        <p>The services that Building Bridges provides to you are subject to the following Terms of Use. Building Bridges reserves the right to update the Terms of Use at any time without notice to you.</p>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-8">2. Use of Services</h2>
        <p>You agree to use the services only for purposes that are permitted by these Terms of Use and any applicable law, regulation, or generally accepted practices or guidelines in the relevant jurisdictions.</p>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-8">3. Donations</h2>
        <p>All donations made through our platform are final and non-refundable, except in cases of unauthorized use of your credit card or other payment methods.</p>
      </div>
    </div>
  );
};
