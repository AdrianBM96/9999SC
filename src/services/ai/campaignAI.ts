import { Candidature, FormField } from '../../types';
import { getOpenAIClient } from '../../lib/openai';

export async function generateKillerQuestions(candidature: Candidature): Promise<FormField[]> {
  try {
    const prompt = `Genera una lista de preguntas relevantes para evaluar candidatos para el siguiente puesto:
    
    Título: ${candidature.title}
    Descripción: ${candidature.description}
    Experiencia requerida: ${candidature.experience}
    Habilidades requeridas: ${candidature.skills?.join(', ')}
    
    Las preguntas deben ayudar a evaluar:
    1. Experiencia técnica
    2. Habilidades blandas
    3. Motivación y alineación con el puesto
    4. Disponibilidad y expectativas
    
    Devuelve las preguntas en formato JSON con la siguiente estructura:
    [
      {
        "id": "string (unique)",
        "label": "string (pregunta)",
        "type": "text|textarea|select|radio|checkbox",
        "required": boolean,
        "options": ["string"] (solo para select, radio, checkbox)
      }
    ]`;

    const openai = await getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Eres un experto en reclutamiento técnico que genera preguntas efectivas para evaluar candidatos."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
    });

    const questions = JSON.parse(completion.choices[0].message.content || '[]');
    return questions;
  } catch (error) {
    console.error('Error generating questions:', error);
    throw error;
  }
}

export async function generateConnectionMessage(candidature: Candidature): Promise<string> {
  try {
    const prompt = `Genera un mensaje de conexión inicial para LinkedIn para el siguiente puesto:
    
    Título: ${candidature.title}
    Descripción: ${candidature.description}
    
    El mensaje debe:
    1. Ser profesional y personalizado
    2. Mencionar brevemente el puesto
    3. Incluir un call-to-action claro
    4. No exceder los 300 caracteres
    5. Incluir un link al formulario de aplicación (usa {FORM_URL} como placeholder)`;

    const openai = await getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Eres un experto en outreach profesional que genera mensajes efectivos y personalizados."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
    });

    return completion.choices[0].message.content || '';
  } catch (error) {
    console.error('Error generating connection message:', error);
    throw error;
  }
}

export async function generateReminderMessage(candidature: Candidature): Promise<string> {
  try {
    const prompt = `Genera un mensaje de seguimiento para LinkedIn para el siguiente puesto:
    
    Título: ${candidature.title}
    Descripción: ${candidature.description}
    
    El mensaje debe:
    1. Ser cordial y no intrusivo
    2. Recordar brevemente la oportunidad
    3. Animar a responder sin presionar
    4. No exceder los 200 caracteres`;

    const openai = await getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Eres un experto en seguimiento profesional que genera mensajes efectivos y respetuosos."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
    });

    return completion.choices[0].message.content || '';
  } catch (error) {
    console.error('Error generating reminder message:', error);
    throw error;
  }
}

export async function extractSearchKeywords(candidature: Candidature): Promise<string> {
  try {
    const prompt = `Basándote únicamente en el siguiente título de candidatura, genera una lista de palabras clave relevantes y específicas para buscar candidatos en LinkedIn. Incluye solo las palabras más importantes y relevantes del título. Separa las palabras clave con comas y limita la respuesta a un máximo de 5 palabras o frases clave:

    Título: ${candidature.title}`;

    const openai = await getOpenAIClient();
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 50,
      temperature: 0.5,
    });

    return response.choices[0].message.content || '';
  } catch (error) {
    console.error('Error al extraer palabras clave de búsqueda:', error);
    return '';
  }
}

export async function evaluateResponse(response: string, candidature: Candidature): Promise<{
  score: number;
  feedback: string;
}> {
  try {
    const prompt = `Evalúa la siguiente respuesta para el puesto:
    
    Título: ${candidature.title}
    Requisitos: ${candidature.description}
    
    Respuesta del candidato:
    ${response}
    
    Proporciona:
    1. Una puntuación de 0 a 100
    2. Un feedback constructivo
    
    Responde en formato JSON:
    {
      "score": number,
      "feedback": "string"
    }`;

    const openai = await getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Eres un experto en evaluación de candidatos que proporciona análisis objetivos y constructivos."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
    });

    return JSON.parse(completion.choices[0].message.content || '{"score": 0, "feedback": "Error en la evaluación"}');
  } catch (error) {
    console.error('Error evaluating response:', error);
    throw error;
  }
}

