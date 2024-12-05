import { getOpenAIClient } from '../../lib/openai';

interface GeneratedQuestion {
  id: string;
  text: string;
  type: 'text' | 'rating' | 'multiple_choice';
  category: string;
  options?: string[];
}

export async function generateQuestionsFromJobDescription(
  jobDescription: string,
  department: string
): Promise<GeneratedQuestion[]> {
  try {
    const prompt = `Como reclutador experto, genera un conjunto de preguntas relevantes para evaluar candidatos para un puesto en el departamento de ${department}. 
    
Descripción del trabajo:
${jobDescription}

Genera preguntas divididas en las siguientes categorías:
1. Experiencia Técnica (enfocadas en habilidades específicas del puesto)
2. Habilidades Blandas (comunicación, trabajo en equipo, etc.)
3. Cultura y Valores (alineación con la empresa)
4. Motivación (interés en el puesto y la empresa)

Para cada pregunta, especifica:
- El texto de la pregunta
- El tipo de respuesta (text, rating, o multiple_choice)
- Opciones de respuesta (solo para multiple_choice)
- La categoría a la que pertenece

Las preguntas deben ser:
- Específicas para el rol y departamento
- Diseñadas para obtener respuestas detalladas y significativas
- Enfocadas en evaluar tanto competencias técnicas como habilidades blandas
- Formuladas de manera profesional y clara

Formato de respuesta requerido:
[
  {
    "text": "pregunta",
    "type": "tipo_de_respuesta",
    "category": "categoría",
    "options": ["opción1", "opción2"] // solo para multiple_choice
  }
]`;

    const openai = await getOpenAIClient();
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Eres un reclutador experto especializado en crear preguntas de evaluación efectivas para procesos de selección."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    const generatedQuestions = JSON.parse(response.choices[0].message.content || '[]');

    // Asignar IDs únicos a las preguntas generadas
    return generatedQuestions.questions.map((q: Omit<GeneratedQuestion, 'id'>) => ({
      ...q,
      id: Math.random().toString(36).substr(2, 9)
    }));

  } catch (error) {
    console.error('Error generating questions:', error);
    throw new Error('Error al generar preguntas con IA');
  }
}

// Función auxiliar para validar el formato de las preguntas generadas
function validateQuestions(questions: any[]): questions is GeneratedQuestion[] {
  return questions.every(q => 
    typeof q.text === 'string' &&
    ['text', 'rating', 'multiple_choice'].includes(q.type) &&
    typeof q.category === 'string' &&
    (q.type !== 'multiple_choice' || Array.isArray(q.options))
  );
}