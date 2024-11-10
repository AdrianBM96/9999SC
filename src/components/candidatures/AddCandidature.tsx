import React, { useState } from 'react';
import { X, Briefcase, MapPin, Calendar, GraduationCap, Globe, Wrench, Users, Sparkles } from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Candidature, Department } from '../../types';
import { generateJobDescription, generateSalaryRange, generateMarketDemand } from '../../services/ai';
import { toast } from 'react-toastify';

interface AddCandidatureProps {
  isOpen: boolean;
  onClose: () => void;
  onCandidatureAdded: (candidature: Candidature) => void;
  departments: Department[];
}

export function AddCandidature({ isOpen, onClose, onCandidatureAdded, departments }: AddCandidatureProps) {
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    jobType: '',
    contractType: '',
    experience: '',
    department: '',
    education: [] as string[],
    languages: [] as string[],
    skills: [] as string[],
    tempInput: { education: '', languages: '', skills: '' }
  });

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleArrayInputChange = (field: 'education' | 'languages' | 'skills') => {
    if (formData.tempInput[field].trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], prev.tempInput[field].trim()],
        tempInput: { ...prev.tempInput, [field]: '' }
      }));
    }
  };

  const handleRemoveItem = (field: 'education' | 'languages' | 'skills', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    setIsGenerating(true);
    try {
      const description = await generateJobDescription(formData);
      const salaryRange = await generateSalaryRange(formData.title, formData.location);
      const marketDemand = await generateMarketDemand(formData.title, formData.location);

      const candidature: Omit<Candidature, 'id'> = {
        ...formData,
        description,
        salaryRange,
        marketDemand,
        status: 'No publicada',
        createdAt: new Date().toISOString(),
      } as Omit<Candidature, 'id'>;

      const docRef = await addDoc(collection(db, 'candidatures'), candidature);
      onCandidatureAdded({ ...candidature, id: docRef.id });
      toast.success('Candidatura creada con éxito');
      onClose();
    } catch (error) {
      console.error('Error al crear la candidatura:', error);
      toast.error('Error al crear la candidatura');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {step === 1 ? 'Nueva Oferta' : 'Requisitos del puesto'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {step === 1 ? (
            <div className="space-y-6">
              <div className="bg-blue-50 rounded-lg p-4 flex items-start">
                <Sparkles className="w-5 h-5 text-blue-500 mr-3 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-blue-900">Información básica de la oferta</h4>
                  <p className="text-sm text-blue-700">
                    Introduce los datos principales de la oferta de trabajo.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Título del puesto</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Ubicación</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Tipo de trabajo</label>
                  <select
                    name="jobType"
                    value={formData.jobType}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                    required
                  >
                    <option value="">Seleccionar tipo</option>
                    <option value="Presencial">Presencial</option>
                    <option value="Remoto">Remoto</option>
                    <option value="Híbrido">Híbrido</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Tipo de contrato</label>
                  <select
                    name="contractType"
                    value={formData.contractType}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                    required
                  >
                    <option value="">Seleccionar contrato</option>
                    <option value="Indefinido">Indefinido</option>
                    <option value="Temporal">Temporal</option>
                    <option value="Prácticas">Prácticas</option>
                  </select>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-blue-50 rounded-lg p-4 flex items-start">
                <Sparkles className="w-5 h-5 text-blue-500 mr-3 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-blue-900">Requisitos del puesto</h4>
                  <p className="text-sm text-blue-700">
                    Define los requisitos específicos que necesitas para este puesto.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Experiencia requerida</label>
                  <input
                    type="text"
                    name="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Ej: 3-5 años de experiencia en desarrollo web"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Departamento</label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                    required
                  >
                    <option value="">Seleccionar departamento</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>

                {['education', 'languages', 'skills'].map((field) => (
                  <div key={field}>
                    <label className="block text-sm font-medium text-gray-700 capitalize">
                      {field === 'education' ? 'Formación' : field === 'languages' ? 'Idiomas' : 'Habilidades'}
                    </label>
                    <div className="mt-1 flex space-x-2">
                      <input
                        type="text"
                        value={formData.tempInput[field as keyof typeof formData.tempInput]}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          tempInput: { ...prev.tempInput, [field]: e.target.value }
                        }))}
                        className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                        placeholder={`Añadir ${field === 'education' ? 'formación' : field === 'languages' ? 'idioma' : 'habilidad'}`}
                      />
                      <button
                        type="button"
                        onClick={() => handleArrayInputChange(field as 'education' | 'languages' | 'skills')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        Añadir
                      </button>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {formData[field as keyof typeof formData].map((item: string, index: number) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {item}
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(field as 'education' | 'languages' | 'skills', index)}
                            className="ml-1.5 text-blue-600 hover:text-blue-800"
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-gray-50 flex justify-between rounded-b-lg">
          {step === 2 && (
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Atrás
            </button>
          )}
          {step === 1 ? (
            <button
              onClick={() => setStep(2)}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg ml-auto"
            >
              Siguiente
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isGenerating}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg ml-auto disabled:opacity-50 flex items-center"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generando...
                </>
              ) : (
                'Crear oferta'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}