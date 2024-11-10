import React from 'react';
import { Zap, RefreshCw } from 'lucide-react';

interface DescriptionTabProps {
  description: string;
  isEditing: boolean;
  isGeneratingDescription: boolean;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleRegenerateDescription: () => void;
}

export function DescriptionTab({
  description,
  isEditing,
  isGeneratingDescription,
  handleInputChange,
  handleRegenerateDescription
}: DescriptionTabProps) {
  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">Descripción del puesto</h3>
          <button
            onClick={handleRegenerateDescription}
            disabled={isGeneratingDescription}
            className="bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600 transition duration-300 flex items-center disabled:opacity-50"
          >
            {isGeneratingDescription ? (
              <>
                <RefreshCw size={18} className="mr-2 animate-spin" />
                Actualizando...
              </>
            ) : (
              <>
                <Zap size={18} className="mr-2" />
                Actualizar con IA
              </>
            )}
          </button>
        </div>

        {isEditing ? (
          <textarea
            name="description"
            value={description}
            onChange={handleInputChange}
            className="w-full h-96 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Describe el puesto..."
          />
        ) : (
          <div className="prose max-w-none">
            {description.split('\n').map((paragraph, index) => (
              <p key={index} className="mb-4">{paragraph}</p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}