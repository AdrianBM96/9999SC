import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader, Users, BriefcaseIcon } from 'lucide-react';
import CampaignWorkflowEditor from './CampaignWorkflowEditor';
import { getCandidature, getAllCandidatures, getCandidatesForCampaign } from '../../services/candidatureService';
import { toast } from 'react-toastify';
import { db } from '../../firebase';
import { collection, addDoc } from 'firebase/firestore';

interface CandidateCount {
  total: number;
  selected: number;
}

interface Candidature {
  id: string;
  title: string;
  description: string;
  candidateCount?: number;
}

export function NewCampaignForm() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCandidature, setSelectedCandidature] = useState<string>('');
  const [candidateCount, setCandidateCount] = useState<CandidateCount>({ total: 0, selected: 0 });
  const [candidatures, setCandidatures] = useState<Candidature[]>([]);
  const [candidateLimit, setCandidateLimit] = useState<number | ''>('');
  const [campaignName, setCampaignName] = useState('');
  const [campaignDescription, setCampaignDescription] = useState('');

  useEffect(() => {
    const loadCandidatures = async () => {
      setIsLoading(true);
      try {
        const data = await getAllCandidatures();
        setCandidatures(data.filter(c => c.status === 'active'));
      } catch (error) {
        console.error('Error loading candidatures:', error);
        toast.error('Failed to load candidatures. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadCandidatures();
  }, []);

  useEffect(() => {
    const updateCandidateCount = async () => {
      if (!selectedCandidature) {
        setCandidateCount({ total: 0, selected: 0 });
        return;
      }

      try {
        // Get total candidates
        const details = await getCandidature(selectedCandidature);
        const total = details.candidateCount || 0;

        // Get selected candidates based on limit
        const selectedCandidates = await getCandidatesForCampaign(
          selectedCandidature,
          candidateLimit ? Number(candidateLimit) : undefined
        );

        setCandidateCount({
          total,
          selected: selectedCandidates.length
        });
      } catch (error) {
        console.error('Error fetching candidate count:', error);
        toast.error('Failed to update candidate count');
      }
    };

    updateCandidateCount();
  }, [selectedCandidature, candidateLimit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCandidature || !campaignName) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);

    try {
      // Get selected candidates
      const candidates = await getCandidatesForCampaign(
        selectedCandidature,
        candidateLimit ? Number(candidateLimit) : undefined
      );

      if (candidates.length === 0) {
        toast.error('No candidates available for this campaign');
        setIsLoading(false);
        return;
      }

      // Get candidature details for reference
      const candidature = await getCandidature(selectedCandidature);

      const campaign = {
        name: campaignName,
        description: campaignDescription || `Campaign for ${candidature.title}`,
        candidatureId: selectedCandidature,
        candidatureTitle: candidature.title,
        candidateCount: candidates.length,
        candidateLimit: Number(candidateLimit) || undefined,
        candidates: candidates.map(c => ({
          id: c.id,
          name: c.name,
          email: c.email,
          status: 'pending'
        })),
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Create campaign in Firestore
      const campaignRef = collection(db, 'campaigns');
      await addDoc(campaignRef, campaign);

      toast.success('Campaign created successfully');
      navigate('/campaigns');
    } catch (error) {
      console.error('Error creating campaign:', error);
      toast.error('Failed to create campaign. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create New Campaign</h1>
        <p className="mt-2 text-gray-600">
          Set up your campaign details and workflow to start engaging with candidates.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <BriefcaseIcon className="mr-2 h-5 w-5 text-gray-500" />
              Campaign Details
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Campaign Name
                </label>
                <input
                  type="text"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="e.g., Q4 Developer Outreach"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={campaignDescription}
                  onChange={(e) => setCampaignDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Brief description of the campaign's purpose..."
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Users className="mr-2 h-5 w-5 text-gray-500" />
              Candidate Selection
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Candidature
                </label>
                <select
                  value={selectedCandidature}
                  onChange={(e) => setSelectedCandidature(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                >
                  <option value="">Choose a candidature...</option>
                  {candidatures.map((candidature) => (
                    <option key={candidature.id} value={candidature.id}>
                      {candidature.title} ({candidature.candidateCount || 0} candidates)
                    </option>
                  ))}
                </select>
              </div>

              {selectedCandidature && (
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Available Candidates: {candidateCount.total}
                      </p>
                      <p className="text-sm text-gray-500">
                        Selected: {candidateCount.selected}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <label className="text-sm font-medium text-gray-700">
                        Limit to:
                      </label>
                      <input
                        type="number"
                        min="1"
                        max={candidateCount.total}
                        value={candidateLimit}
                        onChange={(e) => setCandidateLimit(Number(e.target.value) || '')}
                        className="w-24 px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="No limit"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Campaign Workflow</h2>
          <CampaignWorkflowEditor />
        </div>
      </div>

      <div className="mt-8 flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => navigate('/campaigns')}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          onClick={handleSubmit}
          disabled={isLoading || !selectedCandidature || !campaignName}
          className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
            ${isLoading || !selectedCandidature || !campaignName
              ? 'bg-indigo-400 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
            }`}
        >
          {isLoading ? (
            <>
              <Loader className="animate-spin -ml-1 mr-2 h-4 w-4 inline" />
              Creating...
            </>
          ) : (
            'Create Campaign'
          )}
        </button>
      </div>
    </div>
  );
}