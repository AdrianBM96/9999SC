import { DetailedLinkedInProfile, Candidature } from '../types';
import axios from 'axios';
import * as pdfjsLib from 'pdfjs-dist';
import { getOpenAIClient } from '../lib/openai';

export async function extractCVInformation(cvUrl: string): Promise<Partial<DetailedLinkedInProfile>> {
  try {
    // Configurar axios para manejar CORS
    const response = await axios({
      method: 'get',
      url: cvUrl,
      responseType: 'arraybuffer',
      headers: {
        'Content-Type': 'application/pdf',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
      withCredentials: false,
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });

    // Convertir el ArrayBuffer a Uint8Array
    const data = new Uint8Array(response.data);

    // Cargar el PDF usando pdf.js
    const loadingTask = pdfjsLib.getDocument({ data });
    const pdf = await loadingTask.promise;

    // Extraer texto de todas las páginas
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n';
    }

    if (!fullText.trim()) {
      throw new Error('No se pudo extraer texto del PDF. El archivo podría estar protegido o ser una imagen.');
    }

    // Usar GPT-4 para extraer información estructurada
    const prompt = `Analiza el siguiente texto extraído de un CV y extrae la información relevante en formato JSON.
    Si un campo no está presente en el CV, usa un string vacío o array vacío según corresponda.
    Asegúrate de que la estructura sea exactamente como se especifica:

    {
      "name": "",
      "email": "",
      "phone": "",
      "location": "",
      "headline": "",
      "summary": "",
      "experience": [
        {
          "title": "",
          "company": "",
          "start_date": "",
          "end_date": "",
          "description": "",
          "location": ""
        }
      ],
      "education": [
        {
          "school": "",
          "degree": "",
          "field_of_study": "",
          "start_date": "",
          "end_date": ""
        }
      ],
      "skills": [],
      "languages": [],
      "certifications": []
    }

    Texto del CV:
    ${fullText}

    Instrucciones adicionales:
    1. Extrae SOLO la información que aparezca explícitamente en el texto
    2. Para campos no encontrados, usa string vacío o array vacío según corresponda
    3. Asegúrate de que el email y el nombre sean extraídos correctamente
    4. Normaliza las fechas al formato YYYY-MM cuando sea posible
    5. Si no hay una fecha final en una experiencia, usa "Presente"`;

    const openai = await getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Eres un experto en análisis de CVs. Tu tarea es extraer información precisa y estructurada de los CVs, asegurándote de que los campos críticos como nombre y email sean identificados correctamente."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 2000,
    });

    const extractedInfo = JSON.parse(completion.choices[0].message.content || '{}');

    // Validar información crítica
    if (!extractedInfo.name || !extractedInfo.email) {
      throw new Error('No se pudo extraer la información básica del CV (nombre o email)');
    }

    // Asegurar que todos los campos requeridos existan
    const defaultProfile: Partial<DetailedLinkedInProfile> = {
      name: '',
      email: '',
      phone: '',
      location: '',
      headline: '',
      summary: '',
      experience: [],
      education: [],
      skills: [],
      languages: [],
      certifications: [],
    };

    // Combinar la información extraída con los valores por defecto
    const mergedProfile = {
      ...defaultProfile,
      ...extractedInfo,
      // Asegurar que los arrays existan incluso si vienen como null
      experience: extractedInfo.experience || [],
      education: extractedInfo.education || [],
      skills: extractedInfo.skills || [],
      languages: extractedInfo.languages || [],
      certifications: extractedInfo.certifications || [],
    };

    return mergedProfile;
  } catch (error) {
    console.error('Error detallado al extraer información del CV:', error);
    if (error instanceof Error) {
      throw new Error(`Error al procesar el CV: ${error.message}`);
    }
    throw new Error('Error al procesar el CV. Por favor, verifica que el archivo sea válido y accesible.');
  }
}

export async function generateAIEvaluation(profile: DetailedLinkedInProfile, candidature: Candidature): Promise<string> {
  try {
    const prompt = `Realiza una evaluación detallada del siguiente perfil de LinkedIn para la candidatura dada. 
    Proporciona un análisis de las fortalezas y debilidades del candidato en relación con los requisitos del puesto, 
    y sugiere áreas de mejora si las hay. La evaluación debe ser objetiva, profesional y constructiva.

    Perfil de LinkedIn:
    Nombre: ${profile.name}
    Título: ${profile.headline}
    Experiencia: ${profile.experience?.map(exp => `${exp.title} en ${exp.company}`).join(', ')}
    Educación: ${profile.education?.map(edu => `${edu.degree} en ${edu.field_of_study} de ${edu.school}`).join(', ')}
    Habilidades: ${profile.skills?.join(', ')}

    Candidatura:
    Título: ${candidature.title}
    Descripción: ${candidature.description}
    Experiencia requerida: ${candidature.experience}
    Formación requerida: ${candidature.education?.join(', ')}
    Habilidades requeridas: ${candidature.skills?.join(', ')}`;

    const openai = await getOpenAIClient();
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1000,
      temperature: 0.7,
    });

    return response.choices[0].message.content || 'No se pudo generar la evaluación de IA.';
  } catch (error) {
    console.error('Error al generar la evaluación de IA:', error);
    throw error;
  }
}

export async function generateAdequacyPercentage(profile: DetailedLinkedInProfile, candidature: Candidature): Promise<number> {
  try {
    const prompt = `Evalúa la adecuación del siguiente perfil de LinkedIn para la candidatura dada. 
    Proporciona un porcentaje de adecuación basado en la coincidencia de habilidades, experiencia y formación. 
    Responde solo con un número entre 0 y 100.

    Perfil de LinkedIn:
    Nombre: ${profile.name}
    Título: ${profile.headline}
    Experiencia: ${profile.experience?.map(exp => `${exp.title} en ${exp.company}`).join(', ')}
    Educación: ${profile.education?.map(edu => `${edu.degree} en ${edu.field_of_study} de ${edu.school}`).join(', ')}
    Habilidades: ${profile.skills?.join(', ')}

    Candidatura:
    Título: ${candidature.title}
    Descripción: ${candidature.description}
    Experiencia requerida: ${candidature.experience}
    Formación requerida: ${candidature.education?.join(', ')}
    Habilidades requeridas: ${candidature.skills?.join(', ')}`;

    const openai = await getOpenAIClient();
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 10,
      temperature: 0.3,
    });

    const percentage = parseInt(response.choices[0].message.content || '0', 10);
    return isNaN(percentage) ? 0 : Math.min(100, Math.max(0, percentage));
  } catch (error) {
    console.error('Error al generar el porcentaje de adecuación:', error);
    return 0;
  }
}

export async function processExperienceWithAI(experienceText: string): Promise<any[]> {
  try {
    const prompt = `Analiza el siguiente texto que contiene información sobre la experiencia laboral de un candidato. 
    Extrae y estructura la información en un formato JSON que incluya los siguientes campos para cada experiencia:
    1. title (título del puesto)
    2. company (nombre de la empresa)
    3. start_date (fecha de inicio)
    4. end_date (fecha de finalización, o "Presente" si es el trabajo actual)
    5. description (descripción de las responsabilidades y logros)

    Texto de la experiencia:
    ${experienceText}`;

    const openai = await getOpenAIClient();
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1000,
      temperature: 0.5,
    });

    const processedExperience = JSON.parse(response.choices[0].message.content || '[]');
    return Array.isArray(processedExperience) ? processedExperience : [];
  } catch (error) {
    console.error('Error al procesar la experiencia con IA:', error);
    return [];
  }
}

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