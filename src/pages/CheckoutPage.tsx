import React, { useState } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useCurrency } from '../contexts/CurrencyContext';

export const CheckoutPage: React.FC = () => {
  const { t } = useTranslation();
  const { currency } = useCurrency();
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'card'>(currency === 'BRL' ? 'pix' : 'card');
  const [isSuccess, setIsSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyPix = () => {
    navigator.clipboard.writeText('00020126580014br.gov.bcb.pix0136buildingbridges-pix-key-1234567895204000053039865802BR5925Building Bridges NGO6009Sao Paulo62070503***6304ABCD');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleComplete = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSuccess(true);
  };

  if (isSuccess) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-8">
          <span className="material-symbols-outlined text-4xl text-emerald-600">check_circle</span>
        </div>
        <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-4">Thank You!</h1>
        <p className="text-slate-600 dark:text-slate-400 text-lg mb-10 max-w-md mx-auto">
          Your donation has been processed successfully. You will receive a confirmation email and a transparency report shortly.
        </p>
        <Link to="/" className="inline-block bg-primary text-white px-10 py-4 rounded-full font-bold shadow-xl hover:opacity-90 transition-opacity">
          Return to Home
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-8 lg:py-12">
      <div className="mb-8 text-center">
        <nav className="flex justify-center items-center gap-2 text-sm text-slate-500 mb-4">
          <Link className="hover:text-primary" to="/">Donation</Link>
          <span className="material-symbols-outlined text-xs">chevron_right</span>
          <span className="font-semibold text-primary dark:text-slate-200">Checkout</span>
        </nav>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t('checkout.title')}</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">{t('checkout.subtitle')}</p>
      </div>

      <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-full flex mb-10 shadow-inner max-w-full sm:max-w-sm mx-auto">
        <button 
          onClick={() => setPaymentMethod('pix')}
          className={`flex-1 rounded-full py-2.5 px-4 text-sm font-bold shadow-sm flex items-center justify-center gap-2 transition-all ${paymentMethod === 'pix' ? 'bg-white dark:bg-slate-700 text-primary dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-primary'}`}
        >
          <span className="material-symbols-outlined text-lg">payments</span>
          {t('checkout.pix')}
        </button>
        <button 
          onClick={() => setPaymentMethod('card')}
          className={`flex-1 rounded-full py-2.5 px-4 text-sm font-bold shadow-sm flex items-center justify-center gap-2 transition-all ${paymentMethod === 'card' ? 'bg-white dark:bg-slate-700 text-primary dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-primary'}`}
        >
          <span className="material-symbols-outlined text-lg">credit_card</span>
          {t('checkout.card')}
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl overflow-hidden border border-slate-100 dark:border-slate-800">
        <div className="flex flex-col md:flex-row">
          {paymentMethod === 'pix' ? (
            <>
              <div className="p-6 sm:p-8 md:w-1/2 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800">
                <div className="bg-slate-50 dark:bg-slate-800 p-4 sm:p-6 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 w-full aspect-square flex items-center justify-center">
                  <img className="max-w-full max-h-full" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA1OAUgPo1cnEu5UpB2EvEPUgHAf_KvBldmaczv5xWJQdTeNbYc0fQ6OCaCkQ9OqO9U_pVHXZ8nDMytqpiMFgDQ95gJLCt8sJbkZUwWQHxCDcWclxuyTvGQrNvoxrw-QjMxyWVHbtUkmNNwWppQ_JPt9wooiLhpwjnOG3Mt9rdSLv_KgiC9S9HDqOjW8Kv0_nneOH1wOWigZW8meO8Mb_g-LOh93Ulg3v7zTjN6R0HCiOn5XC7PrschCM7EF5QvolFYhAZK1WOtRfE" referrerPolicy="no-referrer" />
                </div>
                <p className="mt-4 text-xs text-slate-400 font-medium uppercase tracking-wider">Expires in 29:59</p>
              </div>
              <div className="p-6 sm:p-8 md:w-1/2 flex flex-col justify-center">
                <h3 className="text-xl font-bold text-primary dark:text-white mb-4">{t('checkout.scan')}</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6">
                  {t('checkout.scanDesc')}
                </p>
                <button 
                  onClick={handleCopyPix}
                  className="w-full bg-primary text-white rounded-lg py-4 font-bold flex items-center justify-center gap-2 hover:opacity-95 transition-opacity mb-4 shadow-lg shadow-primary/20"
                >
                  <span className="material-symbols-outlined">{copied ? 'check' : 'content_copy'}</span>
                  {copied ? 'Copied!' : t('checkout.copy')}
                </button>
                <button 
                  onClick={() => setIsSuccess(true)}
                  className="w-full text-slate-500 dark:text-slate-400 text-sm font-bold hover:text-primary transition-colors mb-4"
                >
                  I've already paid
                </button>
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-sm font-medium bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-lg border border-emerald-100 dark:border-emerald-800">
                  <span className="material-symbols-outlined text-lg">verified_user</span>
                  {t('checkout.verified')}
                </div>
              </div>
            </>
          ) : (
            <div className="p-6 sm:p-8 w-full">
              <h3 className="text-xl font-bold text-primary dark:text-white mb-6">{t('checkout.cardInfo')}</h3>
              <form className="space-y-4" onSubmit={handleComplete}>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">{t('checkout.cardNumber')}</label>
                  <input required className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md focus:ring-2 focus:ring-primary outline-none text-slate-900 dark:text-white" placeholder="1234 5678 9101 1121" type="text"/>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">{t('checkout.expiry')}</label>
                    <input required className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md focus:ring-2 focus:ring-primary outline-none text-slate-900 dark:text-white" placeholder="MM / YY" type="text"/>
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">{t('checkout.cvc')}</label>
                    <input required className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md focus:ring-2 focus:ring-primary outline-none text-slate-900 dark:text-white" placeholder="123" type="text"/>
                  </div>
                </div>
                <button type="submit" className="w-full bg-primary text-white font-bold py-4 rounded-lg shadow-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                  {t('checkout.complete')}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 bg-primary/5 dark:bg-primary/20 rounded-xl p-6 border border-primary/10 flex items-start gap-4">
        <div className="bg-primary text-white p-2 rounded-lg">
          <span className="material-symbols-outlined">volunteer_activism</span>
        </div>
        <div>
          <h4 className="font-bold text-primary dark:text-blue-300">{t('checkout.impact')}</h4>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            <Trans i18nKey="checkout.impactDesc">
              Based on your selection, this donation will provide approximately <span className="font-bold text-primary dark:text-blue-200">50 nutritious meals</span> to families displaced by the Rio Grande do Sul floods.
            </Trans>
          </p>
        </div>
      </div>
    </main>
  );
};
