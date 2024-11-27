import React, { useState } from 'react';
import { Info } from 'lucide-react';
import { CampaignStep } from '../../../../types/campaign';
import { ConditionsEditor } from './ConditionsEditor';

interface FormSubmissionEditorProps {
  step: CampaignStep;
  onSave: (updatedStep: CampaignStep) => void;
}

export function FormSubmissionEditor({ step, onSave }: FormSubmissionEditorProps) {
  const [message, setMessage] = useState(step.config.message || '');
  const [delay, setDelay] = useState(step.config.delay || 0);

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

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start">
        <Info className="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
        <div className="text-sm text-blue-700">
          <p className="font-medium mb-1">Formulario de Evaluación</p>
          <p>
            Configura el mensaje que recibirá el candidato junto con el formulario de evaluación.
            Puedes personalizar el mensaje usando variables como {{firstName}}, {{position}}, etc.
          </p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Mensaje para el candidato
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={6}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Escribe el mensaje que acompañará al formulario..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Esperar antes de enviar (días)
        </label>
        <input
          type="number"
          min="0"
          value={delay}
          onChange={(e) => setDelay(parseInt(e.target.value))}
          className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <p className="mt-1 text-sm text-gray-500">
          Esperar estos días antes de enviar el formulario
        </p>
      </div>

      <ConditionsEditor
        step={step}
        onChange={(updatedStep) => onSave(updatedStep)}
      />

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
        >
          Guardar configuración
        </button>
      </div>
    </div>
  );
}
