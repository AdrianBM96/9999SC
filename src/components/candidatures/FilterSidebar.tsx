import React from 'react';
import { X, ChevronDown, Plus } from 'lucide-react';

interface FilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FilterSidebar({ isOpen, onClose }: FilterSidebarProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 left-0 w-80 bg-white shadow-xl z-50 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Filtrar</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        <button className="mt-4 text-blue-600 hover:text-blue-700 text-sm">
          Limpiar filtros
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div>
          <button className="w-full flex items-center justify-between text-left text-gray-700 hover:text-gray-900">
            <span className="font-medium">Localizaciones</span>
            <ChevronDown size={20} />
          </button>
        </div>

        <div>
          <button className="w-full flex items-center justify-between text-left text-gray-700 hover:text-gray-900">
            <span className="font-medium">Ofertas</span>
            <ChevronDown size={20} />
          </button>
        </div>

        <div>
          <button className="w-full flex items-center justify-between text-left text-gray-700 hover:text-gray-900">
            <span className="font-medium">Solicitudes</span>
            <ChevronDown size={20} />
          </button>
        </div>

        <div>
          <button className="w-full flex items-center justify-between text-left text-gray-700 hover:text-gray-900">
            <span className="font-medium">Puestos</span>
            <ChevronDown size={20} />
          </button>
        </div>

        <div>
          <button className="w-full flex items-center justify-between text-left text-gray-700 hover:text-gray-900">
            <span className="font-medium">Etiquetas de candidatos</span>
            <ChevronDown size={20} />
          </button>
          <div className="mt-2">
            <button className="flex items-center text-sm text-blue-600 hover:text-blue-700">
              <Plus size={16} className="mr-1" />
              Añadir etiqueta
            </button>
          </div>
        </div>

        <div>
          <button className="w-full flex items-center justify-between text-left text-gray-700 hover:text-gray-900">
            <span className="font-medium">Preguntas y respuestas</span>
            <ChevronDown size={20} />
          </button>
        </div>

        <div>
          <button className="w-full flex items-center justify-between text-left text-gray-700 hover:text-gray-900">
            <span className="font-medium">Consentimiento GDPR</span>
            <ChevronDown size={20} />
          </button>
        </div>

        <div>
          <button className="w-full flex items-center justify-between text-left text-gray-700 hover:text-gray-900">
            <span className="font-medium">Etiquetas de procesos</span>
            <ChevronDown size={20} />
          </button>
        </div>

        <div>
          <button className="w-full flex items-center justify-between text-left text-gray-700 hover:text-gray-900">
            <span className="font-medium">Videoentrevistas</span>
            <ChevronDown size={20} />
          </button>
        </div>

        <div>
          <button className="w-full flex items-center justify-between text-left text-gray-700 hover:text-gray-900">
            <span className="font-medium">Estado</span>
            <ChevronDown size={20} />
          </button>
        </div>

        <div>
          <button className="w-full flex items-center justify-between text-left text-gray-700 hover:text-gray-900">
            <span className="font-medium">Formularios</span>
            <ChevronDown size={20} />
          </button>
        </div>

        <div>
          <button className="w-full flex items-center justify-between text-left text-gray-700 hover:text-gray-900">
            <span className="font-medium">Chatbot</span>
            <ChevronDown size={20} />
          </button>
        </div>

        <div>
          <button className="w-full flex items-center justify-between text-left text-gray-700 hover:text-gray-900">
            <span className="font-medium">Estado de contratación</span>
            <ChevronDown size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}