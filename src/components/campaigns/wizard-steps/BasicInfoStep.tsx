import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { AlertCircle } from 'lucide-react';
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

      const selectedCandidature = candidatures.find(c => c.id === candidatureId);
      if (!selectedCandidature) {
        throw new Error('Candidatura no encontrada');
      }

      const candidatesList = await fetchCandidatesList(candidatureId, candidatures);
      
      // Filtrar solo candidatos activos y asociados a la candidatura
      let filteredCandidates = candidatesList.filter(candidate => 
        (candidate.candidatureId === candidatureId || 
         (candidate.department?.id === selectedCandidature.department?.id)) &&
        (candidate.status === 'active' || !candidate.status)
      );

      // Aplicar búsqueda si existe
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        filteredCandidates = filteredCandidates.filter(candidate => 
          candidate.name?.toLowerCase().includes(searchLower) ||
          candidate.email?.toLowerCase().includes(searchLower)
        );
      }

      // Ordenar por nombre
      filteredCandidates.sort((a, b) => 
        (a.name || '').localeCompare(b.name || '')
      );

      setCandidates(filteredCandidates);

      if (filteredCandidates.length === 0) {
        toast.info('No se encontraron candidatos para esta vacante');
      }

    } catch (error) {
      console.error('Error al cargar los candidatos:', error);
      setErrors(prev => ({
        ...prev,
        candidatureId: 'Error al cargar los candidatos'
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
    const autoName = `${selectedCandidature.title} - ${currentDate}`;

    onFormDataChange({ 
      ...formData, 
      candidatureId,
      name: autoName,
      selectedCandidates: [],
      department: selectedCandidature.department || null
    });

    setSearchTerm('');
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

  const isValid = formData.name && formData.candidatureId && formData.endDate && 
    (formData.sendToAllCandidates || (formData.selectedCandidates && formData.selectedCandidates.length > 0));

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <BasicInfoHeader />

      <div className="space-y-6">

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

