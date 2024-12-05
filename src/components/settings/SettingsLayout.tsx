import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { User, Calendar, Bell, Link as LinkIcon, Plug } from 'lucide-react';

const settingsMenu = [
  { path: '/settings/profile', label: 'Perfil', icon: User },
  { path: '/settings/accounts', label: 'Cuentas conectadas', icon: LinkIcon },
  { path: '/settings/calendar', label: 'Calendario', icon: Calendar },
  { path: '/settings/notifications', label: 'Notificaciones', icon: Bell },
  { path: '/settings/integrations', label: 'Integraciones', icon: Plug },
];

export function SettingsLayout() {
  const location = useLocation();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex gap-8">
        <aside className="w-64 flex-shrink-0">
          <nav className="space-y-1">
            {settingsMenu.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg ${
                  location.pathname === path
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {label}
              </Link>
            ))}
          </nav>
        </aside>

        <main className="flex-1 bg-white rounded-lg border border-gray-200 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
