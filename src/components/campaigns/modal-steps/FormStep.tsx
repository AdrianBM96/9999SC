import React from 'react';
import { RefreshCw } from 'lucide-react';

interface FormStepProps {
  loading: boolean;
  onGenerateAI: () => void;
}

export function FormStep({ loading, onGenerateAI }: FormStepProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">Formulario de aplicación</h3>
        <button
          onClick={onGenerateAI}
          disabled={loading}
          className="flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
        >
          {loading ? (
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-2" />
          )}
          Generar preguntas con IA
        </button>
      </div>
      {/* Form sections will be implemented in the FormEditor component */}
    </div>
  );
}
