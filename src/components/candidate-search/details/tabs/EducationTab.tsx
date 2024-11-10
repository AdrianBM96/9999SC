import React from 'react';
import { School, Award, Calendar, MapPin, Globe } from 'lucide-react';
import { DetailedLinkedInProfile } from '../../../../types';

interface EducationTabProps {
  candidate: DetailedLinkedInProfile;
}

const formatDate = (date: string | null | undefined): string => {
  if (!date) return 'Presente';
  // Convertir formato "MM/YYYY" a "MMMM YYYY"
  const [month, year] = date.split('/');
  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  return `${monthNames[parseInt(month) - 1]} ${year}`;
};

const translateProficiency = (proficiency: string): string => {
  const translations = {
    'native': 'Nativo',
    'fluent': 'Fluido',
    'professional': 'Profesional',
    'intermediate': 'Intermedio',
    'basic': 'Básico',
    'elementary': 'Elemental',
    'beginner': 'Principiante'
  };
  return translations[proficiency.toLowerCase()] || proficiency;
};

export function EducationTab({ candidate }: EducationTabProps) {
  return (
    <div className="space-y-8">
      {/* Educación Formal */}
      <div className="bg-white shadow rounded-lg p-6">
        <h4 className="text-xl font-semibold mb-4 text-blue-600 border-b pb-2">
          <div className="flex items-center">
            <School className="mr-2 text-blue-500" size={20} />
            Educación
          </div>
        </h4>
        {candidate.education && candidate.education.length > 0 ? (
          <ul className="space-y-6">
            {candidate.education.map((edu, index) => (
              <li key={index} className="border-l-2 border-blue-200 pl-4">
                <div className="flex items-start">
                  <div className="flex-1">
                    <h5 className="font-semibold text-lg">{edu.school}</h5>
                    {edu.degree && (
                      <p className="text-gray-700">{edu.degree}</p>
                    )}
                    {edu.field_of_study && (
                      <p className="text-gray-600">{edu.field_of_study}</p>
                    )}
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <Calendar className="w-4 h-4 mr-1" />
                      {formatDate(edu.start_date)} - {formatDate(edu.end_date)}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No hay información educativa disponible</p>
        )}
      </div>

      {/* Idiomas */}
      <div className="bg-white shadow rounded-lg p-6">
        <h4 className="text-xl font-semibold mb-4 text-blue-600 border-b pb-2">
          <div className="flex items-center">
            <Globe className="mr-2 text-blue-500" size={20} />
            Idiomas
          </div>
        </h4>
        {candidate.languages && candidate.languages.length > 0 ? (
          <ul className="space-y-4">
            {candidate.languages.map((lang, index) => (
              <li key={index} className="border-l-2 border-blue-200 pl-4">
                <div className="flex items-start">
                  <div className="flex-1">
                    <h5 className="font-semibold text-lg">
                      {typeof lang === 'string' ? lang : lang.name}
                    </h5>
                    {typeof lang !== 'string' && lang.proficiency && (
                      <p className="text-gray-600">Nivel: {translateProficiency(lang.proficiency)}</p>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No hay información de idiomas disponible</p>
        )}
      </div>

      {/* Certificaciones */}
      <div className="bg-white shadow rounded-lg p-6">
        <h4 className="text-xl font-semibold mb-4 text-blue-600 border-b pb-2">
          <div className="flex items-center">
            <Award className="mr-2 text-blue-500" size={20} />
            Certificaciones
          </div>
        </h4>
        {candidate.certifications && candidate.certifications.length > 0 ? (
          <ul className="space-y-6">
            {candidate.certifications.map((cert, index) => (
              <li key={index} className="border-l-2 border-blue-200 pl-4">
                <div className="flex items-start">
                  <div className="flex-1">
                    <h5 className="font-semibold text-lg">
                      {typeof cert === 'string' ? cert : cert.name}
                    </h5>
                    {typeof cert !== 'string' && (
                      <>
                        {cert.organization && (
                          <p className="text-gray-600">Expedido por: {cert.organization}</p>
                        )}
                        {cert.issue_date && (
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <Calendar className="w-4 h-4 mr-1" />
                            Expedido en: {formatDate(cert.issue_date)}
                          </div>
                        )}
                        {cert.url && (
                          <a 
                            href={cert.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-sm mt-2 inline-flex items-center"
                          >
                            Ver certificación
                            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No hay certificaciones disponibles</p>
        )}
      </div>
    </div>
  );
}