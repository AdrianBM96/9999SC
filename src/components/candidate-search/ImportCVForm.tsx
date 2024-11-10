import React, { useState } from 'react';
import { Upload, Sparkles, Loader } from 'lucide-react';
import { Candidature } from '../../types';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase';
import { extractCVInformation } from '../../services/ai/candidateAI';
import { getDetailedLinkedInProfile } from '../../api';
import { toast } from 'react-toastify';

interface ImportCVFormProps {
  candidatures: Candidature[];
  onComplete: () => void;
}

export function ImportCVForm({ candidatures, onComplete }: ImportCVFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedOffer, setSelectedOffer] = useState('');
  const [linkedinProfile, setLinkedinProfile] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setUploadProgress(0);
    }
  };

  const processCV = async () => {
    if (!selectedFile) {
      throw new Error('No se ha seleccionado ningún archivo');
    }

    try {
      // Procesar el PDF directamente desde el File object
      const arrayBuffer = await selectedFile.arrayBuffer();
      const cvInfo = await extractCVInformation(arrayBuffer);
      
      // Obtener información de LinkedIn si está disponible
      let linkedinInfo = {};
      if (linkedinProfile) {
        const publicIdentifier = linkedinProfile.split('/in/')[1]?.split('/')[0];
        if (publicIdentifier) {
          linkedinInfo = await getDetailedLinkedInProfile(publicIdentifier);
        }
      }

      // Subir el archivo a Firebase Storage
      const fileRef = ref(storage, `cvs/${selectedOffer}/${Date.now()}-${selectedFile.name}`);
      await uploadBytes(fileRef, selectedFile);
      const cvUrl = await getDownloadURL(fileRef);

      // Crear el documento del candidato
      const candidateData = {
        ...cvInfo,
        ...linkedinInfo,
        candidatureId: selectedOffer,
        cvUrl,
        linkedinProfile,
        createdAt: new Date().toISOString(),
        status: 'pending',
        adequacyPercentage: 0,
      };

      await addDoc(collection(db, 'savedCandidates'), candidateData);
      toast.success('Candidato añadido con éxito');
      onComplete();
    } catch (error) {
      console.error('Error processing CV:', error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Error al procesar el CV');
      }
      throw error;
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile || !selectedOffer || !linkedinProfile) {
      toast.error('Por favor, complete todos los campos requeridos');
      return;
    }

    setIsProcessing(true);
    try {
      await processCV();
    } catch (error) {
      console.error('Error processing candidate:', error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Error al procesar el candidato');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="bg-blue-50 rounded-lg p-4 flex items-start">
        <Sparkles className="w-5 h-5 text-blue-500 mr-3 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-medium text-blue-900">Análisis inteligente de CV</h4>
          <p className="text-sm text-blue-700">
            Esta función utiliza IA para analizar automáticamente el CV del candidato y extraer toda la información relevante.
          </p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Seleccionar oferta asociada *
        </label>
        <select
          value={selectedOffer}
          onChange={(e) => setSelectedOffer(e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500"
          required
        >
          <option value="">Seleccionar oferta</option>
          {candidatures.map((candidature) => (
            <option key={candidature.id} value={candidature.id}>
              {candidature.title}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Perfil de LinkedIn *
        </label>
        <input
          type="url"
          value={linkedinProfile}
          onChange={(e) => setLinkedinProfile(e.target.value)}
          placeholder="https://www.linkedin.com/in/username"
          className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>

      <div
        className="mt-4 border-2 border-dashed border-gray-300 rounded-lg p-8"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setSelectedFile(e.dataTransfer.files[0]);
            setUploadProgress(0);
          }
        }}
      >
        <div className="text-center">
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-4">
            <label htmlFor="file-upload" className="cursor-pointer">
              <span className="text-blue-600 hover:text-blue-500">
                {selectedFile ? selectedFile.name : 'Arrastra tu CV o haz clic para seleccionar'}
              </span>
              <input
                id="file-upload"
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                required
              />
            </label>
          </div>
          <p className="text-xs text-gray-500 mt-2">PDF, DOC, DOCX (Max. 10MB)</p>
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="mt-2">
              <div className="h-2 bg-gray-200 rounded-full">
                <div
                  className="h-2 bg-blue-600 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={isProcessing || !selectedFile || !selectedOffer || !linkedinProfile}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 flex items-center"
        >
          {isProcessing ? (
            <>
              <Loader className="animate-spin mr-2" size={20} />
              Procesando...
            </>
          ) : (
            'Procesar CV'
          )}
        </button>
      </div>
    </div>
  );
}