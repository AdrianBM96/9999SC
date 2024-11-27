import React from 'react';
import { Campaign } from '../../../types/campaign';
import { Users, FileCheck, Calendar, CheckCircle } from 'lucide-react';

interface CampaignMetricsProps {
  campaign: Campaign;
}

export function CampaignMetrics({ campaign }: CampaignMetricsProps) {
  const metrics = [
    {
      name: 'Candidatos',
      value: campaign.candidates ? campaign.candidates.length : 0,
      icon: Users,
      color: 'text-blue-500'
    },
    {
      name: 'Formularios enviados',
      value: campaign.candidates ? campaign.candidates.filter(c => c.formSubmitted).length : 0,
      icon: FileCheck,
      color: 'text-green-500'
    },
    {
      name: 'Entrevistas agendadas',
      value: campaign.candidates ? campaign.candidates.filter(c => c.status === 'interview_scheduled').length : 0,
      icon: Calendar,
      color: 'text-purple-500'
    },
    {
      name: 'Seleccionados',
      value: campaign.candidates ? campaign.candidates.filter(c => c.status === 'selected').length : 0,
      icon: CheckCircle,
      color: 'text-indigo-500'
    }
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Métricas</h3>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <div key={metric.name} className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <metric.icon className={`h-8 w-8 ${metric.color}`} />
              <span className="text-2xl font-semibold text-gray-900">
                {metric.value}
              </span>
            </div>
            <p className="mt-2 text-sm font-medium text-gray-500">
              {metric.name}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

