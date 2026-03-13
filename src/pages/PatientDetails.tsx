import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Button, Card, Input } from '../components/UI';
import { getPatientById, getCases, updatePatient, addCase, subscribe } from '../localStore';
import { analyzeSymptoms } from '../services/gemini';
import { addSyncTask } from '../utils/syncManager';
import { Patient, HealthCase } from '../types';
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
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const PatientDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [cases, setCases] = useState<HealthCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Vitals
  const [tempVitals, setTempVitals] = useState({ temp: '', bp: '', pulse: '', weight: '' });

  // Symptom AI
  const [symptomInput, setSymptomInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);
  const [caseSaved, setCaseSaved] = useState(false);

  useEffect(() => {
    const refresh = () => {
      if (!id) return;
      const p = getPatientById(id);
      setPatient(p || null);
      if (p?.vitals) {
        setTempVitals({
          temp: p.vitals.temp?.toString() || '',
          bp: p.vitals.bp || '',
          pulse: p.vitals.pulse?.toString() || '',
          weight: p.vitals.weight?.toString() || '',
        });
      }
      const patientCases = getCases()
        .filter(c => c.patientId === id)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setCases(patientCases);
      setLoading(false);
    };
    refresh();
    return subscribe(refresh);
  }, [id]);

  const handleUpdateVitals = () => {
    if (!id || !patient) return;
    setIsSaving(true);
    updatePatient(id, {
      vitals: {
        temp: parseFloat(tempVitals.temp) || undefined,
        bp: tempVitals.bp || undefined,
        pulse: parseInt(tempVitals.pulse) || undefined,
        weight: parseFloat(tempVitals.weight) || undefined,
      }
    });
    setIsSaving(false);
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
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveCase = () => {
    if (!id || !user || !aiResult) return;
    const caseData = {
      patientId: id,
      workerId: user.uid,
      symptoms: symptomInput,
      aiAnalysis: JSON.stringify(aiResult),
      status: !navigator.onLine ? 'pending_sync' : 'pending',
    };

    if (!navigator.onLine) {
      addSyncTask({
        type: 'SAVE_RECORD',
        payload: caseData
      });
    }

    addCase(caseData as any);
    setCaseSaved(true);
    setSymptomInput('');
    setAiResult(null);
  };

  if (loading) return <div className="flex items-center justify-center p-12"><Loader2 className="animate-spin" /></div>;
  if (!patient) return <div className="p-12 text-center">Patient not found</div>;

  return (
    <div className="space-y-8">
      <header className="flex items-center gap-4">
        <Button variant="outline" className="bg-white/50 backdrop-blur-sm" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent tracking-tight mb-0.5">{patient.name}</h1>
          <p className="text-slate-500 font-medium">{patient.age} {t('years')} • {t(patient.gender.toLowerCase())} • {patient.village}</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column: Profile + Vitals display */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-6">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-24 h-24 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-3xl font-bold mb-4">
                {patient.name[0]}
              </div>
              <h2 className="text-xl font-bold text-slate-900">{patient.name}</h2>
              <p className="text-slate-500">{patient.age} {t('years')} • {t(patient.gender.toLowerCase())}</p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-slate-400" />
                <span className="text-slate-600">{patient.contact || t('noContact')}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span className="text-slate-600">{patient.village}</span>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <History className="w-4 h-4 text-slate-400 mt-1" />
                <span className="text-slate-600">{patient.medicalHistory || t('noHistory')}</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-emerald-900 text-white">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              {t('currentVitals')}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: t('temp'), value: patient.vitals?.temp ? `${patient.vitals.temp}°C` : '--' },
                { label: t('bp'), value: patient.vitals?.bp || '--' },
                { label: t('pulse'), value: patient.vitals?.pulse ? `${patient.vitals.pulse} bpm` : '--' },
                { label: t('weight'), value: patient.vitals?.weight ? `${patient.vitals.weight} kg` : '--' },
              ].map(v => (
                <div key={v.label} className="bg-white/10 p-3 rounded-xl">
                  <p className="text-[10px] uppercase opacity-60">{v.label}</p>
                  <p className="text-lg font-bold">{v.value}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right column: Symptom entry, vitals update, case history */}
        <div className="lg:col-span-2 space-y-6">

          {/* ── Symptom Entry + AI Response ─────────────────────────── */}
          <Card className="p-6 border-emerald-100">
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
              <Button
                className="self-end px-4 py-3 gap-2"
                onClick={handleAnalyzeSymptoms}
                disabled={!symptomInput.trim() || isAnalyzing}
              >
                {isAnalyzing
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <Send className="w-4 h-4" />}
                Analyse
              </Button>
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
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase ${
                      aiResult.urgency === 'High' ? 'bg-red-100 text-red-700' :
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
                onChange={e => setTempVitals(p => ({ ...p, temp: e.target.value }))} />
              <Input label={t('bp')} placeholder="120/80" value={tempVitals.bp}
                onChange={e => setTempVitals(p => ({ ...p, bp: e.target.value }))} />
              <Input label={t('pulse')} type="number" value={tempVitals.pulse}
                onChange={e => setTempVitals(p => ({ ...p, pulse: e.target.value }))} />
              <Input label={t('weight')} type="number" value={tempVitals.weight}
                onChange={e => setTempVitals(p => ({ ...p, weight: e.target.value }))} />
            </div>
          </Card>

          {/* ── Case History ──────────────────────────────────────────── */}
          <Card className="p-6">
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
                  <div className="absolute -left-[27px] top-1 w-4 h-4 rounded-full bg-white border-4 border-emerald-500" />
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-slate-900">{t('symptomAnalysis')}</p>
                      <p className="text-xs text-slate-400">
                        {c.timestamp ? new Date(c.timestamp).toLocaleDateString() : 'Just now'}
                      </p>
                    </div>
                    <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-xl">{c.symptoms}</p>
                    {c.doctorGuidance && (
                      <p className="text-sm text-emerald-700 bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                        <strong>{t('doctorGuidance')}:</strong> {c.doctorGuidance}
                      </p>
                    )}
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        c.status === 'pending_sync' ? 'bg-slate-100 text-slate-700 border border-slate-300' :
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
    </div>
  );
};
