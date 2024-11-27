import React, { useState } from 'react';
import { Info } from 'lucide-react';
import { CampaignStep } from '../../../../types/campaign';

interface EmailMessageEditorProps {
  step: CampaignStep;
  onSave: (updatedStep: CampaignStep) => void;
  isTemplate?: boolean;
}

const VARIABLES = [
  { key: '{{firstName}}', description: 'Nombre del candidato' },
  { key: '{{position}}', description: 'Título de la posición' },
  { key: '{{company}}', description: 'Nombre de la empresa' },
  { key: '{{formLink}}', description: 'Enlace al formulario' },
  { key: '{{recruiterName}}', description: 'Tu nombre' },
  { key: '{{calendarLink}}', description: 'Enlace para agendar' },
];

const DEFAULT_SELECTION_MESSAGE = `Estimado/a {{firstName}},

Nos complace informarte que has sido seleccionado/a para el puesto de {{position}} en {{company}}. 

Para continuar con el proceso, por favor agenda una entrevista usando el siguiente enlace:
{{calendarLink}}

Si tienes alguna pregunta, no dudes en contactarnos.

Saludos cordiales,
{{recruiterName}}`;

const DEFAULT_REJECTION_MESSAGE = `Estimado/a {{firstName}},

Gracias por tu interés en la posición de {{position}} en {{company}}.

Después de una cuidadosa revisión, hemos decidido continuar con otros candidatos que se ajustan mejor al perfil que buscamos.

Te agradecemos el tiempo dedicado y te deseamos éxito en tu búsqueda laboral.

Saludos cordiales,
{{recruiterName}}`;

export function EmailMessageEditor({ step, onSave, isTemplate = false }: EmailMessageEditorProps) {
  const [subject, setSubject] = useState(step.config.subject || '');
  const [message, setMessage] = useState(
    step.config.message || 
    (step.type === 'send_selection' ? DEFAULT_SELECTION_MESSAGE :
     step.type === 'send_rejection' ? DEFAULT_REJECTION_MESSAGE : '')
  );
  const [delay, setDelay] = useState(step.config.delay || 0);

  const insertVariable = (variable: string) => {
    const textarea = document.getElementById('email-message-input') as HTMLTextAreaElement;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const before = text.substring(0, start);
    const after = text.substring(end);
    
    setMessage(before + variable + after);
    
    setTimeout(() => {
      textarea.selectionStart = start + variable.length;
      textarea.selectionEnd = start + variable.length;
      textarea.focus();
    }, 0);
  };

  const handleSave = () => {
    onSave({
      ...step,
      config: {
        ...step.config,
        subject,
        message,
        delay: isTemplate ? 0 : delay
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start">
        <Info className="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
        <div className="text-sm text-blue-700">
          <p className="font-medium mb-1">Variables disponibles</p>
          <p className="mb-2">
            Puedes usar las siguientes variables en tu mensaje:
          </p>
          <div className="grid grid-cols-2 gap-2">
            {VARIABLES.map(({ key, description }) => (
              <button
                key={key}
                onClick={() => insertVariable(key)}
                className="inline-flex items-center px-2.5 py-1.5 bg-white border border-blue-200 rounded text-xs hover:bg-blue-50"
              >
                <code className="text-blue-600 mr-1.5">{key}</code>
                <span className="text-blue-700">{description}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Asunto del correo
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Escribe el asunto del correo..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contenido del mensaje
          </label>
          <textarea
            id="email-message-input"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={12}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Escribe el contenido del mensaje..."
          />
        </div>

        {!isTemplate && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Esperar antes de enviar
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min="0"
                max="30"
                value={delay}
                onChange={(e) => setDelay(Number(e.target.value))}
                className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="text-sm text-gray-500">días</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end pt-6 border-t">
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
        >
          Guardar cambios
        </button>
      </div>
    </div>
  );
}
