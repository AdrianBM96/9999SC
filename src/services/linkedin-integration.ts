import { getConfig } from './config';

interface LinkedInProfile {
  id: string;
  firstName: string;
  lastName: string;
  headline: string;
  skills: string[];
  experience: Array<{
    company: string;
    position: string;
    duration: string;
  }>;
  education: Array<{
    institution: string;
    degree: string;
    year: string;
  }>;
  languages: string[];
}

export async function getLinkedInProfile(profileUrl: string): Promise<LinkedInProfile> {
  try {
    const response = await fetch('/api/linkedin/profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getConfig().linkedinApiKey}`
      },
      body: JSON.stringify({ profileUrl })
    });

    if (!response.ok) {
      throw new Error('Failed to fetch LinkedIn profile');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching LinkedIn profile:', error);
    throw error;
  }
}

export async function updateCandidateWithLinkedIn(candidateId: string, linkedInData: LinkedInProfile) {
  try {
    const response = await fetch(`/api/candidates/${candidateId}/linkedin`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(linkedInData)
    });

    if (!response.ok) {
      throw new Error('Failed to update candidate with LinkedIn data');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating candidate with LinkedIn data:', error);
    throw error;
  }
}

export async function sendLinkedInMessage(profileId: string, message: string) {
  try {
    const response = await fetch('/api/linkedin/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getConfig().linkedinApiKey}`
      },
      body: JSON.stringify({
        profileId,
        message
      })
    });

    if (!response.ok) {
      throw new Error('Failed to send LinkedIn message');
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending LinkedIn message:', error);
    throw error;
  }
}
