import OpenAI from 'openai';
import * as pdfjsLib from 'pdfjs-dist';

export const openai = new OpenAI({
  apiKey: localStorage.getItem('openai_api_key') || import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

// Function to update OpenAI configuration with new API key
export const updateOpenAIConfig = (apiKey: string) => {
  Object.assign(openai, new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true
  }));
};

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export { pdfjsLib };
