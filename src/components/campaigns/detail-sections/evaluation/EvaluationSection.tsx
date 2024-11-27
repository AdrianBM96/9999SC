import React from 'react';
import { Campaign } from '../../../../types/campaign';
import { AIEvaluation } from './AIEvaluation';
import { HumanEvaluation } from './HumanEvaluation';
import { EvaluationComparison } from './EvaluationComparison';
import { EvaluationHistory } from './EvaluationHistory';

interface EvaluationSectionProps {
  campaign: Campaign;
  candidateId: string;
  onUpdateEvaluation: (evaluation: any) => void;
}

export function EvaluationSection({ campaign, candidateId, onUpdateEvaluation }: EvaluationSectionProps) {
  const candidate = campaign.candidates.find(c => c.id === candidateId);
  
  if (!candidate) {
    return (
      <div className="text-center py-8 text-gray-500">
        Candidato no encontrado
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <AIEvaluation 
            candidate={candidate} 
            campaign={campaign}
            onUpdateEvaluation={onUpdateEvaluation}
          />
          <EvaluationHistory 
            candidate={candidate}
          />
        </div>
        <div className="space-y-6">
          <HumanEvaluation 
            candidate={candidate}
            campaign={campaign}
            onUpdateEvaluation={onUpdateEvaluation}
          />
          <EvaluationComparison 
            candidate={candidate}
          />
        </div>
      </div>
    </div>
  );
}
