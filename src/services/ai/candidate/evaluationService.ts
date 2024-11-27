import { DetailedLinkedInProfile, Candidature } from '../../../types';
import { generateAIEvaluation, generateAdequacyPercentage } from './evaluator';

export async function evaluateCandidateWithAI(candidate: DetailedLinkedInProfile, campaign: Candidature) {
  try {
    const [evaluation, adequacyPercentage] = await Promise.all([
      generateAIEvaluation(candidate, campaign),
      generateAdequacyPercentage(candidate, campaign)
    ]);

    return {
      evaluation,
      adequacyPercentage,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error en la evaluación del candidato:', error);
    throw error;
  }
}
