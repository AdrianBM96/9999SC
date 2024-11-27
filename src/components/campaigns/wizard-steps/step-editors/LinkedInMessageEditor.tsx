import React, { useState } from 'react';
import { Info } from 'lucide-react';
import { CampaignStep, StepCondition, CandidateStatus } from '../../../../types/campaign';
import { ConditionsEditor } from './ConditionsEditor';

interface LinkedInMessageEditorProps {
  step: CampaignStep;
  onSave: (updatedStep: CampaignStep) => void;
}

const VARIABLES = [
  { key: '{{firstName}}', description: 'Nombre del candidato' },
  { key: '{{position}}', description: 'Título de la posición' },
  { key: '{{company}}', description: 'Nombre de la empresa' },
  { key: '{{formLink}}', description: 'Enlace al formulario' },
  { key: '{{recruiterName}}', description: 'Tu nombre' },
];

const DEFAULT_MESSAGE = `¡Hola {{firstName}}! 👋

Me pongo en contacto contigo porque estamos buscando un {{position}} para {{company}} y tu perfil me ha parecido muy interesante.

Me gustaría invitarte a participar en nuestro proceso de selección. Puedes encontrar todos los detalles de la posición y aplicar directamente a través de este enlace: {{formLink}}

Si tienes alguna pregunta, no dudes en consultarme.

¡Saludos!
{{recruiterName}}`;

const statusOptions = [
  { value: 'new', label: 'Nuevo' },
  { value: 'form_submitted', label: 'Formulario enviado' },
  { value: 'under_review', label: 'En revisión' },
  { value: 'interview_scheduled', label: 'Entrevista programada' },
  { value: 'interview_completed', label: 'Entrevista completada' },
  { value: 'selected', label: 'Seleccionado' },
  { value: 'rejected', label: 'Rechazado' },
  { value: 'withdrawn', label: 'Retirado' }
];

export function LinkedInMessageEditor({ step, onSave }: LinkedInMessageEditorProps) {
  const [message, setMessage] = useState(step.config?.message || DEFAULT_MESSAGE);
  const [delay, setDelay] = useState(step.config?.delay || 1);
  const [conditions, setConditions] = useState<StepCondition[]>(step.conditions || []);

  const handleSave = () => {
    onSave({
      ...step,
      config: {
        ...step.config,
        message,
        delay,
      },
      conditions
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

      <ConditionsEditor
        conditions={conditions}
        onChange={setConditions}
        statusOptions={statusOptions}
      />

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mensaje
          </label>
          <textarea
            id="message-input"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={8}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Escribe tu mensaje aquí..."
          />
        </div>

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

