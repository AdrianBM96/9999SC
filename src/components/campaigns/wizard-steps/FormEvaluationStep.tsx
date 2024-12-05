import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Loader2, Save, Plus, Trash2 } from 'lucide-react';
import { generateQuestionsFromJobDescription } from '../../../services/ai/evaluationQuestions';

interface Question {
  id: string;
  text: string;
  type: 'text' | 'rating' | 'multiple_choice';
  options?: string[];
  category: string;
  aiGenerated?: boolean;
}

interface FormEvaluationStepProps {
  jobDescription: string;
  department: string;
  questions: Question[];
  onQuestionsChange: (questions: Question[]) => void;
}

export function FormEvaluationStep({ 
  jobDescription, 
  department,
  questions, 
  onQuestionsChange 
}: FormEvaluationStepProps) {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<string[]>([
    'Experiencia Técnica',
    'Habilidades Blandas',
    'Cultura y Valores',
    'Motivación'
  ]);

  const generateAIQuestions = async () => {
    try {
      setLoading(true);
      const generatedQuestions = await generateQuestionsFromJobDescription(jobDescription, department);
      
      // Combinar preguntas existentes con las generadas por IA
      const updatedQuestions = [
        ...questions.filter(q => !q.aiGenerated), // Mantener preguntas manuales
        ...generatedQuestions.map(q => ({...q, aiGenerated: true}))
      ];
      
      onQuestionsChange(updatedQuestions);
      toast.success('Preguntas generadas exitosamente');
    } catch (error) {
      console.error('Error generating questions:', error);
      toast.error('Error al generar preguntas');
    } finally {
      setLoading(false);
    }
  };

  const addCustomQuestion = (category: string) => {
    const newQuestion: Question = {
      id: Math.random().toString(36).substr(2, 9),
      text: '',
      type: 'text',
      category,
      aiGenerated: false
    };
    onQuestionsChange([...questions, newQuestion]);
  };

  const removeQuestion = (questionId: string) => {
    onQuestionsChange(questions.filter(q => q.id !== questionId));
  };

  const updateQuestion = (questionId: string, updates: Partial<Question>) => {
    onQuestionsChange(
      questions.map(q => q.id === questionId ? { ...q, ...updates } : q)
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-medium text-gray-900">
            Formulario de Evaluación
          </h2>
          <button
            onClick={generateAIQuestions}
            disabled={loading || !jobDescription}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Generar Preguntas con IA
          </button>
        </div>

        {categories.map(category => (
          <div key={category} className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-md font-medium text-gray-900">{category}</h3>
              <button
                onClick={() => addCustomQuestion(category)}
                className="inline-flex items-center px-2 py-1 text-sm text-blue-600 hover:text-blue-700"
              >
                <Plus className="w-4 h-4 mr-1" />
                Añadir Pregunta
              </button>
            </div>

            <div className="space-y-4">
              {questions
                .filter(q => q.category === category)
                .map(question => (
                  <div
                    key={question.id}
                    className={`p-4 rounded-lg border ${
                      question.aiGenerated ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex items-start">
                      <div className="flex-grow">
                        <textarea
                          value={question.text}
                          onChange={(e) => updateQuestion(question.id, { text: e.target.value })}
                          className="w-full p-2 border border-gray-300 rounded-md"
                          rows={2}
                          placeholder="Escribe la pregunta..."
                        />
                        <div className="mt-2 flex items-center space-x-4">
                          <select
                            value={question.type}
                            onChange={(e) => updateQuestion(question.id, { 
                              type: e.target.value as Question['type'],
                              options: e.target.value === 'multiple_choice' ? [''] : undefined
                            })}
                            className="mt-1 block w-40 py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          >
                            <option value="text">Texto</option>
                            <option value="rating">Valoración</option>
                            <option value="multiple_choice">Opción Múltiple</option>
                          </select>

                          {question.type === 'multiple_choice' && (
                            <div className="flex-grow">
                              {question.options?.map((option, index) => (
                                <div key={index} className="flex items-center mt-2">
                                  <input
                                    type="text"
                                    value={option}
                                    onChange={(e) => {
                                      const newOptions = [...(question.options || [])];
                                      newOptions[index] = e.target.value;
                                      updateQuestion(question.id, { options: newOptions });
                                    }}
                                    className="flex-grow p-2 border border-gray-300 rounded-md"
                                    placeholder={`Opción ${index + 1}`}
                                  />
                                  {index === (question.options?.length || 0) - 1 && (
                                    <button
                                      onClick={() => updateQuestion(question.id, { 
                                        options: [...(question.options || []), ''] 
                                      })}
                                      className="ml-2 text-blue-600 hover:text-blue-700"
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
                      {!question.aiGenerated && (
                        <button
                          onClick={() => removeQuestion(question.id)}
                          className="ml-2 text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}