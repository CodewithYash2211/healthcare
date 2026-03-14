import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Card } from '../components/UI';
import { MapPin, Search, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { usePatients } from '../contexts/PatientContext';

// Fix typical Leaflet icon issue with bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const defaultCenter: [number, number] = [18.5204, 73.8567]; // Pune Coordinates

export const MapView = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { patients } = usePatients();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPatients, setFilteredPatients] = useState(patients);

  useEffect(() => {
    if (searchQuery.trim()) {
       setFilteredPatients(patients.filter(p => 
         p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
         p.village.toLowerCase().includes(searchQuery.toLowerCase())
       ));
    } else {
       setFilteredPatients(patients);
    }
  }, [searchQuery, patients]);

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col lg:flex-row gap-6 animate-in fade-in duration-500 text-gray-800">
      
      {/* Side Panel */}
      <Card className="w-full lg:w-96 flex flex-col overflow-hidden shrink-0 h-[400px] lg:h-full bg-white shadow-md rounded-xl">
        <div className="p-5 border-b border-slate-100 bg-white z-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-extrabold tracking-tight flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Patient Locations
            </h2>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Search patients or villages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border rounded-lg text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-50">
          {filteredPatients.map((p) => (
            <div 
              key={p.id}
              onClick={() => navigate(`/patients/${p.id}`)}
              className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm hover:border-blue-200 transition-all cursor-pointer group"
            >
              <h3 className="font-bold group-hover:text-blue-600 transition-colors">{p.name}</h3>
              <p className="text-sm text-slate-600 mt-1 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {p.village}
              </p>
              <p className="text-xs text-slate-400 mt-2 line-clamp-2 italic">"{p.symptoms}"</p>
            </div>
          ))}
          {filteredPatients.length === 0 && <p className="text-sm text-slate-400 p-4 text-center">No patients found with location data.</p>}
        </div>
      </Card>

      {/* Map Container */}
      <Card className="flex-1 relative overflow-hidden h-full min-h-[400px] shadow-md rounded-xl p-0">
        <MapContainer center={defaultCenter} zoom={10} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {filteredPatients.filter(p => p.location).map((p) => (
            <Marker key={p.id} position={[p.location!.lat, p.location!.lng]}>
              <Popup>
                <div className="font-sans min-w-[150px]">
                  <h3 className="font-bold text-sm mb-1">{p.name}</h3>
                  <p className="text-xs text-gray-600 mb-1"><strong>Village:</strong> {p.village}</p>
                  <p className="text-xs text-gray-500 mb-3 line-clamp-2"><strong>Symptoms:</strong> {p.symptoms}</p>
                  <button onClick={() => navigate(`/patients/${p.id}`)} className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded-lg w-full hover:bg-blue-700 font-bold transition-colors">View Profile</button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </Card>
      
    </div>
  );
};
