import React, { useState } from 'react';
import { CampaignStep } from '../../../../types/campaign';
import { Info } from 'lucide-react';

interface LinkedInConnectEditorProps {
  step: CampaignStep;
  onSave: (updatedStep: CampaignStep) => void;
}

const VARIABLES = [
  { key: '{{firstName}}', description: 'Nombre del candidato' },
  { key: '{{position}}', description: 'Título de la posición' },
  { key: '{{company}}', description: 'Nombre de la empresa' },
  { key: '{{recruiterName}}', description: 'Tu nombre' },
  { key: '{{jobLink}}', description: 'Link de la oferta' },
];

const DEFAULT_MESSAGE = `¡Hola {{firstName}}! 👋

Soy {{recruiterName}}, recruiter en {{company}}. Me gustaría conectar contigo porque estamos buscando un {{position}} y tu perfil me parece muy interesante.

Puedes conocer más detalles de la oferta y aplicar directamente aquí: {{jobLink}}

¡Gracias y que tengas un excelente día! 😊`;

export function LinkedInConnectEditor({ step, onSave }: LinkedInConnectEditorProps) {
  const [message, setMessage] = useState(step.config.connectionMessage || DEFAULT_MESSAGE);

  const handleSave = () => {
    onSave({
      ...step,
      config: {
        ...step.config,
        connectionMessage: message,
      },
    });
  };

  const insertVariable = (variable: string) => {
    const textarea = document.getElementById('message-input') as HTMLTextAreaElement;
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

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start">
        <Info className="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
        <div className="text-sm text-blue-700">
          <p className="font-medium mb-1">Mensaje de Bienvenida</p>
          <p className="mb-2">
            Este mensaje se enviará junto con la solicitud de conexión. Puedes usar las siguientes variables:
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
            Mensaje de conexión y bienvenida
          </label>
          <textarea
            id="message-input"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={6}
            maxLength={300}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Escribe tu mensaje de conexión aquí..."
          />
          <p className="mt-1 text-sm text-gray-500">
            {300 - message.length} caracteres restantes
          </p>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t">
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Guardar
        </button>
      </div>
    </div>
  );
}

