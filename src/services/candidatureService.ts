import { db } from '@/firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

export interface Candidature {
  id: string;
  title: string;
  description: string;
  candidateCount?: number;
  createdAt: Date;
  updatedAt: Date;
  status?: string;
  requirements?: string[];
  location?: string;
  department?: string;
}

export interface CandidatureDetails extends Candidature {
  candidates: Array<{
    id: string;
    name: string;
    email: string;
    status: string;
  }>;
}

export async function getCandidature(id: string): Promise<CandidatureDetails> {
  try {
    // Get candidature details
    const candidatureRef = doc(db, 'candidatures', id);
    const candidatureSnap = await getDoc(candidatureRef);
    
    if (!candidatureSnap.exists()) {
      throw new Error('Candidature not found');
    }

    // Get candidates for this candidature
    const candidatesRef = collection(db, 'candidates');
    const candidatesQuery = query(candidatesRef, where('candidatureId', '==', id));
    const candidatesSnap = await getDocs(candidatesQuery);

    const data = candidatureSnap.data();
    const candidates = candidatesSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return {
      id: candidatureSnap.id,
      title: data.title,
      description: data.description,
      candidateCount: candidates.length,
      candidates,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      status: data.status,
      requirements: data.requirements || [],
      location: data.location,
      department: data.department
    };
  } catch (error) {
    console.error('Error getting candidature details:', error);
    throw new Error('Failed to load candidature details');
  }
}

export async function getAllCandidatures(): Promise<Candidature[]> {
  try {
    const candidaturesRef = collection(db, 'candidatures');
    const candidaturesSnap = await getDocs(candidaturesRef);
    
    const candidatures = await Promise.all(
      candidaturesSnap.docs.map(async (doc) => {
        const data = doc.data();
        
        // Get candidate count for each candidature
        const candidatesRef = collection(db, 'candidates');
        const candidatesQuery = query(candidatesRef, where('candidatureId', '==', doc.id));
        const candidatesSnap = await getDocs(candidatesQuery);

        return {
          id: doc.id,
          title: data.title,
          description: data.description,
          candidateCount: candidatesSnap.size,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          status: data.status,
          requirements: data.requirements || [],
          location: data.location,
          department: data.department
        };
      })
    );

    return candidatures.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  } catch (error) {
    console.error('Error getting candidatures:', error);
    throw new Error('Failed to load candidatures');
  }
}

export async function getCandidatesForCampaign(
  candidatureId: string,
  limit?: number
): Promise<Array<{ id: string; name: string; email: string; status: string }>> {
  try {
    const candidatesRef = collection(db, 'candidates');
    let candidatesQuery = query(
      candidatesRef,
      where('candidatureId', '==', candidatureId),
      where('status', '==', 'active')
    );

    const candidatesSnap = await getDocs(candidatesQuery);
    let candidates = candidatesSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      status: doc.data().status || 'pending'
    }));

    // Apply limit if specified
    if (limit && limit > 0) {
      candidates = candidates.slice(0, limit);
    }

    return candidates;
  } catch (error) {
    console.error('Error getting candidates for campaign:', error);
    throw new Error('Failed to load candidates');
  }
}