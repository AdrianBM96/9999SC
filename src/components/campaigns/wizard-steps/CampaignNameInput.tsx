import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle2, Tag } from 'lucide-react';

interface CampaignNameInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function CampaignNameInput({ value, onChange, error }: CampaignNameInputProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [strength, setStrength] = useState<'weak' | 'medium' | 'strong'>('weak');

  // Evaluate name strength
  useEffect(() => {
    if (!value) {
      setStrength('weak');
      return;
    }

    let score = 0;
    
    // Length check
    if (value.length >= 10) score += 1;
    if (value.length >= 20) score += 1;

    // Contains date or identifier
    if (/\d{4}|\d{2}\/\d{2}|\#\d+/i.test(value)) score += 1;

    // Contains department or role
    if (/ingenier[oa]|desarrollador[a]|ventas|marketing|rrhh|técnico/i.test(value)) score += 1;

    // Contains action words
    if (/contratación|reclutamiento|búsqueda|selección|sourcing/i.test(value)) score += 1;

    setStrength(score <= 1 ? 'weak' : score <= 3 ? 'medium' : 'strong');
  }, [value]);

  // Generate name suggestions
  useEffect(() => {
    const currentDate = new Date().toLocaleDateString('es-ES', { 
      month: 'short', 
      year: 'numeric' 
    });

    const baseSuggestions = [
      `Reclutamiento - ${value} - ${currentDate}`,
      `Búsqueda ${value} - ${currentDate}`,
      `Campaña ${value} #${Math.floor(Math.random() * 1000)}`,
      `${value} - Proceso de selección ${currentDate}`,
      `${value} - Sourcing activo`
    ];

    setSuggestions(baseSuggestions.filter(s => s !== value));
  }, [value]);

  const strengthColors = {
    weak: 'text-red-600',
    medium: 'text-yellow-600',
    strong: 'text-green-600'
  };

  const strengthMessages = {
    weak: 'Nombre básico - Añade más detalles',
    medium: 'Nombre adecuado - Podría ser más descriptivo',
    strong: 'Nombre descriptivo y completo'
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium text-gray-700">
          Nombre de la campaña
        </label>
        {value && !error && (
          <span className={`text-xs flex items-center ${strengthColors[strength]}`}>
            {strength === 'strong' && <CheckCircle2 className="w-3 h-3 mr-1" />}
            {strengthMessages[strength]}
          </span>
        )}
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Tag className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          className={`
            w-full pl-10 pr-3 py-2 border rounded-lg 
            focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            ${error ? 'border-red-300' : 'border-gray-300'}
            ${strength === 'strong' && !error ? 'border-green-300' : ''}
          `}
          placeholder="Ej: Reclutamiento Desarrollador Senior - Q4 2024"
        />
      </div>

      {error && (
        <div className="flex items-center text-red-600 text-sm">
          <AlertCircle className="w-4 h-4 mr-1" />
          <span>{error}</span>
        </div>
      )}

      {!error && value && showSuggestions && suggestions.length > 0 && (
        <div className="mt-2">
          <div className="text-xs text-gray-500 mb-2">Sugerencias de nombres:</div>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => onChange(suggestion)}
                className="inline-flex items-center px-2 py-1 rounded-md text-xs
                  bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {!error && !value && (
        <p className="text-sm text-gray-500">
          Un buen nombre debe incluir: rol/posición, departamento, fecha o identificador
        </p>
      )}

      {value && !error && (
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <span className="font-medium">Longitud:</span>
          <div className="flex-1 bg-gray-200 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full ${
                value.length < 10 ? 'w-1/4 bg-red-500' :
                value.length < 20 ? 'w-1/2 bg-yellow-500' :
                value.length < 30 ? 'w-3/4 bg-green-500' :
                'w-full bg-green-600'
              }`}
            />
          </div>
          <span className={`${value.length < 10 ? 'text-red-600' : 
                            value.length < 20 ? 'text-yellow-600' : 
                            'text-green-600'}`}>
            {value.length} caracteres
          </span>
        </div>
      )}
    </div>
  );
}
