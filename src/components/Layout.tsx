import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../contexts/CurrencyContext';
import logoUrl from '../assets/logo_building_bridges.png';

type NavLinkItem = { to: string; label: string };

/**
 * Off-canvas navigation for small screens.
 * It is rendered in a portal on <body>: the sticky header uses backdrop-filter, which would otherwise
 * become the containing block of any `position: fixed` child and stop the drawer from covering the viewport.
 */
const MobileMenu: React.FC<{
  open: boolean;
  onClose: () => void;
  links: NavLinkItem[];
  onLogout: () => void;
  returnFocusTo: React.RefObject<HTMLButtonElement | null>;
}> = ({ open, onClose, links, onLogout, returnFocusTo }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { currency, setCurrency } = useCurrency();
  const location = useLocation();
  const reduceMotion = useReducedMotion();
  const panelRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);

  // Lock page scroll while the drawer is open.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [open]);

  // Move focus into the drawer when it opens and back to the hamburger when it closes.
  useEffect(() => {
    if (open) {
      wasOpen.current = true;
      const id = window.setTimeout(() => closeRef.current?.focus(), 50);
      return () => window.clearTimeout(id);
    }
    if (wasOpen.current) {
      wasOpen.current = false;
      returnFocusTo.current?.focus();
    }
  }, [open, returnFocusTo]);

  // The drawer is a mobile-only pattern: close it if the viewport grows to the desktop layout.
  useEffect(() => {
    if (!open) return;
    const mq = window.matchMedia('(min-width: 768px)');
    const onChange = (e: MediaQueryListEvent) => { if (e.matches) onClose(); };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [open, onClose]);

  // Escape closes; Tab is kept inside the drawer.
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      onClose();
      return;
    }
    if (e.key !== 'Tab' || !panelRef.current) return;
    const focusable = panelRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])');
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  const duration = reduceMotion ? 0 : 0.32;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="offcanvas-backdrop"
          className="fixed inset-0 z-[110] bg-slate-950/55 backdrop-blur-[2px] md:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.25 }}
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      {open && (
        <motion.aside
          key="offcanvas-panel"
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label={t('nav.menu')}
          onKeyDown={onKeyDown}
          className="fixed inset-y-0 right-0 z-[120] flex w-[86%] max-w-sm flex-col bg-white shadow-2xl md:hidden"
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ duration, ease: [0.32, 0.72, 0, 1] }}
        >
          <div className="flex h-24 shrink-0 items-center justify-between border-b border-primary/10 px-6">
            <Link to="/" onClick={onClose} aria-label="Building Bridges">
              <img src={logoUrl} alt="" className="h-14 w-14 object-contain" />
            </Link>
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label={t('nav.close')}
              className="flex size-11 items-center justify-center rounded-full bg-slate-100 text-primary transition-colors hover:bg-slate-200"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-5" aria-label={t('nav.menu')}>
            <ul className="space-y-1">
              {links.map((link, i) => {
                const active = location.pathname === link.to || location.pathname.startsWith(`${link.to}/`);
                return (
                  <motion.li
                    key={link.to}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: reduceMotion ? 0 : 0.08 + i * 0.05, duration: reduceMotion ? 0 : 0.25 }}
                  >
                    <Link
                      to={link.to}
                      onClick={onClose}
                      aria-current={active ? 'page' : undefined}
                      className={`flex items-center justify-between rounded-xl px-4 py-4 text-lg font-bold transition-colors ${
                        active ? 'bg-primary/5 text-primary' : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <span className={`h-5 w-1 rounded-full ${active ? 'bg-accent' : 'bg-transparent'}`} />
                        {link.label}
                      </span>
                      <span className="material-symbols-outlined text-xl text-slate-300">chevron_right</span>
                    </Link>
                  </motion.li>
                );
              })}
            </ul>
          </nav>

          <div className="shrink-0 space-y-5 border-t border-primary/10 px-6 pt-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-widest text-slate-400">{t('nav.currency')}</span>
              <div className="flex items-center rounded-full border border-primary/10 bg-primary/5 p-1">
                {(['USD', 'BRL'] as const).map((code) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => setCurrency(code)}
                    aria-pressed={currency === code}
                    className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
                      currency === code ? 'bg-white text-primary shadow-sm' : 'text-slate-500'
                    }`}
                  >
                    {code}
                  </button>
                ))}
              </div>
            </div>

            <Link
              to="/checkout"
              onClick={onClose}
              className="block w-full rounded-xl bg-accent py-4 text-center font-bold text-white shadow-lg shadow-accent/20"
            >
              {t('nav.donate')}
            </Link>

            {user && (
              <div className="divide-y divide-primary/5 border-t border-primary/5">
                <Link to="/admin" onClick={onClose} className="flex w-full items-center gap-3 py-4 font-bold text-primary">
                  <span className="material-symbols-outlined">dashboard</span>
                  {t('nav.admin') || 'Admin'}
                </Link>
                <button type="button" onClick={onLogout} className="flex w-full items-center gap-3 py-4 text-left font-bold text-red-500">
                  <span className="material-symbols-outlined">logout</span>
                  {t('nav.signOut')}
                </button>
              </div>
            )}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>,
    document.body
  );
};

export const Header: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user, profile, logout } = useAuth();
  const { currency, setCurrency } = useCurrency();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const handleLogout = async () => {
    logout();
    setIsMenuOpen(false);
    navigate('/');
  };

  const navLinks = [
    { to: '/projects', label: t('nav.missions') },
    { to: '/action-hub', label: t('nav.actionHub') || 'Hub de Ação' },
    { to: '/contact', label: t('footer.contact') },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-primary/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-24 sm:h-28 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 sm:gap-3 shrink-0">
          <img src={logoUrl} alt="Building Bridges" className="h-16 w-16 sm:h-24 sm:w-24 object-contain transition-transform duration-300 hover:scale-105" />
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
              <Link 
                to="/admin" 
                className="bg-primary/5 hover:bg-primary/10 text-primary rounded-full flex items-center justify-center transition-colors px-4 py-2 gap-2"
                title={t('nav.admin') || 'Admin'}
              >
                <span className="material-symbols-outlined">dashboard</span>
                <span className="font-bold text-sm hidden lg:block">{t('nav.admin') || 'Admin'}</span>
              </Link>
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
            ref={menuButtonRef}
            type="button"
            onClick={() => setIsMenuOpen(true)}
            aria-label={t('nav.menu')}
            aria-haspopup="dialog"
            aria-expanded={isMenuOpen}
            className="md:hidden size-10 flex items-center justify-center text-primary"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
        </div>
      </div>

      <MobileMenu
        open={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        links={navLinks}
        onLogout={handleLogout}
        returnFocusTo={menuButtonRef}
      />
    </header>
  );
};

export const Footer: React.FC = () => {
  const { t } = useTranslation();
  return (
    <footer className="relative bg-background-light border-t border-primary/10">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" aria-hidden="true"></div>
      <div className="max-w-7xl mx-auto px-6 py-12 lg:py-14 flex flex-col md:flex-row md:items-center gap-8 md:gap-12 lg:gap-16">
        <Link to="/" className="flex items-center gap-4 shrink-0 group" aria-label="Building Bridges">
          <img src={logoUrl} alt="" className="h-16 w-16 lg:h-20 lg:w-20 object-contain transition-transform duration-300 group-hover:scale-105" />
          <div>
            <p className="font-heading font-black text-primary text-base lg:text-lg leading-tight">Building Bridges Foundation</p>
            <p className="mt-1 text-[11px] font-bold uppercase tracking-widest text-accent">{t('hero.title')} {t('hero.subtitle')}</p>
          </div>
        </Link>
        <div className="hidden md:block w-px self-stretch bg-primary/10" aria-hidden="true"></div>
        <div className="max-w-2xl">
          <p className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary/70">{t('footer.legal')}</p>
          <p className="text-[13px] leading-relaxed font-medium text-slate-500">{t('footer.rights')}</p>
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
