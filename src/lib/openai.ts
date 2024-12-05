import OpenAI from 'openai';

// Obtener la API key de las variables de entorno de Vite
const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

if (!apiKey) {
  throw new Error('VITE_OPENAI_API_KEY no está definida en las variables de entorno');
}

export const openai = new OpenAI({
  apiKey: apiKey,
  organization: import.meta.env.VITE_OPENAI_ORG_ID, // Opcional
  dangerouslyAllowBrowser: true // Permitir uso en el navegador
});

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