import React, { useState, useMemo } from 'react';
import { Search, Briefcase, Building2, Calendar, AlertCircle } from 'lucide-react';
import { Candidature } from '../../../types/campaign';

interface CandidatureSelectProps {
  candidatures: Candidature[];
  loading: boolean;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function CandidatureSelect({ candidatures, loading, value, onChange, error }: CandidatureSelectProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'open' | 'closed' | 'draft'>('all');

  // Get unique departments from candidatures
  const departments = useMemo(() => {
    const depts = new Set(candidatures
      .map(c => c.department?.name)
      .filter(Boolean) as string[]);
    return Array.from(depts);
  }, [candidatures]);

  // Filter candidatures based on search and filters
  const filteredCandidatures = useMemo(() => {
    return candidatures.filter(candidature => {
      const matchesSearch = searchTerm === '' || 
        candidature.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidature.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidature.department?.name.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDepartment = selectedDepartment === 'all' || 
        candidature.department?.name === selectedDepartment;

      const matchesStatus = selectedStatus === 'all' || 
        candidature.status === selectedStatus;

      return matchesSearch && matchesDepartment && matchesStatus;
    });
  }, [candidatures, searchTerm, selectedDepartment, selectedStatus]);

  const selectedCandidature = candidatures.find(c => c.id === value);
  const isValidSelection = selectedCandidature?.status === 'open';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Candidatura asociada
        </label>
        {error && (
          <span className="text-sm text-red-600 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {error}
          </span>
        )}
      </div>

      {/* Search and filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar candidatura..."
            className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <select
          value={selectedDepartment}
          onChange={(e) => setSelectedDepartment(e.target.value as string | 'all')}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">Todos los departamentos</option>
          {departments.map(dept => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value as 'all' | 'open' | 'closed' | 'draft')}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">Todos los estados</option>
          <option value="open">Abiertas</option>
          <option value="closed">Cerradas</option>
          <option value="draft">Borradores</option>
        </select>
      </div>

      {/* Candidature list */}
      <div className="border border-gray-200 rounded-lg divide-y">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-flex items-center">
              <svg className="animate-spin h-5 w-5 text-blue-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-gray-500">Cargando candidaturas...</span>
            </div>
          </div>
        ) : filteredCandidatures.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Briefcase className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm">No se encontraron candidaturas</p>
            {searchTerm && (
              <p className="text-sm text-gray-400">
                Prueba con otros términos de búsqueda
              </p>
            )}
          </div>
        ) : (
          filteredCandidatures.map(candidature => (
            <div
              key={candidature.id}
              onClick={() => onChange(candidature.id)}
              className={`p-4 hover:bg-gray-50 cursor-pointer ${
                value === candidature.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-900">
                  {candidature.title}
                </h3>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  candidature.status === 'open' ? 'bg-green-100 text-green-800' :
                  candidature.status === 'closed' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {candidature.status === 'open' ? 'Abierta' :
                   candidature.status === 'closed' ? 'Cerrada' : 'Borrador'}
                </span>
              </div>
              <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                {candidature.department && (
                  <div className="flex items-center">
                    <Building2 className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                    <span>{candidature.department.name}</span>
                  </div>
                )}
                <div className="flex items-center">
                  <Calendar className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                  <span>Creada el {new Date(candidature.createdAt).toLocaleDateString('es-ES')}</span>
                </div>
              </div>
              {candidature.description && (
                <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                  {candidature.description}
                </p>
              )}
            </div>
          ))
        )}
      </div>

      {/* Selected candidature details */}
      {value && selectedCandidature && (
        <div className="space-y-4">
          {/* Status indicator */}
          <div className={`p-4 rounded-lg ${
            isValidSelection ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'
          }`}>
            <div className="flex items-start">
              {isValidSelection ? (
                <svg className="h-5 w-5 text-green-400 mt-0.5 mr-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <AlertCircle className="h-5 w-5 text-yellow-400 mt-0.5 mr-3" />
              )}
              <div>
                <h4 className={`text-sm font-medium ${
                  isValidSelection ? 'text-green-800' : 'text-yellow-800'
                }`}>
                  {isValidSelection ? 'Candidatura válida' : 'Advertencia'}
                </h4>
                <p className={`mt-1 text-sm ${
                  isValidSelection ? 'text-green-700' : 'text-yellow-700'
                }`}>
                  {isValidSelection
                    ? 'Esta candidatura está abierta y lista para recibir nuevos candidatos.'
                    : 'Esta candidatura no está abierta. Considera seleccionar una candidatura activa.'}
                </p>
              </div>
            </div>
          </div>

          {/* Candidature stats */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Resumen de la candidatura
              </h3>
              <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
                <div className="px-4 py-5 bg-gray-50 shadow rounded-lg overflow-hidden sm:p-6">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Fecha de creación
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">
                    {new Date(selectedCandidature.createdAt).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'short'
                    })}
                  </dd>
                  <dd className="mt-1 text-sm text-gray-500">
                    {new Date(selectedCandidature.createdAt).toLocaleDateString('es-ES', {
                      year: 'numeric'
                    })}
                  </dd>
                </div>

                <div className="px-4 py-5 bg-gray-50 shadow rounded-lg overflow-hidden sm:p-6">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Departamento
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">
                    {selectedCandidature.department?.name || '-'}
                  </dd>
                  <dd className="mt-1 text-sm text-gray-500">
                    Asignado
                  </dd>
                </div>

                <div className="px-4 py-5 bg-gray-50 shadow rounded-lg overflow-hidden sm:p-6">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Estado actual
                  </dt>
                  <dd className="mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      selectedCandidature.status === 'open' ? 'bg-green-100 text-green-800' :
                      selectedCandidature.status === 'closed' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedCandidature.status === 'open' ? 'Abierta' :
                       selectedCandidature.status === 'closed' ? 'Cerrada' : 'Borrador'}
                    </span>
                  </dd>
                  <dd className="mt-1 text-sm text-gray-500">
                    Última actualización: {new Date(selectedCandidature.updatedAt).toLocaleDateString('es-ES')}
                  </dd>
                </div>
              </div>

              {selectedCandidature.description && (
                <div className="mt-5">
                  <h4 className="text-sm font-medium text-gray-500">Descripción</h4>
                  <p className="mt-1 text-sm text-gray-900">{selectedCandidature.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

