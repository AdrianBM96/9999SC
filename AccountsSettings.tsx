import React, { useState, useEffect } from 'react';
import SettingsService from './settingsService';

interface AccountsSettingsProps {
    onSuccess?: () => void;
    onError?: (error: Error) => void;
}

const AccountsSettings: React.FC<AccountsSettingsProps> = ({ onSuccess, onError }) => {
    const [isConnecting, setIsConnecting] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const settingsService = SettingsService.getInstance();

    useEffect(() => {
        checkConnectionStatus();
    }, []);

    const checkConnectionStatus = async () => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_UNILEAP_API_URL}/v1/oauth/linkedin/status`,
                {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${import.meta.env.VITE_UNILEAP_API_KEY}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            if (!response.ok) {
                throw new Error('Failed to check LinkedIn connection status');
            }
            
            const data = await response.json();
            setIsConnected(data.connected);
            setError(null);
        } catch (error) {
            console.error('Error checking LinkedIn status:', error);
            setError('Failed to check LinkedIn connection status');
        }
    };

    const handleConnect = async () => {
        setIsConnecting(true);
        setError(null);
        try {
            const authUrl = await settingsService.connectLinkedIn();
            if (authUrl) {
                window.location.href = authUrl;
            } else {
                throw new Error('No authentication URL received');
            }
            if (onSuccess) {
                onSuccess();
            }
        } catch (error: any) {
            console.error('Error connecting LinkedIn:', error);
            setError(error.message || 'Failed to connect LinkedIn');
            if (onError) {
                onError(error);
            }
        } finally {
            setIsConnecting(false);
        }
    };

    const handleDisconnect = async () => {
        try {
            await settingsService.disconnectLinkedIn();
            setIsConnected(false);
            setError(null);
            if (onSuccess) {
                onSuccess();
            }
        } catch (error: any) {
            console.error('Error disconnecting LinkedIn:', error);
            setError(error.message || 'Failed to disconnect LinkedIn');
            if (onError) {
                onError(error);
            }
        }
    };

    return (
        <div className="accounts-settings">
            <h2>Connected Accounts</h2>
            <div className="linkedin-section">
                <h3>LinkedIn</h3>
                {error && (
                    <div className="error-message text-red-500 mb-2">
                        {error}
                    </div>
                )}
                {isConnected ? (
                    <button 
                        onClick={handleDisconnect}
                        disabled={isConnecting}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50"
                    >
                        Disconnect LinkedIn
                    </button>
                ) : (
                    <button 
                        onClick={handleConnect}
                        disabled={isConnecting}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                    >
                        {isConnecting ? 'Connecting...' : 'Connect LinkedIn'}
                    </button>
                )}
            </div>
        </div>
    );
};

export default AccountsSettings;