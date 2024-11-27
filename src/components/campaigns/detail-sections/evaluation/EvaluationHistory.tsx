import React from 'react';
import { History, Brain, UserCircle2, ArrowUp, ArrowDown, Minus } from 'lucide-react';

interface EvaluationHistoryProps {
  candidate: any;
}

export function EvaluationHistory({ candidate }: EvaluationHistoryProps) {
  const evaluations = candidate.evaluationHistory || [];

  const getScoreChange = (current: number, previous: number) => {
    const difference = current - previous;
    if (difference > 0) {
      return {
        icon: ArrowUp,
        color: 'text-green-600',
        text: `+${difference}%`
      };
    }
    if (difference < 0) {
      return {
        icon: ArrowDown,
        color: 'text-red-600',
        text: `${difference}%`
      };
    }
    return {
      icon: Minus,
      color: 'text-gray-400',
      text: '0%'
    };
  };

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('es-ES', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center mb-6">
        <History className="w-5 h-5 mr-2 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">
          Historial de evaluaciones
        </h3>
      </div>

      {evaluations.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-8">
          No hay historial de evaluaciones disponible
        </p>
      ) : (
        <div className="space-y-4">
          {evaluations.map((evaluation: any, index: number) => {
            const previousScore = index < evaluations.length - 1 
              ? evaluations[index + 1].score 
              : evaluation.score;
            const change = getScoreChange(evaluation.score, previousScore);
            const ChangeIcon = change.icon;

            return (
              <div 
                key={evaluation.timestamp} 
                className="flex items-start space-x-4 p-4 rounded-lg border border-gray-100"
              >
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                  ${evaluation.type === 'ai' ? 'bg-blue-100' : 'bg-green-100'}
                `}>
                  {evaluation.type === 'ai' ? (
                    <Brain className="w-4 h-4 text-blue-600" />
                  ) : (
                    <UserCircle2 className="w-4 h-4 text-green-600" />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {evaluation.type === 'ai' ? 'Evaluación IA' : 'Evaluación humana'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(evaluation.timestamp)}
                        {evaluation.type === 'human' && evaluation.evaluator && (
                          <> · por {evaluation.evaluator.name}</>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900">
                        {evaluation.score}%
                      </span>
                      <div className={`flex items-center ${change.color}`}>
                        <ChangeIcon className="w-4 h-4" />
                        <span className="text-xs ml-1">{change.text}</span>
                      </div>
                    </div>
                  </div>

                  {evaluation.notes && (
                    <p className="mt-2 text-sm text-gray-600 bg-gray-50 rounded p-2">
                      {evaluation.notes}
                    </p>
                  )}

                  {evaluation.changes && evaluation.changes.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {evaluation.changes.map((change: any, i: number) => (
                        <p key={i} className="text-xs text-gray-500">
                          • {change}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
