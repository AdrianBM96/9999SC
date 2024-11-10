import React, { useState } from 'react';
import { CampaignCandidate, CandidateStatus } from '../../types/campaign';
import { User, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { processCVWithAI } from '../../services/cv-processing';

interface CampaignCandidatesProps {
  candidates: CampaignCandidate[];
  onStatusChange: (candidateId: string, newStatus: CandidateStatus, note?: string) => void;
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

const nextPossibleStatuses: Record<CandidateStatus, CandidateStatus[]> = {
  new: ['form_submitted', 'withdrawn'],
  form_submitted: ['under_review', 'rejected', 'withdrawn'],
  under_review: ['interview_scheduled', 'rejected', 'withdrawn'],
  interview_scheduled: ['interview_completed', 'withdrawn'],
  interview_completed: ['selected', 'rejected', 'withdrawn'],
  selected: [],
  rejected: [],
  withdrawn: [],
};

export function CampaignCandidates({ candidates, onStatusChange }: CampaignCandidatesProps) {
  const [selectedCandidate, setSelectedCandidate] = useState<CampaignCandidate | null>(null);
  const [note, setNote] = useState('');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [processing, setProcessing] = useState(false);

  const handleStatusChange = async (newStatus: CandidateStatus) => {
    if (!selectedCandidate) return;
    
    try {
      setProcessing(true);
      
      // If the status is changing to form_submitted, process the CV
      if (newStatus === 'form_submitted' && selectedCandidate.cvFile) {
        await processCVWithAI(
          selectedCandidate.id,
          selectedCandidate.cvFile.text,
          selectedCandidate.linkedinData
        );
      }

      await onStatusChange(selectedCandidate.id, newStatus, note);
      
      setShowStatusModal(false);
      setNote('');
      setSelectedCandidate(null);
    } catch (error) {
      console.error('Error processing candidate status change:', error);
      // You might want to show an error notification here
    } finally {
      setProcessing(false);
    }
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
              <tr key={candidate.id}>
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="font-medium text-gray-900">{candidate.candidateId}</div>
                      {candidate.formScore && (
                        <div className="text-gray-500">Score: {candidate.formScore}</div>
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
                    onClick={() => {
                      setSelectedCandidate(candidate);
                      setShowStatusModal(true);
                    }}
                    className="text-blue-600 hover:text-blue-900"
                    disabled={processing}
                  >
                    {processing && candidate.id === selectedCandidate?.id 
                      ? 'Procesando...' 
                      : 'Cambiar estado'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showStatusModal && selectedCandidate && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Cambiar estado del candidato
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {nextPossibleStatuses[selectedCandidate.status].map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    disabled={processing}
                    className={`p-3 rounded-lg border text-sm font-medium flex items-center justify-center space-x-2 ${
                      status === 'rejected'
                        ? 'border-red-200 text-red-700 hover:bg-red-50'
                        : status === 'selected'
                        ? 'border-green-200 text-green-700 hover:bg-green-50'
                        : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                    } ${processing ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {status === 'rejected' && <XCircle className="w-4 h-4" />}
                    {status === 'selected' && <CheckCircle2 className="w-4 h-4" />}
                    {status === 'withdrawn' && <AlertCircle className="w-4 h-4" />}
                    <span>{statusLabels[status]}</span>
                  </button>
                ))}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nota (opcional)
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Añade una nota sobre el cambio de estado..."
                />
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowStatusModal(false);
                    setNote('');
                    setSelectedCandidate(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                  disabled={processing}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

