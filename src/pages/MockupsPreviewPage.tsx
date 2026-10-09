import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { motion, AnimatePresence } from 'motion/react';
import { SEO } from '../components/SEO';
import logoUrl from '../assets/logo_building_bridges.png';

export const MockupsPreviewPage: React.FC = () => {
  const [activeScreen, setActiveScreen] = useState<'admin' | 'home' | 'product'>('home');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // --- ADMIN STATE ---
  const [adminZelleKey, setAdminZelleKey] = useState('donate@buildingbridgesbrusa.org');
  const [adminZelleHolder, setAdminZelleHolder] = useState('Building Bridges Foundation Inc.');
  const [adminZelleEnabled, setAdminZelleEnabled] = useState(true);

  const [adminZelleQrUrl, setAdminZelleQrUrl] = useState('');

  // --- HOME STATE ---
  const [homeMethod, setHomeMethod] = useState<'card' | 'zelle'>('card');
  const [homeAmount, setHomeAmount] = useState('50');
  const [homeCustomAmount, setHomeCustomAmount] = useState('');
  const [homeQrUrl, setHomeQrUrl] = useState('');

  // --- PRODUCT MODAL STATE ---
  const [productMethod, setProductMethod] = useState<'card' | 'zelle'>('card');
  const [productQrUrl, setProductQrUrl] = useState('');
  const [showProductModal, setShowProductModal] = useState(true);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // Generate Admin QR codes (using official primary dark navy #0a3161)
  useEffect(() => {
    if (adminZelleKey) {
      QRCode.toDataURL(adminZelleKey, { width: 220, margin: 1, color: { dark: '#0a3161', light: '#ffffff' } })
        .then(setAdminZelleQrUrl)
        .catch(console.error);
    }
  }, [adminZelleKey]);

  // Generate Home QR code based on method & amount
  useEffect(() => {
    if (homeMethod === 'zelle') {
      QRCode.toDataURL(adminZelleKey, { width: 240, margin: 1, color: { dark: '#0a3161', light: '#ffffff' } })
        .then(setHomeQrUrl)
        .catch(console.error);
    }
  }, [homeMethod, homeAmount, homeCustomAmount, adminZelleKey]);

  // Generate Product Modal QR code based on method
  useEffect(() => {
    if (productMethod === 'zelle') {
      QRCode.toDataURL(adminZelleKey, { width: 220, margin: 1, color: { dark: '#0a3161', light: '#ffffff' } })
        .then(setProductQrUrl)
        .catch(console.error);
    }
  }, [productMethod, adminZelleKey]);

  return (
    <div className="min-h-screen bg-background-light py-8 px-4 sm:px-6 lg:px-8">
      <SEO titleKey="projects" descriptionKey="projects" />

      {/* Top Banner */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="bg-primary text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-primary/20 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/20 border border-accent/40 text-accent text-[11px] font-black uppercase tracking-widest">
              <span className="material-symbols-outlined text-sm">verified</span>
              Design System Oficial Building Bridges
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-heading">
              Mockups Oficiais: Zelle
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl font-medium">
              Paleta e tipografia 100% integradas: Primary (<code className="text-accent font-bold">#0a3161</code>), Accent (<code className="text-accent font-bold">#FF8C00</code>), botões do sistema e segmented switches idênticos.
            </p>
          </div>

          {/* Screen Switcher */}
          <div className="flex flex-wrap gap-2 bg-white/10 p-1.5 rounded-2xl border border-white/10 shrink-0">
            <button
              type="button"
              onClick={() => setActiveScreen('home')}
              className={`px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                activeScreen === 'home'
                  ? 'bg-accent text-white shadow-md'
                  : 'text-white/80 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="material-symbols-outlined text-base">home</span>
              1. Doação (Home)
            </button>
            <button
              type="button"
              onClick={() => { setActiveScreen('product'); setShowProductModal(true); }}
              className={`px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                activeScreen === 'product'
                  ? 'bg-accent text-white shadow-md'
                  : 'text-white/80 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="material-symbols-outlined text-base">shopping_bag</span>
              2. Produto Preço Fixo
            </button>
            <button
              type="button"
              onClick={() => setActiveScreen('admin')}
              className={`px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                activeScreen === 'admin'
                  ? 'bg-accent text-white shadow-md'
                  : 'text-white/80 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="material-symbols-outlined text-base">admin_panel_settings</span>
              3. Painel Admin
            </button>
          </div>
        </div>
      </div>

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

      <main className="max-w-6xl mx-auto">
        {/* ========================================================================= */}
        {/* SCREEN 1: HOME PAGE HERO DONATION CARD                                    */}
        {/* ========================================================================= */}
        {activeScreen === 'home' && (
          <div className="space-y-6">
            <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black text-accent uppercase tracking-widest block">Tela 1 / 3</span>
                <h2 className="text-lg font-black text-primary font-heading">Card de Doação Rápida no Hero (Página Inicial)</h2>
              </div>
              <span className="text-xs font-bold text-slate-500">Selecione CARTÃO ou ZELLE no switch abaixo</span>
            </div>

            {/* Simulated Hero Section */}
            <div className="relative rounded-3xl overflow-hidden min-h-[620px] flex items-center p-6 sm:p-12 shadow-2xl border border-primary/10">
              <div className="absolute inset-0 z-0">
                <img
                  src="https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?q=80&w=2070&auto=format&fit=crop"
                  className="w-full h-full object-cover"
                  alt="Background Hero"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/80 to-primary/40"></div>
              </div>

              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center w-full">
                {/* Hero Left Text */}
                <div className="lg:col-span-6 text-white space-y-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/20 border border-accent/30 text-accent text-xs font-bold uppercase tracking-widest">
                    <span className="h-2 w-2 rounded-full bg-accent animate-ping"></span>
                    Ajuda Humanitária RS & Costa do Golfo
                  </div>
                  <h2 className="text-3xl sm:text-5xl font-black font-heading leading-tight">
                    Construindo Pontes,<br />
                    <span className="text-accent">Transformando Vidas.</span>
                  </h2>
                  <p className="text-slate-200 text-sm sm:text-base leading-relaxed">
                    Sua contribuição direta apoia a reconstrução de centros comunitários, abrigos climatizados e auxílio a famílias em situação de vulnerabilidade.
                  </p>
                </div>

                {/* Hero Right: THE EXACT DONATION CARD */}
                <div className="lg:col-span-6 lg:max-w-md lg:ml-auto w-full">
                  <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-2xl border border-primary/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                    {/* Card Header */}
                    <div className="mb-6 space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-black text-primary font-heading flex items-center gap-2">
                          <span className="material-symbols-outlined text-accent">payments</span>
                          Doação Rápida
                        </h3>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">100% Seguro</span>
                      </div>

                      {/* UNIFIED DESIGN SYSTEM SWITCH (CARTÃO | ZELLE) */}
                      <div className="grid grid-cols-2 gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/80">
                        <button
                          type="button"
                          onClick={() => setHomeMethod('card')}
                          className={`py-2 px-3 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                            homeMethod === 'card'
                              ? 'bg-white text-primary shadow-sm'
                              : 'text-slate-500 hover:text-primary'
                          }`}
                        >
                          <span className="material-symbols-outlined text-base">credit_card</span>
                          Cartão
                        </button>

                        <button
                          type="button"
                          onClick={() => setHomeMethod('zelle')}
                          className={`py-2 px-3 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                            homeMethod === 'zelle'
                              ? 'bg-white text-primary shadow-sm'
                              : 'text-slate-500 hover:text-primary'
                          }`}
                        >
                          <span className="material-symbols-outlined text-base">qr_code_scanner</span>
                          Zelle
                        </button>
                      </div>
                    </div>

                    {/* Pre-set amount selector */}
                    <div className="mb-6">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                        Selecione o Valor da Doação
                      </label>
                      <div className="grid grid-cols-3 gap-3 mb-3">
                        {['25', '50', '100'].map((amt) => (
                          <button
                            key={amt}
                            type="button"
                            onClick={() => { setHomeAmount(amt); setHomeCustomAmount(''); }}
                            className={`py-3.5 rounded-xl font-black text-base transition-all border-2 cursor-pointer ${
                              homeAmount === amt && !homeCustomAmount
                                ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                                : 'bg-primary/5 border-transparent hover:border-primary/20 text-primary'
                            }`}
                          >
                            ${amt}
                          </button>
                        ))}
                      </div>

                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40 font-black text-base">$</div>
                        <input
                          type="number"
                          value={homeCustomAmount}
                          onChange={(e) => { setHomeCustomAmount(e.target.value); setHomeAmount(''); }}
                          placeholder="Outro valor personalizado"
                          className="w-full bg-slate-50 border-2 border-transparent focus:border-accent focus:bg-white transition-all rounded-xl py-3 pl-10 pr-4 outline-none font-bold text-sm text-primary"
                        />
                      </div>
                    </div>

                    {/* VIEW A: CARD / STRIPE METHOD */}
                    {homeMethod === 'card' && (
                      <div className="space-y-4">
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                          <span className="material-symbols-outlined text-accent text-2xl">lock</span>
                          <p className="text-xs font-bold text-slate-600">
                            Checkout internacional seguro via cartão de crédito ou débito protegido pelo Stripe.
                          </p>
                        </div>
                        <button
                          type="button"
                          className="w-full bg-accent hover:bg-orange-600 text-white py-4 px-6 rounded-xl font-black text-sm uppercase tracking-wider shadow-xl shadow-accent/30 transition-all flex items-center justify-center gap-2 group cursor-pointer"
                        >
                          <span>Avançar para Pagamento (${homeAmount || homeCustomAmount || '50'})</span>
                          <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">east</span>
                        </button>
                      </div>
                    )}

                    {/* VIEW C: ZELLE QR CODE METHOD */}
                    {homeMethod === 'zelle' && (
                      <div className="space-y-4 text-center">
                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center">
                          <span className="text-[10px] font-black text-primary uppercase tracking-widest mb-3">
                            Escaneie no app do seu banco americano
                          </span>

                          {homeQrUrl ? (
                            <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-200/80 inline-block mb-3">
                              <img src={homeQrUrl} alt="Zelle QR Code" className="size-44 object-contain" />
                            </div>
                          ) : (
                            <div className="size-44 bg-slate-100 rounded-2xl animate-pulse mb-3"></div>
                          )}

                          <div className="space-y-0.5 mb-3">
                            <p className="text-[11px] font-bold text-slate-500">Destinatário Oficial:</p>
                            <p className="text-xs font-black text-primary">{adminZelleHolder}</p>
                          </div>

                          <div className="flex items-center gap-2 w-full max-w-xs">
                            <input
                              readOnly
                              value={adminZelleKey}
                              className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-black text-slate-700 flex-1 truncate text-center"
                            />
                            <button
                              type="button"
                              onClick={() => handleCopy(adminZelleKey, 'Chave Zelle')}
                              className="px-3 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl text-xs font-black flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                            >
                              <span className="material-symbols-outlined text-sm">content_copy</span>
                              Copiar
                            </button>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleCopy(adminZelleKey, 'Chave Zelle')}
                          className="w-full bg-accent hover:bg-orange-600 text-white py-3.5 px-4 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-xl shadow-accent/20 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-sm">content_copy</span>
                          Copiar Chave Zelle
                        </button>
                      </div>
                    )}

                    <div className="mt-5 flex items-center justify-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <span className="material-symbols-outlined text-sm text-success">verified_user</span>
                      Isento de taxas bancárias
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SCREEN 2: FIXED PRICE PRODUCT CHECKOUT MODAL                              */}
        {/* ========================================================================= */}
        {activeScreen === 'product' && (
          <div className="space-y-6">
            <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black text-accent uppercase tracking-widest block">Tela 2 / 3</span>
                <h2 className="text-lg font-black text-primary font-heading">Modal de Produto com Preço Fixo ($25.00)</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowProductModal(true)}
                className="px-4 py-2 bg-primary hover:bg-primary/90 text-white font-black text-xs rounded-xl uppercase tracking-wider cursor-pointer"
              >
                Reabrir Modal
              </button>
            </div>

            {/* Product Card Showcase */}
            <div className="bg-white rounded-3xl p-8 border border-primary/5 shadow-xl max-w-sm mx-auto text-center space-y-4">
              <img
                src="https://picsum.photos/seed/tshirt/800/600"
                alt="Camiseta Oficial"
                className="w-full h-56 object-cover rounded-2xl"
              />
              <div className="inline-block bg-accent/10 text-accent font-black text-[10px] px-3 py-1 rounded-full uppercase tracking-widest">
                Produto Solidário
              </div>
              <h3 className="text-xl font-black text-primary font-heading">Camiseta Oficial Bridges</h3>
              <p className="text-xs text-slate-500 font-bold">100% Algodão sustentável. Financia 5 refeições no campo.</p>
              <div className="text-2xl font-black text-primary">$25.00 USD</div>
              <button
                type="button"
                onClick={() => setShowProductModal(true)}
                className="w-full bg-accent hover:bg-orange-600 text-white py-3.5 rounded-xl font-black text-sm uppercase tracking-wider shadow-xl shadow-accent/20 cursor-pointer"
              >
                Comprar / Apoiar ($25.00)
              </button>
            </div>

            {/* MODAL SIMULATION (Using the EXACT InitiativesPage Design & Unified Switch) */}
            <AnimatePresence>
              {showProductModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]"
                  >
                    {/* Modal Header */}
                    <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between shrink-0">
                      <div className="flex items-center gap-3">
                        <img src={logoUrl} alt="Logo" className="h-8 object-contain" />
                        <div>
                          <h4 className="font-black text-primary text-base font-heading">Apoiar Iniciativa</h4>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Preço Fixo: $25.00 USD</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowProductModal(false)}
                        className="size-8 rounded-full bg-slate-200/60 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-lg">close</span>
                      </button>
                    </div>

                    {/* Modal Body */}
                    <div className="p-6 overflow-y-auto space-y-6">
                      {/* Product Preview Card */}
                      <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                        <img
                          src="https://picsum.photos/seed/tshirt/800/600"
                          alt="Thumbnail"
                          className="size-14 rounded-xl object-cover shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h5 className="font-black text-primary text-sm truncate">Camiseta Oficial Bridges</h5>
                          <p className="text-[11px] font-bold text-slate-500 truncate">Impacto: 5 refeições comunitárias</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-base font-black text-primary">$25.00</span>
                        </div>
                      </div>

                      {/* EXACT IDENTICAL SWITCH (CARTÃO | ZELLE) */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                          Forma de Pagamento
                        </label>
                        <div className="grid grid-cols-2 gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/80">
                          <button
                            type="button"
                            onClick={() => setProductMethod('card')}
                            className={`py-2 px-3 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                              productMethod === 'card'
                                ? 'bg-white text-primary shadow-sm'
                                : 'text-slate-500 hover:text-primary'
                            }`}
                          >
                            <span className="material-symbols-outlined text-base">credit_card</span>
                            Cartão
                          </button>

                          <button
                            type="button"
                            onClick={() => setProductMethod('zelle')}
                            className={`py-2 px-3 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                              productMethod === 'zelle'
                                ? 'bg-white text-primary shadow-sm'
                                : 'text-slate-500 hover:text-primary'
                            }`}
                          >
                            <span className="material-symbols-outlined text-base">qr_code_scanner</span>
                            Zelle
                          </button>
                        </div>
                      </div>

                      {/* PRODUCT CARD METHOD */}
                      {productMethod === 'card' && (
                        <div className="space-y-4">
                          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                            <span className="material-symbols-outlined text-accent text-2xl">lock</span>
                            <p className="text-xs font-bold text-slate-600">
                              Pagamento seguro com cartão via Stripe. Total: <strong>$25.00 USD</strong>.
                            </p>
                          </div>
                          <button
                            type="button"
                            className="w-full bg-accent hover:bg-orange-600 text-white py-4 px-6 rounded-xl font-black text-sm uppercase tracking-wider shadow-xl shadow-accent/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                          >
                            <span>Comprar com Cartão ($25.00)</span>
                            <span className="material-symbols-outlined">east</span>
                          </button>
                        </div>
                      )}

                      {/* PRODUCT ZELLE VIEW */}
                      {productMethod === 'zelle' && (
                        <div className="space-y-4 text-center">
                          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center">
                            {productQrUrl ? (
                              <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-200/80 inline-block mb-2">
                                <img src={productQrUrl} alt="Zelle Product QR" className="size-40 object-contain" />
                              </div>
                            ) : null}
                            <p className="text-xs font-bold text-slate-700">
                              Transferir exatamente: <strong className="text-primary font-black">$25.00 USD</strong>
                            </p>
                            <span className="text-[11px] text-slate-500 font-medium mt-1">
                              No memo do banco, digite: <strong className="text-primary">Camiseta Oficial</strong>
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleCopy(adminZelleKey, 'Chave Zelle')}
                            className="w-full py-4 bg-accent hover:bg-orange-600 text-white font-black text-xs rounded-xl shadow-xl shadow-accent/30 flex items-center justify-center gap-2 uppercase tracking-wider transition-all cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-sm">content_copy</span>
                            Copiar Chave Zelle ({adminZelleKey})
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Modal Footer */}
                    <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
                      <p className="text-[11px] font-bold text-slate-400">
                        Após transferir, guarde seu comprovante para a retirada ou entrega do produto.
                      </p>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SCREEN 3: ADMIN PANEL - PAYMENT KEYS MANAGEMENT                           */}
        {/* ========================================================================= */}
        {activeScreen === 'admin' && (
          <div className="space-y-6">
            <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black text-accent uppercase tracking-widest block">Tela 3 / 3</span>
                <h2 className="text-lg font-black text-primary font-heading">Painel de Administração: Aba Chave Zelle</h2>
              </div>
              <span className="text-xs font-bold text-slate-500">Edite a chave para recalcular o QR Code em tempo real</span>
            </div>

            {/* Admin Console Container */}
            <div className="bg-white rounded-3xl border border-primary/5 shadow-xl p-6 sm:p-8 space-y-8">
              {/* Tabs Bar Header (Identical to AdminPage.tsx) */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
                <div>
                  <h3 className="text-2xl font-black text-primary font-heading">Configurações de Pagamento Zelle</h3>
                  <p className="text-xs text-slate-500 font-bold mt-1">
                    Cadastre a chave Zelle oficial e o sistema gerará automaticamente o QR Code oficial nos fluxos de doação.
                  </p>
                </div>

                {/* Simulated Admin Tabs */}
                <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100 rounded-2xl w-full md:w-auto">
                  <span className="px-4 py-2 rounded-xl font-black text-xs uppercase tracking-wider text-slate-500">
                    Missões
                  </span>
                  <span className="px-4 py-2 rounded-xl font-black text-xs uppercase tracking-wider text-slate-500">
                    Iniciativas
                  </span>
                  <span className="px-4 py-2 rounded-xl font-black text-xs uppercase tracking-wider text-slate-500">
                    Apoios
                  </span>
                  <span className="px-4 py-2 rounded-xl font-black text-xs uppercase tracking-wider bg-white shadow-sm text-primary">
                    Chave Zelle
                  </span>
                  <span className="px-4 py-2 rounded-xl font-black text-xs uppercase tracking-wider text-slate-500">
                    Segurança
                  </span>
                </div>
              </div>

              {/* Zelle Configuration Card */}
              <div className="max-w-2xl mx-auto p-6 sm:p-8 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-2xl bg-primary text-white flex items-center justify-center font-black">
                      <span className="material-symbols-outlined">qr_code_scanner</span>
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-primary font-heading">Configuração Zelle</h4>
                      <p className="text-xs text-slate-500 font-bold">Transferência bancária direta (EUA)</p>
                    </div>
                  </div>
                  
                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-[10px] font-black uppercase text-slate-400">Ativo</span>
                    <input
                      type="checkbox"
                      checked={adminZelleEnabled}
                      onChange={(e) => setAdminZelleEnabled(e.target.checked)}
                      className="size-5 accent-accent cursor-pointer"
                    />
                  </label>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                      Chave Zelle (E-mail ou Telefone da ONG)
                    </label>
                    <input
                      type="text"
                      value={adminZelleKey}
                      onChange={(e) => setAdminZelleKey(e.target.value)}
                      placeholder="ex: donate@buildingbridgesbrusa.org"
                      className="w-full bg-white border-2 border-slate-200 focus:border-accent rounded-xl py-3.5 px-4 outline-none font-bold text-sm text-slate-800 transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                      Nome do Titular da Conta (Account Holder)
                    </label>
                    <input
                      type="text"
                      value={adminZelleHolder}
                      onChange={(e) => setAdminZelleHolder(e.target.value)}
                      placeholder="ex: Building Bridges Foundation Inc."
                      className="w-full bg-white border-2 border-slate-200 focus:border-accent rounded-xl py-3.5 px-4 outline-none font-bold text-sm text-slate-800 transition-all"
                    />
                  </div>
                </div>

                {/* Live Dynamic QR Code Preview Box */}
                <div className="p-4 bg-white rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row items-center gap-4">
                  <div className="p-2 bg-slate-50 rounded-xl border border-slate-100 shrink-0">
                    {adminZelleQrUrl && (
                      <img src={adminZelleQrUrl} alt="Zelle Live Preview" className="size-32 object-contain" />
                    )}
                  </div>
                  <div className="space-y-2 text-center sm:text-left flex-1">
                    <span className="text-[10px] font-black text-success uppercase tracking-widest flex items-center justify-center sm:justify-start gap-1">
                      <span className="material-symbols-outlined text-xs">sync</span>
                      QR Code Gerado em Tempo Real
                    </span>
                    <p className="text-xs font-bold text-slate-600">
                      Renderizado na cor primária institucional (#0a3161).
                    </p>
                    <button
                      type="button"
                      onClick={() => handleCopy(adminZelleKey, 'Chave Zelle')}
                      className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-xs font-black inline-flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm">content_copy</span>
                      Testar Cópia
                    </button>
                  </div>
                </div>
              </div>

              {/* Save Button (Official Building Bridges Accent Button) */}
              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleCopy('Configurações salvas!', 'Sucesso')}
                  className="bg-accent hover:bg-orange-600 text-white font-black py-4 px-8 rounded-xl shadow-xl shadow-accent/30 transition-all flex items-center gap-2 uppercase tracking-wider text-sm cursor-pointer"
                >
                  <span className="material-symbols-outlined">save</span>
                  Salvar Configurações de Pagamento
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
