import React from 'react';
import { Check, AlertCircle } from 'lucide-react';
import { Campaign, CampaignStep } from '../../../types/campaign';

interface Question {
  id: string;
  category: string;
  text: string;
}

interface ReviewStepProps {
  formData: {
    name: string;
    description: string;
    type: 'recruitment' | 'sourcing';
    candidatureId: string;
    endDate?: string;
  };
  steps: CampaignStep[];
  questions: Question[];
  onSubmit: () => void;
  onBack: () => void;
}

const stepTypeLabels = {
  linkedin_connect: 'Conexión LinkedIn',
  linkedin_message: 'Mensaje LinkedIn',
  linkedin_reminder: 'Recordatorio',
  form_submission: 'Formulario',
  schedule_interview: 'Agendar Entrevista',
};

const categoryLabels = {
  documents: 'Documentos',
  soft_skills: 'Soft Skills',
  hard_skills: 'Hard Skills',
  behavioral: 'Comportamiento',
  experience: 'Experiencia',
};

export function ReviewStep({ formData, steps, questions, onSubmit, onBack }: ReviewStepProps) {
  const isValid = steps.length > 0;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start">
        <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
        <div className="text-sm text-blue-700">
          <p className="font-medium mb-1">Revisa tu campaña</p>
          <p>
            Verifica que toda la información y los pasos configurados sean correctos.
            La campaña se creará en modo borrador y podrás activarla cuando estés listo.
          </p>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start">
        <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5 mr-3 flex-shrink-0" />
        <div className="text-sm text-yellow-700">
          <p className="font-medium mb-1">Modo borrador</p>
          <p>
            La campaña se creará en modo borrador. Podrás revisar todos los detalles
            y activarla cuando estés listo desde el panel de control de la campaña.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-4 py-5 sm:px-6 bg-gray-50">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Información básica
            </h3>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Nombre</dt>
                <dd className="mt-1 text-sm text-gray-900">{formData.name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Tipo</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {formData.type === 'recruitment' ? 'Reclutamiento' : 'Sourcing'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Fecha de finalización</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {formData.endDate ? formatDate(formData.endDate) : 'No especificada'}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Descripción</dt>
                <dd className="mt-1 text-sm text-gray-900">{formData.description}</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-4 py-5 sm:px-6 bg-gray-50">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Pasos configurados
            </h3>
          </div>
          <div className="border-t border-gray-200">
            <ul className="divide-y divide-gray-200">
              {steps.map((step, index) => (
                <li key={step.id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                        {index + 1}
                      </div>
                    </div>
                    <div className="ml-4">
                      <h4 className="text-sm font-medium text-gray-900">
                        {stepTypeLabels[step.type]}
                      </h4>
                      {step.config.delay && (
                        <p className="text-sm text-gray-500">
                          Esperar {step.config.delay} días
                        </p>
                      )}
                    </div>
                    <Check className="ml-auto w-5 h-5 text-green-500" />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-4 py-5 sm:px-6 bg-gray-50">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Preguntas del formulario
            </h3>
          </div>
          <div className="border-t border-gray-200">
            <ul className="divide-y divide-gray-200">
              {questions.map((question) => (
                <li key={question.id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-start">
                    <div className="flex-1">
                      <div className="flex items-center mb-1">
                        <span className="text-sm font-medium text-gray-500">
                          {categoryLabels[question.category as keyof typeof categoryLabels]}
                        </span>
                        {question.id === 'cv' && (
                          <span className="ml-2 px-2 py-1 text-xs font-medium text-blue-700 bg-blue-50 rounded">
                            Requerido
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-900">{question.text}</p>
                    </div>
                    <Check className="ml-4 w-5 h-5 text-green-500" />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-6 border-t">
        <button
          onClick={onBack}
          className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          Volver
        </button>
        <button
          onClick={onSubmit}
          disabled={!isValid}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            isValid
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          Crear campaña en borrador
        </button>
      </div>
    </div>
  );
}

