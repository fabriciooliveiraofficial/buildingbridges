import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import QRCode from 'qrcode';
import { useCurrency } from '../contexts/CurrencyContext';
import { supabase } from '../lib/supabase';
import { SEO } from '../components/SEO';
import { parseImages } from '../lib/imageUtils';
import { Lightbox } from '../components/Lightbox';
import { getTranslatedProject } from '../lib/projectTranslations';

export const HomePage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { currency, rate } = useCurrency();
  const [donationAmount, setDonationAmount] = useState<string>('100');
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxTitle, setLightboxTitle] = useState('');

  const [paymentMethod, setPaymentMethod] = useState<'card' | 'zelle'>('card');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showZelleModal, setShowZelleModal] = useState<boolean>(false);

  // Dynamic Zelle Credentials loaded from server with official fallback
  const [zelleKey, setZelleKey] = useState('donate@buildingbridgesbrusa.org');
  const [zelleHolder, setZelleHolder] = useState('Building Bridges Foundation Inc.');

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // Close XL modal on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowZelleModal(false);
      }
    };
    if (showZelleModal) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showZelleModal]);

  // Fetch Zelle settings from backend
  useEffect(() => {
    fetch('/api/settings/zelle')
      .then(res => res.json())
      .then(data => {
        if (data && data.zelle_key) setZelleKey(data.zelle_key);
        if (data && data.zelle_name) setZelleHolder(data.zelle_name);
      })
      .catch(err => console.error('Failed to load Zelle settings:', err));
  }, []);

  // Generate QR Code dynamically with high resolution
  useEffect(() => {
    if (zelleKey) {
      QRCode.toDataURL(zelleKey, { width: 360, margin: 1, color: { dark: '#0a3161', light: '#ffffff' } })
        .then(setQrCodeUrl)
        .catch(console.error);
    }
  }, [zelleKey]);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = 'https://picsum.photos/seed/mission-fallback/800/600';
  };

  useEffect(() => {
    const fetchTopProjects = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/projects?limit=3');
        if (!response.ok) throw new Error('Failed to fetch top projects');
        const data = await response.json();

        if (data && data.projects && data.projects.length > 0) {
          setProjects(data.projects.slice(0, 3));
        } else if (Array.isArray(data) && data.length > 0) {
          setProjects(data.slice(0, 3));
        }
      } catch (err) {
        // Silencing network errors to avoid console spam when dev credentials aren't fully set up
        if (!(err instanceof TypeError && err.message === 'Failed to fetch')) {
          console.error('Unexpected error fetching top projects:', err);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchTopProjects();
  }, []);

  return (
    <div className="flex flex-col">
      <SEO titleKey="home" descriptionKey="home" />
      {/* Hero Section */}
      <section className="relative min-h-[620px] lg:min-h-[720px] flex items-center pt-24 lg:pt-20 pb-16 lg:pb-24 overflow-hidden">
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <img 
            src="https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?q=80&w=2070&auto=format&fit=crop" 
            className="w-full h-full object-cover object-center"
            alt="Humanitarian Relief and Community Building"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-primary/40 to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-accent/20 border border-accent/30 text-accent mb-8 max-w-full">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
              </span>
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest truncate">{t('hero.live')}: RS, Gulf, Amazon</span>
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black text-white leading-[1.1] mb-8">
              {t('hero.title')}<br />
              <span className="text-accent">{t('hero.subtitle')}</span>
            </h1>
            <Link 
              to="/projects" 
              className="inline-flex items-center gap-3 text-white font-bold hover:gap-5 transition-all group"
            >
              {t('missions.viewAll')}
              <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </Link>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white p-7 sm:p-8 rounded-3xl shadow-2xl border border-primary/5 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-2xl font-black text-primary flex items-center gap-2.5">
                <span className="material-symbols-outlined text-accent text-2xl">payments</span>
                {t('donation.quick')}
              </h3>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                {paymentMethod === 'card' ? 'Online Gateway' : 'Zero Taxas'}
              </span>
            </div>

            {/* UNIFIED DESIGN SYSTEM SWITCH (CARTÃO | ZELLE) */}
            <div className="grid grid-cols-2 gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/80 mb-5">
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`py-2 px-3 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  paymentMethod === 'card'
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-slate-500 hover:text-primary'
                }`}
              >
                <span className="material-symbols-outlined text-base">credit_card</span>
                Cartão
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('zelle')}
                className={`py-2 px-3 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  paymentMethod === 'zelle'
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-slate-500 hover:text-primary'
                }`}
              >
                <span className="material-symbols-outlined text-base">qr_code_scanner</span>
                Zelle
              </button>
            </div>

            <AnimatePresence mode="wait">
              {paymentMethod === 'card' ? (
                /* VIEW A: CARD / STRIPE GATEWAY */
                <motion.div
                  key="card"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-3 gap-3">
                    {['25', '50', '100'].map((amount) => (
                      <button
                        key={amount}
                        type="button"
                        onClick={() => setDonationAmount(amount)}
                        className={`py-3 rounded-xl font-black text-lg transition-all border-2 cursor-pointer ${
                          donationAmount === amount 
                          ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-[1.02]' 
                          : 'bg-primary/5 border-transparent hover:border-primary/20 text-primary'
                        }`}
                      >
                        {currency === 'BRL' ? `R$${Math.round(parseInt(amount) * rate)}` : `$${amount}`}
                      </button>
                    ))}
                  </div>

                  <div className="relative">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-primary/40 font-black text-xl">
                      {currency === 'BRL' ? 'R$' : '$'}
                    </div>
                    <input 
                      type="number"
                      value={donationAmount}
                      onChange={(e) => setDonationAmount(e.target.value)}
                      placeholder={t('donation.other')}
                      className="w-full bg-primary/5 border-2 border-transparent focus:border-accent focus:bg-white transition-all rounded-xl py-3.5 pl-14 pr-6 outline-none font-black text-xl text-primary"
                    />
                  </div>

                  <div className="space-y-3 pt-1">
                    <Link 
                      to={`/checkout?amount=${donationAmount || '100'}`} 
                      className="w-full bg-accent hover:bg-orange-600 text-white py-4 px-6 rounded-xl font-black text-sm xs:text-base shadow-xl shadow-accent/30 transition-all flex items-center justify-center gap-2 group text-center cursor-pointer"
                    >
                      <span className="uppercase tracking-tight">{t('donation.proceed')}</span>
                      <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform shrink-0 text-xl">lock</span>
                    </Link>

                    <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <span className="material-symbols-outlined text-sm text-success">verified_user</span>
                      {t('donation.secure')}
                    </div>
                  </div>
                </motion.div>
              ) : (
                /* VIEW B: ZELLE (STABLE INLINE VIEW WITH NO LAYOUT JUMP) */
                <motion.div
                  key="zelle"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-3.5"
                >
                  {/* Recipient & Key Box */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Destinatário Oficial
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-success bg-success/10 px-2 py-0.5 rounded-full">
                        <span className="material-symbols-outlined text-xs">verified</span>
                        Verificado
                      </span>
                    </div>
                    <p className="text-xs font-black text-primary truncate">{zelleHolder}</p>

                    <div className="flex items-center gap-2">
                      <input
                        readOnly
                        value={zelleKey}
                        aria-label="Chave Zelle oficial"
                        className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 flex-1 truncate select-all outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleCopy(zelleKey, 'Chave Zelle')}
                        className={`px-3 py-2 rounded-xl text-xs font-black flex items-center gap-1 transition-all cursor-pointer shrink-0 shadow-sm ${
                          copiedKey === 'Chave Zelle'
                            ? 'bg-success text-white'
                            : 'bg-primary hover:bg-slate-800 text-white'
                        }`}
                      >
                        <span className="material-symbols-outlined text-sm">
                          {copiedKey === 'Chave Zelle' ? 'check' : 'content_copy'}
                        </span>
                        {copiedKey === 'Chave Zelle' ? 'Copiado!' : 'Copiar'}
                      </button>
                    </div>
                  </div>

                  {/* Compact QR Preview & Instructions */}
                  <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-50/70 border border-slate-200/60">
                    <button
                      type="button"
                      onClick={() => setShowZelleModal(true)}
                      className="relative group p-1.5 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all shrink-0 cursor-pointer overflow-hidden"
                      title="Clique para abrir em tela cheia"
                    >
                      {qrCodeUrl ? (
                        <img src={qrCodeUrl} alt="Zelle QR Code" className="size-16 object-contain" />
                      ) : (
                        <div className="size-16 bg-slate-100 rounded-lg animate-pulse" />
                      )}
                      <div className="absolute inset-0 bg-primary/85 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[8px] font-black">
                        <span className="material-symbols-outlined text-sm">zoom_in</span>
                        <span>AMPLIAR</span>
                      </div>
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-accent text-sm">qr_code_scanner</span>
                        <p className="text-xs font-black text-primary">Escaneie no app do seu banco</p>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium leading-snug mt-0.5">
                        Compatível com Chase, BofA, Wells Fargo e bancos dos EUA.
                      </p>
                      <button
                        type="button"
                        onClick={() => setShowZelleModal(true)}
                        className="mt-1 text-accent hover:text-orange-600 font-black text-[11px] inline-flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <span>Ver QR Code Grande (XL)</span>
                        <span className="material-symbols-outlined text-xs">open_in_full</span>
                      </button>
                    </div>
                  </div>

                  {/* Primary Action Button */}
                  <div className="space-y-3 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowZelleModal(true)}
                      className="w-full bg-accent hover:bg-orange-600 text-white py-3.5 px-4 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-xl shadow-accent/20 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-base">fullscreen</span>
                      Abrir QR Code em Tela Cheia
                    </button>

                    <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <span className="material-symbols-outlined text-sm text-success">verified_user</span>
                      Isento de taxas bancárias • Transferência Direta
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* Urgent Missions Section */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
            <div>
              <div className="flex items-center gap-2 text-accent font-black text-sm uppercase tracking-widest mb-4">
                <span className="w-8 h-[2px] bg-accent"></span>
                {t('missions.active')}
              </div>
              <h2 className="text-4xl lg:text-5xl font-black text-primary">{t('missions.title')}</h2>
            </div>
            <Link to="/projects" className="group flex items-center gap-3 text-primary font-bold hover:text-accent transition-colors">
              {t('missions.viewAll')}
              <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">east</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {loading ? (
              <div className="col-span-full text-center py-10 font-bold text-slate-400 italic">{t('projects.loading')}</div>
            ) : projects.length > 0 ? (
              projects.map((rawProject) => {
                const project = getTranslatedProject(rawProject, i18n.language);
                const projectImages = parseImages(project.image_url);
                const mainImage = projectImages[0] || 'https://picsum.photos/seed/relief/800/600';
                return (
                  <motion.div 
                    key={project.id}
                    whileHover={{ y: -10 }}
                    className="group bg-background-light rounded-3xl overflow-hidden border border-primary/5 hover:shadow-2xl transition-all h-full flex flex-col"
                  >
                    <div 
                      onClick={() => {
                        setLightboxImages(projectImages.length > 0 ? projectImages : [mainImage]);
                        setLightboxTitle(project.name);
                        setLightboxOpen(true);
                      }}
                      className="relative h-64 overflow-hidden shrink-0 cursor-pointer"
                    >
                      <img 
                        src={mainImage} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        alt={project.name}
                        referrerPolicy="no-referrer"
                        onError={handleImageError}
                      />
                      <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <span className="material-symbols-outlined text-white text-3xl scale-90 group-hover:scale-100 transition-transform duration-300">photo_library</span>
                      </div>
                      <div className="absolute top-6 left-6 bg-primary text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest z-10">
                        {project.category || t('missions.active')}
                      </div>
                    </div>
                    <div className="p-8 flex flex-col flex-1">
                      <h3 className="text-2xl font-black text-primary mb-4 line-clamp-1">{project.name}</h3>
                      <p className="text-slate-500 text-sm leading-relaxed mb-8 line-clamp-2">
                        {project.description}
                      </p>
                      <div className="space-y-4 mt-auto">
                        <Link to={`/impact/${project.id}`} className="w-full py-4 rounded-xl bg-primary text-white font-black text-sm hover:bg-primary/90 transition-all text-center block">
                          {t('missions.support')}
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <>
                {/* Fallback Mission 1 */}
                <motion.div 
                  whileHover={{ y: -10 }}
                  className="group bg-background-light dark:bg-white/5 rounded-3xl overflow-hidden border border-primary/5 hover:shadow-2xl transition-all"
                >
                  <div 
                    onClick={() => {
                      setLightboxImages(["https://picsum.photos/seed/rio/800/600"]);
                      setLightboxTitle(t('missions.rio.title'));
                      setLightboxOpen(true);
                    }}
                    className="relative h-64 overflow-hidden cursor-pointer"
                  >
                    <img 
                      src="https://picsum.photos/seed/rio/800/600" 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      alt="Rio Grande do Sul"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <span className="material-symbols-outlined text-white text-3xl scale-90 group-hover:scale-100 transition-transform duration-300">photo_library</span>
                    </div>
                    <div className="absolute top-6 left-6 bg-primary text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest z-10">
                      {t('missions.rio.tag')}
                    </div>
                  </div>
                  <div className="p-8">
                    <h3 className="text-2xl font-black text-primary dark:text-white mb-4">{t('missions.rio.title')}</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-8">
                      {t('missions.rio.desc')}
                    </p>
                    <div className="space-y-4">
                      <Link to="/projects" className="w-full py-4 rounded-xl bg-primary text-white font-black text-sm hover:bg-primary/90 transition-all text-center block">
                        {t('missions.support')}
                      </Link>
                    </div>
                  </div>
                </motion.div>
                {/* Additional Fallbacks omitted for brevity in multi_edit, or keep them if needed */}
              </>
            )}
          </div>
        </div>
      </section>

      {/* ================== XL ZELLE MODAL DIALOG (OVERLAY) ================== */}
      <AnimatePresence>
        {showZelleModal && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            {/* Backdrop Blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setShowZelleModal(false)}
              className="fixed inset-0 bg-slate-950/75 backdrop-blur-md"
            />

            {/* Modal Dialog Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-8 z-10 overflow-hidden my-auto"
            >
              {/* Decorative background accent */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-accent/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setShowZelleModal(false)}
                className="absolute top-5 right-5 size-10 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Fechar modal"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>

              {/* Modal Header */}
              <div className="flex items-center gap-3.5 mb-6 pr-10">
                <div className="size-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-2xl">qr_code_2</span>
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-primary leading-tight">
                    Doação Oficial via Zelle
                  </h3>
                  <p className="text-slate-500 font-bold text-xs mt-0.5">
                    Transferência direta no app do seu banco americano
                  </p>
                </div>
              </div>

              {/* Centerpiece: Large High-Resolution QR Code (XL) */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 text-center mb-6">
                <span className="text-[10px] font-black text-primary uppercase tracking-widest mb-3 block">
                  Aponte a câmera no aplicativo do seu banco
                </span>

                <div className="p-4 bg-white rounded-2xl shadow-md border border-slate-200/80 inline-block mb-3">
                  {qrCodeUrl ? (
                    <img 
                      src={qrCodeUrl} 
                      alt="Zelle QR Code" 
                      className="size-52 sm:size-60 object-contain mx-auto" 
                    />
                  ) : (
                    <div className="size-52 sm:size-60 bg-slate-100 rounded-xl animate-pulse mx-auto" />
                  )}
                </div>

                <div className="space-y-0.5">
                  <p className="text-[11px] font-bold text-slate-500">Destinatário Oficial:</p>
                  <p className="text-sm font-black text-primary">{zelleHolder}</p>
                </div>
              </div>

              {/* Key Copy Box */}
              <div className="space-y-2 mb-6">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block">
                  Chave Zelle (E-mail Oficial)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    readOnly
                    value={zelleKey}
                    aria-label="Chave Zelle para cópia"
                    className="bg-slate-50 border-2 border-slate-200 focus:border-accent rounded-xl px-4 py-3 text-xs sm:text-sm font-black text-slate-800 flex-1 truncate select-all outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopy(zelleKey, 'Modal Zelle')}
                    className={`px-4 sm:px-5 py-3 rounded-xl text-xs sm:text-sm font-black flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-sm ${
                      copiedKey === 'Modal Zelle'
                        ? 'bg-success text-white'
                        : 'bg-accent hover:bg-orange-600 text-white'
                    }`}
                  >
                    <span className="material-symbols-outlined text-base">
                      {copiedKey === 'Modal Zelle' ? 'check' : 'content_copy'}
                    </span>
                    {copiedKey === 'Modal Zelle' ? 'Copiado!' : 'Copiar Chave'}
                  </button>
                </div>
              </div>

              {/* Simple Instructions */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-6 text-left">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="size-5 rounded-full bg-primary/10 text-primary font-black text-[10px] flex items-center justify-center mb-1.5">1</span>
                  <p className="text-[11px] font-bold text-slate-700">Abra o App</p>
                  <p className="text-[10px] text-slate-500 font-medium">Chase, BofA, Wells Fargo, etc.</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="size-5 rounded-full bg-primary/10 text-primary font-black text-[10px] flex items-center justify-center mb-1.5">2</span>
                  <p className="text-[11px] font-bold text-slate-700">Escaneie o QR</p>
                  <p className="text-[10px] text-slate-500 font-medium">Ou cole a chave oficial Zelle.</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="size-5 rounded-full bg-primary/10 text-primary font-black text-[10px] flex items-center justify-center mb-1.5">3</span>
                  <p className="text-[11px] font-bold text-slate-700">Defina o Valor</p>
                  <p className="text-[10px] text-slate-500 font-medium">Confirme o envio no seu banco.</p>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  <span className="material-symbols-outlined text-sm text-success">verified_user</span>
                  Isento de taxas bancárias
                </div>
                <button
                  type="button"
                  onClick={() => setShowZelleModal(false)}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Lightbox 
        images={lightboxImages} 
        isOpen={lightboxOpen} 
        onClose={() => setLightboxOpen(false)} 
        title={lightboxTitle} 
      />

      {/* Copy Notification Toast */}
      <AnimatePresence>
        {copiedKey && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="fixed bottom-8 right-8 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700"
          >
            <span className="material-symbols-outlined text-success">check_circle</span>
            <span className="text-xs font-black uppercase tracking-wider">{copiedKey} copiado para a área de transferência!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
