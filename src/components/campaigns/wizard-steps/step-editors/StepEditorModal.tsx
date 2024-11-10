import React from 'react';
import { X } from 'lucide-react';
import { CampaignStep } from '../../../../types/campaign';
import { LinkedInMessageEditor } from './LinkedInMessageEditor';
import { LinkedInReminderEditor } from './LinkedInReminderEditor';
import { InterviewSchedulerEditor } from './InterviewSchedulerEditor';
import { LinkedInConnectEditor } from './LinkedInConnectEditor';

interface StepEditorModalProps {
  step: CampaignStep;
  onClose: () => void;
  onSave: (updatedStep: CampaignStep) => void;
}

export function StepEditorModal({ step, onClose, onSave }: StepEditorModalProps) {
  const renderEditor = () => {
    switch (step.type) {
      case 'linkedin_connect':
        return (
          <LinkedInConnectEditor
            step={step}
            onSave={onSave}
          />
        );
      case 'linkedin_message':
        return (
          <LinkedInMessageEditor
            step={step}
            onSave={onSave}
          />
        );
      case 'linkedin_reminder':
        return (
          <LinkedInReminderEditor
            step={step}
            onSave={onSave}
          />
        );
      case 'schedule_interview':
        return (
          <InterviewSchedulerEditor
            step={step}
            onSave={onSave}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Configurar paso
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-8rem)]">
          {renderEditor()}
        </div>
      </div>
    </div>
  );
}

