import React, { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc, query, where } from 'firebase/firestore';
import { db } from '../../firebase';
import { Candidature, Department } from '../../types';
import { Filter, Search, ChevronLeft, ChevronRight, Eye, Edit2, Trash2, MoreVertical, Code, MapPin, Users, AlertCircle, Briefcase } from 'lucide-react';
import { CandidatureDetailsModal } from './CandidatureDetailsModal';
import { AddCandidature } from './AddCandidature';
import { FilterSidebar } from './FilterSidebar';
import { toast } from 'react-toastify';

export function Candidatures() {
  const [candidatures, setCandidatures] = useState<Candidature[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCandidature, setSelectedCandidature] = useState<Candidature | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false);

  useEffect(() => {
    fetchCandidatures();
    fetchDepartments();
  }, []);

  const fetchCandidatures = async () => {
    try {
      const candidaturesCollection = collection(db, 'candidatures');
      const candidaturesSnapshot = await getDocs(candidaturesCollection);
      const candidaturesList = await Promise.all(candidaturesSnapshot.docs.map(async doc => {
        const candidatesQuery = query(collection(db, 'savedCandidates'), where('candidatureId', '==', doc.id));
        const candidatesSnapshot = await getDocs(candidatesQuery);
        return {
          id: doc.id,
          ...doc.data(),
          candidateCount: candidatesSnapshot.size
        } as Candidature;
      }));
      setCandidatures(candidaturesList);
    } catch (error) {
      console.error('Error fetching candidatures:', error);
      toast.error('Error al cargar las candidaturas');
    }
  };

  const fetchDepartments = async () => {
    try {
      const departmentsCollection = collection(db, 'departments');
      const departmentsSnapshot = await getDocs(departmentsCollection);
      const departmentsList = departmentsSnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name
      }));
      setDepartments(departmentsList);
    } catch (error) {
      console.error('Error fetching departments:', error);
      toast.error('Error al cargar los departamentos');
    }
  };

  const handleDeleteCandidature = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'candidatures', id));
      setCandidatures(candidatures.filter(c => c.id !== id));
      toast.success('Candidatura eliminada con éxito');
    } catch (error) {
      console.error('Error deleting candidature:', error);
      toast.error('Error al eliminar la candidatura');
    }
  };

  const handleActionClick = (candidatureId: string, action: 'open' | 'edit' | 'delete') => {
    const candidature = candidatures.find(c => c.id === candidatureId);
    if (!candidature) return;

    switch (action) {
      case 'open':
        setSelectedCandidature(candidature);
        break;
      case 'edit':
        setSelectedCandidature(candidature);
        break;
      case 'delete':
        handleDeleteCandidature(candidatureId);
        break;
    }
    setOpenMenuId(null);
  };

  const getJobIcon = (title: string) => {
    if (title.toLowerCase().includes('desarrollador') || title.toLowerCase().includes('developer')) {
      return <Code className="w-4 h-4 text-blue-600" />;
    }
    return <Briefcase className="w-4 h-4 text-blue-600" />;
  };

  const filteredCandidatures = candidatures.filter(candidature =>
    candidature.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="px-8 py-6">
      <div className="bg-white rounded-lg p-4 mb-6">
        <div className="flex items-center space-x-4">
          <button 
            className="filter-button"
            onClick={() => setIsFilterSidebarOpen(true)}
          >
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
              className="search-bar-input"
            />
          </div>

          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="new-button"
          >
            + Nueva oferta
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg">
        <div className="grid grid-cols-[2fr,1fr,1fr,1fr,1fr,80px] gap-4 px-6 py-3 bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
          <div>Oferta</div>
          <div>Ubicación</div>
          <div>Candidatos</div>
          <div>Prioridad</div>
          <div>Estado</div>
          <div className="text-right">Acciones</div>
        </div>

        <div className="divide-y divide-gray-100">
          {filteredCandidatures.map((candidature) => (
            <div key={candidature.id} className="hover:bg-gray-50">
              <div className="grid grid-cols-[2fr,1fr,1fr,1fr,1fr,80px] gap-4 px-6 py-4 items-center">
                <div>
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                      {getJobIcon(candidature.title)}
                    </div>
                    <div>
                      <div 
                        className="text-sm font-medium text-gray-900 cursor-pointer hover:text-blue-600 flex items-center"
                        onClick={() => setSelectedCandidature(candidature)}
                      >
                        {candidature.title}
                        <span className="text-gray-400 ml-2">#{candidature.id?.slice(0, 4)}</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {departments.find(d => d.id === candidature.department)?.name}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <MapPin className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
                  {candidature.location}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Users className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
                  {candidature.candidateCount} candidato{candidature.candidateCount !== 1 ? 's' : ''}
                </div>
                <div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    candidature.marketDemand === 'Alta' 
                      ? 'bg-red-100 text-red-800'
                      : candidature.marketDemand === 'Media'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {candidature.marketDemand}
                  </span>
                </div>
                <div>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                    candidature.status === 'Publicada' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-purple-100 text-purple-800'
                  }`}>
                    {candidature.status || 'No publicada'}
                  </span>
                </div>
                <div className="text-right relative">
                  <button
                    onClick={() => setOpenMenuId(openMenuId === candidature.id ? null : candidature.id)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <MoreVertical size={20} />
                  </button>

                  {openMenuId === candidature.id && (
                    <div 
                      className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-[9999]"
                      style={{ top: '100%' }}
                    >
                      <div className="py-1">
                        <button
                          onClick={() => handleActionClick(candidature.id, 'open')}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <Eye size={16} className="mr-2" />
                          Consultar detalle
                        </button>
                        <button
                          onClick={() => handleActionClick(candidature.id, 'edit')}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <Edit2 size={16} className="mr-2" />
                          Editar
                        </button>
                        <button
                          onClick={() => handleActionClick(candidature.id, 'delete')}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                        >
                          <Trash2 size={16} className="mr-2" />
                          Eliminar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="px-6 py-4 border-t border-gray-100">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">
              {filteredCandidatures.length} resultados | Mostrando 1-25
            </span>
            <div className="flex space-x-2">
              <button className="p-1 text-gray-400 hover:text-gray-600">
                <ChevronLeft size={20} />
              </button>
              <button className="p-1 text-gray-400 hover:text-gray-600">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {selectedCandidature && (
        <CandidatureDetailsModal
          candidature={selectedCandidature}
          onClose={() => setSelectedCandidature(null)}
          departments={departments}
          onUpdate={(updatedCandidature) => {
            setCandidatures(candidatures.map(c => 
              c.id === updatedCandidature.id ? updatedCandidature : c
            ));
          }}
        />
      )}

      {isAddModalOpen && (
        <AddCandidature
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onCandidatureAdded={(newCandidature) => {
            setCandidatures([...candidatures, newCandidature]);
            setIsAddModalOpen(false);
          }}
          departments={departments}
        />
      )}

      <FilterSidebar 
        isOpen={isFilterSidebarOpen}
        onClose={() => setIsFilterSidebarOpen(false)}
      />
    </div>
  );
}