import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCurrency } from '../contexts/CurrencyContext';

interface Project {
  id: string;
  name: string;
  description: string;
  goal_amount: number;
  raised_amount: number;
  status: string;
}

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const { t } = useTranslation();
  const { formatAmount } = useCurrency();
  const progress = (project.raised_amount / project.goal_amount) * 100;

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 p-6 flex flex-col">
      <h3 className="text-xl font-bold text-slate-900 mb-2">{project.name}</h3>
      <p className="text-slate-600 text-sm mb-6 line-clamp-2">{project.description}</p>
      <div className="mt-auto">
        <div className="flex justify-between items-end mb-2">
          <span className="text-sm font-bold text-slate-900">{formatAmount(project.raised_amount)} <span className="text-slate-500 font-normal">{t('missions.raised')}</span></span>
          <span className="text-sm font-bold text-emerald-600">{progress.toFixed(0)}%</span>
        </div>
        <div className="w-full bg-slate-100 h-2.5 rounded-full mb-6 overflow-hidden">
          <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${Math.min(progress, 100)}%` }}></div>
        </div>
        <Link to={`/impact/${project.id}`} className="w-full bg-primary text-white py-3 rounded-full text-sm font-bold hover:bg-slate-800 transition-colors shadow-sm text-center block">
          {t('missions.support')}
        </Link>
      </div>
    </div>
  );
};
