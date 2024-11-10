import React, { useState } from 'react';
import { Globe, ExternalLink, Check, AlertCircle } from 'lucide-react';

const jobPortals = [
  {
    id: 'infojobs',
    name: 'InfoJobs',
    logo: 'https://brand.infojobs.net/downloads/ij-logo_default/ij-logo-default_primary.png',
    status: 'connected',
    published: false
  },
  {
    id: 'linkedin',
    name: 'LinkedIn Jobs',
    logo: 'https://i0.wp.com/nhfpl.org/wp-content/uploads/2021/11/LI-Logo.png?fit=1024%2C250&ssl=1',
    status: 'connected',
    published: true
  },
  {
    id: 'indeed',
    name: 'Indeed',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Indeed_logo.svg/2560px-Indeed_logo.svg.png',
    status: 'not_connected',
    published: false
  },
  {
    id: 'jobandtalent',
    name: 'Jobandtalent',
    logo: 'https://d9hhrg4mnvzow.cloudfront.net/empleo.landings.jobandtalent.com/twitch/22b1a076-jt-logo.svg',
    status: 'connected',
    published: false
  }
];

export function PublishTab() {
  const [selectedPortals, setSelectedPortals] = useState<string[]>([]);
  const [publishing, setPublishing] = useState(false);

  const handleTogglePortal = (portalId: string) => {
    setSelectedPortals(prev => 
      prev.includes(portalId) 
        ? prev.filter(id => id !== portalId)
        : [...prev, portalId]
    );
  };

  const handlePublish = async () => {
    setPublishing(true);
    // Simular publicación
    await new Promise(resolve => setTimeout(resolve, 2000));
    setPublishing(false);
    // Mostrar mensaje de éxito
  };

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold">Publicar oferta</h3>
          <button
            onClick={handlePublish}
            disabled={selectedPortals.length === 0 || publishing}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {publishing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white mr-2"></div>
                Publicando...
              </>
            ) : (
              <>
                <Globe className="w-4 h-4 mr-2" />
                Publicar en portales seleccionados
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {jobPortals.map((portal) => (
            <div
              key={portal.id}
              className={`border rounded-lg p-4 ${
                portal.status === 'connected' 
                  ? 'hover:border-blue-500 cursor-pointer'
                  : 'opacity-50 cursor-not-allowed'
              } ${
                selectedPortals.includes(portal.id) ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
              }`}
              onClick={() => portal.status === 'connected' && handleTogglePortal(portal.id)}
            >
              <div className="flex items-center justify-between mb-4">
                <img 
                  src={portal.logo} 
                  alt={portal.name} 
                  className="h-8 object-contain"
                  style={{ maxWidth: '150px' }}
                />
                {portal.status === 'connected' ? (
                  <span className="text-green-600 text-sm flex items-center">
                    <Check size={16} className="mr-1" />
                    Conectado
                  </span>
                ) : (
                  <span className="text-gray-500 text-sm flex items-center">
                    <AlertCircle size={16} className="mr-1" />
                    No conectado
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div>
                  {portal.published ? (
                    <span className="text-green-600 text-sm">Publicado</span>
                  ) : (
                    <span className="text-gray-500 text-sm">No publicado</span>
                  )}
                </div>
                {portal.status === 'connected' && (
                  <button className="text-blue-600 hover:text-blue-800 text-sm flex items-center">
                    Ver publicación
                    <ExternalLink size={14} className="ml-1" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-2">Estadísticas de publicación</h4>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Visualizaciones totales</p>
              <p className="text-2xl font-semibold">1,234</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Clics</p>
              <p className="text-2xl font-semibold">456</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Aplicaciones</p>
              <p className="text-2xl font-semibold">89</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}