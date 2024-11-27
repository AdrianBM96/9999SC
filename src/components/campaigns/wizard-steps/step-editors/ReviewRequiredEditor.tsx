import React, { useState } from 'react';
import { Info } from 'lucide-react';
import { CampaignStep } from '../../../../types/campaign';
import { ConditionsEditor } from './ConditionsEditor';

interface ReviewRequiredEditorProps {
  step: CampaignStep;
  onSave: (updatedStep: CampaignStep) => void;
}

export function ReviewRequiredEditor({ step, onSave }: ReviewRequiredEditorProps) {
  const [instructions, setInstructions] = useState(step.config.instructions || '');
  const [delay, setDelay] = useState(step.config.delay || 0);

  const handleSave = () => {
    onSave({
      ...step,
      config: {
        ...step.config,
        instructions,
        delay,
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start">
        <Info className="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
        <div className="text-sm text-blue-700">
          <p className="font-medium mb-1">Revisión Manual Requerida</p>
          <p>
            Este paso pausará el proceso automatizado hasta que un reclutador revise y apruebe manualmente.
            Puedes incluir instrucciones específicas para el revisor.
          </p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Instrucciones para el revisor
        </label>
        <textarea
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Escribe las instrucciones para el revisor..."
        />
        <p className="mt-1 text-sm text-gray-500">
          Estas instrucciones serán visibles para el reclutador cuando revise el caso
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Esperar antes de solicitar revisión (días)
        </label>
        <input
          type="number"
          min="0"
          value={delay}
          onChange={(e) => setDelay(parseInt(e.target.value))}
          className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <p className="mt-1 text-sm text-gray-500">
          Esperar estos días antes de solicitar la revisión
        </p>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-yellow-800 mb-2">Campos a revisar</h4>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={step.config.reviewFields?.cv}
              onChange={(e) => onSave({
                ...step,
                config: {
                  ...step.config,
                  reviewFields: {
                    ...step.config.reviewFields,
                    cv: e.target.checked
                  }
                }
              })}
              className="mr-2"
            />
            <span className="text-sm text-yellow-800">CV del candidato</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={step.config.reviewFields?.form}
              onChange={(e) => onSave({
                ...step,
                config: {
                  ...step.config,
                  reviewFields: {
                    ...step.config.reviewFields,
                    form: e.target.checked
                  }
                }
              })}
              className="mr-2"
            />
            <span className="text-sm text-yellow-800">Respuestas del formulario</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={step.config.reviewFields?.linkedin}
              onChange={(e) => onSave({
                ...step,
                config: {
                  ...step.config,
                  reviewFields: {
                    ...step.config.reviewFields,
                    linkedin: e.target.checked
                  }
                }
              })}
              className="mr-2"
            />
            <span className="text-sm text-yellow-800">Perfil de LinkedIn</span>
          </label>
        </div>
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
