export type CalendarProvider = 'google' | 'microsoft';

export interface InterviewSchedulingData {
  date: string;
  provider: CalendarProvider;
  duration: number;
  message: string;
  location: string;
  description: string;
}

export type CandidateStatus = 
  | 'new'
  | 'form_submitted'
  | 'under_review'
  | 'interview_scheduled'
  | 'interview_completed'
  | 'selected'
  | 'rejected'
  | 'withdrawn';

export type CampaignStatus =
  | 'draft'
  | 'active'
  | 'paused'
  | 'completed';

export type CampaignStepType = 
  | 'linkedin_connect'
  | 'linkedin_message'
  | 'linkedin_reminder'
  | 'email_message'
  | 'form_submission'
  | 'review_required'
  | 'schedule_interview'
  | 'send_rejection'
  | 'send_selection'
  | 'status_change'
  | 'wait_for_status';

export interface Question {
  id: string;
  category: string;
  text: string;
}

export interface StepCondition {
  type: 'status' | 'form_score' | 'time_elapsed';
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than';
  value: string | number;
}

export interface ConditionalAction {
  conditions: StepCondition[];
  action: {
    type: CampaignStepType;
    config: {
      message?: string;
      subject?: string; // For email
      connectionMessage?: string;
      delay?: number;
      formId?: string;
      targetStatus?: CandidateStatus; // For status changes
      calendarConfig?: {
        provider: CalendarProvider;
        daysAvailable: number;
        workingHours: {
          start: string;
          end: string;
        };
        duration: number;
        location?: string;
        description?: string;
      };
    };
  };
}

export interface StepConfig {
  message?: string;
  subject?: string;
  connectionMessage?: string;
  delay?: number;
  formId?: string;
  targetStatus?: CandidateStatus;
  instructions?: string;
  reviewFields?: {
    cv?: boolean;
    form?: boolean;
    linkedin?: boolean;
  };
  calendarConfig?: {
    provider: CalendarProvider;
    daysAvailable: number;
    workingHours: {
      start: string;
      end: string;
    };
    duration: number;
    location?: string;
    description?: string;
  };
}

export interface CampaignStep {
  id: string;
  type: CampaignStepType;
  order: number;
  name: string;
  description?: string;
  requiresReview?: boolean;
  conditions?: ConditionalAction[];
  config: StepConfig;
}

export interface CampaignTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  steps: CampaignStep[];
}

export interface CampaignCandidate {
  id: string;
  candidateId: string;
  status: CandidateStatus;
  currentStep: number;
  formSubmitted?: boolean;
  formScore?: number;
  reviewNotes?: string;
  lastInteraction?: string;
  cvReviewed?: boolean;
  formEvaluated?: boolean;
  interviewEvaluated?: boolean;
  finalDecisionMade?: boolean;
  cvFile?: {
    text: string;
    url: string;
  };
  linkedinData?: {
    profile: string;
    // other LinkedIn data
  };
  history: {
    timestamp: string;
    status: CandidateStatus;
    note?: string;
  }[];
  evaluationHistory?: {
    type: 'human' | 'ai';
    score: number;
    notes: string;
    timestamp: string;
  }[];
}

export interface Campaign {
  id: string;
  name: string;
  description: string;
  type: 'recruitment' | 'sourcing';
  candidatureId: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  template?: CampaignTemplate;
  steps: CampaignStep[];
  candidates?: CampaignCandidate[];
  metrics: {
    sent: number;
    opened: number;
    responded: number;
    applied: number;
    interviews_scheduled: number;
    selected: number;
    rejected: number;
  };
  formQuestions: Question[];
  endDate?: string;
  createdAt: string;
  updatedAt: string;
  messages: {
    rejection?: string;
    selection?: string;
  };
}

export interface Department {
  id: string;
  name: string;
  description?: string;
}

export interface Candidature {
  id: string;
  title: string;
  description?: string;
  department: Department;
  status: 'open' | 'closed' | 'draft';
  createdAt: string;
  updatedAt: string;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  department?: Department;
  status: 'active' | 'inactive' | 'pending';
  candidatureId: string | null;
  createdAt: string;
  updatedAt: string;
  // Campos adicionales para mejor gestión
  source?: 'manual' | 'linkedin' | 'referral' | 'other';
  skills?: string[];
  experience?: Array<{
    position: string;
    company: string;
    startDate: string;
    endDate?: string;
    current?: boolean;
    description?: string;
  }>;
  education?: Array<{
    degree: string;
    institution: string;
    year: string;
    field?: string;
  }>;
  currentPosition?: string;
  linkedinProfile?: {
    url: string;
    data?: any;
  } | null;
  lastInteraction?: string | null;
  tags?: string[];
  // Estado específico para la candidatura
  applicationStatus?: 'new' | 'reviewing' | 'contacted' | 'interviewing' | 'offered' | 'hired' | 'rejected';
  evaluationScore?: number | null;
  interviewDate?: string | null;
  notes?: string;
  // Campos para seguimiento
  cvReviewed?: boolean;
  formSubmitted?: boolean;
  formEvaluated?: boolean;
  interviewScheduled?: boolean;
  interviewCompleted?: boolean;
  feedbackProvided?: boolean;
  // Campos para la campaña
  campaignStatus?: CandidateStatus;
  campaignHistory?: Array<{
    timestamp: string;
    status: CandidateStatus;
    note?: string;
  }>;
  // Evaluaciones
  evaluations?: Array<{
    type: 'cv' | 'form' | 'interview' | 'technical' | 'cultural';
    score: number;
    feedback: string;
    evaluator?: string;
    date: string;
  }>;
}

