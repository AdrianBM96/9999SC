import React from 'react';
import { BarChart2, TrendingUp, Users, Clock, Calendar, Target, Filter, ArrowUp, ArrowDown } from 'lucide-react';

export function AnalyticsTab() {
  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-xl font-semibold mb-6">Analíticas de la oferta</h3>
        
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <Users className="w-5 h-5 text-blue-500 mr-2" />
              <h4 className="font-medium">Candidatos activos</h4>
            </div>
            <div className="text-3xl font-bold">45</div>
            <div className="flex items-center mt-1">
              <ArrowUp className="w-4 h-4 text-green-500 mr-1" />
              <p className="text-sm text-green-600">+12% vs mes anterior</p>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <Clock className="w-5 h-5 text-blue-500 mr-2" />
              <h4 className="font-medium">Tiempo medio proceso</h4>
            </div>
            <div className="text-3xl font-bold">15 días</div>
            <div className="flex items-center mt-1">
              <ArrowDown className="w-4 h-4 text-red-500 mr-1" />
              <p className="text-sm text-red-600">+3 días vs media</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <Target className="w-5 h-5 text-blue-500 mr-2" />
              <h4 className="font-medium">Tasa de conversión</h4>
            </div>
            <div className="text-3xl font-bold">8.5%</div>
            <div className="flex items-center mt-1">
              <ArrowUp className="w-4 h-4 text-green-500 mr-1" />
              <p className="text-sm text-green-600">+2.1% vs media</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="border border-gray-200 rounded-lg p-6">
            <h4 className="font-medium mb-4 flex items-center">
              <Filter className="w-5 h-5 text-blue-500 mr-2" />
              Embudo de contratación
            </h4>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Aplicaciones recibidas</span>
                  <span className="font-medium">150</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>CV preseleccionados</span>
                  <span className="font-medium">85</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '56.6%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Entrevistas telefónicas</span>
                  <span className="font-medium">45</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '30%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Entrevistas técnicas</span>
                  <span className="font-medium">25</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '16.6%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Ofertas enviadas</span>
                  <span className="font-medium">12</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '8%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Contrataciones</span>
                  <span className="font-medium">8</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '5.3%' }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="border border-gray-200 rounded-lg p-6">
              <h4 className="font-medium mb-4 flex items-center">
                <Calendar className="w-5 h-5 text-blue-500 mr-2" />
                Tiempos del proceso
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Tiempo medio hasta primera entrevista</span>
                  <span className="font-medium">3.5 días</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Tiempo medio hasta oferta</span>
                  <span className="font-medium">12 días</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Tiempo total del proceso</span>
                  <span className="font-medium">15 días</span>
                </div>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-6">
              <h4 className="font-medium mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 text-blue-500 mr-2" />
                Principales fuentes de candidatos
              </h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>LinkedIn</span>
                    <span className="font-medium">65%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Indeed</span>
                    <span className="font-medium">20%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '20%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Web corporativa</span>
                    <span className="font-medium">15%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '15%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}