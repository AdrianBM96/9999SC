import React, { useState, useEffect } from 'react';
import { collection, doc, getDoc, addDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Campaign, FormSection } from '../../types';
import { evaluateResponse } from '../../services/ai/campaignAI';
import { toast } from 'react-toastify';

interface PublicEvaluationFormProps {
  campaignId: string;
}

export function PublicEvaluationForm({ campaignId }: PublicEvaluationFormProps) {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [currentSection, setCurrentSection] = useState(0);

  useEffect(() => {
    fetchCampaign();
  }, [campaignId]);

  const fetchCampaign = async () => {
    try {
      const campaignDoc = await getDoc(doc(db, 'campaigns', campaignId));
      if (campaignDoc.exists()) {
        setCampaign(campaignDoc.data() as Campaign);
      } else {
        toast.error('Formulario no encontrado');
      }
    } catch (error) {
      console.error('Error fetching campaign:', error);
      toast.error('Error al cargar el formulario');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (fieldId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaign) return;

    setSubmitting(true);
    try {
      // Evaluate responses using AI
      const evaluations = await Promise.all(
        Object.entries(formData).map(async ([fieldId, response]) => {
          if (typeof response === 'string' && response.trim()) {
            const evaluation = await evaluateResponse(response, campaign);
            return { fieldId, ...evaluation };
          }
          return null;
        })
      );

      // Calculate overall score
      const validEvaluations = evaluations.filter(e => e !== null);
      const averageScore = validEvaluations.reduce((acc, curr) => acc + (curr?.score || 0), 0) / validEvaluations.length;

      // Save response
      await addDoc(collection(db, 'campaignResponses'), {
        campaignId,
        responses: formData,
        evaluations: evaluations.filter(e => e !== null),
        score: averageScore,
        submittedAt: new Date().toISOString()
      });

      toast.success('Formulario enviado con éxito');
      
      // Update campaign metrics
      const campaignRef = doc(db, 'campaigns', campaignId);
      const campaignDoc = await getDoc(campaignRef);
      if (campaignDoc.exists()) {
        const metrics = campaignDoc.data().metrics || {};
        await updateDoc(campaignRef, {
          metrics: {
            ...metrics,
            applied: (metrics.applied || 0) + 1
          }
        });
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Error al enviar el formulario');
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (field: any) => {
    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            value={formData[field.id] || ''}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            className="input-field"
            required={field.required}
          />
        );

      case 'textarea':
        return (
          <textarea
            value={formData[field.id] || ''}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            className="input-field"
            rows={4}
            required={field.required}
          />
        );

      case 'select':
        return (
          <select
            value={formData[field.id] || ''}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            className="input-field"
            required={field.required}
          >
            <option value="">Selecciona una opción</option>
            {field.options?.map((option: string) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map((option: string) => (
              <label key={option} className="flex items-center">
                <input
                  type="radio"
                  name={field.id}
                  value={option}
                  checked={formData[field.id] === option}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  className="mr-2"
                  required={field.required}
                />
                {option}
              </label>
            ))}
          </div>
        );

      case 'checkbox':
        return (
          <div className="space-y-2">
            {field.options?.map((option: string) => (
              <label key={option} className="flex items-center">
                <input
                  type="checkbox"
                  value={option}
                  checked={formData[field.id]?.includes(option)}
                  onChange={(e) => {
                    const current = formData[field.id] || [];
                    const value = e.target.value;
                    handleInputChange(
                      field.id,
                      current.includes(value)
                        ? current.filter((v: string) => v !== value)
                        : [...current, value]
                    );
                  }}
                  className="mr-2"
                />
                {option}
              </label>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando formulario...</p>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-xl text-gray-600">Formulario no encontrado</p>
        </div>
      </div>
    );
  }

  const sections = campaign.form.sections;
  const currentSectionData = sections[currentSection];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">{campaign.name}</h1>
          <p className="text-gray-600">{campaign.description}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">
                {currentSectionData.title}
              </h2>
              <span className="text-sm text-gray-500">
                Paso {currentSection + 1} de {sections.length}
              </span>
            </div>
            {currentSectionData.description && (
              <p className="text-sm text-gray-600 mb-4">{currentSectionData.description}</p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {currentSectionData.fields.map((field) => (
              <div key={field.id}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {renderField(field)}
              </div>
            ))}

            <div className="flex justify-between pt-6">
              <button
                type="button"
                onClick={() => setCurrentSection(prev => prev - 1)}
                disabled={currentSection === 0}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 disabled:opacity-50"
              >
                Anterior
              </button>
              {currentSection === sections.length - 1 ? (
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? 'Enviando...' : 'Enviar formulario'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setCurrentSection(prev => prev + 1)}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Siguiente
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

