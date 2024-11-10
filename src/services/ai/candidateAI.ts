import OpenAI from 'openai';
import { DetailedLinkedInProfile, Candidature } from '../../types';
import * as pdfjsLib from 'pdfjs-dist';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export async function extractCVInformation(arrayBuffer: ArrayBuffer): Promise<Partial<DetailedLinkedInProfile>> {
  try {
    if (arrayBuffer.byteLength === 0) {
      throw new Error('El archivo PDF está vacío');
    }

    const data = new Uint8Array(arrayBuffer);
    const loadingTask = pdfjsLib.getDocument({ 
      data,
      cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/',
      cMapPacked: true,
    });

    const pdf = await loadingTask.promise;
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
    ${fullText}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Eres un experto en análisis de CVs. Extrae información precisa y estructurada, asegurándote de que los campos críticos como nombre y email sean identificados correctamente."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 2000,
    });

    if (!completion.choices[0].message.content) {
      throw new Error('No se pudo generar la respuesta del análisis del CV');
    }

    const extractedInfo = JSON.parse(completion.choices[0].message.content);

    if (!extractedInfo.name || !extractedInfo.email) {
      throw new Error('No se pudo extraer el nombre o email del CV');
    }

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

    return {
      ...defaultProfile,
      ...extractedInfo,
      experience: extractedInfo.experience || [],
      education: extractedInfo.education || [],
      skills: extractedInfo.skills || [],
      languages: extractedInfo.languages || [],
      certifications: extractedInfo.certifications || [],
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error al procesar el CV: ${error.message}`);
    }
    throw new Error('Error al procesar el CV. Por favor, verifica que el archivo sea válido.');
  }
}

export async function generateAIEvaluation(profile: DetailedLinkedInProfile, candidature: Candidature): Promise<string> {
  try {
    const prompt = `Como experto reclutador, realiza una evaluación detallada y profesional del siguiente perfil para la candidatura especificada.
    La evaluación debe ser exhaustiva y estructurada, incluyendo:

    1. Resumen ejecutivo
    2. Análisis detallado de la experiencia relevante
    3. Evaluación de competencias técnicas
    4. Evaluación de habilidades blandas
    5. Valoración de la formación académica y certificaciones
    6. Análisis de idiomas y habilidades de comunicación
    7. Adecuación específica al puesto
    8. Recomendaciones y áreas de mejora
    9. Conclusión y recomendación final

    Perfil completo del candidato:
    Nombre: ${profile.name}
    Título actual: ${profile.headline || ''}
    Ubicación: ${profile.location || ''}
    
    Experiencia profesional:
    ${profile.work_experience?.map(exp => 
      `- ${exp.position} en ${exp.company}
       Periodo: ${exp.start} - ${exp.end || 'Presente'}
       Ubicación: ${exp.location || ''}
       Descripción: ${exp.description || ''}`
    ).join('\n\n')}

    Educación:
    ${profile.education?.map(edu => 
      `- ${edu.degree || ''} ${edu.field_of_study ? `en ${edu.field_of_study}` : ''} 
       Institución: ${edu.school || ''}
       Periodo: ${edu.start_date || ''} - ${edu.end_date || ''}`
    ).join('\n')}

    Certificaciones:
    ${profile.certifications?.map(cert => 
      typeof cert === 'string' ? cert : 
      `- ${cert.name} ${cert.organization ? `por ${cert.organization}` : ''}`
    ).join('\n')}

    Habilidades técnicas y blandas:
    ${profile.skills?.join(', ') || ''}

    Idiomas:
    ${profile.languages?.map(lang => 
      typeof lang === 'string' ? lang : 
      `${lang.name} (${lang.proficiency || 'No especificado'})`
    ).join(', ')}

    Detalles adicionales:
    - Conexiones: ${profile.connections_count || 'No especificado'}
    - Seguidores: ${profile.follower_count || 'No especificado'}
    - Resumen profesional: ${profile.summary || ''}

    Requisitos de la candidatura:
    - Puesto: ${candidature.title}
    - Descripción: ${candidature.description}
    - Experiencia requerida: ${candidature.experience}
    - Formación requerida: ${candidature.education?.join(', ') || ''}
    - Habilidades requeridas: ${candidature.skills?.join(', ') || ''}
    - Idiomas requeridos: ${candidature.languages?.join(', ') || ''}

    Por favor, proporciona una evaluación detallada y estructurada que analice la idoneidad del candidato para el puesto,
    destacando fortalezas específicas, áreas de mejora y una recomendación final clara.
    La evaluación debe ser profesional, objetiva y constructiva.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Eres un experto reclutador senior con más de 15 años de experiencia en evaluación de perfiles profesionales. Proporciona evaluaciones detalladas, objetivas y constructivas, utilizando un lenguaje profesional y estructurado."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    return response.choices[0].message.content || 'No se pudo generar la evaluación.';
  } catch (error) {
    console.error('Error al generar la evaluación:', error);
    throw error;
  }
}

export async function generateAdequacyPercentage(profile: DetailedLinkedInProfile, candidature: Candidature): Promise<number> {
  try {
    const prompt = `Evalúa la adecuación del siguiente perfil para la candidatura dada y proporciona un porcentaje de adecuación entre 0 y 100.
    Considera todos los aspectos del perfil y los requisitos de la candidatura.
    Responde ÚNICAMENTE con un número entre 0 y 100.

    Perfil:
    - Nombre: ${profile.name}
    - Título: ${profile.headline}
    - Experiencia: ${profile.work_experience?.map(exp => `${exp.position} en ${exp.company}`).join(', ')}
    - Educación: ${profile.education?.map(edu => `${edu.degree} en ${edu.field_of_study} de ${edu.school}`).join(', ')}
    - Habilidades: ${profile.skills?.join(', ')}
    - Idiomas: ${profile.languages?.join(', ')}

    Candidatura:
    - Título: ${candidature.title}
    - Descripción: ${candidature.description}
    - Experiencia requerida: ${candidature.experience}
    - Formación requerida: ${candidature.education?.join(', ')}
    - Habilidades requeridas: ${candidature.skills?.join(', ')}
    - Idiomas requeridos: ${candidature.languages?.join(', ')}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Eres un experto en evaluación de perfiles profesionales. Tu tarea es evaluar la adecuación de un candidato a una posición específica y proporcionar un porcentaje de coincidencia entre 0 y 100. Responde ÚNICAMENTE con un número."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 10,
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

    const processedExperience = JSON.parse(response.choices[0].message.content || '[]');
    return Array.isArray(processedExperience) ? processedExperience : [];
  } catch (error) {
    console.error('Error al procesar la experiencia:', error);
    return [];
  }
}

export async function extractSearchKeywords(candidature: Candidature): Promise<string> {
  try {
    const prompt = `Basándote en el siguiente título y descripción de candidatura, genera una lista de palabras clave relevantes y específicas para buscar candidatos en LinkedIn. Incluye solo las palabras más importantes y relevantes. Separa las palabras clave con comas y limita la respuesta a un máximo de 5 palabras o frases clave:

    Título: ${candidature.title}
    Descripción: ${candidature.description}`;

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