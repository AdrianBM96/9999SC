import React from 'react';
import { Clock, Calendar, AlertCircle } from 'lucide-react';

export function CalendarSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-gray-900">Configuración del Calendario</h2>
        <p className="mt-1 text-sm text-gray-500">
          Configura las preferencias predeterminadas para la programación de entrevistas.
        </p>
      </div>

      <div className="space-y-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Horario laboral predeterminado
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    <Clock className="w-4 h-4 inline-block mr-1" />
                    Hora inicio
                  </label>
                  <input
                    type="time"
                    defaultValue="09:00"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    <Clock className="w-4 h-4 inline-block mr-1" />
                    Hora fin
                  </label>
                  <input
                    type="time"
                    defaultValue="18:00"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Calendar className="w-4 h-4 inline-block mr-1" />
                Duración predeterminada de entrevistas
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  defaultValue="45"
                  min="15"
                  max="180"
                  step="15"
                  className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="text-sm text-gray-500">minutos</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Calendar className="w-4 h-4 inline-block mr-1" />
                Ventana de disponibilidad
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  defaultValue="7"
                  min="1"
                  max="30"
                  className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="text-sm text-gray-500">días</span>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Días disponibles para agendar entrevistas
              </p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start">
          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
          <div className="text-sm text-yellow-700">
            <p className="font-medium mb-1">Importante</p>
            <p>
              Esta configuración se usará como predeterminada al crear nuevas campañas,
              pero podrás ajustarla individualmente para cada campaña.
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
          >
            Guardar cambios
          </button>
        </div>
      </div>
    </div>
  );
}
