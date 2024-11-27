import React, { useState } from 'react';
import { Candidate } from '../../../types/campaign';
import { User, Mail, Building2, Briefcase, Calendar, Tag, CheckCircle2, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface CandidateListProps {
  candidates: Candidate[];
  loading: boolean;
  selectedCandidates: string[];
  onCandidateSelect: (candidateId: string) => void;
}

export function CandidateList({ candidates, loading, selectedCandidates, onCandidateSelect }: CandidateListProps) {
  const [expandedCandidates, setExpandedCandidates] = useState<Set<string>>(new Set());

  const handleSelectAll = () => {
    const allSelected = candidates.every(c => selectedCandidates.includes(c.id));
    if (allSelected) {
      // Deseleccionar todos
      candidates.forEach(c => {
        if (selectedCandidates.includes(c.id)) {
          onCandidateSelect(c.id);
        }
      });
    } else {
      // Seleccionar todos
      candidates.forEach(c => {
        if (!selectedCandidates.includes(c.id)) {
          onCandidateSelect(c.id);
        }
      });
    }
  };

  const toggleExpand = (candidateId: string) => {
    const newExpanded = new Set(expandedCandidates);
    if (newExpanded.has(candidateId)) {
      newExpanded.delete(candidateId);
    } else {
      newExpanded.add(candidateId);
    }
    setExpandedCandidates(newExpanded);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="border rounded-lg divide-y">
      {/* Header with select all */}
      <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={candidates.length > 0 && candidates.every(c => selectedCandidates.includes(c.id))}
              onChange={handleSelectAll}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">
              Seleccionar todos
            </span>
          </label>
          <span className="text-sm text-gray-500">
            {selectedCandidates.length} de {candidates.length} seleccionados
          </span>
        </div>
        {selectedCandidates.length > 0 && (
          <div className="text-sm text-blue-600">
            {selectedCandidates.length} candidatos seleccionados
          </div>
        )}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="p-8 text-center">
          <div className="inline-flex items-center space-x-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500" />
            <span className="text-gray-500">Cargando candidatos...</span>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && candidates.length === 0 && (
        <div className="p-8 text-center">
          <User className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay candidatos</h3>
          <p className="mt-1 text-sm text-gray-500">
            No se encontraron candidatos disponibles para esta selección
          </p>
        </div>
      )}

      {/* Candidate list */}
      {!loading && candidates.map(candidate => (
        <div
          key={candidate.id}
          className={`group ${selectedCandidates.includes(candidate.id) ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
        >
          <div className="p-4">
            <div className="flex items-start">
              {/* Checkbox */}
              <div className="flex items-center h-5">
                <input
                  type="checkbox"
                  checked={selectedCandidates.includes(candidate.id)}
                  onChange={() => onCandidateSelect(candidate.id)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              </div>

              {/* Candidate info */}
              <div className="ml-3 flex-grow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        {candidate.name ? (
                          <span className="text-lg font-medium text-gray-600">
                            {candidate.name.charAt(0).toUpperCase()}
                          </span>
                        ) : (
                          <User className="h-6 w-6 text-gray-400" />
                        )}
                      </div>
                    </div>

                    {/* Name and email */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{candidate.name}</h4>
                      <div className="flex items-center text-sm text-gray-500">
                        <Mail className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                        {candidate.email}
                      </div>
                    </div>
                  </div>

                  {/* Expand/collapse button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleExpand(candidate.id);
                    }}
                    className="ml-2 text-gray-400 hover:text-gray-500"
                  >
                    {expandedCandidates.has(candidate.id) ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </button>
                </div>

                {/* Tags and status */}
                <div className="mt-2 flex flex-wrap gap-2">
                  {candidate.department && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      <Building2 className="mr-1 h-3 w-3" />
                      {candidate.department.name}
                    </span>
                  )}
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    candidate.status === 'active' ? 'bg-green-100 text-green-800' :
                    candidate.status === 'inactive' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {candidate.status === 'active' ? (
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                    ) : (
                      <AlertCircle className="mr-1 h-3 w-3" />
                    )}
                    {candidate.status === 'active' ? 'Activo' :
                     candidate.status === 'inactive' ? 'Inactivo' : 'Pendiente'}
                  </span>
                  {candidate.source && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      <Tag className="mr-1 h-3 w-3" />
                      {candidate.source}
                    </span>
                  )}
                </div>

                {/* Expanded content */}
                {expandedCandidates.has(candidate.id) && (
                  <div className="mt-4 pl-3 border-l-2 border-gray-200">
                    {candidate.currentPosition && (
                      <div className="mb-2 flex items-center text-sm text-gray-500">
                        <Briefcase className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                        {candidate.currentPosition}
                      </div>
                    )}
                    {candidate.skills && candidate.skills.length > 0 && (
                      <div className="mb-2">
                        <h5 className="text-xs font-medium text-gray-500 mb-1">Habilidades</h5>
                        <div className="flex flex-wrap gap-1">
                          {candidate.skills.map((skill, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                        Registrado: {formatDate(candidate.createdAt)}
                      </div>
                      {candidate.lastInteraction && (
                        <div className="flex items-center">
                          <Calendar className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                          Última interacción: {formatDate(candidate.lastInteraction)}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
