import React, { useState } from 'react';
import { Info, AlertCircle } from 'lucide-react';
import { CampaignStep, StepCondition, CandidateStatus } from '../../../../types/campaign';
import { ConditionsEditor } from './ConditionsEditor';

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

const DEFAULT_MESSAGE = `¡Hola {{firstName}}! 👋

Te escribo porque hace {{daysAgo}} días te compartí una oportunidad laboral que podría interesarte. 

¡Aún estás a tiempo de aplicar! Te quedan {{daysRemaining}} días antes de que cerremos la convocatoria.

Puedes completar tu aplicación aquí: {{formLink}}

Saludos,
{{recruiterName}}`;

export function LinkedInReminderEditor({ step, onSave }: LinkedInReminderEditorProps) {
  const [message, setMessage] = useState(step.config?.message || DEFAULT_MESSAGE);
  const [delay, setDelay] = useState(step.config?.delay || 3);
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
            después del tiempo especificado. La variable {'{{daysRemaining}}'} se calculará automáticamente
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
                className="text-left px-2 py-1 hover:bg-blue-100 rounded"
              >
                <span className="font-mono text-xs">{key}</span>
                <br />
                <span className="text-xs">{description}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="delay" className="block text-sm font-medium text-gray-700 mb-1">
          Enviar recordatorio después de
        </label>
        <div className="flex items-center space-x-2">
          <input
            type="number"
            id="delay"
            value={delay}
            onChange={(e) => setDelay(parseInt(e.target.value))}
            className="block w-20 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            min="1"
          />
          <span className="text-sm text-gray-500">días sin respuesta</span>
        </div>
      </div>

      <div>
        <label htmlFor="reminder-message-input" className="block text-sm font-medium text-gray-700 mb-1">
          Mensaje del recordatorio
        </label>
        <textarea
          id="reminder-message-input"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={10}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
      </div>

      <ConditionsEditor
        conditions={conditions}
        onChange={setConditions}
        statusOptions={statusOptions}
      />

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Guardar cambios
        </button>
      </div>
    </div>
  );
}

