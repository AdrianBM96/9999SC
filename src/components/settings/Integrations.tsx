import React, { useEffect, useState } from 'react';
import { validateIntegrations, updateUnipileConfig, getConfig } from '@/config';
import { AlertCircle, CheckCircle, XCircle, Globe, Link as LinkIcon, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';
import { getLinkedInAccounts } from '../../services/linkedin-integration';
import { OpenAIConfig } from './OpenAIConfig';

const integrations = [
  {
    name: 'OpenAI',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg',
    description: 'Integración con OpenAI para evaluación de candidatos y análisis de perfiles.',
    configKey: 'openai',
    configurable: true
  },
  {
    name: 'LinkedIn (Unipile)',
    logo: 'https://content.linkedin.com/content/dam/me/business/en-us/amp/brand-site/v2/bg/LI-Bug.svg.original.svg',
    description: 'Integración con LinkedIn a través de Unipile para importar perfiles y gestionar conexiones.',
    configKey: 'linkedin',
    configurable: true,
    configType: 'unipile'
  },
  {
    name: 'Google Calendar',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg',
    description: 'Sincronización con Google Calendar para gestionar entrevistas.',
    configKey: 'googleCalendar'
  },
  {
    name: 'Microsoft Calendar',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/d/df/Microsoft_Office_Outlook_%282018%E2%80%93present%29.svg',
    description: 'Sincronización con Microsoft Calendar para gestionar entrevistas.',
    configKey: 'microsoftCalendar'
  }
];

export function Integrations() {
  const [integrationStatus, setIntegrationStatus] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  // OpenAI state is now handled by OpenAIConfig component
  const [unipileToken, setUnipileToken] = useState('');
  const [unipileDsn, setUnipileDsn] = useState('');
  const [showUnipileToken, setShowUnipileToken] = useState(false);
  const [savingUnipile, setSavingUnipile] = useState(false);
  const [linkedInAccounts, setLinkedInAccounts] = useState<any[]>([]);

  useEffect(() => {
    checkIntegrations();
    loadSavedConfigs();
  }, []);

  const loadSavedConfigs = async () => {
    // OpenAI configuration is now handled by OpenAIConfig component

    // Load saved Unipile config
    const config = getConfig();
    if (config.unipileToken && config.unipileDsn) {
      setUnipileToken(config.unipileToken);
      setUnipileDsn(config.unipileDsn);
      
      try {
        const accounts = await getLinkedInAccounts();
        setLinkedInAccounts(accounts);
        setIntegrationStatus(prev => ({ ...prev, linkedin: accounts.length > 0 }));
      } catch (error) {
        console.error('Error loading LinkedIn accounts:', error);
      }
    }
  };

  const handleSaveUnipileConfig = async () => {
    if (!unipileToken.trim() || !unipileDsn.trim()) {
      toast.error('Por favor ingresa tanto el token como el DSN de Unipile');
      return;
    }

    setSavingUnipile(true);
    try {
      updateUnipileConfig(unipileToken, unipileDsn);
      
      // Verify the connection by trying to fetch LinkedIn accounts
      const accounts = await getLinkedInAccounts();
      setLinkedInAccounts(accounts);
      setIntegrationStatus(prev => ({ ...prev, linkedin: accounts.length > 0 }));
      
      toast.success('Configuración de Unipile guardada correctamente');
    } catch (error) {
      console.error('Error saving Unipile config:', error);
      toast.error('Error al guardar la configuración de Unipile');
    } finally {
      setSavingUnipile(false);
    }
  };

  const checkIntegrations = async () => {
    try {
      setLoading(true);
      const status = await validateIntegrations();
      setIntegrationStatus(status);
    } catch (error) {
      console.error('Error checking integrations:', error);
    } finally {
      setLoading(false);
    }
  };

  // OpenAI configuration is now handled by OpenAIConfig component

  const getStatusIcon = (status: boolean) => {
    if (loading) return <AlertCircle className="h-5 w-5 text-gray-400 animate-pulse" />;
    return status ? 
      <CheckCircle className="h-5 w-5 text-green-500" /> : 
      <XCircle className="h-5 w-5 text-red-500" />;
  };

  const renderIntegrationContent = (integration: typeof integrations[0]) => {
    if (integration.configKey === 'openai') {
      return (
        <div className="mt-4">
          <OpenAIConfig />
        </div>
      );
    }

    if (integration.configType === 'unipile') {
      return (
        <div className="mt-4 space-y-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                DSN de Unipile
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  value={unipileDsn}
                  onChange={(e) => setUnipileDsn(e.target.value)}
                  placeholder="Ej: api2.unipile.com:13233"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Token de Unipile
              </label>
              <div className="relative">
                <input
                  type={showUnipileToken ? 'text' : 'password'}
                  value={unipileToken}
                  onChange={(e) => setUnipileToken(e.target.value)}
                  placeholder="Ingresa tu token de Unipile"
                  className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  onClick={() => setShowUnipileToken(!showUnipileToken)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showUnipileToken ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={handleSaveUnipileConfig}
            disabled={savingUnipile}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
          >
            <LinkIcon className="w-4 h-4 mr-2" />
            {savingUnipile ? 'Guardando...' : 'Guardar configuración'}
          </button>

          {linkedInAccounts.length > 0 && (
            <div className="pt-4 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Cuentas de LinkedIn conectadas:</h4>
              <ul className="space-y-2">
                {linkedInAccounts.map((account: any) => (
                  <li key={account.id} className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    {account.name || account.email || 'Cuenta LinkedIn'}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-500">Estado</span>
          <span className={`text-sm font-medium ${
            integrationStatus[integration.configKey] ? 'text-green-600' : 'text-red-600'
          }`}>
            {integrationStatus[integration.configKey] ? 'Conectado' : 'Desconectado'}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold text-gray-900">Integraciones</h3>
        <button
          onClick={checkIntegrations}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Verificando...' : 'Verificar conexiones'}
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations.map((integration) => (
          <div key={integration.name} className="bg-white shadow rounded-lg p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <img 
                  src={integration.logo} 
                  alt={`${integration.name} logo`} 
                  className="h-10 w-10 object-contain"
                />
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">{integration.name}</h4>
                  <p className="mt-1 text-sm text-gray-500">{integration.description}</p>
                </div>
              </div>
              {getStatusIcon(integrationStatus[integration.configKey])}
            </div>
            {renderIntegrationContent(integration)}
          </div>
        ))}
      </div>
    </div>
  );
}

