import React from 'react';
import { Campaign } from '../../../../types/campaign';
import { CampaignMetrics } from '../CampaignMetrics';
import { CandidateDistribution } from './CandidateDistribution';
import { StageProgress } from './StageProgress';
import { TimelineActivity } from './TimelineActivity';
import { AlertCircle } from 'lucide-react';

interface OverviewSectionProps {
  campaign: Campaign;
}

export function OverviewSection({ campaign }: OverviewSectionProps) {
  const getPendingTasksCount = () => {
    if (!campaign.candidates?.length) return 0;
    
    return campaign.candidates.reduce((count, candidate) => {
      if (candidate.cvFile && !candidate.cvReviewed) count++;
      if (candidate.formSubmitted && !candidate.formEvaluated) count++;
      if (candidate.status === 'interview_completed' && !candidate.interviewEvaluated) count++;
      if (candidate.status === 'interview_completed' && candidate.interviewEvaluated && !candidate.finalDecisionMade) count++;
      return count;
    }, 0);
  };

  const pendingTasks = getPendingTasksCount();

  return (
    <div className="space-y-6">
      {pendingTasks > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start">
          <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-yellow-800">
              Tareas pendientes
            </h3>
            <p className="mt-1 text-sm text-yellow-700">
              Hay {pendingTasks} {pendingTasks === 1 ? 'tarea pendiente' : 'tareas pendientes'} que requieren tu atención.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <CampaignMetrics campaign={campaign} />
          <CandidateDistribution campaign={campaign} />
        </div>
        <div className="space-y-6">
          <StageProgress campaign={campaign} />
          <TimelineActivity campaign={campaign} />
        </div>
      </div>
    </div>
  );
}

