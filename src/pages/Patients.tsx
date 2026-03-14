import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Button, Card, Input } from '../components/UI';
import { usePatients } from '../contexts/PatientContext';
import { Patient } from '../types';
import { 
  Users, 
  Search, 
  Plus, 
  UserPlus,
  ChevronRight,
  Loader2,
  MapPin,
  Calendar
} from 'lucide-react';
import { motion } from 'motion/react';

export const Patients = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [newPatient, setNewPatient] = useState({
    name: '',
    age: '',
    gender: 'Male',
    village: '',
    contact: '',
    medicalHistory: ''
  });

  const { patients: globalPatients, addPatient } = usePatients();

  useEffect(() => {
    const refresh = () => {
      setPatients([...globalPatients].sort((a, b) => a.name.localeCompare(b.name)));
    };
    refresh();
  }, [globalPatients]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('add') === 'true') {
      setShowAddModal(true);
      navigate('/patients', { replace: true });
    }
  }, [location, navigate]);

  const handleAddPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatient.name || !newPatient.age || !newPatient.village || !user) return;
    setIsSaving(true);
    
    try {
      await addPatient({
        name: newPatient.name,
        age: parseInt(newPatient.age),
        gender: newPatient.gender.toLowerCase() as any,
        contact: newPatient.contact,
        village: newPatient.village,
        medicalHistory: newPatient.medicalHistory || 'Initial Consultation',
        vitals: {},
        workerId: user.uid,
        location: {
          lat: 18.5204 + (Math.random() - 0.5) * 0.2, // Random location near Pune
          lng: 73.8567 + (Math.random() - 0.5) * 0.2,
        },
      });

      setShowAddModal(false);
      setNewPatient({ name: '', age: '', gender: 'Male', village: '', contact: '', medicalHistory: '' });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredPatients = patients.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.village.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent tracking-tight flex items-center gap-2 mb-1">
            <Users className="w-8 h-8 text-emerald-600" />
            {t('patients')}
          </h1>
          <p className="text-slate-500 font-medium">{t('managePatients')}</p>
        </div>
        <Button className="gap-2" onClick={() => setShowAddModal(true)}>
          <UserPlus className="w-5 h-5" />
          {t('addPatient')}
        </Button>
      </header>

      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPatients.map((p) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            onClick={() => navigate(`/patients/${p.id}`)}
            className="cursor-pointer"
          >
            <Card className="p-6 hover:border-emerald-200 transition-all group">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl font-bold">
                  {p.name?.[0] || '?'}
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-emerald-500 transition-colors" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-1">{p.name || 'Unknown'}</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Calendar className="w-4 h-4" />
                  {p.age || '--'} {t('years')} • {t((p.gender || 'other').toLowerCase())}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <MapPin className="w-4 h-4" />
                  {p.village || 'N/A'}
                </div>
              </div>
              {p.vitals?.temp && (
                <div className="mt-4 pt-4 border-t border-slate-100 flex gap-4">
                  <div className="text-center">
                    <p className="text-[10px] uppercase text-slate-400">{t('temp').substring(0, 4)}</p>
                    <p className="text-xs font-bold text-slate-700">{p.vitals.temp}°C</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] uppercase text-slate-400">{t('bp')}</p>
                    <p className="text-xs font-bold text-slate-700">{p.vitals.bp || '--'}</p>
                  </div>
                </div>
              )}
            </Card>
          </motion.div>
        ))}
        {filteredPatients.length === 0 && (
          <div className="col-span-full text-center py-16 text-slate-400">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>{t('noPatients')}</p>
          </div>
        )}
      </div>

      {/* Add Patient Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl"
          >
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">{t('addPatient')}</h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <Plus className="w-6 h-6 rotate-45" />
              </button>
            </div>
            <form onSubmit={handleAddPatient} className="p-6 space-y-4">
              <Input
                label={t('fullName')}
                required
                value={newPatient.name}
                onChange={(e) => setNewPatient(prev => ({ ...prev, name: e.target.value }))}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label={t('age')}
                  type="number"
                  required
                  value={newPatient.age}
                  onChange={(e) => setNewPatient(prev => ({ ...prev, age: e.target.value }))}
                />
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">{t('gender')}</label>
                  <select
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                    value={newPatient.gender}
                    onChange={(e) => setNewPatient(prev => ({ ...prev, gender: e.target.value }))}
                  >
                    <option value="Male">{t('male')}</option>
                    <option value="Female">{t('female')}</option>
                    <option value="Other">{t('other')}</option>
                  </select>
                </div>
              </div>
              <Input
                label={t('village')}
                required
                value={newPatient.village}
                onChange={(e) => setNewPatient(prev => ({ ...prev, village: e.target.value }))}
              />
              <Input
                label={t('contact')}
                value={newPatient.contact}
                onChange={(e) => setNewPatient(prev => ({ ...prev, contact: e.target.value }))}
              />
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">{t('medicalHistory')}</label>
                <textarea
                  className="w-full border rounded-lg px-3 py-2 text-gray-800 bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 min-h-[100px]"
                  value={newPatient.medicalHistory}
                  onChange={(e) => setNewPatient(prev => ({ ...prev, medicalHistory: e.target.value }))}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" type="button" onClick={() => setShowAddModal(false)}>
                  {t('cancel')}
                </Button>
                <Button className="flex-1 gap-2" type="submit" disabled={isSaving}>
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                  {t('registerPatient')}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
