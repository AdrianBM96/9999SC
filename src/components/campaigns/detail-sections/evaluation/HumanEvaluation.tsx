import React, { useState } from 'react';
import { Campaign } from '../../../../types/campaign';
import { UserCircle2, Save, Plus, Trash2 } from 'lucide-react';

interface HumanEvaluationProps {
  candidate: any;
  campaign: Campaign;
  onUpdateEvaluation: (evaluation: any) => void;
}

interface EvaluationCriteria {
  id: string;
  name: string;
  score: number;
  weight: number;
  notes: string;
}

const defaultCriteria = [
  { id: '1', name: 'Experiencia técnica', score: 0, weight: 30, notes: '' },
  { id: '2', name: 'Habilidades blandas', score: 0, weight: 20, notes: '' },
  { id: '3', name: 'Ajuste cultural', score: 0, weight: 20, notes: '' },
  { id: '4', name: 'Potencial de crecimiento', score: 0, weight: 15, notes: '' },
  { id: '5', name: 'Motivación', score: 0, weight: 15, notes: '' },
];

export function HumanEvaluation({ candidate, campaign, onUpdateEvaluation }: HumanEvaluationProps) {
  const [criteria, setCriteria] = useState<EvaluationCriteria[]>(
    candidate.humanEvaluation?.criteria || defaultCriteria
  );
  const [overallNotes, setOverallNotes] = useState(
    candidate.humanEvaluation?.overallNotes || ''
  );
  const [saving, setSaving] = useState(false);

  const calculateOverallScore = () => {
    return Math.round(
      criteria.reduce((acc, curr) => acc + (curr.score * curr.weight) / 100, 0)
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const evaluation = {
        criteria,
        overallNotes,
        overallScore: calculateOverallScore(),
        evaluatedAt: new Date().toISOString(),
        evaluatedBy: {
          id: 'current-user-id', // Replace with actual user ID
          name: 'Current User', // Replace with actual user name
        },
      };
      await onUpdateEvaluation(evaluation);
    } finally {
      setSaving(false);
    }
  };

  const handleAddCriteria = () => {
    setCriteria([
      ...criteria,
      {
        id: Date.now().toString(),
        name: 'Nuevo criterio',
        score: 0,
        weight: 0,
        notes: '',
      },
    ]);
  };

  const handleRemoveCriteria = (id: string) => {
    setCriteria(criteria.filter(c => c.id !== id));
  };

  const handleCriteriaChange = (id: string, updates: Partial<EvaluationCriteria>) => {
    setCriteria(
      criteria.map(c => (c.id === id ? { ...c, ...updates } : c))
    );
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <UserCircle2 className="w-5 h-5 mr-2 text-blue-600" />
            Evaluación del reclutador
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Evaluación basada en entrevistas y revisión manual
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Guardando...' : 'Guardar evaluación'}
        </button>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between pb-4 border-b">
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {calculateOverallScore()}%
            </div>
            <div className="text-sm text-gray-500">
              Puntuación general
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {criteria.map(criterion => (
            <div key={criterion.id} className="space-y-2">
              <div className="flex items-start justify-between">
                <div className="flex-1 mr-4">
                  <input
                    type="text"
                    value={criterion.name}
                    onChange={(e) => handleCriteriaChange(criterion.id, { name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="Nombre del criterio"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={criterion.score}
                    onChange={(e) => handleCriteriaChange(criterion.id, { score: Number(e.target.value) })}
                    min="0"
                    max="100"
                    className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <span className="text-sm text-gray-500">%</span>
                  <input
                    type="number"
                    value={criterion.weight}
                    onChange={(e) => handleCriteriaChange(criterion.id, { weight: Number(e.target.value) })}
                    min="0"
                    max="100"
                    className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <span className="text-sm text-gray-500">peso</span>
                  <button
                    onClick={() => handleRemoveCriteria(criterion.id)}
                    className="p-2 text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <textarea
                value={criterion.notes}
                onChange={(e) => handleCriteriaChange(criterion.id, { notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="Notas sobre este criterio..."
                rows={2}
              />
            </div>
          ))}

          <button
            onClick={handleAddCriteria}
            className="flex items-center text-sm text-blue-600 hover:text-blue-700"
          >
            <Plus className="w-4 h-4 mr-1" />
            Añadir criterio
          </button>
        </div>

        <div className="pt-4 border-t">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notas generales
          </label>
          <textarea
            value={overallNotes}
            onChange={(e) => setOverallNotes(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            placeholder="Añade tus notas generales sobre el candidato..."
            rows={4}
          />
        </div>
      </div>
    </div>
  );
}
