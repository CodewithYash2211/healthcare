import React, { useState, useRef } from 'react';
import { Mic, MicOff, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MultilingualVoiceInputProps {
  onTranscript: (transcript: string) => void;
  className?: string;
}

export const MultilingualVoiceInput: React.FC<MultilingualVoiceInputProps> = ({
  onTranscript,
  className = '',
}) => {
  const [isListening, setIsListening] = useState(false);
  const [liveText, setLiveText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recRef = useRef<any>(null);

  const startRecognition = () => {
    const SR: any =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SR) {
      setError('Use Chrome or Edge browser for voice input.');
      return;
    }

    const rec = new SR();

    rec.lang = 'en-US';     // English recognition
    rec.continuous = false; // stop after one utterance (more reliable)
    rec.interimResults = true;
    rec.maxAlternatives = 1;

    rec.onstart = () => {
      console.log('[Mic] Started listening');
      setIsListening(true);
      setError(null);
    };

    rec.onresult = (event: any) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += t;
        } else {
          interim += t;
        }
      }

      // Show live preview
      setLiveText(interim || final);

      // When finalised, push to input
      if (final) {
        console.log('[Mic] Final:', final);
        onTranscript(final.trim());
        setLiveText('');
      }
    };

    rec.onerror = (event: any) => {
      console.error('[Mic] Error:', event.error);

      if (event.error === 'no-speech') {
        // just stop — user can click again
        setIsListening(false);
        setLiveText('');
        return;
      }

      if (event.error === 'not-allowed' || event.error === 'permission-denied') {
        setError('Mic permission denied. Allow microphone access.');
      } else if (event.error === 'network') {
        setError('Network issue while processing voice.');
      } else {
        setError(`Voice error: ${event.error}`);
      }

      setIsListening(false);
      recRef.current = null;
    };

    rec.onend = () => {
      console.log('[Mic] Recognition ended');
      setIsListening(false);
      recRef.current = null;
    };

    try {
      rec.start();
      recRef.current = rec;
    } catch (err) {
      console.error('[Mic] Start error', err);
      setError('Could not start microphone.');
    }
  };

  const handleClick = () => {
    if (isListening) {
      recRef.current?.stop();
      setIsListening(false);
      setLiveText('');
      return;
    }

    startRecognition();
  };

  return (
    <div className={`relative flex items-center ${className}`}>
      <button
        type="button"
        onClick={handleClick}
        title={isListening ? 'Stop' : 'Speak'}
        className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-200 shadow-sm
          ${isListening
            ? 'bg-red-500 border-red-400 text-white animate-pulse shadow-red-200'
            : 'bg-white border-slate-300 text-emerald-600 hover:border-emerald-500 hover:shadow-md'
          }`}
      >
        {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
      </button>

      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            className="absolute left-full ml-3 whitespace-nowrap max-w-xs truncate bg-white border border-slate-200 text-slate-700 text-[11px] px-3 py-1.5 rounded-full shadow-md flex items-center gap-2"
          >
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping shrink-0" />
            {liveText ? `"${liveText}"` : 'Listening...'}
          </motion.div>
        )}
      </AnimatePresence>

      {error && !isListening && (
        <div className="absolute top-full left-0 mt-2 flex items-start gap-1 text-[11px] text-red-600 font-medium bg-red-50 border border-red-200 rounded px-2 py-1 whitespace-nowrap shadow z-50">
          <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
};
