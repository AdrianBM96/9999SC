import { useState, useEffect } from 'react';
import { useAuth } from '../../services/auth';
import { saveOpenAIConfig, getOpenAIConfig } from '../../services/openaiConfig';
import { getConfig } from '../../services/config';

export function OpenAIConfig() {
  const { user, isAuthenticated } = useAuth();
  const [apiKey, setApiKey] = useState('');
  const [orgId, setOrgId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);

  // Debug authentication state
  useEffect(() => {
    console.log('Auth State:', { isAuthenticated, user: user?.uid });
  }, [isAuthenticated, user]);

  useEffect(() => {
    async function loadConfig() {
      if (!user || !isAuthenticated) {
        setIsLoading(false);
        return;
      }
      
      console.log('Loading config for user:', { uid: user.uid, email: user.email });
      setIsLoading(true);
      setMessage(null); // Clear any previous messages
      
      try {
        // Try to load from Firebase first
        const firebaseConfig = await getOpenAIConfig(user);
        console.log('Loaded Firebase config:', { 
          hasApiKey: !!firebaseConfig?.apiKey,
          hasOrgId: !!firebaseConfig?.orgId 
        });
        
        if (firebaseConfig) {
          setApiKey(firebaseConfig.apiKey);
          setOrgId(firebaseConfig.orgId || '');
          console.log('Successfully loaded config from Firebase');
        } else {
          // If not in Firebase, try to load from local config
          const localConfig = getConfig();
          console.log('Loaded local config:', { 
            hasApiKey: !!localConfig.openAiApiKey 
          });
          
          if (localConfig.openAiApiKey) {
            setApiKey(localConfig.openAiApiKey);
            console.log('Successfully loaded config from local storage');
          } else {
            console.log('No configuration found in Firebase or local storage');
          }
        }
      } catch (error) {
        console.error('Error loading configuration:', error);
        let errorMessage = 'Error desconocido al cargar la configuración';
        
        if (error instanceof Error) {
          if (error.message.includes('permission-denied')) {
            errorMessage = 'No tienes permisos para acceder a la configuración';
          } else if (error.message.includes('not-found')) {
            errorMessage = 'No se encontró la configuración';
          } else {
            errorMessage = `Error: ${error.message}`;
          }
        }
        
        setMessage({ 
          text: errorMessage,
          type: 'error' 
        });
      } finally {
        setIsLoading(false);
      }
    }

    loadConfig();
  }, [user, isAuthenticated]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !isAuthenticated) {
      setMessage({ text: 'Debes iniciar sesión para guardar la configuración', type: 'error' });
      return;
    }

    if (isSaving) {
      return; // Prevent multiple submissions
    }

    try {
      setIsSaving(true);
      console.log('Saving config for user:', { uid: user.uid, email: user.email });
      setMessage(null); // Clear any previous messages

      // Validate API key format
      if (!apiKey.startsWith('sk-')) {
        setMessage({ text: 'La API key debe comenzar con "sk-"', type: 'error' });
        return;
      }

      // Validate organization ID format if provided
      if (orgId && !orgId.startsWith('org-')) {
        setMessage({ text: 'El Organization ID debe comenzar con "org-"', type: 'error' });
        return;
      }

      // Save to Firebase
      await saveOpenAIConfig(user, {
        apiKey,
        orgId: orgId || undefined
      });
      console.log('Successfully saved config to Firebase');

      // Also update local storage
      localStorage.setItem('openai_api_key', apiKey);
      if (orgId) {
        localStorage.setItem('openai_org_id', orgId);
      } else {
        localStorage.removeItem('openai_org_id');
      }
      console.log('Successfully saved config to local storage');
      
      setMessage({ 
        text: 'Configuración guardada correctamente. Los cambios se aplicarán en la próxima sesión.', 
        type: 'success' 
      });

      // Clear the form after 2 seconds of showing success message
      setTimeout(() => {
        setMessage(null);
      }, 2000);

    } catch (error) {
      console.error('Error saving configuration:', error);
      let errorMessage = 'Error desconocido al guardar la configuración';
      
      if (error instanceof Error) {
        if (error.message.includes('permission-denied')) {
          errorMessage = 'No tienes permisos para guardar la configuración';
        } else if (error.message.includes('network')) {
          errorMessage = 'Error de conexión. Por favor, verifica tu conexión a internet';
        } else if (error.message.includes('quota-exceeded')) {
          errorMessage = 'Has excedido el límite de operaciones permitidas. Intenta más tarde.';
        } else {
          errorMessage = `Error: ${error.message}`;
        }
      }
      
      setMessage({ text: errorMessage, type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="w-full py-4 text-center text-red-600">
        Por favor, inicia sesión para configurar OpenAI
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full py-4 text-center text-gray-500">
        <div className="flex items-center justify-center space-x-2">
          <span className="inline-block animate-spin mr-2">⚡</span>
          <span>Cargando configuración...</span>
        </div>
        <div className="text-sm text-gray-400 mt-2">
          {user ? `Usuario: ${user.email}` : 'Verificando autenticación...'}
        </div>
      </div>
    );
  }

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
          <div className="relative mt-1">
            <input
              type={showApiKey ? "text" : "password"}
              id="apiKey"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 pr-10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="sk-..."
              required
              disabled={isSaving}
            />
            <button
              type="button"
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-500"
            >
              {showApiKey ? (
                <span className="text-sm">Ocultar</span>
              ) : (
                <span className="text-sm">Mostrar</span>
              )}
            </button>
          </div>
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
            disabled={isSaving}
          />
          <p className="mt-1 text-sm text-gray-500">
            Opcional: ID de tu organización en OpenAI
          </p>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className={`w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md text-sm font-medium text-white ${
            isSaving 
              ? 'bg-blue-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
          }`}
        >
          {isSaving ? (
            <>
              <span className="inline-block animate-spin mr-2">⚡</span>
              Guardando...
            </>
          ) : (
            'Guardar configuración'
          )}
        </button>
      </form>
    </div>
  );
}