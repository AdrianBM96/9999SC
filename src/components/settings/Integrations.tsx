import React, { useEffect, useState } from 'react';
import { validateIntegrations } from '../../services/config';
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';

const integrations = [
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

  useEffect(() => {
    checkIntegrations();
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

  const getStatusIcon = (status: boolean) => {
    if (loading) return <AlertCircle className="h-5 w-5 text-gray-400 animate-pulse" />;
    return status ? 
      <CheckCircle className="h-5 w-5 text-green-500" /> : 
      <XCircle className="h-5 w-5 text-red-500" />;
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
          </div>
        ))}
      </div>
    </div>
  );
}

