import React, { useState, useEffect } from 'react';
import { Calendar, AlertCircle } from 'lucide-react';

interface DateInputProps {
  value: string | undefined;
  onChange: (value: string) => void;
  error?: string;
}

export function DateInput({ value, onChange, error }: DateInputProps) {
  const [quickDates, setQuickDates] = useState<{ label: string; date: string }[]>([]);

  useEffect(() => {
    // Generate quick date options
    const today = new Date();
    const dates = [
      { 
        label: '1 semana', 
        date: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] 
      },
      { 
        label: '2 semanas', 
        date: new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] 
      },
      { 
        label: '1 mes', 
        date: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] 
      }
    ];
    setQuickDates(dates);
  }, []);

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const today = new Date().toISOString().split('T')[0];
  const isValidDate = value && new Date(value) > new Date();

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Fecha de finalización
      </label>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Calendar className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="date"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          min={today}
          className={`
            w-full pl-10 pr-3 py-2 border rounded-lg 
            focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            ${error ? 'border-red-300' : 'border-gray-300'}
            ${isValidDate ? 'border-green-300' : ''}
          `}
        />
      </div>

      {error ? (
        <div className="flex items-center text-red-600 text-sm">
          <AlertCircle className="w-4 h-4 mr-1" />
          <span>{error}</span>
        </div>
      ) : value ? (
        <p className="text-sm text-gray-600">
          La campaña finalizará el {formatDate(value)}
        </p>
      ) : (
        <p className="text-sm text-gray-500">
          La campaña se marcará como completada en esta fecha
        </p>
      )}

      <div className="flex items-center space-x-2 pt-2">
        <span className="text-sm text-gray-500">Sugerencias:</span>
        <div className="flex space-x-2">
          {quickDates.map(({ label, date }) => (
            <button
              key={label}
              onClick={() => onChange(date)}
              className={`
                px-3 py-1 text-sm rounded-full
                ${value === date 
                  ? 'bg-blue-100 text-blue-700 font-medium' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {value && (
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>
            {new Date(value).getTime() - new Date().getTime() > 30 * 24 * 60 * 60 * 1000
              ? 'Considera reducir el plazo para mantener el proceso ágil'
              : 'Plazo adecuado para el proceso de selección'}
          </span>
        </div>
      )}
    </div>
  );
}
