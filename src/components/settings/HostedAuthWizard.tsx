import React, { useState } from 'react';
import { Loader } from 'lucide-react';
import { generateHostedAuthLink } from '../../services/unipileService';
import { toast } from 'react-toastify';

export function HostedAuthWizard() {
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [hostedAuthUrl, setHostedAuthUrl] = useState<string | null>(null);

  const handleGenerateLink = async () => {
    setIsGeneratingLink(true);
    try {
      const link = await generateHostedAuthLink();
      setHostedAuthUrl(link);
      toast.success('Enlace de autenticación generado con éxito');
    } catch (error) {
      console.error('Error al generar el enlace de autenticación:', error);
      toast.error('Error al generar el enlace de autenticación');
    } finally {
      setIsGeneratingLink(false);
    }
  };

  const handleRedirect = () => {
    if (hostedAuthUrl) {
      window.location.href = hostedAuthUrl;
    }
  };

  return (
    <div className="space-y-6">
      <h4 className="text-lg font-semibold mb-4">Configuración tipo 2 - Hosted Auth Wizard</h4>
      <p className="text-gray-600">
        Utiliza el Hosted Auth Wizard para una experiencia de autenticación simplificada y segura.
      </p>
      {!hostedAuthUrl ? (
        <button
          onClick={handleGenerateLink}
          disabled={isGeneratingLink}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          {isGeneratingLink ? (
            <>
              <Loader className="animate-spin mr-2 h-5 w-5" />
              Generando enlace...
            </>
          ) : (
            'Generar enlace de autenticación'
          )}
        </button>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Enlace de autenticación generado. Haz clic en el botón para iniciar el proceso de autenticación.
          </p>
          <button
            onClick={handleRedirect}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Iniciar autenticación
          </button>
        </div>
      )}
    </div>
  );
}