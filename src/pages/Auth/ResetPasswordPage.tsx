import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { SEO } from '../../components/SEO';

export const ResetPasswordPage: React.FC = () => {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const errorFor = (code?: string) => {
    switch (code) {
      case 'INVALID_TOKEN': return t('auth.resetInvalidLink');
      case 'WEAK_PASSWORD': return t('auth.resetWeakPassword');
      case 'RATE_LIMITED': return t('auth.resetRateLimited');
      default: return t('auth.resetFailed');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    if (password.length < 8) return setMessage({ type: 'error', text: t('auth.resetWeakPassword') });
    if (password !== confirm) return setMessage({ type: 'error', text: t('auth.resetMismatch') });

    setLoading(true);
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, new_password: password })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(errorFor(data.code));
      setDone(true);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || t('auth.resetFailed') });
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full bg-slate-50 border-2 border-transparent focus:border-primary rounded-xl py-4 pl-14 pr-14 outline-none font-bold transition-all text-slate-900';

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 py-12 bg-background-light">
      <SEO fallbackTitle="Reset Password | Building Bridges" noindex />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white p-6 sm:p-10 rounded-3xl border border-primary/5 shadow-2xl"
      >
        <div className="text-center mb-10">
          <div className="inline-flex size-16 bg-primary/10 text-primary rounded-2xl items-center justify-center mb-6">
            <span className="material-symbols-outlined text-4xl">{done ? 'verified_user' : 'lock_reset'}</span>
          </div>
          <h1 className="text-3xl font-black text-primary uppercase tracking-tight">
            {done ? t('auth.resetDoneTitle') : t('auth.resetTitle')}
          </h1>
          <p className="text-slate-500 mt-2 font-medium">{done ? t('auth.resetDone') : t('auth.resetSubtitle')}</p>
        </div>

        {done ? (
          <Link
            to="/login"
            className="w-full bg-primary hover:bg-slate-800 text-white py-5 rounded-xl font-black text-lg shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-3"
          >
            {t('auth.signIn')}
            <span className="material-symbols-outlined">login</span>
          </Link>
        ) : !token ? (
          <div className="space-y-6">
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm font-bold flex items-center gap-3">
              <span className="material-symbols-outlined">error</span>
              {t('auth.resetInvalidLink')}
            </div>
            <Link to="/forgot-password" className="text-sm font-bold text-primary hover:text-accent flex items-center justify-center gap-2">
              {t('auth.resetRequestNew')}
            </Link>
          </div>
        ) : (
          <>
            {message.text && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm font-bold mb-6 flex items-center gap-3">
                <span className="material-symbols-outlined">error</span>
                {message.text}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">{t('auth.resetNewPassword')}</label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">lock</span>
                  <input
                    required
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={inputClass}
                    placeholder={t('auth.minChars8')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-4 top-1/2 -translate-y-1/2 size-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-primary transition-colors"
                  >
                    <span className="material-symbols-outlined">{showPassword ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">{t('auth.resetConfirmPassword')}</label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">check</span>
                  <input
                    required
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className={inputClass}
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                disabled={loading}
                className="w-full bg-primary hover:bg-slate-800 text-white py-5 rounded-xl font-black text-lg shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {loading ? t('auth.resetSaving') : t('auth.resetSubmit')}
                {!loading && <span className="material-symbols-outlined">shield</span>}
              </button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
};
