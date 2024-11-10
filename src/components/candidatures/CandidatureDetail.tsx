import React, { useState, useEffect } from 'react';
import { Candidature, Department, DetailedLinkedInProfile } from '../../types';
import { MapPin, Briefcase, Calendar, DollarSign, BarChart2, GraduationCap, Languages, Wrench, X, Edit2, Save, Loader, Trash2, Clock, Users, ChevronRight, ChevronLeft, FileText, BarChart, User, RefreshCw, Plus } from 'lucide-react';
import { doc, updateDoc, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { generateJobDescription, generateSalaryRange, generateMarketDemand } from '../../services/aiService';
import { toast } from 'react-toastify';
import { CandidateDetailsModal } from '../candidate-search/CandidateDetailsModal';

interface CandidatureDetailProps {
  candidature: Candidature;
  onClose: () => void;
  onUpdate: (updatedCandidature: Candidature) => void;
  onDelete: (id: string) => void;
  departments: Department[];
}

export function CandidatureDetail({ candidature, onClose, onUpdate, onDelete, departments }: CandidatureDetailProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedCandidature, setEditedCandidature] = useState(candidature);
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [candidates, setCandidates] = useState<DetailedLinkedInProfile[]>([]);
  const [isUpdatingDescription, setIsUpdatingDescription] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<DetailedLinkedInProfile | null>(null);
  const [newTag, setNewTag] = useState({ education: '', languages: '', skills: '' });

  useEffect(() => {
    fetchCandidates();
  }, [candidature.id]);

  const fetchCandidates = async () => {
    try {
      const q = query(collection(db, 'savedCandidates'), where('candidatureId', '==', candidature.id));
      const querySnapshot = await getDocs(q);
      const candidatesList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DetailedLinkedInProfile));
      setCandidates(candidatesList);
    } catch (error) {
      console.error('Error fetching candidates:', error);
      toast.error('Error al cargar los candidatos');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedCandidature(prev => ({ ...prev, [name]: value }));
  };

  const handleAddTag = (field: 'education' | 'languages' | 'skills') => {
    if (newTag[field].trim()) {
      setEditedCandidature(prev => ({
        ...prev,
        [field]: [...(prev[field] || []), newTag[field].trim()]
      }));
      setNewTag(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleRemoveTag = (field: 'education' | 'languages' | 'skills', index: number) => {
    setEditedCandidature(prev => ({
      ...prev,
      [field]: prev[field] ? prev[field].filter((_, i) => i !== index) : []
    }));
  };

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      const updatedDescription = await generateJobDescription(editedCandidature);
      const updatedSalaryRange = await generateSalaryRange(editedCandidature.title, editedCandidature.location);
      const updatedMarketDemand = await generateMarketDemand(editedCandidature.title, editedCandidature.location);

      const updatedCandidature = {
        ...editedCandidature,
        description: updatedDescription,
        salaryRange: updatedSalaryRange,
        marketDemand: updatedMarketDemand,
        lastModified: new Date().toISOString()
      };

      await updateDoc(doc(db, 'candidatures', candidature.id), updatedCandidature);
      onUpdate(updatedCandidature);
      toast.success('Candidatura actualizada con éxito');
    } catch (error) {
      console.error('Error al actualizar la candidatura:', error);
      toast.error('Error al actualizar la candidatura');
    } finally {
      setIsUpdating(false);
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta candidatura?')) {
      try {
        await deleteDoc(doc(db, 'candidatures', candidature.id));
        onDelete(candidature.id);
        toast.success('Candidatura eliminada con éxito');
        onClose();
      } catch (error) {
        console.error('Error al eliminar la candidatura:', error);
        toast.error('Error al eliminar la candidatura');
      }
    }
  };

  const handleUpdateDescription = async () => {
    setIsUpdatingDescription(true);
    try {
      const updatedDescription = await generateJobDescription(editedCandidature);
      setEditedCandidature(prev => ({ ...prev, description: updatedDescription }));
      await updateDoc(doc(db, 'candidatures', candidature.id), { description: updatedDescription });
      toast.success('Descripción actualizada con éxito');
    } catch (error) {
      console.error('Error al actualizar la descripción:', error);
      toast.error('Error al actualizar la descripción');
    } finally {
      setIsUpdatingDescription(false);
    }
  };

  const renderTagInput = (field: 'education' | 'languages' | 'skills', icon: React.ReactNode, label: string) => (
    <div className="flex flex-col items-center">
      <h4 className="font-semibold mb-2 flex items-center">
        {icon}
        {label}
      </h4>
      {isEditing ? (
        <div className="w-full space-y-2">
          <div className="flex">
            <input
              type="text"
              value={newTag[field]}
              onChange={(e) => setNewTag(prev => ({ ...prev, [field]: e.target.value }))}
              className="flex-grow border rounded-l px-2 py-1"
              placeholder={`Añadir ${label.toLowerCase()}`}
            />
            <button
              onClick={() => handleAddTag(field)}
              className="bg-blue-500 text-white px-2 py-1 rounded-r hover:bg-blue-600"
            >
              <Plus size={18} />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {editedCandidature[field] && editedCandidature[field].map((item, index) => (
              <span key={index} className="bg-gray-200 text-gray-800 px-2 py-1 rounded-full text-sm flex items-center">
                {item}
                <button onClick={() => handleRemoveTag(field, index)} className="ml-2 text-red-500 hover:text-red-700">
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap justify-center gap-2">
          {editedCandidature[field] && editedCandidature[field].length > 0 ? (
            editedCandidature[field].map((item, index) => (
              <span key={index} className="bg-gray-200 text-gray-800 px-2 py-1 rounded-full text-sm">
                {item}
              </span>
            ))
          ) : (
            <span className="text-gray-500">-</span>
          )}
        </div>
      )}
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-4">Información General</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="flex flex-col">
                  <span className="text-gray-600 mb-1">Ubicación</span>
                  <div className="flex items-center">
                    <MapPin className="mr-2 text-gray-500" size={16} />
                    {isEditing ? (
                      <input
                        type="text"
                        name="location"
                        value={editedCandidature.location}
                        onChange={handleInputChange}
                        className="border rounded px-2 py-1 flex-grow"
                      />
                    ) : (
                      <span className="font-semibold">{editedCandidature.location}</span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-600 mb-1">Tipo de trabajo</span>
                  <div className="flex items-center">
                    <Briefcase className="mr-2 text-gray-500" size={16} />
                    {isEditing ? (
                      <select
                        name="jobType"
                        value={editedCandidature.jobType}
                        onChange={handleInputChange}
                        className="border rounded px-2 py-1 flex-grow"
                      >
                        <option value="Presencial">Presencial</option>
                        <option value="Remoto">Remoto</option>
                        <option value="Híbrido">Híbrido</option>
                      </select>
                    ) : (
                      <span className="font-semibold">{editedCandidature.jobType}</span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-600 mb-1">Tipo de contrato</span>
                  <div className="flex items-center">
                    <Calendar className="mr-2 text-gray-500" size={16} />
                    {isEditing ? (
                      <select
                        name="contractType"
                        value={editedCandidature.contractType}
                        onChange={handleInputChange}
                        className="border rounded px-2 py-1 flex-grow"
                      >
                        <option value="Indefinido">Indefinido</option>
                        <option value="Temporal">Temporal</option>
                        <option value="Prácticas">Prácticas</option>
                      </select>
                    ) : (
                      <span className="font-semibold">{editedCandidature.contractType}</span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-600 mb-1">Departamento</span>
                  <div className="flex items-center">
                    <Users className="mr-2 text-gray-500" size={16} />
                    {isEditing ? (
                      <select
                        name="department"
                        value={editedCandidature.department}
                        onChange={handleInputChange}
                        className="border rounded px-2 py-1 flex-grow"
                      >
                        {departments.map((dept) => (
                          <option key={dept.id} value={dept.id}>{dept.name}</option>
                        ))}
                      </select>
                    ) : (
                      <span className="font-semibold">{departments.find(d => d.id === editedCandidature.department)?.name}</span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col col-span-2">
                  <span className="text-gray-600 mb-1">Experiencia requerida</span>
                  <div className="flex items-center">
                    <Clock className="mr-2 text-gray-500" size={16} />
                    {isEditing ? (
                      <input
                        type="text"
                        name="experience"
                        value={editedCandidature.experience}
                        onChange={handleInputChange}
                        className="border rounded px-2 py-1 flex-grow"
                      />
                    ) : (
                      <span className="font-semibold">{editedCandidature.experience}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-4">Requisitos</h3>
              <div className="grid grid-cols-3 gap-6">
                {renderTagInput('education', <GraduationCap className="mr-2 text-blue-500" size={18} />, 'Formación')}
                {renderTagInput('languages', <Languages className="mr-2 text-green-500" size={18} />, 'Idiomas')}
                {renderTagInput('skills', <Wrench className="mr-2 text-red-500" size={18} />, 'Habilidades')}
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-4">Estadísticas</h3>
              <div className="grid grid-cols-3 gap-6">
                <div className="flex flex-col items-center">
                  <DollarSign className="mb-2 text-blue-500" size={24} />
                  <span className="text-gray-600 mb-1">Rango salarial</span>
                  <span className="font-semibold">{editedCandidature.salaryRange}</span>
                </div>
                <div className="flex flex-col items-center">
                  <BarChart2 className="mb-2 text-green-500" size={24} />
                  <span className="text-gray-600 mb-1">Demanda del mercado</span>
                  <span className="font-semibold">{editedCandidature.marketDemand}</span>
                </div>
                <div className="flex flex-col items-center">
                  <Users className="mb-2 text-purple-500" size={24} />
                  <span className="text-gray-600 mb-1">Candidatos</span>
                  <span className="font-semibold">{candidates.length}</span>
                </div>
              </div>
            </div>
          </div>
        );
      case 'description':
        return (
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Descripción del puesto</h3>
              <button
                onClick={handleUpdateDescription}
                disabled={isUpdatingDescription}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-300 flex items-center"
              >
                {isUpdatingDescription ? (
                  <>
                    <Loader size={18} className="mr-2 animate-spin" />
                    Actualizando...
                  </>
                ) : (
                  <>
                    <RefreshCw size={18} className="mr-2" />
                    Actualizar con IA
                  </>
                )}
              </button>
            </div>
            <div className="prose max-w-none">
              {editedCandidature.description.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-4">{paragraph}</p>
              ))}
            </div>
          </div>
        );
      case 'candidates':
        return (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-4">Candidatos</h3>
            {candidates.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {candidates.map((candidate) => (
                      <tr key={candidate.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <img className="h-10 w-10 rounded-full" src={candidate.profile_picture_url || 'https://via.placeholder.com/40'} alt="" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{candidate.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{candidate.headline}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => setSelectedCandidate(candidate)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Ver perfil
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-600">No hay candidatos asociados a esta candidatura.</p>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  const tabs = [
    { id: 'general', label: 'Información General', icon: BarChart },
    { id: 'description', label: 'Descripción', icon: FileText },
    { id: 'candidates', label: 'Candidatos', icon: User },
  ];

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex">
        <div className="w-64 bg-gray-100 p-6 overflow-y-auto">
          <h3 className="text-xl font-bold mb-6 text-gray-800">Menú</h3>
          <nav>
            <ul className="space-y-2">
              {tabs.map((tab) => (
                <li key={tab.id}>
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full text-left py-2 px-4 rounded ${
                      activeTab === tab.id ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <tab.icon className="inline-block mr-2" size={18} />
                    {tab.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="flex-1 flex flex-col">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold">{editedCandidature.title}</h2>
              <p className="text-xl mt-1 text-blue-100">{departments.find(d => d.id === editedCandidature.department)?.name}</p>
            </div>
            <div className="flex items-center space-x-2">
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-white text-blue-700 hover:bg-blue-100 px-4 py-2 rounded-full transition duration-300 flex items-center"
                >
                  <Edit2 size={18} className="mr-2" />
                  Editar
                </button>
              )}
              {isEditing && (
                <button
                  onClick={handleUpdate}
                  disabled={isUpdating}
                  className="bg-green-500 text-white hover:bg-green-600 px-4 py-2 rounded-full transition duration-300 flex items-center"
                >
                  {isUpdating ? (
                    <>
                      <Loader size={18} className="mr-2 animate-spin" />
                      Actualizando...
                    </>
                  ) : (
                    <>
                      <Save size={18} className="mr-2" />
                      Guardar
                    </>
                  )}
                </button>
              )}
              <button
                onClick={handleDelete}
                className="bg-red-500 text-white hover:bg-red-600 px-4 py-2 rounded-full transition duration-300 flex items-center"
              >
                <Trash2 size={18} className="mr-2" />
                Eliminar
              </button>
              <button onClick={onClose} className="text-white hover:text-blue-200 transition duration-300">
                <X size={24} />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
            {renderTabContent()}
          </div>
          <div className="bg-gray-100 px-6 py-4 flex justify-between items-center">
            <div className="flex items-center text-sm text-gray-500">
              <Clock size={16} className="mr-2" />
              <span>Última modificación: {new Date(editedCandidature.lastModified || editedCandidature.createdAt).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
      {selectedCandidate && (
        <CandidateDetailsModal
          isOpen={!!selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
          candidate={selectedCandidate}
          onUpdateProfile={() => {}}
          isUpdatingProfile={false}
          candidatures={[editedCandidature]}
        />
      )}
    </div>
  );
}