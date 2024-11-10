import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, Plus, Search, Filter, Eye, Trash2, MessageSquare } from 'lucide-react';
import { collection, getDocs, query, where, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import { DetailedLinkedInProfile, Candidature } from '../../types';
import { ScheduleInterviewModal } from './ScheduleInterviewModal';
import { InterviewDetails } from './InterviewDetails';
import { toast } from 'react-toastify';

interface Interview {
  id: string;
  candidateId: string;
  candidatureId: string;
  date: string;
  duration: number;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  questions?: string[];
  feedback?: string;
  calendarEventId?: string;
}

export function Interviews() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [candidates, setCandidates] = useState<DetailedLinkedInProfile[]>([]);
  const [candidatures, setCandidatures] = useState<Candidature[]>([]);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<Interview['status'] | ''>('');

  useEffect(() => {
    fetchInterviews();
    fetchCandidates();
    fetchCandidatures();
  }, []);

  const fetchInterviews = async () => {
    try {
      const interviewsCollection = collection(db, 'interviews');
      const interviewsSnapshot = await getDocs(interviewsCollection);
      const interviewsList = interviewsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Interview));
      setInterviews(interviewsList);
    } catch (error) {
      console.error('Error fetching interviews:', error);
      toast.error('Error al cargar las entrevistas');
    }
  };

  const fetchCandidates = async () => {
    try {
      const candidatesCollection = collection(db, 'savedCandidates');
      const candidatesSnapshot = await getDocs(candidatesCollection);
      const candidatesList = candidatesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
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

  const handleDeleteInterview = async (interviewId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta entrevista?')) {
      try {
        await deleteDoc(doc(db, 'interviews', interviewId));
        setInterviews(interviews.filter(interview => interview.id !== interviewId));
        toast.success('Entrevista eliminada con éxito');
      } catch (error) {
        console.error('Error deleting interview:', error);
        toast.error('Error al eliminar la entrevista');
      }
    }
  };

  const getStatusColor = (status: Interview['status']) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: Interview['status']) => {
    switch (status) {
      case 'scheduled':
        return 'Programada';
      case 'completed':
        return 'Completada';
      case 'cancelled':
        return 'Cancelada';
      default:
        return status;
    }
  };

  const filteredInterviews = interviews.filter(interview => {
    const candidate = candidates.find(c => c.id === interview.candidateId);
    const candidature = candidatures.find(c => c.id === interview.candidatureId);
    
    return (
      (!searchTerm || 
        candidate?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidature?.title.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (!filterStatus || interview.status === filterStatus)
    );
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Entrevistas</h2>
        <button
          onClick={() => setIsScheduleModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full transition duration-300 flex items-center"
        >
          <Plus className="mr-2" size={20} />
          Programar Entrevista
        </button>
      </div>

      <div className="mb-6 flex items-center space-x-4">
        <div className="flex-grow">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar entrevistas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          </div>
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as Interview['status'] | '')}
          className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todos los estados</option>
          <option value="scheduled">Programadas</option>
          <option value="completed">Completadas</option>
          <option value="cancelled">Canceladas</option>
        </select>
      </div>

      <div className="bg-white shadow-xl rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Candidato
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Candidatura
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha y Hora
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duración
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInterviews.map((interview) => {
                const candidate = candidates.find(c => c.id === interview.candidateId);
                const candidature = candidatures.find(c => c.id === interview.candidatureId);

                return (
                  <tr key={interview.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img
                            className="h-10 w-10 rounded-full"
                            src={candidate?.profile_picture_url || 'https://via.placeholder.com/40'}
                            alt=""
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {candidate?.name || 'Candidato no encontrado'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {candidate?.headline || ''}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {candidature?.title || 'Candidatura no encontrada'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(interview.date).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {interview.duration} minutos
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(interview.status)}`}>
                        {getStatusText(interview.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setSelectedInterview(interview)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                        title="Ver detalles"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteInterview(interview.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Eliminar"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {isScheduleModalOpen && (
        <ScheduleInterviewModal
          isOpen={isScheduleModalOpen}
          onClose={() => setIsScheduleModalOpen(false)}
          onInterviewScheduled={(newInterview) => {
            setInterviews([...interviews, newInterview]);
            setIsScheduleModalOpen(false);
          }}
          candidates={candidates}
          candidatures={candidatures}
        />
      )}

      {selectedInterview && (
        <InterviewDetails
          interview={selectedInterview}
          onClose={() => setSelectedInterview(null)}
          onUpdate={(updatedInterview) => {
            setInterviews(interviews.map(i => 
              i.id === updatedInterview.id ? updatedInterview : i
            ));
            setSelectedInterview(null);
          }}
          candidate={candidates.find(c => c.id === selectedInterview.candidateId)}
          candidature={candidatures.find(c => c.id === selectedInterview.candidatureId)}
        />
      )}
    </div>
  );
}