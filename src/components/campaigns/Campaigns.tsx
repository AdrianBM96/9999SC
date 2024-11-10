import React, { useState, useEffect } from 'react';
import { Campaign } from '../../types';
import { Filter, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { CampaignDetailsModal } from './CampaignDetailsModal';
import { NewCampaignModal } from './NewCampaignModal';
import { toast } from 'react-toastify';
import { campaignService } from '../../services/campaignService';

export function Campaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [isNewCampaignModalOpen, setIsNewCampaignModalOpen] = useState(false);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const campaignsList = await campaignService.getCampaigns();
      setCampaigns(campaignsList);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      toast.error('Error al cargar las campañas');
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    try {
      await campaignService.deleteCampaign(id);
      setCampaigns(campaigns.filter(c => c.id !== id));
      toast.success('Campaña eliminada con éxito');
    } catch (error) {
      console.error('Error deleting campaign:', error);
      toast.error('Error al eliminar la campaña');
    }
  };

  const filteredCampaigns = campaigns.filter(campaign =>
    campaign.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="px-8 py-6">
      <div className="bg-white rounded-lg p-4 mb-6">
        <div className="flex items-center space-x-4">
          <button className="filter-button">
            <Filter size={16} className="mr-2" />
            Filtrar
          </button>

          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por nombre o tipo de filtro..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-bar-input"
            />
          </div>

          <button 
            onClick={() => setIsNewCampaignModalOpen(true)}
            className="new-button"
          >
            + Nueva campaña
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg">
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">
              {filteredCampaigns.length} resultados | Mostrando 1-25
            </span>
            <div className="flex space-x-2">
              <button className="p-1 text-gray-400 hover:text-gray-600">
                <ChevronLeft size={20} />
              </button>
              <button className="p-1 text-gray-400 hover:text-gray-600">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          <div className="grid grid-cols-7 gap-4 px-6 py-3 bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider">
            <div>Nombre</div>
            <div>Tipo</div>
            <div>Candidatura</div>
            <div>Fecha evaluación</div>
            <div>Candidatos</div>
            <div>Estado</div>
            <div>Acciones</div>
          </div>

          {filteredCampaigns.map((campaign) => (
            <div key={campaign.id} className="grid grid-cols-7 gap-4 px-6 py-4 hover:bg-gray-50">
              <div>
                <div 
                  className="text-sm font-medium text-gray-900 cursor-pointer hover:text-blue-600"
                  onClick={() => setSelectedCampaign(campaign)}
                >
                  {campaign.name}
                </div>
              </div>
              <div className="text-sm text-gray-500">
                {campaign.type === 'recruitment' ? 'Reclutamiento' : campaign.type}
              </div>
              <div className="text-sm text-gray-900">{campaign.candidatureId}</div>
              <div className="text-sm text-gray-500">
                {new Date(campaign.evaluationDate).toLocaleDateString()}
              </div>
              <div className="text-sm text-gray-900">0</div>
              <div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  campaign.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : campaign.status === 'paused'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {campaign.status === 'active' ? 'Activa' : 'Pausada'}
                </span>
              </div>
              <div className="text-sm text-gray-500">
                <button
                  onClick={() => handleDeleteCampaign(campaign.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedCampaign && (
        <CampaignDetailsModal
          campaign={selectedCampaign}
          onClose={() => setSelectedCampaign(null)}
        />
      )}

      {isNewCampaignModalOpen && (
        <NewCampaignModal
          isOpen={isNewCampaignModalOpen}
          onClose={() => setIsNewCampaignModalOpen(false)}
          onCampaignCreated={(newCampaign) => {
            setCampaigns([...campaigns, newCampaign]);
            setIsNewCampaignModalOpen(false);
          }}
        />
      )}
    </div>
  );
}

