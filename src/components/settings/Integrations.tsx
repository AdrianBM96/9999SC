import React, { useEffect, useState } from 'react';
import { validateIntegrations, saveIntegrationConfig } from '../../services/config';
import { AlertCircle, CheckCircle, XCircle, Key, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';
import { updateOpenAIConfig } from '../../services/ai/candidate/config';

const integrations = [
  {
    name: 'OpenAI',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg',
    description: 'Integración con OpenAI para evaluación de candidatos y análisis de perfiles.',
    configKey: 'openai',
    configurable: true
  },
  {
    name: 'LinkedIn',
    logo: 'https://content.linkedin.com/content/dam/me/business/en-us/amp/brand-site/v2/bg/LI-Bug.svg.original.svg',
    description: 'Integración con LinkedIn para importar perfiles y gestionar conexiones.',
    configKey: 'linkedin'
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
  const [openAIKey, setOpenAIKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [savingKey, setSavingKey] = useState(false);

  useEffect(() => {
    checkIntegrations();
    // Load saved OpenAI key if exists
    const savedKey = localStorage.getItem('openai_api_key');
    if (savedKey) {
      setOpenAIKey(savedKey);
      setIntegrationStatus(prev => ({ ...prev, openai: true }));
    }
  }, []);

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

  const handleSaveOpenAIKey = async () => {
    if (!openAIKey.trim()) {
      toast.error('Por favor ingresa una clave de API válida');
      return;
    }

    setSavingKey(true);
    try {
      // Save to localStorage
      localStorage.setItem('openai_api_key', openAIKey);
      
      // Update OpenAI configuration
      updateOpenAIConfig(openAIKey);
      
      // Update status
      setIntegrationStatus(prev => ({ ...prev, openai: true }));
      
      toast.success('Clave de API de OpenAI guardada correctamente');
    } catch (error) {
      console.error('Error saving OpenAI key:', error);
      toast.error('Error al guardar la clave de API');
    } finally {
      setSavingKey(false);
    }
  };

  const getStatusIcon = (status: boolean) => {
    if (loading) return <AlertCircle className="h-5 w-5 text-gray-400 animate-pulse" />;
    return status ? 
      <CheckCircle className="h-5 w-5 text-green-500" /> : 
      <XCircle className="h-5 w-5 text-red-500" />;
  };

  const renderIntegrationContent = (integration: typeof integrations[0]) => {
    if (integration.configKey === 'openai') {
      return (
        <div className="mt-4 space-y-4">
          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={openAIKey}
              onChange={(e) => setOpenAIKey(e.target.value)}
              placeholder="Ingresa tu clave de API de OpenAI"
              className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={() => setShowKey(!showKey)}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showKey ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          <button
            onClick={handleSaveOpenAIKey}
            disabled={savingKey}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
          >
            <Key className="w-4 h-4 mr-2" />
            {savingKey ? 'Guardando...' : 'Guardar clave de API'}
          </button>
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

