import React from 'react';
import { DetailedLinkedInProfile } from '../../../../types';
import { Users, Linkedin, Target, UserPlus } from 'lucide-react';

interface SummaryTabProps {
  candidate: DetailedLinkedInProfile;
}

export function SummaryTab({ candidate }: SummaryTabProps) {
  return (
    <div className="space-y-8">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-start mb-6">
          <h4 className="text-xl font-semibold text-blue-600 border-b pb-2">Resumen del perfil</h4>
          {candidate.public_profile_url && (
            <a
              href={candidate.public_profile_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Linkedin className="w-4 h-4 mr-2" />
              LinkedIn
            </a>
          )}
        </div>

        {/* Adecuación */}
        {candidate.adequacyPercentage !== undefined && (
          <div className="mb-6 bg-blue-50 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <Target className="w-5 h-5 text-blue-500 mr-2" />
              <h5 className="font-semibold">Adecuación al puesto</h5>
            </div>
            <div className="flex items-center">
              <span className="text-3xl font-bold text-blue-600">
                {Math.round(candidate.adequacyPercentage)}%
              </span>
              <span className="ml-2 text-sm text-blue-500">de coincidencia</span>
            </div>
          </div>
        )}

        {/* Resumen */}
        {candidate.summary && (
          <div className="mb-6">
            <h5 className="font-semibold text-lg mb-2">Resumen</h5>
            <p className="text-gray-700">{candidate.summary}</p>
          </div>
        )}

        {/* Estadísticas */}
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <Users className="w-5 h-5 text-purple-500 mr-2" />
              <h5 className="font-semibold">Seguidores</h5>
            </div>
            <div className="flex items-baseline">
              <span className="text-3xl font-bold text-purple-600">
                {candidate.follower_count || 0}
              </span>
              <span className="ml-2 text-sm text-purple-500">seguidores</span>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <UserPlus className="w-5 h-5 text-green-500 mr-2" />
              <h5 className="font-semibold">Conexiones</h5>
            </div>
            <div className="flex items-baseline">
              <span className="text-3xl font-bold text-green-600">
                {candidate.connections_count || 0}
              </span>
              <span className="ml-2 text-sm text-green-500">conexiones</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}