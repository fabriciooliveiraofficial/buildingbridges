import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { useCurrency } from '../contexts/CurrencyContext';
import logoUrl from '../assets/logo_building_bridges.png';
import { SEO } from '../components/SEO';
import { parseImages } from '../lib/imageUtils';
import { Lightbox } from '../components/Lightbox';

interface Initiative {
  id: string;
  project_id: string;
  title: string;
  type: 'item' | 'experience';
  description: string;
  suggested_price: number;
  impact_description: string;
  image_url: string;
  goal_amount: number;
  raised_amount: number;
  status: string;
  created_by_user: string;
}

interface Project {
  id: string;
  name: string;
}

export const InitiativesPage: React.FC = () => {
  const { t } = useTranslation();
  const { currency, formatAmount, rate } = useCurrency();
  const [initiatives, setInitiatives] = useState<Initiative[]>([]);
  const [projects, setProjects] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'item' | 'experience'>('all');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxTitle, setLightboxTitle] = useState('');
  
  // Modal & Checkout State
  const [selectedInitiative, setSelectedInitiative] = useState<Initiative | null>(null);
  const [customDonation, setCustomDonation] = useState<string>('');
  const [donationTier, setDonationTier] = useState<'suggested' | 'amplified' | 'double' | 'custom'>('suggested');
  const [checkoutStep, setCheckoutStep] = useState<'tier' | 'contact'>('tier');
  
  // Supporter contact info
  const [supporterName, setSupporterName] = useState('');
  const [supporterEmail, setSupporterEmail] = useState('');
  const [supporterPhone, setSupporterPhone] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  
  // Processing loaders
  const [submittingCheckout, setSubmittingCheckout] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  
  // Verification states (Stripe / MP return)
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [verificationError, setVerificationError] = useState('');
  const [verifiedContribution, setVerifiedContribution] = useState<any | null>(null);
  const [verifiedInitiativeTitle, setVerifiedInitiativeTitle] = useState('');
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  useEffect(() => {
    // 1. Fetch initial initiatives & projects data
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: initData, error: initError } = await supabase.from('initiatives').select('*');
        if (initError) console.error('Error fetching initiatives:', initError);
        
        const { data: projData, error: projError } = await supabase.from('projects').select('*');
        if (projError) console.error('Error fetching projects:', projError);

        if (projData) {
          const projMap: Record<string, string> = {};
          projData.forEach((p: Project) => {
            projMap[p.id] = p.name;
          });
          setProjects(projMap);
        }

        if (initData) {
          setInitiatives(initData);
        }
      } catch (err) {
        console.error('Unexpected error fetching initiatives data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // 2. Detect redirect return query parameters from Stripe or Mercado Pago
    const query = new URLSearchParams(window.location.search);
    const success = query.get('success');
    const gateway = query.get('gateway');
    const sessionId = query.get('session_id'); // Stripe
    const paymentId = query.get('payment_id'); // Mercado Pago payment_id

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
          setVerifiedInitiativeTitle(data.initiativeTitle);
          setShowReceiptModal(true);
          
          // Re-fetch initiatives data to show updated progress amounts immediately
          const { data: updatedInit } = await supabase.from('initiatives').select('*');
          if (updatedInit) setInitiatives(updatedInit);
        } catch (err: any) {
          console.error('[VERIFICATION ERROR]', err);
          setVerificationError(err.message || 'Houve uma falha ao conciliar o seu apoio. Por favor, contate o administrador.');
        } finally {
          setVerificationLoading(false);
          // Clean the query parameters from URL so refreshes don't re-trigger verification
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      };

      verifyPayment();
    }
  }, []);

  const filteredInitiatives = initiatives.filter(item => {
    if (filter === 'all') return true;
    return item.type === filter;
  });

  // Calculate prices based on selected donation tier
  const getContributionValues = (suggestedPrice: number) => {
    const min = suggestedPrice;
    const amplified = Math.round(suggestedPrice * 1.5);
    const double = suggestedPrice * 2;
    return { min, amplified, double };
  };

  const handleSupportClick = (initiative: Initiative) => {
    setSelectedInitiative(initiative);
    setDonationTier('suggested');
    setCustomDonation('');
    setCheckoutStep('tier');
    setSupporterName('');
    setSupporterEmail('');
    setSupporterPhone('');
    setAdditionalNotes('');
    setCheckoutError('');
  };

  const handleCompleteDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInitiative) return;
    
    // If we're at step 1, transition to step 2 (contact details)
    if (checkoutStep === 'tier') {
      setCheckoutStep('contact');
      return;
    }

    // Process actual Stripe/Mercado Pago session redirect
    setSubmittingCheckout(true);
    setCheckoutError('');

    try {
      let finalAmount = selectedInitiative.suggested_price;
      const { min, amplified, double } = getContributionValues(selectedInitiative.suggested_price);
      
      if (donationTier === 'amplified') finalAmount = amplified;
      if (donationTier === 'double') finalAmount = double;
      if (donationTier === 'custom') finalAmount = parseFloat(customDonation) || min;

      const response = await fetch('/api/checkout/create-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          initiative_id: selectedInitiative.id,
          amount: finalAmount,
          currency: currency, // global CurrencyContext (USD or BRL)
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

      // Redirect visitor to Stripe or Mercado Pago secure hosted page
      console.log(`[CHECKOUT REDIRECT] URL: ${data.redirectUrl}`);
      window.location.href = data.redirectUrl;
    } catch (err: any) {
      console.error(err);
      setCheckoutError(err.message || 'Erro ao iniciar checkout.');
      setSubmittingCheckout(false);
    }
  };

  if (loading) return <div className="p-20 text-center font-bold text-xl text-slate-500">{t('projects.loading')}</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-16">
      <SEO titleKey="initiatives" descriptionKey="initiatives" />
      {/* Page Header */}
      <div className="max-w-3xl mx-auto text-center mb-16 space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent font-black text-xs uppercase tracking-widest">
          <span className="material-symbols-outlined text-sm">volunteer_activism</span>
          Hub de Ação Coletiva
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-primary leading-tight">
          Apoie com uma <span className="text-accent">Iniciativa Solidária</span>
        </h1>
        <p className="text-slate-500 text-lg md:text-xl font-medium leading-relaxed">
          Nossa rede de voluntários cria produtos físicos e atividades incríveis para financiar as missões. Ao participar ou adquirir, **100% da arrecadação líquida** vai direto para saneamento, alimentação e abrigos no campo.
        </p>
        
        {/* Filters */}
        <div className="flex justify-center gap-3 pt-6">
          <button 
            onClick={() => setFilter('all')}
            className={`px-6 py-3 rounded-full font-black text-sm transition-all border-2 ${
              filter === 'all' 
                ? 'bg-primary text-white border-primary shadow-lg shadow-primary/10' 
                : 'bg-white border-slate-100 hover:border-primary/20 text-slate-600'
            }`}
          >
            Todos
          </button>
          <button 
            onClick={() => setFilter('item')}
            className={`px-6 py-3 rounded-full font-black text-sm transition-all border-2 ${
              filter === 'item' 
                ? 'bg-primary text-white border-primary shadow-lg shadow-primary/10' 
                : 'bg-white border-slate-100 hover:border-primary/20 text-slate-600'
            }`}
          >
            Símbolos de Apoio (Itens)
          </button>
          <button 
            onClick={() => setFilter('experience')}
            className={`px-6 py-3 rounded-full font-black text-sm transition-all border-2 ${
              filter === 'experience' 
                ? 'bg-primary text-white border-primary shadow-lg shadow-primary/10' 
                : 'bg-white border-slate-100 hover:border-primary/20 text-slate-600'
            }`}
          >
            Atividades Coletivas (Experiências)
          </button>
        </div>
      </div>

      {/* Initiatives Grid */}
      {filteredInitiatives.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredInitiatives.map((item) => {
            const progress = Math.min((item.raised_amount / item.goal_amount) * 100, 100);
            const itemImages = parseImages(item.image_url);
            const mainImage = itemImages[0] || 'https://picsum.photos/seed/default-initiative/800/600';
            return (
              <motion.div 
                layout
                key={item.id}
                className="group bg-white rounded-3xl overflow-hidden border border-slate-100 hover:shadow-2xl transition-all duration-300 flex flex-col h-full"
              >
                {/* Visual Header */}
                <div 
                  onClick={() => {
                    setLightboxImages(itemImages.length > 0 ? itemImages : [mainImage]);
                    setLightboxTitle(item.title);
                    setLightboxOpen(true);
                  }}
                  className="relative h-64 overflow-hidden shrink-0 cursor-pointer"
                >
                  <img 
                    src={mainImage} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                    alt={item.title} 
                  />
                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-3xl scale-90 group-hover:scale-100 transition-transform duration-300">photo_library</span>
                  </div>
                  <div className="absolute top-6 left-6 flex flex-col gap-2 z-10">
                    <span className="bg-primary text-white text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-md">
                      {item.type === 'item' ? 'Símbolo de Apoio' : 'Atividade Coletiva'}
                    </span>
                    <span className="bg-white/95 backdrop-blur-sm text-slate-700 text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-md border border-slate-100">
                      🎯 Missão: {projects[item.project_id] || 'Geral'}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-8 flex flex-col flex-grow">
                  <h3 className="text-2xl font-black text-primary mb-3 line-clamp-1">{item.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed mb-6 line-clamp-3 font-medium">
                    {item.description}
                  </p>

                  {/* Impact Tag (Framing de valor) */}
                  <div className="bg-accent/5 rounded-2xl p-4 border border-accent/15 mb-6 text-center shrink-0">
                    <p className="text-[10px] font-black text-accent uppercase tracking-widest mb-1">Impacto Gerado no Campo</p>
                    <p className="text-sm font-bold text-primary">{item.impact_description}</p>
                  </div>

                  {/* Progress & Value (Checkout & Crowdfunding) */}
                  <div className="space-y-4 mt-auto">
                    <div className="flex justify-between items-end shrink-0">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Meta Coletiva</p>
                        <p className="text-sm font-black text-primary">
                          {formatAmount(item.raised_amount)} <span className="text-slate-400">/ {formatAmount(item.goal_amount)}</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Contribuição Sugerida</p>
                        <p className="text-xl font-black text-accent">{formatAmount(item.suggested_price)}</p>
                      </div>
                    </div>

                    <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden shrink-0">
                      <div 
                        style={{ width: `${progress}%` }} 
                        className="h-full bg-accent rounded-full transition-all duration-1000"
                      />
                    </div>

                    <button 
                      onClick={() => handleSupportClick(item)}
                      className="w-full py-4 rounded-xl bg-primary text-white font-black text-sm hover:bg-primary/95 transition-all flex items-center justify-center gap-2 shadow-xl shadow-primary/5"
                    >
                      <span className="material-symbols-outlined text-lg">volunteer_activism</span>
                      {item.type === 'item' ? 'Adquirir e Apoiar' : 'Fazer Inscrição Solidária'}
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="py-20 text-center">
          <span className="material-symbols-outlined text-6xl text-slate-200 mb-4">search_off</span>
          <p className="text-xl font-bold text-slate-400">Nenhuma iniciativa encontrada para esta categoria.</p>
        </div>
      )}

      {/* Fullscreen Verification Overlay */}
      {verificationLoading && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex flex-col items-center justify-center text-white">
          <div className="size-16 border-4 border-accent border-t-transparent rounded-full animate-spin mb-6"></div>
          <h3 className="text-2xl font-black uppercase tracking-widest">{t('projects.loading') || 'Processando...'}</h3>
          <p className="text-slate-400 mt-2 font-medium">Validando o seu pagamento com o gateway seguro de apoio...</p>
        </div>
      )}

      {/* Verification Error Modal */}
      {verificationError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setVerificationError('')} />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-md bg-white rounded-3xl p-8 text-center border border-red-500/20 shadow-2xl"
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

      {/* Solidarity Modal (Checkout Flow) */}
      <AnimatePresence>
        {selectedInitiative && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedInitiative(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-3xl border border-slate-100 shadow-2xl p-8 max-h-[90vh] overflow-y-auto"
            >
              {/* Close Button */}
              <button 
                onClick={() => setSelectedInitiative(null)}
                className="absolute top-6 right-6 size-10 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-full flex items-center justify-center transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>

              <form onSubmit={handleCompleteDonation} className="space-y-6">
                {checkoutStep === 'tier' ? (
                  // --- STEP 1: VALUE TIER SELECTION ---
                  <div className="space-y-6">
                    <div>
                      <span className="text-[10px] font-black text-accent uppercase tracking-widest mb-1.5 block">
                        Apoiar com {selectedInitiative.type === 'item' ? 'Símbolo' : 'Atividade'}
                      </span>
                      <h3 className="text-2xl font-black text-primary leading-tight">{selectedInitiative.title}</h3>
                    </div>

                    {/* Impact Summary Frame */}
                    <div className="bg-accent/5 border border-accent/15 rounded-2xl p-5 text-center">
                      <p className="text-[10px] font-black text-accent uppercase tracking-widest mb-1">Seu Impacto Garantido com essa Escolha</p>
                      <p className="text-sm font-bold text-primary">{selectedInitiative.impact_description}</p>
                    </div>

                    {/* Price Psychology Framework Tiers */}
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Escolha seu Nível de Contribuição</label>
                      <div className="grid grid-cols-1 gap-3">
                        {/* Suggested Min Tier */}
                        <button 
                          type="button"
                          onClick={() => setDonationTier('suggested')}
                          className={`p-4 rounded-xl border-2 text-left flex justify-between items-center transition-all ${
                            donationTier === 'suggested' 
                              ? 'border-accent bg-accent/5' 
                              : 'border-slate-100 hover:border-slate-200 bg-slate-50/50'
                          }`}
                        >
                          <div>
                            <p className="text-sm font-black text-primary">Apoio Recomendado</p>
                            <p className="text-xs text-slate-500 font-bold">Cobre o custo de confecção e doa o valor integral excedente.</p>
                          </div>
                          <span className="text-lg font-black text-primary">{formatAmount(selectedInitiative.suggested_price)}</span>
                        </button>

                        {/* Amplified Tier */}
                        <button 
                          type="button"
                          onClick={() => setDonationTier('amplified')}
                          className={`p-4 rounded-xl border-2 text-left flex justify-between items-center transition-all ${
                            donationTier === 'amplified' 
                              ? 'border-accent bg-accent/5' 
                              : 'border-slate-100 hover:border-slate-200 bg-slate-50/50'
                          }`}
                        >
                          <div>
                            <p className="text-sm font-black text-primary">Apoio Ampliado</p>
                            <p className="text-xs text-slate-500 font-bold">Aumenta o impacto direto com fundos extras.</p>
                          </div>
                          <span className="text-lg font-black text-primary">
                            {formatAmount(getContributionValues(selectedInitiative.suggested_price).amplified)}
                          </span>
                        </button>

                        {/* Double Tier */}
                        <button 
                          type="button"
                          onClick={() => setDonationTier('double')}
                          className={`p-4 rounded-xl border-2 text-left flex justify-between items-center transition-all ${
                            donationTier === 'double' 
                              ? 'border-accent bg-accent/5' 
                              : 'border-slate-100 hover:border-slate-200 bg-slate-50/50'
                          }`}
                        >
                          <div>
                            <p className="text-sm font-black text-primary">Apoio Duplo (Impacto Total)</p>
                            <p className="text-xs text-slate-500 font-bold">Dobra o valor de impacto direto destinado à causa.</p>
                          </div>
                          <span className="text-lg font-black text-primary">
                            {formatAmount(getContributionValues(selectedInitiative.suggested_price).double)}
                          </span>
                        </button>

                        {/* Custom Value */}
                        <button 
                          type="button"
                          onClick={() => setDonationTier('custom')}
                          className={`p-4 rounded-xl border-2 text-left flex justify-between items-center transition-all ${
                            donationTier === 'custom' 
                              ? 'border-accent bg-accent/5' 
                              : 'border-slate-100 hover:border-slate-200 bg-slate-50/50'
                          }`}
                        >
                          <div>
                            <p className="text-sm font-black text-primary">Valor Livre</p>
                            <p className="text-xs text-slate-500 font-bold">Defina você mesmo o montante adicional de doação.</p>
                          </div>
                          <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Outro valor</span>
                        </button>
                      </div>
                    </div>

                    {/* Custom Donation Input */}
                    {donationTier === 'custom' && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="relative"
                      >
                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-black text-lg">
                          {currency === 'BRL' ? 'R$' : '$'}
                        </div>
                        <input 
                          required
                          type="number"
                          value={customDonation}
                          onChange={(e) => setCustomDonation(e.target.value)}
                          placeholder={`Mínimo de ${formatAmount(selectedInitiative.suggested_price)}`}
                          className="w-full bg-slate-50 border-2 border-transparent focus:border-accent focus:bg-white rounded-xl py-4 pl-12 pr-6 outline-none font-bold text-slate-800"
                        />
                      </motion.div>
                    )}

                    {/* Action Button */}
                    <button 
                      type="submit"
                      className="w-full py-5 rounded-2xl bg-primary hover:bg-slate-800 text-white font-black text-lg transition-all shadow-xl shadow-primary/10 flex items-center justify-center gap-3"
                    >
                      <span>Proceder com a Contribuição</span>
                      <span className="material-symbols-outlined">arrow_forward</span>
                    </button>
                  </div>
                ) : (
                  // --- STEP 2: SUPPORTER LOGISTICAL DETAILS ---
                  <div className="space-y-6">
                    <div>
                      <button 
                        type="button"
                        onClick={() => setCheckoutStep('tier')}
                        className="text-xs font-black text-slate-400 uppercase tracking-widest hover:text-accent transition-colors flex items-center gap-1.5 mb-1.5"
                      >
                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                        Voltar à escolha de valor
                      </button>
                      <h3 className="text-2xl font-black text-primary leading-tight">Dados do Apoiador</h3>
                      <p className="text-slate-500 font-medium text-xs mt-1">Preencha as informações para a identificação do seu apoio e coordenação logística.</p>
                    </div>

                    {checkoutError && (
                      <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold rounded-xl flex items-center gap-2">
                        <span className="material-symbols-outlined">error</span>
                        {checkoutError}
                      </div>
                    )}

                    {/* Inputs */}
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome Completo</label>
                        <input 
                          required
                          type="text"
                          value={supporterName}
                          onChange={(e) => setSupporterName(e.target.value)}
                          placeholder="Ex: Maria Souza"
                          className="w-full bg-slate-50 border-2 border-transparent focus:border-accent focus:bg-white rounded-xl py-4 px-6 outline-none font-bold text-slate-800"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Endereço de E-mail</label>
                        <input 
                          required
                          type="email"
                          value={supporterEmail}
                          onChange={(e) => setSupporterEmail(e.target.value)}
                          placeholder="maria@exemplo.com"
                          className="w-full bg-slate-50 border-2 border-transparent focus:border-accent focus:bg-white rounded-xl py-4 px-6 outline-none font-bold text-slate-800"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">WhatsApp / Telefone</label>
                        <input 
                          required
                          type="tel"
                          value={supporterPhone}
                          onChange={(e) => setSupporterPhone(e.target.value)}
                          placeholder="+55 11 99999-9999"
                          className="w-full bg-slate-50 border-2 border-transparent focus:border-accent focus:bg-white rounded-xl py-4 px-6 outline-none font-bold text-slate-800"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                          {selectedInitiative.type === 'item' ? 'Tamanho de Roupa / Detalhes de Envio' : 'Observações Logísticas / Mensagem'}
                        </label>
                        <textarea 
                          rows={2}
                          value={additionalNotes}
                          onChange={(e) => setAdditionalNotes(e.target.value)}
                          placeholder={selectedInitiative.type === 'item' ? 'Ex: Camiseta tamanho G, retirar na igreja' : 'Ex: Irei com minha esposa e filhos.'}
                          className="w-full bg-slate-50 border-2 border-transparent focus:border-accent focus:bg-white rounded-xl py-3 px-6 outline-none font-bold text-slate-800 resize-none"
                        />
                      </div>
                    </div>

                    {/* Trust indicator */}
                    <div className="bg-success/5 border border-success/15 rounded-xl p-4 text-center flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-success text-lg">shield_with_heart</span>
                      <span className="text-[10px] font-black text-success uppercase tracking-widest">
                        Processado em ambiente de segurança homologado ({currency === 'BRL' ? 'Mercado Pago' : 'Stripe'})
                      </span>
                    </div>

                    {/* Action Button */}
                    <button 
                      disabled={submittingCheckout}
                      type="submit"
                      className="w-full py-5 rounded-2xl bg-accent hover:bg-orange-600 text-white font-black text-lg transition-all shadow-xl shadow-accent/20 flex items-center justify-center gap-3 disabled:opacity-60"
                    >
                      {submittingCheckout ? (
                        <>
                          <div className="size-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Encaminhando...</span>
                        </>
                      ) : (
                        <>
                          <span>Ir para Pagamento Seguro</span>
                          <span className="material-symbols-outlined">payments</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- PREMIUM DIGITAL RECEIPT MODAL (Comprovante Solidário) --- */}
      <AnimatePresence>
        {showReceiptModal && verifiedContribution && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 print-window-container">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowReceiptModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm print:hidden"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-white rounded-3xl border border-slate-100 shadow-2xl p-8 max-h-[90vh] overflow-y-auto print:absolute print:inset-0 print:shadow-none print:border-none print:w-full print:max-w-none print:max-h-none print:p-0 print:overflow-visible"
            >
              {/* Printable Style Block injection for perfect margin formatting */}
              <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                  body * {
                    visibility: hidden;
                  }
                  .print-window-container, .print-window-container * {
                    visibility: visible;
                  }
                  .print-window-container {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100%;
                    padding: 0;
                    margin: 0;
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

              {/* Receipt Frame (Visual Estilo Cheque/Recibo de Alta Fidelidade) */}
              <div className="space-y-8 print:p-8">
                {/* Header Logo */}
                <div className="text-center pb-6 border-b-2 border-dashed border-slate-200">
                  <img src={logoUrl} alt="Building Bridges Logo" className="h-16 w-auto mx-auto mb-4 object-contain" />
                  <h3 className="text-2xl font-black text-primary uppercase tracking-tight">Building Bridges</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Recibo de Apoio Humanitário</p>
                </div>

                {/* Contribution details */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Apoio Consumado</p>
                      <p className="text-xs font-bold text-slate-700 line-clamp-1 max-w-[200px]">{verifiedInitiativeTitle}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-success uppercase tracking-widest mb-0.5">Valor Pago</p>
                      <p className="text-2xl font-black text-success">
                        {verifiedContribution.currency === 'BRL' ? 'R$' : '$'} {parseFloat(verifiedContribution.pledge_amount).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Metadata Table */}
                  <div className="space-y-3 pt-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-400 uppercase tracking-widest">Apoiador</span>
                      <span className="text-primary">{verifiedContribution.supporter_name}</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-400 uppercase tracking-widest">E-mail</span>
                      <span className="text-primary">{verifiedContribution.supporter_email}</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-400 uppercase tracking-widest">Telefone</span>
                      <span className="text-primary">{verifiedContribution.supporter_phone}</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-400 uppercase tracking-widest">Gateway</span>
                      <span className="text-primary uppercase">{verifiedContribution.gateway}</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-400 uppercase tracking-widest">Transação</span>
                      <span className="text-primary truncate max-w-[150px]" title={verifiedContribution.transaction_reference}>
                        {verifiedContribution.transaction_reference}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-400 uppercase tracking-widest">Data</span>
                      <span className="text-primary">{new Date(verifiedContribution.created_at).toLocaleString()}</span>
                    </div>

                    {verifiedContribution.additional_notes && (
                      <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Notas de Logística</p>
                        <p className="text-xs text-slate-700 dark:text-slate-300 font-bold leading-relaxed">
                          {verifiedContribution.additional_notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Institutional Footer */}
                <div className="bg-success/5 border border-success/15 rounded-2xl p-5 text-center">
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    Este documento comprova o recebimento eletrônico de suporte financeiro voluntário integralmente destinado às ações de saneamento, alimentação e desenvolvimento em comunidades vulneráveis assistidas pela ONG **Building Bridges**.
                  </p>
                </div>

                {/* Print/Download Button */}
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

      <Lightbox 
        images={lightboxImages} 
        isOpen={lightboxOpen} 
        onClose={() => setLightboxOpen(false)} 
        title={lightboxTitle} 
      />
    </div>
  );
};
