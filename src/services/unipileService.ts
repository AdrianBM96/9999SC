import axios from 'axios';

const API_BASE_URL = 'https://1api3.unipile.com:13361/api/v1';
const API_KEY = import.meta.env.VITE_UNIPILE_API_KEY;
const ACCOUNT_ID = import.meta.env.VITE_UNIPILE_ACCOUNT_ID;

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
    const response = await unipileApi.post('/hosted/accounts/link', {
      type: 'create',
      providers: '*',
      api_url: API_BASE_URL,
      expiresOn: new Date(Date.now() + 3600000).toISOString(),
      notify_url: `${window.location.origin}/api/auth-callback`,
      name: ACCOUNT_ID,
    });
    return ensureSerializable(response.data.url);
  } catch (error) {
    console.error('Error generating hosted auth link:', error);
    throw error;
  }
};

export const getAccountStatus = async () => {
  try {
    const response = await unipileApi.get(`/accounts/${ACCOUNT_ID}`);
    return ensureSerializable({
      isConnected: response.data.status === 'OK',
      accountId: response.data.id,
      status: response.data.status,
    });
  } catch (error) {
    console.error('Error getting account status:', error);
    throw error;
  }
};