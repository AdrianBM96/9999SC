import React, { useState } from 'react';
import { CampaignCandidate, CandidateStatus, InterviewSchedulingData } from '../../types/campaign';
import { User, Clock, AlertCircle } from 'lucide-react';
import { RecruiterOptionsModal } from './RecruiterOptionsModal';

interface CampaignCandidatesProps {
  candidates: CampaignCandidate[];
  onStatusChange: (candidateId: string, newStatus: CandidateStatus, note?: string) => void;
  onSelectCandidate: (candidateId: string | null) => void;
  selectedCandidateId: string | null;
  loading: boolean;
}

const statusColors = {
  new: 'bg-gray-100 text-gray-800',
  form_submitted: 'bg-blue-100 text-blue-800',
  under_review: 'bg-yellow-100 text-yellow-800',
  interview_scheduled: 'bg-purple-100 text-purple-800',
  interview_completed: 'bg-indigo-100 text-indigo-800',
  selected: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  withdrawn: 'bg-gray-100 text-gray-800',
};

const statusLabels = {
  new: 'Nuevo',
  form_submitted: 'Formulario enviado',
  under_review: 'En revisión',
  interview_scheduled: 'Entrevista programada',
  interview_completed: 'Entrevista completada',
  selected: 'Seleccionado',
  rejected: 'Rechazado',
  withdrawn: 'Retirado',
};

function TaskIndicators({ candidate }: { candidate: CampaignCandidate }) {
  interface Task {
    text: string;
    priority: 'high' | 'medium' | 'low';
    type: 'cv' | 'form' | 'interview' | 'decision';
  }

  const pendingTasks: Task[] = [];
  
  // CV Review - High priority if it's new and unreviewed
  if (candidate.cvFile && !candidate.cvReviewed) {
    pendingTasks.push({
      text: 'CV por revisar',
      priority: candidate.status === 'new' ? 'high' : 'medium',
      type: 'cv'
    });
  }

  // Form Evaluation - High priority if submitted and not evaluated
  if (candidate.formSubmitted && !candidate.formEvaluated) {
    pendingTasks.push({
      text: 'Formulario por evaluar',
      priority: 'high',
      type: 'form'
    });
  }

  // Interview Evaluation - High priority if completed and not evaluated
  if (candidate.status === 'interview_completed' && !candidate.interviewEvaluated) {
    pendingTasks.push({
      text: 'Entrevista por evaluar',
      priority: 'high',
      type: 'interview'
    });
  }

  // Final Decision - High priority if all evaluations are complete
  if (candidate.status === 'interview_completed' && 
      candidate.interviewEvaluated && 
      !candidate.finalDecisionMade) {
    pendingTasks.push({
      text: 'Decisión final pendiente',
      priority: 'high',
      type: 'decision'
    });
  }

  // Suggest interview if form score is high
  if (candidate.formEvaluated && 
      candidate.formScore && 
      candidate.formScore >= 7 && 
      !['interview_scheduled', 'interview_completed', 'selected', 'rejected'].includes(candidate.status)) {
    pendingTasks.push({
      text: 'Programar entrevista (score alto)',
      priority: 'medium',
      type: 'interview'
    });
  }

  if (pendingTasks.length === 0) {
    return null;
  }

  // Sort tasks by priority
  const sortedTasks = pendingTasks.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  const priorityColors = {
    high: 'text-red-600 bg-red-50',
    medium: 'text-yellow-600 bg-yellow-50',
    low: 'text-blue-600 bg-blue-50'
  };

  return (
    <div className="mt-1 space-y-1">
      {sortedTasks.map((task, index) => (
        <div 
          key={index} 
          className={`flex items-center space-x-2 px-2 py-1 rounded-md ${priorityColors[task.priority]}`}
        >
          <AlertCircle className={`w-4 h-4 ${
            task.priority === 'high' ? 'text-red-500' :
            task.priority === 'medium' ? 'text-yellow-500' : 'text-blue-500'
          }`} />
          <span className="text-sm">
            {task.text}
          </span>
        </div>
      ))}
    </div>
  );
}

export function CampaignCandidates({ 
  candidates, 
  onStatusChange,
  onSelectCandidate,
  selectedCandidateId,
  loading 
}: CampaignCandidatesProps) {
  const [selectedCandidate, setSelectedCandidate] = useState<CampaignCandidate | null>(null);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [processing, setProcessing] = useState(false);

  const handleStatusChange = async (candidateId: string, newStatus: CandidateStatus, note?: string) => {
    try {
      setProcessing(true);
      await onStatusChange(candidateId, newStatus, note);
      setShowOptionsModal(false);
      setSelectedCandidate(null);
    } catch (error) {
      console.error('Error processing candidate status change:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleScheduleInterview = async (data: InterviewSchedulingData) => {
    try {
      setProcessing(true);
      // TODO: Implement actual calendar integration
      console.log('Scheduling interview with data:', data);
      
      // Update candidate status to interview_scheduled
      await onStatusChange(
        selectedCandidate!.id, 
        'interview_scheduled',
        `Entrevista programada para ${new Date(data.date).toLocaleString()}`
      );
    } catch (error) {
      console.error('Error scheduling interview:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleSendEmail = () => {
    // TODO: Implement email sending
    console.log('Send email');
  };

  const handleSendMessage = () => {
    // TODO: Implement message sending
    console.log('Send message');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Candidatos</h3>
        <div className="flex space-x-2">
          {Object.entries(statusLabels).map(([status, label]) => (
            <div
              key={status}
              className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status as CandidateStatus]}`}
            >
              {label}
            </div>
          ))}
        </div>
      </div>

      <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Candidato</th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Estado</th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Última interacción</th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Notas</th>
              <th className="relative py-3.5 pl-3 pr-4">
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {candidates.map((candidate) => (
              <tr 
                key={candidate.id}
                className={`${selectedCandidateId === candidate.id ? 'bg-blue-50' : ''} hover:bg-gray-50 cursor-pointer`}
                onClick={() => onSelectCandidate(candidate.id)}
              >
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="font-medium text-gray-900">{candidate.name || candidate.candidateId}</div>
                      <div className="text-sm text-gray-500">{candidate.email}</div>
                      {candidate.formScore !== undefined && (
                        <div className="text-gray-500">Score: {candidate.formScore}</div>
                      )}
                      <TaskIndicators candidate={candidate} />
                      {candidate.linkedinData?.profile && (
                        <a 
                          href={candidate.linkedinData.profile}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-800"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Ver perfil de LinkedIn
                        </a>
                      )}
                    </div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm">
                  <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                    statusColors[candidate.status]
                  }`}>
                    {statusLabels[candidate.status]}
                  </span>
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {candidate.lastInteraction ? (
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {new Date(candidate.lastInteraction).toLocaleDateString()}
                    </div>
                  ) : '-'}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {candidate.reviewNotes || '-'}
                </td>
                <td className="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedCandidate(candidate);
                      setShowOptionsModal(true);
                    }}
                    className="text-blue-600 hover:text-blue-900"
                    disabled={loading || processing}
                  >
                    {(loading || processing) && candidate.id === selectedCandidate?.id 
                      ? 'Procesando...' 
                      : 'Opciones'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showOptionsModal && selectedCandidate && (
        <RecruiterOptionsModal
          candidate={selectedCandidate}
          onClose={() => {
            setShowOptionsModal(false);
            setSelectedCandidate(null);
          }}
          onStatusChange={handleStatusChange}
          onScheduleInterview={handleScheduleInterview}
          onSendEmail={handleSendEmail}
          onSendMessage={handleSendMessage}
        />
      )}
    </div>
  );
}

