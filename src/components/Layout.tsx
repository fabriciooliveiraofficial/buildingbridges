import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../contexts/CurrencyContext';
import logoUrl from '../assets/logo_building_bridges.png';

export const Header: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user, profile, logout } = useAuth();
  const { currency, setCurrency } = useCurrency();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    logout();
    setIsMenuOpen(false);
    navigate('/');
  };

  const navLinks = [
    { to: '/projects', label: t('nav.missions') },
    { to: '/action-hub', label: t('nav.actionHub') || 'Hub de Ação' },
    { to: '/impact', label: t('nav.impact') },
    { to: '/transparency', label: t('nav.transparency') },
    { to: '/contact', label: t('footer.contact') },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-primary/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 sm:gap-3 shrink-0">
          <img src={logoUrl} alt="Building Bridges" className="h-10 sm:h-12 w-auto object-contain transition-transform duration-300 hover:scale-105" />
          <span className="text-lg sm:text-xl font-black tracking-tight text-primary uppercase truncate max-w-[120px] sm:max-w-none">Building Bridges</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map(link => (
            <Link key={link.to} to={link.to} className="text-sm font-semibold hover:text-accent transition-colors">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-1.5 sm:gap-4">
          <div className="hidden sm:flex items-center bg-primary/5 rounded-full p-1 border border-primary/10">
            <button 
              onClick={() => setCurrency('USD')}
              className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all ${
                currency === 'USD' 
                  ? 'bg-white shadow-sm text-primary' 
                  : 'text-slate-500 hover:text-primary'
              }`}
            >
              USD
            </button>
            <button 
              onClick={() => setCurrency('BRL')}
              className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all ${
                currency === 'BRL' 
                  ? 'bg-white shadow-sm text-primary' 
                  : 'text-slate-500 hover:text-primary'
              }`}
            >
              BRL
            </button>
          </div>
          <Link to="/checkout" className="bg-accent hover:bg-orange-600 text-white px-3 sm:px-6 py-2 sm:py-2.5 rounded-full font-bold text-sm tracking-wide transition-all shadow-lg shadow-accent/20 flex items-center gap-2">
            <span className="hidden sm:inline">{t('nav.donate')}</span>
            <span className="material-symbols-outlined sm:hidden text-lg">volunteer_activism</span>
          </Link>

          {user ? (
            <div className="flex items-center gap-3 pl-4 border-l border-primary/10">
              <div className="hidden lg:block text-right">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Staff Access</p>
                <p className="text-sm font-bold text-primary line-clamp-1 max-w-[100px]">{profile?.displayName || user.email}</p>
              </div>
              <button 
                onClick={handleLogout}
                className="size-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 hover:text-red-500 transition-colors"
                title="Logout"
              >
                <span className="material-symbols-outlined">logout</span>
              </button>
            </div>
          ) : (
            <Link 
              to="/login" 
              className="size-10 bg-primary/5 rounded-full flex items-center justify-center text-slate-400 hover:text-primary transition-colors"
              title="Staff Login"
            >
              <span className="material-symbols-outlined">admin_panel_settings</span>
            </Link>
          )}

          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden size-10 flex items-center justify-center text-primary"
          >
            <span className="material-symbols-outlined">
              {isMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white dark:bg-background-dark border-b border-primary/10 overflow-hidden"
          >
            <div className="px-6 py-8 space-y-6">
              {navLinks.map(link => (
                <Link 
                  key={link.to} 
                  to={link.to} 
                  className="block text-lg font-bold text-primary dark:text-white"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="h-px bg-primary/10 w-full"></div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Currency</span>
                <div className="flex items-center bg-primary/5 dark:bg-white/5 rounded-full p-1 border border-primary/10">
                  <button 
                    onClick={() => { setCurrency('USD'); setIsMenuOpen(false); }}
                    className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all ${currency === 'USD' ? 'bg-white dark:bg-primary text-primary dark:text-white' : 'text-slate-500'}`}
                  >
                    USD
                  </button>
                  <button 
                    onClick={() => { setCurrency('BRL'); setIsMenuOpen(false); }}
                    className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all ${currency === 'BRL' ? 'bg-white dark:bg-primary text-primary dark:text-white' : 'text-slate-500'}`}
                  >
                    BRL
                  </button>
                </div>
              </div>
              <Link 
                to="/checkout" 
                className="block w-full bg-accent text-white text-center py-4 rounded-xl font-bold shadow-lg shadow-accent/20"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('nav.donate')}
              </Link>
              {user && (
                <button 
                  onClick={handleLogout}
                  className="w-full text-left flex items-center gap-3 text-red-500 font-bold py-4"
                >
                  <span className="material-symbols-outlined">logout</span>
                  Sign Out
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export const Footer: React.FC = () => {
  const { t } = useTranslation();
  return (
    <footer className="bg-background-light py-12 border-t border-primary/5">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex items-center gap-3 opacity-80 hover:opacity-100 transition-opacity">
          <img src={logoUrl} alt="Building Bridges" className="h-8 w-auto object-contain grayscale" />
          <span className="text-lg font-black tracking-tight text-primary uppercase">Building Bridges</span>
        </div>
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-3">
          <Link to="/privacy" className="text-xs font-bold text-slate-500 hover:text-primary transition-colors uppercase">{t('footer.privacy')}</Link>
          <Link to="/transparency" className="text-xs font-bold text-slate-500 hover:text-primary transition-colors uppercase">{t('footer.reports')}</Link>
          <Link to="/contact" className="text-xs font-bold text-slate-500 hover:text-primary transition-colors uppercase">{t('footer.contact')}</Link>
        </div>
        <div className="text-xs font-bold text-slate-400">
          {t('footer.rights')}
        </div>
      </div>
    </footer>
  );
};

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="relative flex min-h-screen flex-col bg-background-light dark:bg-background-dark">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <LanguageSwitcher />
    </div>
  );
};
