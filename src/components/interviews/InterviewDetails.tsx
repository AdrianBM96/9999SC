import React, { useState } from 'react';
import { X, FileText, CheckCircle, Clock, Send, MessageSquare, RefreshCw, Trash2, Edit2, Save } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { DetailedLinkedInProfile, Candidature } from '../../types';
import { generateInterviewFeedback } from '../../services/ai';
import { updateCalendarEvent } from '../../services/calendarService';
import { toast } from 'react-toastify';

interface InterviewDetailsProps {
  interview: {
    id: string;
    candidateId: string;
    candidatureId: string;
    date: string;
    duration: number;
    status: 'scheduled' | 'completed' | 'cancelled';
    notes?: string;
    questions?: string[];
    feedback?: string;
    calendarEventId?: string;
  };
  onClose: () => void;
  onUpdate: (updatedInterview: any) => void;
  candidate?: DetailedLinkedInProfile;
  candidature?: Candidature;
}

export function InterviewDetails({
  interview,
  onClose,
  onUpdate,
  candidate,
  candidature
}: InterviewDetailsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedNotes, setEditedNotes] = useState(interview.notes || '');
  const [editedFeedback, setEditedFeedback] = useState(interview.feedback || '');
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSave = async () => {
    setIsUpdating(true);
    try {
      const interviewRef = doc(db, 'interviews', interview.id);
      const updates = {
        notes: editedNotes,
        feedback: editedFeedback,
        updatedAt: new Date().toISOString()
      };

      await updateDoc(interviewRef, updates);

      // Update calendar event description if exists
      if (interview.calendarEventId) {
        await updateCalendarEvent(interview.calendarEventId, {
          description: `Notes: ${editedNotes}\n\nFeedback: ${editedFeedback}`
        });
      }

      onUpdate({ ...interview, ...updates });
      setIsEditing(false);
      toast.success('Entrevista actualizada con éxito');
    } catch (error) {
      console.error('Error updating interview:', error);
      toast.error('Error al actualizar la entrevista');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleGenerateFeedback = async () => {
    if (!candidate || !candidature) {
      toast.error('No se puede generar feedback sin información del candidato y la candidatura');
      return;
    }

    setIsGeneratingFeedback(true);
    try {
      const feedback = await generateInterviewFeedback(
        candidate,
        candidature,
        editedNotes
      );
      setEditedFeedback(feedback);
      toast.success('Feedback generado con éxito');
    } catch (error) {
      console.error('Error generating feedback:', error);
      toast.error('Error al generar el feedback');
    } finally {
      setIsGeneratingFeedback(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Detalles de la Entrevista</h2>
            <p className="text-sm mt-1">
              {candidate?.name} - {candidature?.title}
            </p>
          </div>
          <button onClick={onClose} className="text-white hover:text-blue-200">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Información General</h3>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                interview.status === 'completed' ? 'bg-green-100 text-green-800' :
                interview.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {interview.status === 'completed' ? 'Completada' :
                 interview.status === 'cancelled' ? 'Cancelada' :
                 'Programada'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Fecha y hora</p>
                <p className="font-medium">{new Date(interview.date).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Duración</p>
                <p className="font-medium">{interview.duration} minutos</p>
              </div>
            </div>
          </div>

          {interview.questions && interview.questions.length > 0 && (
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-lg font-semibold mb-4">Preguntas Preparadas</h3>
              <ul className="space-y-2">
                {interview.questions.map((question, index) => (
                  <li key={index} className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-2">
                      {index + 1}
                    </span>
                    <span className="text-gray-700">{question}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Notas de la Entrevista</h3>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Edit2 size={18} />
                </button>
              )}
            </div>
            {isEditing ? (
              <textarea
                value={editedNotes}
                onChange={(e) => setEditedNotes(e.target.value)}
                className="w-full h-40 p-2 border border-gray-300 rounded-md"
                placeholder="Añade notas sobre la entrevista..."
              />
            ) : (
              <p className="text-gray-700 whitespace-pre-wrap">{interview.notes || 'Sin notas'}</p>
            )}
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Feedback</h3>
              <div className="flex space-x-2">
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Edit2 size={18} />
                  </button>
                )}
                <button
                  onClick={handleGenerateFeedback}
                  disabled={isGeneratingFeedback}
                  className="bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600 disabled:opacity-50 flex items-center"
                >
                  {isGeneratingFeedback ? (
                    <>
                      <RefreshCw className="animate-spin mr-2" size={18} />
                      Generando...
                    </>
                  ) : (
                    <>
                      <MessageSquare className="mr-2" size={18} />
                      Generar con IA
                    </>
                  )}
                </button>
              </div>
            </div>
            {isEditing ? (
              <textarea
                value={editedFeedback}
                onChange={(e) => setEditedFeedback(e.target.value)}
                className="w-full h-40 p-2 border border-gray-300 rounded-md"
                placeholder="Añade feedback sobre la entrevista..."
              />
            ) : (
              <p className="text-gray-700 whitespace-pre-wrap">{interview.feedback || 'Sin feedback'}</p>
            )}
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-2">
          {isEditing && (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={isUpdating}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50 flex items-center"
              >
                {isUpdating ? (
                  <>
                    <RefreshCw className="animate-spin mr-2" size={18} />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2" size={18} />
                    Guardar cambios
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}