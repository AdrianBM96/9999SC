import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Department } from '../../types';
import { Plus, Trash2, X } from 'lucide-react';
import { toast } from 'react-toastify';

export function DepartmentManagement() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [newDepartment, setNewDepartment] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    const departmentsCollection = collection(db, 'departments');
    const departmentsSnapshot = await getDocs(departmentsCollection);
    const departmentsList = departmentsSnapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name }));
    setDepartments(departmentsList);
  };

  const handleAddDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newDepartment.trim()) {
      try {
        const docRef = await addDoc(collection(db, 'departments'), { name: newDepartment.trim() });
        setDepartments([...departments, { id: docRef.id, name: newDepartment.trim() }]);
        setNewDepartment('');
        setIsModalOpen(false);
        toast.success('Departamento añadido con éxito');
      } catch (error) {
        console.error('Error al añadir departamento:', error);
        toast.error('Error al añadir departamento');
      }
    }
  };

  const handleDeleteDepartment = async (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este departamento?')) {
      try {
        await deleteDoc(doc(db, 'departments', id));
        setDepartments(departments.filter(dept => dept.id !== id));
        toast.success('Departamento eliminado con éxito');
      } catch (error) {
        console.error('Error al eliminar departamento:', error);
        toast.error('Error al eliminar departamento');
      }
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Gestión de Departamentos</h3>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center"
        >
          <Plus size={20} className="mr-2" />
          Añadir Departamento
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {departments.map((dept) => (
          <div key={dept.id} className="bg-gray-100 rounded-lg p-4 flex justify-between items-center">
            <span className="font-medium">{dept.name}</span>
            <button
              onClick={() => handleDeleteDepartment(dept.id)}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 size={20} />
            </button>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Añadir Nuevo Departamento</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleAddDepartment}>
              <div className="mb-4">
                <label htmlFor="departmentName" className="block text-sm font-medium text-gray-700">
                  Nombre del Departamento
                </label>
                <input
                  type="text"
                  id="departmentName"
                  value={newDepartment}
                  onChange={(e) => setNewDepartment(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500"
                  required
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="mr-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Añadir
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}