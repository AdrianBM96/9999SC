// Actualizar el archivo existente con las siguientes funciones adicionales

export async function findAvailableSlots(duration: number): Promise<{ date: string; time: string }[]> {
  try {
    const calendarDoc = await getDoc(doc(db, 'calendarIntegrations', 'status'));
    const calendarStatus = calendarDoc.data();

    if (!calendarStatus?.googleConnected && !calendarStatus?.microsoftConnected) {
      throw new Error('No hay calendarios conectados');
    }

    // Obtener eventos de los calendarios conectados
    const now = new Date();
    const endDate = new Date();
    endDate.setDate(now.getDate() + 14); // Buscar slots en los próximos 14 días

    const availableSlots: { date: string; time: string }[] = [];
    const workingHours = { start: 9, end: 18 }; // Horas laborables: 9 AM a 6 PM

    // Iterar sobre los próximos 14 días
    for (let d = new Date(now); d <= endDate; d.setDate(d.getDate() + 1)) {
      if (d.getDay() === 0 || d.getDay() === 6) continue; // Saltar fines de semana

      const date = d.toISOString().split('T')[0];
      
      // Buscar slots disponibles en las horas laborables
      for (let hour = workingHours.start; hour <= workingHours.end - duration/60; hour++) {
        const time = `${hour.toString().padStart(2, '0')}:00`;
        const slotStart = new Date(`${date}T${time}`);
        
        // Verificar disponibilidad en el calendario
        const isAvailable = await checkSlotAvailability(slotStart, duration);
        if (isAvailable) {
          availableSlots.push({ date, time });
        }
      }
    }

    return availableSlots;
  } catch (error) {
    console.error('Error finding available slots:', error);
    throw error;
  }
}

async function checkSlotAvailability(startTime: Date, duration: number): Promise<boolean> {
  try {
    const endTime = new Date(startTime.getTime() + duration * 60000);
    
    // Verificar en Google Calendar si está conectado
    const googleCalendarDoc = await getDoc(doc(db, 'calendarIntegrations', 'google'));
    if (googleCalendarDoc.exists()) {
      const googleAvailable = await checkGoogleCalendarAvailability(
        googleCalendarDoc.data().accessToken,
        startTime,
        endTime
      );
      if (!googleAvailable) return false;
    }

    // Verificar en Microsoft Calendar si está conectado
    const microsoftCalendarDoc = await getDoc(doc(db, 'calendarIntegrations', 'microsoft'));
    if (microsoftCalendarDoc.exists()) {
      const microsoftAvailable = await checkMicrosoftCalendarAvailability(
        microsoftCalendarDoc.data().accessToken,
        startTime,
        endTime
      );
      if (!microsoftAvailable) return false;
    }

    return true;
  } catch (error) {
    console.error('Error checking slot availability:', error);
    return false;
  }
}

async function checkGoogleCalendarAvailability(
  accessToken: string,
  startTime: Date,
  endTime: Date
): Promise<boolean> {
  try {
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/freeBusy`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          timeMin: startTime.toISOString(),
          timeMax: endTime.toISOString(),
          items: [{ id: 'primary' }],
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Error checking Google Calendar availability');
    }

    const data = await response.json();
    return !data.calendars.primary.busy.length;
  } catch (error) {
    console.error('Error checking Google Calendar:', error);
    throw error;
  }
}

async function checkMicrosoftCalendarAvailability(
  accessToken: string,
  startTime: Date,
  endTime: Date
): Promise<boolean> {
  try {
    const response = await fetch(
      'https://graph.microsoft.com/v1.0/me/calendar/getSchedule',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          schedules: [''],
          startTime: {
            dateTime: startTime.toISOString(),
            timeZone: 'UTC',
          },
          endTime: {
            dateTime: endTime.toISOString(),
            timeZone: 'UTC',
          },
          availabilityViewInterval: 30,
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Error checking Microsoft Calendar availability');
    }

    const data = await response.json();
    return data.value[0].availabilityView === '0';
  } catch (error) {
    console.error('Error checking Microsoft Calendar:', error);
    throw error;
  }
}

export async function scheduleCalendarEvent({
  summary,
  description,
  startTime,
  duration,
  attendees
}: {
  summary: string;
  description: string;
  startTime: Date;
  duration: number;
  attendees: { email: string }[];
}): Promise<string> {
  try {
    const endTime = new Date(startTime.getTime() + duration * 60000);
    const calendarDoc = await getDoc(doc(db, 'calendarIntegrations', 'status'));
    const calendarStatus = calendarDoc.data();

    let eventId: string | undefined;

    if (calendarStatus?.googleConnected) {
      eventId = await createGoogleCalendarEvent({
        summary,
        description,
        startTime,
        endTime,
        attendees,
      });
    } else if (calendarStatus?.microsoftConnected) {
      eventId = await createMicrosoftCalendarEvent({
        summary,
        description,
        startTime,
        endTime,
        attendees,
      });
    } else {
      throw new Error('No hay calendarios conectados');
    }

    return eventId;
  } catch (error) {
    console.error('Error scheduling calendar event:', error);
    throw error;
  }
}

async function createGoogleCalendarEvent({
  summary,
  description,
  startTime,
  endTime,
  attendees,
}: {
  summary: string;
  description: string;
  startTime: Date;
  endTime: Date;
  attendees: { email: string }[];
}): Promise<string> {
  const googleCalendarDoc = await getDoc(doc(db, 'calendarIntegrations', 'google'));
  const { accessToken } = googleCalendarDoc.data();

  const response = await fetch(
    'https://www.googleapis.com/calendar/v3/calendars/primary/events',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        summary,
        description,
        start: {
          dateTime: startTime.toISOString(),
          timeZone: 'UTC',
        },
        end: {
          dateTime: endTime.toISOString(),
          timeZone: 'UTC',
        },
        attendees,
        reminders: {
          useDefault: true,
        },
      }),
    }
  );

  if (!response.ok) {
    throw new Error('Error creating Google Calendar event');
  }

  const data = await response.json();
  return data.id;
}

async function createMicrosoftCalendarEvent({
  summary,
  description,
  startTime,
  endTime,
  attendees,
}: {
  summary: string;
  description: string;
  startTime: Date;
  endTime: Date;
  attendees: { email: string }[];
}): Promise<string> {
  const microsoftCalendarDoc = await getDoc(doc(db, 'calendarIntegrations', 'microsoft'));
  const { accessToken } = microsoftCalendarDoc.data();

  const response = await fetch(
    'https://graph.microsoft.com/v1.0/me/events',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subject: summary,
        body: {
          contentType: 'text',
          content: description,
        },
        start: {
          dateTime: startTime.toISOString(),
          timeZone: 'UTC',
        },
        end: {
          dateTime: endTime.toISOString(),
          timeZone: 'UTC',
        },
        attendees: attendees.map(attendee => ({
          emailAddress: {
            address: attendee.email,
          },
          type: 'required',
        })),
      }),
    }
  );

  if (!response.ok) {
    throw new Error('Error creating Microsoft Calendar event');
  }

  const data = await response.json();
  return data.id;
}

export async function updateCalendarEvent(
  eventId: string,
  updates: {
    status?: string;
    description?: string;
  }
): Promise<void> {
  try {
    const calendarDoc = await getDoc(doc(db, 'calendarIntegrations', 'status'));
    const calendarStatus = calendarDoc.data();

    if (calendarStatus?.googleConnected) {
      await updateGoogleCalendarEvent(eventId, updates);
    } else if (calendarStatus?.microsoftConnected) {
      await updateMicrosoftCalendarEvent(eventId, updates);
    }
  } catch (error) {
    console.error('Error updating calendar event:', error);
    throw error;
  }
}

async function updateGoogleCalendarEvent(
  eventId: string,
  updates: {
    status?: string;
    description?: string;
  }
): Promise<void> {
  const googleCalendarDoc = await getDoc(doc(db, 'calendarIntegrations', 'google'));
  const { accessToken } = googleCalendarDoc.data();

  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
    {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description: updates.description,
        status: updates.status === 'cancelled' ? 'cancelled' : 'confirmed',
      }),
    }
  );

  if (!response.ok) {
    throw new Error('Error updating Google Calendar event');
  }
}

async function updateMicrosoftCalendarEvent(
  eventId: string,
  updates: {
    status?: string;
    description?: string;
  }
): Promise<void> {
  const microsoftCalendarDoc = await getDoc(doc(db, 'calendarIntegrations', 'microsoft'));
  const { accessToken } = microsoftCalendarDoc.data();

  const response = await fetch(
    `https://graph.microsoft.com/v1.0/me/events/${eventId}`,
    {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        body: {
          contentType: 'text',
          content: updates.description,
        },
        isCancelled: updates.status === 'cancelled',
      }),
    }
  );

  if (!response.ok) {
    throw new Error('Error updating Microsoft Calendar event');
  }
}