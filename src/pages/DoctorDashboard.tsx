import React, { useEffect, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Card, Button, Input } from '../components/UI';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { HealthCase, Patient } from '../types';
import { 
  Stethoscope, 
  Clock, 
  ChevronRight, 
  AlertCircle,
  MessageSquare,
  Hospital,
  Loader2,
  CheckCircle2,
  User
} from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

export const DoctorDashboard = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [pendingCases, setPendingCases] = useState<HealthCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [guidance, setGuidance] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, 'cases'),
      where('status', '==', 'pending'),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPendingCases(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as HealthCase)));
      setLoading(false);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'cases'));

    return () => unsubscribe();
  }, []);

  const handleReview = async (caseId: string) => {
    if (!guidance.trim()) return;
    setIsSubmitting(true);
    try {
      await updateDoc(doc(db, 'cases', caseId), {
        doctorGuidance: guidance,
        status: 'reviewed',
        doctorId: user?.uid,
        updatedAt: serverTimestamp()
      });
      setReviewingId(null);
      setGuidance('');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `cases/${caseId}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">
          {t('doctorDashboard')}
        </h1>
        <p className="text-slate-500">{t('welcomeBack')}, {user?.name}. {t('pendingReviewsCount').replace('{count}', pendingCases.length.toString())}</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Pending Cases List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" />
            {t('pendingReviews')}
          </h2>
          
          {loading ? (
            <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>
          ) : pendingCases.length > 0 ? (
            <div className="space-y-4">
              {pendingCases.map((c) => (
                <Card key={c.id} className="p-6 hover:border-emerald-200 transition-all group">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600 font-bold">
                          <User className="w-6 h-6 text-slate-400" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900">{t('patientID')}: {c.patientId.slice(-6)}</h3>
                          <p className="text-xs text-slate-500">
                            {c.timestamp?.toDate ? c.timestamp.toDate().toLocaleString() : 'Just now'}
                          </p>
                        </div>
                      </div>
                      <span className="px-2 py-1 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold uppercase">
                        {t('pending')}
                      </span>
                    </div>
                    
                    <div className="bg-slate-50 p-4 rounded-xl">
                      <p className="text-sm text-slate-600 italic">"{c.symptoms}"</p>
                      {c.aiAnalysis && (
                        <div className="mt-3 pt-3 border-t border-slate-200">
                          <p className="text-xs font-bold text-emerald-600 uppercase mb-1">{t('aiAnalysis')}</p>
                          <p className="text-sm text-emerald-800">{c.aiAnalysis}</p>
                        </div>
                      )}
                    </div>

                    {reviewingId === c.id ? (
                      <div className="space-y-4">
                        <Input 
                          label={t('doctorGuidance')} 
                          placeholder={t('guidancePlaceholder')}
                          value={guidance}
                          onChange={(e) => setGuidance(e.target.value)}
                        />
                        <div className="flex gap-2">
                          <Button 
                            className="flex-1 gap-2" 
                            onClick={() => handleReview(c.id)}
                            disabled={isSubmitting || !guidance.trim()}
                          >
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                            {t('submitReview')}
                          </Button>
                          <Button variant="outline" onClick={() => { setReviewingId(null); setGuidance(''); }}>
                            {t('cancel')}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/patients/${c.patientId}`}>{t('viewPatient')}</Link>
                        </Button>
                        <Button size="sm" onClick={() => setReviewingId(c.id)}>{t('review')}</Button>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center text-slate-400">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>{t('allReviewed')}</p>
            </Card>
          )}
        </div>

        {/* Quick Actions & Stats */}
        <div className="space-y-6">
          <Card className="p-6 bg-slate-900 text-white">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-emerald-400" />
              {t('dailySummary')}
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-white/60">{t('totalReviewed')}</span>
                <span className="font-bold">12</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-white/60">{t('referralsMade')}</span>
                <span className="font-bold text-emerald-400">4</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-white/60">{t('avgResponseTime')}</span>
                <span className="font-bold">1.5 hrs</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-bold mb-4 text-slate-900">{t('quickActions')}</h3>
            <div className="space-y-2">
              <Button variant="ghost" className="w-full justify-start gap-3 text-slate-600">
                <MessageSquare className="w-4 h-4" />
                {t('contactWorkers')}
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-3 text-slate-600">
                <Hospital className="w-4 h-4" />
                {t('hospitalDirectory')}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

