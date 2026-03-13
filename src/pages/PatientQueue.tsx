import React, { useEffect, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Card, Button } from '../components/UI';
import { getCases, subscribe, getPatients, updateCase } from '../localStore';
import { HealthCase, Patient } from '../types';
import { Clock, AlertTriangle, CheckCircle, ChevronRight, Activity, Flag, Calendar, HeartPulse } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';

export const PatientQueue = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [pendingCases, setPendingCases] = useState<(HealthCase & { patient?: Patient })[]>([]);
  const [completedCases, setCompletedCases] = useState<(HealthCase & { patient?: Patient })[]>([]);
  
  useEffect(() => {
    const refresh = () => {
      const cases = getCases();
      const patients = getPatients();
      
      const enrichedCases = cases.map(c => ({
        ...c,
        patient: patients.find(p => p.id === c.patientId)
      }));

      // Sort pending cases logically (older first, or by urgency if we prefer)
      const pending = enrichedCases.filter(c => c.status === 'pending');
      setPendingCases(pending);

      // Show recently reviewed
      const completed = enrichedCases.filter(c => c.status === 'reviewed' || c.status === 'referred').reverse().slice(0, 10);
      setCompletedCases(completed);
    };
    refresh();
    return subscribe(refresh);
  }, []);

  const currentPatient = pendingCases[0];
  const waitingPatients = pendingCases.slice(1);

  const handleBeginSession = (caseId: string) => {
    navigate(`/cases/${caseId}`);
  };

  const getUrgencyColor = (urgency?: string) => {
    switch(urgency) {
      case 'High': return 'text-red-700 bg-red-100 border-red-200';
      case 'Medium': return 'text-amber-700 bg-amber-100 border-amber-200';
      case 'Low': return 'text-emerald-700 bg-emerald-100 border-emerald-200';
      default: return 'text-slate-700 bg-slate-100 border-slate-200';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-1">Patient Queue</h1>
          <p className="text-slate-500 font-medium">Manage your consultation session and waiting list.</p>
        </div>
        <div className="flex gap-3">
           <Button variant="outline" onClick={() => navigate('/')}>Back to Dashboard</Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (Spans 2): Current & Waiting */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Current Patient Session */}
          <section>
             <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2 mb-4">
               <Activity className="w-6 h-6 text-emerald-500" />
               Current Patient
             </h2>
             
             {currentPatient ? (
               <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                 <Card className="p-0 overflow-hidden border-2 border-emerald-500 shadow-xl shadow-emerald-500/10">
                    <div className="bg-emerald-500 text-white px-6 py-3 flex items-center justify-between">
                      <span className="font-bold flex items-center gap-2"><Flag className="w-4 h-4"/> Next in Queue</span>
                      <span className="text-emerald-100 text-sm">{currentPatient.timestamp ? new Date(currentPatient.timestamp).toLocaleTimeString() : 'Waiting'}</span>
                    </div>
                    
                    <div className="p-6 md:p-8">
                      {/* Health Summary Card format */}
                      <div className="flex flex-col md:flex-row gap-6 md:items-start justify-between">
                        <div className="space-y-4 flex-1">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-2xl font-bold border-4 border-white shadow-md">
                              {currentPatient.patient?.name?.[0] || '?'}
                            </div>
                            <div>
                               <h3 className="text-2xl font-bold text-slate-900">{currentPatient.patient?.name}</h3>
                               <p className="font-medium text-slate-500 flex items-center gap-3 mt-1">
                                 <span className="flex items-center gap-1"><Calendar className="w-4 h-4"/> {currentPatient.patient?.age} yrs</span>
                                 <span>•</span>
                                 <span>{t(currentPatient.patient?.gender?.toLowerCase() || 'other')}</span>
                               </p>
                            </div>
                          </div>
                          
                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                             <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Reported Symptoms</h4>
                             <p className="text-slate-800 font-medium">{currentPatient.symptoms}</p>
                          </div>
                          
                          {currentPatient.aiAnalysis && (
                            <div className="space-y-3">
                               {(() => {
                                 const aiData = JSON.parse(currentPatient.aiAnalysis);
                                 return (
                                   <>
                                     <div className="flex items-center gap-3">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">AI Risk Level:</h4>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getUrgencyColor(aiData.urgency)}`}>
                                          {aiData.urgency} Risk
                                        </span>
                                     </div>
                                     <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-blue-800 mb-2">AI Diagnosis Synopsis</h4>
                                        <p className="text-sm text-slate-700 leading-relaxed">{aiData.diagnosis || 'Analysis pending or not provided in brief format.'}</p>
                                     </div>
                                   </>
                                 );
                               })()}
                            </div>
                          )}
                        </div>
                        
                        <div className="shrink-0 w-full md:w-48 flex flex-col gap-3 pt-2">
                           <Button className="w-full bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 py-6 text-lg" onClick={() => handleBeginSession(currentPatient.id)}>
                              Begin Session
                           </Button>
                           <Button variant="outline" className="w-full text-slate-600 border-slate-300" onClick={() => navigate(`/patients/${currentPatient.patientId}`)}>
                              View Patient History
                           </Button>
                        </div>
                      </div>
                    </div>
                 </Card>
               </motion.div>
             ) : (
               <Card className="p-12 border-dashed flex flex-col items-center justify-center text-center bg-slate-50/50">
                  <CheckCircle className="w-16 h-16 text-emerald-300 mb-4" />
                  <h3 className="text-xl font-bold text-slate-900">Queue is Empty</h3>
                  <p className="text-slate-500 mt-2 max-w-sm">There are no pending patient consultations at this time. Great job!</p>
               </Card>
             )}
          </section>

          {/* Waiting List */}
          {waitingPatients.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-amber-500" />
                Waiting Room ({waitingPatients.length})
              </h2>
              <div className="space-y-3">
                {waitingPatients.map((caseItem, index) => {
                  const aiData = caseItem.aiAnalysis ? JSON.parse(caseItem.aiAnalysis) : null;
                  return (
                    <Card key={caseItem.id} className="p-4 hover:border-emerald-200 transition-colors flex items-center gap-4 cursor-pointer" onClick={() => handleBeginSession(caseItem.id)}>
                       <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 font-bold flex items-center justify-center shrink-0 border border-slate-200">
                         {index + 2}
                       </div>
                       <div className="flex-1 min-w-0">
                         <div className="flex items-center gap-3">
                           <h4 className="font-bold text-slate-900 truncate">{caseItem.patient?.name}</h4>
                           {aiData && (
                             <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getUrgencyColor(aiData.urgency)}`}>
                               {aiData.urgency}
                             </span>
                           )}
                         </div>
                         <p className="text-sm text-slate-500 truncate">{caseItem.symptoms}</p>
                       </div>
                       <ChevronRight className="w-5 h-5 text-slate-300 shrink-0" />
                    </Card>
                  )
                })}
              </div>
            </section>
          )}

        </div>

        {/* Right Column (Spans 1): Completed Consultations */}
        <div className="lg:col-span-1 space-y-6">
           <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
             <CheckCircle className="w-5 h-5 text-emerald-500" />
             Recently Completed
           </h2>
           
           <Card className="p-0 overflow-hidden border-slate-200">
             <div className="divide-y divide-slate-100">
               {completedCases.length > 0 ? completedCases.map(c => (
                 <div key={c.id} className="p-4 hover:bg-slate-50/50 transition-colors flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                       <span className="font-semibold text-slate-900 truncate text-sm">{c.patient?.name}</span>
                       <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">{t(c.status)}</span>
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-1.5 line-clamp-1">
                      <HeartPulse className="w-3.5 h-3.5" />
                      {c.doctorGuidance || 'Consultation notes added.'}
                    </div>
                 </div>
               )) : (
                 <div className="p-8 text-center text-slate-400">
                   <p className="text-sm">No recent completions.</p>
                 </div>
               )}
             </div>
           </Card>
        </div>
      </div>
    </div>
  );
};
