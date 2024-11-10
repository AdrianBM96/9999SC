import { getConfig } from './config';

interface CalendarEvent {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  attendees: string[];
}

export async function createGoogleCalendarEvent(event: CalendarEvent) {
  try {
    const response = await fetch('/api/google/calendar/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getConfig().googleCalendarClientId}`
      },
      body: JSON.stringify(event)
    });

    if (!response.ok) {
      throw new Error('Failed to create Google Calendar event');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating Google Calendar event:', error);
    throw error;
  }
}

export async function createMicrosoftCalendarEvent(event: CalendarEvent) {
  try {
    const response = await fetch('/api/microsoft/calendar/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getConfig().microsoftCalendarClientId}`
      },
      body: JSON.stringify(event)
    });

    if (!response.ok) {
      throw new Error('Failed to create Microsoft Calendar event');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating Microsoft Calendar event:', error);
    throw error;
  }
}

export async function scheduleInterview(
  candidateId: string,
  interviewDetails: {
    title: string;
    description: string;
    startTime: string;
    endTime: string;
    interviewers: string[];
  }
) {
  const event: CalendarEvent = {
    title: interviewDetails.title,
    description: interviewDetails.description,
    startTime: interviewDetails.startTime,
    endTime: interviewDetails.endTime,
    attendees: interviewDetails.interviewers
  };

  try {
    // Get user's preferred calendar from settings
    const userSettings = await fetch('/api/user/settings').then(res => res.json());
    
    if (userSettings.preferredCalendar === 'google') {
      await createGoogleCalendarEvent(event);
    } else if (userSettings.preferredCalendar === 'microsoft') {
      await createMicrosoftCalendarEvent(event);
    } else {
      throw new Error('No calendar preference set');
    }

    // Update candidate status
    await fetch(`/api/candidates/${candidateId}/interview`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        status: 'interview_scheduled',
        interviewDetails: {
          ...interviewDetails,
          scheduledAt: new Date().toISOString()
        }
      })
    });

  } catch (error) {
    console.error('Error scheduling interview:', error);
    throw error;
  }
}
