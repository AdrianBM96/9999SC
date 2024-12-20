import { UnipileConfig } from './types';

const UNILEAP_CONFIG = {
    apiUrl: import.meta.env.VITE_UNILEAP_API_URL,
    apiKey: import.meta.env.VITE_UNILEAP_API_KEY
};

export const generateLinkedInAuthLink = async () => {
    if (!UNILEAP_CONFIG.apiUrl || !UNILEAP_CONFIG.apiKey) {
        throw new Error('Unileap configuration is missing');
    }

    try {
        const response = await fetch(`${UNILEAP_CONFIG.apiUrl}/v1/oauth/linkedin/connect`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${UNILEAP_CONFIG.apiKey}`
            },
            body: JSON.stringify({
                redirectUrl: window.location.origin + '/settings/accounts'
            })
        });

        if (!response.ok) {
            throw new Error('Failed to generate LinkedIn auth link');
        }

        const data = await response.json();
        return data.authUrl;
    } catch (error) {
        console.error('Error generating LinkedIn auth link:', error);
        throw error;
    }
}