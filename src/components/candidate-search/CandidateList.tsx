import React from 'react';
import { DetailedLinkedInProfile, Candidature } from '../../types';

interface CandidateListProps {
  filteredCandidates?: DetailedLinkedInProfile[];
  candidatures?: Candidature[];
  handleViewDetails: (candidate: DetailedLinkedInProfile) => void;
  handleDeleteCandidate: (candidateId: string, candidatureId: string) => void;
}

export function CandidateList({
  filteredCandidates = [],
  candidatures = [],
  handleViewDetails,
  handleDeleteCandidate
}: CandidateListProps) {
  return (
    <div className="divide-y divide-gray-100">
      <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider">
        <div className="col-span-3">Candidato</div>
        <div className="col-span-3">Última candidatura</div>
        <div className="col-span-2">Estado</div>
        <div className="col-span-2">Ubicación</div>
        <div className="col-span-1">Fuente</div>
        <div className="col-span-1">Acciones</div>
      </div>

      {filteredCandidates.map((candidate) => {
        const candidature = candidatures.find(c => c.id === candidate.candidatureId);
        
        return (
          <div key={candidate.id || candidate.docId} className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50">
            <div className="col-span-3">
              <div className="flex items-center">
                <div className="flex-shrink-0 h-10 w-10">
                  <img 
                    className="h-10 w-10 rounded-full"
                    src={candidate.profile_picture_url || 'https://via.placeholder.com/40'} 
                    alt={candidate.name}
                  />
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-900">{candidate.name}</div>
                  <div className="text-sm text-gray-500">{candidate.location}</div>
                </div>
              </div>
            </div>
            <div className="col-span-3">
              <div className="text-sm text-gray-900">
                {candidature?.title || 'Sin candidatura'}
              </div>
              <div className="text-sm text-gray-500">
                {candidate.createdAt ? new Date(candidate.createdAt).toLocaleDateString() : ''}
              </div>
            </div>
            <div className="col-span-2">
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-800">
                {candidate.status || 'Pendiente'}
              </span>
            </div>
            <div className="col-span-2 text-sm text-gray-500">
              {candidate.location}
            </div>
            <div className="col-span-1 text-sm text-gray-500">
              {candidate.source || 'Manual'}
            </div>
            <div className="col-span-1 flex space-x-2">
              <button
                onClick={() => handleViewDetails(candidate)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Ver perfil
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}