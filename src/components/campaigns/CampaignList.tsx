import React, { useState } from 'react';
import { Campaign } from '../../types';
import { Briefcase, Calendar, AlertCircle, Eye, Trash2, Play } from 'lucide-react';
import { CampaignDetails } from './CampaignDetails';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { toast } from 'react-toastify';

interface CampaignListProps {
  campaigns: Campaign[];
  onDeleteCampaign: (campaignId: string) => void;
  onUpdateCampaign: (updatedCampaign: Campaign) => void;
}

export function CampaignList({ campaigns, onDeleteCampaign, onUpdateCampaign }: CampaignListProps) {
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDeleteClick = (campaignId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta campaña?')) {
      onDeleteCampaign(campaignId);
    }
  };

  const handleStartCampaign = async (campaign: Campaign) => {
    try {
      const campaignRef = doc(db, 'campaigns', campaign.id);
      await updateDoc(campaignRef, { status: 'active' });
      const updatedCampaign = { ...campaign, status: 'active' };
      onUpdateCampaign(updatedCampaign);
      toast.success('Campaña iniciada con éxito');
    } catch (error) {
      console.error('Error al iniciar la campaña:', error);
      toast.error('Error al iniciar la campaña');
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {campaigns.map((campaign) => (
          <div key={campaign.id} className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{campaign.name}</h3>
              <div className="space-y-2">
                <p className="text-gray-600 flex items-center">
                  <Briefcase size={16} className="mr-2" />
                  Tipo: {campaign.type === 'recruitment' ? 'Reclutamiento' : campaign.type}
                </p>
                <p className="text-gray-600 flex items-center">
                  <Calendar size={16} className="mr-2" />
                  Fecha de evaluación: {new Date(campaign.evaluationDate).toLocaleDateString()}
                </p>
                <p className="text-gray-600 flex items-center">
                  <AlertCircle size={16} className="mr-2" />
                  Estado: 
                  <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(campaign.status)}`}>
                    {campaign.status}
                  </span>
                </p>
              </div>
            </div>
            <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
              <button 
                className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
                onClick={() => setSelectedCampaign(campaign)}
              >
                <Eye size={18} className="mr-2" />
                Ver detalles
              </button>
              {campaign.status === 'pending' && (
                <button 
                  className="text-green-600 hover:text-green-800 font-medium flex items-center"
                  onClick={() => handleStartCampaign(campaign)}
                >
                  <Play size={18} className="mr-2" />
                  Iniciar
                </button>
              )}
              <button 
                className="text-red-600 hover:text-red-800 font-medium flex items-center"
                onClick={() => handleDeleteClick(campaign.id)}
              >
                <Trash2 size={18} className="mr-2" />
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
      {selectedCampaign && (
        <CampaignDetails
          campaign={selectedCampaign}
          onClose={() => setSelectedCampaign(null)}
          onUpdateCampaign={onUpdateCampaign}
        />
      )}
    </>
  );
}