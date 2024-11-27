import React from 'react';
import { Scale, Brain, UserCircle2 } from 'lucide-react';

interface EvaluationComparisonProps {
  candidate: any;
}

export function EvaluationComparison({ candidate }: EvaluationComparisonProps) {
  const aiEval = candidate.aiEvaluation;
  const humanEval = candidate.humanEvaluation;

  if (!aiEval || !humanEval) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center mb-4">
          <Scale className="w-5 h-5 mr-2 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Comparación de evaluaciones
          </h3>
        </div>
        <p className="text-sm text-gray-500 text-center py-8">
          Se necesitan ambas evaluaciones (IA y humana) para mostrar la comparación
        </p>
      </div>
    );
  }

  const calculateDifference = (score1: number, score2: number) => {
    return Math.abs(score1 - score2);
  };

  const getScoreColor = (difference: number) => {
    if (difference <= 10) return 'text-green-600';
    if (difference <= 20) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center mb-6">
        <Scale className="w-5 h-5 mr-2 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">
          Comparación de evaluaciones
        </h3>
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-center pb-4 border-b">
          <div className="flex items-center">
            <Brain className="w-5 h-5 mr-2 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">IA</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {aiEval.overallScore}%
          </div>
        </div>

        <div className="flex justify-between items-center pb-4 border-b">
          <div className="flex items-center">
            <UserCircle2 className="w-5 h-5 mr-2 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Humana</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {humanEval.overallScore}%
          </div>
        </div>

        <div className="pt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Diferencia
            </span>
            <span className={`text-lg font-bold ${
              getScoreColor(calculateDifference(aiEval.overallScore, humanEval.overallScore))
            }`}>
              {calculateDifference(aiEval.overallScore, humanEval.overallScore)}%
            </span>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              Análisis de la diferencia
            </h4>
            <p className="text-sm text-gray-600">
              {calculateDifference(aiEval.overallScore, humanEval.overallScore) <= 10
                ? 'Las evaluaciones están alineadas, lo que sugiere una valoración consistente del candidato.'
                : calculateDifference(aiEval.overallScore, humanEval.overallScore) <= 20
                ? 'Hay algunas discrepancias entre las evaluaciones. Considera revisar los criterios específicos.'
                : 'Existe una diferencia significativa entre las evaluaciones. Se recomienda una revisión detallada.'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
