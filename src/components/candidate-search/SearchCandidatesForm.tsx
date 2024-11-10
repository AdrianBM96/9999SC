import React, { useState } from 'react';
import { Search, Loader, Eye, Download } from 'lucide-react';
import { DetailedLinkedInProfile, Candidature } from '../../types';
import { searchLocations, searchLinkedInProfiles, getDetailedLinkedInProfile } from '../../api';
import { generateAdequacyPercentage, extractSearchKeywords } from '../../services/ai';
import { toast } from 'react-toastify';
import { CandidatePreview } from './CandidatePreview';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../firebase';

interface SearchCandidatesFormProps {
  step: number;
  setStep: (step: number) => void;
  candidatures: Candidature[];
  onComplete: () => void;
}

export function SearchCandidatesForm({ candidatures, onComplete }: SearchCandidatesFormProps) {
  const [selectedCandidature, setSelectedCandidature] = useState('');
  const [location, setLocation] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<DetailedLinkedInProfile[]>([]);
  const [selectedProfiles, setSelectedProfiles] = useState<string[]>([]);
  const [searchStep, setSearchStep] = useState<'initial' | 'searching' | 'evaluating' | 'results'>('initial');
  const [loadingMessage, setLoadingMessage] = useState('');
  const [processedProfiles, setProcessedProfiles] = useState(0);
  const [totalProfiles, setTotalProfiles] = useState(0);
  const [selectedPreviewProfile, setSelectedPreviewProfile] = useState<DetailedLinkedInProfile | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSearch = async () => {
    if (!selectedCandidature || !location) {
      toast.error('Por favor selecciona una candidatura y una ubicación');
      return;
    }

    setIsSearching(true);
    setSearchStep('searching');
    setLoadingMessage('Iniciando búsqueda de candidatos...');
    setProcessedProfiles(0);
    setTotalProfiles(0);
    setSearchResults([]);

    try {
      const candidature = candidatures.find(c => c.id === selectedCandidature);
      if (!candidature) throw new Error('Candidatura no encontrada');

      setLoadingMessage('Analizando requisitos de la oferta...');
      const keywords = await extractSearchKeywords(candidature);
      
      setLoadingMessage('Buscando en la ubicación especificada...');
      const locations = await searchLocations(location);
      const locationIds = locations.map(loc => loc.id);

      setLoadingMessage('Buscando perfiles en LinkedIn...');
      const searchResponse = await searchLinkedInProfiles(keywords, locationIds);
      
      if (!searchResponse.items || searchResponse.items.length === 0) {
        toast.info('No se encontraron candidatos que coincidan con los criterios');
        setIsSearching(false);
        return;
      }

      setTotalProfiles(searchResponse.items.length);
      setSearchStep('evaluating');
      
      const evaluatedProfiles: DetailedLinkedInProfile[] = [];

      for (let i = 0; i < searchResponse.items.length; i++) {
        const profile = searchResponse.items[i];
        setLoadingMessage(`Analizando perfil ${i + 1} de ${searchResponse.items.length}...`);
        
        try {
          const publicIdentifier = profile.public_profile_url.split('/in/')[1]?.split('/')[0];
          if (!publicIdentifier) continue;

          const detailedProfile = await getDetailedLinkedInProfile(publicIdentifier);
          
          setLoadingMessage(`Evaluando adecuación del perfil ${i + 1} de ${searchResponse.items.length}...`);
          const adequacyPercentage = await generateAdequacyPercentage(detailedProfile, candidature);
          
          const completeProfile: DetailedLinkedInProfile = {
            ...detailedProfile,
            name: profile.name || detailedProfile.name,
            headline: profile.headline || detailedProfile.headline,
            profile_picture_url: profile.profile_picture_url || detailedProfile.profile_picture_url,
            public_profile_url: profile.public_profile_url || detailedProfile.public_profile_url,
            adequacyPercentage,
            candidatureId: selectedCandidature,
            uniqueId: `${publicIdentifier}-${i}`,
            experience: detailedProfile.experience || [],
            education: detailedProfile.education || [],
            skills: detailedProfile.skills || [],
            languages: detailedProfile.languages || []
          };

          evaluatedProfiles.push(completeProfile);
          setProcessedProfiles(i + 1);
        } catch (error) {
          console.error(`Error processing profile:`, error);
          continue;
        }
      }

      const sortedProfiles = evaluatedProfiles.sort((a, b) => 
        (b.adequacyPercentage || 0) - (a.adequacyPercentage || 0)
      );

      setSearchResults(sortedProfiles);
      setSearchStep('results');
      
      if (sortedProfiles.length > 0) {
        setSelectedPreviewProfile(sortedProfiles[0]);
      }

      toast.success(`Se encontraron ${sortedProfiles.length} candidatos`);
    } catch (error) {
      console.error('Error during search:', error);
      toast.error('Error durante la búsqueda');
      setSearchStep('initial');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSaveSelected = async () => {
    if (selectedProfiles.length === 0) {
      toast.error('Por favor selecciona al menos un candidato');
      return;
    }

    setIsSaving(true);
    try {
      const selectedCandidates = searchResults.filter(profile => 
        selectedProfiles.includes(profile.uniqueId)
      );
      
      for (const candidate of selectedCandidates) {
        await addDoc(collection(db, 'savedCandidates'), {
          ...candidate,
          createdAt: new Date().toISOString(),
          status: 'pending'
        });
      }
      
      onComplete();
      toast.success(`${selectedProfiles.length} candidatos guardados con éxito`);
    } catch (error) {
      console.error('Error saving candidates:', error);
      toast.error('Error al guardar los candidatos');
    } finally {
      setIsSaving(false);
    }
  };

  const getAdequacyColor = (percentage: number) => {
    if (percentage >= 70) return 'bg-green-100 text-green-800';
    if (percentage >= 50) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="p-6 space-y-6">
      {searchStep === 'initial' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seleccionar oferta
            </label>
            <select
              value={selectedCandidature}
              onChange={(e) => setSelectedCandidature(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Seleccionar oferta</option>
              {candidatures.map((candidature) => (
                <option key={candidature.id} value={candidature.id}>
                  {candidature.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ubicación
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Ej: Madrid, España"
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSearch}
              disabled={isSearching}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 flex items-center"
            >
              <Search className="w-4 h-4 mr-2" />
              {isSearching ? 'Buscando...' : 'Buscar candidatos'}
            </button>
          </div>
        </div>
      )}

      {(searchStep === 'searching' || searchStep === 'evaluating') && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-24 h-24 mb-8 relative">
            <div className="absolute inset-0 border-4 border-blue-200 rounded-full animate-pulse"></div>
            <div className="absolute inset-0 border-4 border-blue-500 rounded-full animate-spin" style={{ borderTopColor: 'transparent' }}></div>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">{loadingMessage}</h3>
          {totalProfiles > 0 && (
            <div className="w-full max-w-md">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progreso</span>
                <span>{Math.round((processedProfiles / totalProfiles) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(processedProfiles / totalProfiles) * 100}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      )}

      {searchStep === 'results' && searchResults.length > 0 && (
        <div className="flex flex-col h-[calc(100vh-200px)]">
          <div className="mb-4 flex justify-between items-center">
            <h3 className="text-lg font-semibold">
              Resultados ({searchResults.length} candidatos)
            </h3>
            <button
              onClick={handleSaveSelected}
              disabled={selectedProfiles.length === 0 || isSaving}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 flex items-center"
            >
              {isSaving ? (
                <>
                  <Loader className="animate-spin mr-2" size={16} />
                  Importando...
                </>
              ) : (
                <>
                  <Download className="mr-2" size={16} />
                  Importar candidatos ({selectedProfiles.length})
                </>
              )}
            </button>
          </div>

          <div className="flex space-x-6 flex-1">
            <div className="flex-1 flex flex-col">
              <div className="bg-white rounded-lg shadow-sm flex-1 flex flex-col">
                <div className="flex-1 overflow-y-auto">
                  {searchResults.map((profile) => (
                    <div
                      key={profile.uniqueId}
                      className="p-4 hover:bg-gray-50 flex items-center justify-between border-b border-gray-100"
                    >
                      <div className="flex items-center space-x-4">
                        <input
                          type="checkbox"
                          checked={selectedProfiles.includes(profile.uniqueId)}
                          onChange={() => {
                            setSelectedProfiles(prev =>
                              prev.includes(profile.uniqueId)
                                ? prev.filter(id => id !== profile.uniqueId)
                                : [...prev, profile.uniqueId]
                            );
                          }}
                          className="h-4 w-4 text-blue-600 rounded border-gray-300"
                        />
                        <img
                          src={profile.profile_picture_url || 'https://via.placeholder.com/40'}
                          alt={profile.name}
                          className="w-10 h-10 rounded-full"
                        />
                        <div>
                          <button
                            onClick={() => setSelectedPreviewProfile(profile)}
                            className="font-medium text-gray-900 hover:text-blue-600"
                          >
                            {profile.name}
                          </button>
                          <p className="text-sm text-gray-500">{profile.headline}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          getAdequacyColor(profile.adequacyPercentage || 0)
                        }`}>
                          {Math.round(profile.adequacyPercentage || 0)}%
                        </span>
                        <button
                          onClick={() => setSelectedPreviewProfile(profile)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <Eye size={20} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {selectedPreviewProfile && (
              <div className="w-[500px] overflow-y-auto">
                <CandidatePreview
                  candidate={selectedPreviewProfile}
                  onClose={() => setSelectedPreviewProfile(null)}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}