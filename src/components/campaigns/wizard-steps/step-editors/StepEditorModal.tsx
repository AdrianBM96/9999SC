import React from 'react';
import { X } from 'lucide-react';
import { CampaignStep, CandidateStatus, StepCondition } from '../../../../types/campaign';
import { LinkedInMessageEditor } from './LinkedInMessageEditor';
import { LinkedInReminderEditor } from './LinkedInReminderEditor';
import { InterviewSchedulerEditor } from './InterviewSchedulerEditor';
import { LinkedInConnectEditor } from './LinkedInConnectEditor';
import { EmailMessageEditor } from './EmailMessageEditor';
import { StatusChangeEditor } from './StatusChangeEditor';
import { WaitForStatusEditor } from './WaitForStatusEditor';
import { FormSubmissionEditor } from './FormSubmissionEditor';
import { ReviewRequiredEditor } from './ReviewRequiredEditor';

interface StepEditorModalProps {
  step: CampaignStep;
  onClose: () => void;
  onSave: (updatedStep: CampaignStep) => void;
}

const statusOptions: { value: CandidateStatus; label: string }[] = [
  { value: 'new', label: 'Nuevo' },
  { value: 'form_submitted', label: 'Formulario enviado' },
  { value: 'under_review', label: 'En revisión' },
  { value: 'interview_scheduled', label: 'Entrevista programada' },
  { value: 'interview_completed', label: 'Entrevista completada' },
  { value: 'selected', label: 'Seleccionado' },
  { value: 'rejected', label: 'Rechazado' },
  { value: 'withdrawn', label: 'Retirado' }
];

export function StepEditorModal({ step, onClose, onSave }: StepEditorModalProps) {
  const renderEditor = () => {
    switch (step.type) {
      case 'linkedin_connect':
        return <LinkedInConnectEditor step={step} onSave={onSave} />;
      case 'linkedin_message':
        return <LinkedInMessageEditor step={step} onSave={onSave} />;
      case 'linkedin_reminder':
        return <LinkedInReminderEditor step={step} onSave={onSave} />;
      case 'email_message':
        return <EmailMessageEditor step={step} onSave={onSave} />;
      case 'schedule_interview':
        return <InterviewSchedulerEditor step={step} onSave={onSave} />;
      case 'status_change':
        return <StatusChangeEditor step={step} onSave={onSave} statusOptions={statusOptions} />;
      case 'wait_for_status':
        return <WaitForStatusEditor step={step} onSave={onSave} statusOptions={statusOptions} />;
      case 'form_submission':
        return <FormSubmissionEditor step={step} onSave={onSave} />;
      case 'review_required':
        return <ReviewRequiredEditor step={step} onSave={onSave} />;
      case 'send_selection':
      case 'send_rejection':
        return <EmailMessageEditor step={step} onSave={onSave} isTemplate={true} />;
      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (step.type) {
      case 'linkedin_connect':
        return 'Conexión LinkedIn';
      case 'linkedin_message':
        return 'Mensaje LinkedIn';
      case 'linkedin_reminder':
        return 'Recordatorio LinkedIn';
      case 'email_message':
        return 'Enviar Email';
      case 'schedule_interview':
        return 'Agendar Entrevista';
      case 'status_change':
        return 'Cambiar Estado';
      case 'wait_for_status':
        return 'Esperar Estado';
      case 'form_submission':
        return 'Formulario de Evaluación';
      case 'review_required':
        return 'Revisión Manual';
      case 'send_selection':
        return 'Enviar Selección';
      case 'send_rejection':
        return 'Enviar Rechazo';
      default:
        return 'Configurar Paso';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {getStepTitle()}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {renderEditor()}
        </div>
      </div>
    </div>
  );
}

