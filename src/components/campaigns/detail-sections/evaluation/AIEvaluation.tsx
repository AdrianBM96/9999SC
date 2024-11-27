import React, { useState } from 'react';
import { Campaign } from '../../../../types/campaign';
import { Brain, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { evaluateCandidateWithAI } from '../../../../services/ai/candidate';

interface AIEvaluationProps {
  candidate: any;
  campaign: Campaign;
  onUpdateEvaluation: (evaluation: any) => void;
}

interface EvaluationCriteria {
  category: string;
  score: number;
  feedback: string;
  matchPercentage: number;
}

export function AIEvaluation({ candidate, campaign, onUpdateEvaluation }: AIEvaluationProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEvaluate = async () => {
    setLoading(true);
    setError(null);
    try {
      const evaluation = await evaluateCandidateWithAI(candidate, campaign);
      onUpdateEvaluation(evaluation);
    } catch (err) {
      setError('Error al realizar la evaluación con IA');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const renderCriteriaScore = (criteria: EvaluationCriteria) => (
    <div key={criteria.category} className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-700">
          {criteria.category}
        </span>
        <span className="text-sm font-medium text-gray-900">
          {criteria.matchPercentage}%
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full"
          style={{ width: `${criteria.matchPercentage}%` }}
        />
      </div>
      <p className="text-sm text-gray-600 mt-1">
        {criteria.feedback}
      </p>
    </div>
  );

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Brain className="w-5 h-5 mr-2 text-blue-600" />
            Evaluación IA
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Análisis automático basado en CV, perfil de LinkedIn y requisitos
          </p>
        </div>
        
        <button
          onClick={handleEvaluate}
          disabled={loading}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            loading
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 inline animate-spin" />
              Evaluando...
            </>
          ) : (
            'Evaluar con IA'
          )}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex">
            <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      )}

      {candidate.aiEvaluation ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-4 border-b">
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {candidate.aiEvaluation.overallScore}%
              </div>
              <div className="text-sm text-gray-500">
                Coincidencia general
              </div>
            </div>
            <div className={`
              px-3 py-1 rounded-full text-sm font-medium
              ${candidate.aiEvaluation.overallScore >= 75
                ? 'bg-green-100 text-green-800'
                : candidate.aiEvaluation.overallScore >= 50
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
              }
            `}>
              {candidate.aiEvaluation.overallScore >= 75
                ? 'Muy adecuado'
                : candidate.aiEvaluation.overallScore >= 50
                ? 'Potencial'
                : 'Bajo ajuste'
              }
            </div>
          </div>

          <div className="space-y-4">
            {candidate.aiEvaluation.criteria.map(renderCriteriaScore)}
          </div>

          <div className="pt-4 border-t">
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              Recomendación IA
            </h4>
            <p className="text-sm text-gray-600">
              {candidate.aiEvaluation.recommendation}
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <Brain className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p>No hay evaluación IA disponible</p>
          <p className="text-sm mt-1">
            Haz clic en "Evaluar con IA" para analizar al candidato
          </p>
        </div>
      )}
    </div>
  );
}

