import OpenAI from 'openai';
import { Candidature } from '../../types';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export async function generateJobDescription(candidature: Partial<Candidature>): Promise<string> {
  try {
    const prompt = `Genera una descripción de trabajo profesional para el puesto de ${candidature.title} en ${candidature.location}. 
    Tipo de trabajo: ${candidature.jobType}. 
    Tipo de contrato: ${candidature.contractType}. 
    Experiencia requerida: ${candidature.experience}. 
    Formación: ${candidature.education?.join(', ')}. 
    Idiomas: ${candidature.languages?.join(', ')}. 
    Habilidades: ${candidature.skills?.join(', ')}.
    La descripción debe ser detallada, atractiva y profesional, incluyendo responsabilidades, requisitos y beneficios.`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 500,
    });

    return response.choices[0].message.content || 'No se pudo generar la descripción del trabajo.';
  } catch (error) {
    console.error('Error al generar la descripción del trabajo:', error);
    return 'Error al generar la descripción del trabajo.';
  }
}

export async function generateSalaryRange(title: string, location: string): Promise<string> {
  try {
    const prompt = `Proporciona un rango salarial realista para el puesto de ${title} en ${location}. El formato debe ser "XXk - YYk", donde XX e YY son números enteros que representan miles de euros al año.`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 20,
    });

    const salaryRange = response.choices[0].message.content?.trim() || '30k - 50k';
    
    const regex = /(\d+)k\s*-\s*(\d+)k/;
    const match = salaryRange.match(regex);
    
    if (match) {
      const [, min, max] = match;
      return `${min}k - ${max}k`;
    } else {
      return '30k - 50k';
    }
  } catch (error) {
    console.error('Error al generar el rango salarial:', error);
    return '30k - 50k';
  }
}

export async function generateMarketDemand(title: string, location: string): Promise<'Alta' | 'Media' | 'Baja'> {
  try {
    const prompt = `Evalúa la demanda del mercado para el puesto de ${title} en ${location}. Responde solo con "Alta", "Media" o "Baja".`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 10,
    });

    const demand = response.choices[0].message.content?.trim().toLowerCase();
    if (demand === 'alta' || demand === 'media' || demand === 'baja') {
      return demand.charAt(0).toUpperCase() + demand.slice(1) as 'Alta' | 'Media' | 'Baja';
    }
    return 'Media';
  } catch (error) {
    console.error('Error al generar la demanda del mercado:', error);
    return 'Media';
  }
}