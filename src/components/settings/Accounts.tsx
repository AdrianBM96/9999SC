import React, { useState, useEffect } from 'react';
import { AlertTriangle, Loader } from 'lucide-react';
import { toast } from 'react-toastify';
import { generateHostedAuthLink } from '../../services/unipileService';

export function Accounts() {
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [hostedAuthUrl, setHostedAuthUrl] = useState<string | null>(null);

  useEffect(() => {
    generateLink();
  }, []);

  const generateLink = async () => {
    setIsGeneratingLink(true);
    try {
      const link = await generateHostedAuthLink();
      setHostedAuthUrl(link);
      // Abrir el enlace en una nueva pestaña automáticamente
      if (link) {
        window.open(link, '_blank');
      }
    } catch (error) {
      console.error('Error al generar el enlace de autenticación:', error);
      toast.error('Error al generar el enlace de autenticación');
    } finally {
      setIsGeneratingLink(false);
    }
  };

  return (
    <div className="space-y-8">
      <h3 className="text-2xl font-bold text-gray-900">Cuentas</h3>
      
      <div className="bg-white shadow rounded-lg p-6">
        <h4 className="text-lg font-semibold mb-4">Configuración de Autenticación</h4>
        {isGeneratingLink ? (
          <div className="flex items-center justify-center">
            <Loader className="animate-spin mr-2" size={20} />
            <span>Generando enlace de autenticación...</span>
          </div>
        ) : hostedAuthUrl ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Se ha abierto una nueva pestaña con el enlace de autenticación. Si no se abrió automáticamente, haga clic en el botón de abajo.
            </p>
            <button
              onClick={() => window.open(hostedAuthUrl, '_blank')}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300"
            >
              Abrir enlace de autenticación
            </button>
          </div>
        ) : (
          <p className="text-red-600">No se pudo generar el enlace de autenticación. Por favor, intente nuevamente.</p>
        )}
      </div>

      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-yellow-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              Asegúrese de completar el proceso de autenticación en la nueva pestaña que se ha abierto. Si encuentra algún problema, por favor, contacte con el soporte técnico.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}