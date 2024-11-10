import React from 'react';
import { Bell, Mail, MessageSquare, Calendar } from 'lucide-react';

export function NotificationsSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-gray-900">Notificaciones</h2>
        <p className="mt-1 text-sm text-gray-500">
          Configura cómo y cuándo quieres recibir notificaciones.
        </p>
      </div>

      <div className="space-y-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-4">Notificaciones por correo</h3>
              <div className="space-y-3">
                <label className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </div>
                  <div className="ml-3">
                    <span className="text-sm font-medium text-gray-700">Resumen diario</span>
                    <p className="text-sm text-gray-500">
                      Recibe un resumen diario de la actividad de tus campañas
                    </p>
                  </div>
                </label>

                <label className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </div>
                  <div className="ml-3">
                    <span className="text-sm font-medium text-gray-700">Nuevas respuestas</span>
                    <p className="text-sm text-gray-500">
                      Cuando un candidato responde a tu campaña
                    </p>
                  </div>
                </label>

                <label className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </div>
                  <div className="ml-3">
                    <span className="text-sm font-medium text-gray-700">Entrevistas programadas</span>
                    <p className="text-sm text-gray-500">
                      Cuando se agenda una nueva entrevista
                    </p>
                  </div>
                </label>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-4">Notificaciones en la plataforma</h3>
              <div className="space-y-3">
                <label className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </div>
                  <div className="ml-3">
                    <span className="text-sm font-medium text-gray-700">Actividad de campañas</span>
                    <p className="text-sm text-gray-500">
                      Notificaciones sobre el progreso de tus campañas activas
                    </p>
                  </div>
                </label>

                <label className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </div>
                  <div className="ml-3">
                    <span className="text-sm font-medium text-gray-700">Recordatorios</span>
                    <p className="text-sm text-gray-500">
                      Recordatorios de tareas pendientes y próximas entrevistas
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
          >
            Guardar preferencias
          </button>
        </div>
      </div>
    </div>
  );
}
