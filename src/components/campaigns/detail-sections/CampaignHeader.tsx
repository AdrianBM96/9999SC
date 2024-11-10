import React, { useState } from 'react';
import { Campaign } from '../../../types/campaign';
import { X, Play, Pause, AlertCircle } from 'lucide-react';
import { ActivateCampaignDialog } from './ActivateCampaignDialog';

interface CampaignHeaderProps {
  campaign: Campaign;
  onClose: () => void;
  onStatusChange?: (newStatus: 'active' | 'paused' | 'draft') => void;
}

export function CampaignHeader({ campaign, onClose, onStatusChange }: CampaignHeaderProps) {
  const [showActivateDialog, setShowActivateDialog] = useState(false);

  const handleActivate = () => {
    setShowActivateDialog(true);
  };

  const handleConfirmActivate = () => {
    onStatusChange?.('active');
    setShowActivateDialog(false);
  };

  return (
    <>
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900">{campaign.name}</h2>
            <div className="mt-1 flex items-center space-x-4">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                campaign.status === 'active' ? 'bg-green-100 text-green-800' :
                campaign.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {campaign.status === 'active' ? 'Activa' :
                 campaign.status === 'draft' ? 'Borrador' :
                 'Pausada'}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {campaign.status === 'draft' && (
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-yellow-500 mr-2" />
                <span className="text-sm text-gray-600">Campaña en modo borrador</span>
                <button
                  onClick={handleActivate}
                  className="ml-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Activar campaña
                </button>
              </div>
            )}

            {campaign.status === 'active' && (
              <button
                onClick={() => onStatusChange?.('paused')}
                className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 flex items-center"
              >
                <Pause className="w-4 h-4 mr-2" />
                Pausar
              </button>
            )}

            {campaign.status === 'paused' && (
              <button
                onClick={() => onStatusChange?.('active')}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
              >
                <Play className="w-4 h-4 mr-2" />
                Reanudar
              </button>
            )}

            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <span className="sr-only">Cerrar</span>
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      <ActivateCampaignDialog
        isOpen={showActivateDialog}
        onClose={() => setShowActivateDialog(false)}
        onConfirm={handleConfirmActivate}
      />
    </>
  );
}

