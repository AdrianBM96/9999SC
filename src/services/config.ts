interface Config {
  openAiApiKey: string;
  unipileToken: string;
  unipileDsn: string;
  unileapApiUrl: string;
  unileapApiKey: string;
  googleCalendarClientId: string;
  microsoftCalendarClientId: string;
}

let config: Config | null = null;

export function initConfig(configData: Config) {
  config = {
    ...configData,
    unileapApiUrl: import.meta.env.VITE_UNILEAP_API_URL || configData.unileapApiUrl || '',
    unileapApiKey: import.meta.env.VITE_UNILEAP_API_KEY || configData.unileapApiKey || ''
  };
  
  // Store Unipile configuration in localStorage
  if (configData.unipileToken) {
    localStorage.setItem('unipile_token', configData.unipileToken);
  }
  if (configData.unipileDsn) {
    localStorage.setItem('unipile_dsn', configData.unipileDsn);
  }
}

export function getConfig(): Config {
  if (!config) {
    // Initialize with stored values
    config = {
      openAiApiKey: localStorage.getItem('openai_api_key') || '',
      unipileToken: localStorage.getItem('unipile_token') || '',
      unipileDsn: localStorage.getItem('unipile_dsn') || '',
      unileapApiUrl: import.meta.env.VITE_UNILEAP_API_URL || '',
      unileapApiKey: import.meta.env.VITE_UNILEAP_API_KEY || '',
      googleCalendarClientId: '',
      microsoftCalendarClientId: ''
    };
  }
  return config;
}

export function updateUnipileConfig(token: string, dsn: string) {
  if (!config) {
    config = {
      openAiApiKey: localStorage.getItem('openai_api_key') || '',
      unipileToken: token,
      unipileDsn: dsn,
      googleCalendarClientId: '',
      microsoftCalendarClientId: ''
    };
  } else {
    config.unipileToken = token;
    config.unipileDsn = dsn;
  }
  
  localStorage.setItem('unipile_token', token);
  localStorage.setItem('unipile_dsn', dsn);
}

export async function validateIntegrations() {
  const results = {
    linkedin: false,
    googleCalendar: false,
    microsoftCalendar: false
  };

  try {
    const { unipileToken, unipileDsn } = getConfig();
    
    // Validate Unipile/LinkedIn integration
    if (unipileToken && unipileDsn) {
      try {
        const response = await fetch(`https://${unipileDsn}/api/v1/accounts`, {
          headers: {
            'Authorization': `Bearer ${unipileToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const accounts = await response.json();
          // Check if there's at least one LinkedIn account connected
          results.linkedin = accounts.some((account: any) => account.provider === 'linkedin');
        }
      } catch (error) {
        console.error('Error validating Unipile connection:', error);
      }
    }

    // Validate Google Calendar integration
    const googleResponse = await fetch('/api/google/calendar/validate', {
      headers: {
        'Authorization': `Bearer ${config?.googleCalendarClientId}`
      }
    });
    results.googleCalendar = googleResponse.ok;

    // Validate Microsoft Calendar integration
    const microsoftResponse = await fetch('/api/microsoft/calendar/validate', {
      headers: {
        'Authorization': `Bearer ${config?.microsoftCalendarClientId}`
      }
    });
    results.microsoftCalendar = microsoftResponse.ok;

  } catch (error) {
    console.error('Error validating integrations:', error);
  }

  return results;
}
