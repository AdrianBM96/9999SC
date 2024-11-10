import React, { useState } from 'react';
import { X, UserPlus, Search, Sparkles } from 'lucide-react';
import { ImportCVForm } from './ImportCVForm';
import { SearchCandidatesForm } from './SearchCandidatesForm';
import { Candidature } from '../../types';

interface AddCandidateModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidatures: Candidature[];
  onCandidateAdded: () => void;
}

export function AddCandidateModal({ isOpen, onClose, candidatures, onCandidateAdded }: AddCandidateModalProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [step, setStep] = useState(1);

  if (!isOpen) return null;

  const options = [
    {
      id: 'cv',
      label: 'Añadir un candidato (CV + Linkedin + AI)',
      description: 'Sube el CV del candidato y proporciona su link de perfil de linkedin para añadir un candidato manualmente.',
      icon: UserPlus,
      component: ImportCVForm
    },
    {
      id: 'search',
      label: 'Búsqueda inteligente (LinkedIn + AI)',
      description: 'AI Recruiter buscará a los candidatos que encajen perfectamente con la oferta de forma automática.',
      icon: Search,
      component: SearchCandidatesForm
    }
  ];

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      setSelectedOption(null);
    }
  };

  const renderContent = () => {
    if (!selectedOption) {
      return (
        <div className="p-6">
          <h3 className="text-sm text-gray-500 mb-4">Selecciona el método de incorporación</h3>
          <div className="space-y-3">
            {options.map((option) => (
              <button
                key={option.id}
                onClick={() => setSelectedOption(option.id)}
                className={`w-full p-4 text-left rounded-lg border transition-colors ${
                  selectedOption === option.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-500'
                }`}
              >
                <div className="flex items-center">
                  <option.icon className="w-5 h-5 text-blue-500 mr-3" />
                  <div>
                    <div className="font-medium text-gray-900">{option.label}</div>
                    <div className="text-sm text-gray-500">{option.description}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      );
    }

    const SelectedComponent = options.find(opt => opt.id === selectedOption)?.component;
    if (!SelectedComponent) return null;

    return (
      <SelectedComponent
        step={step}
        setStep={setStep}
        candidatures={candidatures}
        onComplete={onCandidateAdded}
      />
    );
  };

  const modalWidth = selectedOption === 'search' ? 'max-w-7xl' : 'max-w-2xl';

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className={`bg-white rounded-lg w-full ${modalWidth} max-h-[90vh] overflow-hidden`}>
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Añadir Nuevo Candidato</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 140px)' }}>
          {renderContent()}
        </div>

        <div className="px-6 py-4 bg-gray-50 flex justify-between rounded-b-lg">
          {(selectedOption || step > 1) && (
            <button
              onClick={handleBack}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Atrás
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg ml-auto"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}