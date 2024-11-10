import { CampaignTemplate } from '../../../types/campaign';
import { v4 as uuidv4 } from 'uuid';

export const defaultTemplates: CampaignTemplate[] = [
  {
    id: 'tech-recruitment',
    name: 'Reclutamiento Tech',
    description: 'Template ideal para posiciones de desarrollo de software. Incluye conexión, mensaje personalizado y seguimiento automático.',
    icon: 'code',
    steps: [
      {
        id: uuidv4(),
        type: 'linkedin_connect',
        order: 1,
        config: {
          connectionMessage: 'Hola {{firstName}}, me gustaría conectar contigo para compartir una oportunidad como {{position}} que podría interesarte.',
          delay: 0
        }
      },
      {
        id: uuidv4(),
        type: 'linkedin_message',
        order: 2,
        config: {
          message: 'Hola {{firstName}}, \n\nEspero que estés teniendo un excelente día. Me gustaría compartir contigo una oportunidad como {{position}} en {{company}}. Buscamos profesionales con tu experiencia para unirse a nuestro equipo.\n\nPara conocer más detalles y aplicar, por favor completa este breve formulario: {{formLink}}\n\nQuedo atento a tus comentarios,\n{{recruiterName}}',
          delay: 1
        }
      },
      {
        id: uuidv4(),
        type: 'linkedin_reminder',
        order: 3,
        config: {
          message: 'Hola {{firstName}}, \n\nEspero que hayas tenido la oportunidad de revisar la posición que te compartí. ¿Te gustaría conocer más detalles sobre el rol y el equipo?\n\nRecuerda que puedes aplicar aquí: {{formLink}}\n\nSaludos,\n{{recruiterName}}',
          delay: 3
        }
      },
      {
        id: uuidv4(),
        type: 'schedule_interview',
        order: 4,
        config: {
          calendarConfig: {
            provider: 'google',
            daysAvailable: 7,
            workingHours: {
              start: '09:00',
              end: '18:00'
            },
            duration: 45
          }
        }
      }
    ]
  },
  {
    id: 'executive-recruitment',
    name: 'Reclutamiento Ejecutivo',
    description: 'Template para posiciones de alto nivel con un enfoque más personalizado y profesional.',
    icon: 'briefcase',
    steps: [
      {
        id: uuidv4(),
        type: 'linkedin_connect',
        order: 1,
        config: {
          connectionMessage: 'Estimado/a {{firstName}}, me gustaría conectar para compartirle una oportunidad ejecutiva en {{company}} que podría ser de su interés.',
          delay: 0
        }
      },
      {
        id: uuidv4(),
        type: 'linkedin_message',
        order: 2,
        config: {
          message: 'Estimado/a {{firstName}}, \n\nEspero que este mensaje le encuentre bien. Me pongo en contacto desde {{company}} en relación a una interesante oportunidad como {{position}}. Su perfil y trayectoria han llamado nuestra atención.\n\nNos gustaría conocer más sobre su experiencia profesional. Para facilitar el proceso, le agradecería si pudiera completar este formulario: {{formLink}}\n\nQuedo a su disposición para cualquier consulta.\n\nCordialmente,\n{{recruiterName}}',
          delay: 1
        }
      },
      {
        id: uuidv4(),
        type: 'linkedin_reminder',
        order: 3,
        config: {
          message: 'Estimado/a {{firstName}}, \n\nQuería hacer un seguimiento respecto a la oportunidad que le compartí anteriormente. ¿Le gustaría programar una llamada para discutir los detalles de la posición y resolver cualquier duda que pueda tener?\n\nPuede aplicar directamente aquí: {{formLink}}\n\nSaludos cordiales,\n{{recruiterName}}',
          delay: 4
        }
      },
      {
        id: uuidv4(),
        type: 'schedule_interview',
        order: 4,
        config: {
          calendarConfig: {
            provider: 'google',
            daysAvailable: 7,
            workingHours: {
              start: '09:00',
              end: '18:00'
            },
            duration: 60
          }
        }
      }
    ]
  },
  {
    id: 'quick-sourcing',
    name: 'Sourcing Rápido',
    description: 'Template simplificado para procesos de sourcing ágiles con seguimiento automático.',
    icon: 'zap',
    steps: [
      {
        id: uuidv4(),
        type: 'linkedin_connect',
        order: 1,
        config: {
          connectionMessage: 'Hola {{firstName}}! 👋 Me gustaría conectar para compartirte una oportunidad en {{company}} que podría interesarte.',
          delay: 0
        }
      },
      {
        id: uuidv4(),
        type: 'linkedin_message',
        order: 2,
        config: {
          message: 'Hola {{firstName}}! 👋\n\nTe escribo porque estamos buscando un {{position}} para {{company}}. Vi tu perfil y me pareció muy interesante para la posición.\n\n¿Te gustaría conocer más detalles? Completa este breve formulario y conversemos: {{formLink}}\n\nSaludos,\n{{recruiterName}}',
          delay: 1
        }
      },
      {
        id: uuidv4(),
        type: 'linkedin_reminder',
        order: 3,
        config: {
          message: '¡Hola de nuevo {{firstName}}! 🙂\n\n¿Tuviste oportunidad de revisar la posición? Estamos avanzando rápido con el proceso y me gustaría conocer tu interés.\n\nAplica aquí: {{formLink}}\n\n{{recruiterName}}',
          delay: 2
        }
      }
    ]
  }
];

