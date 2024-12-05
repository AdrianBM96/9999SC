import axios from 'axios';

const API_BASE_URL = 'https://1api3.unipile.com:13361/api/v1';
const API_KEY = import.meta.env.VITE_UNIPILE_API_KEY;
const ACCOUNT_ID = import.meta.env.VITE_UNIPILE_ACCOUNT_ID;

if (!API_KEY) {
  console.error('Error: VITE_UNIPILE_API_KEY is not set in environment variables');
  throw new Error('Unipile API Key is not configured');
}

if (!ACCOUNT_ID) {
  console.error('Error: VITE_UNIPILE_ACCOUNT_ID is not set in environment variables');
  throw new Error('Unipile Account ID is not configured');
}

const unipileApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'X-API-KEY': API_KEY,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Helper function to ensure data is serializable
const ensureSerializable = (obj: any): any => {
  return JSON.parse(JSON.stringify(obj));
};

export const getLinkedInMessages = async (params: { limit?: number; offset?: number; since?: string; until?: string }) => {
  try {
    const response = await unipileApi.get(`/linkedin/messages?account_id=${ACCOUNT_ID}`, { params });
    return ensureSerializable(response.data);
  } catch (error) {
    console.error('Error fetching LinkedIn messages:', error);
    return { items: [] }; // Return empty array on error
  }
};

export const sendLinkedInMessage = async (profileUrl: string, message: string) => {
  try {
    const response = await unipileApi.post('/linkedin/messages', {
      account_id: ACCOUNT_ID,
      profile_url: profileUrl,
      message: message,
    });
    return ensureSerializable(response.data);
  } catch (error) {
    console.error('Error sending LinkedIn message:', error);
    throw error;
  }
};

export const checkConnectionStatus = async (profileUrl: string) => {
  try {
    const response = await unipileApi.get(`/linkedin/connections?account_id=${ACCOUNT_ID}&profile_url=${profileUrl}`);
    return ensureSerializable(response.data.status);
  } catch (error) {
    console.error('Error checking connection status:', error);
    return 'NOT_CONNECTED';
  }
};

export const inviteLinkedInUser = async (profileUrl: string, message: string) => {
  try {
    const response = await unipileApi.post('/linkedin/invitations', {
      account_id: ACCOUNT_ID,
      profile_url: profileUrl,
      message: message,
    });
    return ensureSerializable(response.data);
  } catch (error) {
    console.error('Error inviting LinkedIn user:', error);
    throw error;
  }
};

export const generateHostedAuthLink = async () => {
  try {
    // Create a link that expires in 1 hour
    const expiresOn = new Date(Date.now() + 3600000).toISOString();
    
    const response = await unipileApi.post('/hosted/accounts/link', {
      type: 'create',
      providers: 'linkedin',  // Specifically request LinkedIn provider
      api_url: API_BASE_URL,
      expiresOn,
      notify_url: `${window.location.origin}/settings/accounts/callback`,
      redirect_url: `${window.location.origin}/settings/accounts`,
      name: ACCOUNT_ID,
      metadata: {
        timestamp: Date.now(),
        source: 'settings_page'
      }
    });

    if (!response.data?.url) {
      throw new Error('No authentication URL received from Unipile');
    }

    return ensureSerializable(response.data.url);
  } catch (error: any) {
    console.error('Error generating hosted auth link:', error);
    if (error.response?.status === 401) {
      throw new Error('Invalid API credentials. Please check your Unipile API key.');
    } else if (error.response?.status === 429) {
      throw new Error('Too many requests. Please try again later.');
    } else {
      throw new Error('Failed to generate authentication link. Please try again.');
    }
  }
};

export const getAccountStatus = async () => {
  try {
    const response = await unipileApi.get(`/accounts/${ACCOUNT_ID}`);
    const data = response.data;

    // Check if we have LinkedIn provider in the response
    const linkedInProvider = data.providers?.find((p: any) => p.name.toLowerCase() === 'linkedin');
    
    return ensureSerializable({
      isConnected: data.status === 'OK' && linkedInProvider?.status === 'OK',
      accountId: data.id,
      status: data.status,
      linkedInStatus: linkedInProvider?.status || 'NOT_CONNECTED',
      lastSync: linkedInProvider?.last_sync || null,
      error: linkedInProvider?.error || null
    });
  } catch (error: any) {
    console.error('Error getting account status:', error);
    
    if (error.response?.status === 401) {
      throw new Error('Invalid API credentials. Please check your Unipile API key.');
    } else if (error.response?.status === 404) {
      // Account doesn't exist yet
      return {
        isConnected: false,
        accountId: ACCOUNT_ID,
        status: 'NOT_FOUND',
        linkedInStatus: 'NOT_CONNECTED',
        lastSync: null,
        error: null
      };
    } else if (error.response?.status === 429) {
      throw new Error('Too many requests. Please try again later.');
    } else {
      throw new Error('Failed to check account status. Please try again.');
    }
  }
};