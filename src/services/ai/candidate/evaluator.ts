import { DetailedLinkedInProfile, Candidature } from '../../../types';
import { openai } from './config';

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
    - Idiomas requeridos: ${candidature.languages?.join(', ') || ''}`;

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
