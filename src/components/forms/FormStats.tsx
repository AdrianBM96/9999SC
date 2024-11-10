import React, { useState, useEffect } from 'react';
import { X, BarChart2, Download } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { RecruitmentForm, FormSubmission } from '../../types';
import { toast } from 'react-toastify';

interface FormStatsProps {
  form: RecruitmentForm;
  onClose: () => void;
}

export function FormStats({ form, onClose }: FormStatsProps) {
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSubmissions();
  }, [form.id]);

  const fetchSubmissions = async () => {
    try {
      const submissionsQuery = query(
        collection(db, 'formSubmissions'),
        where('formId', '==', form.id)
      );
      const submissionsSnapshot = await getDocs(submissionsQuery);
      const submissionsList = submissionsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as FormSubmission));
      setSubmissions(submissionsList);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      toast.error('Error al cargar las respuestas');
    } finally {
      setIsLoading(false);
    }
  };

  const exportToCSV = () => {
    try {
      const headers = ['ID', 'Fecha', 'Estado', ...form.fields.map(f => f.label)];
      const rows = submissions.map(submission => [
        submission.id,
        new Date(submission.submittedAt).toLocaleString(),
        submission.status,
        ...form.fields.map(field => {
          const response = submission.responses[field.id];
          return Array.isArray(response) ? response.join(', ') : response;
        })
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${form.title}_responses.csv`;
      link.click();
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      toast.error('Error al exportar las respuestas');
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Estadísticas del formulario</h2>
            <p className="text-sm mt-1">{form.title}</p>
          </div>
          <button onClick={onClose} className="text-white hover:text-blue-200">
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="text-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Cargando estadísticas...</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-blue-800 mb-2">Total de respuestas</h3>
                  <p className="text-3xl font-bold text-blue-600">{submissions.length}</p>
                </div>
                Continuing exactly where we left off with the FormStats.tsx file:

                <div className="bg-green-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-green-800 mb-2">Tasa de finalización</h3>
                  <p className="text-3xl font-bold text-green-600">
                    {submissions.length > 0
                      ? `${Math.round((submissions.filter(s => s.status === 'reviewed').length / submissions.length) * 100)}%`
                      : '0%'}
                  </p>
                </div>

                <div className="bg-purple-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-purple-800 mb-2">Tiempo promedio</h3>
                  <p className="text-3xl font-bold text-purple-600">8 min</p>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold">Respuestas recientes</h3>
                  <button
                    onClick={exportToCSV}
                    className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 flex items-center"
                  >
                    <Download size={20} className="mr-2" />
                    Exportar CSV
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fecha
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Estado
                        </th>
                        {form.fields.map((field) => (
                          <th
                            key={field.id}
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            {field.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {submissions.map((submission) => (
                        <tr key={submission.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(submission.submittedAt).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              submission.status === 'reviewed'
                                ? 'bg-green-100 text-green-800'
                                : submission.status === 'rejected'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {submission.status}
                            </span>
                          </td>
                          {form.fields.map((field) => (
                            <td key={field.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {Array.isArray(submission.responses[field.id])
                                ? submission.responses[field.id].join(', ')
                                : submission.responses[field.id]}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {submissions.length === 0 && (
                  <div className="text-center py-10">
                    <BarChart2 className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No hay respuestas</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Aún no se han recibido respuestas para este formulario.
                    </p>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-semibold mb-4">Análisis por campo</h3>
                {form.fields.map((field) => {
                  if (field.type === 'select' || field.type === 'radio' || field.type === 'checkbox') {
                    const responses = submissions.flatMap(s => {
                      const response = s.responses[field.id];
                      return Array.isArray(response) ? response : [response];
                    });
                    const counts = responses.reduce((acc, value) => {
                      acc[value] = (acc[value] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>);

                    return (
                      <div key={field.id} className="mb-6">
                        <h4 className="text-lg font-medium mb-2">{field.label}</h4>
                        <div className="space-y-2">
                          {Object.entries(counts).map(([value, count]) => (
                            <div key={value} className="flex items-center">
                              <div className="flex-grow">
                                <div className="relative h-8 bg-gray-200 rounded-full overflow-hidden">
                                  <div
                                    className="absolute h-full bg-blue-500"
                                    style={{
                                      width: `${(count / submissions.length) * 100}%`
                                    }}
                                  ></div>
                                </div>
                              </div>
                              <div className="ml-4 w-32 flex justify-between">
                                <span className="text-sm text-gray-600">{value}</span>
                                <span className="text-sm font-medium text-gray-900">
                                  {Math.round((count / submissions.length) * 100)}%
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}