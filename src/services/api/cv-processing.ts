import { Configuration, OpenAIApi } from 'openai';
import { getConfig } from '../config';

const configuration = new Configuration({
  apiKey: getConfig().openAiApiKey,
});

const openai = new OpenAIApi(configuration);

interface CVProcessingRequest {
  cvText: string;
  linkedinData: any;
}

export async function processCV(req: CVProcessingRequest) {
  try {
    const prompt = `
    Analyze the following CV text and LinkedIn data, and extract the following information in a structured format:
    - Skills (technical and soft skills)
    - Work experience (company, position, duration)
    - Education (institution, degree, year)
    - Languages

    CV Text:
    ${req.cvText}

    LinkedIn Data:
    ${JSON.stringify(req.linkedinData, null, 2)}

    Please provide a JSON response that merges and reconciles the information from both sources.
    `;

    const completion = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a professional CV analyzer. Extract and structure information from CVs and LinkedIn profiles."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
    });

    const response = completion.data.choices[0].message?.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    return JSON.parse(response);
  } catch (error) {
    console.error('Error processing CV with OpenAI:', error);
    throw error;
  }
}
