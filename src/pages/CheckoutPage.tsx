import React, { useState, useEffect } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useCurrency } from '../contexts/CurrencyContext';
import { motion, AnimatePresence } from 'motion/react';
import logoUrl from '../assets/logo_building_bridges.png';
import { SEO } from '../components/SEO';

export const CheckoutPage: React.FC = () => {
  const { t } = useTranslation();
  const { currency, formatAmount, rate } = useCurrency();
  
  // Checkout & Gateway state
  const [selectedCurrency, setSelectedCurrency] = useState<'USD' | 'BRL'>(currency as 'USD' | 'BRL' || 'USD');
  const [selectedProject, setSelectedProject] = useState<string>('rio-grande');
  const [projectsList, setProjectsList] = useState<any[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  
  // Supporter Info Form
  const [supporterName, setSupporterName] = useState('');
  const [supporterEmail, setSupporterEmail] = useState('');
  const [supporterPhone, setSupporterPhone] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  
  // Donation Amount Selection
  const [donationTier, setDonationTier] = useState<'tier1' | 'tier2' | 'tier3' | 'custom'>('tier2');
  const [customDonation, setCustomDonation] = useState<string>('');
  
  // Process and verification loaders
  const [submittingCheckout, setSubmittingCheckout] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [verificationError, setVerificationError] = useState('');
  const [verifiedContribution, setVerifiedContribution] = useState<any | null>(null);
  const [verifiedInitiativeTitle, setVerifiedInitiativeTitle] = useState('');
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  // Sync selected currency with global context if it changes initially
  useEffect(() => {
    if (currency) {
      setSelectedCurrency(currency as 'USD' | 'BRL');
    }
  }, [currency]);

  // Dynamic quick tier amounts based on currency
  const getContributionValues = () => {
    if (selectedCurrency === 'BRL') {
      return { t1: 50, t2: 100, t3: 250, t4: 500 };
    }
    return { t1: 25, t2: 50, t3: 100, t4: 250 };
  };

  const { t1, t2, t3, t4 } = getContributionValues();

  // Get currently selected amount
  const getFinalAmount = () => {
    if (donationTier === 'tier1') return t1;
    if (donationTier === 'tier2') return t2;
    if (donationTier === 'tier3') return t3;
    if (donationTier === 'custom') return parseFloat(customDonation) || t1;
    return t2;
  };

  // Fetch active projects to populate selection
  useEffect(() => {
    const fetchProjects = async () => {
      setProjectsLoading(true);
      try {
        const response = await fetch('/api/projects');
        if (response.ok) {
          const data = await response.json();
          setProjectsList(data);
          if (data.length > 0) {
            setSelectedProject(data[0].id);
          }
        }
      } catch (err) {
        console.error('Error fetching projects for checkout:', err);
      } finally {
        setProjectsLoading(false);
      }
    };
    fetchProjects();

    // Reconcile returning query string parameters (Post-checkout redirections)
    const query = new URLSearchParams(window.location.search);
    const success = query.get('success');
    const gateway = query.get('gateway');
    const sessionId = query.get('session_id'); // Stripe
    const paymentId = query.get('payment_id'); // Mercado Pago

    if (success === 'true' && gateway) {
      const verifyPayment = async () => {
        setVerificationLoading(true);
        setVerificationError('');
        try {
          const payload: any = { gateway };
          if (gateway === 'stripe') {
            payload.session_id = sessionId;
          } else if (gateway === 'mercadopago') {
            payload.payment_id = paymentId;
          }

          const response = await fetch('/api/checkout/verify-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });

          const data = await response.json();
          if (!response.ok) {
            throw new Error(data.error || 'Erro ao validar contribuição.');
          }

          setVerifiedContribution(data.contribution);
          setVerifiedInitiativeTitle(data.initiativeTitle || 'Donation Fund');
          setShowReceiptModal(true);
        } catch (err: any) {
          console.error('[VERIFICATION ERROR]', err);
          setVerificationError(err.message || 'Houve uma falha ao conciliar o seu apoio. Por favor, contate o administrador.');
        } finally {
          setVerificationLoading(false);
          // Clear query params so refresh doesn't trigger verification again
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      };

      verifyPayment();
    }
  }, []);

  // Form submission: Create checkout session
  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingCheckout(true);
    setCheckoutError('');

    try {
      const amount = getFinalAmount();
      
      const response = await fetch('/api/checkout/create-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          project_id: selectedProject,
          amount: amount,
          currency: selectedCurrency,
          name: supporterName,
          email: supporterEmail,
          phone: supporterPhone,
          notes: additionalNotes
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Não foi possível gerar a sessão de checkout.');
      }

      // Redirect visitor to hosted Stripe (USD) or Mercado Pago (BRL)
      console.log(`[CHECKOUT REDIRECT] URL: ${data.redirectUrl}`);
      window.location.href = data.redirectUrl;
    } catch (err: any) {
      console.error(err);
      setCheckoutError(err.message || 'Erro ao iniciar checkout.');
      setSubmittingCheckout(false);
    }
  };

  // Dynamic calculation of impact based on amount
  const getDynamicImpactText = (val: number) => {
    const isBrl = selectedCurrency === 'BRL';
    const amountInBrl = isBrl ? val : Math.round(val * rate);
    
    // R$5 provides approx 1 warm meal
    const meals = Math.round(amountInBrl / 5);
    // R$50 provides a community seedling or school pack
    const kits = Math.round(amountInBrl / 50);

    if (meals < 10) {
      return `Com este valor voluntário, forneceremos aproximadamente ${meals} refeições quentes completas para famílias afetadas.`;
    }
    
    return `Essa doação fornecerá aproximadamente ${meals} refeições nutritivas completas ou ${kits} kits de emergência e mudas nativas ecológicas nas zonas de impacto afetadas.`;
  };

  const finalAmount = getFinalAmount();
  const selectedProjDetails = projectsList.find(p => p.id === selectedProject);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <SEO 
        fallbackTitle="Doe Agora | Apoio Seguro | Building Bridges" 
        fallbackDescription="Contribua com nossas ações humanitárias em tempo real. Apoio seguro processado por Stripe (USD) e Mercado Pago (BRL)."
      />

      <div className="mb-10 text-center">
        <nav className="flex justify-center items-center gap-2 text-sm text-slate-500 mb-4">
          <Link className="hover:text-primary" to="/">{t('nav.home')}</Link>
          <span className="material-symbols-outlined text-xs">chevron_right</span>
          <span className="font-semibold text-primary dark:text-slate-200">Doe Agora</span>
        </nav>
        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Portal de Apoio Solidário</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400 font-bold text-sm">Sua contribuição direta chega integralmente às famílias necessitadas.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Checkout Form */}
        <form onSubmit={handleCheckoutSubmit} className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 p-8 space-y-8">
          
          {/* Step 1: Currency & Target Mission */}
          <div className="space-y-4">
            <h3 className="text-lg font-black text-primary uppercase tracking-tight flex items-center gap-2">
              <span className="bg-primary/10 text-primary size-7 rounded-lg flex items-center justify-center text-xs">1</span>
              Destino e Moeda
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Select Project */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Humanitarian Mission</label>
                {projectsLoading ? (
                  <div className="h-14 bg-slate-100 animate-pulse rounded-xl" />
                ) : (
                  <select 
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-accent focus:bg-white rounded-xl py-3 px-4 outline-none font-bold text-slate-800 appearance-none transition-all cursor-pointer"
                  >
                    {projectsList.length > 0 ? (
                      projectsList.map(proj => (
                        <option key={proj.id} value={proj.id}>{proj.name}</option>
                      ))
                    ) : (
                      <>
                        <option value="rio-grande">Rio Grande do Sul Relief</option>
                        <option value="gulf-coast">Gulf Coast Resilience</option>
                        <option value="amazon-basin">Amazon Basin Canopy Restoration</option>
                      </>
                    )}
                  </select>
                )}
              </div>

              {/* Currency Selector (Dynamic Routing) */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Moeda e Gateway de Pagamento</label>
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                  <button 
                    type="button"
                    onClick={() => setSelectedCurrency('USD')}
                    className={`flex-1 rounded-lg py-2.5 transition-all flex items-center justify-center gap-3 ${
                      selectedCurrency === 'USD' 
                        ? 'bg-white dark:bg-slate-700 shadow-md text-indigo-600 dark:text-indigo-400 border border-slate-200/50' 
                        : 'text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                    title="USD (Stripe)"
                  >
                    <span className="material-symbols-outlined text-lg">credit_card</span>
                    <span className="flex items-center justify-center bg-slate-50 dark:bg-slate-800 size-6 rounded-full text-xs border border-slate-100 dark:border-slate-900 shadow-sm font-normal">🇺🇸</span>
                  </button>
                  <button 
                    type="button"
                    onClick={() => setSelectedCurrency('BRL')}
                    className={`flex-1 rounded-lg py-2.5 transition-all flex items-center justify-center gap-3 ${
                      selectedCurrency === 'BRL' 
                        ? 'bg-white dark:bg-slate-700 shadow-md text-blue-600 dark:text-blue-400 border border-slate-200/50' 
                        : 'text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                    title="BRL (Mercado Pago)"
                  >
                    <span className="material-symbols-outlined text-lg">qr_code_2</span>
                    <span className="flex items-center justify-center bg-slate-50 dark:bg-slate-800 size-6 rounded-full text-xs border border-slate-100 dark:border-slate-900 shadow-sm font-normal">🇧🇷</span>
                  </button>
                </div>
              </div>
            </div>

            {selectedProjDetails && (
              <p className="text-[11px] text-slate-500 leading-relaxed font-bold bg-slate-50 dark:bg-slate-900 border border-slate-100 p-3.5 rounded-xl mt-1.5">
                ℹ️ <strong>Foco:</strong> {selectedProjDetails.description}
              </p>
            )}
          </div>

          {/* Step 2: Donation Amount */}
          <div className="space-y-4">
            <h3 className="text-lg font-black text-primary uppercase tracking-tight flex items-center gap-2">
              <span className="bg-primary/10 text-primary size-7 rounded-lg flex items-center justify-center text-xs">2</span>
              Valor da Contribuição
            </h3>

            {/* Predefined Tiers */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button 
                type="button" 
                onClick={() => setDonationTier('tier1')}
                className={`py-4 rounded-xl border-2 font-black text-sm transition-all flex flex-col items-center gap-0.5 ${
                  donationTier === 'tier1' ? 'border-accent bg-accent/5 text-accent' : 'border-slate-100 hover:border-slate-200 text-slate-600 bg-slate-50/50'
                }`}
              >
                <span>{selectedCurrency === 'BRL' ? 'R$' : '$'}{t1}</span>
                <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Apoio Básico</span>
              </button>
              <button 
                type="button" 
                onClick={() => setDonationTier('tier2')}
                className={`py-4 rounded-xl border-2 font-black text-sm transition-all flex flex-col items-center gap-0.5 ${
                  donationTier === 'tier2' ? 'border-accent bg-accent/5 text-accent' : 'border-slate-100 hover:border-slate-200 text-slate-600 bg-slate-50/50'
                }`}
              >
                <span>{selectedCurrency === 'BRL' ? 'R$' : '$'}{t2}</span>
                <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Apoio Essencial</span>
              </button>
              <button 
                type="button" 
                onClick={() => setDonationTier('tier3')}
                className={`py-4 rounded-xl border-2 font-black text-sm transition-all flex flex-col items-center gap-0.5 ${
                  donationTier === 'tier3' ? 'border-accent bg-accent/5 text-accent' : 'border-slate-100 hover:border-slate-200 text-slate-600 bg-slate-50/50'
                }`}
              >
                <span>{selectedCurrency === 'BRL' ? 'R$' : '$'}{t3}</span>
                <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Apoio Ampliado</span>
              </button>
              <button 
                type="button" 
                onClick={() => setDonationTier('custom')}
                className={`py-4 rounded-xl border-2 font-black text-sm transition-all flex flex-col items-center justify-center ${
                  donationTier === 'custom' ? 'border-accent bg-accent/5 text-accent' : 'border-slate-100 hover:border-slate-200 text-slate-600 bg-slate-50/50'
                }`}
              >
                <span>Outro Valor</span>
              </button>
            </div>

            {/* Custom Input */}
            {donationTier === 'custom' && (
              <div className="relative">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-lg text-slate-400">
                  {selectedCurrency === 'BRL' ? 'R$' : 'US$'}
                </span>
                <input 
                  required
                  type="number"
                  min="5"
                  placeholder="Valor personalizado"
                  value={customDonation}
                  onChange={(e) => setCustomDonation(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-accent focus:bg-white rounded-2xl py-4 pl-14 pr-6 outline-none font-black text-slate-800 text-lg shadow-inner"
                />
              </div>
            )}
          </div>

          {/* Step 3: Supporter Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-black text-primary uppercase tracking-tight flex items-center gap-2">
              <span className="bg-primary/10 text-primary size-7 rounded-lg flex items-center justify-center text-xs">3</span>
              Dados do Apoiador
            </h3>

            {checkoutError && (
              <div className="bg-red-50 text-red-600 border border-red-100 rounded-xl p-4 text-xs font-bold leading-relaxed">
                ⚠️ {checkoutError}
              </div>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome Completo</label>
                  <input 
                    required
                    type="text"
                    value={supporterName}
                    onChange={(e) => setSupporterName(e.target.value)}
                    placeholder="Nome completo do doador"
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-accent focus:bg-white rounded-xl py-3 px-4 outline-none font-bold text-slate-800 transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">E-mail</label>
                  <input 
                    required
                    type="email"
                    value={supporterEmail}
                    onChange={(e) => setSupporterEmail(e.target.value)}
                    placeholder="email@exemplo.com"
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-accent focus:bg-white rounded-xl py-3 px-4 outline-none font-bold text-slate-800 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">WhatsApp / Telefone</label>
                  <input 
                    required
                    type="tel"
                    value={supporterPhone}
                    onChange={(e) => setSupporterPhone(e.target.value)}
                    placeholder="+55 11 99999-9999"
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-accent focus:bg-white rounded-xl py-3 px-4 outline-none font-bold text-slate-800 transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Notas Opcionais</label>
                  <input 
                    type="text"
                    value={additionalNotes}
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                    placeholder="Escreva uma mensagem de força"
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-accent focus:bg-white rounded-xl py-3 px-4 outline-none font-bold text-slate-800 transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Secure Submit Button */}
          <div className="pt-2">
            <button 
              type="submit"
              disabled={submittingCheckout}
              className="w-full py-4.5 rounded-2xl bg-accent text-white font-black text-sm hover:bg-orange-600 transition-all flex items-center justify-center gap-2 shadow-xl shadow-accent/20 cursor-pointer"
            >
              {submittingCheckout ? (
                <>
                  <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Iniciando Checkout Seguro...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-lg">credit_score</span>
                  REDIRECIONAR PARA PAGAMENTO SEGURO
                </>
              )}
            </button>
          </div>

          <div className="bg-success/5 border border-success/15 rounded-2xl p-4 text-center flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-success text-lg">shield_with_heart</span>
            <span className="text-[10px] font-black text-success uppercase tracking-widest">
              Conexão criptografada de alta segurança homologada ({selectedCurrency === 'BRL' ? 'Mercado Pago' : 'Stripe'})
            </span>
          </div>

        </form>

        {/* Right Side: Impact Summary Panel */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
            <h4 className="text-md font-black text-slate-800 dark:text-white uppercase tracking-wider">Resumo do Apoio</h4>
            
            <div className="border-t border-b border-slate-100 py-4 space-y-3">
              <div className="flex justify-between text-xs font-bold text-slate-500">
                <span>Missão Apoiada</span>
                <span className="text-slate-800 font-extrabold max-w-[150px] truncate">
                  {selectedProjDetails ? selectedProjDetails.name : 'Outras Ações'}
                </span>
              </div>
              <div className="flex justify-between text-xs font-bold text-slate-500">
                <span>Moeda de Doação</span>
                <span className="text-slate-800 font-extrabold uppercase">{selectedCurrency}</span>
              </div>
              <div className="flex justify-between items-baseline pt-2">
                <span className="text-xs font-bold text-slate-500">Total Previsto</span>
                <span className="text-2xl font-black text-success">
                  {selectedCurrency === 'BRL' ? 'R$' : '$'} {finalAmount.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Interactive Dynamic Indicator */}
            <div className="bg-primary/5 dark:bg-primary/20 rounded-2xl p-5 border border-primary/10 flex gap-3">
              <div className="bg-primary text-white p-2 rounded-xl h-10 w-10 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-xl">volunteer_activism</span>
              </div>
              <div className="space-y-1">
                <h5 className="font-black text-primary text-xs uppercase tracking-tight">Seu Impacto Estimado</h5>
                <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed font-bold">
                  {getDynamicImpactText(finalAmount)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Verification Loader */}
      {verificationLoading && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex flex-col items-center justify-center text-white">
          <div className="size-16 border-4 border-success border-t-transparent rounded-full animate-spin mb-6"></div>
          <h3 className="text-2xl font-black uppercase tracking-widest">Processando...</h3>
          <p className="text-slate-400 mt-2 font-medium">Conciliando a sua contribuição com os servidores seguros...</p>
        </div>
      )}

      {/* Verification Error Modal */}
      {verificationError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setVerificationError('')} />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-md bg-white rounded-3xl p-8 text-center border border-red-500/20 shadow-2xl z-50"
          >
            <div className="size-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-4xl">error</span>
            </div>
            <h3 className="text-2xl font-black text-primary mb-2">Falha na Validação</h3>
            <p className="text-slate-500 font-bold text-sm leading-relaxed mb-6">
              {verificationError}
            </p>
            <button 
              onClick={() => setVerificationError('')}
              className="px-6 py-3 bg-primary hover:bg-slate-800 text-white font-black text-sm rounded-xl transition-all"
            >
              Fechar
            </button>
          </motion.div>
        </div>
      )}

      {/* Digital Receipt Modal (Printable Document) */}
      <AnimatePresence>
        {showReceiptModal && verifiedContribution && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowReceiptModal(false)}
              className="absolute inset-0 bg-slate-950/75 backdrop-blur-sm print-hidden"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="relative w-full max-w-xl bg-white rounded-[32px] border border-slate-100 shadow-2xl p-8 lg:p-10 my-8 z-50 print:border-0 print:shadow-none print:my-0 print:p-0"
            >
              <style dangerouslySetInnerHTML={{__html: `
                @media print {
                  body * {
                    visibility: hidden;
                  }
                  #printable-receipt-modal, #printable-receipt-modal * {
                    visibility: visible;
                  }
                  #printable-receipt-modal {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100%;
                    padding: 0;
                    margin: 0;
                    border: none !important;
                    box-shadow: none !important;
                  }
                  .print-hidden {
                    display: none !important;
                  }
                }
              `}} />

              {/* Close Button */}
              <button 
                onClick={() => setShowReceiptModal(false)}
                className="absolute top-6 right-6 size-10 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-full flex items-center justify-center transition-colors print-hidden"
              >
                <span className="material-symbols-outlined">close</span>
              </button>

              {/* Receipt Content */}
              <div id="printable-receipt-modal" className="space-y-8 print:p-8">
                <div className="text-center pb-6 border-b-2 border-dashed border-slate-200">
                  <img src={logoUrl} alt="Building Bridges Logo" className="h-16 w-auto mx-auto mb-4 object-contain print-hidden" />
                  <h3 className="text-2xl font-black text-primary uppercase tracking-tight">Building Bridges</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Recibo de Apoio Humanitário</p>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Missão Apoiada</p>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300 line-clamp-1 max-w-[200px]">{verifiedInitiativeTitle}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-success uppercase tracking-widest mb-0.5">Valor Pago</p>
                      <p className="text-2xl font-black text-success">
                        {verifiedContribution.currency === 'BRL' ? 'R$' : '$'} {parseFloat(verifiedContribution.pledge_amount).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-400 uppercase tracking-widest">Apoiador</span>
                      <span className="text-primary">{verifiedContribution.supporter_name}</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-400 uppercase tracking-widest">E-mail</span>
                      <span className="text-primary">{verifiedContribution.supporter_email}</span>
                    </div>
                    {verifiedContribution.supporter_phone && (
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-400 uppercase tracking-widest">WhatsApp</span>
                        <span className="text-primary">{verifiedContribution.supporter_phone}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-400 uppercase tracking-widest">Gateway</span>
                      <span className="text-primary uppercase">{verifiedContribution.gateway}</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-400 uppercase tracking-widest">Transação</span>
                      <span className="text-primary truncate max-w-[180px]" title={verifiedContribution.transaction_reference}>
                        {verifiedContribution.transaction_reference}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-400 uppercase tracking-widest">Data</span>
                      <span className="text-primary">{new Date(verifiedContribution.created_at).toLocaleString()}</span>
                    </div>

                    {verifiedContribution.additional_notes && (
                      <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Notas de Apoio</p>
                        <p className="text-xs text-slate-700 dark:text-slate-300 font-bold leading-relaxed">
                          {verifiedContribution.additional_notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-success/5 border border-success/15 rounded-2xl p-5 text-center">
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    Este documento comprova o recebimento eletrônico de suporte financeiro voluntário integralmente destinado às ações de desenvolvimento e auxílio humanitário da ONG **Building Bridges** na missão supracitada.
                  </p>
                </div>

                <div className="flex gap-4 pt-4 border-t-2 border-dashed border-slate-200 print-hidden">
                  <button 
                    type="button"
                    onClick={() => window.print()}
                    className="flex-1 py-4 bg-accent hover:bg-orange-600 text-white rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-accent/20 transition-all"
                  >
                    <span className="material-symbols-outlined text-lg">print</span>
                    Imprimir Recibo
                  </button>
                  <button 
                    type="button"
                    onClick={() => setShowReceiptModal(false)}
                    className="px-6 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-black text-sm transition-all"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
};
