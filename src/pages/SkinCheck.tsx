import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Button, Card } from '../components/UI';
import { detectSkinDisease } from '../services/gemini';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, onSnapshot, addDoc, serverTimestamp, query, where } from 'firebase/firestore';
import { Patient } from '../types';
import { 
  Camera, 
  Upload, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  Hospital,
  User,
  Save,
  Loader2
} from 'lucide-react';
import { motion } from 'motion/react';

export const SkinCheck = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!user) return;

    let q;
    if (user.role === 'worker') {
      q = query(collection(db, 'patients'), where('workerId', '==', user.uid));
    } else {
      q = query(collection(db, 'patients'));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPatients(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Patient)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'patients'));

    return () => unsubscribe();
  }, [user]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    processFile(file);
  };

  const processFile = (file: File | undefined) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult(null);
        setSaveSuccess(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    processFile(file);
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setIsAnalyzing(true);
    try {
      const analysis = await detectSkinDisease(image, language);
      setResult(analysis);
    } catch (error) {
      console.error(error);
      alert(t('imageAnalysisError'));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveCase = async () => {
    if (!selectedPatientId || !result || !user) return;
    setIsSaving(true);
    try {
      await addDoc(collection(db, 'cases'), {
        patientId: selectedPatientId,
        workerId: user.uid,
        symptoms: `Skin Condition: ${result.condition}. ${result.description}`,
        aiAnalysis: `AI detected ${result.condition}. Recommendations: ${result.recommendations.join(', ')}`,
        status: 'pending',
        timestamp: serverTimestamp(),
        type: 'skin_check',
        imageUrl: image // In a real app, upload to Firebase Storage first
      });
      setSaveSuccess(true);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'cases');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Camera className="w-8 h-8 text-emerald-600" />
          {t('skinCheck')}
        </h1>
        <p className="text-slate-500">{t('skinCheckDescription')}</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <User className="w-4 h-4" />
              {t('patientSelection')}
            </label>
            <select 
              className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
            >
              <option value="">{t('choosePatient')}</option>
              {patients.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.village})</option>
              ))}
            </select>
          </div>

          <div 
            className={`aspect-square rounded-2xl bg-slate-50 border-2 border-dashed transition-all flex flex-col items-center justify-center overflow-hidden relative group ${
              isDragging ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-200'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {image ? (
              <>
                <img src={image} alt="Skin condition" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <label className="cursor-pointer bg-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    {t('changePhoto')}
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                </div>
              </>
            ) : (
              <label className="cursor-pointer flex flex-col items-center gap-4 p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Camera className="w-8 h-8" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{t('takePhoto')}</p>
                  <p className="text-sm text-slate-500 mt-1">{t('photoGuidance')}</p>
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
            )}
          </div>

          <Button 
            className="w-full py-6 text-lg" 
            disabled={!image || isAnalyzing}
            onClick={handleAnalyze}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                {t('analyzing')}
              </>
            ) : (
              t('startSkinAnalysis')
            )}
          </Button>
        </Card>

        <div className="space-y-6">
          {result ? (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <Card className="p-6 border-emerald-100 bg-emerald-50/30">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-slate-900">{result.condition}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{result.description}</p>
                  </div>
                </div>
              </Card>

              <Card className={`p-6 border-l-4 ${result.specialistRequired ? 'border-amber-500' : 'border-emerald-500'}`}>
                <div className="flex items-center gap-3 mb-4">
                  <AlertCircle className={`w-5 h-5 ${result.specialistRequired ? 'text-amber-500' : 'text-emerald-500'}`} />
                  <h4 className="font-bold text-slate-900">{t('recommendation')}</h4>
                </div>
                <p className="text-sm text-slate-700 mb-4">
                  {result.specialistRequired 
                    ? t('specialistRecommended')
                    : t('manageableCare')}
                </p>
                <div className="space-y-2 mb-6">
                  {result.recommendations.map((rec: string, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-slate-600">
                      <ArrowRight className="w-3 h-3 text-emerald-500" />
                      {rec}
                    </div>
                  ))}
                </div>

                <Button 
                  className="w-full gap-2" 
                  disabled={!selectedPatientId || isSaving || saveSuccess}
                  onClick={handleSaveCase}
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : saveSuccess ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                  {saveSuccess ? t('caseSaved') : t('saveToRecord')}
                </Button>
                {!selectedPatientId && !saveSuccess && (
                  <p className="text-[10px] text-amber-600 mt-2 text-center">{t('selectPatientToSave')}</p>
                )}
              </Card>

              {result.specialistRequired && (
                <Card className="p-6 bg-slate-900 text-white">
                  <div className="flex items-center gap-3 mb-4">
                    <Hospital className="w-5 h-5 text-emerald-400" />
                    <h4 className="font-bold">{t('nearbySpecialists')}</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 rounded-xl bg-white/10">
                      <div>
                        <p className="text-sm font-bold">District General Hospital</p>
                        <p className="text-xs text-white/60">Dermatology Dept • 12km away</p>
                      </div>
                      <Button size="sm" variant="primary" className="h-8">{t('refer')}</Button>
                    </div>
                  </div>
                </Card>
              )}
            </motion.div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400">
              <Camera className="w-12 h-12 mb-4 opacity-20" />
              <p>{t('skinCheckPlaceholder')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

