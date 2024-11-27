import { DetailedLinkedInProfile } from '../../../types';
import { openai, pdfjsLib } from './config';

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
