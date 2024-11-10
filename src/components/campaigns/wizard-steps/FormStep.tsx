import React, { useState } from 'react';
import { Info, Plus, Trash2, Loader2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface Question {
  id: string;
  category: string;
  text: string;
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
  const [selectedCategory, setSelectedCategory] = useState('soft_skills');

  const categories = [
    { id: 'soft_skills', label: 'Soft Skills' },
    { id: 'hard_skills', label: 'Hard Skills' },
    { id: 'behavioral', label: 'Comportamiento' },
    { id: 'experience', label: 'Experiencia' },
  ];

  const generateQuestions = async () => {
    if (!candidatureId) return;
    
    setIsGenerating(true);
    try {
      // Call AI service to generate questions based on job description
      const response = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          candidatureId,
          category: selectedCategory,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate questions');
      }

      const generatedQuestions = await response.json();
      // Add UUID to each generated question
      const questionsWithIds = generatedQuestions.map((q: Omit<Question, 'id'>) => ({
        ...q,
        id: uuidv4()
      }));
      onQuestionsChange([...questions, ...questionsWithIds]);
    } catch (error) {
      console.error('Error generating questions:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const deleteQuestion = (questionId: string) => {
    onQuestionsChange(questions.filter(q => q.id !== questionId));
  };

  const addCustomQuestion = () => {
    const newQuestion = {
      id: uuidv4(),
      category: selectedCategory,
      text: '',
    };
    onQuestionsChange([...questions, newQuestion]);
  };

  const updateQuestion = (questionId: string, text: string) => {
    onQuestionsChange(
      questions.map(q => q.id === questionId ? { ...q, text } : q)
    );
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {isGenerating && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl flex flex-col items-center">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Generando preguntas...
            </h3>
            <p className="text-sm text-gray-500">
              Estamos analizando la descripción del puesto para crear preguntas relevantes
            </p>
          </div>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start">
        <Info className="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
        <div className="text-sm text-blue-700">
          <p className="font-medium mb-1">Formulario de evaluación</p>
          <p>
            Configura las preguntas que se incluirán en el formulario de evaluación.
            Las preguntas se generarán automáticamente basándose en la descripción del puesto.
          </p>
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
              className="flex items-start space-x-4 p-4 bg-white border border-gray-200 rounded-lg"
            >
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <span className="text-sm font-medium text-gray-500 mr-2">
                    {categories.find(c => c.id === question.category)?.label}
                  </span>
                  {index === 0 && (
                    <span className="px-2 py-1 text-xs font-medium text-blue-700 bg-blue-50 rounded">
                      CV Requerido
                    </span>
                  )}
                </div>
                <textarea
                  value={question.text}
                  onChange={(e) => updateQuestion(question.id, e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={index === 0 ? "Por favor, adjunta tu CV actualizado" : "Escribe tu pregunta aquí..."}
                  disabled={index === 0}
                />
              </div>
              {index !== 0 && (
                <button
                  onClick={() => deleteQuestion(question.id)}
                  className="p-1 text-gray-400 hover:text-red-600"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
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

