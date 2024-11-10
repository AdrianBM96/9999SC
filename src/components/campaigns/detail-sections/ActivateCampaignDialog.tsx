import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ActivateCampaignDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function ActivateCampaignDialog({ isOpen, onClose, onConfirm }: ActivateCampaignDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-start mb-4">
          <AlertCircle className="w-6 h-6 text-yellow-500 mr-3 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              ¿Activar campaña?
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Al activar la campaña, comenzará el proceso de reclutamiento y se ejecutarán
              los pasos configurados. Asegúrate de que toda la configuración es correcta.
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Activar campaña
          </button>
        </div>
      </div>
    </div>
  );
}
