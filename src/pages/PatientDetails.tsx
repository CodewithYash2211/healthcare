import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Button, Card, Input } from '../components/UI';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { doc, onSnapshot, updateDoc, collection, query, where, orderBy, serverTimestamp } from 'firebase/firestore';
import { Patient, HealthCase } from '../types';
import { 
  ArrowLeft, 
  User, 
  Phone, 
  MapPin, 
  History, 
  Activity,
  Save,
  Plus,
  Loader2
} from 'lucide-react';
import { motion } from 'motion/react';

export const PatientDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useAuth();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [cases, setCases] = useState<HealthCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [tempVitals, setTempVitals] = useState({
    temp: '',
    bp: '',
    pulse: '',
    weight: ''
  });

  useEffect(() => {
    if (!id) return;

    const unsubPatient = onSnapshot(doc(db, 'patients', id), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.id ? { id: snapshot.id, ...snapshot.data() } as Patient : null;
        setPatient(data);
        if (data?.vitals) {
          setTempVitals({
            temp: data.vitals.temp?.toString() || '',
            bp: data.vitals.bp || '',
            pulse: data.vitals.pulse?.toString() || '',
            weight: data.vitals.weight?.toString() || ''
          });
        }
      }
      setLoading(false);
    }, (error) => handleFirestoreError(error, OperationType.GET, `patients/${id}`));

    const casesQuery = query(
      collection(db, 'cases'),
      where('patientId', '==', id),
      orderBy('timestamp', 'desc')
    );

    const unsubCases = onSnapshot(casesQuery, (snapshot) => {
      setCases(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as HealthCase)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'cases'));

    return () => {
      unsubPatient();
      unsubCases();
    };
  }, [id]);

  const handleUpdateVitals = async () => {
    if (!id || !patient) return;
    setIsSaving(true);
    try {
      await updateDoc(doc(db, 'patients', id), {
        vitals: {
          temp: parseFloat(tempVitals.temp) || null,
          bp: tempVitals.bp,
          pulse: parseInt(tempVitals.pulse) || null,
          weight: parseFloat(tempVitals.weight) || null
        },
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `patients/${id}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center p-12"><Loader2 className="animate-spin" /></div>;
  if (!patient) return <div className="p-12 text-center">Patient not found</div>;

  return (
    <div className="space-y-8">
      <header className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{patient.name}</h1>
          <p className="text-slate-500">{patient.age} {t('years')} • {t(patient.gender.toLowerCase())} • {patient.village}</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Info */}
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
              <div className="bg-white/10 p-3 rounded-xl">
                <p className="text-[10px] uppercase opacity-60">{t('temp')}</p>
                <p className="text-lg font-bold">{patient.vitals?.temp || '--'}°C</p>
              </div>
              <div className="bg-white/10 p-3 rounded-xl">
                <p className="text-[10px] uppercase opacity-60">{t('bp')}</p>
                <p className="text-lg font-bold">{patient.vitals?.bp || '--'}</p>
              </div>
              <div className="bg-white/10 p-3 rounded-xl">
                <p className="text-[10px] uppercase opacity-60">{t('pulse')}</p>
                <p className="text-lg font-bold">{patient.vitals?.pulse || '--'} bpm</p>
              </div>
              <div className="bg-white/10 p-3 rounded-xl">
                <p className="text-[10px] uppercase opacity-60">{t('weight')}</p>
                <p className="text-lg font-bold">{patient.vitals?.weight || '--'} kg</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Medical History & Updates */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900">{t('updateVitals')}</h3>
              <Button 
                size="sm" 
                className="gap-2" 
                onClick={handleUpdateVitals}
                disabled={isSaving}
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {t('save')}
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input 
                label={t('temp') + " (°C)"} 
                type="number" 
                step="0.1" 
                value={tempVitals.temp}
                onChange={(e) => setTempVitals(prev => ({ ...prev, temp: e.target.value }))}
              />
              <Input 
                label={t('bp')} 
                placeholder="120/80" 
                value={tempVitals.bp}
                onChange={(e) => setTempVitals(prev => ({ ...prev, bp: e.target.value }))}
              />
              <Input 
                label={t('pulse')} 
                type="number" 
                value={tempVitals.pulse}
                onChange={(e) => setTempVitals(prev => ({ ...prev, pulse: e.target.value }))}
              />
              <Input 
                label={t('weight')} 
                type="number" 
                value={tempVitals.weight}
                onChange={(e) => setTempVitals(prev => ({ ...prev, weight: e.target.value }))}
              />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900">{t('caseHistory')}</h3>
              <Button variant="outline" size="sm" className="gap-2" onClick={() => navigate('/ai-assistant')}>
                <Plus className="w-4 h-4" />
                {t('newCase')}
              </Button>
            </div>
            
            <div className="relative pl-8 space-y-8 before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
              {cases.length > 0 ? cases.map((c) => (
                <div key={c.id} className="relative">
                  <div className="absolute -left-[27px] top-1 w-4 h-4 rounded-full bg-white border-4 border-emerald-500" />
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-slate-900">{t('symptomAnalysis')}</p>
                      <p className="text-xs text-slate-400">
                        {c.timestamp?.toDate ? c.timestamp.toDate().toLocaleDateString() : 'Just now'}
                      </p>
                    </div>
                    <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-xl">
                      {c.symptoms}
                    </p>
                    {c.doctorGuidance && (
                      <p className="text-sm text-emerald-700 bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                        <strong>{t('doctorGuidance')}:</strong> {c.doctorGuidance}
                      </p>
                    )}
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        c.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {t(c.status)}
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

