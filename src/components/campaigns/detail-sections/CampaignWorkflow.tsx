import React from 'react';
import { Campaign } from '../../../types/campaign';
import { AlertCircle } from 'lucide-react';

interface CampaignWorkflowProps {
  campaign: Campaign;
}

export function CampaignWorkflow({ campaign }: CampaignWorkflowProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Flujo de trabajo</h3>
        <div className="space-y-4">
          {campaign.steps.map((step, index) => (
            <div
              key={step.id}
              className="flex items-start p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-blue-600">{index + 1}</span>
              </div>
              <div className="ml-4 flex-1">
                <h4 className="text-sm font-medium text-gray-900">
                  {step.type === 'linkedin_connect' && 'Conexión + Mensaje de Bienvenida'}
                  {step.type === 'linkedin_message' && 'Mensaje de LinkedIn'}
                  {step.type === 'linkedin_reminder' && 'Recordatorio'}
                  {step.type === 'form_submission' && 'Envío de formulario'}
                  {step.type === 'review_required' && 'Revisión requerida'}
                  {step.type === 'schedule_interview' && 'Agendar entrevista'}
                  {step.type === 'send_rejection' && 'Enviar rechazo'}
                  {step.type === 'send_selection' && 'Enviar selección'}
                </h4>
                {step.requiresReview && (
                  <div className="mt-2 flex items-start bg-yellow-50 p-3 rounded-md">
                    <AlertCircle className="h-5 w-5 text-yellow-400 mt-0.5 mr-2" />
                    <div className="text-sm text-yellow-700">
                      Este paso requiere revisión manual.
                      {step.conditions && step.conditions.length > 0 && (
                        <ul className="mt-2 list-disc list-inside">
                          {step.conditions.map((condition, i) => (
                            <li key={i}>
                              Si el candidato es "{condition.status}", se ejecutará: {condition.action.type}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
