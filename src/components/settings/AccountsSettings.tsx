import React, { useState, useEffect } from 'react';
import { Link2, Mail, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { settingsService } from '../../services/settingsService';

interface AccountConnection {
  provider: string;
  connected: boolean;
  email?: string;
  loading?: boolean;
}

export function AccountsSettings() {
  const [connections, setConnections] = useState<AccountConnection[]>([
    { provider: 'linkedin', connected: false, loading: false },
    { provider: 'google', connected: false, email: '', loading: false },
    { provider: 'microsoft', connected: false, email: '', loading: false },
  ]);

  useEffect(() => {
    loadConnections();
  }, []);

  const loadConnections = async () => {
    try {
      const linkedinStatus = await settingsService.getLinkedInConnection();
      const googleStatus = await settingsService.getCalendarConnection('google');
      const microsoftStatus = await settingsService.getCalendarConnection('microsoft');

      setConnections([
        { provider: 'linkedin', connected: linkedinStatus.connected, loading: false },
        { provider: 'google', connected: googleStatus.connected, email: googleStatus.email, loading: false },
        { provider: 'microsoft', connected: microsoftStatus.connected, email: microsoftStatus.email, loading: false },
      ]);
    } catch (error) {
      console.error('Error loading connections:', error);
    }
  };

  const handleConnect = async (provider: string) => {
    setConnections(prev => 
      prev.map(conn => 
        conn.provider === provider ? { ...conn, loading: true } : conn
      )
    );

    try {
      switch (provider) {
        case 'linkedin':
          await settingsService.connectLinkedIn();
          break;
        case 'google':
          await settingsService.connectGoogleCalendar();
          break;
        case 'microsoft':
          await settingsService.connectMicrosoftCalendar();
          break;
      }
      await loadConnections();
    } catch (error) {
      console.error(`Error connecting ${provider}:`, error);
    } finally {
      setConnections(prev => 
        prev.map(conn => 
          conn.provider === provider ? { ...conn, loading: false } : conn
        )
      );
    }
  };

  const handleDisconnect = async (provider: string) => {
    setConnections(prev => 
      prev.map(conn => 
        conn.provider === provider ? { ...conn, loading: true } : conn
      )
    );

    try {
      switch (provider) {
        case 'linkedin':
          await settingsService.disconnectLinkedIn();
          break;
        case 'google':
          await settingsService.disconnectGoogleCalendar();
          break;
        case 'microsoft':
          await settingsService.disconnectMicrosoftCalendar();
          break;
      }
      await loadConnections();
    } catch (error) {
      console.error(`Error disconnecting ${provider}:`, error);
    } finally {
      setConnections(prev => 
        prev.map(conn => 
          conn.provider === provider ? { ...conn, loading: false } : conn
        )
      );
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-gray-900">Cuentas conectadas</h2>
        <p className="mt-1 text-sm text-gray-500">
          Gestiona las conexiones con tus cuentas de LinkedIn y servicios de calendario.
        </p>
      </div>

      <div className="space-y-4">
        {/* LinkedIn Connection */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <Link2 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900">LinkedIn</h3>
                <p className="text-sm text-gray-500">
                  {connections.find(c => c.provider === 'linkedin')?.connected
                    ? 'Conectado y listo para usar'
                    : 'Conecta tu cuenta para automatizar acciones'}
                </p>
              </div>
            </div>
            <div>
              {connections.find(c => c.provider === 'linkedin')?.loading ? (
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
              ) : connections.find(c => c.provider === 'linkedin')?.connected ? (
                <button
                  onClick={() => handleDisconnect('linkedin')}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Desconectar
                </button>
              ) : (
                <button
                  onClick={() => handleConnect('linkedin')}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
                >
                  Conectar
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Calendar Connections */}
        {['google', 'microsoft'].map((provider) => {
          const connection = connections.find(c => c.provider === provider);
          return (
            <div key={provider} className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Mail className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      {provider === 'google' ? 'Google Calendar' : 'Microsoft Calendar'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {connection?.connected
                        ? `Conectado como ${connection.email}`
                        : 'Conecta tu calendario para gestionar entrevistas'}
                    </p>
                  </div>
                </div>
                <div>
                  {connection?.loading ? (
                    <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                  ) : connection?.connected ? (
                    <button
                      onClick={() => handleDisconnect(provider)}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      Desconectar
                    </button>
                  ) : (
                    <button
                      onClick={() => handleConnect(provider)}
                      className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
                    >
                      Conectar
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start">
        <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
        <div className="text-sm text-yellow-700">
          <p className="font-medium mb-1">Importante</p>
          <p>
            Las conexiones son necesarias para el funcionamiento correcto de las campañas.
            Asegúrate de mantener las cuentas conectadas para evitar interrupciones.
          </p>
        </div>
      </div>
    </div>
  );
}
