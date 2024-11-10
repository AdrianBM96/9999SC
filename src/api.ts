import { SearchResponse, Location, DetailedLinkedInProfile } from './types';

const API_BASE_URL = 'https://api3.unipile.com:13361/api/v1';
const API_KEY = import.meta.env.VITE_UNIPILE_API_KEY;
const ACCOUNT_ID = import.meta.env.VITE_UNIPILE_ACCOUNT_ID;

console.log('API_KEY:', API_KEY);
console.log('ACCOUNT_ID:', ACCOUNT_ID);

async function fetchWithAuth(url: string, method: string, body?: object) {
  if (!API_KEY || !ACCOUNT_ID) {
    throw new Error('API Key or Account ID is missing. Please check your .env file.');
  }

  const urlWithAccountId = `${url}${url.includes('?') ? '&' : '?'}account_id=${ACCOUNT_ID}`;
  console.log('Request URL:', urlWithAccountId);
  if (body) console.log('Request body:', JSON.stringify(body, null, 2));

  const options: RequestInit = {
    method,
    headers: {
      'X-API-KEY': API_KEY,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(urlWithAccountId, options);

  const responseData = await response.json();

  if (!response.ok) {
    console.error('API response not OK:', response.status, JSON.stringify(responseData, null, 2));
    throw new Error(`HTTP error! status: ${response.status}. ${JSON.stringify(responseData)}`);
  }

  return responseData;
}

export async function searchLocations(query: string): Promise<Location[]> {
  try {
    const url = `${API_BASE_URL}/linkedin/search/parameters?keywords=${encodeURIComponent(query)}&type=LOCATION`;
    console.log('Searching locations with query:', query);
    const data = await fetchWithAuth(url, 'GET');
    console.log('Location search response:', JSON.stringify(data, null, 2));
    
    if (!data.items || !Array.isArray(data.items)) {
      console.error('Unexpected response format for locations:', JSON.stringify(data, null, 2));
      throw new Error('Invalid response format for locations');
    }
    
    return data.items.map((item: any) => ({
      id: item.id,
      name: item.title,
    }));
  } catch (error) {
    console.error('Error in searchLocations:', error);
    throw error;
  }
}

export async function searchLinkedInProfiles(keywords: string, locationIds?: string[]): Promise<SearchResponse> {
  const url = `${API_BASE_URL}/linkedin/search?limit=10`;

  const requestBody = {
    api: 'classic',
    category: 'people',
    keywords,
    ...(locationIds && locationIds.length > 0 && { location: locationIds }),
    fields: [
      'id',
      'name',
      'headline',
      'location',
      'profile_url',
      'public_profile_url',
      'profile_picture_url',
      'current_company',
      'current_position',
      'experience',
      'education',
      'skills',
      'languages',
      'connections'
    ]
  };

  console.log('Searching profiles with request:', JSON.stringify(requestBody, null, 2));

  const data = await fetchWithAuth(url, 'POST', requestBody);
  
  console.log('Profile search response:', JSON.stringify(data, null, 2));

  if (!data || !data.items || !Array.isArray(data.items)) {
    console.error('Unexpected response format:', JSON.stringify(data, null, 2));
    throw new Error(`Invalid response format from the API: ${JSON.stringify(data)}`);
  }
  
  return data as SearchResponse;
}

export async function getDetailedLinkedInProfile(publicIdentifier: string): Promise<DetailedLinkedInProfile> {
  // Remove any query parameters or hash from the publicIdentifier
  const cleanPublicIdentifier = publicIdentifier.split('?')[0].split('#')[0];
  
  // Construct the URL using the cleaned publicIdentifier
  const url = `${API_BASE_URL}/users/${encodeURIComponent(cleanPublicIdentifier)}?linkedin_sections=*`;
  
  console.log('Fetching detailed profile for:', cleanPublicIdentifier);

  const data = await fetchWithAuth(url, 'GET');
  
  console.log('Detailed profile response:', JSON.stringify(data, null, 2));

  if (!data || typeof data !== 'object') {
    console.error('Unexpected response format for detailed profile:', JSON.stringify(data, null, 2));
    throw new Error('Invalid response format for detailed profile');
  }
  
  return data as DetailedLinkedInProfile;
}