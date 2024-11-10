import React from 'react';
import { Filter, Search } from 'lucide-react';
import { Candidature } from '../../types';

interface SearchFormProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterCandidature: string;
  setFilterCandidature: (id: string) => void;
  candidatures: Candidature[];
  setIsAddModalOpen: (isOpen: boolean) => void;
}

export function SearchForm({
  searchTerm,
  setSearchTerm,
  filterCandidature,
  setFilterCandidature,
  candidatures,
  setIsAddModalOpen
}: SearchFormProps) {
  return (
    <div className="flex items-center space-x-4">
      <button className="flex items-center px-4 py-2.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium">
        <Filter size={16} className="mr-2" />
        Filtrar
      </button>

      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Buscar por nombre o tipo de filtro..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <button
        onClick={() => setIsAddModalOpen(true)}
        className="flex items-center px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
      >
        + Nuevo candidato
      </button>
    </div>
  );
}