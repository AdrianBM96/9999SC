import React, { useState } from 'react';
import { CampaignStep, CandidateStatus } from '../../../../types/campaign';

interface StatusChangeEditorProps {
  step: CampaignStep;
  onSave: (updatedStep: CampaignStep) => void;
  statusOptions: { value: CandidateStatus; label: string }[];
}

export function StatusChangeEditor({ step, onSave, statusOptions }: StatusChangeEditorProps) {
  const [targetStatus, setTargetStatus] = useState<CandidateStatus>(
    step.config.targetStatus || 'under_review'
  );
  const [delay, setDelay] = useState(step.config.delay || 0);

  const handleSave = () => {
    onSave({
      ...step,
      config: {
        ...step.config,
        targetStatus,
        delay
      }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Cambiar estado a
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
          Esperar antes de cambiar
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
