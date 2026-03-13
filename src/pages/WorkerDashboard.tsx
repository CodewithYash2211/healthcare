import React, { useEffect, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Card, Button } from '../components/UI';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { Patient, HealthCase } from '../types';
import { Plus, Users, Clock, CheckCircle, AlertCircle, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

export const WorkerDashboard = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [cases, setCases] = useState<HealthCase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const patientsQuery = query(
      collection(db, 'patients'),
      where('workerId', '==', user.uid),
      orderBy('updatedAt', 'desc'),
      limit(5)
    );

    const casesQuery = query(
      collection(db, 'cases'),
      where('workerId', '==', user.uid),
      orderBy('timestamp', 'desc'),
      limit(5)
    );

    const unsubPatients = onSnapshot(patientsQuery, (snapshot) => {
      const patientData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Patient));
      setPatients(patientData);
      setLoading(false);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'patients'));

    const unsubCases = onSnapshot(casesQuery, (snapshot) => {
      const caseData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as HealthCase));
      setCases(caseData);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'cases'));

    return () => {
      unsubPatients();
      unsubCases();
    };
  }, [user]);

  const stats = [
    { label: t('patients'), value: patients.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: t('pending'), value: cases.filter(c => c.status === 'pending').length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: t('reviewed'), value: cases.filter(c => c.status === 'reviewed').length, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  if (loading) return <div className="flex items-center justify-center p-12"><Clock className="animate-spin" /></div>;

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {t('dashboard')}
          </h1>
          <p className="text-slate-500">{t('welcomeBack')}, {user?.name}</p>
        </div>
        <Link to="/patients?add=true">
          <Button className="gap-2">
            <Plus className="w-5 h-5" />
            {t('addPatient')}
          </Button>
        </Link>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="p-6 flex items-center gap-4">
              <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Patients */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">{t('patients')}</h2>
            <Link to="/patients" className="text-sm font-medium text-emerald-600 hover:underline">{t('viewAll')}</Link>
          </div>
          <div className="space-y-3">
            {patients.length > 0 ? patients.map((patient) => (
              <Link key={patient.id} to={`/patients/${patient.id}`}>
                <Card className="p-4 hover:border-emerald-200 transition-all group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold">
                        {patient.name[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{patient.name}</p>
                        <p className="text-xs text-slate-500">{patient.age}{t('years')[0]} • {patient.village}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-emerald-500 transition-colors" />
                  </div>
                </Card>
              </Link>
            )) : (
              <p className="text-sm text-slate-400 text-center py-8">{t('noPatients')}</p>
            )}
          </div>
        </section>

        {/* Recent Cases */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">{t('recentCases')}</h2>
          <div className="space-y-3">
            {cases.length > 0 ? cases.map((c) => (
              <Card key={c.id} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        c.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {t(c.status)}
                      </span>
                      <span className="text-xs text-slate-400">
                        {c.timestamp?.toDate ? c.timestamp.toDate().toLocaleDateString() : 'Just now'}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 line-clamp-2">{c.symptoms}</p>
                  </div>
                  <AlertCircle className="w-5 h-5 text-slate-300 shrink-0" />
                </div>
              </Card>
            )) : (
              <p className="text-sm text-slate-400 text-center py-8">{t('noCases')}</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

