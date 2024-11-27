import React from 'react';
import { Campaign, CandidateStatus } from '../../../../types/campaign';
import { PieChart, Users, Building, GraduationCap, Briefcase } from 'lucide-react';

interface CandidateDistributionProps {
  campaign: Campaign;
}

const statusGroups = [
  {
    title: 'Por fuente',
    icon: PieChart,
    categories: [
      { key: 'linkedin', label: 'LinkedIn', icon: Users },
      { key: 'direct', label: 'Aplicación directa', icon: Building },
      { key: 'referral', label: 'Referidos', icon: Users },
    ]
  },
  {
    title: 'Por experiencia',
    icon: Briefcase,
    categories: [
      { key: 'junior', label: 'Junior (0-2 años)' },
      { key: 'mid', label: 'Mid (2-5 años)' },
      { key: 'senior', label: 'Senior (5+ años)' },
    ]
  },
  {
    title: 'Por educación',
    icon: GraduationCap,
    categories: [
      { key: 'bachelor', label: 'Grado' },
      { key: 'master', label: 'Máster' },
      { key: 'phd', label: 'Doctorado' },
    ]
  }
];

export function CandidateDistribution({ campaign }: CandidateDistributionProps) {
  const getCandidateCount = (category: string) => {
    return campaign.candidates?.filter(c => c.metadata?.[category])?.length || 0;
  };

  const getPercentage = (count: number) => {
    return campaign.candidates?.length > 0
      ? Math.round((count / campaign.candidates.length) * 100)
      : 0;
  };

  if (!campaign.candidates?.length) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Distribución de candidatos
        </h3>
        <p className="text-sm text-gray-500">No hay candidatos en esta campaña todavía.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">
        Distribución de candidatos
      </h3>

      <div className="space-y-8">
        {statusGroups.map(group => (
          <div key={group.title} className="space-y-4">
            <div className="flex items-center text-sm font-medium text-gray-700">
              <group.icon className="w-4 h-4 mr-2" />
              {group.title}
            </div>

            <div className="space-y-3">
              {group.categories.map(category => {
                const count = getCandidateCount(category.key);
                const percentage = getPercentage(count);

                return (
                  <div key={category.key} className="flex items-center">
                    {category.icon && (
                      <category.icon className="w-4 h-4 text-gray-400 mr-2" />
                    )}
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">{category.label}</span>
                        <span className="text-gray-900 font-medium">
                          {count} ({percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

