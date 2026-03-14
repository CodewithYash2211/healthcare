import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Card, Button } from '../components/UI';
import { usePatients } from '../contexts/PatientContext';
import { Clock, CheckCircle, ChevronRight, Activity, Flag, Calendar, HeartPulse } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { TelemedicineSession } from '../components/TelemedicineSession';
import { TelemedicineSession as SessionType } from '../types';

export const PatientQueue = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { patients } = usePatients();
  const [activeSessions, setActiveSessions] = useState<SessionType[]>([]);
  const [joiningSession, setJoiningSession] = useState<SessionType | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'sessions'), where('status', 'in', ['waiting', 'active']));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const sessions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SessionType));
      setActiveSessions(sessions);
    });
    return () => unsubscribe();
  }, []);

  const pendingCases = patients.filter(p => p.status === 'Waiting');
  const completedCases = patients.filter(p => p.status !== 'Waiting').slice(0, 10);
  
  const currentPatient = pendingCases[0];
  const waitingPatients = pendingCases.slice(1);

  const handleBeginSession = (patientId: string) => {
    const session = activeSessions.find(s => s.patientId === patientId);
    if (session) {
      setJoiningSession(session);
    } else {
      navigate(`/patients/${patientId}`);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto bg-slate-50 min-h-screen text-gray-800">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight mb-1">Patient Queue</h1>
          <p className="text-gray-500 font-medium">Manage your consultation session and waiting list.</p>
        </div>
        <div className="flex gap-3">
           <Button className="bg-white text-gray-800 border-gray-300 shadow-sm hover:bg-gray-50 hover:-translate-y-0 text-sm px-4 py-2 rounded-xl border" onClick={() => navigate('/')}>Back to Dashboard</Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (Spans 2): Current & Waiting */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Current Patient Session */}
          <section>
             <h2 className="text-xl font-bold text-gray-800 tracking-tight flex items-center gap-2 mb-4">
               <Activity className="w-6 h-6 text-emerald-500" />
               Current Patient
             </h2>
             
             {currentPatient ? (
               <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                 <Card className="p-0 overflow-hidden border-2 border-emerald-500 bg-white shadow-md rounded-xl">
                    <div className="bg-emerald-500 text-white px-6 py-3 flex items-center justify-between">
                      <span className="font-bold flex items-center gap-2">
                        <Flag className="w-4 h-4"/> 
                        {activeSessions.some(s => s.patientId === currentPatient.id) ? (
                          <span className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                            LIVE SESSION WAITING
                          </span>
                        ) : 'Next in Queue'}
                      </span>
                      <span className="text-emerald-100 text-sm">Waiting</span>
                    </div>
                    
                    <div className="p-6 md:p-8">
                      {/* Health Summary Card format */}
                      <div className="flex flex-col md:flex-row gap-6 md:items-start justify-between">
                        <div className="space-y-4 flex-1">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-2xl font-bold border-4 border-white shadow-md">
                              {currentPatient.name?.[0] || '?'}
                            </div>
                            <div>
                               <h3 className="text-2xl font-bold text-gray-800">{currentPatient.name}</h3>
                               <p className="font-medium text-gray-500 flex items-center gap-3 mt-1">
                                 <span className="flex items-center gap-1"><Calendar className="w-4 h-4"/> {currentPatient.age} yrs</span>
                                 <span>•</span>
                                 <span>{currentPatient.village}</span>
                               </p>
                            </div>
                          </div>
                          
                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                             <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Reported Symptoms</h4>
                             <p className="text-gray-800 font-medium">{currentPatient.symptoms}</p>
                          </div>
                        </div>
                        
                        <div className="shrink-0 w-full md:w-48 flex flex-col gap-3 pt-2">
                           <Button className="w-full bg-blue-600 text-white hover:bg-blue-700 shadow-md py-6 text-lg rounded-xl" onClick={() => handleBeginSession(currentPatient.id)}>
                              Begin Session
                           </Button>
                           <Button className="w-full bg-white text-gray-600 border border-slate-300 hover:bg-slate-50 rounded-xl py-3" onClick={() => navigate(`/patients/${currentPatient.id}`)}>
                              View Patient History
                           </Button>
                        </div>
                      </div>
                    </div>
                 </Card>
               </motion.div>
             ) : (
               <Card className="p-12 border-dashed flex flex-col items-center justify-center text-center bg-white shadow-md rounded-xl">
                  <CheckCircle className="w-16 h-16 text-emerald-300 mb-4" />
                  <h3 className="text-xl font-bold text-gray-800">Queue is Empty</h3>
                  <p className="text-gray-500 mt-2 max-w-sm">No patients in queue</p>
               </Card>
             )}
          </section>

          {/* Waiting List */}
          {waitingPatients.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-gray-800 tracking-tight flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-amber-500" />
                Waiting Room ({waitingPatients.length})
              </h2>
              <div className="space-y-3">
                {waitingPatients.map((caseItem, index) => {
                  return (
                    <Card key={caseItem.id} className="p-4 bg-white shadow-md rounded-xl hover:border-emerald-200 transition-colors flex items-center gap-4 cursor-pointer" onClick={() => handleBeginSession(caseItem.id)}>
                       <div className="w-8 h-8 rounded-full bg-slate-100 text-gray-500 font-bold flex items-center justify-center shrink-0 border border-slate-200">
                         {index + 2}
                       </div>
                       <div className="flex-1 min-w-0">
                         <div className="flex items-center gap-3">
                           <h4 className="font-bold text-gray-800 truncate">{caseItem.name}</h4>
                         </div>
                         <p className="text-sm text-gray-500 truncate">{caseItem.symptoms}</p>
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
           <h2 className="text-lg font-bold text-gray-800 tracking-tight flex items-center gap-2">
             <CheckCircle className="w-5 h-5 text-emerald-500" />
             Recently Completed
           </h2>
           
           <Card className="p-0 overflow-hidden border-slate-200 bg-white shadow-md rounded-xl">
             <div className="divide-y divide-slate-100">
               {completedCases.length > 0 ? completedCases.map(c => (
                 <div key={c.id} className="p-4 hover:bg-slate-50/50 transition-colors flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                       <span className="font-semibold text-gray-800 truncate text-sm">{c.name}</span>
                       <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">{c.status}</span>
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-1.5 line-clamp-1">
                      <HeartPulse className="w-3.5 h-3.5" />
                      Consultation notes added.
                    </div>
                 </div>
               )) : (
                 <div className="p-8 text-center text-gray-400">
                   <p className="text-sm">No recent completions.</p>
                 </div>
               )}
             </div>
           </Card>
        </div>
      </div>
      
      {joiningSession && (
        <TelemedicineSession
          patient={patients.find(p => p.id === joiningSession.patientId)!}
          sessionType={joiningSession.type}
          existingSessionId={joiningSession.id}
          onClose={() => setJoiningSession(null)}
        />
      )}
    </div>
  );
};
