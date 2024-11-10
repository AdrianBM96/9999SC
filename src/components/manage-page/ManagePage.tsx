import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase';
import { toast } from 'react-toastify';
import { Save, Eye, Upload, ChevronRight, ChevronLeft } from 'lucide-react';

const templates = [
  { id: 'modern', name: 'Moderno', primaryColor: '#3498db' },
  { id: 'classic', name: 'Clásico', primaryColor: '#2ecc71' },
  { id: 'minimalist', name: 'Minimalista', primaryColor: '#34495e' },
];

const initialPageConfig = {
  title: '',
  description: '',
  logoUrl: '',
  bannerUrl: '',
  primaryColor: '#FF4757',
  showCandidatures: true,
  template: 'modern',
};

export function ManagePage() {
  const [pageConfig, setPageConfig] = useState(initialPageConfig);
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);

  useEffect(() => {
    fetchPageConfig();
  }, []);

  const fetchPageConfig = async () => {
    setIsLoading(true);
    try {
      const pageConfigDoc = await getDoc(doc(db, 'pageConfig', 'main'));
      if (pageConfigDoc.exists()) {
        setPageConfig({ ...initialPageConfig, ...pageConfigDoc.data() });
      }
    } catch (error) {
      console.error('Error fetching page config:', error);
      toast.error('Error al cargar la configuración de la página');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPageConfig(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setPageConfig(prev => ({ ...prev, [name]: checked }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'banner') => {
    if (e.target.files && e.target.files[0]) {
      if (type === 'logo') {
        setLogoFile(e.target.files[0]);
      } else {
        setBannerFile(e.target.files[0]);
      }
    }
  };

  const uploadFile = async (file: File, path: string) => {
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  };

  const handleSaveConfig = async () => {
    setIsSaving(true);
    try {
      let updatedConfig = { ...pageConfig };

      if (logoFile) {
        const logoUrl = await uploadFile(logoFile, `logos/${logoFile.name}`);
        updatedConfig.logoUrl = logoUrl;
      }

      if (bannerFile) {
        const bannerUrl = await uploadFile(bannerFile, `banners/${bannerFile.name}`);
        updatedConfig.bannerUrl = bannerUrl;
      }

      await setDoc(doc(db, 'pageConfig', 'main'), updatedConfig);
      setPageConfig(updatedConfig);
      toast.success('Configuración de la página guardada con éxito');
    } catch (error) {
      console.error('Error saving page config:', error);
      toast.error('Error al guardar la configuración de la página');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreview = () => {
    const previewUrl = `/company/preview`;
    window.open(previewUrl, '_blank');
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Paso 1: Selecciona una plantilla</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className={`p-4 border rounded-lg cursor-pointer ${
                    pageConfig.template === template.id ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                  }`}
                  onClick={() => setPageConfig(prev => ({ ...prev, template: template.id, primaryColor: template.primaryColor }))}
                >
                  <h3 className="font-bold">{template.name}</h3>
                  <div className="mt-2 h-20 bg-gray-200" style={{ backgroundColor: template.primaryColor }}></div>
                </div>
              ))}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Paso 2: Información básica</h2>
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">Título de la página</label>
              <input
                type="text"
                id="title"
                name="title"
                value={pageConfig.title}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descripción</label>
              <textarea
                id="description"
                name="description"
                value={pageConfig.description}
                onChange={handleInputChange}
                rows={4}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              ></textarea>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Paso 3: Logo y Banner</h2>
            <div>
              <label htmlFor="logo" className="block text-sm font-medium text-gray-700">Logo (Recomendado: 200x50 px)</label>
              <input
                type="file"
                id="logo"
                onChange={(e) => handleFileChange(e, 'logo')}
                accept="image/*"
                className="mt-1 block w-full"
              />
            </div>
            <div>
              <label htmlFor="banner" className="block text-sm font-medium text-gray-700">Banner (Recomendado: 1200x300 px)</label>
              <input
                type="file"
                id="banner"
                onChange={(e) => handleFileChange(e, 'banner')}
                accept="image/*"
                className="mt-1 block w-full"
              />
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Paso 4: Configuración adicional</h2>
            <div>
              <label htmlFor="primaryColor" className="block text-sm font-medium text-gray-700">Color primario</label>
              <input
                type="color"
                id="primaryColor"
                name="primaryColor"
                value={pageConfig.primaryColor}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="showCandidatures"
                  checked={pageConfig.showCandidatures}
                  onChange={handleCheckboxChange}
                  className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
                <span className="ml-2 text-sm text-gray-700">Mostrar candidaturas en la página pública</span>
              </label>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return <div className="text-center py-10">Cargando configuración de la página...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-xl">
      <h1 className="text-3xl font-bold mb-6">Gestionar Página Pública</h1>
      {renderStep()}
      <div className="mt-8 flex justify-between">
        {step > 1 && (
          <button
            onClick={() => setStep(step - 1)}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 flex items-center"
          >
            <ChevronLeft className="mr-2" size={20} />
            Anterior
          </button>
        )}
        {step < 4 ? (
          <button
            onClick={() => setStep(step + 1)}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 flex items-center ml-auto"
          >
            Siguiente
            <ChevronRight className="ml-2" size={20} />
          </button>
        ) : (
          <div className="flex space-x-4 ml-auto">
            <button
              onClick={handleSaveConfig}
              disabled={isSaving}
              className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 flex items-center"
            >
              <Save className="mr-2" size={20} />
              {isSaving ? 'Guardando...' : 'Guardar configuración'}
            </button>
            <button
              onClick={handlePreview}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 flex items-center"
            >
              <Eye className="mr-2" size={20} />
              Previsualizar página
            </button>
          </div>
        )}
      </div>
    </div>
  );
}