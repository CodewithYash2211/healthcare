import React, { useEffect, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Card, Button } from '../components/UI';
import { getCases, subscribe, getPatients } from '../localStore';
import { HealthCase, Patient } from '../types';
import { FileText, Clock, AlertTriangle, CheckCircle, ChevronRight, Users, Activity, Stethoscope, ArrowUpRight, MapPin } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';

export const DoctorDashboard = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pendingCases, setPendingCases] = useState<(HealthCase & { patient?: Patient })[]>([]);
  const [allCases, setAllCases] = useState<HealthCase[]>([]);

  useEffect(() => {
    const refresh = () => {
      const cases = getCases();
      const patients = getPatients();
      setAllCases(cases);
      
      const pending = cases
        .filter(c => c.status === 'pending')
        .map(c => ({
          ...c,
          patient: patients.find(p => p.id === c.patientId)
        })).reverse();
      setPendingCases(pending);
    };
    refresh();
    return subscribe(refresh);
  }, []);

  // Stats for Doctor Overview
  const patientsToday = new Set(allCases.filter(c => {
    if (!c.timestamp) return false;
    const today = new Date();
    const caseDate = new Date(c.timestamp);
    return caseDate.getDate() === today.getDate() && caseDate.getMonth() === today.getMonth() && caseDate.getFullYear() === today.getFullYear();
  }).map(c => c.patientId)).size;
  
  const pendingCount = pendingCases.length;
  const aiReportsGenerated = allCases.filter(c => c.aiAnalysis).length;
  const criticalCases = pendingCases.filter(c => c.aiAnalysis && JSON.parse(c.aiAnalysis).urgency === 'High').length;

  const stats = [
    { label: t('patientsToday'), value: patientsToday, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
    { label: t('pendingConsultations'), value: pendingCount, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
    { label: t('reportsGenerated'), value: aiReportsGenerated, icon: FileText, color: 'text-cyan-600', bg: 'bg-cyan-50', border: 'border-cyan-100' },
    { label: t('criticalCases'), value: criticalCases, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent tracking-tight mb-1">{t('dashboard')}</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Dr. <span className="text-slate-900 dark:text-white">{user?.name}</span> • {pendingCount} {t('pendingConsultations')}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2 bg-white" onClick={() => navigate('/map')}>
            <MapPin className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">View Map</span>
            <span className="sm:hidden">Map</span>
          </Button>
          <Button className="gap-2 shadow-emerald-500/20" onClick={() => navigate('/pending-cases')}>
            <Stethoscope className="w-4 h-4" />
            <span className="hidden sm:inline">{t('startQueue')}</span>
            <span className="sm:hidden">Queue</span>
          </Button>
        </div>
      </header>

      {/* Doctor Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 xl:gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1, type: 'spring', stiffness: 300, damping: 20 }}
          >
            <Card className={`p-5 lg:p-6 flex flex-col justify-between h-full border ${stat.border} hover:shadow-md transition-shadow`}>
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                  <stat.icon className="w-5 h-5 lg:w-6 lg:h-6" />
                </div>
              </div>
              <div>
                <p className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{stat.value}</p>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">{stat.label}</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left Column (Spans 2): Patient Queue */}
        <div className="xl:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" />
              {t('patientQueue')}
            </h2>
            <Link to="/pending-cases" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
              {t('viewAll')} <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-4">
            {pendingCases.length > 0 ? pendingCases.slice(0, 5).map((c) => {
              const aiData = c.aiAnalysis ? JSON.parse(c.aiAnalysis) : null;
              const isHighRisk = aiData?.urgency === 'High';
              return (
                <Card key={c.id} className={`p-0 overflow-hidden hover:shadow-md transition-all border ${isHighRisk ? 'border-red-200' : 'border-slate-200'}`}>
                  <div className="p-5 flex flex-col sm:flex-row sm:items-center gap-5">
                    
                    {/* Urgency Indicator bar (left edge) */}
                    <div className={`w-1.5 absolute left-0 top-0 bottom-0 ${isHighRisk ? 'bg-red-500' : aiData?.urgency === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500'}`} />

                    <div className="flex-1 space-y-3 pl-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-700 font-bold border border-slate-300">
                            {c.patient?.name?.[0] || '?'}
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-900 text-lg">{c.patient?.name || 'Unknown Patient'}</h3>
                            <p className="text-xs font-medium text-slate-500">{c.patient?.age}{t('years')} • {t(c.patient?.gender?.toLowerCase() || 'other')} • {c.patient?.village}</p>
                          </div>
                        </div>
                        {aiData && (
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider hidden sm:inline-block ${
                            isHighRisk ? 'bg-red-100 text-red-700' :
                            aiData.urgency === 'Medium' ? 'bg-amber-100 text-amber-700' :
                            'bg-emerald-100 text-emerald-700'
                          }`}>
                            {aiData.urgency} Risk
                          </span>
                        )}
                      </div>
                      
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <p className="text-sm text-slate-700 line-clamp-2">
                          <span className="font-semibold text-slate-900">{t('symptoms')}:</span> {c.symptoms}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-row sm:flex-col gap-2 shrink-0 border-t sm:border-t-0 sm:border-l border-slate-100 pt-4 sm:pt-0 sm:pl-5">
                      <Button onClick={() => navigate(`/cases/${c.id}`)} className="flex-1 bg-emerald-600 hover:bg-emerald-700 shadow-sm text-xs py-2">
                        {t('viewFullAnalysis')}
                      </Button>
                      <Button variant="outline" onClick={() => navigate(`/cases/${c.id}`)} className="flex-1 text-xs py-2">
                        {t('referToHospital')}
                      </Button>
                    </div>

                  </div>
                </Card>
              );
            }) : (
              <Card className="p-12 border-dashed flex flex-col items-center justify-center text-center">
                <CheckCircle className="w-12 h-12 text-emerald-200 mb-3" />
                <h3 className="text-lg font-bold text-slate-900">{t('allCaughtUp')}</h3>
                <p className="text-slate-500 mt-1">{t('noPendingCases')}</p>
              </Card>
            )}
          </div>
        </div>

        {/* Right Column: AI Diaganosis Summary & Quick actions */}
        <div className="xl:col-span-1 space-y-6">
          
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Activity className="w-5 h-5 text-red-500" />
              {t('healthSummaries')}
            </h2>
          </div>

          <Card className="p-5 border-t-4 border-t-red-500">
             <div className="space-y-4">
               <div>
                 <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2">{t('highPriorityAlerts')}</h3>
                 <p className="text-xs text-slate-500">{t('casesRequireAttention').replace('{count}', criticalCases.toString())}</p>
               </div>
               
               {criticalCases > 0 ? (
                 <div className="space-y-2">
                   {pendingCases.filter(c => c.aiAnalysis && JSON.parse(c.aiAnalysis).urgency === 'High').slice(0, 3).map(c => (
                     <div key={c.id} className="p-3 bg-red-50 rounded-lg border border-red-100 flex items-center justify-between cursor-pointer hover:bg-red-100 transition-colors" onClick={() => navigate(`/cases/${c.id}`)}>
                        <span className="text-sm font-semibold text-red-900">{c.patient?.name}</span>
                        <ChevronRight className="w-4 h-4 text-red-400" />
                     </div>
                   ))}
                 </div>
               ) : (
                 <div className="p-4 bg-slate-50 rounded-lg text-center text-xs text-slate-500">
                   {t('noCriticalAlerts')}
                 </div>
               )}
             </div>
          </Card>

          <Card className="p-5 bg-gradient-to-br from-slate-800 to-slate-900 text-white border-0">
             <div className="space-y-4">
               <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                 <Stethoscope className="w-5 h-5 text-emerald-400" />
               </div>
               <div>
                 <h3 className="text-lg font-bold tracking-tight">{t('quickConsultation')}</h3>
                 <p className="text-sm text-slate-400 mt-1 leading-relaxed">{t('startQueueSession')}</p>
               </div>
               <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white border-0 shadow-lg shadow-emerald-500/20" onClick={() => navigate('/pending-cases')}>
                 {t('beginSession')}
               </Button>
             </div>
          </Card>

        </div>

      </div>
    </div>
  );
};
