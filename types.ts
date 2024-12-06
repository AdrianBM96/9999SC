export interface LinkedInConfig {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    scope: string[];
}

export interface UnipileConfig {
    linkedIn: LinkedInConfig;
}

export interface ConnectionStatus {
    connected: boolean;
    error?: string;
}

export interface AuthResponse {
    success: boolean;
    error?: string;
    authUrl?: string;
}