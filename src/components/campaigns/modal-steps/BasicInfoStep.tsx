import React from 'react';
import { Candidature } from '../../../types';

interface BasicInfoStepProps {
  formData: {
    name: string;
    description: string;
    type: 'recruitment' | 'sourcing';
    candidatureId: string;
  };
  setFormData: (data: any) => void;
  candidatures: Candidature[];
}

export function BasicInfoStep({ formData, setFormData, candidatures }: BasicInfoStepProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nombre de la campaña
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="input-field"
          placeholder="Ej: Campaña Desarrolladores Senior Q1 2024"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Descripción
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="input-field"
          rows={3}
          placeholder="Describe el objetivo de la campaña..."
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tipo de campaña
        </label>
        <select
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value as 'recruitment' | 'sourcing' })}
          className="input-field"
        >
          <option value="recruitment">Reclutamiento</option>
          <option value="sourcing">Sourcing</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Candidatura asociada
        </label>
        <select
          value={formData.candidatureId}
          onChange={(e) => {
            const selectedCandidature = candidatures.find(c => c.id === e.target.value);
            setFormData({ 
              ...formData, 
              candidatureId: e.target.value,
              department: selectedCandidature?.department
            });
          }}
          className="input-field"
        >
          <option value="">Selecciona una candidatura</option>
          {candidatures.map(candidature => (
            <option key={candidature.id} value={candidature.id}>
              {candidature.title} {candidature.department?.name ? `- ${candidature.department.name}` : ''}
            </option>
          ))}
        </select>
        {formData.candidatureId && (
          <div className="mt-2 text-sm text-gray-600">
            {(() => {
              const selectedCandidature = candidatures.find(c => c.id === formData.candidatureId);
              if (!selectedCandidature) return null;
              return (
                <p>
                  <span className="font-medium">Departamento:</span> {
                    selectedCandidature.department?.name || 'Sin departamento asignado'
                  }
                </p>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}

