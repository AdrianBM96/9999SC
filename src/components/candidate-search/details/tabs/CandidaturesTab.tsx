import React from 'react';
import { Briefcase } from 'lucide-react';
import { DetailedLinkedInProfile, Candidature } from '../../../../types';

interface CandidaturesTabProps {
  candidate: DetailedLinkedInProfile;
  candidatures: Candidature[];
  selectedCandidature: string;
  onCandidatureChange: (candidatureId: string) => void;
}

export function CandidaturesTab({
  candidate,
  candidatures,
  selectedCandidature,
  onCandidatureChange
}: CandidaturesTabProps) {
  return (
    <div className="space-y-8">
      <div className="bg-white shadow rounded-lg p-6">
        <h4 className="text-xl font-semibold mb-4 text-blue-600 border-b pb-2">Candidatura asociada</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Asociar a nueva candidatura
            </label>
            <select
              value={selectedCandidature}
              onChange={(e) => onCandidatureChange(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar candidatura</option>
              {candidatures.map((candidature) => (
                <option key={candidature.id} value={candidature.id}>
                  {candidature.title}
                </option>
              ))}
            </select>
          </div>

          {selectedCandidature && (
            <div className="mt-6">
              <h5 className="font-medium text-gray-700 mb-3">Detalles de la candidatura</h5>
              {(() => {
                const candidature = candidatures.find(c => c.id === selectedCandidature);
                if (!candidature) return null;

                return (
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex items-center">
                      <Briefcase className="w-5 h-5 text-blue-500 mr-2" />
                      <div>
                        <p className="font-medium">{candidature.title}</p>
                        <p className="text-sm text-gray-500">{candidature.department}</p>
                      </div>
                    </div>
                    <div className="text-sm">
                      <p className="text-gray-600">Experiencia requerida: {candidature.experience}</p>
                      <p className="text-gray-600">Ubicación: {candidature.location}</p>
                      <p className="text-gray-600">Tipo de contrato: {candidature.contractType}</p>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}