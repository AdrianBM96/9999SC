import React from 'react';
import { Campaign } from '../../../types/campaign';

interface CampaignOverviewProps {
  campaign: Campaign;
}

export function CampaignOverview({ campaign }: CampaignOverviewProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Información general</h3>
        <dl className="grid grid-cols-2 gap-4">
          <div>
            <dt className="text-sm font-medium text-gray-500">Nombre</dt>
            <dd className="mt-1 text-sm text-gray-900">{campaign.name}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Estado</dt>
            <dd className="mt-1">
              <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                campaign.status === 'active'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {campaign.status === 'active' ? 'Activa' : 'Pausada'}
              </span>
            </dd>
          </div>
        </dl>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Métricas</h3>
        <div className="grid grid-cols-4 gap-4">
          <div>
            <dt className="text-sm font-medium text-gray-500">Candidatos</dt>
            <dd className="mt-1 text-2xl font-semibold text-gray-900">
              {campaign.candidates.length}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Formularios enviados</dt>
            <dd className="mt-1 text-2xl font-semibold text-gray-900">
              {campaign.candidates.filter(c => c.formSubmitted).length}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Entrevistas agendadas</dt>
            <dd className="mt-1 text-2xl font-semibold text-gray-900">
              {campaign.candidates.filter(c => c.status === 'interview_scheduled').length}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Seleccionados</dt>
            <dd className="mt-1 text-2xl font-semibold text-gray-900">
              {campaign.candidates.filter(c => c.status === 'selected').length}
            </dd>
          </div>
        </div>
      </div>
    </div>
  );
}
