import React, { useState, useEffect } from 'react';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../../firebase';
import { Candidature, DetailedLinkedInProfile } from '../../types';
import { toast } from 'react-toastify';
import { Search, Loader } from 'lucide-react';
import { getDetailedLinkedInProfile } from '../../api';
import { extractCVInformation } from '../../services/aiService';

interface ManualCandidateFormProps {
  candidatures: Candidature[];
  onComplete: () => void;
}

export function ManualCandidateForm({ candidatures, onComplete }: ManualCandidateFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    candidatureId: '',
    headline: '',
    linkedinProfile: '',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCandidatures, setFilteredCandidatures] = useState<Candidature[]>(candidatures);
  const [showCandidatureDropdown, setShowCandidatureDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [linkedinData, setLinkedinData] = useState<DetailedLinkedInProfile | null>(null);

  useEffect(() => {
    if (searchTerm) {
      const filtered = candidatures.filter(candidature =>
        candidature.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCandidatures(filtered);
    } else {
      setFilteredCandidatures(candidatures);
    }
  }, [searchTerm, candidatures]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCandidatureSelect = (candidature: Candidature) => {
    setFormData(prev => ({ ...prev, candidatureId: candidature.id }));
    setSearchTerm(candidature.title);
    setShowCandidatureDropdown(false);
  };

  const fetchLinkedInData = async () => {
    if (!formData.linkedinProfile) return;

    setIsLoading(true);
    try {
      const publicIdentifier = formData.linkedinProfile.split('/in/')[1]?.split('/')[0];
      if (!publicIdentifier) {
        throw new Error('URL de LinkedIn inválida');
      }

      const linkedinProfile = await getDetailedLinkedInProfile(publicIdentifier);
      setLinkedinData(linkedinProfile);

      // Actualizar el formulario con los datos de LinkedIn
      setFormData(prev => ({
        ...prev,
        name: linkedinProfile.name || prev.name,
        email: linkedinProfile.email || prev.email,
        phone: linkedinProfile.phone || prev.phone,
        location: linkedinProfile.location || prev.location,
        headline: linkedinProfile.headline || prev.headline,
      }));
    } catch (error) {
      console.error('Error fetching LinkedIn data:', error);
      toast.error('Error al obtener datos de LinkedIn');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.candidatureId || !formData.linkedinProfile) {
      toast.error('La oferta asociada y el perfil de LinkedIn son obligatorios');
      return;
    }

    try {
      // Combinar datos del formulario con datos de LinkedIn
      const combinedData = {
        ...formData,
        ...linkedinData,
        createdAt: new Date().toISOString(),
        status: 'pending',
        adequacyPercentage: 0,
      };

      await addDoc(collection(db, 'savedCandidates'), combinedData);
      toast.success('Candidato añadido con éxito');
      onComplete();
    } catch (error) {
      console.error('Error adding candidate:', error);
      toast.error('Error al añadir el candidato');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      <div className="space-y-4">
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Oferta asociada <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowCandidatureDropdown(true);
              }}
              onFocus={() => setShowCandidatureDropdown(true)}
              className="mt-1 block w-full rounded-md border border-gray-300 pl-10 pr-3 py-2 focus:border-blue-500 focus:ring-blue-500"
              placeholder="Buscar oferta..."
              required
            />
          </div>
          {showCandidatureDropdown && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
              {filteredCandidatures.map((candidature) => (
                <div
                  key={candidature.id}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleCandidatureSelect(candidature)}
                >
                  <div className="font-medium">{candidature.title}</div>
                  <div className="text-sm text-gray-500">{candidature.department}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Perfil de LinkedIn <span className="text-red-500">*</span>
          </label>
          <div className="flex space-x-2">
            <input
              type="url"
              name="linkedinProfile"
              value={formData.linkedinProfile}
              onChange={handleInputChange}
              className="flex-grow mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
              placeholder="https://www.linkedin.com/in/username"
              required
            />
            <button
              type="button"
              onClick={fetchLinkedInData}
              disabled={isLoading || !formData.linkedinProfile}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50 flex items-center"
            >
              {isLoading ? (
                <Loader className="animate-spin mr-2" size={18} />
              ) : (
                <Search size={18} className="mr-2" />
              )}
              Obtener datos
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Nombre completo</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Teléfono</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Ubicación</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Título profesional</label>
          <input
            type="text"
            name="headline"
            value={formData.headline}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
        >
          Guardar candidato
        </button>
      </div>
    </form>
  );
}