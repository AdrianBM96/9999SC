import React, { useState } from 'react';
import { X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { CampaignStep } from '../../../types/campaign';
import { StepEditorModal } from './step-editors/StepEditorModal';

interface AddStepModalProps {
  onClose: () => void;
  onAdd: (step: CampaignStep) => void;
  stepCategories: {
    title: string;
    description: string;
    types: string[];
  }[];
}

export function AddStepModal({ onClose, onAdd, stepCategories }: AddStepModalProps) {
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const handleStepSave = (step: CampaignStep) => {
    onAdd(step);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Añadir paso al proceso
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Selecciona el tipo de paso que deseas añadir a tu proceso de reclutamiento
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-8">
            {stepCategories.map((category) => (
              <div key={category.title} className="space-y-4">
                <div>
                  <h4 className="text-base font-medium text-gray-900">{category.title}</h4>
                  <p className="mt-1 text-sm text-gray-500">{category.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {category.types.map((type) => (
                    <button
                      key={type}
                      onClick={() => setSelectedType(type)}
                      className="p-4 border rounded-lg hover:border-blue-500 hover:bg-blue-50 text-left transition-colors"
                    >
                      <div className="font-medium text-gray-900">
                        {stepTypeLabels[type as keyof typeof stepTypeLabels]}
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        {getStepDescription(type)}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedType && (
        <StepEditorModal
          step={{
            id: uuidv4(),
            type: selectedType as CampaignStepType,
            order: 0,
            name: '',
            config: {}
          }}
          onClose={() => setSelectedType(null)}
          onSave={handleStepSave}
        />
      )}
    </div>
  );
}

const stepTypeLabels = {
  linkedin_connect: 'Conexión + Mensaje de Bienvenida',
  linkedin_message: 'Mensaje LinkedIn',
  linkedin_reminder: 'Recordatorio',
  email_message: 'Enviar Email',
  schedule_interview: 'Agendar Entrevista',
  status_change: 'Cambiar Estado',
  wait_for_status: 'Esperar Estado',
  send_selection: 'Enviar Selección',
  send_rejection: 'Enviar Rechazo',
  form_submission: 'Formulario de Evaluación',
  review_required: 'Revisión Manual Requerida',
};

function getStepDescription(type: string): string {
  switch (type) {
    case 'linkedin_connect':
      return 'Envía una solicitud de conexión personalizada a LinkedIn';
    case 'linkedin_message':
      return 'Envía un mensaje directo por LinkedIn';
    case 'linkedin_reminder':
      return 'Envía un recordatorio si no hay respuesta';
    case 'email_message':
      return 'Envía un correo electrónico personalizado';
    case 'schedule_interview':
      return 'Programa una entrevista con el candidato';
    case 'status_change':
      return 'Cambia el estado del candidato automáticamente';
    case 'wait_for_status':
      return 'Espera hasta que el candidato alcance cierto estado';
    case 'send_selection':
      return 'Envía una notificación de selección';
    case 'send_rejection':
      return 'Envía una notificación de rechazo';
    case 'form_submission':
      return 'Solicita al candidato completar un formulario de evaluación';
    case 'review_required':
      return 'Pausa el proceso para una revisión manual';
    default:
      return '';
  }
}

