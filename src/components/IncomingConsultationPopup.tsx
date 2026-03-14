import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TelemedicineSession } from '../types';
import { Button, Card } from './UI';
import { 
  Phone, 
  PhoneOff, 
  User, 
  Stethoscope, 
  UserRound,
  AlertCircle
} from 'lucide-react';

interface IncomingConsultationPopupProps {
  session: TelemedicineSession;
  onJoin: (session: TelemedicineSession) => void;
  onDecline: (session: TelemedicineSession) => void;
}

export const IncomingConsultationPopup = ({ 
  session, 
  onJoin, 
  onDecline 
}: IncomingConsultationPopupProps) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="w-full max-w-md"
      >
        <Card className="overflow-hidden border-none shadow-2xl bg-white">
          <div className="bg-emerald-600 p-6 text-white relative">
            <div className="absolute top-0 right-0 p-4 opacity-20">
              <Phone className="w-20 h-20 rotate-12" />
            </div>
            <div className="relative z-10 flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 animate-pulse">
                <Phone className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Incoming Consultation</h2>
                <p className="text-emerald-100 text-sm opacity-90">Requesting immediate assistance</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Patient Name</p>
                  <p className="text-lg font-bold text-slate-800">{session.patientName || 'Unknown Patient'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                  <UserRound className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Health Worker</p>
                  <p className="text-md font-semibold text-slate-700">{session.workerName || 'Swasthya Sevak'}</p>
                </div>
              </div>

              {session.symptoms && (
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-2 mb-2 text-slate-500">
                    <Stethoscope className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Reported Symptoms</span>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed italic">
                    "{session.symptoms}"
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button 
                variant="outline"
                className="flex-1 py-6 border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 rounded-2xl transition-all flex items-center justify-center gap-2"
                onClick={() => onDecline(session)}
              >
                <PhoneOff className="w-5 h-5" />
                <span>Decline</span>
              </Button>
              <Button 
                className="flex-1 py-6 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-200 rounded-2xl transition-all flex items-center justify-center gap-2"
                onClick={() => onJoin(session)}
              >
                <Phone className="w-5 h-5" />
                <span>Join Now</span>
              </Button>
            </div>
          </div>
          
          <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4 text-emerald-500" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Type: {session.type === 'video' ? 'Video Call' : 'Voice Call'}</span>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};
