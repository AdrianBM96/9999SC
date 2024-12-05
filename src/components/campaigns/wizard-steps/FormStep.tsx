import React, { useState, useEffect } from 'react';
import { Info, Plus, Trash2, Loader2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'react-toastify';
import { getCandidature } from '../../../services/candidatureService';
import { generateQuestionsFromJobDescription } from '../../../services/ai/evaluationQuestions';

interface Question {
  id: string;
  category: string;
  text: string;
  type: 'text' | 'rating' | 'multiple_choice' | 'file';
  options?: string[];
  required?: boolean;
  aiGenerated?: boolean;
}

interface FormStepProps {
  questions: Question[];
  onQuestionsChange: (questions: Question[]) => void;
  onNext: () => void;
  onBack: () => void;
  candidatureId: string;
}

export function FormStep({ questions, onQuestionsChange, onNext, onBack, candidatureId }: FormStepProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('technical');

  const categories = [
    { id: 'technical', label: 'Experiencia Técnica' },
    { id: 'soft_skills', label: 'Habilidades Blandas' },
    { id: 'culture', label: 'Cultura y Valores' },
    { id: 'motivation', label: 'Motivación' },
    { id: 'documents', label: 'Documentos' },
  ];

  const generateQuestions = async () => {
    if (!candidatureId) return;
    
    setIsGenerating(true);
    try {
      const candidature = await getCandidature(candidatureId);
      if (!candidature?.description) {
        throw new Error('La descripción del puesto no está disponible');
      }

      const generatedQuestions = await generateQuestionsFromJobDescription(
        candidature.description,
        candidature.department?.name || ''
      );

      // Asegurarse de que la primera pregunta siempre sea el CV
      const cvQuestion = questions.find(q => q.category === 'documents');
      const filteredQuestions = cvQuestion ? questions.filter(q => q.id !== cvQuestion.id) : questions;

      // Combinar preguntas existentes con las generadas
      const updatedQuestions = [
        cvQuestion || {
          id: uuidv4(),
          category: 'documents',
          text: 'Por favor, adjunta tu CV actualizado',
          type: 'file',
          required: true
        },
        ...filteredQuestions,
        ...generatedQuestions.map(q => ({
          ...q,
          id: uuidv4(),
          aiGenerated: true
        }))
      ];

      onQuestionsChange(updatedQuestions);
      toast.success('Preguntas generadas exitosamente');
    } catch (error) {
      console.error('Error generating questions:', error);
      toast.error(error.message || 'Error al generar preguntas');
    } finally {
      setIsGenerating(false);
    }
  };

  const deleteQuestion = (questionId: string) => {
    onQuestionsChange(questions.filter(q => q.id !== questionId));
  };

  const addCustomQuestion = () => {
    const newQuestion: Question = {
      id: uuidv4(),
      category: selectedCategory,
      text: '',
      type: 'text',
      required: false,
      aiGenerated: false
    };
    onQuestionsChange([...questions, newQuestion]);
  };

  const updateQuestion = (questionId: string, updates: Partial<Question>) => {
    onQuestionsChange(
      questions.map(q => q.id === questionId ? { ...q, ...updates } : q)
    );
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {isGenerating && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-lg w-full">
            <div className="flex flex-col items-center mb-6">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Generando preguntas inteligentes
              </h3>
              <p className="text-sm text-gray-500 text-center">
                Nuestro sistema de IA está analizando la descripción del puesto y el contexto del departamento para crear preguntas relevantes y específicas.
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Proceso de generación:</h4>
                <ul className="text-sm text-blue-700 space-y-2">
                  <li>1. Análisis de requisitos técnicos</li>
                  <li>2. Identificación de habilidades clave</li>
                  <li>3. Evaluación de ajuste cultural</li>
                  <li>4. Generación de preguntas específicas</li>
                </ul>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">
                  Las preguntas generadas serán completamente editables y podrás personalizarlas según tus necesidades específicas.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start mb-4">
          <Info className="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-medium text-blue-900 mb-2">
              Formulario de Evaluación Inteligente
            </h3>
            <p className="text-sm text-blue-700">
              Crea un formulario personalizado para evaluar a los candidatos. Nuestro sistema de IA generará preguntas relevantes basadas en la descripción del puesto y el departamento.
            </p>
          </div>
        </div>
        
        <div className="mt-4 bg-white p-4 rounded-lg border border-blue-200">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Características:</h4>
          <ul className="text-sm text-gray-600 space-y-2">
            <li>• Generación automática de preguntas específicas para el puesto</li>
            <li>• Diferentes tipos de preguntas: texto, valoración y opción múltiple</li>
            <li>• Personalización completa de preguntas y opciones</li>
            <li>• Organización por categorías para una evaluación integral</li>
          </ul>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Categoría de preguntas
          </label>
          <div className="grid grid-cols-4 gap-4">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  selectedCategory === category.id
                    ? 'bg-blue-100 text-blue-700 border-blue-200'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                } border`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center">
          <button
            onClick={generateQuestions}
            disabled={isGenerating || !candidatureId}
            className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center ${
              isGenerating || !candidatureId
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Plus className="w-4 h-4 mr-2" />
            )}
            Generar preguntas con IA
          </button>

          <button
            onClick={addCustomQuestion}
            className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            Añadir pregunta personalizada
          </button>
        </div>

        <div className="space-y-4">
          {questions.map((question, index) => (
            <div
              key={question.id}
              className={`p-4 ${question.aiGenerated ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'} border rounded-lg`}
            >
              <div className="flex items-start">
                <div className="flex-1">
                  <div className="flex items-center mb-2 space-x-2">
                    <span className="text-sm font-medium text-gray-500">
                      {categories.find(c => c.id === question.category)?.label}
                    </span>
                    {question.required && (
                      <span className="px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded">
                        Requerido
                      </span>
                    )}
                    {question.aiGenerated && (
                      <span className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded">
                        IA
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <textarea
                      value={question.text}
                      onChange={(e) => updateQuestion(question.id, { text: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Escribe tu pregunta aquí..."
                      disabled={question.type === 'file'}
                    />

                    {question.type !== 'file' && (
                      <div className="flex items-center space-x-4">
                        <select
                          value={question.type}
                          onChange={(e) => updateQuestion(question.id, { 
                            type: e.target.value as Question['type'],
                            options: e.target.value === 'multiple_choice' ? [''] : undefined
                          })}
                          className="block w-40 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="text">Texto</option>
                          <option value="rating">Valoración</option>
                          <option value="multiple_choice">Opción Múltiple</option>
                        </select>

                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={question.required}
                            onChange={(e) => updateQuestion(question.id, { required: e.target.checked })}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-gray-600">Requerido</span>
                        </label>
                      </div>
                    )}

                    {question.type === 'multiple_choice' && question.options && (
                      <div className="space-y-2 pl-4">
                        {question.options.map((option, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => {
                                const newOptions = [...question.options!];
                                newOptions[index] = e.target.value;
                                updateQuestion(question.id, { options: newOptions });
                              }}
                              className="flex-1 px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder={`Opción ${index + 1}`}
                            />
                            {index === question.options.length - 1 && (
                              <button
                                onClick={() => updateQuestion(question.id, { 
                                  options: [...question.options!, ''] 
                                })}
                                className="p-1 text-blue-600 hover:text-blue-700"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                {!question.required && (
                  <button
                    onClick={() => deleteQuestion(question.id)}
                    className="p-1 text-gray-400 hover:text-red-600 ml-2"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between pt-6 border-t">
        <button
          onClick={onBack}
          className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          Volver
        </button>
        <button
          onClick={onNext}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
        >
          Continuar
        </button>
      </div>
    </div>
  );
}

