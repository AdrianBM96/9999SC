import React, { useState } from 'react';
import { CampaignStep, CandidateStatus } from '../../../../types/campaign';

interface WaitForStatusEditorProps {
  step: CampaignStep;
  onSave: (updatedStep: CampaignStep) => void;
  statusOptions: { value: CandidateStatus; label: string }[];
}

export function WaitForStatusEditor({ step, onSave, statusOptions }: WaitForStatusEditorProps) {
  const [targetStatus, setTargetStatus] = useState<CandidateStatus>(
    step.config.targetStatus || 'form_submitted'
  );
  const [timeout, setTimeout] = useState(step.config.timeout || 7);

  const handleSave = () => {
    onSave({
      ...step,
      config: {
        ...step.config,
        targetStatus,
        timeout
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-700">
          Este paso pausará la ejecución del flujo hasta que el candidato alcance el estado especificado.
          Si el estado no se alcanza dentro del tiempo límite, se continuará con el siguiente paso.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Esperar hasta que el estado sea
        </label>
        <select
          value={targetStatus}
          onChange={(e) => setTargetStatus(e.target.value as CandidateStatus)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {statusOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tiempo límite de espera
        </label>
        <div className="flex items-center space-x-2">
          <input
            type="number"
            min="1"
            max="30"
            value={timeout}
            onChange={(e) => setTimeout(Number(e.target.value))}
            className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <span className="text-sm text-gray-500">días</span>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          Si el estado no cambia dentro de este tiempo, se continuará con el siguiente paso
        </p>
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
