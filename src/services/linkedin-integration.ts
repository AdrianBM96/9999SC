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
    const { unipileToken, unipileDsn } = getConfig();
    if (!unipileToken || !unipileDsn) {
      throw new Error('Unipile configuration not found. Please configure your Unipile credentials in settings.');
    }

    // First, get the profile ID from the URL
    const profileId = profileUrl.split('/in/')[1]?.split('/')[0];
    if (!profileId) {
      throw new Error('Invalid LinkedIn profile URL');
    }

    // Get LinkedIn profile using Unipile API
    const response = await fetch(`https://${unipileDsn}/api/v1/linkedin/profiles/${profileId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${unipileToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch LinkedIn profile');
    }

    const unipileProfile = await response.json();

    // Transform Unipile response to our LinkedInProfile interface
    return {
      id: unipileProfile.id,
      firstName: unipileProfile.first_name || '',
      lastName: unipileProfile.last_name || '',
      headline: unipileProfile.headline || '',
      skills: unipileProfile.skills || [],
      experience: (unipileProfile.experience || []).map((exp: any) => ({
        company: exp.company_name || '',
        position: exp.title || '',
        duration: exp.duration || ''
      })),
      education: (unipileProfile.education || []).map((edu: any) => ({
        institution: edu.school_name || '',
        degree: edu.degree || '',
        year: edu.end_date?.split('-')[0] || ''
      })),
      languages: unipileProfile.languages || []
    };
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
    const { unipileToken, unipileDsn } = getConfig();
    if (!unipileToken || !unipileDsn) {
      throw new Error('Unipile configuration not found. Please configure your Unipile credentials in settings.');
    }

    // First, get the list of LinkedIn accounts to use the first one
    const accountsResponse = await fetch(`https://${unipileDsn}/api/v1/accounts`, {
      headers: {
        'Authorization': `Bearer ${unipileToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!accountsResponse.ok) {
      throw new Error('Failed to fetch LinkedIn accounts');
    }

    const accounts = await accountsResponse.json();
    const linkedInAccount = accounts.find((account: any) => account.provider === 'linkedin');

    if (!linkedInAccount) {
      throw new Error('No LinkedIn account connected in Unipile');
    }

    // Send message using Unipile API
    const response = await fetch(`https://${unipileDsn}/api/v1/linkedin/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${unipileToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        account_id: linkedInAccount.id,
        profile_id: profileId,
        message: message
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

// New function to get connected LinkedIn accounts
export async function getLinkedInAccounts() {
  try {
    const { unipileToken, unipileDsn } = getConfig();
    if (!unipileToken || !unipileDsn) {
      throw new Error('Unipile configuration not found. Please configure your Unipile credentials in settings.');
    }

    const response = await fetch(`https://${unipileDsn}/api/v1/accounts`, {
      headers: {
        'Authorization': `Bearer ${unipileToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch LinkedIn accounts');
    }

    const accounts = await response.json();
    return accounts.filter((account: any) => account.provider === 'linkedin');
  } catch (error) {
    console.error('Error fetching LinkedIn accounts:', error);
    throw error;
  }
}
