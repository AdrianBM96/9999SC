import { useState, useEffect } from 'react';
import { useAuth } from '../../services/auth';
import { saveOpenAIConfig, getOpenAIConfig } from '../../services/openaiConfig';

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
        const config = await getOpenAIConfig(user);
        if (config) {
          setApiKey(config.apiKey);
          setOrgId(config.orgId || '');
        }
      } catch (error) {
        setMessage({ text: 'Error loading configuration', type: 'error' });
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
      await saveOpenAIConfig(user, {
        apiKey,
        orgId: orgId || undefined
      });
      setMessage({ text: 'Configuration saved successfully', type: 'success' });
    } catch (error) {
      setMessage({ text: 'Error saving configuration', type: 'error' });
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (!user) return <div>Please log in to configure OpenAI settings</div>;

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">OpenAI Configuration</h2>
      
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
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>

        <div>
          <label htmlFor="orgId" className="block text-sm font-medium text-gray-700">
            Organization ID (optional)
          </label>
          <input
            type="text"
            id="orgId"
            value={orgId}
            onChange={(e) => setOrgId(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Save Configuration
        </button>
      </form>
    </div>
  );
}