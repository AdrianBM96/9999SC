import React, { useState } from 'react';
import { 
  X, Edit2, MapPin, Linkedin, User, MessageCircle, Briefcase, School, 
  Cpu, FileText, Mail, Phone, Trash2 
} from 'lucide-react';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { DetailedLinkedInProfile, Candidature } from '../../types';
import { toast } from 'react-toastify';
import {
  SummaryTab,
  ContactTab,
  ExperienceTab,
  EducationTab,
  AIEvaluationTab,
  CandidaturesTab,
  CurriculumTab,
  SkillsTab
} from './details/tabs';

interface CandidateDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: DetailedLinkedInProfile;
  onUpdateProfile: (candidate: DetailedLinkedInProfile) => void;
  isUpdatingProfile: boolean;
  candidatures: Candidature[];
}

export function CandidateDetailsModal({
  isOpen,
  onClose,
  candidate,
  onUpdateProfile,
  isUpdatingProfile,
  candidatures
}: CandidateDetailsModalProps) {
  const [activeTab, setActiveTab] = useState('summary');
  const [isEditing, setIsEditing] = useState(false);
  const [editedCandidate, setEditedCandidate] = useState(candidate);

  if (!isOpen) return null;

  const handleDelete = async () => {
    if (!candidate.docId) {
      toast.error('ID de candidato no válido');
      return;
    }

    if (window.confirm('¿Estás seguro de que quieres eliminar este candidato?')) {
      try {
        await deleteDoc(doc(db, 'savedCandidates', candidate.docId));
        toast.success('Candidato eliminado con éxito');
        onClose();
      } catch (error) {
        console.error('Error deleting candidate:', error);
        toast.error('Error al eliminar el candidato');
      }
    }
  };

  const handleSave = async () => {
    try {
      await onUpdateProfile(editedCandidate);
      setIsEditing(false);
      toast.success('Perfil actualizado con éxito');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Error al actualizar el perfil');
    }
  };

  const menuItems = [
    { id: 'summary', label: 'Resumen', icon: User },
    { id: 'contact', label: 'Contacto', icon: MessageCircle },
    { id: 'experience', label: 'Experiencia', icon: Briefcase },
    { id: 'education', label: 'Educación', icon: School },
    { id: 'skills', label: 'Habilidades', icon: FileText },
    { id: 'aiEvaluation', label: 'Evaluación IA', icon: Cpu },
    { id: 'candidatures', label: 'Candidaturas', icon: FileText },
    { id: 'curriculum', label: 'Currículum', icon: FileText }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'summary':
        return <SummaryTab candidate={candidate} />;
      case 'contact':
        return (
          <ContactTab
            candidate={candidate}
            isEditing={isEditing}
            onSave={handleSave}
            onEdit={() => setIsEditing(true)}
            onCancel={() => setIsEditing(false)}
            onUpdateContact={(updates) => setEditedCandidate({ ...editedCandidate, ...updates })}
          />
        );
      case 'experience':
        return <ExperienceTab candidate={candidate} />;
      case 'education':
        return <EducationTab candidate={candidate} />;
      case 'skills':
        return <SkillsTab candidate={candidate} />;
      case 'aiEvaluation':
        return (
          <AIEvaluationTab
            candidate={candidate}
            candidatures={candidatures}
            selectedCandidature={candidate.candidatureId || ''}
            onUpdateEvaluation={(evaluation) => setEditedCandidate({ ...editedCandidate, aiEvaluation: evaluation })}
          />
        );
      case 'candidatures':
        return (
          <CandidaturesTab
            candidate={candidate}
            candidatures={candidatures}
            selectedCandidature={candidate.candidatureId || ''}
            onCandidatureChange={(candidatureId) => setEditedCandidate({ ...editedCandidate, candidatureId })}
          />
        );
      case 'curriculum':
        return <CurriculumTab candidate={candidate} />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-end z-50">
      <div className="h-full w-[1100px] bg-white flex shadow-2xl animate-[slideIn_0.3s_ease-out]">
        {/* Sidebar */}
        <div className="w-64 border-r border-gray-200 flex flex-col">
          <nav className="flex-1">
            <div className="space-y-1 py-4">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center px-8 py-3 text-sm font-medium transition-colors duration-150 ${
                    activeTab === item.id
                      ? 'text-blue-600 bg-blue-50 border-r-4 border-blue-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon className={`mr-3 h-5 w-5 ${
                    activeTab === item.id ? 'text-blue-600' : 'text-gray-400'
                  }`} />
                  {item.label}
                </button>
              ))}
            </div>
          </nav>
        </div>

        {/* Contenido principal */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 bg-white">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <img
                  src={candidate.profile_picture_url || 'https://via.placeholder.com/48'}
                  alt={candidate.name}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{candidate.name}</h2>
                  <p className="text-gray-600">{candidate.headline || 'Sin rol definido'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleDelete}
                  className="bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors flex items-center"
                >
                  <Trash2 size={18} className="mr-2" />
                  Eliminar
                </button>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors flex items-center"
                  >
                    <Edit2 size={18} className="mr-2" />
                    Editar
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-100"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isUpdatingProfile}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      Guardar
                    </button>
                  </>
                )}
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                  <X size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* Contenido */}
          <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
}