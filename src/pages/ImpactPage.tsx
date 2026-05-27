import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';
import { useCurrency } from '../contexts/CurrencyContext';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import logoUrl from '../assets/logo_building_bridges.png';
import { SEO } from '../components/SEO';

export const ImpactPage: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { currency, formatAmount, rate } = useCurrency();
  const [activeTab, setActiveTab] = useState<'story' | 'budget' | 'updates'>('story');
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Modal & Checkout State
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [customDonation, setCustomDonation] = useState<string>('');
  const [donationTier, setDonationTier] = useState<'tier1' | 'tier2' | 'tier3' | 'custom'>('tier1');
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

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = 'https://picsum.photos/seed/mission-fallback/1200/800';
  };

  // Helper to calculate tier values based on currency
  const getContributionValues = () => {
    const t1 = currency === 'BRL' ? Math.round(25 * rate) : 25;
    const t2 = currency === 'BRL' ? Math.round(50 * rate) : 50;
    const t3 = currency === 'BRL' ? Math.round(100 * rate) : 100;
    return { t1, t2, t3 };
  };

  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true);
      try {
        if (!id) {
          // Fallback for general impact page or default to first project
          setProject({
            name: t('missions.amazon.title'),
            image_url: "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?q=80&w=2070&auto=format&fit=crop",
            long_description: "In the heart of the Xingu Basin, traditional ways of life are under threat from both climate change and rapid deforestation. Our mission is two-fold: restoring 500 hectares of native canopy and providing climate-resilient, sustainable housing for 45 indigenous families.",
            budget_json: [
              { label: "Construction", percent: 60 },
              { label: "Reforestation", percent: 25 },
              { label: "Training", percent: 10 },
              { label: "Logistics", percent: 5 }
            ],
            goal_amount: 300000,
            raised_amount: 273000
          });
          setLoading(false);
          return;
        }

        const { data, error } = await supabase.from('projects').select('*').eq('id', id).single();
        
        if (error && !error.message?.includes('Failed to fetch')) {
          console.error('Error fetching project:', error);
        }
        
        if (data) {
          setProject(data);
        } else {
          // Fallback logic
          setProject({
            name: t('missions.amazon.title'),
            image_url: "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?q=80&w=2070&auto=format&fit=crop",
            long_description: "In the heart of the Xingu Basin, traditional ways of life are under threat from both climate change and rapid deforestation. Our mission is two-fold: restoring 500 hectares of native canopy and providing climate-resilient, sustainable housing for 45 indigenous families.",
            budget_json: [
              { label: "Construction", percent: 60 },
              { label: "Reforestation", percent: 25 },
              { label: "Training", percent: 10 },
              { label: "Logistics", percent: 5 }
            ],
            goal_amount: 300000,
            raised_amount: 273000
          });
        }
      } catch (err) {
        if (!(err instanceof TypeError && err.message === 'Failed to fetch')) {
          console.error('Unexpected error fetching project:', err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProject();

    // 2. Detect redirect return query parameters from Stripe or Mercado Pago
    const query = new URLSearchParams(window.location.search);
    const success = query.get('success');
    const gateway = query.get('gateway');
    const sessionId = query.get('session_id'); // Stripe
    const paymentId = query.get('payment_id'); // Mercado Pago payment_id
    const returnProjId = query.get('proj_id');

    if (success === 'true' && gateway && returnProjId === id) {
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
          
          // Re-fetch project details dynamically to show updated progress immediately
          const { data: updatedProj } = await supabase.from('projects').select('*').eq('id', id).single();
          if (updatedProj) setProject(updatedProj);
        } catch (err: any) {
          console.error('[VERIFICATION ERROR]', err);
          setVerificationError(err.message || 'Houve uma falha ao conciliar o seu apoio. Por favor, contate o administrador.');
        } finally {
          setVerificationLoading(false);
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      };

      verifyPayment();
    }
  }, [id, t]);

  const handleSupportClick = (tier: 'tier1' | 'tier2' | 'tier3' | 'custom') => {
    setDonationTier(tier);
    setCheckoutStep('tier');
    setCustomDonation('');
    setSupporterName('');
    setSupporterEmail('');
    setSupporterPhone('');
    setAdditionalNotes('');
    setCheckoutError('');
    setShowSupportModal(true);
  };

  const handleCompleteDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;
    
    // If we're at step 1, transition to step 2 (contact details)
    if (checkoutStep === 'tier') {
      setCheckoutStep('contact');
      return;
    }

    // Process actual Stripe/Mercado Pago session redirect
    setSubmittingCheckout(true);
    setCheckoutError('');

    try {
      const { t1, t2, t3 } = getContributionValues();
      let finalAmount = t1;
      
      if (donationTier === 'tier2') finalAmount = t2;
      if (donationTier === 'tier3') finalAmount = t3;
      if (donationTier === 'custom') finalAmount = parseFloat(customDonation) || t1;

      const response = await fetch('/api/checkout/create-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          project_id: project.id,
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

  if (loading) return <div className="p-20 text-center font-bold text-slate-500">{t('projects.loading')}</div>;
  if (!project) return <div className="p-20 text-center font-bold text-red-500">{t('impact.notfound')}</div>;

  const progress = project.goal_amount ? Math.min((project.raised_amount / project.goal_amount) * 100, 100) : 0;
  const { t1, t2, t3 } = getContributionValues();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <SEO 
        titleKey={project ? undefined : "impact"}
        descriptionKey={project ? undefined : "impact"}
        fallbackTitle={project ? `${project.name} | Impact | Building Bridges` : undefined}
        fallbackDescription={project ? project.description : undefined}
        image={project ? project.image_url : undefined}
      />
      <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <Link className="hover:text-primary" to="/">{t('nav.home')}</Link>
        <span className="material-symbols-outlined text-xs">chevron_right</span>
        <Link className="hover:text-primary" to="/projects">{t('nav.missions')}</Link>
        <span className="material-symbols-outlined text-xs">chevron_right</span>
        <span className="text-slate-900 dark:text-slate-200 font-medium">{project.name}</span>
      </nav>

      <div className="relative w-full aspect-[16/10] sm:aspect-[21/9] lg:aspect-[16/6] rounded-xl overflow-hidden mb-10 shadow-2xl group">
        <img 
          alt={project.name} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
          src={project.image_url || 'https://picsum.photos/seed/charity-hero/1200/800'} 
          referrerPolicy="no-referrer" 
          onError={handleImageError}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent flex flex-col justify-end p-8 lg:p-12">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-green-500 text-white text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded">{t('missions.active')}</span>
            <span className="bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded">Brazil & USA</span>
          </div>
          <h1 className="text-3xl lg:text-5xl font-black text-white leading-tight max-w-3xl">{project.name}</h1>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        <div className="flex-1 lg:w-[70%]">
          <div className="flex border-b border-slate-200 dark:border-slate-800 mb-8 sticky top-16 bg-slate-50 dark:bg-slate-950 z-40 py-2 overflow-x-auto">
            <button 
              onClick={() => setActiveTab('story')}
              className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'story' ? 'border-primary text-slate-900 dark:text-primary' : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'}`}
            >
              <span className="material-symbols-outlined text-lg">menu_book</span> {t('impact.story')}
            </button>
            <button 
              onClick={() => setActiveTab('budget')}
              className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'budget' ? 'border-primary text-slate-900 dark:text-primary' : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'}`}
            >
              <span className="material-symbols-outlined text-lg">pie_chart</span> {t('impact.budget')}
            </button>
            <button 
              onClick={() => setActiveTab('updates')}
              className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'updates' ? 'border-primary text-slate-900 dark:text-primary' : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'}`}
            >
              <span className="material-symbols-outlined text-lg">bolt</span> {t('transparency.liveFeed')}
            </button>
          </div>

          <article className="prose prose-slate max-w-none dark:prose-invert">
            {activeTab === 'story' && (
              <div className="space-y-6">
                <p className="text-base sm:text-lg md:text-xl leading-relaxed text-slate-700 dark:text-slate-300 font-normal md:font-light">
                  {project.long_description || project.description}
                </p>
                {!id && (
                  <div className="grid grid-cols-2 gap-4 my-8">
                    <div className="rounded-xl overflow-hidden aspect-video">
                      <img 
                        alt="Planting" 
                        src="https://picsum.photos/seed/growth/800/600" 
                        referrerPolicy="no-referrer" 
                      />
                    </div>
                    <div className="rounded-xl overflow-hidden aspect-video">
                      <img 
                        alt="Housing" 
                        src="https://picsum.photos/seed/community/800/600" 
                        referrerPolicy="no-referrer" 
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
            {activeTab === 'budget' && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold">Budget Breakdown</h3>
                <p>100% of your donation goes directly to the field. Here is how we allocate funds for this project:</p>
                <ul className="list-disc pl-6 space-y-4">
                  {project.budget_json ? (
                    (typeof project.budget_json === 'string' ? JSON.parse(project.budget_json) : project.budget_json).map((item: any, index: number) => (
                      <li key={index}>
                        <strong>{item.percent}%</strong> - {item.label}
                      </li>
                    ))
                  ) : (
                    <>
                      <li><strong>60%</strong> - Materials and construction for indigenous housing</li>
                      <li><strong>25%</strong> - Seedlings and reforestation labor</li>
                      <li><strong>10%</strong> - Local community training and support</li>
                      <li><strong>5%</strong> - Logistics and monitoring</li>
                    </>
                  )}
                </ul>
              </div>
            )}
            {activeTab === 'updates' && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold">Latest Updates</h3>
                <div className="border-l-4 border-primary pl-6 py-2">
                  <p className="text-sm font-bold text-primary mb-1">April 2, 2024</p>
                  <p className="font-bold mb-2">First phase completed!</p>
                  <p className="text-sm">We have successfully finished the initial deployment phase. Families are now seeing the immediate impact of your support.</p>
                </div>
              </div>
            )}
          </article>
        </div>

        <div className="lg:w-[30%]">
          <div className="sticky top-24 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 p-8 space-y-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{t('missions.support')}</h3>
                <p className="text-xs text-slate-500 font-bold">Ajude diretamente a financiar essa missão humanitária.</p>
              </div>

              {/* Progress visual */}
              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Progresso Coletivo</span>
                  <span className="text-sm font-black text-success">{progress.toFixed(0)}%</span>
                </div>
                <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div style={{ width: `${progress}%` }} className="h-full bg-success rounded-full transition-all duration-1000" />
                </div>
                <div className="flex justify-between text-xs font-bold pt-1">
                  <span className="text-slate-800 dark:text-slate-200">{formatAmount(project.raised_amount)}</span>
                  <span className="text-slate-400">Meta: {formatAmount(project.goal_amount)}</span>
                </div>
              </div>

              {/* Tier options */}
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => handleSupportClick('tier1')}
                  className="py-3.5 px-4 rounded-xl border-2 border-slate-100 hover:border-success text-sm font-black text-slate-700 dark:text-slate-200 transition-colors bg-slate-50/50 hover:bg-success/5 flex flex-col items-center gap-0.5"
                >
                  <span className="text-success">{currency === 'BRL' ? 'R$' : '$'}{t1}</span>
                  <span className="text-[9px] text-slate-400 uppercase font-black tracking-wider">Apoio Essencial</span>
                </button>
                <button 
                  onClick={() => handleSupportClick('tier2')}
                  className="py-3.5 px-4 rounded-xl border-2 border-slate-100 hover:border-success text-sm font-black text-slate-700 dark:text-slate-200 transition-colors bg-slate-50/50 hover:bg-success/5 flex flex-col items-center gap-0.5"
                >
                  <span className="text-success">{currency === 'BRL' ? 'R$' : '$'}{t2}</span>
                  <span className="text-[9px] text-slate-400 uppercase font-black tracking-wider">Apoio Estendido</span>
                </button>
                <button 
                  onClick={() => handleSupportClick('tier3')}
                  className="py-3.5 px-4 rounded-xl border-2 border-slate-100 hover:border-success text-sm font-black text-slate-700 dark:text-slate-200 transition-colors bg-slate-50/50 hover:bg-success/5 flex flex-col items-center gap-0.5"
                >
                  <span className="text-success">{currency === 'BRL' ? 'R$' : '$'}{t3}</span>
                  <span className="text-[9px] text-slate-400 uppercase font-black tracking-wider">Apoio Máximo</span>
                </button>
                <button 
                  onClick={() => handleSupportClick('custom')}
                  className="py-3.5 px-4 rounded-xl border-2 border-slate-100 hover:border-success text-sm font-black text-slate-700 dark:text-slate-200 transition-colors bg-slate-50/50 hover:bg-success/5 flex flex-col items-center justify-center"
                >
                  <span className="text-slate-500 uppercase tracking-widest text-[10px] font-black">{t('donation.other')}</span>
                </button>
              </div>

              <button 
                onClick={() => handleSupportClick('tier2')}
                className="w-full bg-primary hover:bg-primary/95 text-white py-4.5 rounded-xl font-black text-sm shadow-xl shadow-primary/10 transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">volunteer_activism</span>
                Apoiar Missão Urgente
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Verification Overlay */}
      {verificationLoading && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex flex-col items-center justify-center text-white">
          <div className="size-16 border-4 border-success border-t-transparent rounded-full animate-spin mb-6"></div>
          <h3 className="text-2xl font-black uppercase tracking-widest">{t('projects.loading') || 'Processando...'}</h3>
          <p className="text-slate-400 mt-2 font-medium">Validando a sua contribuição com o gateway de apoio seguro...</p>
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

      {/* Digital Receipt Modal (Fidelity Printable Document) */}
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
              {/* Printing Global Styles Injected on the fly */}
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
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Notas de Logística</p>
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
                    Imprimir Comprovante
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

      {/* Support Mission Modal (Stripe / Mercado Pago Step Checkout) */}
      <AnimatePresence>
        {showSupportModal && project && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSupportModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[32px] border border-slate-100 shadow-2xl p-8 max-h-[90vh] overflow-y-auto z-50"
            >
              {/* Close Button */}
              <button 
                onClick={() => setShowSupportModal(false)}
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
                        Apoiar Missão Urgentemente
                      </span>
                      <h3 className="text-2xl font-black text-primary leading-tight">{project.name}</h3>
                    </div>

                    <div className="bg-accent/5 border border-accent/15 rounded-2xl p-5 text-center">
                      <p className="text-[10px] font-black text-accent uppercase tracking-widest mb-1">Moeda e Destinação</p>
                      <p className="text-xs font-bold text-primary">
                        Seu apoio será processado em **{currency === 'BRL' ? 'Reais (BRL)' : 'Dólares (USD)'}** com destinação imediata à reconstrução local.
                      </p>
                    </div>

                    {/* Pre-defined Tiers */}
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Selecione o valor do apoio</label>
                      <div className="grid grid-cols-3 gap-3">
                        <button 
                          type="button"
                          onClick={() => setDonationTier('tier1')}
                          className={`py-4 rounded-2xl border-2 font-black text-sm transition-all ${
                            donationTier === 'tier1' ? 'border-accent bg-accent/5 text-accent' : 'border-slate-100 hover:border-slate-200 text-slate-600 bg-slate-50/50'
                          }`}
                        >
                          {currency === 'BRL' ? 'R$' : '$'}{t1}
                        </button>
                        <button 
                          type="button"
                          onClick={() => setDonationTier('tier2')}
                          className={`py-4 rounded-2xl border-2 font-black text-sm transition-all ${
                            donationTier === 'tier2' ? 'border-accent bg-accent/5 text-accent' : 'border-slate-100 hover:border-slate-200 text-slate-600 bg-slate-50/50'
                          }`}
                        >
                          {currency === 'BRL' ? 'R$' : '$'}{t2}
                        </button>
                        <button 
                          type="button"
                          onClick={() => setDonationTier('tier3')}
                          className={`py-4 rounded-2xl border-2 font-black text-sm transition-all ${
                            donationTier === 'tier3' ? 'border-accent bg-accent/5 text-accent' : 'border-slate-100 hover:border-slate-200 text-slate-600 bg-slate-50/50'
                          }`}
                        >
                          {currency === 'BRL' ? 'R$' : '$'}{t3}
                        </button>
                      </div>
                    </div>

                    {/* Custom input */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          id="customCheck" 
                          checked={donationTier === 'custom'}
                          onChange={() => setDonationTier(donationTier === 'custom' ? 'tier2' : 'custom')}
                          className="size-4 border-slate-200 rounded text-accent focus:ring-accent"
                        />
                        <label htmlFor="customCheck" className="text-xs font-bold text-slate-600 cursor-pointer">Definir outro valor voluntário</label>
                      </div>

                      {donationTier === 'custom' && (
                        <div className="relative">
                          <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-lg text-slate-400">
                            {currency === 'BRL' ? 'R$' : 'US$'}
                          </span>
                          <input 
                            required
                            type="number"
                            min="5"
                            placeholder="Valor personalizado"
                            value={customDonation}
                            onChange={(e) => setCustomDonation(e.target.value)}
                            className="w-full bg-slate-50 border-2 border-transparent focus:border-accent focus:bg-white rounded-2xl py-4.5 pl-14 pr-6 outline-none font-black text-slate-800 text-lg shadow-inner"
                          />
                        </div>
                      )}
                    </div>

                    <button 
                      type="submit"
                      className="w-full py-4.5 rounded-2xl bg-primary text-white font-black text-sm hover:bg-primary/95 transition-all flex items-center justify-center gap-2 shadow-xl"
                    >
                      Prosseguir para Detalhes
                      <span className="material-symbols-outlined text-lg">arrow_forward</span>
                    </button>
                  </div>
                ) : (
                  // --- STEP 2: CONTACT DETAILS ---
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
                      <button 
                        type="button" 
                        onClick={() => setCheckoutStep('tier')}
                        className="size-8 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-full flex items-center justify-center transition-colors"
                      >
                        <span className="material-symbols-outlined text-lg">arrow_back</span>
                      </button>
                      <div>
                        <h4 className="font-black text-primary text-sm uppercase">Identificação e Contato</h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Para conciliação fiscal e envio do comprovante</p>
                      </div>
                    </div>

                    {checkoutError && (
                      <div className="bg-red-50 text-red-600 border border-red-100 rounded-xl p-4 text-xs font-bold leading-relaxed">
                        ⚠️ {checkoutError}
                      </div>
                    )}

                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome Completo</label>
                        <input 
                          required
                          type="text"
                          value={supporterName}
                          onChange={(e) => setSupporterName(e.target.value)}
                          placeholder="Maria Souza"
                          className="w-full bg-slate-50 border-2 border-transparent focus:border-accent focus:bg-white rounded-xl py-4 px-6 outline-none font-bold text-slate-800"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">E-mail</label>
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
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mensagem de Apoio (Opcional)</label>
                        <textarea 
                          rows={2}
                          value={additionalNotes}
                          onChange={(e) => setAdditionalNotes(e.target.value)}
                          placeholder="Ex: Força aos voluntários locais, estamos juntos nessa reconstrução."
                          className="w-full bg-slate-50 border-2 border-transparent focus:border-accent focus:bg-white rounded-xl py-3 px-6 outline-none font-bold text-slate-800 resize-none animate-none"
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

                    <button 
                      type="submit"
                      disabled={submittingCheckout}
                      className="w-full py-4.5 rounded-2xl bg-accent text-white font-black text-sm hover:bg-orange-600 transition-all flex items-center justify-center gap-2 shadow-xl shadow-accent/20"
                    >
                      {submittingCheckout ? (
                        <>
                          <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Iniciando Gateway...
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-lg">credit_score</span>
                          Redirecionar para Pagamento Seguro
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
    </div>
  );
};
