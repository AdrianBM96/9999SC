import React from 'react';
import { MapPin, Building, Briefcase, Clock, Euro, Calendar, GraduationCap, Languages, Wrench, Target } from 'lucide-react';
import { Candidature, Department } from '../../../../types';

interface GeneralTabProps {
  editedCandidature: Candidature;
  isEditing: boolean;
  departments: Department[];
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

export function GeneralTab({
  editedCandidature,
  isEditing,
  departments,
  handleInputChange
}: GeneralTabProps) {
  return (
    <div className="space-y-6 p-6">
      {/* Información básica */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-6">Información básica</h3>
        <div className="grid grid-cols-2 gap-x-8 gap-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Ubicación</label>
            {isEditing ? (
              <div className="flex items-center">
                <MapPin className="w-5 h-5 text-gray-400 absolute ml-3" />
                <input
                  type="text"
                  name="location"
                  value={editedCandidature.location}
                  onChange={handleInputChange}
                  className="pl-10 w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>
            ) : (
              <div className="flex items-center p-2 bg-gray-50 rounded-md">
                <MapPin className="w-5 h-5 text-gray-400 mr-2" />
                <span className="text-gray-900">{editedCandidature.location}</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Departamento</label>
            {isEditing ? (
              <div className="flex items-center">
                <Building className="w-5 h-5 text-gray-400 absolute ml-3" />
                <select
                  name="department"
                  value={editedCandidature.department}
                  onChange={handleInputChange}
                  className="pl-10 w-full border border-gray-300 rounded-md shadow-sm p-2"
                >
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="flex items-center p-2 bg-gray-50 rounded-md">
                <Building className="w-5 h-5 text-gray-400 mr-2" />
                <span className="text-gray-900">{departments.find(d => d.id === editedCandidature.department)?.name}</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Tipo de trabajo</label>
            {isEditing ? (
              <div className="flex items-center">
                <Briefcase className="w-5 h-5 text-gray-400 absolute ml-3" />
                <select
                  name="jobType"
                  value={editedCandidature.jobType}
                  onChange={handleInputChange}
                  className="pl-10 w-full border border-gray-300 rounded-md shadow-sm p-2"
                >
                  <option value="Presencial">Presencial</option>
                  <option value="Remoto">Remoto</option>
                  <option value="Híbrido">Híbrido</option>
                </select>
              </div>
            ) : (
              <div className="flex items-center p-2 bg-gray-50 rounded-md">
                <Briefcase className="w-5 h-5 text-gray-400 mr-2" />
                <span className="text-gray-900">{editedCandidature.jobType}</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Tipo de contrato</label>
            {isEditing ? (
              <div className="flex items-center">
                <Calendar className="w-5 h-5 text-gray-400 absolute ml-3" />
                <select
                  name="contractType"
                  value={editedCandidature.contractType}
                  onChange={handleInputChange}
                  className="pl-10 w-full border border-gray-300 rounded-md shadow-sm p-2"
                >
                  <option value="Indefinido">Indefinido</option>
                  <option value="Temporal">Temporal</option>
                  <option value="Prácticas">Prácticas</option>
                </select>
              </div>
            ) : (
              <div className="flex items-center p-2 bg-gray-50 rounded-md">
                <Calendar className="w-5 h-5 text-gray-400 mr-2" />
                <span className="text-gray-900">{editedCandidature.contractType}</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Experiencia requerida</label>
            {isEditing ? (
              <div className="flex items-center">
                <Clock className="w-5 h-5 text-gray-400 absolute ml-3" />
                <input
                  type="text"
                  name="experience"
                  value={editedCandidature.experience}
                  onChange={handleInputChange}
                  className="pl-10 w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>
            ) : (
              <div className="flex items-center p-2 bg-gray-50 rounded-md">
                <Clock className="w-5 h-5 text-gray-400 mr-2" />
                <span className="text-gray-900">{editedCandidature.experience}</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Rango salarial</label>
            <div className="flex items-center p-2 bg-gray-50 rounded-md">
              <Euro className="w-5 h-5 text-gray-400 mr-2" />
              <span className="text-gray-900">{editedCandidature.salaryRange}</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Demanda del mercado</label>
            <div className="flex items-center p-2 bg-gray-50 rounded-md">
              <Target className="w-5 h-5 text-gray-400 mr-2" />
              <span className={`text-gray-900 ${
                editedCandidature.marketDemand === 'Alta' ? 'text-green-600' :
                editedCandidature.marketDemand === 'Media' ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {editedCandidature.marketDemand}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Requisitos */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-6">Requisitos</h3>
        <div className="grid grid-cols-3 gap-6">
          <div>
            <div className="flex items-center mb-4">
              <GraduationCap className="w-5 h-5 text-blue-500 mr-2" />
              <h4 className="font-medium">Formación</h4>
            </div>
            {editedCandidature.education?.length > 0 ? (
              <ul className="space-y-2">
                {editedCandidature.education.map((edu, index) => (
                  <li key={index} className="flex items-center">
                    <span className="text-sm">{edu}</span>
                    {isEditing && (
                      <button className="ml-2 text-red-500 hover:text-red-700">
                        <X size={16} />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">-</p>
            )}
          </div>

          <div>
            <div className="flex items-center mb-4">
              <Languages className="w-5 h-5 text-green-500 mr-2" />
              <h4 className="font-medium">Idiomas</h4>
            </div>
            {editedCandidature.languages?.length > 0 ? (
              <ul className="space-y-2">
                {editedCandidature.languages.map((lang, index) => (
                  <li key={index} className="flex items-center">
                    <span className="text-sm">{lang}</span>
                    {isEditing && (
                      <button className="ml-2 text-red-500 hover:text-red-700">
                        <X size={16} />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">-</p>
            )}
          </div>

          <div>
            <div className="flex items-center mb-4">
              <Wrench className="w-5 h-5 text-purple-500 mr-2" />
              <h4 className="font-medium">Habilidades</h4>
            </div>
            {editedCandidature.skills?.length > 0 ? (
              <ul className="space-y-2">
                {editedCandidature.skills.map((skill, index) => (
                  <li key={index} className="flex items-center">
                    <span className="text-sm">{skill}</span>
                    {isEditing && (
                      <button className="ml-2 text-red-500 hover:text-red-700">
                        <X size={16} />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">-</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}