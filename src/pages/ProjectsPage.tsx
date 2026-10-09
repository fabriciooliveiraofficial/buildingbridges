import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { ProjectCard } from '../components/ProjectCard';
import { useTranslation } from 'react-i18next';
import { SEO } from '../components/SEO';

export const ProjectsPage: React.FC = () => {
  const { t } = useTranslation();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchProjects = async (pageNum: number, isInitial = false) => {
    if (isInitial) setLoading(true);
    else setLoadingMore(true);
    
    try {
      const response = await fetch(`/api/projects?page=${pageNum}&limit=9`);
      if (!response.ok) throw new Error('Failed to fetch projects');
      const data = await response.json();
      
      // Fallback data if API is empty or fails
      const fallbackProjects = [
        {
          id: 'rio-grande',
          name: t('missions.rio.title'),
          description: t('missions.rio.desc'),
          goal_amount: 500000,
          raised_amount: 375000,
          status: 'active'
        },
        {
          id: 'gulf-coast',
          name: t('missions.gulf.title'),
          description: t('missions.gulf.desc'),
          goal_amount: 750000,
          raised_amount: 315000,
          status: 'active'
        },
        {
          id: 'amazon-basin',
          name: t('missions.amazon.title'),
          description: t('missions.amazon.desc'),
          goal_amount: 300000,
          raised_amount: 273000,
          status: 'active'
        }
      ];

      if (data && data.projects && data.projects.length > 0) {
        if (isInitial) {
          setProjects(data.projects);
        } else {
          setProjects(prev => [...prev, ...data.projects]);
        }
        setHasMore(data.meta.hasMore);
      } else if (isInitial) {
        setProjects(fallbackProjects);
        setHasMore(false);
      }
    } catch (err) {
      if (!(err instanceof TypeError && err.message === 'Failed to fetch')) {
        console.error('Unexpected error fetching projects:', err);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchProjects(1, true);
  }, [t]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchProjects(nextPage, false);
  };

  const filteredProjects = projects.filter(project => {
    if (statusFilter === 'all') return true;
    return project.status === statusFilter;
  });

  if (loading) return <div className="p-20 text-center font-bold text-xl">{t('projects.loading')}</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
      <SEO titleKey="projects" descriptionKey="projects" />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-primary mb-2">{t('projects.title')}</h1>
          <p className="text-slate-500 font-medium text-sm md:text-base">{t('projects.subtitle')}</p>
        </div>
        
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">{t('projects.filter')}:</span>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border-2 border-slate-100 rounded-xl px-4 py-2 font-bold text-slate-700 outline-none focus:border-primary transition-all cursor-pointer"
          >
            <option value="all">{t('projects.all')}</option>
            <option value="active">{t('projects.active')}</option>
            <option value="completed">{t('projects.completed')}</option>
            <option value="archive">{t('projects.archive')}</option>
          </select>
        </div>
      </div>

      {filteredProjects.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
          {hasMore && (
            <div className="mt-12 text-center">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="bg-primary hover:bg-primary/90 text-white font-bold py-3 px-8 rounded-full transition-colors disabled:opacity-50"
              >
                {loadingMore ? t('projects.loading') : t('common.loadMore', 'Ver Mais')}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="py-20 text-center">
          <span className="material-symbols-outlined text-6xl text-slate-200 mb-4">search_off</span>
          <p className="text-xl font-bold text-slate-400">{t('projects.notfound')}</p>
        </div>
      )}
    </div>
  );
};
