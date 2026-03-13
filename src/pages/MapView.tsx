import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, MarkerClusterer } from '@react-google-maps/api';
import { useLanguage } from '../contexts/LanguageContext';
import { Card, Button } from '../components/UI';
import { MapPin, Search, AlertCircle, FileText, Navigation, WifiOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getCases, getPatients, subscribe } from '../localStore';
import { Patient, HealthCase } from '../types';

const containerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '0.75rem'
};

const defaultCenter = {
  lat: 20.5937,
  lng: 78.9629 // Default center of India
};

// Generate random coordinates near center for cases without locations
const generateRandomCoordinates = (base: {lat: number, lng: number}, radius = 2) => {
  return {
    lat: base.lat + (Math.random() - 0.5) * radius,
    lng: base.lng + (Math.random() - 0.5) * radius
  };
};

interface MapPatientNode {
  id: string;
  name: string;
  age: number;
  village: string;
  coordinates: { lat: number; lng: number };
  riskLevel: string;
  symptoms: string[];
  syncStatus: string;
  caseId: string;
}

export const MapView = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  // You would typically store the API key in `.env.local`
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: (import.meta as any).env.VITE_GOOGLE_MAPS_API_KEY || ''
  });

  const [map, setMap] = useState<any>(null);
  const [selectedPatient, setSelectedPatient] = useState<MapPatientNode | null>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [searchQuery, setSearchQuery] = useState('');
  const [mapNodes, setMapNodes] = useState<MapPatientNode[]>([]);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    // Refresh handler for data
    const refreshData = () => {
      const cases = getCases();
      const patients = getPatients();
      
      const nodes: MapPatientNode[] = cases.map(c => {
        const patient = patients.find(p => p.id === c.patientId);
        const aiData = c.aiAnalysis ? JSON.parse(c.aiAnalysis) : null;
        let coords = patient?.location;
        
        // Ensure markers display by faking coords if patient offline data is missing
        if (!coords) {
           coords = generateRandomCoordinates(defaultCenter, 5); // Broad placement
        }
        
        return {
          id: patient?.id || `unknown-${c.id}`,
          caseId: c.id,
          name: patient?.name || 'Unknown Patient',
          age: patient?.age || 0,
          village: patient?.village || 'Unknown Location',
          coordinates: coords,
          riskLevel: aiData?.urgency || 'Medium',
          symptoms: [c.symptoms],
          syncStatus: c.syncStatus || 'synced'
        };
      });
      
      setMapNodes(nodes);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('sehatsetu:sync-complete', refreshData);
    
    refreshData();
    const unsub = subscribe(refreshData);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('sehatsetu:sync-complete', refreshData);
      unsub();
    };
  }, []);

  const onLoad = useCallback(function callback(map: any) {
    if (mapNodes.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      mapNodes.forEach(({ coordinates }) => {
        bounds.extend(coordinates);
      });
      map.fitBounds(bounds);
    }
    setMap(map);
  }, [mapNodes]);

  const onUnmount = useCallback(function callback() {
    setMap(null);
  }, []);

  const getMarkerIcon = (riskLevel: string) => {
    let url = 'http://maps.google.com/mapfiles/ms/icons/green-dot.png';
    if (riskLevel === 'High') url = 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';
    if (riskLevel === 'Medium') url = 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png';
    
    return {
      url,
      scaledSize: isLoaded && window.google ? new window.google.maps.Size(40, 40) : null
    };
  };

  const getRiskColor = (risk: string) => {
    switch(risk) {
      case 'High': return 'text-red-600 bg-red-50 border-red-200';
      case 'Medium': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'Low': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      default: return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 animate-in fade-in">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-slate-900">Map Loading Error</h2>
        <p className="text-slate-500 text-center mt-2 max-w-md">
          Unable to load Google Maps. Please check your API key configuration in the .env file.
        </p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col lg:flex-row gap-6 animate-in fade-in duration-500">
      
      {/* Side Panel */}
      <Card className="w-full lg:w-96 flex flex-col overflow-hidden shrink-0 h-[400px] lg:h-full">
        <div className="p-5 border-b border-slate-100 bg-white z-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-600" />
              Patient Map
            </h2>
            {isOffline && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold border border-slate-200">
                <WifiOff className="w-3.5 h-3.5" />
                Offline
              </div>
            )}
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Search map patients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-50/50">
          {mapNodes.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.village.toLowerCase().includes(searchQuery.toLowerCase())).map((p) => (
            <div 
              key={p.id}
              onClick={() => {
                setSelectedPatient(p);
                if (map) {
                  map.panTo(p.coordinates);
                  map.setZoom(14);
                }
              }}
              className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                selectedPatient?.id === p.id 
                  ? 'border-emerald-500 bg-white shadow-md' 
                  : 'border-slate-100 bg-white hover:border-slate-300 hover:shadow-sm'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-slate-900">{p.name} <span className="text-slate-500 font-medium text-sm">({p.age}y)</span></h3>
                <span className={`px-2 py-0.5 rounded-md text-[10px] uppercase tracking-wider font-bold border ${getRiskColor(p.riskLevel)}`}>
                  {p.riskLevel}
                </span>
              </div>
              
              {p.syncStatus === 'pending' && (
                <div className="mb-2 inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  <WifiOff className="w-3 h-3" /> Pending Sync
                </div>
              )}
              
              <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                {p.symptoms.join(', ')}
              </p>
              <div className="flex items-center justify-between mt-auto">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                  <Navigation className="w-3.5 h-3.5 text-slate-400" />
                  {p.village}
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/patients/${p.id}`);
                  }}
                  className="text-emerald-600 hover:text-emerald-700 text-sm font-semibold flex items-center gap-1 transition-colors"
                >
                  Details <FileText className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Map Container */}
      <Card className="flex-1 relative overflow-hidden h-full min-h-[400px]">
        {!isLoaded ? (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          </div>
        ) : (
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={defaultCenter}
            zoom={8}
            onLoad={onLoad}
            onUnmount={onUnmount}
            options={{
              mapTypeControl: false,
              streetViewControl: false,
              fullscreenControl: true,
              styles: [
                {
                  featureType: "poi.medical",
                  elementType: "geometry",
                  stylers: [{ color: "#fbc02d" }]
                }
              ]
            }}
          >
            <MarkerClusterer>
              {(clusterer) => (
                <>
                  {mapNodes.map((p) => (
                    <Marker
                      key={p.id}
                      position={p.coordinates}
                      onClick={() => setSelectedPatient(p)}
                      icon={getMarkerIcon(p.riskLevel)}
                      clusterer={clusterer}
                      animation={selectedPatient?.id === p.id ? window.google.maps.Animation.BOUNCE : undefined}
                    />
                  ))}
                </>
              )}
            </MarkerClusterer>

            {selectedPatient && (
              <InfoWindow
                position={selectedPatient.coordinates}
                onCloseClick={() => setSelectedPatient(null)}
              >
                <div className="p-1 max-w-[200px]">
                  <h3 className="font-bold text-slate-900 text-base mb-1">{selectedPatient.name}</h3>
                  <div className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold uppercase mb-2 border ${getRiskColor(selectedPatient.riskLevel)}`}>
                    {selectedPatient.riskLevel} Risk
                  </div>
                  <p className="text-xs text-slate-600 mb-2 leading-relaxed">
                    <strong>Symptoms:</strong> {selectedPatient.symptoms.join(', ')}
                  </p>
                  
                  {selectedPatient.syncStatus === 'pending' && (
                    <p className="text-xs text-amber-600 font-semibold mb-2 flex items-center gap-1">
                      <WifiOff className="w-3.5 h-3.5" /> Offline Data (Pending Sync)
                    </p>
                  )}
                  
                  <button 
                    onClick={() => navigate(`/cases/${selectedPatient.caseId}`)}
                    className="w-full mt-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-1.5 px-3 rounded transition-colors"
                  >
                    View Report
                  </button>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        )}
      </Card>
      
    </div>
  );
};
