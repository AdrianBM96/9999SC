import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../firebase';
import { Candidature, Candidate } from '../../../types/campaign';
import { fetchCandidatesForCandidature as fetchCandidatesList } from '../../../services/ai/candidate/candidateUtils';
import { BasicInfoHeader } from './BasicInfoHeader';
import { CandidatureSelect } from './CandidatureSelect';
import { CampaignNameInput } from './CampaignNameInput';
import { DateInput } from './DateInput';
import { RecipientSelector } from './RecipientSelector';
import { ContinueButton } from './ContinueButton';

interface FormData {
  name: string;
  description: string;
  candidatureId: string;
  endDate?: string;
  sendToAllCandidates: boolean;
  selectedCandidates?: string[];
  department?: {
    id: string;
    name: string;
  } | null;
  type: 'recruitment' | 'sourcing';
}

interface BasicInfoStepProps {
  formData: FormData;
  onFormDataChange: (data: FormData) => void;
  onNext: () => void;
}

export function BasicInfoStep({ formData, onFormDataChange, onNext }: BasicInfoStepProps) {
  const [candidatures, setCandidatures] = useState<Candidature[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);

  useEffect(() => {
    fetchCandidatures();
  }, []);

  useEffect(() => {
    if (formData.candidatureId && !formData.sendToAllCandidates) {
      fetchCandidatesForCandidature(formData.candidatureId);
    }
  }, [formData.candidatureId, formData.sendToAllCandidates]);

  const fetchCandidatures = async () => {
    setLoading(true);
    try {
      const candidaturesCollection = collection(db, 'candidatures');
      const candidaturesSnapshot = await getDocs(candidaturesCollection);
      const candidaturesList = candidaturesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as Candidature));
      setCandidatures(candidaturesList);
    } catch (error) {
      console.error('Error fetching candidatures:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre de la campaña es requerido';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'La descripción de la campaña es requerida';
    }
    
    if (!formData.candidatureId) {
      newErrors.candidatureId = 'Selecciona una vacante';
    }
    
    if (!formData.endDate) {
      newErrors.endDate = 'La fecha de finalización es requerida';
    } else {
      const endDate = new Date(formData.endDate);
      const today = new Date();
      if (endDate <= today) {
        newErrors.endDate = 'La fecha debe ser posterior a hoy';
      }
    }
    
    if (!formData.sendToAllCandidates && (!formData.selectedCandidates || formData.selectedCandidates.length === 0)) {
      newErrors.selectedCandidates = 'Selecciona al menos un candidato';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const fetchCandidatesForCandidature = async (candidatureId: string) => {
    try {
      setLoading(true);
      setErrors(prev => ({ ...prev, candidatureId: undefined }));

      // Obtener la candidatura seleccionada
      const selectedCandidature = candidatures.find(c => c.id === candidatureId);
      if (!selectedCandidature) {
        throw new Error('Candidatura no encontrada');
      }

      // Obtener todos los candidatos
      const candidatesList = await fetchCandidatesList(candidatureId, candidatures);
      console.log('Candidatos obtenidos:', candidatesList);

      // Filtrar candidatos elegibles
      let filteredCandidates = candidatesList.filter(candidate => {
        // Verificar si el candidato ya está asignado a la candidatura
        const matchesCandidature = candidate.candidatureId === candidatureId;

        // Verificar si el candidato pertenece al mismo departamento
        const matchesDepartment = candidate.department?.id && 
                                selectedCandidature.department?.id && 
                                candidate.department.id === selectedCandidature.department.id;

        // Verificar si el candidato está activo
        const isActive = candidate.status === 'active' || !candidate.status;

        // Incluir si coincide con la candidatura, departamento y está activo
        return (matchesCandidature || matchesDepartment) && isActive;
      });

      console.log('Candidatos filtrados por candidatura/departamento:', filteredCandidates);

      // Aplicar filtro de búsqueda si existe
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        filteredCandidates = filteredCandidates.filter(candidate => {
          const nameMatch = candidate.name?.toLowerCase().includes(searchLower);
          const emailMatch = candidate.email?.toLowerCase().includes(searchLower);
          return nameMatch || emailMatch;
        });
        console.log('Candidatos filtrados por búsqueda:', filteredCandidates);
      }

      // Aplicar filtro de departamento si está seleccionado
      if (selectedDepartment) {
        filteredCandidates = filteredCandidates.filter(candidate => 
          candidate.department?.id === selectedDepartment
        );
        console.log('Candidatos filtrados por departamento:', filteredCandidates);
      }

      // Ordenar candidatos por nombre
      filteredCandidates.sort((a, b) => {
        if (!a.name) return 1;
        if (!b.name) return -1;
        return a.name.localeCompare(b.name);
      });

      setCandidates(filteredCandidates);

      // Mostrar mensaje si no hay candidatos
      if (filteredCandidates.length === 0) {
        toast.info('No se encontraron candidatos elegibles para esta candidatura');
      }

    } catch (error) {
      console.error('Error al cargar los candidatos:', error);
      setErrors(prev => ({
        ...prev,
        candidatureId: 'Error al cargar los candidatos. Por favor, inténtalo de nuevo.'
      }));
      toast.error('Error al cargar los candidatos');
    } finally {
      setLoading(false);
    }
  };

  const handleCandidatureChange = (candidatureId: string) => {
    const selectedCandidature = candidatures.find(c => c.id === candidatureId);
    if (!selectedCandidature) return;

    const currentDate = new Date().toLocaleDateString('es-ES');
    const autoName = selectedCandidature.department?.name
      ? `${selectedCandidature.title} - ${selectedCandidature.department.name} - ${currentDate}`
      : `${selectedCandidature.title} - ${currentDate}`;

    const autoDescription = `Campaña de ${formData.type === 'recruitment' ? 'reclutamiento' : 'sourcing'} para ${selectedCandidature.title}${
      selectedCandidature.department?.name ? ` en ${selectedCandidature.department.name}` : ''
    }`;

    onFormDataChange({ 
      ...formData, 
      candidatureId,
      name: autoName,
      description: autoDescription,
      selectedCandidates: [],
      department: selectedCandidature.department || null
    });

    // Reset filters when changing candidature
    setSearchTerm('');
    setSelectedDepartment(null);
    setErrors({});
  };

  const handleCandidateSelection = (candidateId: string) => {
    const newSelectedCandidates = formData.selectedCandidates?.includes(candidateId)
      ? formData.selectedCandidates.filter(id => id !== candidateId)
      : [...(formData.selectedCandidates || []), candidateId];
    
    onFormDataChange({
      ...formData,
      selectedCandidates: newSelectedCandidates
    });

    // Clear candidate selection error if any candidates are selected
    if (newSelectedCandidates.length > 0) {
      setErrors(prev => {
        const { selectedCandidates, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleNext = () => {
    if (validateForm()) {
      onNext();
    }
  };

  const isValid = formData.name && formData.description && formData.candidatureId && formData.endDate && 
    (formData.sendToAllCandidates || (formData.selectedCandidates && formData.selectedCandidates.length > 0));

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <BasicInfoHeader />

      <div className="space-y-6">
        {/* Tipo de campaña */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Tipo de campaña
          </label>
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => onFormDataChange({ ...formData, type: 'recruitment' })}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                formData.type === 'recruitment'
                  ? 'bg-blue-100 text-blue-700 border-2 border-blue-500'
                  : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
              }`}
            >
              Reclutamiento
            </button>
            <button
              type="button"
              onClick={() => onFormDataChange({ ...formData, type: 'sourcing' })}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                formData.type === 'sourcing'
                  ? 'bg-blue-100 text-blue-700 border-2 border-blue-500'
                  : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
              }`}
            >
              Sourcing
            </button>
          </div>
        </div>

        <CandidatureSelect 
          candidatures={candidatures}
          loading={loading}
          value={formData.candidatureId}
          onChange={handleCandidatureChange}
          error={errors.candidatureId}
        />

        <div className="space-y-4">
          <CampaignNameInput
            value={formData.name}
            onChange={(name) => {
              onFormDataChange({ ...formData, name });
              if (errors.name) {
                setErrors(prev => {
                  const { name, ...rest } = prev;
                  return rest;
                });
              }
            }}
            error={errors.name}
          />

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Descripción
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => {
                onFormDataChange({ ...formData, description: e.target.value });
                if (errors.description) {
                  setErrors(prev => {
                    const { description, ...rest } = prev;
                    return rest;
                  });
                }
              }}
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.description ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Describe el objetivo de esta campaña..."
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description}</p>
            )}
          </div>
        </div>

        <DateInput
          value={formData.endDate}
          onChange={(endDate) => {
            onFormDataChange({ ...formData, endDate });
            if (errors.endDate) {
              setErrors(prev => {
                const { endDate, ...rest } = prev;
                return rest;
              });
            }
          }}
          error={errors.endDate}
        />

        <RecipientSelector
          sendToAllCandidates={formData.sendToAllCandidates}
          onSendToAllChange={(sendToAll) => 
            onFormDataChange({ 
              ...formData, 
              sendToAllCandidates: sendToAll,
              selectedCandidates: sendToAll ? [] : formData.selectedCandidates 
            })
          }
          candidateId={formData.candidatureId}
          candidates={candidates}
          loading={loading}
          selectedCandidates={formData.selectedCandidates || []}
          onCandidateSelect={handleCandidateSelection}
          error={errors.selectedCandidates}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedDepartment={selectedDepartment}
          onDepartmentChange={setSelectedDepartment}
          departments={Array.from(new Set(candidates.map(c => c.department).filter(Boolean)))}
        />
      </div>

      <div className="flex items-center justify-between pt-6 border-t border-gray-200">
        <div className="text-sm text-gray-500">
          {Object.keys(errors).length > 0 && (
            <div className="flex items-center text-red-600">
              <AlertCircle className="w-4 h-4 mr-1" />
              Por favor, corrige los errores antes de continuar
            </div>
          )}
        </div>
        <ContinueButton 
          isValid={isValid} 
          onClick={handleNext}
          loading={loading} 
        />
      </div>
    </div>
  );
}

