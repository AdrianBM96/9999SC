import { db } from '../firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, getDoc } from 'firebase/firestore';
import { Campaign } from '../types';

export const campaignService = {
  async getCampaigns(): Promise<Campaign[]> {
    const campaignsCollection = collection(db, 'campaigns');
    const snapshot = await getDocs(campaignsCollection);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Campaign));
  },

  async getCampaign(id: string): Promise<Campaign | null> {
    const docRef = doc(db, 'campaigns', id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as Campaign : null;
  },

  async createCampaign(campaign: Omit<Campaign, 'id'>): Promise<Campaign> {
    const docRef = await addDoc(collection(db, 'campaigns'), campaign);
    return { id: docRef.id, ...campaign };
  },

  async updateCampaign(id: string, updates: Partial<Campaign>): Promise<void> {
    const docRef = doc(db, 'campaigns', id);
    await updateDoc(docRef, updates);
  },

  async deleteCampaign(id: string): Promise<void> {
    await deleteDoc(doc(db, 'campaigns', id));
  }
};
