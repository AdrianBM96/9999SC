import { generateLinkedInAuthLink } from './unileap';

export class SettingsService {
    private static instance: SettingsService;
    private apiUrl: string;
    private apiKey: string;

    private constructor() {
        this.apiUrl = import.meta.env.VITE_UNILEAP_API_URL;
        this.apiKey = import.meta.env.VITE_UNILEAP_API_KEY;
    }

    public static getInstance(): SettingsService {
        if (!SettingsService.instance) {
            SettingsService.instance = new SettingsService();
        }
        return SettingsService.instance;
    }

    public async connectLinkedIn(): Promise<string> {
        try {
            const authUrl = await generateLinkedInAuthLink();
            if (!authUrl) {
                throw new Error('Failed to generate LinkedIn authentication URL');
            }
            return authUrl;
        } catch (error: any) {
            console.error('Error connecting LinkedIn:', error);
            throw new Error('Failed to initiate LinkedIn connection');
        }
    }

    public async disconnectLinkedIn(): Promise<void> {
        if (!this.apiUrl || !this.apiKey) {
            throw new Error('Unileap configuration is missing');
        }

        try {
            const response = await fetch(`${this.apiUrl}/v1/oauth/linkedin/disconnect`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to disconnect LinkedIn');
            }
        } catch (error) {
            console.error('Error disconnecting LinkedIn:', error);
            throw new Error('Failed to disconnect LinkedIn');
        }
    }
}

export default SettingsService;