import React from 'react';
import { X, Link2, MessageSquare, Bell, Calendar } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { CampaignStep, CampaignStepType } from '../../../types/campaign';

interface AddStepModalProps {
  onClose: () => void;
  onAdd: (step: CampaignStep) => void;
}

const stepOptions = [
  {
    type: 'linkedin_connect',
    icon: Link2,
    label: 'Conexión LinkedIn',
    description: 'Envía una solicitud de conexión personalizada a través de LinkedIn'
  },
  {
    type: 'linkedin_message',
    icon: MessageSquare,
    label: 'Mensaje LinkedIn',
    description: 'Envía un mensaje directo al candidato a través de LinkedIn'
  },
  {
    type: 'linkedin_reminder',
    icon: Bell,
    label: 'Recordatorio',
    description: 'Envía un mensaje de seguimiento si no hay respuesta'
  },
  {
    type: 'schedule_interview',
    icon: Calendar,
    label: 'Agendar Entrevista',
    description: 'Programa una entrevista usando Google Calendar o Microsoft Calendar'
  }
];

export function AddStepModal({ onClose, onAdd }: AddStepModalProps) {
  const handleAddStep = (type: CampaignStepType) => {
    const newStep: CampaignStep = {
      id: uuidv4(),
      type,
      order: 0,
      config: type === 'linkedin_connect' ? { connectionMessage: '', delay: 0 } : 
             type === 'schedule_interview' ? {
               calendarConfig: {
                 provider: 'google',
                 daysAvailable: 7,
                 workingHours: { start: '09:00', end: '18:00' },
                 duration: 45
               }
             } : { message: '', delay: 1 }
    };
    onAdd(newStep);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-2xl">
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Añadir nuevo paso</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 grid grid-cols-1 gap-4">
          {stepOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.type}
                onClick={() => handleAddStep(option.type as CampaignStepType)}
                className="flex items-start p-4 border rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="ml-4 text-left">
                  <h4 className="text-sm font-medium text-gray-900">{option.label}</h4>
                  <p className="mt-1 text-sm text-gray-500">{option.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
