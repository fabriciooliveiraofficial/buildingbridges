import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { useAuth } from '../../contexts/AuthContext';

export const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const from = (location.state as any)?.from?.pathname || "/admin";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to login');
      }

      login(data.token, data.user);
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 py-12 bg-background-light">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white p-6 sm:p-10 rounded-3xl border border-primary/5 shadow-2xl"
      >
        <div className="text-center mb-10">
          <div className="inline-flex size-16 bg-primary/10 text-primary rounded-2xl items-center justify-center mb-6">
            <span className="material-symbols-outlined text-4xl">lock_open</span>
          </div>
          <h1 className="text-3xl font-black text-primary uppercase tracking-tight">{t('auth.staffLogin')}</h1>
          <p className="text-slate-500 mt-2 font-medium">{t('auth.accessConsole')}</p>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm font-bold mb-6 flex items-center gap-3">
            <span className="material-symbols-outlined">error</span>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">{t('auth.email')}</label>
            <div className="relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">mail</span>
              <input 
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border-2 border-transparent focus:border-primary rounded-xl py-4 pl-14 pr-6 outline-none font-bold transition-all text-slate-900"
                placeholder="staff@buildingbridges.org"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center ml-1">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">{t('auth.password')}</label>
              <Link to="/forgot-password" weights="tight" className="text-xs font-bold text-primary hover:text-accent transition-colors">
                {t('auth.forgotPassword')}
              </Link>
            </div>
            <div className="relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">lock</span>
              <input 
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border-2 border-transparent focus:border-primary rounded-xl py-4 pl-14 pr-6 outline-none font-bold transition-all text-slate-900"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            disabled={loading}
            className="w-full bg-primary hover:bg-slate-800 text-white py-5 rounded-xl font-black text-lg shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? t('auth.authenticating') : t('auth.signIn')}
            {!loading && <span className="material-symbols-outlined">login</span>}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
          <p className="text-xs sm:text-sm font-bold text-slate-500 leading-relaxed">
            {t('auth.registerTeam')} <Link to="/register" className="text-primary hover:text-accent font-black underline underline-offset-4 decoration-2">{t('auth.registerHere')}</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};
