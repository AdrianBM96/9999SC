import React from 'react';
import { X } from 'lucide-react';
import { RecruitmentForm } from '../../types';

interface FormPreviewProps {
  form: RecruitmentForm;
  onClose: () => void;
}

export function FormPreview({ form, onClose }: FormPreviewProps) {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-6 py-4 flex justify-between items-center rounded-t-lg">
          <h2 className="text-2xl font-bold">Vista previa del formulario</h2>
          <button onClick={onClose} className="text-white hover:text-blue-200">
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">{form.title}</h3>
          <p className="text-gray-600 mb-6">{form.description}</p>

          <form className="space-y-6">
            {form.fields.map((field) => (
              <div key={field.id}>
                <label className="block text-sm font-medium text-gray-700">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>

                {field.type === 'text' && (
                  <input
                    type="text"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    placeholder={field.placeholder}
                    required={field.required}
                  />
                )}

                {field.type === 'textarea' && (
                  <textarea
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    rows={4}
                    placeholder={field.placeholder}
                    required={field.required}
                  />
                )}

                {field.type === 'select' && (
                  <select
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    required={field.required}
                  >
                    <option value="">Seleccionar...</option>
                    {field.options?.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                )}

                {field.type === 'radio' && (
                  <div className="mt-2 space-y-2">
                    {field.options?.map((option) => (
                      <label key={option} className="flex items-center">
                        <input
                          type="radio"
                          name={field.id}
                          value={option}
                          required={field.required}
                          className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                        />
                        <span className="ml-2 text-gray-700">{option}</span>
                      </label>
                    ))}
                  </div>
                )}

                {field.type === 'checkbox' && (
                  <div className="mt-2 space-y-2">
                    {field.options?.map((option) => (
                      <label key={option} className="flex items-center">
                        <input
                          type="checkbox"
                          value={option}
                          className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-gray-700">{option}</span>
                      </label>
                    ))}
                  </div>
                )}

                {field.type === 'file' && (
                  <input
                    type="file"
                    className="mt-1 block w-full"
                    required={field.required}
                  />
                )}

                {field.description && (
                  <p className="mt-1 text-sm text-gray-500">{field.description}</p>
                )}
              </div>
            ))}

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
              >
                Enviar formulario
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}