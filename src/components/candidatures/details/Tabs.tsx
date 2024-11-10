import React from 'react';
import { BarChart2, FileText, Users, Settings, Briefcase, Share2 } from 'lucide-react';

interface TabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function Tabs({ activeTab, setActiveTab }: TabsProps) {
  const tabs = [
    { id: 'general', label: 'Información General', icon: Briefcase },
    { id: 'description', label: 'Descripción', icon: FileText },
    { id: 'candidates', label: 'Candidatos', icon: Users },
    { id: 'analytics', label: 'Analíticas', icon: BarChart2 },
    { id: 'publish', label: 'Publicar', icon: Share2 },
    { id: 'settings', label: 'Configuración', icon: Settings },
  ];

  return (
    <nav className="flex-1">
      <div className="space-y-1 py-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`w-full flex items-center px-8 py-3 text-sm font-medium transition-colors duration-150 ${
              activeTab === tab.id
                ? 'text-blue-600 bg-blue-50 border-r-4 border-blue-600'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <tab.icon className={`mr-3 h-5 w-5 ${
              activeTab === tab.id ? 'text-blue-600' : 'text-gray-400'
            }`} />
            {tab.label}
          </button>
        ))}
      </div>
    </nav>
  );
}