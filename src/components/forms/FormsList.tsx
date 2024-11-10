import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Eye, Edit, Trash2, FileText, BarChart } from 'lucide-react';
import { collection, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { RecruitmentForm } from '../../types';
import { FormEditor } from './FormEditor';
import { FormPreview } from './FormPreview';
import { FormStats } from './FormStats';
import { toast } from 'react-toastify';

export function FormsList() {
  const [forms, setForms] = useState<RecruitmentForm[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedForm, setSelectedForm] = useState<RecruitmentForm | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    try {
      const formsCollection = collection(db, 'recruitmentForms');
      const formsSnapshot = await getDocs(formsCollection);
      const formsList = formsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as RecruitmentForm));
      setForms(formsList);
    } catch (error) {
      console.error('Error fetching forms:', error);
      toast.error('Error al cargar los formularios');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteForm = async (formId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este formulario?')) {
      try {
        await deleteDoc(doc(db, 'recruitmentForms', formId));
        setForms(forms.filter(form => form.id !== formId));
        toast.success('Formulario eliminado con éxito');
      } catch (error) {
        console.error('Error deleting form:', error);
        toast.error('Error al eliminar el formulario');
      }
    }
  };

  const handleToggleStatus = async (form: RecruitmentForm) => {
    try {
      const newStatus = form.status === 'active' ? 'inactive' : 'active';
      await updateDoc(doc(db, 'recruitmentForms', form.id), {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
      setForms(forms.map(f => 
        f.id === form.id ? { ...f, status: newStatus } : f
      ));
      toast.success(`Formulario ${newStatus === 'active' ? 'activado' : 'desactivado'} con éxito`);
    } catch (error) {
      console.error('Error toggling form status:', error);
      toast.error('Error al cambiar el estado del formulario');
    }
  };

  const filteredForms = forms.filter(form =>
    form.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    form.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Formularios de Reclutamiento</h2>
        <button
          onClick={() => {
            setSelectedForm(null);
            setIsEditing(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full transition duration-300 flex items-center"
        >
          <Plus className="mr-2" size={20} />
          Nuevo Formulario
        </button>
      </div>

      <div className="mb-6 flex items-center space-x-4">
        <div className="flex-grow">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar formularios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando formularios...</p>
        </div>
      ) : filteredForms.length === 0 ? (
        <div className="text-center py-10">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay formularios</h3>
          <p className="mt-1 text-sm text-gray-500">Comienza creando un nuevo formulario de reclutamiento.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredForms.map((form) => (
            <div key={form.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold text-gray-900">{form.title}</h3>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    form.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {form.status === 'active' ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
                <p className="mt-2 text-sm text-gray-600">{form.description}</p>
                <div className="mt-4 flex items-center text-sm text-gray-500">
                  <FileText className="mr-2" size={16} />
                  {form.fields.length} campos
                  <BarChart className="ml-4 mr-2" size={16} />
                  {form.submissions} respuestas
                </div>
              </div>
              <div className="px-6 py-4 bg-gray-50 flex justify-between">
                <div className="space-x-2">
                  <button
                    onClick={() => {
                      setSelectedForm(form);
                      setIsPreviewOpen(true);
                    }}
                    className="text-blue-600 hover:text-blue-800"
                    title="Vista previa"
                  >
                    <Eye size={20} />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedForm(form);
                      setIsEditing(true);
                    }}
                    className="text-green-600 hover:text-green-800"
                    title="Editar"
                  >
                    <Edit size={20} />
                  </button>
                  <button
                    onClick={() => handleDeleteForm(form.id)}
                    className="text-red-600 hover:text-red-800"
                    title="Eliminar"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
                <button
                  onClick={() => {
                    setSelectedForm(form);
                    setIsStatsOpen(true);
                  }}
                  className="text-purple-600 hover:text-purple-800"
                  title="Estadísticas"
                >
                  <BarChart size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isEditing && (
        <FormEditor
          form={selectedForm}
          onClose={() => setIsEditing(false)}
          onSave={(newForm) => {
            if (selectedForm) {
              setForms(forms.map(f => f.id === newForm.id ? newForm : f));
            } else {
              setForms([...forms, newForm]);
            }
            setIsEditing(false);
          }}
        />
      )}

      {isPreviewOpen && selectedForm && (
        <FormPreview
          form={selectedForm}
          onClose={() => setIsPreviewOpen(false)}
        />
      )}

      {isStatsOpen && selectedForm && (
        <FormStats
          form={selectedForm}
          onClose={() => setIsStatsOpen(false)}
        />
      )}
    </div>
  );
}