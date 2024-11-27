import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { 
  Link2, MessageSquare, Bell, Calendar, Trash2, GripVertical,
  Plus, Settings, Mail, RefreshCw, CheckCircle, XCircle, ArrowRight,
  ChevronUp, ChevronDown
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
  email_message: Mail,
  schedule_interview: Calendar,
  status_change: RefreshCw,
  wait_for_status: ArrowRight,
  send_selection: CheckCircle,
  send_rejection: XCircle,
  form_submission: Settings,
  review_required: Settings,
};

const stepTypeLabels = {
  linkedin_connect: 'Conexión + Mensaje de Bienvenida',
  linkedin_message: 'Mensaje LinkedIn',
  linkedin_reminder: 'Recordatorio',
  email_message: 'Enviar Email',
  schedule_interview: 'Agendar Entrevista',
  status_change: 'Cambiar Estado',
  wait_for_status: 'Esperar Estado',
  send_selection: 'Enviar Selección',
  send_rejection: 'Enviar Rechazo',
  form_submission: 'Formulario de Evaluación',
  review_required: 'Revisión Manual Requerida',
};

const stepCategories = [
  {
    title: 'Atracción del Candidato',
    description: 'Pasos para establecer el primer contacto y atraer candidatos',
    types: ['linkedin_connect', 'linkedin_message', 'email_message']
  },
  {
    title: 'Selección y Criba',
    description: 'Evaluación inicial y filtrado de candidatos',
    types: ['form_submission', 'review_required', 'status_change', 'wait_for_status']
  },
  {
    title: 'Agenda de Entrevistas',
    description: 'Coordinación y seguimiento de entrevistas',
    types: ['schedule_interview', 'linkedin_reminder', 'email_message']
  },
  {
    title: 'Contratación',
    description: 'Pasos finales del proceso de selección',
    types: ['send_selection', 'send_rejection', 'status_change']
  }
];

export function ConfigureSteps({ steps, onStepsChange, onEditStep, onNext, onBack }: ConfigureStepsProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [expandedSteps, setExpandedSteps] = useState<string[]>([]);

  const toggleStepExpansion = (stepId: string) => {
    setExpandedSteps(prev => 
      prev.includes(stepId) 
        ? prev.filter(id => id !== stepId)
        : [...prev, stepId]
    );
  };

  const handleDeleteStep = (stepId: string) => {
    const updatedSteps = steps
      .filter(step => step.id !== stepId)
      .map((step, index) => ({
        ...step,
        order: index + 1,
      }));
    onStepsChange(updatedSteps);
  };

  const handleAddStep = (newStep: CampaignStep) => {
    const updatedSteps = [...steps, newStep].map((step, index) => ({
      ...step,
      order: index + 1,
    }));
    onStepsChange(updatedSteps);
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(steps);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update order numbers
    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index + 1,
    }));

    onStepsChange(updatedItems);
  };

  const renderStepConditions = (step: CampaignStep) => {
    if (!step.conditions?.length) return null;

    return (
      <div className="mt-2 pl-4 border-l-2 border-gray-200">
        {step.conditions.map((condition, index) => (
          <div key={index} className="text-sm text-gray-600">
            <p className="font-medium">Si:</p>
            {condition.conditions.map((cond, i) => (
              <p key={i} className="ml-2">
                {cond.type === 'status' && `Estado ${cond.operator} ${cond.value}`}
                {cond.type === 'form_score' && `Puntuación ${cond.operator} ${cond.value}`}
                {cond.type === 'time_elapsed' && `Tiempo transcurrido ${cond.operator} ${cond.value} días`}
              </p>
            ))}
            <p className="font-medium mt-1">Entonces:</p>
            <p className="ml-2">{stepTypeLabels[condition.action.type as keyof typeof stepTypeLabels]}</p>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-lg font-medium text-blue-900 mb-2">
          Configuración del Proceso de Reclutamiento
        </h3>
        <p className="text-sm text-blue-700">
          Configura los pasos automatizados para cada fase del proceso de reclutamiento.
          Puedes añadir, reordenar y personalizar los pasos según tus necesidades.
        </p>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="steps" type="STEP">
          {(provided) => (
            <div 
              {...provided.droppableProps} 
              ref={provided.innerRef} 
              className="space-y-6"
            >
              {steps.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <p className="text-gray-500">
                    No hay pasos configurados. Añade pasos para comenzar.
                  </p>
                </div>
              ) : (
                steps.map((step, index) => (
                  <Draggable key={step.id} draggableId={step.id} index={index} type="STEP">
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className="bg-white rounded-lg border border-gray-200 shadow-sm"
                      >
                        <div className="p-4">
                          <div className="flex items-center">
                            <div {...provided.dragHandleProps} className="mr-3">
                              <GripVertical className="w-5 h-5 text-gray-400" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center">
                                {React.createElement(stepTypeIcons[step.type as keyof typeof stepTypeIcons], {
                                  className: "w-5 h-5 text-gray-500 mr-2"
                                })}
                                <span className="font-medium">{stepTypeLabels[step.type as keyof typeof stepTypeLabels]}</span>
                              </div>
                              {step.description && (
                                <p className="mt-1 text-sm text-gray-500">{step.description}</p>
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => onEditStep(step.id)}
                                className="p-2 text-gray-400 hover:text-gray-500"
                              >
                                <Settings className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleDeleteStep(step.id)}
                                className="p-2 text-gray-400 hover:text-red-500"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => toggleStepExpansion(step.id)}
                                className="p-2 text-gray-400 hover:text-gray-500"
                              >
                                {expandedSteps.includes(step.id) ? (
                                  <ChevronUp className="w-5 h-5" />
                                ) : (
                                  <ChevronDown className="w-5 h-5" />
                                )}
                              </button>
                            </div>
                          </div>
                          {expandedSteps.includes(step.id) && (
                            <div className="mt-4 pl-11">
                              <div className="text-sm text-gray-500">
                                {renderStepConditions(step)}
                                {step.config.delay && (
                                  <p className="text-sm text-gray-500 mt-2">
                                    Esperar {step.config.delay} días antes de ejecutar
                                  </p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))
              )}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>


      <div className="flex justify-between items-center">
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          Añadir paso
        </button>
      </div>

      <div className="border-t pt-6 mt-8">
        <div className="flex justify-between">
          <button
            onClick={onBack}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            Anterior
          </button>
          <button
            onClick={onNext}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
            disabled={steps.length === 0}
          >
            Continuar
          </button>
        </div>
      </div>

      {showAddModal && (
        <AddStepModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddStep}
          stepCategories={stepCategories}
        />
      )}
    </div>
  );
}

