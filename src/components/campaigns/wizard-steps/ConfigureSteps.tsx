import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { 
  Link2, MessageSquare, Bell, Calendar, Trash2, GripVertical,
  Plus, Settings 
} from 'lucide-react';
import { CampaignStep, CampaignStepType } from '../../../types/campaign';
import { AddStepModal } from './AddStepModal';

interface ConfigureStepsProps {
  steps: CampaignStep[];
  onStepsChange: (steps: CampaignStep[]) => void;
  onEditStep: (stepId: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const stepTypeIcons = {
  linkedin_connect: Link2,
  linkedin_message: MessageSquare,
  linkedin_reminder: Bell,
  schedule_interview: Calendar,
};

const stepTypeLabels = {
  linkedin_connect: 'Conexión + Mensaje de Bienvenida',
  linkedin_message: 'Mensaje LinkedIn',
  linkedin_reminder: 'Recordatorio',
  schedule_interview: 'Agendar Entrevista',
};

export function ConfigureSteps({ steps, onStepsChange, onEditStep, onNext, onBack }: ConfigureStepsProps) {
  const [showAddModal, setShowAddModal] = useState(false);

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(steps);
    const [reorderedItem] = items.splice(result.source.index, 1);
    const newIndex = result.destination.index;

    // Prevent moving the connection step from first position
    if (reorderedItem.type === 'linkedin_connect' && newIndex !== 0) {
      return;
    }

    // Prevent moving the interview step from last position
    if (reorderedItem.type === 'schedule_interview' && newIndex !== items.length) {
      return;
    }

    // Prevent moving other steps to first or last position
    if (reorderedItem.type !== 'linkedin_connect' && newIndex === 0) {
      return;
    }
    if (reorderedItem.type !== 'schedule_interview' && newIndex === items.length) {
      return;
    }

    items.splice(newIndex, 0, reorderedItem);

    // Update order numbers
    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index + 1,
    }));

    onStepsChange(updatedItems);
  };

  const handleDeleteStep = (stepId: string) => {
    const stepToDelete = steps.find(step => step.id === stepId);
    // Prevent deleting connection or interview steps
    if (stepToDelete?.type === 'linkedin_connect' || stepToDelete?.type === 'schedule_interview') {
      return;
    }

    const updatedSteps = steps
      .filter(step => step.id !== stepId)
      .map((step, index) => ({
        ...step,
        order: index + 1,
      }));
    onStepsChange(updatedSteps);
  };

  const handleAddStep = (newStep: CampaignStep) => {
    let updatedSteps;
    if (newStep.type === 'linkedin_connect') {
      // Add connection step at the beginning
      updatedSteps = [newStep, ...steps];
    } else if (newStep.type === 'schedule_interview') {
      // Add interview step at the end
      updatedSteps = [...steps, newStep];
    } else {
      // Add other steps before the interview step
      const interviewStepIndex = steps.findIndex(step => step.type === 'schedule_interview');
      if (interviewStepIndex === -1) {
        updatedSteps = [...steps, newStep];
      } else {
        updatedSteps = [
          ...steps.slice(0, interviewStepIndex),
          newStep,
          ...steps.slice(interviewStepIndex)
        ];
      }
    }

    // Update order numbers
    updatedSteps = updatedSteps.map((step, index) => ({
      ...step,
      order: index + 1,
    }));

    onStepsChange(updatedSteps);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Configura los pasos</h3>
          <p className="mt-1 text-sm text-gray-500">
            Arrastra para reordenar los pasos de tu campaña
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Añadir paso
        </button>
      </div>

      {showAddModal && (
        <AddStepModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddStep}
        />
      )}

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="steps">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-3"
            >
              {steps.map((step, index) => {
                const Icon = stepTypeIcons[step.type as keyof typeof stepTypeIcons];
                return (
                  <Draggable key={step.id} draggableId={step.id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className="flex items-center bg-white p-4 rounded-lg border border-gray-200 hover:shadow-sm transition-shadow group"
                      >
                        <div
                          {...provided.dragHandleProps}
                          className="text-gray-400 hover:text-gray-600 cursor-grab"
                        >
                          <GripVertical className="w-5 h-5" />
                        </div>
                        
                        <div className="ml-4 flex-1">
                          <div className="flex items-center">
                            <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="ml-3">
                              <h4 className="text-sm font-medium text-gray-900">
                                {stepTypeLabels[step.type as keyof typeof stepTypeLabels]}
                              </h4>
                              <p className="text-xs text-gray-500">
                                {step.config.delay 
                                  ? `Esperar ${step.config.delay} días`
                                  : 'Ejecutar inmediatamente'}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => onEditStep(step.id)}
                            className="p-1 text-gray-400 hover:text-gray-600"
                          >
                            <Settings className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteStep(step.id)}
                            className="p-1 text-gray-400 hover:text-red-600"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {steps.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-sm text-gray-500">
            No hay pasos configurados. Añade un paso para comenzar.
          </p>
        </div>
      )}

      <div className="flex justify-between pt-6 border-t">
        <button
          onClick={onBack}
          className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          Volver
        </button>
        <button
          onClick={onNext}
          disabled={steps.length === 0}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            steps.length > 0
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          Continuar
        </button>
      </div>
    </div>
  );
}

