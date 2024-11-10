import React, { useState } from 'react';
import { Campaign, CandidateStatus } from '../../types/campaign';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { CampaignCandidates } from './CampaignCandidates';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { CampaignHeader } from './detail-sections/CampaignHeader';
import { CampaignMetrics } from './detail-sections/CampaignMetrics';
import { CampaignWorkflowSection } from './detail-sections/CampaignWorkflowSection';
import { processCVWithAI } from '../../services/cv-processing';
import { getLinkedInProfile, updateCandidateWithLinkedIn } from '../../services/linkedin-integration';
import { scheduleInterview } from '../../services/calendar-integration';
import { toast } from 'react-toastify';

interface CampaignDetailsProps {
  campaign: Campaign;
  onClose: () => void;
  onUpdateCampaign: (campaign: Campaign) => void;
}

export function CampaignDetails({ campaign, onClose, onUpdateCampaign }: CampaignDetailsProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);

  const handleCandidateStatusChange = async (candidateId: string, newStatus: CandidateStatus, note?: string) => {
    setLoading(true);
    try {
      const candidate = campaign.candidates.find(c => c.id === candidateId);
      if (!candidate) return;

      // Process CV with AI when form is submitted
      if (newStatus === 'form_submitted' && candidate.cvFile) {
        const linkedInData = await getLinkedInProfile(candidate.linkedinUrl);
        await processCVWithAI(candidateId, candidate.cvFile.text, linkedInData);
        await updateCandidateWithLinkedIn(candidateId, linkedInData);
      }

      // Schedule interview if status changes to interview_scheduled
      if (newStatus === 'interview_scheduled' && candidate.interviewDetails) {
        await scheduleInterview(candidateId, candidate.interviewDetails);
      }

      // Update candidate status in campaign
      const updatedCandidates = campaign.candidates.map(c => {
        if (c.id === candidateId) {
          return {
            ...c,
            status: newStatus,
            lastInteraction: new Date().toISOString(),
            reviewNotes: note || c.reviewNotes,
            history: [
              ...c.history,
              {
                timestamp: new Date().toISOString(),
                status: newStatus,
                note: note,
              }
            ]
          };
        }
        return c;
      });

      // Update campaign in Firestore
      const campaignRef = doc(db, 'campaigns', campaign.id);
      await updateDoc(campaignRef, {
        candidates: updatedCandidates,
        updatedAt: new Date().toISOString(),
      });

      // Update local state
      onUpdateCampaign({
        ...campaign,
        candidates: updatedCandidates,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error updating candidate status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: 'active' | 'paused' | 'draft') => {
    setLoading(true);
    try {
      // Update campaign in Firestore
      const campaignRef = doc(db, 'campaigns', campaign.id);
      await updateDoc(campaignRef, {
        status: newStatus,
        updatedAt: new Date().toISOString(),
      });

      // Update local state
      onUpdateCampaign({
        ...campaign,
        status: newStatus,
        updatedAt: new Date().toISOString(),
      });

      // Show success notification
      const statusMessages = {
        active: 'Campaña activada correctamente',
        paused: 'Campaña pausada correctamente',
        draft: 'Campaña guardada como borrador'
      };
      toast.success(statusMessages[newStatus]);
    } catch (error) {
      console.error('Error updating campaign status:', error);
      toast.error('Error al actualizar el estado de la campaña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-[90vw] h-[90vh] flex flex-col overflow-hidden">
        <CampaignHeader 
          campaign={campaign} 
          onClose={onClose} 
          onStatusChange={handleStatusChange}
        />

        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="overview">Resumen</TabsTrigger>
                <TabsTrigger value="candidates">Candidatos</TabsTrigger>
                <TabsTrigger value="workflow">Flujo de trabajo</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <div className="space-y-6">
                  <CampaignMetrics campaign={campaign} />
                </div>
              </TabsContent>

              <TabsContent value="candidates">
                <CampaignCandidates
                  candidates={campaign.candidates}
                  onStatusChange={handleCandidateStatusChange}
                  loading={loading}
                />
              </TabsContent>

              <TabsContent value="workflow">
                <CampaignWorkflowSection campaign={campaign} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}

