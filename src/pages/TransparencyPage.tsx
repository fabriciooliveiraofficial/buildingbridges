import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FundFlowChart } from '../components/FundFlowChart';
import { SEO } from '../components/SEO';

export const TransparencyPage: React.FC = () => {
  const { t } = useTranslation();
  const handleDownload = () => {
    alert('Downloading 2023 Annual Report... (Simulated)');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-10 lg:px-40 py-10">
      <SEO titleKey="transparency" descriptionKey="transparency" />
      <nav className="flex items-center gap-2 mb-8 text-sm font-medium text-slate-500 dark:text-slate-400">
        <Link className="hover:text-primary" to="/">{t('nav.home')}</Link>
        <span className="material-symbols-outlined text-xs">chevron_right</span>
        <span className="text-slate-900 dark:text-slate-200">{t('nav.transparency')}</span>
      </nav>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-slate-100 tracking-tight mb-4">{t('transparency.title')}</h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">{t('transparency.subtitle')}</p>
        </div>
        <button 
          onClick={handleDownload}
          className="flex items-center gap-2 px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-200 font-bold rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-200 transition-colors"
        >
          <span className="material-symbols-outlined">download</span>
          <span>{t('transparency.download')}</span>
        </button>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        <div className="bg-white dark:bg-slate-800/50 p-8 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-xs">{t('transparency.raised')}</p>
            <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-full">trending_up</span>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-4xl font-extrabold text-slate-900 dark:text-white">$12.4M</p>
            <p className="text-green-600 font-bold text-sm">+15.2%</p>
          </div>
          <p className="text-xs text-slate-400 mt-2">Fiscal Year 2023-24</p>
        </div>
        <div className="bg-white dark:bg-slate-800/50 p-8 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-xs">{t('transparency.deployed')}</p>
            <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-full">volunteer_activism</span>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-4xl font-extrabold text-slate-900 dark:text-white">$11.8M</p>
            <p className="text-green-600 font-bold text-sm">+12.4%</p>
          </div>
          <p className="text-xs text-slate-400 mt-2">To Registered Partners & Cities</p>
        </div>
        <div className="bg-primary text-white p-8 rounded-xl border border-primary shadow-lg shadow-primary/20">
          <div className="flex items-center justify-between mb-4">
            <p className="text-white/80 font-bold uppercase tracking-wider text-xs">{t('transparency.overhead')}</p>
            <span className="material-symbols-outlined text-white bg-white/20 p-2 rounded-full">verified_user</span>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-4xl font-extrabold">5%</p>
            <p className="text-white font-bold text-sm">-1.1%</p>
          </div>
          <p className="text-xs text-white/70 mt-2">{t('transparency.overheadDesc')}</p>
        </div>
      </section>

      <section className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm mb-16">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{t('transparency.flowTitle')}</h2>
            <p className="text-slate-500">{t('transparency.flowSubtitle')}</p>
          </div>
        </div>
        <div className="w-full bg-slate-50 rounded-lg p-0 sm:p-6 relative group">
          <FundFlowChart />
        </div>
      </section>
    </div>
  );
};
