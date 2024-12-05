import OpenAI from 'openai';
import { auth } from '../firebase';
import { getOpenAIConfig } from '../services/openaiConfig';

let openaiInstance: OpenAI | null = null;

export async function getOpenAIClient(): Promise<OpenAI> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('Usuario no autenticado. Por favor, inicia sesión.');
  }

  try {
    const config = await getOpenAIConfig(user);
    if (!config?.apiKey) {
      throw new Error('API Key de OpenAI no configurada. Por favor, configura tu API Key en la sección de configuración.');
    }

    // Create new instance only if it doesn't exist or if the API key has changed
    if (!openaiInstance || openaiInstance.apiKey !== config.apiKey) {
      openaiInstance = new OpenAI({
        apiKey: config.apiKey,
        organization: config.orgId,
        dangerouslyAllowBrowser: true
      });
    }

    return openaiInstance;
  } catch (error) {
    console.error('Error getting OpenAI configuration:', error);
    throw new Error('Error al obtener la configuración de OpenAI. Por favor, intenta de nuevo.');
  }
}

// Función auxiliar para manejar errores de la API
export async function handleOpenAIError(error: any): Promise<string> {
  console.error('OpenAI API Error:', error);

  if (error.response) {
    // Error de la API con respuesta
    const { status, data } = error.response;
    if (status === 429) {
      return 'Se ha excedido el límite de solicitudes. Por favor, inténtalo de nuevo más tarde.';
    } else if (status === 401) {
      return 'Error de autenticación con la API. Por favor, verifica las credenciales.';
    } else if (status === 400) {
      return 'Solicitud inválida. Por favor, verifica los parámetros.';
    }
    return `Error del servidor: ${data.error?.message || 'Error desconocido'}`;
  } else if (error.request) {
    // Error de red
    return 'Error de conexión. Por favor, verifica tu conexión a internet.';
  }
  
  // Error general
  return 'Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo.';
}

// Función para validar la respuesta de la API
export function validateOpenAIResponse(response: any): boolean {
  return (
    response &&
    response.choices &&
    Array.isArray(response.choices) &&
    response.choices.length > 0 &&
    response.choices[0].message &&
    typeof response.choices[0].message.content === 'string'
  );
}