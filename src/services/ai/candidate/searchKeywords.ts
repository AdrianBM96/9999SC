import { Candidature } from '../../../types';
import { getOpenAIClient } from './config';

export async function extractSearchKeywords(candidature: Candidature): Promise<string> {
  try {
    const prompt = `Basándote en el siguiente título y descripción de candidatura, genera una lista de palabras clave relevantes y específicas para buscar candidatos en LinkedIn. Incluye solo las palabras más importantes y relevantes. Separa las palabras clave con comas y limita la respuesta a un máximo de 5 palabras o frases clave:

    Título: ${candidature.title}
    Descripción: ${candidature.description}`;

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
