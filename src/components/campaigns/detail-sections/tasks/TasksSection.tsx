import React, { useState } from 'react';
import { Campaign, CampaignCandidate } from '../../../../types/campaign';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';

interface TasksSectionProps {
  campaign: Campaign;
  candidateId: string;
  onTaskComplete: (taskId: string) => void;
}

interface Task {
  id: string;
  type: 'review_cv' | 'evaluate_form' | 'review_interview' | 'make_decision';
  status: 'pending' | 'completed';
  dueDate?: string;
  description: string;
  candidateId: string;
}

export function TasksSection({ campaign, candidateId, onTaskComplete }: TasksSectionProps) {
  const candidate = campaign.candidates.find(c => c.id === candidateId);
  
  if (!candidate) {
    return (
      <div className="text-center py-8 text-gray-500">
        Candidato no encontrado
      </div>
    );
  }

  const getTasks = (candidate: CampaignCandidate): Task[] => {
    const tasks: Task[] = [];

    // CV Review Task
    if (candidate.cvFile && !candidate.cvReviewed) {
      tasks.push({
        id: `cv-${candidate.id}`,
        type: 'review_cv',
        status: 'pending',
        description: 'Revisar CV del candidato',
        candidateId: candidate.id,
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours from now
      });
    }

    // Form Evaluation Task
    if (candidate.formSubmitted && !candidate.formEvaluated) {
      tasks.push({
        id: `form-${candidate.id}`,
        type: 'evaluate_form',
        status: 'pending',
        description: 'Evaluar respuestas del formulario',
        candidateId: candidate.id,
        dueDate: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString() // 48 hours from now
      });
    }

    // Interview Review Task
    if (candidate.status === 'interview_completed' && !candidate.interviewEvaluated) {
      tasks.push({
        id: `interview-${candidate.id}`,
        type: 'review_interview',
        status: 'pending',
        description: 'Evaluar entrevista realizada',
        candidateId: candidate.id,
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      });
    }

    // Final Decision Task
    if (candidate.status === 'interview_completed' && candidate.interviewEvaluated && !candidate.finalDecisionMade) {
      tasks.push({
        id: `decision-${candidate.id}`,
        type: 'make_decision',
        status: 'pending',
        description: 'Tomar decisión final sobre el candidato',
        candidateId: candidate.id,
        dueDate: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString()
      });
    }

    return tasks;
  };

  const tasks = getTasks(candidate);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Tareas Pendientes
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Tareas que requieren tu atención para este candidato
          </p>
        </div>

        {tasks.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No hay tareas pendientes para este candidato
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {tasks.map((task) => (
              <div key={task.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    {task.status === 'completed' ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
                    )}
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">
                        {task.description}
                      </h4>
                      {task.dueDate && (
                        <p className="mt-1 text-sm text-gray-500 flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          Vence: {new Date(task.dueDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  {task.status === 'pending' && (
                    <button
                      onClick={() => onTaskComplete(task.id)}
                      className="px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
                    >
                      Completar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
