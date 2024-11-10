interface Config {
  openAiApiKey: string;
  linkedinApiKey: string;
  googleCalendarClientId: string;
  microsoftCalendarClientId: string;
}

let config: Config | null = null;

export function initConfig(configData: Config) {
  config = configData;
}

export function getConfig(): Config {
  if (!config) {
    throw new Error('Configuration not initialized');
  }
  return config;
}

export async function validateIntegrations() {
  const results = {
    linkedin: false,
    googleCalendar: false,
    microsoftCalendar: false
  };

  try {
    // Validate LinkedIn integration
    const linkedinResponse = await fetch('/api/linkedin/validate', {
      headers: {
        'Authorization': `Bearer ${config?.linkedinApiKey}`
      }
    });
    results.linkedin = linkedinResponse.ok;

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
