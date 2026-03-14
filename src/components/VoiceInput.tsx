import React, { useState, useEffect, useCallback } from 'react';
import { Mic, MicOff, Loader2, AlertCircle } from 'lucide-react';
import { Button } from './UI';
import { motion, AnimatePresence } from 'motion/react';

interface VoiceInputProps {
  onTranscript: (transcript: string) => void;
  language?: string;
  className?: string;
  autoStop?: boolean;
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export const VoiceInput: React.FC<VoiceInputProps> = ({ 
  onTranscript, 
  language = 'en-US',
  className = '',
  autoStop = true 
}) => {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setError('Browser does not support speech recognition.');
      return;
    }

    const recognitionInstance = new SpeechRecognition();
    recognitionInstance.continuous = !autoStop;
    recognitionInstance.interimResults = true;
    recognitionInstance.lang = language === 'hi' ? 'hi-IN' : language === 'mr' ? 'mr-IN' : 'en-US';

    recognitionInstance.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognitionInstance.onend = () => {
      setIsListening(false);
    };

    recognitionInstance.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      if (event.error === 'not-allowed') {
        setError('Microphone permission denied.');
      } else {
        setError('Failed to recognize speech.');
      }
    };

    recognitionInstance.onresult = (event: any) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        onTranscript(finalTranscript);
      }
    };

    setRecognition(recognitionInstance);
  }, [language, autoStop, onTranscript]);

  const toggleListening = useCallback(() => {
    if (!recognition) return;

    if (isListening) {
      recognition.stop();
    } else {
      try {
        recognition.start();
      } catch (err) {
        console.error('Recognition start error:', err);
      }
    }
  }, [recognition, isListening]);

  return (
    <div className={`relative flex items-center ${className}`}>
      <Button
        variant={isListening ? 'danger' : 'outline'}
        size="md"
        className={`rounded-full shadow-lg transition-all duration-300 ${
          isListening ? 'ring-4 ring-red-500/30 animate-pulse' : 'hover:border-emerald-500'
        }`}
        onClick={toggleListening}
        disabled={!!error && error.includes('support')}
        title={isListening ? 'Stop Listening' : 'Start Voice Input'}
      >
        <AnimatePresence mode="wait">
          {isListening ? (
            <motion.div
              key="listening"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <MicOff className="w-5 h-5" />
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <Mic className="w-5 h-5 text-emerald-600" />
            </motion.div>
          )}
        </AnimatePresence>
      </Button>

      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="absolute left-full ml-3 whitespace-nowrap bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg flex items-center gap-1.5"
          >
            <span className="flex h-1.5 w-1.5 ">
              <span className="animate-ping absolute inline-flex h-1.5 w-1.5 rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
            </span>
            LISTENING...
          </motion.div>
        )}
      </AnimatePresence>

      {error && !isListening && (
        <div className="absolute top-full left-0 mt-2 whitespace-nowrap flex items-center gap-1 text-[10px] text-red-500 font-medium">
          <AlertCircle className="w-3 h-3" />
          {error}
        </div>
      )}
    </div>
  );
};
