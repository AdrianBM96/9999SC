import React from 'react';
import { DetailedLinkedInProfile } from '../../../../types';
import { Eye, Mail, Phone } from 'lucide-react';

interface CandidatesTabProps {
  candidates: DetailedLinkedInProfile[];
  onViewProfile: (candidate: DetailedLinkedInProfile) => void;
}

export function CandidatesTab({ candidates, onViewProfile }: CandidatesTabProps) {
  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-xl font-semibold mb-6">Candidatos ({candidates.length})</h3>
        
        {candidates.length > 0 ? (
          <div className="space-y-4">
            {candidates.map((candidate) => (
              <div key={candidate.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <img
                      src={candidate.profile_picture_url || 'https://via.placeholder.com/40'}
                      alt={candidate.name}
                      className="w-12 h-12 rounded-full"
                    />
                    <div className="ml-4">
                      <h4 className="font-medium text-gray-900">{candidate.name}</h4>
                      <p className="text-sm text-gray-500">{candidate.headline}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    {candidate.email && (
                      <a href={`mailto:${candidate.email}`} className="text-gray-400 hover:text-gray-600">
                        <Mail size={20} />
                      </a>
                    )}
                    {candidate.phone && (
                      <a href={`tel:${candidate.phone}`} className="text-gray-400 hover:text-gray-600">
                        <Phone size={20} />
                      </a>
                    )}
                    <button
                      onClick={() => onViewProfile(candidate)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Eye size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No hay candidatos asociados a esta oferta.</p>
          </div>
        )}
      </div>
    </div>
  );
}