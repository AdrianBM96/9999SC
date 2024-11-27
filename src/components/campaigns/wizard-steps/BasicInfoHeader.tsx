import React from 'react';
import { Info, CheckCircle2, Users, Calendar } from 'lucide-react';

export function BasicInfoHeader() {
  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <Info className="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
          <div className="text-sm text-blue-700">
            <p className="font-medium mb-1">Información básica de la campaña</p>
            <p>
              Define los detalles principales de tu campaña. Esta información te ayudará
              a organizar y hacer seguimiento de tus procesos de reclutamiento.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <CheckCircle2 className="w-5 h-5 text-green-500 mr-2" />
            <h3 className="text-sm font-medium text-gray-900">Tipo de campaña</h3>
          </div>
          <p className="text-sm text-gray-500">
            Elige entre reclutamiento para vacantes activas o sourcing para crear un pool de talento.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <Users className="w-5 h-5 text-purple-500 mr-2" />
            <h3 className="text-sm font-medium text-gray-900">Selección de candidatos</h3>
          </div>
          <p className="text-sm text-gray-500">
            Puedes enviar la campaña a todos los candidatos o seleccionar específicamente a quiénes contactar.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <Calendar className="w-5 h-5 text-blue-500 mr-2" />
            <h3 className="text-sm font-medium text-gray-900">Planificación</h3>
          </div>
          <p className="text-sm text-gray-500">
            Establece una fecha límite para mantener tu proceso de reclutamiento organizado y eficiente.
          </p>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Consejos importantes
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <ul className="list-disc pl-5 space-y-1">
                <li>Usa nombres descriptivos para identificar fácilmente tus campañas</li>
                <li>Revisa los candidatos seleccionados antes de continuar</li>
                <li>Considera el tiempo necesario para completar el proceso al establecer la fecha límite</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
