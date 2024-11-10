import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase';
import { Candidature } from '../../types';

interface PageConfig {
  title: string;
  description: string;
  logoUrl: string;
  bannerUrl: string;
  primaryColor: string;
  showCandidatures: boolean;
}

export function PublicPage() {
  const { companyId } = useParams<{ companyId: string }>();
  const [pageConfig, setPageConfig] = useState<PageConfig | null>(null);
  const [candidatures, setCandidatures] = useState<Candidature[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPageConfig();
    fetchCandidatures();
  }, [companyId]);

  const fetchPageConfig = async () => {
    try {
      const pageConfigDoc = await getDoc(doc(db, 'pageConfig', 'main'));
      if (pageConfigDoc.exists()) {
        setPageConfig(pageConfigDoc.data() as PageConfig);
      }
    } catch (error) {
      console.error('Error fetching page config:', error);
    }
  };

  const fetchCandidatures = async () => {
    try {
      const candidaturesQuery = query(collection(db, 'candidatures'), where('status', '==', 'active'));
      const candidaturesSnapshot = await getDocs(candidaturesQuery);
      const candidaturesList = candidaturesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Candidature));
      setCandidatures(candidaturesList);
    } catch (error) {
      console.error('Error fetching candidatures:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-10">Cargando...</div>;
  }

  if (!pageConfig) {
    return <div className="text-center py-10">No se pudo cargar la configuración de la página</div>;
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: pageConfig.primaryColor }}>
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <img src={pageConfig.logoUrl} alt="Logo" className="h-12" />
          <h1 className="text-3xl font-bold text-gray-900">{pageConfig.title}</h1>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-white rounded-lg shadow px-5 py-6 sm:px-6">
              <p className="text-xl text-gray-700 mb-6">{pageConfig.description}</p>
              {pageConfig.showCandidatures && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Candidaturas Abiertas</h2>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {candidatures.map((candidature) => (
                      <div key={candidature.id} className="bg-gray-50 rounded-lg p-4 shadow">
                        <h3 className="text-lg font-semibold">{candidature.title}</h3>
                        <p className="text-gray-600 mt-2">{candidature.description}</p>
                        <a
                          href={`/apply/${candidature.id}`}
                          className="mt-4 inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        >
                          Aplicar
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}