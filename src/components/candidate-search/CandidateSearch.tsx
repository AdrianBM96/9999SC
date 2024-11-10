import React, { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { DetailedLinkedInProfile, Candidature } from '../../types';
import { CandidateList } from './CandidateList';
import { SearchForm } from './SearchForm';
import { AddCandidateModal } from './AddCandidateModal';
import { CandidateDetailsModal } from './CandidateDetailsModal';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'react-toastify';

interface StatsCardProps {
  title: string;
  total: number;
  subtitle?: string;
}

function StatsCard({ title, total, subtitle }: StatsCardProps) {
  return (
    <div className="bg-white rounded-lg p-4 border border-gray-100">
      <h3 className="text-sm text-gray-600">{title}</h3>
      <div className="mt-2 flex items-baseline">
        <span className="text-2xl font-semibold text-gray-900">{total}</span>
        <span className="text-sm text-gray-500 ml-2">Total</span>
      </div>
      {subtitle && (
        <p className="mt-1 text-sm text-amber-600">{subtitle}</p>
      )}
    </div>
  );
}

export function CandidateSearch() {
  const [candidates, setCandidates] = useState<DetailedLinkedInProfile[]>([]);
  const [candidatures, setCandidatures] = useState<Candidature[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCandidature, setFilterCandidature] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<DetailedLinkedInProfile | null>(null);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  useEffect(() => {
    fetchCandidates();
    fetchCandidatures();
  }, []);

  const fetchCandidates = async () => {
    try {
      const candidatesCollection = collection(db, 'savedCandidates');
      const candidatesSnapshot = await getDocs(candidatesCollection);
      const candidatesList = candidatesSnapshot.docs.map(doc => ({
        ...doc.data(),
        docId: doc.id
      } as DetailedLinkedInProfile));
      setCandidates(candidatesList);
    } catch (error) {
      console.error('Error fetching candidates:', error);
      toast.error('Error al cargar los candidatos');
    }
  };

  const fetchCandidatures = async () => {
    try {
      const candidaturesCollection = collection(db, 'candidatures');
      const candidaturesSnapshot = await getDocs(candidaturesCollection);
      const candidaturesList = candidaturesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Candidature));
      setCandidatures(candidaturesList);
    } catch (error) {
      console.error('Error fetching candidatures:', error);
      toast.error('Error al cargar las candidaturas');
    }
  };

  const handleDeleteCandidate = async (candidateId: string) => {
    if (!candidateId) {
      toast.error('ID de candidato no válido');
      return;
    }

    try {
      // Find the candidate document reference
      const candidateRef = doc(db, 'savedCandidates', candidateId);
      
      // Delete the document from Firestore
      await deleteDoc(candidateRef);
      
      // Update local state
      setCandidates(prevCandidates => 
        prevCandidates.filter(candidate => candidate.docId !== candidateId)
      );
      
      toast.success('Candidato eliminado con éxito');
    } catch (error) {
      console.error('Error deleting candidate:', error);
      toast.error('Error al eliminar el candidato');
    }
  };

  const handleUpdateProfile = async (updatedCandidate: DetailedLinkedInProfile) => {
    setIsUpdatingProfile(true);
    try {
      if (updatedCandidate.docId) {
        await setDoc(doc(db, 'savedCandidates', updatedCandidate.docId), updatedCandidate);
        setCandidates(candidates.map(c => 
          c.docId === updatedCandidate.docId ? updatedCandidate : c
        ));
        toast.success('Perfil actualizado con éxito');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Error al actualizar el perfil');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const filteredCandidates = candidates.filter(candidate =>
    (candidate.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     candidate.headline?.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filterCandidature === '' || candidate.candidatureId === filterCandidature)
  );

  return (
    <div className="px-8 py-6 space-y-6">
      <div className="bg-white rounded-lg p-4">
        <SearchForm
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterCandidature={filterCandidature}
          setFilterCandidature={setFilterCandidature}
          candidatures={candidatures}
          setIsAddModalOpen={setIsAddModalOpen}
        />
      </div>

      <div className="grid grid-cols-7 gap-4">
        <StatsCard title="Nuevos candidatos" total={725} subtitle="15 pendientes" />
        <StatsCard title="En proceso" total={27} />
        <StatsCard title="Ent. telefónica" total={127} />
        <StatsCard title="Ent. presencial" total={212} />
        <StatsCard title="En proceso" total={27} />
        <StatsCard title="Ent. telefónica" total={65} />
        <StatsCard title="Ent. presencial" total={32} />
      </div>

      <div className="bg-white rounded-lg">
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">
              {filteredCandidates.length} resultados | Mostrando 1-25
            </span>
            <div className="flex space-x-2">
              <button className="p-1 text-gray-400 hover:text-gray-600">
                <ChevronLeft size={20} />
              </button>
              <button className="p-1 text-gray-400 hover:text-gray-600">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>

        <CandidateList
          filteredCandidates={filteredCandidates}
          candidatures={candidatures}
          handleViewDetails={(candidate) => setSelectedCandidate(candidate)}
          handleDeleteCandidate={handleDeleteCandidate}
        />
      </div>

      {isAddModalOpen && (
        <AddCandidateModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          candidatures={candidatures}
          onCandidateAdded={() => {
            fetchCandidates();
            setIsAddModalOpen(false);
          }}
        />
      )}

      {selectedCandidate && (
        <CandidateDetailsModal
          isOpen={!!selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
          candidate={selectedCandidate}
          onUpdateProfile={handleUpdateProfile}
          isUpdatingProfile={isUpdatingProfile}
          candidatures={candidatures}
          onDeleteCandidate={handleDeleteCandidate}
        />
      )}
    </div>
  );
}