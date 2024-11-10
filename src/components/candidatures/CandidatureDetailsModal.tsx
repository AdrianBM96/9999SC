import React, { useState, useEffect } from 'react';
import { Candidature, Department, DetailedLinkedInProfile } from '../../types';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase';
import { generateJobDescription } from '../../services/ai';
import { toast } from 'react-toastify';
import { Layout } from './details/Layout';
import { GeneralTab } from './details/tabs/GeneralTab';
import { DescriptionTab } from './details/tabs/DescriptionTab';
import { CandidatesTab } from './details/tabs/CandidatesTab';
import { AnalyticsTab } from './details/tabs/AnalyticsTab';
import { SettingsTab } from './details/tabs/SettingsTab';
import { PublishTab } from './details/tabs/PublishTab';

interface CandidatureDetailsModalProps {
  candidature: Candidature;
  onClose: () => void;
  departments: Department[];
  onUpdate: (updatedCandidature: Candidature) => void;
}

export function CandidatureDetailsModal({
  candidature,
  onClose,
  departments,
  onUpdate
}: CandidatureDetailsModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedCandidature, setEditedCandidature] = useState(candidature);
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [candidates, setCandidates] = useState<DetailedLinkedInProfile[]>([]);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);

  useEffect(() => {
    fetchCandidates();
  }, [candidature.id]);

  const fetchCandidates = async () => {
    try {
      const q = query(
        collection(db, 'savedCandidates'),
        where('candidatureId', '==', candidature.id)
      );
      const querySnapshot = await getDocs(q);
      const candidatesList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as DetailedLinkedInProfile));
      setCandidates(candidatesList);
    } catch (error) {
      console.error('Error fetching candidates:', error);
      toast.error('Error al cargar los candidatos');
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEditedCandidature(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsUpdating(true);
    try {
      onUpdate(editedCandidature);
      setIsEditing(false);
      toast.success('Candidatura actualizada con éxito');
    } catch (error) {
      console.error('Error updating candidature:', error);
      toast.error('Error al actualizar la candidatura');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRegenerateDescription = async () => {
    setIsGeneratingDescription(true);
    try {
      const newDescription = await generateJobDescription(editedCandidature);
      setEditedCandidature(prev => ({ ...prev, description: newDescription }));
      handleSave();
      toast.success('Descripción actualizada con éxito');
    } catch (error) {
      console.error('Error generating description:', error);
      toast.error('Error al generar la descripción');
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <GeneralTab
            editedCandidature={editedCandidature}
            isEditing={isEditing}
            departments={departments}
            handleInputChange={handleInputChange}
          />
        );
      case 'description':
        return (
          <DescriptionTab
            description={editedCandidature.description}
            isEditing={isEditing}
            isGeneratingDescription={isGeneratingDescription}
            handleInputChange={handleInputChange}
            handleRegenerateDescription={handleRegenerateDescription}
          />
        );
      case 'candidates':
        return (
          <CandidatesTab
            candidates={candidates}
            onViewProfile={(candidate) => {
              // Implementar vista de perfil del candidato
              console.log('Ver perfil de:', candidate);
            }}
          />
        );
      case 'analytics':
        return <AnalyticsTab />;
      case 'publish':
        return <PublishTab />;
      case 'settings':
        return (
          <SettingsTab
            status={editedCandidature.status}
            isEditing={isEditing}
            handleInputChange={handleInputChange}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Layout
      candidature={candidature}
      isEditing={isEditing}
      isUpdating={isUpdating}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      onClose={onClose}
      onEdit={() => setIsEditing(true)}
      onSave={handleSave}
      onCancel={() => {
        setEditedCandidature(candidature);
        setIsEditing(false);
      }}
    >
      {renderContent()}
    </Layout>
  );
}