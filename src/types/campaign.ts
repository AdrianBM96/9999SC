export type CalendarProvider = 'google' | 'microsoft';

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
  | 'form_submission'
  | 'review_required'
  | 'schedule_interview'
  | 'send_rejection'
  | 'send_selection';

export interface Question {
  id: string;
  category: string;
  text: string;
}

export interface ConditionalAction {
  status: CandidateStatus;
  action: {
    type: CampaignStepType;
    config: {
      message?: string;
      connectionMessage?: string;
      delay?: number;
      formId?: string;
      calendarConfig?: {
        provider: CalendarProvider;
        daysAvailable: number;
        workingHours: {
          start: string;
          end: string;
        };
        duration: number;
      };
    };
  };
}

export interface CampaignStep {
  id: string;
  type: CampaignStepType;
  order: number;
  requiresReview?: boolean;
  conditions?: ConditionalAction[];
  config: {
    message?: string;
    connectionMessage?: string;
    delay?: number;
    formId?: string;
    calendarConfig?: {
      provider: CalendarProvider;
      daysAvailable: number;
      workingHours: {
        start: string;
        end: string;
      };
      duration: number;
    };
  };
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
  history: {
    timestamp: string;
    status: CandidateStatus;
    note?: string;
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
  candidates: CampaignCandidate[];
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

