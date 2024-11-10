import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Eye, Edit2, Trash2, FileText, CheckCircle, Clock, XCircle } from 'lucide-react';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import { HiringProcess } from '../../types';
import { HiringDetails } from './HiringDetails';
import { NewHiringProcess } from './NewHiringProcess';
import { toast } from 'react-toastify';

export function HiringList() {
  const [hiringProcesses, setHiringProcesses] = useState<HiringProcess[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<HiringProcess['status'] | ''>('');
  const [selectedProcess, setSelectedProcess] = useState<HiringProcess | null>(null);
  const [isNewProcessModalOpen, setIsNewProcessModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchHiringProcesses();
  }, []);

  const fetchHiringProcesses = async () => {
    try {
      const processesCollection = collection(db, 'hiringProcesses');
      const processesSnapshot = await getDocs(processesCollection);
      const processesList = processesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as HiringProcess));
      setHiringProcesses(processesList);
    } catch (error) {
      console.error('Error fetching hiring processes:', error);
      toast.error('Error al cargar los procesos de contratación');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProcess = async (processId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este proceso de contratación?')) {
      try {
        await deleteDoc(doc(db, 'hiringProcesses', processId));
        setHiringProcesses(hiringProcesses.filter(process => process.id !== processId));
        toast.success('Proceso de contratación eliminado con éxito');
      } catch (error) {
        console.error('Error deleting hiring process:', error);
        toast.error('Error al eliminar el proceso de contratación');
      }
    }
  };

  const getStatusIcon = (status: HiringProcess['status']) => {
    switch (status) {
      case 'hired':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'pending_offer':
      case 'offer_sent':
      case 'contract_pending':
      case 'contract_sent':
        return <Clock className="text-yellow-500" size={20} />;
      case 'rejected':
        return <XCircle className="text-red-500" size={20} />;
      default:
        return null;
    }
  };

  const getStatusText = (status: HiringProcess['status']) => {
    switch (status) {
      case 'pending_offer':
        return 'Pendiente de oferta';
      case 'offer_sent':
        return 'Oferta enviada';
      case 'offer_accepted':
        return 'Oferta aceptada';
      case 'contract_pending':
        return 'Contrato pendiente';
      case 'contract_sent':
        return 'Contrato enviado';
      case 'hired':
        return 'Contratado';
      case 'rejected':
        return 'Rechazado';
      default:
        return status;
    }
  };

  const filteredProcesses = hiringProcesses.filter(process =>
    (process.candidateId.toLowerCase().includes(searchTerm.toLowerCase()) ||
     process.candidatureId.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (!filterStatus || process.status === filterStatus)
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Procesos de Contratación</h2>
        <button
          onClick={() => setIsNewProcessModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full transition duration-300 flex items-center"
        >
          <Plus className="mr-2" size={20} />
          Nuevo Proceso
        </button>
      </div>

      <div className="mb-6 flex items-center space-x-4">
        <div className="flex-grow">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar procesos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          </div>
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as HiringProcess['status'] | '')}
          className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todos los estados</option>
          <option value="pending_offer">Pendiente de oferta</option>
          <option value="offer_sent">Oferta enviada</option>
          <option value="offer_accepted">Oferta aceptada</option>
          <option value="contract_pending">Contrato pendiente</option>
          <option value="contract_sent">Contrato enviado</option>
          <option value="hired">Contratado</option>
          <option value="rejected">Rechazado</option>
        </select>
      </div>

      {isLoading ? (
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando procesos de contratación...</p>
        </div>
      ) : filteredProcesses.length === 0 ? (
        <div className="text-center py-10">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay procesos de contratación</h3>
          <p className="mt-1 text-sm text-gray-500">Comienza creando un nuevo proceso de contratación.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProcesses.map((process) => (
            <div key={process.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {process.candidateId}
                    </h3>
                    <p className="text-sm text-gray-600">{process.candidatureId}</p>
                  </div>
                  <div className="flex items-center">
                    {getStatusIcon(process.status)}
                    <span className="ml-2 text-sm font-medium">
                      {getStatusText(process.status)}
                    </span>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-600">
                    Fecha de inicio: {new Date(process.startDate).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600">
                    Salario: {process.salary}
                  </p>
                </div>
              </div>
              <div className="px-6 py-4 bg-gray-50 flex justify-between">
                <button
                  onClick={() => setSelectedProcess(process)}
                  className="text-blue-600 hover:text-blue-800"
                  title="Ver detalles"
                >
                  <Eye size={20} />
                </button>
                <button
                  onClick={() => handleDeleteProcess(process.id)}
                  className="text-red-600 hover:text-red-800"
                  title="Eliminar"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isNewProcessModalOpen && (
        <NewHiringProcess
          isOpen={isNewProcessModalOpen}
          onClose={() => setIsNewProcessModalOpen(false)}
          onProcessCreated={(newProcess) => {
            setHiringProcesses([...hiringProcesses, newProcess]);
            setIsNewProcessModalOpen(false);
          }}
        />
      )}

      {selectedProcess && (
        <HiringDetails
          process={selectedProcess}
          onClose={() => setSelectedProcess(null)}
          onUpdate={(updatedProcess) => {
            setHiringProcesses(hiringProcesses.map(p =>
              p.id === updatedProcess.id ? updatedProcess : p
            ));
            setSelectedProcess(null);
          }}
        />
      )}
    </div>
  );
}