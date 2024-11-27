import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Info, AlertCircle, XCircle } from 'lucide-react';
import { settingsService } from '../../../../services/settingsService';
import type { CalendarProvider, InterviewSchedulingData } from '../../../../types/campaign';

interface InterviewSchedulerModalProps {
  candidateId: string;
  candidateName: string;
  onClose: () => void;
  onSchedule: (data: InterviewSchedulingData) => void;
}

interface CalendarStatus {
  google: boolean;
  microsoft: boolean;
}

const DEFAULT_MESSAGE = `¡Hola {{firstName}}! 👋

¡Excelentes noticias! Me gustaría coordinar una entrevista contigo para conocernos mejor y discutir la oportunidad en detalle. Puedes agendar directamente en el horario que mejor te convenga usando este link: {{schedulingLink}}

¡Espero poder conversar pronto contigo!

Saludos,
{{recruiterName}}`;

export function InterviewSchedulerModal({ 
  candidateId, 
  candidateName,
  onClose, 
  onSchedule 
}: InterviewSchedulerModalProps) {
  const [calendarConfig, setCalendarConfig] = useState({
    provider: 'google' as CalendarProvider,
    daysAvailable: 7,
    workingHours: {
      start: '09:00',
      end: '18:00',
    },
    duration: 45,
    selectedDate: '',
    selectedTime: '',
    location: '',
    description: '',
  });

  const [message, setMessage] = useState(DEFAULT_MESSAGE);
  const [calendarStatus, setCalendarStatus] = useState<CalendarStatus>({
    google: false,
    microsoft: false
  });
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  // Generate available dates (excluding weekends)
  const getAvailableDates = () => {
    const dates: Date[] = [];
    const today = new Date();
    let current = new Date(today);
    
    while (dates.length < calendarConfig.daysAvailable) {
      if (current.getDay() !== 0 && current.getDay() !== 6) { // Skip weekends
        dates.push(new Date(current));
      }
      current.setDate(current.getDate() + 1);
    }
    return dates;
  };

  // Generate available time slots
  const generateTimeSlots = (date: Date) => {
    const times: string[] = [];
    const [startHour, startMinute] = calendarConfig.workingHours.start.split(':').map(Number);
    const [endHour, endMinute] = calendarConfig.workingHours.end.split(':').map(Number);
    
    const start = new Date(date);
    start.setHours(startHour, startMinute, 0);
    
    const end = new Date(date);
    end.setHours(endHour, endMinute, 0);
    
    while (start < end) {
      times.push(start.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }));
      start.setMinutes(start.getMinutes() + 30); // 30-minute intervals
    }
    
    return times;
  };

  // Update available times when date changes
  useEffect(() => {
    if (selectedDay) {
      const times = generateTimeSlots(selectedDay);
      setAvailableTimes(times);
      setCalendarConfig(prev => ({ ...prev, selectedTime: '' }));
    }
  }, [selectedDay, calendarConfig.workingHours]);

  useEffect(() => {
    const checkCalendarConnections = async () => {
      const googleConnection = await settingsService.getCalendarConnection('google');
      const microsoftConnection = await settingsService.getCalendarConnection('microsoft');
      
      setCalendarStatus({
        google: googleConnection?.connected || false,
        microsoft: microsoftConnection?.connected || false
      });
    };

    checkCalendarConnections();
  }, []);

  const handleSchedule = () => {
    // Validate calendar connection
    if (!calendarStatus[calendarConfig.provider]) {
      alert('Por favor, conecta primero tu cuenta de calendario en la sección de configuración.');
      return;
    }

    // Validate date and time selection
    if (!selectedDay || !calendarConfig.selectedTime) {
      alert('Por favor, selecciona una fecha y hora para la entrevista.');
      return;
    }

    // Validate location
    if (!calendarConfig.location.trim()) {
      alert('Por favor, indica la ubicación o enlace de la entrevista.');
      return;
    }

    // Create interview date from selected day and time
    const [hours, minutes] = calendarConfig.selectedTime.split(':').map(Number);
    const interviewDate = new Date(selectedDay);
    interviewDate.setHours(hours, minutes, 0, 0);

    // Prepare scheduling data
    const schedulingData: InterviewSchedulingData = {
      date: interviewDate.toISOString(),
      provider: calendarConfig.provider,
      duration: calendarConfig.duration,
      message: message
        .replace('{{firstName}}', candidateName)
        .replace('{{schedulingLink}}', calendarConfig.location)
        .replace('{{recruiterName}}', 'Equipo de Reclutamiento'), // TODO: Get actual recruiter name
      location: calendarConfig.location,
      description: `Entrevista con ${candidateName}\n\nDuración: ${calendarConfig.duration} minutos\nUbicación: ${calendarConfig.location}`
    };

    // Schedule interview
    onSchedule(schedulingData);
  };

  // Validate form before enabling schedule button
  const isFormValid = () => {
    return (
      calendarStatus[calendarConfig.provider] &&
      selectedDay !== null &&
      calendarConfig.selectedTime !== '' &&
      calendarConfig.location.trim() !== '' &&
      message.trim() !== ''
    );
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              Programar entrevista
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Configura los detalles de la entrevista para {candidateName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <span className="sr-only">Cerrar</span>
            <XCircle className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Calendario
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setCalendarConfig({ ...calendarConfig, provider: 'google' })}
                className={`p-3 rounded-lg border text-sm font-medium flex items-center justify-center space-x-2
                  ${calendarConfig.provider === 'google'
                    ? 'border-blue-500 text-blue-700 bg-blue-50'
                    : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                  } ${!calendarStatus.google ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={!calendarStatus.google}
              >
                <span>Google Calendar</span>
                {!calendarStatus.google && (
                  <AlertCircle className="w-4 h-4 text-yellow-500" />
                )}
              </button>
              <button
                onClick={() => setCalendarConfig({ ...calendarConfig, provider: 'microsoft' })}
                className={`p-3 rounded-lg border text-sm font-medium flex items-center justify-center space-x-2
                  ${calendarConfig.provider === 'microsoft'
                    ? 'border-blue-500 text-blue-700 bg-blue-50'
                    : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                  } ${!calendarStatus.microsoft ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={!calendarStatus.microsoft}
              >
                <span>Microsoft Calendar</span>
                {!calendarStatus.microsoft && (
                  <AlertCircle className="w-4 h-4 text-yellow-500" />
                )}
              </button>
            </div>
            {(!calendarStatus.google && !calendarStatus.microsoft) && (
              <p className="mt-2 text-sm text-yellow-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                Conecta tu calendario en la sección de configuración
              </p>
            )}
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Clock className="w-4 h-4 inline-block mr-1" />
                  Duración
                </label>
                <select
                  value={calendarConfig.duration}
                  onChange={(e) => setCalendarConfig({
                    ...calendarConfig,
                    duration: parseInt(e.target.value)
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={30}>30 minutos</option>
                  <option value={45}>45 minutos</option>
                  <option value={60}>1 hora</option>
                  <option value={90}>1.5 horas</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Calendar className="w-4 h-4 inline-block mr-1" />
                  Días disponibles
                </label>
                <select
                  value={calendarConfig.daysAvailable}
                  onChange={(e) => setCalendarConfig({
                    ...calendarConfig,
                    daysAvailable: parseInt(e.target.value)
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={3}>3 días</option>
                  <option value={5}>5 días</option>
                  <option value={7}>1 semana</option>
                  <option value={14}>2 semanas</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Clock className="w-4 h-4 inline-block mr-1" />
                  Horario laboral
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="time"
                    value={calendarConfig.workingHours.start}
                    onChange={(e) => setCalendarConfig({
                      ...calendarConfig,
                      workingHours: {
                        ...calendarConfig.workingHours,
                        start: e.target.value
                      }
                    })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="time"
                    value={calendarConfig.workingHours.end}
                    onChange={(e) => setCalendarConfig({
                      ...calendarConfig,
                      workingHours: {
                        ...calendarConfig.workingHours,
                        end: e.target.value
                      }
                    })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ubicación
                </label>
                <input
                  type="text"
                  value={calendarConfig.location}
                  onChange={(e) => setCalendarConfig({
                    ...calendarConfig,
                    location: e.target.value
                  })}
                  placeholder="Ej: Sala de reuniones / Google Meet"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha y hora
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded-lg p-2 space-y-2 max-h-48 overflow-y-auto">
                  {getAvailableDates().map((date) => (
                    <button
                      key={date.toISOString()}
                      onClick={() => setSelectedDay(date)}
                      className={`w-full px-3 py-2 text-left text-sm rounded-md ${
                        selectedDay?.toDateString() === date.toDateString()
                          ? 'bg-blue-50 text-blue-700 font-medium'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      {date.toLocaleDateString('es-ES', { 
                        weekday: 'long', 
                        day: 'numeric', 
                        month: 'long' 
                      })}
                    </button>
                  ))}
                </div>

                <div className="border border-gray-200 rounded-lg p-2 space-y-2 max-h-48 overflow-y-auto">
                  {availableTimes.map((time) => (
                    <button
                      key={time}
                      onClick={() => setCalendarConfig(prev => ({ ...prev, selectedTime: time }))}
                      className={`w-full px-3 py-2 text-left text-sm rounded-md ${
                        calendarConfig.selectedTime === time
                          ? 'bg-blue-50 text-blue-700 font-medium'
                          : 'hover:bg-gray-50'
                      }`}
                      disabled={!selectedDay}
                    >
                      {time}
                    </button>
                  ))}
                  {!selectedDay && (
                    <p className="text-sm text-gray-500 text-center p-2">
                      Selecciona una fecha primero
                    </p>
                  )}
                  {selectedDay && availableTimes.length === 0 && (
                    <p className="text-sm text-gray-500 text-center p-2">
                      No hay horarios disponibles
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mensaje para el candidato
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="mt-2 text-sm text-gray-500 flex items-center">
              <Info className="w-4 h-4 mr-1" />
              Variables disponibles: {{firstName}}, {{schedulingLink}}, {{recruiterName}}
            </p>
          </div>

          <div className="mt-6 border-t border-gray-200 pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {!calendarStatus[calendarConfig.provider] && (
                  <div className="flex items-center text-yellow-600 text-sm">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    Conecta tu calendario primero
                  </div>
                )}
                {calendarStatus[calendarConfig.provider] && !selectedDay && (
                  <div className="flex items-center text-gray-600 text-sm">
                    <Calendar className="w-4 h-4 mr-1" />
                    Selecciona fecha y hora
                  </div>
                )}
                {selectedDay && !calendarConfig.location && (
                  <div className="flex items-center text-gray-600 text-sm">
                    <Info className="w-4 h-4 mr-1" />
                    Indica la ubicación
                  </div>
                )}
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={onClose}
                  type="button"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSchedule}
                  type="submit"
                  disabled={!isFormValid()}
                  className={`px-4 py-2 text-sm font-medium rounded-lg flex items-center ${
                    isFormValid()
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  {selectedDay && calendarConfig.selectedTime
                    ? `Programar para ${selectedDay.toLocaleDateString('es-ES', { 
                        day: 'numeric',
                        month: 'short'
                      })} a las ${calendarConfig.selectedTime}`
                    : 'Programar entrevista'
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

