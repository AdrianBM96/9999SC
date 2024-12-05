import { api } from './apiClient';

export async function getCandidature(id: string) {
  try {
    const response = await api.get(`/candidatures/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching candidature:', error);
    throw error;
  }
}