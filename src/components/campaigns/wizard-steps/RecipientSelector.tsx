import React from 'react';
import { Search, Users, Building2, AlertCircle } from 'lucide-react';
import { Candidate } from '../../../types/campaign';
import { CandidateList } from './CandidateList';

interface Department {
  id: string;
  name: string;
}

interface RecipientSelectorProps {
  sendToAllCandidates: boolean;
  onSendToAllChange: (sendToAll: boolean) => void;
  candidateId?: string;
  candidates: Candidate[];
  loading: boolean;
  selectedCandidates: string[];
  onCandidateSelect: (candidateId: string) => void;
  error?: string;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedDepartment: string | null;
  onDepartmentChange: (departmentId: string | null) => void;
  departments: Department[];
}

export function RecipientSelector({ 
  sendToAllCandidates, 
  onSendToAllChange,
  candidateId,
  candidates,
  loading,
  selectedCandidates,
  onCandidateSelect,
  error,
  searchTerm,
  onSearchChange,
  selectedDepartment,
  onDepartmentChange,
  departments
}: RecipientSelectorProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Destinatarios de la campaña
        </label>
        <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center">
            <Users className="w-5 h-5 text-gray-400 mr-2" />
            <span className="text-sm text-gray-600">
              {candidates.length} candidatos disponibles
            </span>
          </div>
          {selectedCandidates.length > 0 && !sendToAllCandidates && (
            <div className="flex items-center text-blue-600">
              <span className="text-sm font-medium">
                {selectedCandidates.length} seleccionados
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <label className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
          <input
            type="radio"
            checked={sendToAllCandidates}
            onChange={() => onSendToAllChange(true)}
            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
          />
          <div className="ml-3">
            <span className="font-medium">Enviar a todos los candidatos</span>
            <p className="text-sm text-gray-500">
              La campaña se enviará a todos los candidatos que cumplan los criterios
            </p>
          </div>
        </label>

        <label className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
          <input
            type="radio"
            checked={!sendToAllCandidates}
            onChange={() => onSendToAllChange(false)}
            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
          />
          <div className="ml-3">
            <span className="font-medium">Seleccionar candidatos específicos</span>
            <p className="text-sm text-gray-500">
              Elige manualmente los candidatos a los que enviar la campaña
            </p>
          </div>
        </label>
      </div>

      {!sendToAllCandidates && candidateId && (
        <div className="space-y-4">
          <div className="flex space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Buscar por nombre o email..."
                  className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="w-64">
              <select
                value={selectedDepartment || ''}
                onChange={(e) => onDepartmentChange(e.target.value || null)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Todos los departamentos</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <CandidateList
              candidates={candidates}
              loading={loading}
              selectedCandidates={selectedCandidates}
              onCandidateSelect={onCandidateSelect}
            />
          </div>

          {error && (
            <div className="flex items-center text-red-600 text-sm">
              <AlertCircle className="w-4 h-4 mr-1" />
              {error}
            </div>
          )}

          {!loading && candidates.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {searchTerm || selectedDepartment ? (
                <p>No se encontraron candidatos con los filtros aplicados</p>
              ) : (
                <p>No hay candidatos disponibles para esta vacante</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
