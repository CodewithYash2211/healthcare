import React, { useEffect, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Card, Button } from '../components/UI';
import { getPatients, getCases, subscribe } from '../localStore';
import { Patient, HealthCase } from '../types';
import { Plus, Users, Clock, CheckCircle, AlertCircle, ChevronRight, Activity, Cpu, Stethoscope, ArrowUpRight, ClipboardList } from 'lucide-react';
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';

export const WorkerDashboard = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [cases, setCases] = useState<HealthCase[]>([]);

  useEffect(() => {
    const refresh = () => {
      const allPatients = getPatients().filter(p => p.workerId === user?.uid);
      setPatients(allPatients.slice(-5).reverse());
      const allCases = getCases().filter(c => c.workerId === user?.uid);
      setCases(allCases.slice(-5).reverse());
    };
    refresh();
    return subscribe(refresh);
  }, [user]);

  // Derived statistics for the SaaS look
  const totalPatients = getPatients().filter(p => p.workerId === user?.uid).length;
  const highRiskPatients = cases.filter(c => c.aiAnalysis && JSON.parse(c.aiAnalysis).urgency === 'High').length; // simple proxy for "High Risk"
  const aiDiagnoses = cases.filter(c => c.aiAnalysis).length;
  const pendingCasesCount = cases.filter(c => c.status === 'pending').length;

  const stats = [
    { label: t('totalPatients'), value: totalPatients, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
    { label: t('highRiskPatients'), value: highRiskPatients, icon: Activity, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100' },
    { label: t('healthScreeningsToday'), value: aiDiagnoses, icon: ClipboardList, color: 'text-cyan-600', bg: 'bg-cyan-50', border: 'border-cyan-100' },
    { label: t('pendingCasesCount'), value: pendingCasesCount, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent tracking-tight mb-1">{t('dashboard')}</h1>
          <p className="text-slate-500 font-medium">{t('welcomeBack')}, <span className="text-slate-900">{user?.name}</span></p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2 bg-white" onClick={() => navigate('/ai-assistant')}>
            <ClipboardList className="w-4 h-4 text-cyan-600" />
            <span className="hidden sm:inline">{t('startHealthScreening')}</span>
            <span className="sm:hidden">Screen</span>
          </Button>
          <Button className="gap-2 shadow-emerald-500/20" onClick={() => navigate('/patients?add=true')}>
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">{t('addPatient')}</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>
      </header>

      {/* Health Statistics Cards */}
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
                <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                  <stat.icon className="w-5 h-5 lg:w-6 lg:h-6" />
                </div>
              </div>
              <div>
                <p className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">{stat.value}</p>
                <p className="text-sm font-medium text-slate-500 mt-1">{stat.label}</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left Column (Spans 2): Recent Patients & Quick Actions */}
        <div className="xl:col-span-2 space-y-8">
          
          {/* Quick Actions Panel */}
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-4 tracking-tight flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-500" />
              {t('quickActions')}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="p-4 hover:bg-emerald-50/50 cursor-pointer group transition-colors border-emerald-100/50" onClick={() => navigate('/patients?add=true')}>
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                    <Plus className="w-5 h-5" />
                  </div>
                  <span className="font-semibold text-sm text-slate-700">{t('registerNewPatient')}</span>
                </div>
              </Card>
              <Card className="p-4 hover:bg-cyan-50/50 cursor-pointer group transition-colors border-cyan-100/50" onClick={() => navigate('/ai-assistant')}>
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-600 group-hover:scale-110 transition-transform">
                    <ClipboardList className="w-5 h-5" />
                  </div>
                  <span className="font-semibold text-sm text-slate-700">{t('startHealthScreening')}</span>
                </div>
              </Card>
              <Card className="p-4 hover:bg-amber-50/50 cursor-pointer group transition-colors border-amber-100/50" onClick={() => navigate('/skin-check')}>
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
                    <Stethoscope className="w-5 h-5" />
                  </div>
                  <span className="font-semibold text-sm text-slate-700">{t('referToHospital')}</span>
                </div>
              </Card>
            </div>
          </section>

          {/* Recent Patients List */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-500" />
                {t('recentPatients')}
              </h2>
              <Link to="/patients" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                {t('viewAll')} <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
            
            <Card className="overflow-hidden border-slate-200">
              <div className="divide-y divide-slate-100">
                {patients.length > 0 ? patients.map((patient) => (
                  <div key={patient.id} onClick={() => navigate(`/patients/${patient.id}`)} className="p-4 hover:bg-slate-50 transition-colors cursor-pointer group flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center text-emerald-700 font-bold border border-emerald-200">
                        {patient.name[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors">{patient.name}</p>
                        <p className="text-xs text-slate-500">{patient.age} {t('years')} • {patient.village}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-emerald-500 transform group-hover:translate-x-1 transition-all" />
                  </div>
                )) : (
                  <div className="p-8 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-20" />
                    <p className="text-sm">{t('noPatientsRegistered')}</p>
                  </div>
                )}
              </div>
            </Card>
          </section>
        </div>

        {/* Right Column (Spans 1): AI Diagnosis Result Panel */}
        <div className="xl:col-span-1 space-y-8">
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-cyan-500" />
                {t('healthScreeningReports')}
              </h2>
            </div>
            
            <div className="space-y-4">
              {cases.length > 0 ? cases.map((c) => (
                <Card key={c.id} className="p-5 border-l-4 border-l-cyan-500 hover:shadow-md transition-shadow relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <ClipboardList className="w-16 h-16 text-cyan-900" />
                  </div>
                  <div className="relative z-10 flex flex-col h-full justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          c.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {t(c.status)}
                        </span>
                        <span className="text-xs font-medium text-slate-400">
                          {c.timestamp ? new Date(c.timestamp).toLocaleDateString() : 'Just now'}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-slate-800 line-clamp-2">
                        "{c.symptoms}"
                      </p>
                    </div>
                    
                    <div className="pt-3 border-t border-slate-100">
                      <button 
                        onClick={() => navigate(`/patients/${c.patientId}`)}
                        className="text-xs font-semibold text-cyan-600 hover:text-cyan-700 flex items-center gap-1 group-hover:underline"
                      >
                        {t('viewFullAnalysis')} <ArrowUpRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </Card>
              )) : (
                <Card className="p-8 text-center text-slate-400 border-dashed">
                  <ClipboardList className="w-8 h-8 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">{t('noScreeningsPerformed')}</p>
                </Card>
              )}
            </div>
          </section>
        </div>

      </div>
    </div>
  );
};
