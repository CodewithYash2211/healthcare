import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Button, Card, Input } from '../components/UI';
import { analyzeSymptoms } from '../services/gemini';
import { getPatients, addCase, subscribe } from '../localStore';
import { Patient } from '../types';
import {
  Mic,
  MicOff,
  Send,
  Bot,
  User,
  Loader2,
  AlertTriangle,
  Save,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MultilingualVoiceInput } from '../components/MultilingualVoiceInput';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  analysis?: any;
}

export const AIAssistant = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', content: t('aiAssistantWelcome') }
  ]);
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [savedCaseId, setSavedCaseId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const refresh = () => {
      const all = getPatients();
      setPatients(user?.role === 'worker' ? all.filter(p => p.workerId === user.uid) : all);
    };
    refresh();
    return subscribe(refresh);
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (text?: string) => {
    const content = text || input;
    if (!content.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsAnalyzing(true);
    setSavedCaseId(null);

    try {
      const analysis = await analyzeSymptoms(content, language);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: analysis.analysis,
        analysis
      }]);
    } catch (error: any) {
      console.error('[AIAssistant] analyzeSymptoms failed:', error?.message || error);
      const isKeyMissing = error?.message?.includes('API_KEY') || error?.message?.includes('GEMINI_API_KEY');
      const fallbackAnalysis = {
        analysis: isKeyMissing
          ? '⚠️ Gemini API key not configured. Please add VITE_GEMINI_API_KEY to your .env.local file and restart the dev server.'
          : 'Possible conditions based on symptoms: • Fever • Viral infection • Flu',
        urgency: 'Medium',
        nextSteps: isKeyMissing
          ? ['See README or walkthrough.md for setup instructions.']
          : ['Rest and monitor temperature', 'Stay hydrated', 'Consult a doctor if symptoms persist beyond 3 days']
      };

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: fallbackAnalysis.analysis,
        analysis: fallbackAnalysis
      }]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveCase = async (analysis: any, symptoms: string) => {
    if (!selectedPatientId || !user) {
      alert(t('selectPatientFirst'));
      return;
    }
    setIsSaving(true);
    try {
      const saved = await addCase({
        patientId: selectedPatientId,
        workerId: user.uid,
        symptoms,
        aiAnalysis: JSON.stringify(analysis),
        status: 'pending',
      });
      setSavedCaseId(saved.id);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleVoiceTranscript = useCallback((transcript: string) => {
    console.log('[AIAssistant] Received transcript:', transcript);
    setInput(prev => prev ? `${prev} ${transcript}` : transcript);
  }, []);

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col gap-4">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent tracking-tight flex items-center gap-2 mb-1">
          <Bot className="w-8 h-8 text-emerald-600" />
          {t('aiAssistant')}
        </h1>
        <div className="flex items-center gap-2">
          <select
            value={selectedPatientId}
            onChange={(e) => setSelectedPatientId(e.target.value)}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
          >
            <option value="">{t('choosePatient')}</option>
            {patients.map(p => (
              <option key={p.id} value={p.id}>{p.name} ({p.village})</option>
            ))}
          </select>
        </div>
      </header>

      <Card className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                  {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                </div>
                <div className="space-y-2">
                  <div className={`p-4 rounded-2xl text-sm ${msg.role === 'user'
                      ? 'bg-emerald-600 text-white rounded-tr-none'
                      : 'bg-slate-100 text-slate-800 rounded-tl-none'
                    }`}>
                    {msg.content}
                  </div>

                  {msg.analysis && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase flex items-center gap-1 ${msg.analysis.urgency === 'High' ? 'bg-red-100 text-red-700' :
                            msg.analysis.urgency === 'Medium' ? 'bg-amber-100 text-amber-700' :
                              'bg-emerald-100 text-emerald-700'
                          }`}>
                          <AlertTriangle className="w-3 h-3" />
                          {msg.analysis.urgency} {t('urgency')}
                        </span>
                        {savedCaseId ? (
                          <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> {t('caseSaved')}
                          </span>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-[10px] gap-1"
                            onClick={() => handleSaveCase(msg.analysis, messages[messages.indexOf(msg) - 1]?.content || '')}
                            disabled={isSaving || !selectedPatientId}
                          >
                            <Save className="w-3 h-3" />
                            {t('saveToRecord')}
                          </Button>
                        )}
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('recommendations')}</p>
                        <ul className="space-y-1">
                          {msg.analysis.nextSteps.map((step: string, i: number) => (
                            <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                              {step}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
          {isAnalyzing && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="flex gap-3 max-w-[80%]">
                <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                  <Bot className="w-5 h-5 text-emerald-600 animate-pulse" />
                </div>
                <div className="bg-white/80 backdrop-blur-sm border border-slate-100 p-4 rounded-2xl rounded-tl-none shadow-[0_4px_12px_rgba(0,0,0,0.02)] space-y-3 min-w-[200px]">
                  <div className="flex gap-1.5 items-center h-4 mb-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <div className="space-y-2">
                    <div className="h-2 w-full bg-slate-100 rounded-full animate-pulse" />
                    <div className="h-2 w-4/5 bg-slate-100 rounded-full animate-pulse" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200">
          <div className="flex gap-2 items-center">
            <div className="flex-1 relative">
              <Input
                placeholder={t('aiInputPlaceholder')}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                className="pr-4"
              />
            </div>

            <MultilingualVoiceInput
              onTranscript={handleVoiceTranscript}
              language={language}
              className="shrink-0"
            />

            <Button
              onClick={() => handleSend()}
              disabled={!input.trim() || isAnalyzing}
              className="h-12 px-6 rounded-xl flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
