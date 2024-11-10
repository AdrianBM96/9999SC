import React from 'react';
import { Settings, Bell, Globe, Lock } from 'lucide-react';

interface SettingsTabProps {
  status: string;
  isEditing: boolean;
  handleInputChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export function SettingsTab({ status, isEditing, handleInputChange }: SettingsTabProps) {
  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-xl font-semibold mb-6">Configuración de la oferta</h3>
        
        <div className="space-y-6">
          <div className="border-b border-gray-200 pb-6">
            <h4 className="font-medium mb-4 flex items-center">
              <Globe className="w-5 h-5 mr-2 text-gray-400" />
              Visibilidad
            </h4>
            {isEditing ? (
              <select
                name="status"
                value={status}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              >
                <option value="Publicada">Publicada</option>
                <option value="No publicada">No publicada</option>
                <option value="Borrador">Borrador</option>
              </select>
            ) : (
              <p className="text-gray-700">{status || 'No publicada'}</p>
            )}
          </div>

          <div className="border-b border-gray-200 pb-6">
            <h4 className="font-medium mb-4 flex items-center">
              <Bell className="w-5 h-5 mr-2 text-gray-400" />
              Notificaciones
            </h4>
            <div className="space-y-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <span className="ml-2">Notificar nuevos candidatos</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <span className="ml-2">Notificar actualizaciones de estado</span>
              </label>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-4 flex items-center">
              <Lock className="w-5 h-5 mr-2 text-gray-400" />
              Permisos
            </h4>
            <div className="space-y-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <span className="ml-2">Restringir acceso al equipo de RRHH</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <span className="ml-2">Permitir edición solo a administradores</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}