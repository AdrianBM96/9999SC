import React, { useState } from 'react';
import { Campaign } from '../../types';
import { 
  Briefcase, 
  Calendar, 
  AlertCircle, 
  Eye, 
  Trash2, 
  Play, 
  User,
  Info as InfoIcon,
  CheckCircle2,
  Clock,
  Users,
  Search,
  ArrowUpDown
} from 'lucide-react';
import { CampaignDetails } from './CampaignDetails';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { toast } from 'react-toastify';

type SortField = 'name' | 'createdAt' | 'updatedAt' | 'status';
type SortOrder = 'asc' | 'desc';

interface CampaignListProps {
  campaigns: Campaign[];
  onDeleteCampaign: (campaignId: string) => void;
  onUpdateCampaign: (updatedCampaign: Campaign) => void;
}

export function CampaignList({ campaigns, onDeleteCampaign, onUpdateCampaign }: CampaignListProps) {
  // UI State
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [processingCampaign, setProcessingCampaign] = useState<string | null>(null);
  
  // Filter and Sort State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Función para ordenar campañas
  const sortCampaigns = (a: Campaign, b: Campaign) => {
    switch (sortField) {
      case 'name':
        return sortOrder === 'asc' 
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      case 'createdAt':
        return sortOrder === 'asc'
          ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'updatedAt':
        return sortOrder === 'asc'
          ? new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
          : new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      case 'status':
        return sortOrder === 'asc'
          ? a.status.localeCompare(b.status)
          : b.status.localeCompare(a.status);
      default:
        return 0;
    }
  };

  // Filtrar y ordenar campañas
  const filteredAndSortedCampaigns = campaigns
    .filter(campaign => {
      const matchesSearch = searchTerm === '' ||
        campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaign.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || campaign.status === filterStatus;
      
      return matchesSearch && matchesStatus;
    })
    .sort(sortCampaigns);

  // Estadísticas de campañas
  const campaignStats = {
    total: campaigns.length,
    active: campaigns.filter(c => c.status === 'active').length,
    draft: campaigns.filter(c => c.status === 'draft').length,
    completed: campaigns.filter(c => c.status === 'completed').length,
    totalCandidates: campaigns.reduce((acc, c) => acc + (c.candidates?.length || 0), 0),
    selectedCandidates: campaigns.reduce((acc, c) => acc + (c.metrics?.selected || 0), 0),
  };

  interface StatusInfo {
  color: string;
  icon: React.ReactNode;
  label: string;
  description: string;
}

const getStatusInfo = (status: string, campaign: Campaign): StatusInfo => {
  const totalCandidates = campaign.candidates?.length || 0;
  const selectedCandidates = campaign.metrics?.selected || 0;
  const interviewsScheduled = campaign.metrics?.interviews_scheduled || 0;

  switch (status) {
    case 'draft':
      return {
        color: 'bg-gray-100 text-gray-800',
        icon: <AlertCircle className="w-4 h-4" />,
        label: 'Borrador',
        description: 'La campaña aún no ha sido iniciada'
      };
    case 'active':
      return {
        color: 'bg-green-100 text-green-800',
        icon: <Play className="w-4 h-4" />,
        label: 'Activa',
        description: `${interviewsScheduled} entrevistas programadas, ${selectedCandidates} candidatos seleccionados de ${totalCandidates}`
      };
    case 'paused':
      return {
        color: 'bg-yellow-100 text-yellow-800',
        icon: <AlertCircle className="w-4 h-4" />,
        label: 'Pausada',
        description: 'La campaña está temporalmente pausada'
      };
    case 'completed':
      return {
        color: 'bg-blue-100 text-blue-800',
        icon: <CheckCircle2 className="w-4 h-4" />,
        label: 'Completada',
        description: `Finalizada con ${selectedCandidates} candidatos seleccionados de ${totalCandidates}`
      };
    default:
      return {
        color: 'bg-gray-100 text-gray-800',
        icon: <AlertCircle className="w-4 h-4" />,
        label: status,
        description: 'Estado desconocido'
      };
  }
};

const getStatusColor = (status: string) => {
  const statusColors = {
    draft: 'bg-gray-100 text-gray-800',
    active: 'bg-green-100 text-green-800',
    paused: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-blue-100 text-blue-800'
  };
  return statusColors[status as keyof typeof statusColors] || statusColors.draft;
};

  const handleDeleteClick = async (campaign: Campaign) => {
    // No permitir eliminar campañas activas con candidatos
    if (campaign.status === 'active' && campaign.candidates?.length) {
      toast.error('No se puede eliminar una campaña activa con candidatos', {
        description: 'Debes pausar o completar la campaña primero'
      });
      return;
    }

    // Mensaje de confirmación específico según el estado de la campaña
    const message = campaign.candidates?.length
      ? `¿Estás seguro de que quieres eliminar esta campaña? Se eliminarán ${campaign.candidates.length} candidatos asociados.`
      : '¿Estás seguro de que quieres eliminar esta campaña?';

    const confirmDelete = window.confirm(message);
    
    if (confirmDelete) {
      try {
        setProcessingCampaign(campaign.id);
        await onDeleteCampaign(campaign.id);
        toast.success('Campaña eliminada con éxito');
      } catch (error) {
        console.error('Error al eliminar la campaña:', error);
        toast.error('Error al eliminar la campaña', {
          description: 'Por favor, inténtalo de nuevo más tarde'
        });
      } finally {
        setProcessingCampaign(null);
      }
    }
  };

  const [processingCampaign, setProcessingCampaign] = useState<string | null>(null);

  const handleStartCampaign = async (campaign: Campaign) => {
    if (!campaign.candidates?.length) {
      toast.warning('No hay candidatos asignados a esta campaña');
      return;
    }

    try {
      setProcessingCampaign(campaign.id);
      const campaignRef = doc(db, 'campaigns', campaign.id);
      
      const updates = {
        status: 'active',
        startedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        metrics: {
          ...campaign.metrics,
          sent: 0,
          opened: 0,
          responded: 0,
          applied: 0,
          interviews_scheduled: 0,
          selected: 0,
          rejected: 0
        }
      };

      await updateDoc(campaignRef, updates);
      
      const updatedCampaign = { 
        ...campaign, 
        ...updates,
        candidates: campaign.candidates.map(candidate => ({
          ...candidate,
          status: 'new',
          lastInteraction: new Date().toISOString(),
          history: [
            {
              timestamp: new Date().toISOString(),
              status: 'new',
              note: 'Campaña iniciada'
            },
            ...(candidate.history || [])
          ]
        }))
      };
      
      onUpdateCampaign(updatedCampaign);
      toast.success('Campaña iniciada con éxito', {
        description: `Se procesarán ${campaign.candidates.length} candidatos`
      });
    } catch (error) {
      console.error('Error al iniciar la campaña:', error);
      toast.error('Error al iniciar la campaña', {
        description: 'Por favor, inténtalo de nuevo más tarde'
      });
    } finally {
      setProcessingCampaign(null);
    }
  };

  return (
    <>
      {campaigns.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <Briefcase className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay campañas creadas
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            Crea tu primera campaña para comenzar a gestionar candidatos
          </p>
          <button
            onClick={() => {/* TODO: Agregar función para crear nueva campaña */}}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <Play className="w-4 h-4 mr-2" />
            Crear nueva campaña
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-medium text-gray-900">Campañas</h2>
                <p className="text-sm text-gray-500">
                  {campaignStats.total} campaña{campaignStats.total !== 1 ? 's' : ''} en total
                </p>
              </div>
              <button
                onClick={() => {/* TODO: Agregar función para crear nueva campaña */}}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <Play className="w-4 h-4 mr-2" />
                Nueva campaña
              </button>
            </div>

            {/* Estadísticas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0 p-3 rounded-lg bg-blue-100">
                    <Briefcase className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-900">Activas</h3>
                    <p className="text-2xl font-semibold text-gray-900">{campaignStats.active}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0 p-3 rounded-lg bg-yellow-100">
                    <AlertCircle className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-900">Borradores</h3>
                    <p className="text-2xl font-semibold text-gray-900">{campaignStats.draft}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0 p-3 rounded-lg bg-green-100">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-900">Candidatos</h3>
                    <p className="text-2xl font-semibold text-gray-900">{campaignStats.totalCandidates}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0 p-3 rounded-lg bg-purple-100">
                    <CheckCircle2 className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-900">Seleccionados</h3>
                    <p className="text-2xl font-semibold text-gray-900">{campaignStats.selectedCandidates}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Filtros y búsqueda */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar campañas..."
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>
              <div className="flex space-x-4">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="all">Todos los estados</option>
                  <option value="draft">Borradores</option>
                  <option value="active">Activas</option>
                  <option value="completed">Completadas</option>
                </select>
                <select
                  value={sortField}
                  onChange={(e) => setSortField(e.target.value as SortField)}
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="createdAt">Fecha de creación</option>
                  <option value="updatedAt">Última actualización</option>
                  <option value="name">Nombre</option>
                  <option value="status">Estado</option>
                </select>
                <button
                  onClick={() => setSortOrder(order => order === 'asc' ? 'desc' : 'asc')}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  title={`Ordenar ${sortOrder === 'asc' ? 'descendente' : 'ascendente'}`}
                >
                  <ArrowUpDown 
                    className={`h-4 w-4 transition-transform duration-200 ${
                      sortOrder === 'desc' ? 'transform rotate-180' : ''
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Indicador de filtros activos */}
          {(searchTerm || filterStatus !== 'all') && (
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <InfoIcon className="h-5 w-5 text-blue-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    Mostrando {filteredAndSortedCampaigns.length} de {campaigns.length} campañas
                    {searchTerm && ` • Búsqueda: "${searchTerm}"`}
                    {filterStatus !== 'all' && ` • Estado: ${filterStatus}`}
                  </p>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setFilterStatus('all');
                    }}
                    className="mt-1 text-sm text-blue-600 hover:text-blue-500"
                  >
                    Limpiar filtros
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedCampaigns.length === 0 ? (
          <div className="col-span-3 text-center py-12">
            <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No se encontraron campañas
            </h3>
            <p className="text-sm text-gray-500">
              {searchTerm 
                ? 'No hay campañas que coincidan con tu búsqueda' 
                : filterStatus !== 'all'
                ? `No hay campañas en estado "${filterStatus}"`
                : 'No hay campañas disponibles'}
            </p>
          </div>
        ) : (
          filteredAndSortedCampaigns.map((campaign) => (
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
                  Fecha límite: {campaign.endDate ? new Date(campaign.endDate).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  }) : 'No definida'}
                </p>
                <p className="text-gray-600 flex items-center text-sm">
                  <span className="flex items-center">
                    <span className="mr-2">•</span>
                    Creada: {new Date(campaign.createdAt).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'short'
                    })}
                  </span>
                  <span className="mx-2">•</span>
                  <span>
                    Última actualización: {new Date(campaign.updatedAt).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'short'
                    })}
                  </span>
                </p>
                <div className="flex items-center justify-between group relative">
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center">
                      <span className="text-sm text-gray-600 mr-2">Estado:</span>
                      {(() => {
                        const statusInfo = getStatusInfo(campaign.status, campaign);
                        return (
                          <span className={`
                            px-2 py-1 inline-flex items-center space-x-1 text-xs font-medium rounded-full
                            ${statusInfo.color}
                          `}>
                            <span className="flex-shrink-0">{statusInfo.icon}</span>
                            <span>{statusInfo.label}</span>
                          </span>
                        );
                      })()}
                    </div>
                  </div>

                  <div className="text-xs">
                    {(() => {
                      const statusInfo = getStatusInfo(campaign.status, campaign);
                      return (
                        <div className="flex items-center text-gray-500">
                          <span>{statusInfo.description}</span>
                          <div className="relative ml-2 group">
                            <button
                              type="button"
                              className="flex items-center text-gray-400 hover:text-gray-500"
                            >
                              <span className="sr-only">Ver detalles del estado</span>
                              <InfoIcon className="h-4 w-4" />
                            </button>
                            <div className="hidden group-hover:block absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 p-2 bg-gray-900 text-white text-xs rounded shadow-lg z-10">
                              <div className="space-y-1">
                                <p>
                                  <span className="font-medium">Última actualización:</span>{' '}
                                  {new Date(campaign.updatedAt).toLocaleDateString('es-ES', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric'
                                  })}
                                </p>
                                <p>
                                  <span className="font-medium">Candidatos activos:</span>{' '}
                                  {campaign.candidates?.filter(c => 
                                    ['new', 'form_submitted', 'under_review', 'interview_scheduled'].includes(c.status)
                                  ).length || 0}
                                </p>
                                <p>
                                  <span className="font-medium">Entrevistas programadas:</span>{' '}
                                  {campaign.metrics?.interviews_scheduled || 0}
                                </p>
                                <p>
                                  <span className="font-medium">Tasa de éxito:</span>{' '}
                                  {campaign.candidates?.length 
                                    ? `${Math.round((campaign.metrics?.selected || 0) / campaign.candidates.length * 100)}%`
                                    : 'N/A'
                                  }
                                </p>
                              </div>
                              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
                                <div className="w-2 h-2 bg-gray-900 transform rotate-45" />
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                  {/* Métricas principales */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Total candidatos</span>
                        <span className="text-sm font-medium text-gray-900">
                          {campaign.candidates?.length || 0}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Activos</span>
                        <span className="text-sm font-medium text-blue-600">
                          {campaign.candidates?.filter(c => 
                            ['new', 'form_submitted', 'under_review', 'interview_scheduled'].includes(c.status)
                          ).length || 0}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Entrevistas</span>
                        <span className="text-sm font-medium text-purple-600">
                          {campaign.metrics?.interviews_scheduled || 0}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Seleccionados</span>
                        <span className="text-sm font-medium text-green-600">
                          {campaign.metrics?.selected || 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Barra de progreso */}
                  {campaign.candidates && campaign.candidates.length > 0 && (
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-500">Progreso</span>
                        <span className="font-medium text-gray-900">
                          {Math.round((
                            (campaign.metrics?.selected || 0) / campaign.candidates.length
                          ) * 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-green-500 h-1.5 rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.round((
                              (campaign.metrics?.selected || 0) / campaign.candidates.length
                            ) * 100)}%`
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Avatares de candidatos */}
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      Últimos candidatos añadidos
                    </div>
                    <div className="flex -space-x-2">
                      {(campaign.candidates || []).slice(0, 3).map((candidate, idx) => (
                        <div
                          key={candidate.id}
                          className="h-8 w-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center"
                          style={{ zIndex: 3 - idx }}
                        >
                          {candidate.name ? (
                            <span className="text-xs font-medium text-gray-600">
                              {candidate.name.charAt(0).toUpperCase()}
                            </span>
                          ) : (
                            <User className="h-4 w-4 text-gray-400" />
                          )}
                        </div>
                      ))}
                      {(campaign.candidates?.length || 0) > 3 && (
                        <div
                          className="h-8 w-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center"
                          style={{ zIndex: 0 }}
                        >
                          <span className="text-xs font-medium text-gray-600">
                            +{(campaign.candidates?.length || 0) - 3}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
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
              {campaign.status === 'draft' && (
                <button 
                  className={`
                    font-medium flex items-center
                    ${processingCampaign === campaign.id
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-green-600 hover:text-green-800'
                    }
                  `}
                  onClick={() => !processingCampaign && handleStartCampaign(campaign)}
                  disabled={processingCampaign === campaign.id}
                >
                  {processingCampaign === campaign.id ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      Iniciando...
                    </>
                  ) : (
                    <>
                      <Play size={18} className="mr-2" />
                      Iniciar campaña
                    </>
                  )}
                </button>
              )}
              <button 
                className={`
                  font-medium flex items-center
                  ${processingCampaign === campaign.id
                    ? 'text-gray-400 cursor-not-allowed'
                    : campaign.status === 'active'
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-red-600 hover:text-red-800'
                  }
                `}
                onClick={() => !processingCampaign && handleDeleteClick(campaign)}
                disabled={processingCampaign === campaign.id || campaign.status === 'active'}
                title={campaign.status === 'active' ? 'No se puede eliminar una campaña activa' : 'Eliminar campaña'}
              >
                {processingCampaign === campaign.id ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Eliminando...
                  </>
                ) : (
                  <>
                    <Trash2 size={18} className="mr-2" />
                    Eliminar
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
          </div>
        </div>
      )}

      {/* Modal de detalles de campaña */}
      {selectedCampaign && (
        <CampaignDetails
          campaign={selectedCampaign}
          onClose={() => setSelectedCampaign(null)}
          onUpdateCampaign={onUpdateCampaign}
        />
      )}

      {/* Indicador de procesamiento global */}
      {processingCampaign && (
        <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 flex items-center space-x-3">
          <Clock className="w-5 h-5 text-blue-500 animate-spin" />
          <span className="text-sm text-gray-600">
            Procesando campaña...
          </span>
        </div>
      )}
    </>
  );
}