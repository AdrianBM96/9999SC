import React, { useState } from 'react';
import { X, FileText, CheckCircle, Clock, Send, Plus, Edit2, Save, Trash2, Download } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { HiringProcess, HiringDocument, OnboardingTask } from '../../types';
import { toast } from 'react-toastify';
import { sendDocumentForSignature, checkDocumentStatus } from '../../services/hiringService';

interface HiringDetailsProps {
  process: HiringProcess;
  onClose: () => void;
  onUpdate: (updatedProcess: HiringProcess) => void;
}

export function HiringDetails({ process, onClose, onUpdate }: HiringDetailsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedProcess, setEditedProcess] = useState(process);
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState<'documents' | 'onboarding' | 'notes'>('documents');
  const [newDocument, setNewDocument] = useState<Partial<HiringDocument>>({});
  const [newTask, setNewTask] = useState<Partial<OnboardingTask>>({});

  const handleStatusChange = async (newStatus: HiringProcess['status']) => {
    setIsUpdating(true);
    try {
      const processRef = doc(db, 'hiringProcesses', process.id);
      const updatedProcess = {
        ...process,
        status: newStatus,
        updatedAt: new Date().toISOString(),
      };
      await updateDoc(processRef, updatedProcess);
      onUpdate(updatedProcess);
      toast.success('Estado actualizado con éxito');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Error al actualizar el estado');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSendDocument = async (document: HiringDocument) => {
    try {
      await sendDocumentForSignature(
        process.id,
        document.id,
        'candidate@email.com', // This should come from the candidate's data
        'Candidate Name' // This should come from the candidate's data
      );
      toast.success('Documento enviado para firma');
      
      // Check status after a delay
      setTimeout(() => checkDocumentStatus(process.id, document.id), 5000);
    } catch (error) {
      console.error('Error sending document:', error);
      toast.error('Error al enviar el documento');
    }
  };

  const handleAddDocument = async () => {
    if (!newDocument.name || !newDocument.type) {
      toast.error('Por favor complete todos los campos requeridos');
      return;
    }

    try {
      const updatedDocuments = [
        ...process.documents,
        {
          ...newDocument,
          id: `doc_${Date.now()}`,
          status: 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as HiringDocument
      ];

      const processRef = doc(db, 'hiringProcesses', process.id);
      await updateDoc(processRef, { 
        documents: updatedDocuments,
        updatedAt: new Date().toISOString(),
      });

      onUpdate({ ...process, documents: updatedDocuments });
      setNewDocument({});
      toast.success('Documento añadido con éxito');
    } catch (error) {
      console.error('Error adding document:', error);
      toast.error('Error al añadir el documento');
    }
  };

  const handleAddTask = async () => {
    if (!newTask.title || !newTask.dueDate) {
      toast.error('Por favor complete todos los campos requeridos');
      return;
    }

    try {
      const updatedTasks = [
        ...process.onboardingTasks,
        {
          ...newTask,
          id: `task_${Date.now()}`,
          status: 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as OnboardingTask
      ];

      const processRef = doc(db, 'hiringProcesses', process.id);
      await updateDoc(processRef, { 
        onboardingTasks: updatedTasks,
        updatedAt: new Date().toISOString(),
      });

      onUpdate({ ...process, onboardingTasks: updatedTasks });
      setNewTask({});
      toast.success('Tarea añadida con éxito');
    } catch (error) {
      console.error('Error adding task:', error);
      toast.error('Error al añadir la tarea');
    }
  };

  const handleSaveChanges = async () => {
    setIsUpdating(true);
    try {
      const processRef = doc(db, 'hiringProcesses', process.id);
      await updateDoc(processRef, {
        ...editedProcess,
        updatedAt: new Date().toISOString(),
      });
      onUpdate(editedProcess);
      setIsEditing(false);
      toast.success('Cambios guardados con éxito');
    } catch (error) {
      console.error('Error saving changes:', error);
      toast.error('Error al guardar los cambios');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Detalles del Proceso</h2>
            <p className="text-sm mt-1">
              {process.candidateId} - {process.candidatureId}
            </p>
          </div>
          <button onClick={onClose} className="text-white hover:text-blue-200">
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => setActiveTab('documents')}
              className={`px-4 py-2 rounded-md ${
                activeTab === 'documents'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FileText className="inline-block mr-2" size={18} />
              Documentos
            </button>
            <button
              onClick={() => setActiveTab('onboarding')}
              className={`px-4 py-2 rounded-md ${
                activeTab === 'onboarding'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <CheckCircle className="inline-block mr-2" size={18} />
              Onboarding
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={`px-4 py-2 rounded-md ${
                activeTab === 'notes'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Edit2 className="inline-block mr-2" size={18} />
              Notas
            </button>
          </div>

          {activeTab === 'documents' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Documentos</h3>
                <button
                  onClick={() => setNewDocument({})}
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                >
                  <Plus className="inline-block mr-2" size={18} />
                  Añadir documento
                </button>
              </div>

              <div className="space-y-4">
                {process.documents.map((document) => (
                  <div key={document.id} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                    <div>
                      <h4 className="font-medium">{document.name}</h4>
                      <p className="text-sm text-gray-500">{document.type}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        document.status === 'signed' ? 'bg-green-100 text-green-800' :
                        document.status === 'sent' ? 'bg-yellow-100 text-yellow-800' :
                        document.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {document.status}
                      </span>
                      <button
                        onClick={() => handleSendDocument(document)}
                        disabled={document.status === 'signed'}
                        className="text-blue-600 hover:text-blue-800 disabled:opacity-50"
                      >
                        <Send size={18} />
                      </button>
                      <a
                        href={document.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:text-gray-800"
                      >
                        <Download size={18} />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'onboarding' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Tareas de Onboarding</h3>
                <button
                  onClick={() => setNewTask({})}
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                >
                  <Plus className="inline-block mr-2" size={18} />
                  Añadir tarea
                </button>
              </div>

              <div className="space-y-4">
                {process.onboardingTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                    <div>
                      <h4 className="font-medium">{task.title}</h4>
                      <p className="text-sm text-gray-500">
                        Vence el: {new Date(task.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        task.status === 'completed' ? 'bg-green-100 text-green-800' :
                        task.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {task.status}
                      </span>
                      <button
                        onClick={() => {/* Handle task completion */}}
                        className="text-green-600 hover:text-green-800"
                      >
                        <CheckCircle size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Notas</h3>
              {isEditing ? (
                <textarea
                  value={editedProcess.notes}
                  onChange={(e) => setEditedProcess({ ...editedProcess, notes: e.target.value })}
                  className="w-full h-40 p-2 border border-gray-300 rounded-md"
                />
              ) : (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="whitespace-pre-wrap">{process.notes || 'Sin notas'}</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-gray-50 flex justify-between">
          <div className="flex space-x-2">
            <select
              value={process.status}
              onChange={(e) => handleStatusChange(e.target.value as HiringProcess['status'])}
              className="border border-gray-300 rounded-md px-4 py-2"
            >
              <option value="pending_offer">Pendiente de oferta</option>
              <option value="offer_sent">Oferta enviada</option>
              <option value="offer_accepted">Oferta aceptada</option>
              <option value="contract_pending">Contrato pendiente</option>
              <option value="contract_sent">Contrato enviado</option>
              <option value="hired">Contratado</option>
              <option value="rejected">Rechazado</option>
            </select>
          </div>
          <div className="flex space-x-2">
            {isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveChanges}
                  disabled={isUpdating}
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50 flex items-center"
                >
                  {isUpdating ? (
                    <>
                      <Clock className="animate-spin mr-2" size={18} />
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
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 flex items-center"
              >
                <Edit2 className="mr-2" size={18} />
                Editar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}