import React from 'react';
import { RefreshCw } from 'lucide-react';

interface MessagesStepProps {
  messages: {
    initial: string;
    followup: string;
  };
  setMessages: (messages: any) => void;
  loading: boolean;
  onGenerateAI: () => void;
}

export function MessagesStep({ messages, setMessages, loading, onGenerateAI }: MessagesStepProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">Mensajes de la campaña</h3>
        <button
          onClick={onGenerateAI}
          disabled={loading}
          className="flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
        >
          {loading ? (
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-2" />
          )}
          Generar con IA
        </button>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Mensaje inicial de conexión
        </label>
        <textarea
          value={messages.initial}
          onChange={(e) => setMessages({ ...messages, initial: e.target.value })}
          className="input-field"
          rows={4}
          placeholder="Este mensaje se enviará al conectar con el candidato..."
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Mensaje de seguimiento
        </label>
        <textarea
          value={messages.followup}
          onChange={(e) => setMessages({ ...messages, followup: e.target.value })}
          className="input-field"
          rows={4}
          placeholder="Este mensaje se enviará si no hay respuesta..."
        />
      </div>
    </div>
  );
}
