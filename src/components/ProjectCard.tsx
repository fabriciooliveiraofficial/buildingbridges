import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

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

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 p-6 flex flex-col">
      <h3 className="text-xl font-bold text-slate-900 mb-2">{project.name}</h3>
      <p className="text-slate-600 text-sm mb-6 line-clamp-2">{project.description}</p>
      <div className="mt-auto">
        <Link to={`/impact/${project.id}`} className="w-full bg-primary text-white py-3 rounded-full text-sm font-bold hover:bg-slate-800 transition-colors shadow-sm text-center block">
          {t('missions.support')}
        </Link>
      </div>
    </div>
  );
};
