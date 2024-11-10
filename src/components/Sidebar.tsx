import React from 'react';
import { Briefcase, Calendar, ListTodo } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  setShowRecruitmentMenu: (show: boolean) => void;
}

export function Sidebar({ activeTab, setActiveTab, setShowRecruitmentMenu }: SidebarProps) {
  const sidebarItems = [
    {
      id: 'recruitment',
      icon: Briefcase,
      label: 'Reclutamiento'
    },
    {
      id: 'tasks',
      icon: ListTodo,
      label: 'Tareas'
    },
    {
      id: 'calendar',
      icon: Calendar,
      label: 'Calendario'
    }
  ];

  return (
    <div className="w-[48px] bg-white border-r border-gray-200 flex flex-col h-screen">
      <div className="p-2">
        <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
          <span className="text-white font-medium text-xs">AR</span>
        </div>
      </div>

      <div className="flex-1 px-2 py-4 space-y-4">
        {sidebarItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setActiveTab(item.id);
              if (item.id === 'recruitment') {
                setShowRecruitmentMenu(prev => !prev);
              }
            }}
            className={`w-8 h-8 flex items-center justify-center rounded transition-colors ${
              activeTab === item.id
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            <item.icon className="w-4 h-4" />
          </button>
        ))}
      </div>
    </div>
  );
}