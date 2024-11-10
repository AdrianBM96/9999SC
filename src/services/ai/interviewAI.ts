import OpenAI from 'openai';
import { DetailedLinkedInProfile, Candidature } from '../../types';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export async function generateInterviewQuestions(candidate: DetailedLinkedInProfile, candidature: Candidature): Promise<string[]> {
  try {
    const prompt = `Genera 5-7 preguntas específicas y relevantes para una entrevista, basadas en el siguiente perfil de candidato y la candidatura:

    Candidato:
    Nombre: ${candidate.name}
    Título: ${candidate.headline}
    Experiencia: ${candidate.experience?.map(exp => `${exp.title} en ${exp.company}`).join(', ')}
    Habilidades: ${candidate.skills?.join(', ')}

    Candidatura:
    Título: ${candidature.title}
    Descripción: ${candidature.description}
    Habilidades requeridas: ${candidature.skills?.join(', ')}
    Experiencia requerida: ${candidature.experience}

    Las preguntas deben:
    1. Evaluar la experiencia técnica
    2. Verificar habilidades blandas
    3. Explorar la alineación con el puesto
    4. Ser específicas al contexto del candidato
    5. Incluir preguntas situacionales`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 500,
      temperature: 0.7,
    });

    const questions = response.choices[0].message.content?.split('\n').filter(q => q.trim()) || [];
    return questions;
  } catch (error) {
    console.error('Error generating interview questions:', error);
    throw error;
  }
}

export async function generateInterviewFeedback(
  candidate: DetailedLinkedInProfile,
  candidature: Candidature,
  interviewNotes: string
): Promise<string> {
  try {
    const prompt = `Genera un feedback detallado y constructivo para la entrevista, basado en la siguiente información:

    Candidato:
    Nombre: ${candidate.name}
    Título: ${candidate.headline}
    Experiencia: ${candidate.experience?.map(exp => `${exp.title} en ${exp.company}`).join(', ')}
    Habilidades: ${candidate.skills?.join(', ')}

    Candidatura:
    Título: ${candidature.title}
    Descripción: ${candidature.description}
    Habilidades requeridas: ${candidature.skills?.join(', ')}
    Experiencia requerida: ${candidature.experience}

    Notas de la entrevista:
    ${interviewNotes}

    El feedback debe incluir:
    1. Fortalezas del candidato
    2. Áreas de mejora
    3. Alineación con el puesto
    4. Recomendaciones específicas
    5. Conclusión general`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1000,
      temperature: 0.7,
    });

    return response.choices[0].message.content || 'No se pudo generar el feedback';
  } catch (error) {
    console.error('Error generating interview feedback:', error);
    throw error;
  }
}