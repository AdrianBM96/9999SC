import * as pdfjsLib from 'pdfjs-dist';
import { getOpenAIClient } from '../../../lib/openai';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export { pdfjsLib, getOpenAIClient };
