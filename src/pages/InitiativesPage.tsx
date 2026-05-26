import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { useCurrency } from '../contexts/CurrencyContext';

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
  
  // Modal State
  const [selectedInitiative, setSelectedInitiative] = useState<Initiative | null>(null);
  const [customDonation, setCustomDonation] = useState<string>('');
  const [donationTier, setDonationTier] = useState<'suggested' | 'amplified' | 'double' | 'custom'>('suggested');
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch initiatives from our transparent MySQL adapter
        const { data: initData, error: initError } = await supabase.from('initiatives').select('*');
        if (initError) console.error('Error fetching initiatives:', initError);
        
        // Fetch projects to map project_id to project names
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
    setCheckoutSuccess(false);
  };

  const handleCompleteDonation = () => {
    if (!selectedInitiative) return;
    
    // Simulate updating the database (raised_amount)
    let addedAmount = selectedInitiative.suggested_price;
    const { min, amplified, double } = getContributionValues(selectedInitiative.suggested_price);
    
    if (donationTier === 'amplified') addedAmount = amplified;
    if (donationTier === 'double') addedAmount = double;
    if (donationTier === 'custom') addedAmount = parseFloat(customDonation) || min;

    setInitiatives(prev => prev.map(item => {
      if (item.id === selectedInitiative.id) {
        return { ...item, raised_amount: item.raised_amount + addedAmount };
      }
      return item;
    }));

    setCheckoutSuccess(true);
  };

  if (loading) return <div className="p-20 text-center font-bold text-xl text-slate-500">{t('projects.loading')}</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-16">
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
            return (
              <motion.div 
                layout
                key={item.id}
                className="group bg-white rounded-3xl overflow-hidden border border-slate-100 hover:shadow-2xl transition-all duration-300 flex flex-col h-full"
              >
                {/* Visual Header */}
                <div className="relative h-64 overflow-hidden shrink-0">
                  <img 
                    src={item.image_url} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                    alt={item.title} 
                  />
                  <div className="absolute top-6 left-6 flex flex-col gap-2">
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

      {/* Solidarity Modal (Checkout Decoupling) */}
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

              {!checkoutSuccess ? (
                <div className="space-y-6">
                  {/* Modal Header */}
                  <div>
                    <span className="text-[10px] font-black text-accent uppercase tracking-widest mb-1.5 block">
                      Apoiar com {selectedInitiative.type === 'item' ? 'Símbolo' : 'Atividade'}
                    </span>
                    <h3 className="text-2xl font-black text-primary leading-tight">{selectedInitiative.title}</h3>
                  </div>

                  {/* Impact Summary Frame */}
                  <div className="bg-accent/5 border border-accent/15 rounded-2xl p-5 text-center">
                    <p className="text-[10px] font-black text-accent uppercase tracking-widest mb-1">Seu Impacto Garantido com essa Escolha</p>
                    <p className="text-base font-bold text-primary">{selectedInitiative.impact_description}</p>
                  </div>

                  {/* Price Psychology Framework Tiers */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Escolha seu Nível de Contribuição</label>
                    <div className="grid grid-cols-1 gap-3">
                      {/* Suggested Min Tier */}
                      <button 
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
                        type="number"
                        value={customDonation}
                        onChange={(e) => setCustomDonation(e.target.value)}
                        placeholder={`Mínimo de ${formatAmount(selectedInitiative.suggested_price)}`}
                        className="w-full bg-slate-50 border-2 border-transparent focus:border-accent focus:bg-white rounded-xl py-4 pl-12 pr-6 outline-none font-bold text-slate-800"
                      />
                    </motion.div>
                  )}

                  {/* Trust Calibration Note */}
                  <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">
                    <span className="material-symbols-outlined text-sm text-success">verified_user</span>
                    Financiando diretamente: {projects[selectedInitiative.project_id] || 'Geral'}
                  </div>

                  {/* Action Button */}
                  <button 
                    onClick={handleCompleteDonation}
                    className="w-full py-5 rounded-2xl bg-accent hover:bg-orange-600 text-white font-black text-lg transition-all shadow-xl shadow-accent/20 flex items-center justify-center gap-3"
                  >
                    <span>Proceder com a Contribuição</span>
                    <span className="material-symbols-outlined">chevron_right</span>
                  </button>
                </div>
              ) : (
                // Success State (Foco na celebração e benevolência!)
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8 space-y-6"
                >
                  <div className="size-20 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto mb-2 border border-success/20">
                    <span className="material-symbols-outlined text-4xl">check_circle</span>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-3xl font-black text-primary">Iniciativa Apoiada!</h3>
                    <p className="text-slate-500 font-bold text-sm sm:text-base leading-relaxed px-4">
                      Muito obrigado por sua aliança! Seu apoio foi registrado com sucesso. Sua contribuição já foi destinada e ajudará diretamente a transformar vidas em vulnerabilidade.
                    </p>
                  </div>

                  <div className="bg-success/5 border border-success/15 rounded-2xl p-5 mx-4">
                    <p className="text-[10px] font-black text-success uppercase tracking-widest mb-1">Status de Entrega / Inscrição</p>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed">
                      {selectedInitiative.type === 'item' 
                        ? 'Você receberá os dados de retirada ou envio no seu e-mail cadastrado em até 24 horas.' 
                        : 'Sua inscrição solidária está confirmada! As informações sobre horários e local foram enviadas para seu e-mail.'}
                    </p>
                  </div>

                  <button 
                    onClick={() => setSelectedInitiative(null)}
                    className="px-8 py-4 rounded-xl bg-primary hover:bg-primary/95 text-white font-black text-sm shadow-md"
                  >
                    Fechar Hub
                  </button>
                </motion.div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
