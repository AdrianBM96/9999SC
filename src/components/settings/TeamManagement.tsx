import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Plus, Trash2, Mail } from 'lucide-react';
import { toast } from 'react-toastify';

interface TeamMember {
  id: string;
  email: string;
  role: string;
}

export function TeamManagement() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [newMember, setNewMember] = useState({ email: '', role: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    const teamCollection = collection(db, 'team');
    const teamSnapshot = await getDocs(teamCollection);
    const teamList = teamSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TeamMember));
    setTeamMembers(teamList);
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMember.email && newMember.role) {
      try {
        const docRef = await addDoc(collection(db, 'team'), newMember);
        setTeamMembers([...teamMembers, { id: docRef.id, ...newMember }]);
        setNewMember({ email: '', role: '' });
        setIsModalOpen(false);
        toast.success('Miembro del equipo añadido con éxito');
      } catch (error) {
        console.error('Error al añadir miembro del equipo:', error);
        toast.error('Error al añadir miembro del equipo');
      }
    }
  };

  const handleDeleteMember = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'team', id));
      setTeamMembers(teamMembers.filter(member => member.id !== id));
      toast.success('Miembro del equipo eliminado con éxito');
    } catch (error) {
      console.error('Error al eliminar miembro del equipo:', error);
      toast.error('Error al eliminar miembro del equipo');
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Gestión del Equipo de RRHH</h3>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center"
        >
          <Plus size={20} className="mr-2" />
          Invitar miembro
        </button>
      </div>
      <ul className="divide-y divide-gray-200">
        {teamMembers.map((member) => (
          <li key={member.id} className="py-4 flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-gray-900">{member.email}</p>
              <p className="text-sm text-gray-500">{member.role}</p>
            </div>
            <button
              onClick={() => handleDeleteMember(member.id)}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 size={20} />
            </button>
          </li>
        ))}
      </ul>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Invitar nuevo miembro</h3>
            <form onSubmit={handleAddMember}>
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Correo electrónico
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    className="focus:ring-red-500 focus:border-red-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                    placeholder="correo@ejemplo.com"
                    value={newMember.email}
                    onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="mb-4">
                <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                  Rol
                </label>
                <select
                  id="role"
                  name="role"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md"
                  value={newMember.role}
                  onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                  required
                >
                  <option value="">Seleccionar rol</option>
                  <option value="Administrador">Administrador</option>
                  <option value="Reclutador">Reclutador</option>
                  <option value="Asistente">Asistente</option>
                </select>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  className="mr-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Invitar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}