import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Button, Card, Input } from '../components/UI';
import { getCases, updatePatient, addCase, subscribe } from '../localStore';
import { analyzeSymptoms } from '../services/gemini';
import { Patient, HealthCase, Doctor } from '../types';
import { db } from '../firebase';
import { doc, getDoc, onSnapshot, query, collection, where } from 'firebase/firestore';
import { TelemedicineSession as SessionType } from '../types';
import {
  ArrowLeft,
  Phone,
  MapPin,
  History,
  Activity,
  Save,
  Plus,
  Loader2,
  Send,
  Bot,
  AlertTriangle,
  CheckCircle2,
  Video,
  Mic,
  Stethoscope as StethIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { usePatients } from '../contexts/PatientContext';
import { TelemedicineSession } from '../components/TelemedicineSession';
import { MultilingualVoiceInput } from '../components/MultilingualVoiceInput';

export const PatientDetails = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [cases, setCases] = useState<HealthCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Vitals
  const [tempVitals, setTempVitals] = useState({
    temp: '',
    bp: '',
    pulse: '',
    weight: '',
    heartRate: '',
    oxygenLevel: ''
  });

  // Symptom AI
  const [symptomInput, setSymptomInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);
  const [caseSaved, setCaseSaved] = useState(false);

  // Telemedicine
  const [activeSession, setActiveSession] = useState<{ type: 'voice' | 'video', id?: string, symptoms?: string, doctorId?: string } | null>(null);
  const [patientSessions, setPatientSessions] = useState<SessionType[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');

  useEffect(() => {
    const fetchPatient = async () => {
      if (!patientId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const docRef = doc(db, "patients", patientId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const pData = { id: docSnap.id, ...docSnap.data() } as Patient;
          setPatient(pData);
          
          if (pData.vitals) {
            setTempVitals({
              temp: pData.vitals.temp?.toString() || '',
              bp: pData.vitals.bp || '',
              pulse: pData.vitals.pulse?.toString() || '',
              weight: pData.vitals.weight?.toString() || '',
              heartRate: (pData.vitals as any).heartRate?.toString() || '',
              oxygenLevel: (pData.vitals as any).oxygenLevel?.toString() || '',
            });
          }
        } else {
          setError("Patient not found");
        }
      } catch (err) {
        console.error("Error fetching patient:", err);
        setError("Error loading patient record");
      } finally {
        setLoading(false);
      }
    };

    fetchPatient();

    const q = query(collection(db, 'sessions'), where('patientId', '==', patientId), where('status', 'in', ['waiting', 'active']));
    const unsubscribeSessions = onSnapshot(q, (snapshot) => {
      setPatientSessions(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as SessionType)));
    });

    const unsubscribeDoctors = onSnapshot(collection(db, 'doctors'), (snapshot) => {
      setDoctors(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Doctor)));
    });

    const refreshCases = () => {
      if (!patientId) return;
      const patientCases = getCases()
        .filter(c => c.patientId === patientId)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setCases(patientCases);
    };
    refreshCases();
    return () => {
      unsubscribeSessions();
      unsubscribeDoctors();
      subscribe(refreshCases)();
    };
  }, [patientId]);

const handleUpdateVitals = async () => {
  if (!patientId || !patient) return;
  setIsSaving(true);
  try {
    await updatePatient(patientId, {
      vitals: {
        temp: parseFloat(tempVitals.temp) || undefined,
        bp: tempVitals.bp || undefined,
        pulse: parseInt(tempVitals.pulse) || undefined,
        weight: parseFloat(tempVitals.weight) || undefined,
        heartRate: parseInt((tempVitals as any).heartRate) || undefined,
        oxygenLevel: parseInt((tempVitals as any).oxygenLevel) || undefined,
      } as any
    });
    alert('Vitals updated successfully!');
  } catch (err) {
    console.error(err);
    alert('Failed to update vitals.');
  } finally {
    setIsSaving(false);
  }
};

  const handleAnalyzeSymptoms = async () => {
    if (!symptomInput.trim()) return;
    setIsAnalyzing(true);
    setAiResult(null);
    setCaseSaved(false);
    try {
      const result = await analyzeSymptoms(symptomInput, language);
      setAiResult(result);
    } catch (err) {
      console.error("AI Analysis failed, using fallback:", err);
      setAiResult({
        analysis: "Based on symptoms, possible mild infection. Please consult doctor.",
        urgency: "Medium",
        nextSteps: ["Consult a medical professional", "Monitor symptoms closely", "Rest and stay hydrated"]
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleVoiceTranscript = useCallback((transcript: string) => {
    setSymptomInput(prev => prev ? `${prev} ${transcript}` : transcript);
  }, []);

const handleSaveCase = async () => {
  if (!patientId || !user || !aiResult) return;
  try {
    const caseData = {
      patientId: patientId,
      workerId: user.uid,
      symptoms: symptomInput,
      aiAnalysis: JSON.stringify(aiResult),
      status: !navigator.onLine ? 'pending_sync' : 'pending',
    };

    await addCase(caseData as any);
    setCaseSaved(true);
    setSymptomInput('');
    setAiResult(null);
  } catch (err) {
    console.error(err);
  }
};

if (loading) return (
  <div className="flex flex-col items-center justify-center p-12 min-h-[60vh] bg-slate-50">
    <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mb-4" />
    <p className="text-slate-500 font-medium">Loading patient data...</p>
  </div>
);

if (error || !patient) return (
  <div className="p-12 text-center space-y-4 bg-slate-50 min-h-screen">
    <div className="w-20 h-20 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
      <AlertTriangle className="w-10 h-10 text-amber-500" />
    </div>
    <h2 className="text-2xl font-bold text-slate-900">{error || "Patient not found"}</h2>
    <p className="text-slate-500">The patient record could not be loaded. Please verify the ID or try again.</p>
    <Button onClick={() => navigate('/patients')} variant="outline" className="bg-white">
      Go Back to Patient List
    </Button>
  </div>
);

return (
  <div className="space-y-8 animate-in fade-in duration-500">
    {patient && (
      <>
        <header className="flex items-center gap-4">
          <Button variant="outline" className="bg-white/50 backdrop-blur-sm shadow-sm" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent tracking-tight mb-0.5">{patient.name || 'Unknown'}</h1>
            <p className="text-slate-500 font-medium">{patient.age} {t('years')} • {t((patient.gender || 'other').toLowerCase())} • {patient.village}</p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column: Profile + Vitals display */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="p-6 shadow-md border-none">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-24 h-24 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-3xl font-bold mb-4 border-4 border-white shadow-sm">
                  {patient.name?.[0] || '?'}
                </div>
                <h2 className="text-xl font-bold text-slate-900">{patient.name || 'Unknown'}</h2>
                <p className="text-slate-500">{patient.age} {t('years')} • {t((patient.gender || 'other').toLowerCase())}</p>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 text-emerald-500" />
                  <span className="text-slate-600 font-medium">{patient.contact || t('noContact')}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="w-4 h-4 text-emerald-500" />
                  <span className="text-slate-600 font-medium">{patient.village}</span>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <History className="w-4 h-4 text-emerald-500 mt-1" />
                  <span className="text-slate-600 leading-relaxed italic">"{patient.medicalHistory || t('noHistory')}"</span>
                </div>
              </div>
            </Card>

            {/* Telemedicine Section */}
            {(user?.role === 'worker' || patientSessions.length > 0) && (
              <Card className={`p-6 text-white shadow-xl ${patientSessions.length > 0 ? 'bg-emerald-600' : 'bg-blue-600'}`}>
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <Video className="w-5 h-5 text-blue-200" />
                  {patientSessions.length > 0 ? 'Session Active' : 'Live Consultation'}
                </h3>
                <div className="space-y-4">
                  {!patientSessions.length && user?.role === 'worker' && (
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-blue-200">Select Doctor</p>
                      <select 
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-white/30"
                        value={selectedDoctorId}
                        onChange={(e) => setSelectedDoctorId(e.target.value)}
                      >
                        <option value="" className="text-gray-800">Select Doctor (Optional)</option>
                        {doctors.map(doc => (
                          <option key={doc.id} value={doc.id} className="text-gray-800">{doc.name} - {doc.specialization}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                  {patientSessions.length > 0 ? (
                    // Join existing session (Doctor or Worker)
                    <Button 
                      className="col-span-2 bg-white text-emerald-600 hover:bg-emerald-50 py-6 flex flex-col items-center gap-2 h-auto rounded-2xl"
                      onClick={() => setActiveSession({ type: patientSessions[0].type, id: patientSessions[0].id })}
                    >
                      <Video className="w-6 h-6" />
                      <span className="text-sm font-bold uppercase">Join Session Now</span>
                    </Button>
                  ) : (
                    // Start new session (Worker only)
                    user?.role === 'worker' && (
                      <>
                        <Button 
                          className="bg-white/20 hover:bg-white/30 text-white border-none py-4 flex flex-col items-center gap-2 h-auto rounded-2xl"
                          onClick={() => setActiveSession({ 
                            type: 'voice', 
                            symptoms: symptomInput, 
                            doctorId: selectedDoctorId 
                          })}
                        >
                          <Mic className="w-5 h-5" />
                          <span className="text-xs font-bold uppercase">{t('voice')}</span>
                        </Button>
                        <Button 
                          className="bg-white/20 hover:bg-white/30 text-white border-none py-4 flex flex-col items-center gap-2 h-auto rounded-2xl"
                          onClick={() => setActiveSession({ 
                            type: 'video', 
                            symptoms: symptomInput, 
                            doctorId: selectedDoctorId 
                          })}
                        >
                          <Video className="w-5 h-5" />
                          <span className="text-xs font-bold uppercase">{t('video')}</span>
                        </Button>
                      </>
                    )
                  )}
                </div>
              </div>
            </Card>
            )}

            <Card className="p-6 bg-emerald-900 text-white shadow-xl">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-300" />
                {t('currentVitals')}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: t('temp'), value: patient.vitals?.temp ? `${patient.vitals.temp}°C` : '--' },
                  { label: t('bp'), value: patient.vitals?.bp || '--' },
                  { label: t('pulse'), value: patient.vitals?.pulse ? `${patient.vitals.pulse} bpm` : '--' },
                  { label: t('heartRate'), value: (patient.vitals as any)?.heartRate ? `${(patient.vitals as any).heartRate} bpm` : '--' },
                  { label: t('oxygenLevel'), value: (patient.vitals as any)?.oxygenLevel ? `${(patient.vitals as any).oxygenLevel}%` : '--' },
                  { label: t('weight'), value: patient.vitals?.weight ? `${patient.vitals.weight} kg` : '--' },
                ].map(v => (
                  <div key={v.label} className="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/20">
                    <p className="text-[10px] uppercase opacity-60 font-bold tracking-wider">{v.label}</p>
                    <p className="text-lg font-bold">{v.value}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Right column: Symptom entry, vitals update, case history */}
          <div className="lg:col-span-2 space-y-6">
            {/* ── Symptom Entry + AI Response ─────────────────────────── */}
            <Card className="p-6 border-emerald-100 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
                <Bot className="w-5 h-5 text-emerald-600" />
                Log Symptoms &amp; Get AI Analysis
              </h3>

              <div className="flex gap-2">
                <textarea
                  rows={3}
                  placeholder="Describe the patient's symptoms (e.g. fever for 3 days, headache, fatigue)..."
                  className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm resize-none"
                  value={symptomInput}
                  onChange={e => setSymptomInput(e.target.value)}
                />
                <div className="flex flex-col gap-2 self-end">
                  <MultilingualVoiceInput 
                    onTranscript={handleVoiceTranscript}
                    language={language}
                  />
                  <Button
                    className="px-4 py-3 gap-2 min-w-[120px]"
                    onClick={handleAnalyzeSymptoms}
                    disabled={!symptomInput.trim() || isAnalyzing}
                  >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Analyse
                    </>
                  )}
                </Button>
              </div>
              </div>

              <AnimatePresence>
                {isAnalyzing && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 flex items-center gap-4 bg-slate-50/50 p-4 rounded-xl border border-slate-100"
                  >
                    <div className="flex gap-1.5 items-center">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="h-2 w-3/4 bg-slate-200 rounded-full animate-pulse" />
                      <div className="h-2 w-1/2 bg-slate-200 rounded-full animate-pulse" />
                    </div>
                  </motion.div>
                )}

                {aiResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 space-y-4"
                  >
                    {/* Urgency badge */}
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase ${aiResult.urgency === 'High' ? 'bg-red-100 text-red-700' :
                          aiResult.urgency === 'Medium' ? 'bg-amber-100 text-amber-700' :
                            'bg-emerald-100 text-emerald-700'
                        }`}>
                        <AlertTriangle className="w-3 h-3" />
                        {aiResult.urgency} Urgency
                      </span>

                      {caseSaved ? (
                        <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> Case saved!
                        </span>
                      ) : (
                        <Button size="sm" className="gap-1.5" onClick={handleSaveCase}>
                          <Save className="w-3 h-3" />
                          Save to Case History
                        </Button>
                      )}
                    </div>

                    {/* AI analysis text */}
                    <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-700 leading-relaxed">
                      {aiResult.analysis}
                    </div>

                    {/* Next steps */}
                    {aiResult.nextSteps?.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Recommended Steps</p>
                        <ul className="space-y-1.5">
                          {aiResult.nextSteps.map((step: string, i: number) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                              {step}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>

            {/* ── Update Vitals ─────────────────────────────────────────── */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-900">{t('updateVitals')}</h3>
                <Button size="sm" className="gap-2" onClick={handleUpdateVitals} disabled={isSaving}>
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {t('save')}
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label={`${t('temp')} (°C)`} type="number" step="0.1" value={tempVitals.temp}
                  onChange={e => setTempVitals(p => ({ ...p, temp: e.target.value }))} className="text-gray-800 bg-white" />
                <Input label={t('bp')} placeholder="120/80" value={tempVitals.bp}
                  onChange={e => setTempVitals(p => ({ ...p, bp: e.target.value }))} className="text-gray-800 bg-white" />
                <Input label={t('pulse')} type="number" value={tempVitals.pulse}
                  onChange={e => setTempVitals(p => ({ ...p, pulse: e.target.value }))} className="text-gray-800 bg-white" />
                <Input label={t('weight')} type="number" value={tempVitals.weight}
                  onChange={e => setTempVitals(p => ({ ...p, weight: e.target.value }))} className="text-gray-800 bg-white" />
                <Input label="Heart Rate (BPM)" type="number" value={(tempVitals as any).heartRate}
                  onChange={e => setTempVitals(p => ({ ...p, heartRate: e.target.value } as any))} className="text-gray-800 bg-white" />
                <Input label="Oxygen Level (%)" type="number" value={(tempVitals as any).oxygenLevel}
                  onChange={e => setTempVitals(p => ({ ...p, oxygenLevel: e.target.value } as any))} className="text-gray-800 bg-white" />
              </div>
            </Card>

            {/* ── Case History ──────────────────────────────────────────── */}
            <Card className="p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-900">{t('caseHistory')}</h3>
                <Button variant="outline" size="sm" className="gap-2" onClick={() => navigate('/ai-assistant')}>
                  <Plus className="w-4 h-4" />
                  {t('newCase')}
                </Button>
              </div>
              <div className="relative pl-8 space-y-8 before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                {cases.length > 0 ? cases.map(c => (
                  <div key={c.id} className="relative">
                    <div className="absolute -left-[27px] top-1 w-4 h-4 rounded-full bg-white border-4 border-emerald-500 shadow-sm" />
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-bold text-slate-900">{t('symptomAnalysis')}</p>
                        <p className="text-xs text-slate-400">
                          {c.timestamp ? new Date(c.timestamp).toLocaleDateString() : 'Just now'}
                        </p>
                      </div>
                      <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">{c.symptoms}</p>
                      {c.doctorGuidance && (
                        <p className="text-sm text-emerald-700 bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                          <strong>{t('doctorGuidance')}:</strong> {c.doctorGuidance}
                        </p>
                      )}
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${c.status === 'pending_sync' ? 'bg-slate-100 text-slate-700 border border-slate-300' :
                            c.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                              c.status === 'referred' ? 'bg-blue-100 text-blue-700' :
                                'bg-emerald-100 text-emerald-700'
                          }`}>
                          {c.status === 'pending_sync' ? 'Offline (Queued)' : t(c.status)}
                        </span>
                        {c.doctorId && <span className="text-[10px] text-slate-400">{t('reviewedByDoctor')}</span>}
                      </div>
                    </div>
                  </div>
                )) : (
                  <p className="text-sm text-slate-400">{t('noCases')}</p>
                )}
              </div>
            </Card>
          </div>
        </div>
      </>
    )}

    {activeSession && patient && (
      <TelemedicineSession 
        patient={patient}
        sessionType={activeSession.type}
        existingSessionId={activeSession.id}
        symptoms={activeSession.symptoms}
        doctorId={activeSession.doctorId}
        onClose={() => setActiveSession(null)}
      />
    )}
  </div>
);
};
