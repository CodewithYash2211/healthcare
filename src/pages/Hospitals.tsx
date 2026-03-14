import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Card, Button } from '../components/UI';
import { Search, MapPin, Phone, Clock, ArrowUpRight, Navigation } from 'lucide-react';
import { motion } from 'motion/react';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { usePatients } from '../contexts/PatientContext';
import { addReferral } from '../localStore';
import { useAuth } from '../contexts/AuthContext';

// Fix typical Leaflet icon issue with bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const defaultCenter: [number, number] = [18.5204, 73.8567];

export const Hospitals = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { patients } = usePatients();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [isReferring, setIsReferring] = useState(false);
  
  const hospitalsData = [
    { id: '1', name: 'District Hospital Pune', lat: 18.5204, lng: 73.8567, location: 'Pune Central', contact: '+91 20 2612 8000', dist: '12 km', rating: 4.2 },
    { id: '2', name: 'Sassoon General Hospital', lat: 18.5284, lng: 73.8732, location: 'Near Pune Station', contact: '+91 20 2612 8000', dist: '15 km', rating: 4.5 },
    { id: '3', name: 'Rural Health Center Shivapur', lat: 18.3188, lng: 73.8519, location: 'Khed Shivapur', contact: '+91 98765 12345', dist: '5 km', rating: 4.0 },
    { id: '4', name: 'PHC Wagholi', lat: 18.5808, lng: 73.9786, location: 'Wagholi, Pune', contact: '+91 98765 54321', dist: '8 km', rating: 4.1 },
  ];

  const filteredHospitals = hospitalsData.filter(h => 
    h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleReferPatient = async (hospitalName: string) => {
    if (!selectedPatientId) {
      alert('Please select a patient first.');
      return;
    }
    if (!user) return;

    const patient = patients.find(p => p.id === selectedPatientId);
    if (!patient) return;

    setIsReferring(true);
    try {
      await addReferral({
        patientId: patient.id,
        patientName: patient.name,
        hospitalName: hospitalName,
        referredBy: user.uid,
      });
      alert('Patient successfully referred to hospital.');
      setSelectedPatientId('');
    } catch (err) {
      console.error(err);
      alert('Failed to refer patient.');
    } finally {
      setIsReferring(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent tracking-tight flex items-center gap-2 mb-1">
            <Navigation className="w-8 h-8 text-blue-600" />
            Referral Hospitals
          </h1>
          <p className="text-slate-500 font-medium">{t('hospitalSearchDescription')}</p>
        </div>
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto mt-4 md:mt-0">
          <div className="relative">
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="w-full md:w-64 pl-4 pr-10 py-3 rounded-2xl bg-white border border-slate-100 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none font-medium text-gray-800"
            >
              <option value="">Select Patient to Refer</option>
              {patients.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <ArrowUpRight className="w-4 h-4 text-slate-400 rotate-45" />
            </div>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white border border-slate-100 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all text-gray-800"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </header>

      {/* Map Section */}
      <Card className="h-[400px] relative overflow-hidden shadow-md rounded-xl p-0 border-none">
        <MapContainer center={defaultCenter} zoom={10} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {filteredHospitals.map((h) => (
            <Marker key={h.id} position={[h.lat, h.lng]}>
              <Popup>
                <div className="font-sans">
                  <h3 className="font-bold text-sm mb-1">{h.name}</h3>
                  <p className="text-xs text-gray-600">{h.contact}</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredHospitals.map((h) => (
          <motion.div key={h.id} whileHover={{ y: -4 }}>
            <Card className="p-6 h-full flex flex-col hover:border-blue-200 transition-all shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
                  <MapPin className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-1 bg-amber-50 text-amber-600 px-2 py-1 rounded-lg text-xs font-bold">
                  ★ {h.rating}
                </div>
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-1 leading-tight">{h.name}</h3>
              <p className="text-sm text-slate-500 mb-4">{h.location}</p>
              
              <div className="mt-auto space-y-3">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>{h.dist} away</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span>{h.contact}</span>
                </div>
                <Button 
                  className="w-full mt-2 gap-2 bg-blue-600 hover:bg-blue-700" 
                  size="sm"
                  onClick={() => handleReferPatient(h.name)}
                  disabled={isReferring}
                >
                  {isReferring ? 'Referring...' : t('referNow')}
                  <ArrowUpRight className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
