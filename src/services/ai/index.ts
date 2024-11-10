// Re-export all AI functions from their respective modules
export {
  generateJobDescription,
  generateSalaryRange,
  generateMarketDemand
} from './candidatureAI';

export {
  generateAIEvaluation,
  generateAdequacyPercentage,
  extractCVInformation,
  processExperienceWithAI,
  extractSearchKeywords
} from './candidateAI';

export {
  generateInterviewQuestions,
  generateInterviewFeedback
} from './interviewAI';