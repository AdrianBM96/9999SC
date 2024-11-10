import React, { useState } from 'react';
import { CampaignStep } from '../../../../types/campaign';
import { Info, AlertCircle } from 'lucide-react';

interface LinkedInReminderEditorProps {
  step: CampaignStep;
  onSave: (updatedStep: CampaignStep) => void;
}

const VARIABLES = [
  { key: '{{firstName}}', description: 'Nombre del candidato' },
  { key: '{{formLink}}', description: 'Enlace al formulario' },
  { key: '{{recruiterName}}', description: 'Tu nombre' },
  { key: '{{daysAgo}}', description: 'Días desde el primer mensaje' },
  { key: '{{daysRemaining}}', description: 'Días restantes para aplicar' },
];

const DEFAULT_MESSAGE = `¡Hola {{firstName}}! 👋

Te escribo porque hace {{daysAgo}} días te compartí una oportunidad laboral que podría interesarte. 

¡Aún estás a tiempo de aplicar! Te quedan {{daysRemaining}} días antes de que cerremos la convocatoria.

Puedes completar tu aplicación aquí: {{formLink}}

Saludos,
{{recruiterName}}`;

export function LinkedInReminderEditor({ step, onSave }: LinkedInReminderEditorProps) {
  const [message, setMessage] = useState(step.config.message || DEFAULT_MESSAGE);
  const [delay, setDelay] = useState(step.config.delay || 3);

  const handleSave = () => {
    onSave({
      ...step,
      config: {
        ...step.config,
        message,
        delay,
      },
    });
  };

  const insertVariable = (variable: string) => {
    const textarea = document.getElementById('reminder-message-input') as HTMLTextAreaElement;
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
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start">
        <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5 mr-3 flex-shrink-0" />
        <div className="text-sm text-yellow-700">
          <p className="font-medium mb-1">Recordatorio automático</p>
          <p>
            Este mensaje se enviará automáticamente si el candidato no ha completado el formulario
            después del tiempo especificado. La variable {{daysRemaining}} se calculará automáticamente
            basándose en la fecha de finalización de la campaña.
          </p>
        </div>
      </div>

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
            Mensaje de recordatorio
          </label>
          <textarea
            id="reminder-message-input"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={8}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Escribe tu mensaje de recordatorio aquí..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Enviar recordatorio después de
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              min="1"
              max="30"
              value={delay}
              onChange={(e) => setDelay(Number(e.target.value))}
              className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="text-sm text-gray-500">días sin respuesta</span>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Tiempo de espera antes de enviar el recordatorio
          </p>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t">
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

