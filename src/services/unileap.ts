import { getConfig } from './config';
import { db } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';

interface HostedAuthResponse {
  object: string;
  url: string;
}

interface UnileapCallbackData {
  status: 'CREATION_SUCCESS' | 'RECONNECTED';
  account_id: string;
  name: string;
}

export async function generateLinkedInAuthLink(userId: string): Promise<string> {
  const config = getConfig();
  const apiUrl = config.unileapApiUrl;
  const apiKey = config.unileapApiKey;

  if (!apiUrl || !apiKey) {
    throw new Error('Unileap configuration is missing');
  }

  try {
    const response = await fetch(`${apiUrl}/api/v1/hosted/accounts/link`, {
      method: 'POST',
      headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        type: 'create',
        providers: ['LINKEDIN'],
        api_url: apiUrl,
        expiresOn: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
        success_redirect_url: `${window.location.origin}/settings/accounts/callback?success=true`,
        failure_redirect_url: `${window.location.origin}/settings/accounts/callback?error=auth_failed`,
        name: userId
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to generate auth link: ${response.statusText}`);
    }

    const data = await response.json() as HostedAuthResponse;
    return data.url;
  } catch (error) {
    console.error('Error generating LinkedIn auth link:', error);
    throw new Error('Failed to generate LinkedIn authentication link');
  }
}

export async function handleAccountReconnect(accountId: string, userId: string): Promise<string> {
  const config = getConfig();
  const apiUrl = config.unileapApiUrl;
  const apiKey = config.unileapApiKey;

  if (!apiUrl || !apiKey) {
    throw new Error('Unileap configuration is missing');
  }

  try {
    const response = await fetch(`${apiUrl}/api/v1/hosted/accounts/link`, {
      method: 'POST',
      headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        type: 'reconnect',
        reconnect_account: accountId,
        providers: ['LINKEDIN'],
        api_url: apiUrl,
        expiresOn: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
        success_redirect_url: `${window.location.origin}/settings/accounts/callback?success=true&reconnect=true`,
        failure_redirect_url: `${window.location.origin}/settings/accounts/callback?error=auth_failed&reconnect=true`,
        name: userId
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to generate reconnect link: ${response.statusText}`);
    }

    const data = await response.json() as HostedAuthResponse;
    return data.url;
  } catch (error) {
    console.error('Error generating LinkedIn reconnect link:', error);
    throw new Error('Failed to generate LinkedIn reconnection link');
  }
}

export async function handleUnileapCallback(userId: string, accountId: string): Promise<void> {
  try {
    const userSettingsRef = doc(db, 'userSettings', userId);
    await updateDoc(userSettingsRef, {
      linkedIn: {
        connected: true,
        accountId: accountId,
        lastConnected: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error updating LinkedIn connection status:', error);
    throw new Error('Failed to update LinkedIn connection status');
  }
}