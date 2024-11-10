import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { Users, Briefcase, Calendar, Target, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { DetailedLinkedInProfile, Candidature } from '../../types';

// Stats Card Component
interface StatsCardProps {
  icon: React.ElementType;
  title: string;
  value: string | number;
  change?: string;
  subtitle?: string;
  iconBgColor?: string;
  changeColor?: string;
}

function StatsCard({ icon: Icon, title, value, change, subtitle, iconBgColor = 'bg-blue-100', changeColor = 'text-green-500' }: StatsCardProps) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <div className="flex items-center">
        <div className={`${iconBgColor} p-3 rounded-lg`}>
          <Icon className="w-6 h-6 text-blue-600" />
        </div>
        <div className="ml-4">
          <p className="text-sm text-gray-500">{title}</p>
          <div className="flex items-baseline">
            <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
            {change && <span className={`ml-2 text-sm ${changeColor}`}>{change}</span>}
          </div>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}

// Interview Item Component
interface InterviewItemProps {
  title: string;
  time: string;
  candidate: string;
}

function InterviewItem({ title, time, candidate }: InterviewItemProps) {
  return (
    <div className="flex items-center py-3">
      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
        {candidate.charAt(0)}
      </div>
      <div className="ml-4">
        <p className="font-medium text-gray-900">{title}</p>
        <p className="text-sm text-gray-500">{time} - {candidate}</p>
      </div>
    </div>
  );
}

// Pipeline Stage Component
interface PipelineStageProps {
  name: string;
  current: number;
  total: number;
  color: string;
}

function PipelineStage({ name, current, total, color }: PipelineStageProps) {
  const percentage = (current / total) * 100;
  return (
    <div className="mb-4">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-700">{name}</span>
        <span className="text-gray-500">{current}/{total}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full ${color}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}

export function Dashboard() {
  const [candidates, setCandidates] = useState<DetailedLinkedInProfile[]>([]);
  const [candidatures, setCandidatures] = useState<Candidature[]>([]);
  const [interviews, setInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch candidates
      const candidatesSnapshot = await getDocs(collection(db, 'savedCandidates'));
      const candidatesList = candidatesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as DetailedLinkedInProfile));
      setCandidates(candidatesList);

      // Fetch candidatures
      const candidaturesSnapshot = await getDocs(collection(db, 'candidatures'));
      const candidaturesList = candidaturesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Candidature));
      setCandidatures(candidaturesList);

      // Fetch today's interviews
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const interviewsQuery = query(
        collection(db, 'interviews'),
        where('date', '>=', today),
        where('date', '<', tomorrow)
      );
      const interviewsSnapshot = await getDocs(interviewsQuery);
      const interviewsList = interviewsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setInterviews(interviewsList);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          icon={Users}
          title="Candidatos activos"
          value={candidates.length}
          change="+12%"
          iconBgColor="bg-blue-100"
        />
        <StatsCard
          icon={Briefcase}
          title="Ofertas abiertas"
          value={candidatures.length}
          change="+3"
          iconBgColor="bg-green-100"
        />
        <StatsCard
          icon={Calendar}
          title="Entrevistas hoy"
          value={interviews.length}
          subtitle={`${interviews.filter(i => i.status === 'pending').length} pendientes`}
          iconBgColor="bg-purple-100"
        />
        <StatsCard
          icon={Target}
          title="Tasa de conversión"
          value="68%"
          change="+5%"
          iconBgColor="bg-red-100"
        />
      </div>

      {/* Middle Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pipeline Progress */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Candidatos por fase</h2>
            <button className="text-blue-600 text-sm hover:text-blue-800">Ver detalles</button>
          </div>
          <div className="space-y-4">
            <PipelineStage
              name="CV Review"
              current={45}
              total={150}
              color="bg-blue-500"
            />
            <PipelineStage
              name="Entrevista HR"
              current={32}
              total={150}
              color="bg-green-500"
            />
            <PipelineStage
              name="Prueba técnica"
              current={28}
              total={150}
              color="bg-yellow-500"
            />
            <PipelineStage
              name="Entrevista final"
              current={15}
              total={150}
              color="bg-purple-500"
            />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Actividad reciente</h2>
            <button className="text-blue-600 text-sm hover:text-blue-800">Ver todo</button>
          </div>
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">Nuevo candidato</p>
                <p className="text-xs text-gray-500">María López aplicó para Diseñador UX</p>
                <p className="text-xs text-gray-400">Hace 5 min</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">Entrevista programada</p>
                <p className="text-xs text-gray-500">Tech Lead con Carlos Ruiz</p>
                <p className="text-xs text-gray-400">Hace 15 min</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">Oferta aceptada</p>
                <p className="text-xs text-gray-500">Juan García - Frontend Developer</p>
                <p className="text-xs text-gray-400">Hace 1 hora</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Urgent Positions */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Ofertas urgentes</h2>
            <button className="text-blue-600 text-sm hover:text-blue-800">Ver todas</button>
          </div>
          <div className="space-y-4">
            {candidatures.slice(0, 3).map((candidature) => (
              <div key={candidature.id} className="flex items-center justify-between">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">{candidature.title}</p>
                    <p className="text-sm text-gray-500">{candidature.location} · 5 candidatos</p>
                  </div>
                </div>
                <span className="text-sm text-gray-500">Vence en 5 días</span>
              </div>
            ))}
          </div>
        </div>

        {/* Hiring Metrics */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Métricas de contratación</h2>
            <button className="text-blue-600 text-sm hover:text-blue-800">Ver detalles</button>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500">Tiempo medio de contratación</p>
              <p className="text-2xl font-semibold text-gray-900">23 días</p>
              <p className="text-sm text-green-500">-2 días</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Tasa de aceptación</p>
              <p className="text-2xl font-semibold text-gray-900">85%</p>
              <p className="text-sm text-green-500">+5%</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Coste por contratación</p>
              <p className="text-2xl font-semibold text-gray-900">€2,450</p>
              <p className="text-sm text-green-500">-€200</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Candidatos por oferta</p>
              <p className="text-2xl font-semibold text-gray-900">45</p>
              <p className="text-sm text-green-500">+12</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}