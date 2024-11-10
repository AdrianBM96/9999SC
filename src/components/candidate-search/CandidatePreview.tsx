import React from 'react';
import { DetailedLinkedInProfile } from '../../types';
import { 
  Briefcase, MapPin, Globe, Book, Award, Link, 
  Calendar, GraduationCap, Star, X, ExternalLink 
} from 'lucide-react';

interface CandidatePreviewProps {
  candidate: DetailedLinkedInProfile;
  onClose: () => void;
}

export function CandidatePreview({ candidate, onClose }: CandidatePreviewProps) {
  const getAdequacyColor = (percentage: number) => {
    if (percentage >= 70) return 'bg-green-100 text-green-800';
    if (percentage >= 50) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden h-full">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-4">
            <img
              src={candidate.profile_picture_url || 'https://via.placeholder.com/100'}
              alt={candidate.name}
              className="w-16 h-16 rounded-full"
            />
            <div>
              <h2 className="text-xl font-bold text-gray-900">{candidate.name}</h2>
              <p className="text-gray-600">{candidate.headline}</p>
              <div className="flex items-center mt-2">
                <MapPin className="w-4 h-4 text-gray-400 mr-1" />
                <span className="text-gray-600 text-sm">{candidate.location}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end space-y-2">
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
            {candidate.adequacyPercentage !== undefined && (
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getAdequacyColor(candidate.adequacyPercentage)}`}>
                {candidate.adequacyPercentage}% adecuación
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
        {candidate.summary && (
          <div className="space-y-2">
            <h4 className="text-lg font-semibold text-gray-900 flex items-center">
              <Book className="w-5 h-5 mr-2 text-gray-500" />
              Resumen
            </h4>
            <p className="text-gray-700">{candidate.summary}</p>
          </div>
        )}

        {candidate.work_experience && candidate.work_experience.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900 flex items-center">
              <Briefcase className="w-5 h-5 mr-2 text-gray-500" />
              Experiencia
            </h4>
            <div className="space-y-4">
              {candidate.work_experience.map((exp, index) => (
                <div key={index} className="border-l-2 border-gray-200 pl-4">
                  <h5 className="font-medium text-gray-900">{exp.position}</h5>
                  <p className="text-gray-600">{exp.company}</p>
                  <p className="text-sm text-gray-500">
                    {exp.start} - {exp.end || 'Presente'}
                  </p>
                  {exp.description && (
                    <p className="text-gray-700 mt-2">{exp.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {candidate.education && candidate.education.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900 flex items-center">
              <GraduationCap className="w-5 h-5 mr-2 text-gray-500" />
              Educación
            </h4>
            <div className="space-y-4">
              {candidate.education.map((edu, index) => (
                <div key={index} className="border-l-2 border-gray-200 pl-4">
                  <h5 className="font-medium text-gray-900">{edu.degree}</h5>
                  <p className="text-gray-600">{edu.school}</p>
                  {edu.start_date && (
                    <p className="text-sm text-gray-500">
                      {edu.start_date} - {edu.end_date || 'Presente'}
                    </p>
                  )}
                  {edu.field_of_study && (
                    <p className="text-gray-700">{edu.field_of_study}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {candidate.languages && candidate.languages.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900 flex items-center">
              <Globe className="w-5 h-5 mr-2 text-gray-500" />
              Idiomas
            </h4>
            <div className="flex flex-wrap gap-2">
              {candidate.languages.map((language, index) => (
                <span
                  key={`lang-${index}`}
                  className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                >
                  {typeof language === 'string' 
                    ? language 
                    : `${language.name}${language.proficiency ? ` (${language.proficiency})` : ''}`}
                </span>
              ))}
            </div>
          </div>
        )}

        {candidate.skills && candidate.skills.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900 flex items-center">
              <Star className="w-5 h-5 mr-2 text-gray-500" />
              Habilidades
            </h4>
            <div className="flex flex-wrap gap-2">
              {candidate.skills.map((skill, index) => (
                <span
                  key={`skill-${index}`}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {typeof skill === 'string' ? skill : skill.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {candidate.certifications && candidate.certifications.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900 flex items-center">
              <Award className="w-5 h-5 mr-2 text-gray-500" />
              Certificaciones
            </h4>
            <div className="space-y-2">
              {candidate.certifications.map((cert, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-gray-700">
                    {typeof cert === 'string' ? cert : cert.name}
                  </span>
                  {typeof cert !== 'string' && cert.url && (
                    <a
                      href={cert.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <ExternalLink size={16} />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {candidate.public_profile_url && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <a
              href={candidate.public_profile_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-blue-600 hover:text-blue-800"
            >
              <Link className="w-5 h-5 mr-2" />
              Ver perfil completo en LinkedIn
            </a>
          </div>
        )}
      </div>
    </div>
  );
}