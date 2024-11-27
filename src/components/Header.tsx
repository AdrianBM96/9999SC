import React, { useState } from 'react';
import { auth } from '../firebase';
import { signOut, User } from 'firebase/auth';
import { Bell, Settings, Search, ChevronDown } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

interface HeaderProps {
  user: User | null;
  showRecruitmentMenu: boolean;
}

export function Header({ user, showRecruitmentMenu }: HeaderProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  
  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const recruitmentLinks = [
    { path: '/candidatures', label: 'Ofertas' },
    { path: '/campaigns', label: 'Campañas' },
    { path: '/candidates', label: 'Candidatos' },
    { path: '/forms', label: 'Formularios' },
    { path: '/hiring', label: 'Contratación' },
    { path: '/linkedin-inbox', label: 'Inbox LinkedIn' },
    { path: '/interviews', label: 'Entrevistas' },
  ];

  const settingsLinks = [
    { path: '/settings/profile', label: 'Perfil' },
    { path: '/settings/accounts', label: 'Cuentas conectadas' },
    { path: '/settings/calendar', label: 'Calendario' },
    { path: '/settings/notifications', label: 'Notificaciones' },
  ];

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="h-14 px-4 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link to="/" className="text-blue-600 font-semibold text-lg">
            AI Recruiter
          </Link>
          
          {showRecruitmentMenu && (
            <nav className="flex h-14">
              {recruitmentLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 h-full flex items-center border-b-2 text-sm font-medium transition-colors ${
                    location.pathname === link.path
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar..."
              className="w-64 pl-9 pr-4 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          
          <div className="relative">
            <button 
              onClick={() => setShowSettingsMenu(!showSettingsMenu)}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100"
            >
              <Settings size={18} />
            </button>
            
            {showSettingsMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                {settingsLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowSettingsMenu(false)}
                  >
                    {link.label}
                  </Link>
                ))}
                <hr className="my-1" />
                <button
                  onClick={handleSignOut}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                >
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
          
          <button className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 relative">
            <Bell size={18} />
            <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
          </button>
          
          {user && (
            <div className="relative">
              <button 
                className="flex items-center space-x-2 rounded-lg hover:bg-gray-100 px-2 py-1"
              >
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600">
                  <span className="text-sm font-medium">
                    {user.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-sm text-gray-700">{user.email}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

