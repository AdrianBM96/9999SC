import React, { useState, useEffect } from 'react';
import { Calendar, Check, AlertTriangle } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { toast } from 'react-toastify';

// Importamos las funciones de autenticación que crearemos
import { initiateGoogleAuth, initiateMicrosoftAuth, handleAuthCallback } from '../../services/calendarService';

export function CalendarIntegration() {
  const [googleCalendarConnected, setGoogleCalendarConnected] = useState(false);
  const [microsoftCalendarConnected, setMicrosoftCalendarConnected] = useState(false);

  useEffect(() => {
    fetchCalendarIntegrationStatus();
    handleAuthenticationCallback();
  }, []);

  const fetchCalendarIntegrationStatus = async () => {
    try {
      const calendarDoc = await getDoc(doc(db, 'calendarIntegrations', 'status'));
      if (calendarDoc.exists()) {
        const data = calendarDoc.data();
        setGoogleCalendarConnected(data.googleConnected || false);
        setMicrosoftCalendarConnected(data.microsoftConnected || false);
      }
    } catch (error) {
      console.error('Error fetching calendar integration status:', error);
      toast.error('Error al cargar el estado de integración de calendarios');
    }
  };

  const handleAuthenticationCallback = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');

    if (code && state) {
      try {
        const provider = state === 'google' ? 'Google' : 'Microsoft';
        await handleAuthCallback(code, state);
        if (state === 'google') {
          setGoogleCalendarConnected(true);
        } else if (state === 'microsoft') {
          setMicrosoftCalendarConnected(true);
        }
        toast.success(`Calendario de ${provider} conectado con éxito`);
      } catch (error) {
        console.error('Error handling authentication callback:', error);
        toast.error(`Error al conectar el calendario de ${provider}`);
      }
    }
  };

  const handleGoogleCalendarIntegration = async () => {
    try {
      await initiateGoogleAuth();
    } catch (error) {
      console.error('Error initiating Google Calendar auth:', error);
      toast.error('Error al iniciar la autenticación con Google Calendar');
    }
  };

  const handleMicrosoftCalendarIntegration = async () => {
    try {
      await initiateMicrosoftAuth();
    } catch (error) {
      console.error('Error initiating Microsoft Calendar auth:', error);
      toast.error('Error al iniciar la autenticación con Microsoft Calendar');
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-gray-900">Integración de Calendarios</h3>
      
      <div className="bg-white shadow rounded-lg p-6">
        <h4 className="text-lg font-semibold mb-4">Google Calendar</h4>
        {googleCalendarConnected ? (
          <div className="flex items-center text-green-600">
            <Check className="mr-2" />
            <span>Conectado</span>
          </div>
        ) : (
          <button
            onClick={handleGoogleCalendarIntegration}
            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition duration-300 flex items-center"
          >
            <Calendar className="mr-2" size={18} />
            Conectar Google Calendar
          </button>
        )}
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h4 className="text-lg font-semibold mb-4">Microsoft Calendar</h4>
        {microsoftCalendarConnected ? (
          <div className="flex items-center text-green-600">
            <Check className="mr-2" />
            <span>Conectado</span>
          </div>
        ) : (
          <button
            onClick={handleMicrosoftCalendarIntegration}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-300 flex items-center"
          >
            <Calendar className="mr-2" size={18} />
            Conectar Microsoft Calendar
          </button>
        )}
      </div>

      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-yellow-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              Asegúrate de haber configurado correctamente las credenciales de la aplicación en las consolas de desarrolladores de Google y Microsoft.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}