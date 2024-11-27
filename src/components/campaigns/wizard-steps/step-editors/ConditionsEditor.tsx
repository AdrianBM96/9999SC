import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { StepCondition, CandidateStatus } from '../../../../types/campaign';

interface ConditionsEditorProps {
  conditions: StepCondition[];
  onChange: (conditions: StepCondition[]) => void;
  statusOptions: { value: CandidateStatus; label: string }[];
}

export function ConditionsEditor({ conditions, onChange, statusOptions }: ConditionsEditorProps) {
  const addCondition = () => {
    onChange([
      ...conditions,
      {
        type: 'status',
        operator: 'equals',
        value: 'new'
      }
    ]);
  };

  const removeCondition = (index: number) => {
    onChange(conditions.filter((_, i) => i !== index));
  };

  const updateCondition = (index: number, updates: Partial<StepCondition>) => {
    onChange(
      conditions.map((condition, i) => 
        i === index ? { ...condition, ...updates } : condition
      )
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium text-gray-700">
          Condiciones
        </label>
        <button
          onClick={addCondition}
          className="flex items-center px-2 py-1 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          <Plus className="w-4 h-4 mr-1" />
          Añadir condición
        </button>
      </div>

      {conditions.length === 0 ? (
        <p className="text-sm text-gray-500">
          No hay condiciones. Este paso se ejecutará inmediatamente.
        </p>
      ) : (
        <div className="space-y-3">
          {conditions.map((condition, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
              <div className="flex-1 space-y-3">
                <select
                  value={condition.type}
                  onChange={(e) => updateCondition(index, { type: e.target.value as StepCondition['type'] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="status">Estado del candidato</option>
                  <option value="form_score">Puntuación del formulario</option>
                  <option value="time_elapsed">Tiempo transcurrido</option>
                </select>

                <div className="flex space-x-2">
                  <select
                    value={condition.operator}
                    onChange={(e) => updateCondition(index, { operator: e.target.value as StepCondition['operator'] })}
                    className="w-40 px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="equals">es igual a</option>
                    <option value="not_equals">no es igual a</option>
                    {condition.type !== 'status' && (
                      <>
                        <option value="greater_than">es mayor que</option>
                        <option value="less_than">es menor que</option>
                      </>
                    )}
                  </select>

                  {condition.type === 'status' ? (
                    <select
                      value={condition.value as string}
                      onChange={(e) => updateCondition(index, { value: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      {statusOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="number"
                      value={condition.value as number}
                      onChange={(e) => updateCondition(index, { value: Number(e.target.value) })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder={condition.type === 'form_score' ? 'Puntuación' : 'Días'}
                      min={0}
                      max={condition.type === 'form_score' ? 100 : 365}
                    />
                  )}
                </div>
              </div>

              <button
                onClick={() => removeCondition(index)}
                className="p-1 text-gray-400 hover:text-red-600"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
