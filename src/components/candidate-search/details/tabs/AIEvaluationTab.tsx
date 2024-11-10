import React, { useState } from 'react';
import { 
  RefreshCw, 
  Target, 
  Star, 
  AlertTriangle, 
  Briefcase, 
  GraduationCap, 
  Languages,
  ThumbsUp,
  ThumbsDown,
  TrendingUp,
  Award
} from 'lucide-react';
import { DetailedLinkedInProfile, Candidature } from '../../../../types';
import { generateAIEvaluation } from '../../../../services/ai';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../../firebase';
import { toast } from 'react-toastify';

interface AIEvaluationTabProps {
  candidate: DetailedLinkedInProfile;
  candidatures: Candidature[];
  selectedCandidature: string;
  onUpdateEvaluation: (evaluation: string) => void;
}

export function AIEvaluationTab({
  candidate,
  candidatures,
  selectedCandidature,
  onUpdateEvaluation
}: AIEvaluationTabProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateEvaluation = async () => {
    const candidature = candidatures.find(c => c.id === selectedCandidature);
    if (!candidature) {
      toast.error('Por favor, seleccione una candidatura');
      return;
    }

    setIsGenerating(true);
    try {
      const evaluation = await generateAIEvaluation(candidate, candidature);
      
      // Actualizar en Firestore
      if (candidate.docId) {
        await updateDoc(doc(db, 'savedCandidates', candidate.docId), {
          aiEvaluation: evaluation
        });
      }

      onUpdateEvaluation(evaluation);
      toast.success('Evaluación generada con éxito');
    } catch (error) {
      console.error('Error generating evaluation:', error);
      toast.error('Error al generar la evaluación');
    } finally {
      setIsGenerating(false);
    }
  };

  const getAdequacyColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-50 text-green-700 border-green-200';
    if (percentage >= 60) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (percentage >= 40) return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    return 'bg-red-50 text-red-700 border-red-200';
  };

  return (
    <div className="space-y-8">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h4 className="text-xl font-semibold text-blue-600 border-b pb-2">Evaluación de IA</h4>
          <button
            onClick={handleGenerateEvaluation}
            disabled={isGenerating || !selectedCandidature}
            className="bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600 disabled:opacity-50 flex items-center"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="animate-spin mr-2" size={18} />
                Generando...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2" size={18} />
                Actualizar evaluación
              </>
            )}
          </button>
        </div>

        <div className="space-y-6">
          {/* Indicadores principales */}
          <div className="grid grid-cols-3 gap-6">
            <div className={`rounded-lg p-4 border ${getAdequacyColor(candidate.adequacyPercentage || 0)}`}>
              <div className="flex items-center mb-2">
                <Target className="w-5 h-5 mr-2" />
                <h5 className="font-semibold">Adecuación al puesto</h5>
              </div>
              <p className="text-3xl font-bold">
                {Math.round(candidate.adequacyPercentage || 0)}%
              </p>
              <p className="text-sm mt-1">Coincidencia con requisitos</p>
            </div>

            <div className="bg-emerald-50 text-emerald-700 rounded-lg p-4 border border-emerald-200">
              <div className="flex items-center mb-2">
                <ThumbsUp className="w-5 h-5 mr-2" />
                <h5 className="font-semibold">Puntos fuertes</h5>
              </div>
              <ul className="text-sm space-y-1">
                {candidate.skills?.slice(0, 3).map((skill, index) => (
                  <li key={index} className="flex items-center">
                    <Star className="w-4 h-4 mr-1" />
                    {typeof skill === 'string' ? skill : skill.name}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-amber-50 text-amber-700 rounded-lg p-4 border border-amber-200">
              <div className="flex items-center mb-2">
                <TrendingUp className="w-5 h-5 mr-2" />
                <h5 className="font-semibold">Potencial</h5>
              </div>
              <div className="flex items-center">
                <Award className="w-4 h-4 mr-1" />
                <span>{candidate.certifications?.length || 0} certificaciones</span>
              </div>
              <div className="flex items-center mt-1">
                <Briefcase className="w-4 h-4 mr-1" />
                <span>{candidate.work_experience?.length || 0} experiencias</span>
              </div>
            </div>
          </div>

          {/* Evaluación detallada */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <ThumbsUp className="w-5 h-5 text-green-500 mr-2" />
                <h5 className="font-semibold">Aspectos Positivos</h5>
              </div>
              <ul className="space-y-2">
                <li className="flex items-center text-green-700">
                  <Star className="w-4 h-4 mr-2" />
                  Experiencia relevante en el sector
                </li>
                <li className="flex items-center text-green-700">
                  <Star className="w-4 h-4 mr-2" />
                  Habilidades técnicas alineadas
                </li>
                <li className="flex items-center text-green-700">
                  <Star className="w-4 h-4 mr-2" />
                  Formación adecuada
                </li>
              </ul>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <ThumbsDown className="w-5 h-5 text-red-500 mr-2" />
                <h5 className="font-semibold">Áreas de Mejora</h5>
              </div>
              <ul className="space-y-2">
                <li className="flex items-center text-red-700">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Experiencia en tecnologías específicas
                </li>
                <li className="flex items-center text-red-700">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Certificaciones adicionales recomendadas
                </li>
              </ul>
            </div>
          </div>

          {/* Resumen de cualificaciones */}
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Briefcase className="w-5 h-5 text-blue-500 mr-2" />
                <h5 className="font-semibold">Experiencia</h5>
              </div>
              <ul className="text-sm space-y-1">
                {candidate.work_experience?.slice(0, 3).map((exp, index) => (
                  <li key={index} className="text-blue-700">
                    {exp.position} en {exp.company}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <GraduationCap className="w-5 h-5 text-purple-500 mr-2" />
                <h5 className="font-semibold">Formación</h5>
              </div>
              <ul className="text-sm space-y-1">
                {candidate.education?.slice(0, 2).map((edu, index) => (
                  <li key={index} className="text-purple-700">
                    {edu.degree} - {edu.school}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Languages className="w-5 h-5 text-green-500 mr-2" />
                <h5 className="font-semibold">Idiomas</h5>
              </div>
              <ul className="text-sm space-y-1">
                {candidate.languages?.map((lang, index) => (
                  <li key={index} className="text-green-700">
                    {typeof lang === 'string' ? lang : `${lang.name} (${lang.proficiency})`}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Evaluación detallada en texto */}
          <div className="mt-6">
            <h5 className="font-semibold mb-3 flex items-center">
              <Award className="w-5 h-5 text-gray-500 mr-2" />
              Evaluación Profesional
            </h5>
            {candidate.aiEvaluation ? (
              <div className="prose max-w-none bg-gray-50 p-4 rounded-lg">
                <p className="whitespace-pre-wrap">{candidate.aiEvaluation}</p>
              </div>
            ) : (
              <div className="bg-yellow-50 text-yellow-700 p-4 rounded-lg flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2" />
                <p>
                  No hay una evaluación detallada disponible. Haz clic en "Actualizar evaluación" para generar un análisis completo del perfil.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}