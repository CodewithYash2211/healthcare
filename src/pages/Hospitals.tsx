import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Card, Button } from '../components/UI';
import { Hospital, MapPin, Phone, Star, Clock, ArrowUpRight } from 'lucide-react';
import { motion } from 'motion/react';

const HOSPITALS = [
  {
    id: 1,
    name: "City Central Hospital",
    type: "Multi-Specialty",
    distance: "2.5 km",
    rating: 4.8,
    address: "123 Healthcare Ave, Downtown",
    phone: "+91 98765 43210",
    status: "Open 24/7",
    specialties: ["Cardiology", "Neurology", "Orthopedics"]
  },
  {
    id: 2,
    name: "Sunrise Care Clinic",
    type: "General Hospital",
    distance: "5.1 km",
    rating: 4.5,
    address: "45 West Side Road, District 4",
    phone: "+91 98765 43211",
    status: "Open 24/7",
    specialties: ["Pediatrics", "General Medicine", "Dermatology"]
  },
  {
    id: 3,
    name: "Metro Heart Institute",
    type: "Specialty Center",
    distance: "8.3 km",
    rating: 4.9,
    address: "78 Medical City Blvd, North Zone",
    phone: "+91 98765 43212",
    status: "Open 24/7",
    specialties: ["Cardiac Surgery", "Cardiology", "Emergency"]
  },
  {
    id: 4,
    name: "Hope Women & Child Care",
    type: "Maternity",
    distance: "12.0 km",
    rating: 4.7,
    address: "212 Family Lane, East District",
    phone: "+91 98765 43213",
    status: "Open 8 AM - 10 PM",
    specialties: ["Maternity", "Pediatrics", "Gynecology"]
  }
];

export const Hospitals = () => {
  const { t } = useLanguage();

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">{t('hospitals')}</h1>
          <p className="text-slate-500 font-medium">Find and refer patients to specialized partner facilities.</p>
        </div>
        <Button className="gap-2 shadow-emerald-500/20">
          <MapPin className="w-4 h-4" />
          <span className="hidden sm:inline">Map View</span>
          <span className="sm:hidden">Map</span>
        </Button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {HOSPITALS.map((hospital, index) => (
          <motion.div
            key={hospital.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
          >
            <Card className="p-6 hover:shadow-lg hover:border-emerald-200 transition-all group flex flex-col h-full cursor-pointer">
              <div className="flex items-start justify-between mb-4">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <Hospital className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                      {hospital.name}
                    </h2>
                    <p className="text-sm font-medium text-emerald-600 uppercase tracking-wider mt-0.5">
                      {hospital.type}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100 shrink-0">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-sm font-bold text-slate-700">{hospital.rating}</span>
                </div>
              </div>

              <div className="space-y-3 mb-6 mt-2 flex-grow">
                <div className="flex items-start gap-3 text-sm text-slate-600">
                  <MapPin className="w-4 h-4 mt-0.5 text-slate-400 shrink-0" />
                  <span>
                    {hospital.address} <span className="text-slate-400 font-medium">({hospital.distance})</span>
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{hospital.status}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{hospital.phone}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  {hospital.specialties.map(spec => (
                    <span key={spec} className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-semibold">
                      {spec}
                    </span>
                  ))}
                </div>
                <Button variant="outline" className="shrink-0 w-full sm:w-auto hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200">
                  Refer Case <ArrowUpRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
