import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Save } from 'lucide-react';
import { toast } from 'react-toastify';

export function CompanyInfo() {
  const [companyInfo, setCompanyInfo] = useState({
    name: '',
    description: '',
    values: '',
  });

  useEffect(() => {
    fetchCompanyInfo();
  }, []);

  const fetchCompanyInfo = async () => {
    const docRef = doc(db, 'companyInfo', 'main');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      setCompanyInfo(docSnap.data() as typeof companyInfo);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCompanyInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await setDoc(doc(db, 'companyInfo', 'main'), companyInfo);
      toast.success('Información de la compañía actualizada con éxito');
    } catch (error) {
      console.error('Error al guardar la información de la compañía:', error);
      toast.error('Error al guardar la información de la compañía');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Nombre de la compañía
        </label>
        <input
          type="text"
          name="name"
          id="name"
          value={companyInfo.name}
          onChange={handleInputChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500"
        />
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Descripción de la compañía
        </label>
        <textarea
          name="description"
          id="description"
          rows={4}
          value={companyInfo.description}
          onChange={handleInputChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500"
        ></textarea>
      </div>
      <div>
        <label htmlFor="values" className="block text-sm font-medium text-gray-700">
          Valores de la compañía
        </label>
        <textarea
          name="values"
          id="values"
          rows={4}
          value={companyInfo.values}
          onChange={handleInputChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500"
        ></textarea>
      </div>
      <div>
        <button
          type="submit"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          <Save className="mr-2 -ml-1 h-5 w-5" aria-hidden="true" />
          Guardar cambios
        </button>
      </div>
    </form>
  );
}