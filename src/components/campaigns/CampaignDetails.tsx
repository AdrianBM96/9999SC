import React, { useState } from 'react';
import { Campaign, CandidateStatus } from '../../types/campaign';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { CampaignHeader } from './detail-sections/CampaignHeader';
import { OverviewSection } from './detail-sections/overview/OverviewSection';
import { CampaignCandidates } from './CampaignCandidates';
import { EvaluationSection } from './detail-sections/evaluation';
import { CampaignWorkflowSection } from './detail-sections/CampaignWorkflowSection';
import { TasksSection } from './detail-sections/tasks/TasksSection';
import { toast } from 'react-toastify';

interface CampaignDetailsProps {
  campaign: Campaign;
  onClose: () => void;
  onUpdateCampaign: (campaign: Campaign) => void;
}

export function CampaignDetails({ campaign, onClose, onUpdateCampaign }: CampaignDetailsProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const tabs = [
    { value: 'overview', label: 'Resumen' },
    { value: 'candidates', label: 'Candidatos' },
    { value: 'tasks', label: 'Tareas' },
    { value: 'evaluation', label: 'Evaluación' },
    { value: 'workflow', label: 'Flujo de trabajo' }
  ];

  const handleCandidateStatusChange = async (candidateId: string, newStatus: CandidateStatus, note?: string) => {
    setLoading(true);
    try {
      const updatedCandidates = campaign.candidates?.map(c => {
        if (c.id === candidateId) {
          // Update metrics based on status change
          const newMetrics = { ...campaign.metrics };
          
          if (newStatus === 'selected' && c.status !== 'selected') {
            newMetrics.selected += 1;
          } else if (c.status === 'selected' && newStatus !== 'selected') {
            newMetrics.selected = Math.max(0, newMetrics.selected - 1);
          }
          
          if (newStatus === 'rejected' && c.status !== 'rejected') {
            newMetrics.rejected += 1;
          } else if (c.status === 'rejected' && newStatus !== 'rejected') {
            newMetrics.rejected = Math.max(0, newMetrics.rejected - 1);
          }
          
          if (newStatus === 'interview_scheduled' && c.status !== 'interview_scheduled') {
            newMetrics.interviews_scheduled += 1;
          } else if (c.status === 'interview_scheduled' && newStatus !== 'interview_scheduled') {
            newMetrics.interviews_scheduled = Math.max(0, newMetrics.interviews_scheduled - 1);
          }

          return {
            ...c,
            status: newStatus,
            lastInteraction: new Date().toISOString(),
            reviewNotes: note ? (c.reviewNotes ? `${c.reviewNotes}\n${note}` : note) : c.reviewNotes,
            history: [
              {
                timestamp: new Date().toISOString(),
                status: newStatus,
                note: note,
              },
              ...c.history
            ],
            // Reset evaluation flags based on status
            interviewEvaluated: newStatus === 'interview_completed' ? false : c.interviewEvaluated,
            finalDecisionMade: ['selected', 'rejected'].includes(newStatus) ? true : c.finalDecisionMade
          };
        }
        return c;
      }) || [];

      const updates = {
        candidates: updatedCandidates,
        metrics: campaign.metrics,
        updatedAt: new Date().toISOString(),
      };

      await updateDoc(doc(db, 'campaigns', campaign.id), updates);

      onUpdateCampaign({
        ...campaign,
        ...updates
      });

      toast.success('Estado del candidato actualizado');
    } catch (error) {
      console.error('Error updating candidate status:', error);
      toast.error('Error al actualizar el estado del candidato');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEvaluation = async (candidateId: string, evaluation: { score: number; notes: string; }) => {
    setLoading(true);
    try {
      const updatedCandidates = campaign.candidates?.map(c => {
        if (c.id === candidateId) {
          const newEvaluationEntry = {
            type: 'human' as const,
            score: evaluation.score,
            notes: evaluation.notes,
            timestamp: new Date().toISOString(),
          };

          // Update form score if it's a form evaluation
          const isFormEvaluation = !c.formEvaluated && c.formSubmitted;
          const isInterviewEvaluation = !c.interviewEvaluated && c.status === 'interview_completed';

          const updates = {
            ...c,
            evaluationHistory: [
              newEvaluationEntry,
              ...(c.evaluationHistory || [])
            ]
          };

          if (isFormEvaluation) {
            updates.formScore = evaluation.score;
            updates.formEvaluated = true;
          }

          if (isInterviewEvaluation) {
            updates.interviewEvaluated = true;
          }

          // Suggest next status based on score
          if (evaluation.score >= 8) {
            toast.info('Puntuación alta: Considere programar una entrevista o seleccionar al candidato');
          } else if (evaluation.score <= 4) {
            toast.info('Puntuación baja: Considere rechazar al candidato');
          }

          return updates;
        }
        return c;
      }) || [];

      const updates = {
        candidates: updatedCandidates,
        updatedAt: new Date().toISOString(),
      };

      await updateDoc(doc(db, 'campaigns', campaign.id), updates);

      onUpdateCampaign({
        ...campaign,
        ...updates
      });

      toast.success('Evaluación actualizada correctamente');
    } catch (error) {
      console.error('Error updating evaluation:', error);
      toast.error('Error al actualizar la evaluación');
    } finally {
      setLoading(false);
    }
  };

  const handleTaskComplete = async (taskId: string) => {
    setLoading(true);
    try {
      const [taskType, candidateId] = taskId.split('-');
      const updatedCandidates = campaign.candidates?.map(c => {
        if (candidateId === c.id) {
          const updates = {
            ...c,
            lastInteraction: new Date().toISOString(),
          };

          switch (taskType) {
            case 'cv':
              updates.cvReviewed = true;
              if (!c.formSubmitted) {
                toast.info('CV revisado. Considere solicitar el formulario de evaluación al candidato.');
              }
              break;

            case 'form':
              updates.formEvaluated = true;
              if (c.formScore && c.formScore >= 7 && c.status === 'form_submitted') {
                toast.info('Formulario evaluado con buena puntuación. Considere programar una entrevista.');
              }
              break;

            case 'interview':
              updates.interviewEvaluated = true;
              if (c.status === 'interview_completed' && !c.finalDecisionMade) {
                toast.info('Entrevista evaluada. Por favor, tome una decisión final sobre el candidato.');
              }
              break;

            case 'decision':
              updates.finalDecisionMade = true;
              if (!['selected', 'rejected'].includes(c.status)) {
                toast.info('Por favor, actualice el estado del candidato a "Seleccionado" o "Rechazado".');
              }
              break;
          }

          // Update candidate's history
          updates.history = [
            {
              timestamp: new Date().toISOString(),
              status: c.status,
              note: `Tarea completada: ${taskType === 'cv' ? 'Revisión de CV' : 
                                       taskType === 'form' ? 'Evaluación de formulario' :
                                       taskType === 'interview' ? 'Evaluación de entrevista' :
                                       'Decisión final'}`
            },
            ...c.history
          ];

          return updates;
        }
        return c;
      }) || [];

      const updates = {
        candidates: updatedCandidates,
        updatedAt: new Date().toISOString(),
      };

      await updateDoc(doc(db, 'campaigns', campaign.id), updates);

      onUpdateCampaign({
        ...campaign,
        ...updates
      });

      toast.success('Tarea completada con éxito');
    } catch (error) {
      console.error('Error completing task:', error);
      toast.error('Error al completar la tarea');
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
        />

        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="overview">Resumen</TabsTrigger>
                <TabsTrigger value="candidates">Candidatos</TabsTrigger>
                <TabsTrigger value="tasks">Tareas</TabsTrigger>
                <TabsTrigger value="evaluation" disabled={!selectedCandidateId}>
                  Evaluación
                </TabsTrigger>
                <TabsTrigger value="workflow">Flujo de trabajo</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <OverviewSection campaign={campaign} />
              </TabsContent>

              <TabsContent value="candidates">
                <CampaignCandidates
                  candidates={campaign.candidates}
                  onStatusChange={handleCandidateStatusChange}
                  onSelectCandidate={setSelectedCandidateId}
                  selectedCandidateId={selectedCandidateId}
                  loading={loading}
                />
              </TabsContent>

              <TabsContent value="tasks">
                <TasksSection
                  campaign={campaign}
                  candidateId={selectedCandidateId!}
                  onTaskComplete={handleTaskComplete}
                />
              </TabsContent>

              <TabsContent value="evaluation">
                {selectedCandidateId && (
                  <EvaluationSection
                    campaign={campaign}
                    candidateId={selectedCandidateId}
                    onUpdateEvaluation={(evaluation) => 
                      handleUpdateEvaluation(selectedCandidateId, evaluation)
                    }
                  />
                )}
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

