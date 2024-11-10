import React from 'react';
import { DetailedLinkedInProfile, Candidature } from '../../types';
import { AlertTriangle, Loader, Save, Eye } from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  wizardStep: number;
  selectedCandidature: Candidature | null;
  candidatures: Candidature[];
  setSelectedCandidature: (candidature: Candidature | null) => void;
  manualLocation: string;
  setManualLocation: (location: string) => void;
  handleSearch: () => void;
  processingMessage: string;
  loading: boolean;
  searchError: string | null;
  searchResults: (DetailedLinkedInProfile & { adequacyPercentage: number })[];
  selectedProfiles: string[];
  handleSaveSelectedCandidates: () => void;
  handleSelectProfile: (profileId: string) => void;
  handleViewDetails: (candidate: DetailedLinkedInProfile) => void;
  onClose: () => void;
}

export function SearchModal({
  isOpen,
  wizardStep,
  selectedCandidature,
  candidatures,
  setSelectedCandidature,
  manualLocation,
  setManualLocation,
  handleSearch,
  processingMessage,
  loading,
  searchError,
  searchResults,
  selectedProfiles,
  handleSaveSelectedCandidates,
  handleSelectProfile,
  handleViewDetails,
  onClose
}: SearchModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-2xl font-bold mb-4">Buscar Nuevos Candidatos</h3>
        
        {wizardStep === 0 && (
          <div>
            <h4 className="text-lg font-semibold mb-2">Selecciona una candidatura</h4>
            <select
              value={selectedCandidature?.id || ''}
              onChange={(e) => setSelectedCandidature(candidatures.find(c => c.id === e.target.value) || null)}
              className="w-full p-2 border border-gray-300 rounded-md mb-4"
            >
              <option value="">Seleccionar candidatura</option>
              {candidatures.map((candidature) => (
                <option key={candidature.id} value={candidature.id}>{candidature.title}</option>
              ))}
            </select>
            <button
              onClick={handleSearch}
              disabled={!selectedCandidature}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
            >
              Continuar
            </button>
          </div>
        )}

        {wizardStep === 1 && (
          <div>
            <h4 className="text-lg font-semibold mb-2">Introduce una ubicación para la búsqueda</h4>
            <input
              type="text"
              value={manualLocation}
              onChange={(e) => setManualLocation(e.target.value)}
              placeholder="Ej: Madrid, España"
              className="w-full p-2 border border-gray-300 rounded-md mb-4"
            />
            <button
              onClick={handleSearch}
              disabled={!manualLocation}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
            >
              Buscar Candidatos
            </button>
          </div>
        )}

        {wizardStep === 2 && (
          <div className="text-center">
            <Loader className="animate-spin mx-auto mb-4" size={40} />
            <p>{processingMessage}</p>
          </div>
        )}

        {wizardStep === 3 && (
          <div>
            <p className="mb-4">Resultados de la búsqueda para: {selectedCandidature?.title}</p>
            {loading ? (
              <div className="flex justify-center items-center mt-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
              </div>
            ) : searchError ? (
              <div className="text-center text-red-600 mt-4">
                <AlertTriangle className="mx-auto mb-2" size={32} />
                <p>{searchError}</p>
              </div>
            ) : (
              <div className="space-y-4 mt-8">
                {searchResults && searchResults.length > 0 ? (
                  <>
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-lg font-semibold">Candidatos encontrados</h4>
                      <button
                        onClick={handleSaveSelectedCandidates}
                        disabled={selectedProfiles.length === 0}
                        className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50 flex items-center"
                      >
                        <Save className="mr-2" size={20} />
                        Guardar seleccionados
                      </button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Seleccionar
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Nombre
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Título
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Adecuación
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Acciones
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {searchResults.map((profile) => (
                            <tr key={profile.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <input
                                  type="checkbox"
                                  checked={selectedProfiles.includes(profile.id)}
                                  onChange={() => handleSelectProfile(profile.id)}
                                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                                />
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10">
                                    <img className="h-10 w-10 rounded-full" src={profile.profile_picture_url || 'https://via.placeholder.com/40'} alt="" />
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">{profile.name}</div>
                                    <div className="text-sm text-gray-500">{profile.location}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-normal">
                                <div className="text-sm text-gray-900 max-w-xs overflow-hidden overflow-ellipsis">{profile.headline}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  profile.adequacyPercentage >= 80 ? 'bg-green-100 text-green-800' :
                                  profile.adequacyPercentage >= 60 ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {profile.adequacyPercentage}%
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button
                                  onClick={() => handleViewDetails(profile)}
                                  className="text-indigo-600 hover:text-indigo-900"
                                >
                                  <Eye size={18} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : (
                  <p className="text-center text-gray-600">No se encontraron resultados para esta búsqueda.</p>
                )}
              </div>
            )}
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-6 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}