import React from 'react';
import { OpenAIConfig } from './OpenAIConfig';

export function IntegrationsSettings() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Integraciones</h2>
        <p className="text-gray-600 mb-6">
          Configura las integraciones con servicios externos para mejorar la funcionalidad de la plataforma.
        </p>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg" 
                  alt="OpenAI Logo" 
                  className="h-8 w-8"
                />
                <div>
                  <h3 className="text-lg font-medium text-gray-900">OpenAI</h3>
                  <p className="text-sm text-gray-500">Configura tu API key de OpenAI para habilitar las funciones de IA</p>
                </div>
              </div>
            </div>
          </div>
          <div className="px-6 py-4">
            <OpenAIConfig />
          </div>
        </div>

        {/* Add more integration sections here */}
      </div>
    </div>
  );
}