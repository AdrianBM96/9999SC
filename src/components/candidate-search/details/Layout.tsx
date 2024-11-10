import React from 'react';
import { X, RefreshCw, MapPin, Linkedin, User, MessageCircle, Briefcase, School, Cpu, FileText } from 'lucide-react';
import { DetailedLinkedInProfile } from '../../../types';

interface LayoutProps {
  candidate: DetailedLinkedInProfile;
  isUpdatingProfile: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onClose: () => void;
  onUpdateProfile: (candidate: DetailedLinkedInProfile) => void;
  children: React.ReactNode;
}

export function Layout({
  candidate,
  isUpdatingProfile,
  activeTab,
  setActiveTab,
  onClose,
  onUpdateProfile,
  children
}: LayoutProps) {
  const tabs = [
    { id: 'summary', label: 'Resumen', icon: User },
    { id: 'contact', label: 'Contacto', icon: MessageCircle },
    { id: 'experience', label: 'Experiencia', icon: Briefcase },
    { id: 'education', label: 'Educación', icon: School },
    { id: 'aiEvaluation', label: 'Evaluación IA', icon: Cpu },
    { id: 'candidatures', label: 'Candidaturas', icon: FileText },
    { id: 'curriculum', label: 'Currículum', icon: FileText },
  ];

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex">
        <div className="w-3/4 overflow-y-auto p-6">
          <div className="sticky top-0 bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-6 rounded-t-lg z-10">
            <div className="flex justify-between items-center">
              <div className="flex-1">
                <h2 className="text-3xl font-bold">{candidate.name}</h2>
                <p className="text-xl mt-1 text-blue-100">{candidate.headline}</p>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => onUpdateProfile(candidate)}
                  disabled={isUpdatingProfile}
                  className="bg-white text-blue-700 hover:bg-blue-100 px-4 py-2 rounded-full transition duration-300 flex items-center"
                >
                  {isUpdatingProfile ? (
                    <>
                      <RefreshCw className="animate-spin mr-2" size={16} />
                      Actualizando...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2" size={16} />
                      Actualizar perfil
                    </>
                  )}
                </button>
                <button onClick={onClose} className="text-white hover:text-blue-200 transition duration-300">
                  <X size={24} />
                </button>
              </div>
            </div>
          </div>
          <div className="mt-6">
            <div className="flex items-center space-x-4 mb-6">
              <img
                src={candidate.profile_picture_url || 'https://via.placeholder.com/100'}
                alt={candidate.name}
                className="w-24 h-24 rounded-full border-4 border-white shadow-lg"
              />
              <div className="flex-grow">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="flex items-center text-gray-600 mb-2">
                      <MapPin size={16} className="mr-1" />
                      {candidate.location}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4">
                    {candidate.public_profile_url && (
                      <a
                        href={candidate.public_profile_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-blue-600 hover:text-blue-800"
                      >
                        <Linkedin size={20} className="mr-1" />
                        Ver en LinkedIn
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
            {children}
          </div>
        </div>
        <div className="w-1/4 bg-gray-100 p-6 overflow-y-auto">
          <h3 className="text-xl font-bold mb-4 text-gray-800">Menú</h3>
          <nav>
            <ul className="space-y-2">
              {tabs.map((tab) => (
                <li key={tab.id}>
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full text-left py-2 px-4 rounded ${activeTab === tab.id ? 'bg-blue-500 text-white' : 'hover:bg-gray-200'}`}
                  >
                    <tab.icon className="inline-block mr-2" size={18} />
                    {tab.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
}