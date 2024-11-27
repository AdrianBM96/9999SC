import React, { useState } from 'react';
import { CampaignCandidate, CandidateStatus, InterviewSchedulingData } from '../../types/campaign';
import { User, Mail, Calendar, MessageSquare, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { InterviewSchedulerModal } from './detail-sections/evaluation/InterviewSchedulerModal';

interface RecruiterOptionsModalProps {
  candidate: CampaignCandidate;
  onClose: () => void;
  onStatusChange: (candidateId: string, newStatus: CandidateStatus, note?: string) => void;
  onScheduleInterview?: (data: InterviewSchedulingData) => void;
  onSendEmail?: () => void;
  onSendMessage?: () => void;
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

export function RecruiterOptionsModal({
  candidate,
  onClose,
  onStatusChange,
  onScheduleInterview,
  onSendEmail,
  onSendMessage,
}: RecruiterOptionsModalProps) {
  const [note, setNote] = useState('');
  const [processing, setProcessing] = useState(false);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<CandidateStatus | null>(null);

  // Get available status transitions based on current status
  const getAvailableStatuses = (): CandidateStatus[] => {
    switch (candidate.status) {
      case 'new':
        return ['under_review', 'rejected', 'withdrawn'];
      case 'form_submitted':
        return ['under_review', 'interview_scheduled', 'rejected', 'withdrawn'];
      case 'under_review':
        return ['interview_scheduled', 'rejected', 'withdrawn'];
      case 'interview_scheduled':
        return ['interview_completed', 'rejected', 'withdrawn'];
      case 'interview_completed':
        return ['selected', 'rejected', 'withdrawn'];
      case 'selected':
        return ['withdrawn'];
      case 'rejected':
        return ['under_review'];
      case 'withdrawn':
        return ['under_review'];
      default:
        return [];
    }
  };

  const handleStatusChange = async (newStatus: CandidateStatus) => {
    try {
      if (!note && ['rejected', 'withdrawn'].includes(newStatus)) {
        alert('Por favor, añade una nota explicando el motivo del cambio de estado.');
        return;
      }

      setProcessing(true);
      setSelectedStatus(newStatus);

      // Prepare status change message
      let statusNote = note;
      if (newStatus === 'interview_scheduled' && !note) {
        statusNote = 'Entrevista programada con el candidato.';
      } else if (newStatus === 'interview_completed' && !note) {
        statusNote = 'Entrevista completada con el candidato.';
      }

      await onStatusChange(candidate.id, newStatus, statusNote);
      onClose();
    } catch (error) {
      console.error('Error changing candidate status:', error);
      setSelectedStatus(null);
    } finally {
      setProcessing(false);
    }
  };

  const handleScheduleInterview = async (data: InterviewSchedulingData) => {
    try {
      setProcessing(true);
      if (onScheduleInterview) {
        await onScheduleInterview(data);
        await handleStatusChange('interview_scheduled');
      }
      setShowInterviewModal(false);
    } catch (error) {
      console.error('Error scheduling interview:', error);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Opciones del reclutador
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Gestiona las acciones para el candidato {candidate.candidateId}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <span className="sr-only">Cerrar</span>
              <XCircle className="h-6 w-6" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              onClick={() => setShowInterviewModal(true)}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center space-x-3"
            >
              <Calendar className="h-6 w-6 text-purple-500" />
              <div className="text-left">
                <div className="font-medium">Programar entrevista</div>
                <div className="text-sm text-gray-500">Agenda una entrevista con el candidato</div>
              </div>
            </button>

            <button
              onClick={onSendEmail}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center space-x-3"
            >
              <Mail className="h-6 w-6 text-blue-500" />
              <div className="text-left">
                <div className="font-medium">Enviar correo</div>
                <div className="text-sm text-gray-500">Envía un correo personalizado</div>
              </div>
            </button>

            <button
              onClick={onSendMessage}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center space-x-3"
            >
              <MessageSquare className="h-6 w-6 text-green-500" />
              <div className="text-left">
                <div className="font-medium">Enviar mensaje</div>
                <div className="text-sm text-gray-500">Envía un mensaje por LinkedIn</div>
              </div>
            </button>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-900">Estado actual</h4>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[candidate.status]}`}>
                {statusLabels[candidate.status]}
              </span>
            </div>

            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Cambiar estado a</h4>
              <div className="grid grid-cols-2 gap-2">
                {getAvailableStatuses().map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    disabled={processing || selectedStatus === status}
                    className={`p-3 rounded-lg border text-sm font-medium flex items-center justify-center space-x-2 ${
                      status === 'rejected'
                        ? 'border-red-200 text-red-700 hover:bg-red-50'
                        : status === 'selected'
                        ? 'border-green-200 text-green-700 hover:bg-green-50'
                        : status === 'withdrawn'
                        ? 'border-gray-200 text-gray-700 hover:bg-gray-50'
                        : status === 'interview_scheduled'
                        ? 'border-purple-200 text-purple-700 hover:bg-purple-50'
                        : status === 'interview_completed'
                        ? 'border-indigo-200 text-indigo-700 hover:bg-indigo-50'
                        : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                    } ${processing ? 'opacity-50 cursor-not-allowed' : ''} ${
                      selectedStatus === status ? 'ring-2 ring-blue-500' : ''
                    }`}
                  >
                    {status === 'rejected' && <XCircle className="w-4 h-4" />}
                    {status === 'selected' && <CheckCircle2 className="w-4 h-4" />}
                    {status === 'withdrawn' && <AlertCircle className="w-4 h-4" />}
                    <span>{statusLabels[status]}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">
                Nota {['rejected', 'withdrawn'].includes(selectedStatus || '') ? '(requerida)' : '(opcional)'}
              </label>
              <span className="text-xs text-gray-500">
                {note.length}/500 caracteres
              </span>
            </div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value.slice(0, 500))}
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                !note && ['rejected', 'withdrawn'].includes(selectedStatus || '') 
                  ? 'border-red-300' 
                  : 'border-gray-300'
              }`}
              placeholder={
                ['rejected', 'withdrawn'].includes(selectedStatus || '')
                  ? 'Explica el motivo del cambio de estado...'
                  : 'Añade una nota sobre el cambio de estado (opcional)...'
              }
            />
            {!note && ['rejected', 'withdrawn'].includes(selectedStatus || '') && (
              <p className="mt-1 text-sm text-red-600">
                Por favor, añade una nota explicando el motivo.
              </p>
            )}
          </div>
        </div>
      </div>

      {showInterviewModal && (
        <InterviewSchedulerModal
          candidateId={candidate.id}
          candidateName={candidate.candidateId}
          onClose={() => setShowInterviewModal(false)}
          onSchedule={handleScheduleInterview}
        />
      )}
    </>
  );
}

