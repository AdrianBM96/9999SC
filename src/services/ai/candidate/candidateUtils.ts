import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/firebase';
import { Candidate, Candidature } from '../../../types/campaign';

export async function fetchCandidatesForCandidature(candidatureId: string, candidatures: Candidature[]): Promise<Candidate[]> {
  try {
    // Obtener la candidatura y validar
    const candidature = candidatures.find(c => c.id === candidatureId);
    if (!candidature) {
      console.warn('Candidatura no encontrada:', candidatureId);
      throw new Error('Candidatura no encontrada');
    }

    console.log('Procesando candidatura:', {
      id: candidature.id,
      title: candidature.title,
      department: candidature.department?.name,
      status: candidature.status
    });

    // Obtener todos los candidatos
    const candidatesCollection = collection(db, 'candidates');
    const candidatesSnapshot = await getDocs(candidatesCollection);
    
    // Mapear y normalizar datos de candidatos
    const allCandidates = candidatesSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || 'Sin nombre',
        email: data.email || '',
        department: data.department ? {
          id: data.department.id,
          name: data.department.name,
        } : null,
        status: data.status || 'pending',
        candidatureId: data.candidatureId || null,
        source: data.source || 'manual',
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt || new Date().toISOString(),
        // Campos adicionales que podrían ser útiles
        skills: data.skills || [],
        experience: data.experience || [],
        education: data.education || [],
        currentPosition: data.currentPosition || '',
        linkedinProfile: data.linkedinProfile || null,
        lastInteraction: data.lastInteraction || null,
        tags: data.tags || [],
        // Estado específico para la candidatura
        applicationStatus: data.applicationStatus || 'new',
        evaluationScore: data.evaluationScore || null,
        interviewDate: data.interviewDate || null,
        notes: data.notes || ''
      } as Candidate;
    });

    console.log(`Total candidatos encontrados: ${allCandidates.length}`);

    // Filtrar candidatos elegibles
    const candidatesList = allCandidates.filter(candidate => {
      // Validar estado del candidato
      const isValidStatus = !candidate.status || ['active', 'pending'].includes(candidate.status);
      if (!isValidStatus) {
        console.log(`Candidato ${candidate.id} descartado por estado:`, candidate.status);
        return false;
      }

      // Verificar si ya está asignado a esta candidatura
      if (candidate.candidatureId === candidatureId) {
        console.log(`Candidato ${candidate.id} ya asignado a esta candidatura`);
        return true;
      }

      // Verificar si ya está asignado a otra candidatura activa
      if (candidate.candidatureId) {
        const otherCandidature = candidatures.find(c => c.id === candidate.candidatureId);
        if (otherCandidature && otherCandidature.status === 'open') {
          console.log(`Candidato ${candidate.id} ya asignado a otra candidatura activa`);
          return false;
        }
      }

      // Verificar coincidencia por departamento
      if (candidate.department?.id && candidature.department?.id) {
        const deptMatch = candidate.department.id === candidature.department.id;
        console.log(`Candidato ${candidate.id} coincidencia de departamento:`, deptMatch);
        return deptMatch;
      }

      // Si no tiene asignaciones previas y no hay restricciones de departamento, es elegible
      console.log(`Candidato ${candidate.id} elegible por defecto`);
      return true;
    });

    // Ordenar candidatos por relevancia
    candidatesList.sort((a, b) => {
      // Priorizar candidatos ya asignados a la candidatura
      if (a.candidatureId === candidatureId && b.candidatureId !== candidatureId) return -1;
      if (b.candidatureId === candidatureId && a.candidatureId !== candidatureId) return 1;

      // Luego por coincidencia de departamento
      const aDeptMatch = a.department?.id === candidature.department?.id;
      const bDeptMatch = b.department?.id === candidature.department?.id;
      if (aDeptMatch && !bDeptMatch) return -1;
      if (bDeptMatch && !aDeptMatch) return 1;

      // Finalmente por nombre
      return (a.name || '').localeCompare(b.name || '');
    });

    console.log(`Candidatos elegibles encontrados: ${candidatesList.length}`);
    return candidatesList;

  } catch (error) {
    console.error('Error al obtener candidatos:', error);
    throw error;
  }
}

