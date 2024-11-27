import { db } from '../firebase';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDoc, 
  query, 
  where,
  writeBatch,
  increment
} from 'firebase/firestore';
import { Campaign, Candidate, CandidateStatus } from '../types';
import { toast } from 'react-toastify';

export const campaignService = {
  async getCampaigns(): Promise<Campaign[]> {
    try {
      const campaignsCollection = collection(db, 'campaigns');
      const snapshot = await getDocs(campaignsCollection);
      const campaigns = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        // Asegurar que candidates es un array
        candidates: doc.data().candidates || [],
        // Asegurar que metrics existe
        metrics: {
          sent: 0,
          opened: 0,
          responded: 0,
          applied: 0,
          interviews_scheduled: 0,
          selected: 0,
          rejected: 0,
          ...doc.data().metrics
        }
      } as Campaign));

      // Ordenar por fecha de creación descendente
      return campaigns.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      throw error;
    }
  },

  async getCampaign(id: string): Promise<Campaign | null> {
    try {
      const docRef = doc(db, 'campaigns', id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return null;
      }

      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        candidates: data.candidates || [],
        metrics: {
          sent: 0,
          opened: 0,
          responded: 0,
          applied: 0,
          interviews_scheduled: 0,
          selected: 0,
          rejected: 0,
          ...data.metrics
        }
      } as Campaign;
    } catch (error) {
      console.error('Error fetching campaign:', error);
      throw error;
    }
  },

  async createCampaign(campaign: Omit<Campaign, 'id'>): Promise<Campaign> {
    try {
      // Validar campos requeridos
      if (!campaign.name || !campaign.candidatureId) {
        throw new Error('Nombre y candidatura son requeridos');
      }

      // Asegurar estructura correcta
      const campaignData = {
        ...campaign,
        candidates: [],
        metrics: {
          sent: 0,
          opened: 0,
          responded: 0,
          applied: 0,
          interviews_scheduled: 0,
          selected: 0,
          rejected: 0,
          ...campaign.metrics
        },
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, 'campaigns'), campaignData);
      return { id: docRef.id, ...campaignData };
    } catch (error) {
      console.error('Error creating campaign:', error);
      throw error;
    }
  },

  async updateCampaign(id: string, updates: Partial<Campaign>): Promise<void> {
    try {
      const docRef = doc(db, 'campaigns', id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating campaign:', error);
      throw error;
    }
  },

  async deleteCampaign(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'campaigns', id));
    } catch (error) {
      console.error('Error deleting campaign:', error);
      throw error;
    }
  },

  // Funciones específicas para manejo de candidatos
  async addCandidatesToCampaign(
    campaignId: string, 
    candidateIds: string[]
  ): Promise<void> {
    try {
      const campaign = await this.getCampaign(campaignId);
      if (!campaign) {
        throw new Error('Campaña no encontrada');
      }

      // Obtener candidatos
      const candidatesRef = collection(db, 'candidates');
      const snapshot = await getDocs(query(
        candidatesRef, 
        where('__name__', 'in', candidateIds)
      ));

      const candidates = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Candidate));

      // Preparar candidatos para la campaña
      const newCandidates = candidates.map(candidate => ({
        id: candidate.id,
        name: candidate.name,
        email: candidate.email,
        department: candidate.department,
        status: 'new' as CandidateStatus,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        history: [{
          timestamp: new Date().toISOString(),
          status: 'new' as CandidateStatus,
          note: 'Añadido a la campaña'
        }]
      }));

      // Actualizar campaña
      const campaignRef = doc(db, 'campaigns', campaignId);
      await updateDoc(campaignRef, {
        candidates: [...(campaign.candidates || []), ...newCandidates],
        updatedAt: new Date().toISOString()
      });

      toast.success(`${newCandidates.length} candidatos añadidos a la campaña`);
    } catch (error) {
      console.error('Error adding candidates to campaign:', error);
      toast.error('Error al añadir candidatos a la campaña');
      throw error;
    }
  },

  async updateCandidateStatus(
    campaignId: string,
    candidateId: string,
    newStatus: CandidateStatus,
    note?: string
  ): Promise<void> {
    try {
      const campaign = await this.getCampaign(campaignId);
      if (!campaign) {
        throw new Error('Campaña no encontrada');
      }

      const batch = writeBatch(db);
      const campaignRef = doc(db, 'campaigns', campaignId);

      // Actualizar candidato en la campaña
      const updatedCandidates = campaign.candidates?.map(c => {
        if (c.id === candidateId) {
          return {
            ...c,
            status: newStatus,
            updatedAt: new Date().toISOString(),
            history: [
              {
                timestamp: new Date().toISOString(),
                status: newStatus,
                note: note || `Estado actualizado a ${newStatus}`
              },
              ...(c.history || [])
            ]
          };
        }
        return c;
      });

      // Actualizar métricas
      const metricsUpdates: any = {};
      if (newStatus === 'interview_scheduled') {
        metricsUpdates['metrics.interviews_scheduled'] = increment(1);
      } else if (newStatus === 'selected') {
        metricsUpdates['metrics.selected'] = increment(1);
      } else if (newStatus === 'rejected') {
        metricsUpdates['metrics.rejected'] = increment(1);
      }

      batch.update(campaignRef, {
        candidates: updatedCandidates,
        ...metricsUpdates,
        updatedAt: new Date().toISOString()
      });

      await batch.commit();
      toast.success('Estado del candidato actualizado');
    } catch (error) {
      console.error('Error updating candidate status:', error);
      toast.error('Error al actualizar el estado del candidato');
      throw error;
    }
  },

  async removeCandidateFromCampaign(
    campaignId: string,
    candidateId: string
  ): Promise<void> {
    try {
      const campaign = await this.getCampaign(campaignId);
      if (!campaign) {
        throw new Error('Campaña no encontrada');
      }

      const updatedCandidates = campaign.candidates?.filter(c => c.id !== candidateId) || [];

      await updateDoc(doc(db, 'campaigns', campaignId), {
        candidates: updatedCandidates,
        updatedAt: new Date().toISOString()
      });

      toast.success('Candidato eliminado de la campaña');
    } catch (error) {
      console.error('Error removing candidate from campaign:', error);
      toast.error('Error al eliminar el candidato de la campaña');
      throw error;
    }
  }
};
