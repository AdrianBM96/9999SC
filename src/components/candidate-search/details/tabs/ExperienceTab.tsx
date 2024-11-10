import React from 'react';
import { Briefcase, MapPin, Calendar } from 'lucide-react';
import { DetailedLinkedInProfile } from '../../../../types';

interface ExperienceTabProps {
  candidate: DetailedLinkedInProfile;
}

export function ExperienceTab({ candidate }: ExperienceTabProps) {
  return (
    <div className="space-y-8">
      <div className="bg-white shadow rounded-lg p-6">
        <h4 className="text-xl font-semibold mb-4 text-blue-600 border-b pb-2">Experiencia Profesional</h4>
        {candidate.work_experience && candidate.work_experience.length > 0 ? (
          <ul className="space-y-6">
            {candidate.work_experience.map((exp, index) => (
              <li key={index} className="border-l-2 border-blue-200 pl-4">
                <div className="flex items-start">
                  <Briefcase className="mr-2 text-blue-500 mt-1" size={18} />
                  <div className="flex-1">
                    <h5 className="font-semibold text-lg">{exp.position}</h5>
                    <p className="text-gray-600 font-medium">{exp.company}</p>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <Calendar className="w-4 h-4 mr-1" />
                      {exp.start} - {exp.end || 'Presente'}
                    </div>
                    {exp.location && (
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <MapPin className="w-4 h-4 mr-1" />
                        {exp.location}
                      </div>
                    )}
                    {exp.description && (
                      <p className="mt-2 text-gray-700 whitespace-pre-wrap">{exp.description}</p>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No hay experiencia registrada</p>
        )}
      </div>
    </div>
  );
}