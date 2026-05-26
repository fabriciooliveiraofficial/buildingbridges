import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { useAuth } from '../../contexts/AuthContext';

export const RegisterPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          display_name: name,
          email: email,
          password: password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create account');
      }

      login(data.token, data.user);
      navigate('/admin');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to create account');
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
          <div className="inline-flex size-16 bg-accent/10 text-accent rounded-2xl items-center justify-center mb-6">
            <span className="material-symbols-outlined text-4xl">person_add</span>
          </div>
          <h1 className="text-3xl font-black text-primary dark:text-white uppercase tracking-tight">{t('auth.registration')}</h1>
          <p className="text-slate-500 mt-2 font-medium">{t('auth.provisionPortal')}</p>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm font-bold mb-6 flex items-center gap-3">
            <span className="material-symbols-outlined">error</span>
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">{t('auth.fullName')}</label>
            <div className="relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">person</span>
              <input 
                required
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-primary rounded-xl py-4 pl-14 pr-6 outline-none font-bold transition-all text-slate-900 dark:text-white"
                placeholder="Jane Doe"
              />
            </div>
          </div>

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

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">{t('auth.password')}</label>
            <div className="relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">lock</span>
              <input 
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-primary rounded-xl py-4 pl-14 pr-6 outline-none font-bold transition-all text-slate-900 dark:text-white"
                placeholder="••••••••"
                minLength={6}
              />
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 ml-1">{t('auth.minChars')}</p>
          </div>

          <button 
            disabled={loading}
            className="w-full bg-accent hover:bg-orange-600 text-white py-5 rounded-xl font-black text-lg shadow-xl shadow-accent/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? t('auth.creatingAccount') : t('auth.register')}
            {!loading && <span className="material-symbols-outlined">how_to_reg</span>}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm font-bold text-slate-500">
            {t('auth.alreadyHaveAccount')} <Link to="/login" className="text-primary hover:text-accent underline underline-offset-4">{t('auth.loginHere')}</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};
