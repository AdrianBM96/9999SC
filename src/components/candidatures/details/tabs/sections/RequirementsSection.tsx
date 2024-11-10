import React from 'react';
import { GraduationCap, Languages, Wrench } from 'lucide-react';
import { Candidature } from '../../../../../types';

interface RequirementsSectionProps {
  editedCandidature: Candidature;
  isEditing: boolean;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function RequirementsSection({
  editedCandidature,
  isEditing,
  handleInputChange
}: RequirementsSectionProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-xl font-semibold mb-6">Requisitos</h3>
      <div className="grid grid-cols-3 gap-6">
        {/* Secciones de requisitos */}
        {/* ... (resto del código como en el original) */}
      </div>
    </div>
  );
}