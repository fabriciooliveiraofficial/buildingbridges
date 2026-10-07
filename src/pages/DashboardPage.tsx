import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { SEO } from '../components/SEO';

export const DashboardPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
      <SEO fallbackTitle={`${t('dashboard.dashboardTitle')} | Building Bridges`} noindex />
      <div className="lg:col-span-3 flex flex-col gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-6">{t('dashboard.navTitle')}</h3>
          <nav className="flex flex-col gap-2">
            <a className="flex items-center gap-3 px-4 py-3 rounded bg-primary/10 text-primary font-semibold" href="#">
              <span className="material-symbols-outlined">dashboard</span>
              <span>{t('dashboard.overview')}</span>
            </a>
            <a className="flex items-center gap-3 px-4 py-3 rounded text-slate-600 hover:bg-slate-50" href="#">
              <span className="material-symbols-outlined">receipt_long</span>
              <span>{t('dashboard.taxReceipts')}</span>
            </a>
            <a className="flex items-center gap-3 px-4 py-3 rounded text-slate-600 hover:bg-slate-50" href="#">
              <span className="material-symbols-outlined">analytics</span>
              <span>{t('dashboard.impactReports')}</span>
            </a>
          </nav>
        </div>
        <div className="bg-primary rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="relative z-10">
            <h4 className="font-bold text-lg mb-2">{t('dashboard.newReliefTitle')}</h4>
            <p className="text-sm text-slate-300 mb-4">{t('dashboard.newReliefDesc')}</p>
            <Link to="/checkout" className="block text-center w-full bg-white text-primary font-bold py-3 rounded hover:scale-105 transition-transform">
              {t('dashboard.donateNow')}
            </Link>
          </div>
          <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-[120px] opacity-20 rotate-12">water_damage</span>
        </div>
      </div>

      <div className="lg:col-span-9 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{t('dashboard.dashboardTitle')}</h1>
            <p className="text-slate-500 mt-1">{t('dashboard.dashboardSubtitle')}</p>
          </div>
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full flex items-center gap-1 text-sm font-medium">
            <span className="material-symbols-outlined text-sm">verified</span> {t('dashboard.verifiedBadge')}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between h-36">
            <div className="flex justify-between items-start">
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">{t('dashboard.totalDonated')}</p>
              <span className="material-symbols-outlined text-primary/40">payments</span>
            </div>
            <div>
              <p className="text-3xl font-bold text-slate-900">$12,450.00</p>
              <p className="text-xs font-semibold text-green-600 flex items-center gap-1 mt-1">
                <span className="material-symbols-outlined text-xs">trending_up</span> {t('dashboard.fromLastMonth')}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8">
          <h2 className="text-xl font-bold text-slate-900 mb-10">{t('dashboard.timelineTitle')}</h2>
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-100"></div>
            <div className="space-y-12">
              <div className="relative pl-12">
                <div className="absolute left-[0.625rem] top-1.5 size-3 rounded-full bg-green-500 border-4 border-white z-10 shadow-sm"></div>
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-primary px-2 py-0.5 bg-primary/10 rounded uppercase tracking-tighter">{t('dashboard.activeNow')}</span>
                      <span className="text-xs font-medium text-slate-400">June 12, 2024</span>
                    </div>
                    <h4 className="font-bold text-lg text-slate-900">{t('dashboard.foodDistributionTitle')}</h4>
                    <p className="text-slate-600 mt-2 leading-relaxed">
                      {t('dashboard.foodDistributionDesc')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
