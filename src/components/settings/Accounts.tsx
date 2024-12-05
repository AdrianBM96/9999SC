import React, { useState, useEffect } from 'react';
import { AlertTriangle, Loader, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { generateHostedAuthLink, getAccountStatus } from '../../services/unipileService';

export function Accounts() {
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [hostedAuthUrl, setHostedAuthUrl] = useState<string | null>(null);
  const [accountStatus, setAccountStatus] = useState<{
    isConnected: boolean;
    accountId: string;
    status: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAccountStatus();
  }, []);

  const checkAccountStatus = async () => {
    setIsLoading(true);
    try {
      const status = await getAccountStatus();
      setAccountStatus(status);
      if (!status.isConnected) {
        // Only generate link if not connected
        await generateLink();
      }
    } catch (error) {
      console.error('Error checking account status:', error);
      toast.error('Error al verificar el estado de la cuenta');
    } finally {
      setIsLoading(false);
    }
  };

  const generateLink = async () => {
    setIsGeneratingLink(true);
    try {
      const link = await generateHostedAuthLink();
      setHostedAuthUrl(link);
    } catch (error) {
      console.error('Error al generar el enlace de autenticación:', error);
      toast.error('Error al generar el enlace de autenticación');
    } finally {
      setIsGeneratingLink(false);
    }
  };

  const handleConnectClick = () => {
    if (hostedAuthUrl) {
      window.open(hostedAuthUrl, '_blank');
    } else {
      generateLink();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader className="animate-spin mr-2" size={20} />
        <span>Verificando estado de la cuenta...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h3 className="text-2xl font-bold text-gray-900">Cuentas Conectadas</h3>
      
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-lg font-semibold">LinkedIn</h4>
          <div className="flex items-center">
            {accountStatus?.isConnected ? (
              <div className="flex items-center text-green-600">
                <CheckCircle className="h-5 w-5 mr-2" />
                <span>Conectado</span>
              </div>
            ) : (
              <div className="flex items-center text-red-600">
                <XCircle className="h-5 w-5 mr-2" />
                <span>No conectado</span>
              </div>
            )}
          </div>
        </div>

        {!accountStatus?.isConnected && (
          <div className="space-y-4">
            {isGeneratingLink ? (
              <div className="flex items-center justify-center">
                <Loader className="animate-spin mr-2" size={20} />
                <span>Generando enlace de conexión...</span>
              </div>
            ) : (
              <button
                onClick={handleConnectClick}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300"
              >
                Conectar LinkedIn
              </button>
            )}
          </div>
        )}

        {accountStatus?.isConnected && (
          <button
            onClick={checkAccountStatus}
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            Verificar estado de conexión
          </button>
        )}
      </div>

      {!accountStatus?.isConnected && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Al hacer clic en "Conectar LinkedIn", se abrirá una nueva pestaña para completar el proceso de autenticación. 
                Una vez completado, regrese a esta página y haga clic en "Verificar estado de conexión".
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}