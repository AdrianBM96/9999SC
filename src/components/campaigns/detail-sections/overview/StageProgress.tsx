import React from 'react';
import { Campaign, CandidateStatus } from '../../../../types/campaign';
import { 
  UserPlus, FileText, Search, Calendar, CheckCircle2, 
  XCircle, Clock, ArrowRight 
} from 'lucide-react';

interface StageProgressProps {
  campaign: Campaign;
}

const stages: Array<{
  status: CandidateStatus;
  label: string;
  icon: React.ElementType;
  description: string;
}> = [
  {
    status: 'new',
    label: 'Nuevos',
    icon: UserPlus,
    description: 'Candidatos recién añadidos'
  },
  {
    status: 'form_submitted',
    label: 'Formulario enviado',
    icon: FileText,
    description: 'Han completado el formulario'
  },
  {
    status: 'under_review',
    label: 'En revisión',
    icon: Search,
    description: 'Evaluación en curso'
  },
  {
    status: 'interview_scheduled',
    label: 'Entrevista agendada',
    icon: Calendar,
    description: 'Esperando entrevista'
  },
  {
    status: 'interview_completed',
    label: 'Entrevista completada',
    icon: Clock,
    description: 'Pendiente de decisión'
  },
  {
    status: 'selected',
    label: 'Seleccionados',
    icon: CheckCircle2,
    description: 'Aprobados para contratar'
  },
  {
    status: 'rejected',
    label: 'Rechazados',
    icon: XCircle,
    description: 'No continúan en el proceso'
  }
];

export function StageProgress({ campaign }: StageProgressProps) {
  const getCandidateCount = (status: CandidateStatus) => {
    return campaign.candidates?.filter(c => c.status === status)?.length || 0;
  };

  const getPercentage = (count: number) => {
    return campaign.candidates?.length > 0
      ? Math.round((count / campaign.candidates.length) * 100)
      : 0;
  };

  if (!campaign.candidates?.length) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Progreso por etapas
        </h3>
        <p className="text-sm text-gray-500">No hay candidatos en esta campaña todavía.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">
        Progreso por etapas
      </h3>

      <div className="space-y-6">
        {stages.map((stage, index) => {
          const count = getCandidateCount(stage.status);
          const percentage = getPercentage(count);
          const StageIcon = stage.icon;

          return (
            <div key={stage.status} className="relative">
              {index < stages.length - 1 && (
                <div className="absolute left-4 top-12 bottom-0 w-0.5 bg-gray-200" />
              )}
              
              <div className="flex items-start relative z-10">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                  ${count > 0 ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}
                `}>
                  <StageIcon className="w-4 h-4" />
                </div>

                <div className="ml-4 flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">
                        {stage.label}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {stage.description}
                      </p>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {count}
                    </span>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        count > 0 ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

