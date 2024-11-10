import React from 'react';
import { Code, Briefcase, Zap, Plus } from 'lucide-react';
import { CampaignTemplate } from '../../../types/campaign';
import { defaultTemplates } from '../templates/defaultTemplates';

interface SelectTemplateProps {
  onSelect: (template: CampaignTemplate | null) => void;
}

const iconMap = {
  code: Code,
  briefcase: Briefcase,
  zap: Zap,
};

export function SelectTemplate({ onSelect }: SelectTemplateProps) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-lg font-semibold text-gray-900">Selecciona un template</h3>
        <p className="mt-1 text-sm text-gray-500">
          Comienza con un template predefinido o crea una campaña desde cero
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {defaultTemplates.map((template) => {
          const Icon = iconMap[template.icon as keyof typeof iconMap];
          return (
            <button
              key={template.id}
              onClick={() => onSelect(template)}
              className="relative flex flex-col items-center p-6 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-md transition-all group"
            >
              <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 mb-4">
                <Icon className="w-6 h-6" />
              </div>
              <h4 className="text-base font-medium text-gray-900 mb-2">
                {template.name}
              </h4>
              <p className="text-sm text-gray-500 text-center">
                {template.description}
              </p>
              <div className="absolute inset-0 flex items-center justify-center bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                <span className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg">
                  Usar template
                </span>
              </div>
            </button>
          );
        })}

        <button
          onClick={() => onSelect(null)}
          className="flex flex-col items-center p-6 bg-white border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:shadow-md transition-all"
        >
          <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-gray-50 text-gray-400 mb-4">
            <Plus className="w-6 h-6" />
          </div>
          <h4 className="text-base font-medium text-gray-900 mb-2">
            Campaña personalizada
          </h4>
          <p className="text-sm text-gray-500 text-center">
            Crea una campaña desde cero con tus propios pasos
          </p>
        </button>
      </div>
    </div>
  );
}
