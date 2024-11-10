import React, { useState } from 'react';
import { DepartmentManagement } from './DepartmentManagement';
import { CompanyInfo } from './CompanyInfo';
import { TeamManagement } from './TeamManagement';
import { Subscription } from './Subscription';
import { Integrations } from './Integrations';
import { Accounts } from './Accounts';
import { Settings as SettingsIcon, Building, Users, CreditCard, Link, UserPlus } from 'lucide-react';

export function Settings() {
  const [activeTab, setActiveTab] = useState('company');

  const tabs = [
    { id: 'company', name: 'Información de la compañía', icon: Building },
    { id: 'team', name: 'Equipo', icon: Users },
    { id: 'subscription', name: 'Subscripción y facturas', icon: CreditCard },
    { id: 'integrations', name: 'Integraciones', icon: Link },
    { id: 'accounts', name: 'Cuentas', icon: UserPlus },
  ];

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
          <SettingsIcon className="mr-2" />
          Configuración
        </h2>
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="flex border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-6 py-4 text-sm font-medium ${
                  activeTab === tab.id
                    ? 'text-red-600 border-b-2 border-red-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="mr-2 h-5 w-5" />
                {tab.name}
              </button>
            ))}
          </div>
          <div className="p-6">
            {activeTab === 'company' && <CompanyInfo />}
            {activeTab === 'team' && (
              <div className="space-y-6">
                <DepartmentManagement />
                <TeamManagement />
              </div>
            )}
            {activeTab === 'subscription' && <Subscription />}
            {activeTab === 'integrations' && <Integrations />}
            {activeTab === 'accounts' && <Accounts />}
          </div>
        </div>
      </div>
    </div>
  );
}