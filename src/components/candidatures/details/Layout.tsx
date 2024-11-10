import React from 'react';
import { X, Edit2, Save, RefreshCw } from 'lucide-react';
import { Candidature } from '../../../types';
import { Tabs } from './Tabs';

interface LayoutProps {
  candidature: Candidature;
  isEditing: boolean;
  isUpdating: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onClose: () => void;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  children: React.ReactNode;
}

export function Layout({
  candidature,
  isEditing,
  isUpdating,
  activeTab,
  setActiveTab,
  onClose,
  onEdit,
  onSave,
  onCancel,
  children
}: LayoutProps) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-end z-50">
      <div className="h-full w-[1100px] bg-white flex shadow-2xl animate-[slideIn_0.3s_ease-out]">
        {/* Sidebar con pestañas */}
        <div className="w-64 border-r border-gray-200 flex flex-col">
          <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>

        {/* Contenido principal */}
        <div className="flex-1 flex flex-col">
          {/* Header unificado */}
          <div className="px-6 py-4 border-b border-gray-200 bg-white">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <h2 className="text-xl font-semibold text-gray-900">{candidature.title}</h2>
                  <span className="text-gray-400">#{candidature.id?.slice(0, 4)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    candidature.status === 'Publicada' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {candidature.status || 'No publicada'}
                  </span>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    candidature.marketDemand === 'Alta'
                      ? 'bg-red-100 text-red-800'
                      : candidature.marketDemand === 'Media'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    Prioridad {candidature.marketDemand}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {!isEditing ? (
                  <button
                    onClick={onEdit}
                    className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors flex items-center"
                  >
                    <Edit2 size={18} className="mr-2" />
                    Editar
                  </button>
                ) : (
                  <>
                    <button
                      onClick={onCancel}
                      className="text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-100"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={onSave}
                      disabled={isUpdating}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
                    >
                      {isUpdating ? (
                        <>
                          <RefreshCw size={18} className="mr-2 animate-spin" />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <Save size={18} className="mr-2" />
                          Guardar
                        </>
                      )}
                    </button>
                  </>
                )}
                <button 
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto bg-gray-50">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}