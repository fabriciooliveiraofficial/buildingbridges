import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';
import { useCurrency } from '../contexts/CurrencyContext';
import { supabase } from '../lib/supabase';

export const ImpactPage: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { currency, formatAmount, rate } = useCurrency();
  const [activeTab, setActiveTab] = useState<'story' | 'budget' | 'updates'>('story');
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = 'https://picsum.photos/seed/mission-fallback/1200/800';
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
            ]
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
          // Mock data logic for specific IDs if needed or generic fallback
          setProject({
            name: t('missions.amazon.title'),
            image_url: "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?q=80&w=2070&auto=format&fit=crop",
            long_description: "In the heart of the Xingu Basin, traditional ways of life are under threat from both climate change and rapid deforestation. Our mission is two-fold: restoring 500 hectares of native canopy and providing climate-resilient, sustainable housing for 45 indigenous families.",
            budget_json: [
              { label: "Construction", percent: 60 },
              { label: "Reforestation", percent: 25 },
              { label: "Training", percent: 10 },
              { label: "Logistics", percent: 5 }
            ]
          });
        }
      } catch (err) {
        // Silencing network errors to avoid console spam when dev credentials aren't fully set up
        if (!(err instanceof TypeError && err.message === 'Failed to fetch')) {
          console.error('Unexpected error fetching project:', err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id, t]);

  if (loading) return <div className="p-20 text-center font-bold text-slate-500">{t('projects.loading')}</div>;
  if (!project) return <div className="p-20 text-center font-bold text-red-500">{t('impact.notfound')}</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
              className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'updates' ? 'border-primary text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-900'}`}
            >
              <span className="material-symbols-outlined text-lg">bolt</span> {t('transparency.liveFeed')}
            </button>
          </div>

          <article className="prose prose-slate max-w-none">
            {activeTab === 'story' && (
              <div className="space-y-6">
                <p className="text-base sm:text-lg md:text-xl leading-relaxed text-slate-700 font-normal md:font-light">
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
                    project.budget_json.map((item: any, index: number) => (
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
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 p-8">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">{t('missions.support')}</h3>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {['25', '50', '100'].map((amount) => (
                  <button 
                    key={amount}
                    className="py-3 px-4 rounded-xl border-2 border-slate-200 dark:border-slate-800 text-sm font-bold hover:border-primary transition-colors text-slate-700 dark:text-slate-300"
                  >
                    {currency === 'BRL' ? `R$${Math.round(parseInt(amount) * rate)}` : `$${amount}`}
                  </button>
                ))}
                <button className="py-3 px-4 rounded-xl border-2 border-slate-200 dark:border-slate-800 text-sm font-bold hover:border-primary transition-colors text-slate-700 dark:text-slate-300">{t('donation.other')}</button>
              </div>
              <Link to="/checkout" className="w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-xl font-black text-lg shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 mb-6">
                <span className="material-symbols-outlined">volunteer_activism</span>
                {t('nav.donate')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
