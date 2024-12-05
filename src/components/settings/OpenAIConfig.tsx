import { useState, useEffect } from 'react';
import { useAuth } from '../../services/auth';
import { saveOpenAIConfig, getOpenAIConfig } from '../../services/openaiConfig';
import { getConfig } from '../../services/config';

export function OpenAIConfig() {
  const { user } = useAuth();
  const [apiKey, setApiKey] = useState('');
  const [orgId, setOrgId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    async function loadConfig() {
      if (!user) return;
      
      try {
        // Try to load from Firebase first
        const firebaseConfig = await getOpenAIConfig(user);
        if (firebaseConfig) {
          setApiKey(firebaseConfig.apiKey);
          setOrgId(firebaseConfig.orgId || '');
        } else {
          // If not in Firebase, try to load from local config
          const localConfig = getConfig();
          if (localConfig.openAiApiKey) {
            setApiKey(localConfig.openAiApiKey);
          }
        }
      } catch (error) {
        console.error('Error loading configuration:', error);
        setMessage({ text: 'Error al cargar la configuración', type: 'error' });
      } finally {
        setIsLoading(false);
      }
    }

    loadConfig();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      // Save to Firebase
      await saveOpenAIConfig(user, {
        apiKey,
        orgId: orgId || undefined
      });

      // Also update local storage
      localStorage.setItem('openai_api_key', apiKey);
      
      setMessage({ text: 'Configuración guardada correctamente', type: 'success' });
    } catch (error) {
      console.error('Error saving configuration:', error);
      setMessage({ text: 'Error al guardar la configuración', type: 'error' });
    }
  };

  if (isLoading) return (
    <div className="w-full py-4 text-center text-gray-500">
      <span className="inline-block animate-spin mr-2">⚡</span>
      Cargando configuración...
    </div>
  );
  
  if (!user) return (
    <div className="w-full py-4 text-center text-red-600">
      Por favor, inicia sesión para configurar OpenAI
    </div>
  );

  return (
    <div className="w-full">
      {message && (
        <div className={`p-4 mb-4 rounded ${
          message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700">
            API Key
          </label>
          <input
            type="password"
            id="apiKey"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            placeholder="sk-..."
            required
          />
        </div>

        <div>
          <label htmlFor="orgId" className="block text-sm font-medium text-gray-700">
            Organization ID (opcional)
          </label>
          <input
            type="text"
            id="orgId"
            value={orgId}
            onChange={(e) => setOrgId(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            placeholder="org-..."
          />
        </div>

        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Guardar configuración
        </button>
      </form>
    </div>
  );
}