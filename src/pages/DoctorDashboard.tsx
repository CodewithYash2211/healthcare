import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Card, Button } from '../components/UI';
import { usePatients } from '../contexts/PatientContext';
import { Clock, Users, Activity, Stethoscope, ArrowUpRight, MapPin } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { getReferrals, subscribe } from '../localStore';
import { Referral } from '../types';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup, useMap, Tooltip } from 'react-leaflet';
import L from 'leaflet';

// Fix typical Leaflet icon issue with bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Helper component to handle map centering
function MapController({ center }: { center: [number, number] | null }) {
  const map = useMap();
  React.useEffect(() => {
    if (center) {
      map.setView(center, 14, { animate: true });
    }
  }, [center, map]);
  return null;
}

// Village coordinate mapping for fallback geocoding
const villageCoords: Record<string, [number, number]> = {
  'Pune': [18.5204, 73.8567],
  'Wagholi': [18.5789, 73.9781],
  'Hadapsar': [18.5089, 73.9259],
  'Kothrud': [18.5074, 73.8077],
  'Viman Nagar': [18.5679, 73.9143],
  'Shivapur': [18.3587, 73.8965],
  'Saswad': [18.3418, 73.9317],
  'Loni Kalbhor': [18.4839, 74.0194],
  'Jalgaon': [21.0077, 75.5626],
  'Nashik': [19.9975, 73.7898],
  'Aurangabad': [19.8762, 75.3433],
  'Ratnagiri': [16.9902, 73.3120],
};

const getPatientPos = (p: any): [number, number] | null => {
  if (p.location?.lat && p.location?.lng) return [p.location.lat, p.location.lng];
  
  // Try exact match
  if (villageCoords[p.village]) return villageCoords[p.village];
  
  // Try case-insensitive match
  const villageKey = Object.keys(villageCoords).find(v => v.toLowerCase() === p.village?.toLowerCase());
  if (villageKey) return villageCoords[villageKey];

  // Fallback: Return a coordinate near the base area (Pune) with a deterministic jitter based on name
  // This ensures EVERY patient has a marker somewhere.
  const hash = (p.name || '').split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
  const jitterLat = (hash % 100) / 500;
  const jitterLng = (hash % 80) / 400;
  return [18.5204 + jitterLat, 73.8567 + jitterLng];
};

export const DoctorDashboard = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { patients } = usePatients();
  const [referrals, setReferrals] = React.useState<Referral[]>([]);
  const [mapCenter, setMapCenter] = React.useState<[number, number] | null>(null);
  const [selectedPatient, setSelectedPatient] = React.useState<any | null>(null);

  React.useEffect(() => {
    const refresh = () => setReferrals([...getReferrals()]);
    refresh();
    return subscribe(refresh);
  }, []);

  const handleRowClick = (p: any) => {
    setSelectedPatient(p);
    const pos = getPatientPos(p);
    if (pos) {
      setMapCenter(pos);
    }
  };

  const pendingCount = patients.filter(p => p.status === 'Waiting').length;

  const stats = [
    { label: t('totalPatients'), value: patients.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
    { label: t('pendingConsultations'), value: pendingCount, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 bg-slate-50 min-h-screen text-gray-800">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent tracking-tight mb-1">{t('dashboard')}</h1>
          <p className="text-gray-500 font-medium">Dr. <span className="text-gray-800">{user?.name}</span> • {pendingCount} {t('pendingConsultations')}</p>
        </div>
        <div className="flex gap-3">
          <Button className="gap-2 bg-blue-600 text-white hover:bg-blue-700 shadow-md" onClick={() => navigate('/pending-cases')}>
            <Stethoscope className="w-4 h-4" />
            <span className="hidden sm:inline">{t('startQueue')}</span>
            <span className="sm:hidden">Queue</span>
          </Button>
        </div>
      </header>

      {/* Doctor Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 xl:gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1, type: 'spring', stiffness: 300, damping: 20 }}
          >
            <Card className={`bg-white shadow-md rounded-xl p-5 lg:p-6 flex flex-col justify-between h-full border ${stat.border} hover:shadow-lg transition-shadow`}>
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                  <stat.icon className="w-5 h-5 lg:w-6 lg:h-6" />
                </div>
              </div>
              <div>
                <p className="text-2xl lg:text-3xl font-bold text-gray-800 tracking-tight">{stat.value}</p>
                <p className="text-sm font-medium text-gray-500 mt-1">{stat.label}</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left Column (Spans 3): Patient Queue Area */}
        <div className="xl:col-span-3 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-800 tracking-tight flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" />
              {t('patientQueue')}
            </h2>
            <Link to="/pending-cases" className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
              {t('viewAll')} <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Map Integration */}
          <Card className="bg-white shadow-md rounded-xl overflow-hidden p-0 border-none h-[500px] w-full relative z-0">
            <MapContainer 
              center={[18.5204, 73.8567]} 
              zoom={10} 
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={false}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapController center={mapCenter} />
              {patients.map((p) => {
                const pos = getPatientPos(p);
                if (!pos) return null;
                const isSelected = selectedPatient?.id === p.id;
                
                // Red icon for selected, default blue for others
                const customIcon = L.icon({
                  iconUrl: isSelected 
                    ? 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png'
                    : 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
                  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
                  iconSize: [25, 41],
                  iconAnchor: [12, 41],
                  popupAnchor: [1, -34],
                  shadowSize: [41, 41]
                });

                return (
                  <Marker 
                    key={p.id} 
                    position={pos} 
                    icon={customIcon}
                    eventHandlers={{
                      click: () => handleRowClick(p)
                    }}
                  >
                    <Tooltip permanent direction="top" offset={[0, -40]}>
                      <span className="font-bold text-xs">{p.name || 'Unknown'}</span>
                    </Tooltip>
                    <Popup autoPan={false}>
                      <div className="font-sans min-w-[150px]">
                        <h3 className="font-bold text-sm mb-1">{p.name || 'Unknown'}</h3>
                        <p className="text-xs text-gray-600 mb-1"><strong>Village:</strong> {p.village || 'N/A'}</p>
                        <p className="text-xs text-gray-500 mb-3 line-clamp-2"><strong>Symptoms:</strong> {p.symptoms || 'None'}</p>
                        <button 
                          onClick={() => navigate(`/patients/${p.id}`)} 
                          className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded-lg w-full hover:bg-blue-700 font-bold transition-colors"
                        >
                          View Profile
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </Card>

          <Card className="bg-white shadow-md rounded-xl overflow-hidden">
            {patients.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-6 py-4 text-sm font-semibold text-gray-600">Patient Name</th>
                      <th className="px-6 py-4 text-sm font-semibold text-gray-600">Age</th>
                      <th className="px-6 py-4 text-sm font-semibold text-gray-600">Symptoms</th>
                      <th className="px-6 py-4 text-sm font-semibold text-gray-600">Village</th>
                      <th className="px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
                      <th className="px-6 py-4 text-sm font-semibold text-gray-600">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {patients.map((p) => (
                      <tr 
                        key={p.id} 
                        onClick={() => handleRowClick(p)}
                        className={`hover:bg-slate-50 transition-colors cursor-pointer ${selectedPatient?.id === p.id ? 'bg-blue-50/50 border-l-4 border-blue-500' : ''}`}
                      >
                        <td className="px-6 py-4 font-semibold text-gray-800">{p.name || 'Unknown'}</td>
                        <td className="px-6 py-4 text-gray-600">{p.age || '--'}</td>
                        <td className="px-6 py-4 text-gray-500 max-w-xs truncate">{p.symptoms || 'No symptoms reported'}</td>
                        <td className="px-6 py-4 text-gray-600">{p.village || 'N/A'}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                            p.status === 'Waiting' ? 'bg-amber-100 text-amber-700' : 
                            p.status === 'Referred' ? 'bg-blue-100 text-blue-700' :
                            'bg-emerald-100 text-emerald-700'
                          }`}>
                            {p.status || 'Pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => { e.stopPropagation(); navigate(`/patients/${p.id}`); }}
                              className="p-2 hover:bg-white rounded-lg transition-colors text-blue-600 font-bold flex items-center gap-1 border border-transparent hover:border-blue-100"
                            >
                              View
                            </button>
                            {getPatientPos(p) && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRowClick(p);
                                  window.scrollTo({ top: 400, behavior: 'smooth' });
                                }}
                                className="p-2 hover:bg-white rounded-lg transition-colors text-emerald-600 font-bold flex items-center gap-1 border border-transparent hover:border-emerald-100"
                              >
                                <MapPin className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 border-dashed flex flex-col items-center justify-center text-center">
                <h3 className="text-lg font-bold text-gray-800">No patients in queue</h3>
              </div>
            )}
          </Card>
        </div>

        {/* Patient Detail Modal Overlay */}
        <AnimatePresence>
          {selectedPatient && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl"
              >
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-white">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xl font-bold">
                      {selectedPatient.name?.[0] || '?'}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{selectedPatient.name || 'Unknown'}</h2>
                      <p className="text-sm text-gray-500">{selectedPatient.age} {t('years')} • {t((selectedPatient.gender || 'other').toLowerCase())}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedPatient(null)} 
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <Activity className="w-6 h-6 rotate-45" />
                  </button>
                </div>
                
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-4 rounded-2xl">
                      <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">{t('village')}</p>
                      <p className="font-semibold text-slate-800 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-blue-500" />
                        {selectedPatient.village}
                      </p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl">
                      <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Status</p>
                      <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase">
                        {selectedPatient.status}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Symptoms</p>
                    <p className="text-sm text-gray-700 bg-amber-50/50 p-4 rounded-2xl border border-amber-100 shadow-sm leading-relaxed italic">
                      {selectedPatient.symptoms || 'No symptoms reported'}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Recent Vitals</p>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center p-2 rounded-xl border border-slate-100">
                        <p className="text-[8px] uppercase text-slate-400">Temp</p>
                        <p className="text-sm font-bold text-slate-800">{selectedPatient.vitals?.temp || '--'}°C</p>
                      </div>
                      <div className="text-center p-2 rounded-xl border border-slate-100">
                        <p className="text-[8px] uppercase text-slate-400">BP</p>
                        <p className="text-sm font-bold text-slate-800">{selectedPatient.vitals?.bp || '--'}</p>
                      </div>
                      <div className="text-center p-2 rounded-xl border border-slate-100">
                        <p className="text-[8px] uppercase text-slate-400">Pulse</p>
                        <p className="text-sm font-bold text-slate-800">{selectedPatient.vitals?.pulse || '--'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
                  <Button variant="outline" className="flex-1 bg-white" onClick={() => setSelectedPatient(null)}>
                    Close
                  </Button>
                  <Button className="flex-1 gap-2 shadow-lg shadow-blue-500/20 bg-blue-600 hover:bg-blue-700" onClick={() => navigate(`/patients/${selectedPatient.id}`)}>
                    View Full Report
                    <ArrowUpRight className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Referrals Section */}
        <div className="xl:col-span-3 space-y-6 mt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-800 tracking-tight flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-500" />
              Hospital Referrals
            </h2>
          </div>

          <Card className="bg-white shadow-md rounded-xl overflow-hidden">
            {referrals.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-6 py-4 text-sm font-semibold text-gray-600">Patient</th>
                      <th className="px-6 py-4 text-sm font-semibold text-gray-600">Referred To</th>
                      <th className="px-6 py-4 text-sm font-semibold text-gray-600">Created</th>
                      <th className="px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {referrals.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-semibold text-gray-800">{r.patientName}</td>
                        <td className="px-6 py-4 text-blue-600 font-medium">{r.hospitalName}</td>
                        <td className="px-6 py-4 text-gray-500 text-sm">
                          {new Date(r.createdAt).toLocaleDateString()} {new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-700">
                            {r.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 border-dashed flex flex-col items-center justify-center text-center">
                <p className="text-gray-500 font-medium">No active hospital referrals</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
