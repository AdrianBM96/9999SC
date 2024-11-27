import React from 'react';
import { Campaign } from '../../../../types/campaign';
import { 
  UserPlus, FileText, Search, Calendar, CheckCircle2, 
  XCircle, MessageSquare, Mail 
} from 'lucide-react';

interface TimelineActivityProps {
  campaign: Campaign;
}

const activityIcons = {
  'new': UserPlus,
  'form_submitted': FileText,
  'under_review': Search,
  'interview_scheduled': Calendar,
  'selected': CheckCircle2,
  'rejected': XCircle,
  'message_sent': MessageSquare,
  'email_sent': Mail,
};

export function TimelineActivity({ campaign }: TimelineActivityProps) {
  // Get all activities from candidates' history
  const activities = campaign.candidates?.flatMap(candidate => 
    candidate.history?.map(event => ({
      ...event,
      candidateId: candidate.id,
      candidateName: candidate.name,
    })) || []
  )
  .filter(Boolean)
  .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  .slice(0, 10) || []; // Show only last 10 activities

  const formatDate = (date: string) => {
    const d = new Date(date);
    return new Intl.DateTimeFormat('es-ES', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(d);
  };

  const getActivityMessage = (activity: any) => {
    const statusMessages = {
      'new': 'se unió a la campaña',
      'form_submitted': 'completó el formulario',
      'under_review': 'pasó a revisión',
      'interview_scheduled': 'tiene entrevista programada',
      'selected': 'fue seleccionado',
      'rejected': 'fue rechazado',
      'message_sent': 'recibió un mensaje',
      'email_sent': 'recibió un email',
    };

    return `${activity.candidateName} ${statusMessages[activity.status as keyof typeof statusMessages]}`;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">
        Actividad reciente
      </h3>

      {activities.length === 0 ? (
        <p className="text-sm text-gray-500">No hay actividad reciente.</p>
      ) : (
        <div className="space-y-6">
          {activities.map((activity, index) => {
            const Icon = activityIcons[activity.status as keyof typeof activityIcons] || UserPlus;

            return (
              <div key={`${activity.candidateId}-${index}`} className="relative">
                {index < activities.length - 1 && (
                  <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gray-200" />
                )}
                
                <div className="flex items-start">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="ml-4 flex-1">
                    <p className="text-sm text-gray-900">
                      {getActivityMessage(activity)}
                    </p>
                    <time className="text-xs text-gray-500">
                      {formatDate(activity.timestamp)}
                    </time>
                    {activity.note && (
                      <p className="mt-1 text-sm text-gray-600 bg-gray-50 rounded p-2">
                        {activity.note}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

