export interface Language {
  name: string;
  proficiency?: string;
}

export interface DetailedLinkedInProfile {
  id: string;
  name: string;
  headline: string;
  location: string;
  industry?: string;
  summary?: string;
  profile_picture_url?: string;
  public_profile_url: string;
  email?: string;
  phone?: string;
  twitter_handle?: string;
  connections?: string;
  current_company?: string;
  current_position?: string;
  work_experience?: WorkExperience[];
  education?: {
    school: string;
    degree?: string;
    field_of_study?: string;
    start_date?: string;
    end_date?: string;
    description?: string;
  }[];
  skills?: (string | { name: string; endorsement_count?: number })[];
  languages?: (string | Language)[];
  certifications?: (string | {
    name: string;
    organization?: string;
    issue_date?: string;
    url?: string;
  })[];
  websites?: string[];
  publications?: {
    title: string;
    publisher?: string;
    publication_date?: string;
    url?: string;
  }[];
  honors_awards?: {
    title: string;
    issuer?: string;
    issue_date?: string;
    description?: string;
  }[];
  volunteer_work?: {
    organization: string;
    role?: string;
    cause?: string;
    start_date?: string;
    end_date?: string;
    description?: string;
  }[];
  follower_count?: number;
  connections_count?: number;
  network_distance?: number;
  is_premium?: boolean;
  is_influencer?: boolean;
  is_creator?: boolean;
  hashtags?: string[];
  adequacyPercentage?: number;
  uniqueId?: string;
}

export interface FormField {
  id: string;
  type: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox';
  label: string;
  required: boolean;
  options?: string[];
  conditional?: {
    dependsOn: string;
    value: string;
  };
}

export interface FormSection {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
}

export interface CampaignForm {
  id: string;
  sections: FormSection[];
  aiSuggestions?: FormField[];
}

export interface CampaignMessage {
  id: string;
  content: string;
  order: number;
  type: 'initial' | 'followup';
  aiGenerated?: boolean;
}

export interface Campaign {
  id: string;
  name: string;
  description: string;
  type: 'recruitment' | 'sourcing';
  candidatureId: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  evaluationDate: string;
  form: CampaignForm;
  messages: CampaignMessage[];
  metrics?: {
    sent: number;
    opened: number;
    responded: number;
    applied: number;
  };
  createdAt: string;
  updatedAt: string;
}

