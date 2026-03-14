import React, { useState, useEffect, useRef } from 'react';
import { ICameraVideoTrack, IRemoteVideoTrack } from 'agora-rtc-sdk-ng';
import { useLanguage } from '../contexts/LanguageContext';
import { Button, Card } from './UI';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  PhoneOff, 
  Maximize2, 
  Minimize2,
  Activity,
  User,
  Stethoscope,
  Heart,
  Wind
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Patient } from '../types';

interface VideoCallInterfaceProps {
  localVideoTrack: ICameraVideoTrack | null;
  remoteVideoTrack: IRemoteVideoTrack | null;
  onEndCall: () => void;
  patient: Patient;
  isConnected: boolean;
  isAudioMuted: boolean;
  isVideoMuted: boolean;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
}

export const VideoCallInterface = ({
  localVideoTrack,
  remoteVideoTrack,
  onEndCall,
  patient,
  isConnected,
  isAudioMuted,
  isVideoMuted,
  onToggleAudio,
  onToggleVideo,
}: VideoCallInterfaceProps) => {
  const { t } = useLanguage();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const remoteRef = useRef<HTMLDivElement>(null);
  const localRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (remoteVideoTrack && remoteRef.current) {
      remoteVideoTrack.play(remoteRef.current);
    }
    return () => remoteVideoTrack?.stop();
  }, [remoteVideoTrack]);

  useEffect(() => {
    if (localVideoTrack && localRef.current) {
      localVideoTrack.play(localRef.current);
    }
    return () => localVideoTrack?.stop();
  }, [localVideoTrack]);

  return (
    <div className={`fixed inset-0 z-50 bg-slate-900 flex flex-col md:flex-row overflow-hidden ${isFullscreen ? '' : 'p-2 md:p-6'}`}>
      {/* Main Video Area */}
      <div className="flex-1 relative bg-black rounded-3xl overflow-hidden shadow-2xl border border-slate-700/50">
        {/* Remote Video (Doctor or Patient) */}
        {remoteVideoTrack ? (
          <div ref={remoteRef} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 bg-slate-800">
            <div className="w-24 h-24 rounded-full bg-slate-700 flex items-center justify-center mb-4 animate-pulse">
              <User className="w-12 h-12" />
            </div>
            <p className="text-lg font-medium">
              {isConnected ? t('connecting') : t('waitingForDoctor')}
            </p>
          </div>
        )}

        {/* Local Video PIP */}
        <div className="absolute top-4 right-4 w-32 md:w-48 aspect-video bg-slate-800 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 z-10">
          {localVideoTrack && !isVideoMuted ? (
            <div ref={localRef} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-700">
              <User className="w-6 h-6 text-slate-400" />
            </div>
          )}
        </div>

        {/* Call Info Overlay */}
        <div className="absolute top-6 left-6 flex items-center gap-3">
          <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-2xl flex items-center gap-2 border border-white/10">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <span className="text-white text-sm font-bold uppercase tracking-wider">
              {isConnected ? t('sessionActive') : t('connecting')}
            </span>
          </div>
        </div>

        {/* Controls Overlay */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/30 backdrop-blur-xl p-4 rounded-3xl border border-white/10 shadow-2xl">
          <Button
            variant="outline"
            className={`w-14 h-14 rounded-2xl border-none transition-all ${
              isAudioMuted ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-white/10 text-white hover:bg-white/20'
            }`}
            onClick={onToggleAudio}
          >
            {isAudioMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </Button>

          <Button
            variant="outline"
            className={`w-14 h-14 rounded-2xl border-none transition-all ${
              isVideoMuted ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-white/10 text-white hover:bg-white/20'
            }`}
            onClick={onToggleVideo}
          >
            {isVideoMuted ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
          </Button>

          <Button
            variant="outline"
            className="w-14 h-14 rounded-2xl bg-white/10 text-white border-none hover:bg-white/20 transition-all"
            onClick={() => setIsFullscreen(!isFullscreen)}
          >
            {isFullscreen ? <Minimize2 className="w-6 h-6" /> : <Maximize2 className="w-6 h-6" />}
          </Button>

          <div className="w-px h-10 bg-white/10 mx-2" />

          <Button
            className="w-16 h-16 rounded-3xl bg-red-600 text-white hover:bg-red-700 shadow-xl shadow-red-900/40 hover:scale-110 active:scale-95 transition-all"
            onClick={onEndCall}
          >
            <PhoneOff className="w-8 h-8" />
          </Button>
        </div>
      </div>

      {/* Info Sidebar (Vitals & Patient Details) */}
      <div className="w-full md:w-80 lg:w-96 flex flex-col gap-4 md:ml-6 mt-4 md:mt-0">
        <Card className="p-6 bg-slate-800 border-slate-700 shadow-xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-2xl font-bold border border-emerald-500/30">
              {patient.name?.[0] || '?'}
            </div>
            <div>
              <h3 className="text-xl font-bold text-white leading-tight">{patient.name}</h3>
              <p className="text-slate-400 text-sm">{patient.age} yrs • {patient.gender}</p>
            </div>
          </div>

          <div className="space-y-3">
             <div className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-2xl border border-slate-700">
                <Stethoscope className="w-5 h-5 text-emerald-400" />
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Symptoms</p>
                  <p className="text-white text-sm line-clamp-2">{patient.symptoms || 'None reported'}</p>
                </div>
             </div>
          </div>
        </Card>

        {/* Real-time Vitals Monitoring */}
        <div className="flex-1 grid grid-cols-1 gap-4 overflow-y-auto">
          <Card className="p-6 bg-emerald-900/40 border-emerald-500/30 border shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-emerald-500/20 transition-all" />
            
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-emerald-300 font-bold flex items-center gap-2 uppercase tracking-widest text-xs">
                <Activity className="w-4 h-4 text-emerald-400" />
                Live Vitals
              </h4>
              <div className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                REAL-TIME
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-emerald-950/40 p-4 rounded-3xl border border-emerald-500/20 hover:bg-emerald-950/60 transition-colors">
                <Heart className="w-5 h-5 text-red-400 mb-2" />
                <p className="text-[10px] text-emerald-300/60 font-medium uppercase">{t('heartRate')}</p>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-3xl font-black text-white">{(patient.vitals as any)?.heartRate || '--'}</span>
                  <span className="text-xs text-white/40">BPM</span>
                </div>
              </div>

              <div className="bg-emerald-950/40 p-4 rounded-3xl border border-emerald-500/20 hover:bg-emerald-950/60 transition-colors">
                <Wind className="w-5 h-5 text-blue-400 mb-2" />
                <p className="text-[10px] text-emerald-300/60 font-medium uppercase">{t('pulse')}</p>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-3xl font-black text-white">{patient.vitals?.pulse || '--'}</span>
                  <span className="text-xs text-white/40">bpm</span>
                </div>
              </div>

              <div className="bg-emerald-950/40 p-4 rounded-3xl border border-emerald-500/20 hover:bg-emerald-950/60 transition-colors">
                <AnimatePresence>
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="w-5 h-5 text-emerald-400 mb-2"
                  >
                    <Activity className="w-5 h-5" />
                  </motion.div>
                </AnimatePresence>
                <p className="text-[10px] text-emerald-300/60 font-medium uppercase">{t('oxygenLevel')}</p>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-3xl font-black text-white">{(patient.vitals as any)?.oxygenLevel || '--'}</span>
                  <span className="text-xs text-white/40">%</span>
                </div>
              </div>

              <div className="bg-emerald-950/40 p-4 rounded-3xl border border-emerald-500/20 hover:bg-emerald-950/60 transition-colors">
                <Activity className="w-5 h-5 text-orange-400 mb-2" />
                <p className="text-[10px] text-emerald-300/60 font-medium uppercase">{t('temp')}</p>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-3xl font-black text-white">{patient.vitals?.temp || '--'}</span>
                  <span className="text-xs text-white/40">°C</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-emerald-500/20">
               <div className="flex items-center justify-between text-emerald-300/40 text-[10px] uppercase font-bold tracking-widest">
                  <span>Network Signal</span>
                  <span className="flex gap-0.5">
                    <div className="w-1 h-2 bg-emerald-500 rounded-full" />
                    <div className="w-1 h-3 bg-emerald-500 rounded-full" />
                    <div className="w-1 h-4 bg-emerald-500 rounded-full" />
                    <div className="w-1 h-5 bg-slate-700 rounded-full" />
                  </span>
               </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
