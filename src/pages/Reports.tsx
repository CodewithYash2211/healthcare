import React, { useEffect, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Card, Button } from '../components/UI';
import { FileText, Search, Activity, ChevronRight, Download } from 'lucide-react';
import { getCases, getPatients } from '../localStore';
import { HealthCase, Patient } from '../types';
import { useNavigate } from 'react-router-dom';

export const Reports = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cases, setCases] = useState<(HealthCase & { patient?: Patient })[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const allCases = getCases();
    const allPatients = getPatients();
    
    // Enrich cases with patient data
    const enriched = allCases.map(c => ({
      ...c,
      patient: allPatients.find(p => p.id === c.patientId)
    })).reverse(); // Newest first

    // Role filtering: Workers only see their own reports. Doctors see all.
    const filtered = user?.role === 'worker' 
      ? enriched.filter(c => c.workerId === user.uid)
      : enriched;

    setCases(filtered);
  }, [user]);

  const getUrgencyColor = (urgency?: string) => {
    switch(urgency) {
      case 'High': return 'text-red-700 bg-red-100 border-red-200';
      case 'Medium': return 'text-amber-700 bg-amber-100 border-amber-200';
      case 'Low': return 'text-emerald-700 bg-emerald-100 border-emerald-200';
      default: return 'text-slate-700 bg-slate-100 border-slate-200';
    }
  };

  const filteredCases = cases.filter(c => 
    c.patient?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.symptoms.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-6xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-1">{t('reports')}</h1>
          <p className="text-slate-500 font-medium">View historical health screening reports, AI diagnoses, and consultation results.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2 bg-white hidden sm:flex">
             <Download className="w-4 h-4" /> Export All
          </Button>
        </div>
      </header>

      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search reports by patient name or symptoms..."
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </Card>

      <div className="space-y-4">
        {filteredCases.map((c) => {
          const aiData = c.aiAnalysis ? JSON.parse(c.aiAnalysis) : null;
          return (
            <Card key={c.id} className="p-0 overflow-hidden hover:border-emerald-200 transition-colors cursor-pointer group" onClick={() => navigate(`/cases/${c.id}`)}>
              <div className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
                {/* Info Block (Left) */}
                <div className="flex-1 p-5 md:p-6 flex flex-col md:flex-row gap-4 md:items-center">
                   <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-200 shrink-0 mx-auto md:mx-0">
                     <FileText className="w-6 h-6" />
                   </div>
                   <div className="flex-1 text-center md:text-left">
                      <div className="flex flex-col md:flex-row md:items-center gap-2 mb-1">
                        <h3 className="font-bold text-slate-900 text-lg group-hover:text-emerald-700 transition-colors">{c.patient?.name || 'Unknown Patient'}</h3>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mx-auto md:mx-0 w-max border ${getUrgencyColor(aiData?.urgency)}`}>
                          {aiData?.urgency || 'Pending'} Risk
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 line-clamp-1">{c.symptoms}</p>
                   </div>
                </div>
                
                {/* Meta Block (Middle) */}
                <div className="shrink-0 p-5 md:p-6 flex flex-row sm:flex-col justify-between items-center sm:items-end gap-2 bg-slate-50/50 min-w-[200px]">
                   <div className="text-right flex flex-col items-start sm:items-end">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Status</span>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                        c.status === 'pending' ? 'bg-amber-100 text-amber-700 border-amber-200' : 
                        c.status === 'pending_sync' ? 'bg-slate-100 text-slate-600 border-slate-200' :
                        'bg-emerald-100 text-emerald-700 border-emerald-200'
                      }`}>
                        {t(c.status)}
                      </span>
                   </div>
                   <div className="text-right">
                     <span className="text-xs font-medium text-slate-400 block">{new Date(c.timestamp).toLocaleDateString()}</span>
                     <span className="text-xs font-semibold text-slate-500">{new Date(c.timestamp).toLocaleTimeString()}</span>
                   </div>
                </div>
                
                {/* Action Block (Right) */}
                <div className="shrink-0 w-16 bg-slate-50 flex items-center justify-center group-hover:bg-emerald-50 transition-colors">
                   <ChevronRight className="w-6 h-6 text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </Card>
          );
        })}
        
        {filteredCases.length === 0 && (
          <Card className="p-16 border-dashed flex flex-col items-center justify-center text-center">
            <Activity className="w-16 h-16 text-slate-200 mb-4" />
            <h3 className="text-xl font-bold text-slate-900">No Reports Found</h3>
            <p className="text-slate-500 mt-2">Try adjusting your search criteria or running a health screening first.</p>
          </Card>
        )}
      </div>
    </div>
  );
};
