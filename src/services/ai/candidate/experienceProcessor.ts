import { openai } from './config';

export async function processExperienceWithAI(experienceText: string): Promise<any[]> {
  try {
    const prompt = `Analiza el siguiente texto que contiene información sobre experiencia laboral y extrae la información en formato JSON.
    Cada experiencia debe tener los siguientes campos:
    - title (título del puesto)
    - company (nombre de la empresa)
    - start_date (fecha de inicio en formato MM/YYYY)
    - end_date (fecha de fin en formato MM/YYYY, o null si es el trabajo actual)
    - description (descripción de responsabilidades)
    - location (ubicación del trabajo)

    Texto:
    ${experienceText}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Eres un experto en procesamiento de información laboral. Extrae y estructura la información de experiencia laboral en formato JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 1000,
    });

    if (!response.choices[0].message.content) {
      return [];
    }

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error('Error al procesar la experiencia:', error);
    return [];
  }
}
