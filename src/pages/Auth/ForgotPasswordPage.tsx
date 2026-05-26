import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';

export const ForgotPasswordPage: React.FC = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send reset request');
      }

      setMessage({ type: 'success', text: t('auth.resetSuccess') });
    } catch (err: any) {
      console.error(err);
      setMessage({ type: 'error', text: err.message || 'Failed to send reset email' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 py-12 bg-background-light dark:bg-background-dark">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white dark:bg-slate-900 p-10 rounded-3xl border border-primary/5 shadow-2xl"
      >
        <div className="text-center mb-10">
          <div className="inline-flex size-16 bg-slate-100 text-slate-500 rounded-2xl items-center justify-center mb-6">
            <span className="material-symbols-outlined text-4xl">lock_reset</span>
          </div>
          <h1 className="text-3xl font-black text-primary dark:text-white uppercase tracking-tight">{t('auth.recovery')}</h1>
          <p className="text-slate-500 mt-2 font-medium">{t('auth.resetPassword')}</p>
        </div>

        {message.text && (
          <div className={`p-4 rounded-xl text-sm font-bold mb-6 flex items-center gap-3 ${
            message.type === 'success' ? 'bg-success/10 text-success border border-success/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
          }`}>
            <span className="material-symbols-outlined">
              {message.type === 'success' ? 'check_circle' : 'error'}
            </span>
            {message.text}
          </div>
        )}

        <form onSubmit={handleReset} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">{t('auth.email')}</label>
            <div className="relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">mail</span>
              <input 
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-primary rounded-xl py-4 pl-14 pr-6 outline-none font-bold transition-all text-slate-900 dark:text-white"
                placeholder="staff@buildingbridges.org"
              />
            </div>
          </div>

          <button 
            disabled={loading}
            className="w-full bg-primary hover:bg-slate-800 text-white py-5 rounded-xl font-black text-lg shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? t('auth.sendingRequest') : t('auth.sendReset')}
            {!loading && <span className="material-symbols-outlined">send</span>}
          </button>
        </form>

        <div className="mt-8 text-center flex flex-col gap-4">
          <Link to="/login" className="text-sm font-bold text-primary hover:text-accent flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            {t('auth.backToLogin')}
          </Link>
        </div>
      </motion.div>
    </div>
  );
};
