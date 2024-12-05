import React, { useState } from 'react';
import { X, ChevronRight } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { Campaign, CampaignStep } from '../../types/campaign';
import { BasicInfoStep } from './wizard-steps/BasicInfoStep';
import { ConfigureSteps } from './wizard-steps/ConfigureSteps';
import { FormStep } from './wizard-steps/FormStep';
import { ReviewStep } from './wizard-steps/ReviewStep';
import { StepEditorModal } from './wizard-steps/step-editors/StepEditorModal';
import { campaignService } from '../../services/campaignService';
import { toast } from 'react-toastify';

interface NewCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCampaignCreated: (campaign: Campaign) => void;
}

const WIZARD_STEPS = [
  { id: 'basic', label: 'Información básica' },
  { id: 'steps', label: 'Configurar pasos' },
  { id: 'form', label: 'Formulario de evaluación' },
  { id: 'review', label: 'Revisar y crear' },
];

interface Question {
  id: string;
  category: string;
  text: string;
}

export function NewCampaignModal({ isOpen, onClose, onCampaignCreated }: NewCampaignModalProps) {
  const [currentStep, setCurrentStep] = useState('basic');
  const [campaignSteps, setCampaignSteps] = useState<CampaignStep[]>([]);
  const [editingStep, setEditingStep] = useState<CampaignStep | null>(null);
  const [formQuestions, setFormQuestions] = useState<Question[]>([
    {
      id: uuidv4(),
      category: 'documents',
      text: 'Por favor, adjunta tu CV actualizado'
    }
  ]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'recruitment' as const,
    candidatureId: '',
    endDate: '',
    sendToAllCandidates: true,
    selectedCandidates: [] as string[],
    messages: {
      rejection: '',
      selection: ''
    }
  });

  const handleStepEdit = (stepId: string) => {
    const step = campaignSteps.find(s => s.id === stepId);
    if (step) {
      setEditingStep(step);
    }
  };

  const handleStepSave = (updatedStep: CampaignStep) => {
    setCampaignSteps(steps =>
      steps.map(step => step.id === updatedStep.id ? updatedStep : step)
    );
    setEditingStep(null);
  };

  const handleCreateCampaign = async () => {
    try {
      if (!formData.name || !formData.candidatureId) {
        toast.error('Por favor complete todos los campos requeridos');
        return;
      }

      const newCampaign: Omit<Campaign, 'id'> = {
        ...formData,
        steps: campaignSteps,
        status: 'draft',
        metrics: {
          sent: 0,
          opened: 0,
          responded: 0,
          applied: 0,
          interviews_scheduled: 0,
          selected: 0,
          rejected: 0
        },
        candidates: [],
        endDate: formData.endDate,
        formQuestions: formQuestions.map(q => ({
          id: q.id,
          category: q.category,
          text: q.text
        })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const createdCampaign = await campaignService.createCampaign(newCampaign);
      onCampaignCreated(createdCampaign);
      toast.success('Campaña creada con éxito');
      onClose();
    } catch (error) {
      console.error('Error creating campaign:', error);
      toast.error('Error al crear la campaña');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-[90vw] h-[90vh] flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-gray-50 border-r border-gray-200 p-6">
          <div className="space-y-1">
            {WIZARD_STEPS.map((step) => (
              <div
                key={step.id}
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium ${
                  currentStep === step.id
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <div className={`w-6 h-6 rounded-full mr-3 flex items-center justify-center ${
                  currentStep === step.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  {WIZARD_STEPS.findIndex(s => s.id === step.id) + 1}
                </div>
                {step.label}
                {currentStep === step.id && (
                  <ChevronRight className="w-4 h-4 ml-auto" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col">
          <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Nueva Campaña</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {currentStep === 'basic' && (
              <BasicInfoStep
                formData={formData}
                onFormDataChange={setFormData}
                onNext={() => setCurrentStep('steps')}
              />
            )}
            {currentStep === 'steps' && (
              <ConfigureSteps
                steps={campaignSteps}
                onStepsChange={setCampaignSteps}
                onEditStep={handleStepEdit}
                onNext={() => setCurrentStep('form')}
                onBack={() => setCurrentStep('basic')}
              />
            )}
            {currentStep === 'form' && (
              <FormStep
                questions={formQuestions}
                onQuestionsChange={setFormQuestions}
                onNext={() => setCurrentStep('review')}
                onBack={() => setCurrentStep('steps')}
                candidatureId={formData.candidatureId}
              />
            )}

            {currentStep === 'review' && (
              <ReviewStep
                formData={formData}
                steps={campaignSteps}
                questions={formQuestions}
                onSubmit={handleCreateCampaign}
                onBack={() => setCurrentStep('form')}
              />
            )}
          </div>
        </div>
      </div>

      {editingStep && (
        <StepEditorModal
          step={editingStep}
          onClose={() => setEditingStep(null)}
          onSave={handleStepSave}
        />
      )}
    </div>
  );
}

