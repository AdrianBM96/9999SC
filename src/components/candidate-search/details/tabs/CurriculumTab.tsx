import React from 'react';
import { FileText, ExternalLink } from 'lucide-react';
import { DetailedLinkedInProfile } from '../../../../types';

interface CurriculumTabProps {
  candidate: DetailedLinkedInProfile;
}

export function CurriculumTab({ candidate }: CurriculumTabProps) {
  const handleViewCV = () => {
    if (candidate.cvUrl) {
      window.open(candidate.cvUrl, '_blank');
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h4 className="text-xl font-semibold text-blue-600 border-b pb-2">Currículum</h4>
        </div>

        {candidate.cvUrl ? (
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <FileText className="w-5 h-5 text-gray-400 mr-3" />
              <span className="text-gray-900 font-medium">CV_{candidate.name.replace(/\s+/g, '_')}.pdf</span>
            </div>
            <button
              onClick={handleViewCV}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Ver CV
            </button>
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">No hay CV disponible</p>
            <p className="text-gray-500 text-sm mt-1">
              Este candidato aún no ha subido su currículum.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}