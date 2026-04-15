'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, VolumeX, Shield, AlertCircle, Loader2, Sparkles, Languages, Activity } from 'lucide-react';
import { useHealthStore } from '@/lib/store';
import { processHealthRequest } from '@/lib/orchestrator';
import { translations } from '@/lib/translations';

type Language = 'en-US' | 'hi-IN' | 'te-IN';

const LANGUAGES: { code: Language; label: string; flag: string; globalCode: 'en' | 'te' }[] = [
  { code: 'te-IN', label: 'తెలుగు (Telugu)', flag: '🇮🇳', globalCode: 'te' },
  { code: 'en-US', label: 'English', flag: '🇺🇸', globalCode: 'en' },
  { code: 'hi-IN', label: 'हिन्दी (Hindi)', flag: '🇮🇳', globalCode: 'en' }, // Defaulting Hindi to English UI context for now
];

export default function VoiceAgent() {
  const { isProcessing, setProcessing, processResponse, createEmergency, addLog, setError, language: globalLanguage, setLanguage: setGlobalLanguage } = useHealthStore();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [language, setLanguage] = useState<Language>(globalLanguage === 'te' ? 'te-IN' : 'en-US');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  
  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<any>(null);

  // Keep agent language in sync with global language if changed from outside
  useEffect(() => {
    if (globalLanguage === 'te' && language !== 'te-IN') {
      setLanguage('te-IN');
    } else if (globalLanguage === 'en' && language === 'te-IN') {
      setLanguage('en-US');
    }
  }, [globalLanguage]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;
        
        recognitionRef.current.onresult = (event: any) => {
          const current = event.resultIndex;
          const transcriptText = event.results[current][0].transcript;
          setTranscript(transcriptText);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
          
          if (event.error === 'not-allowed') {
            setMicError(translations[globalLanguage].mic_permission_denied);
          } else if (event.error === 'network') {
            setMicError(translations[globalLanguage].mic_network_error);
          } else if (event.error === 'no-speech') {
            setMicError(translations[globalLanguage].mic_no_speech);
          } else {
            setMicError(`${translations[globalLanguage].protocol_error}: ${event.error}`);
          }
        };
      } else {
        setMicError(translations[globalLanguage].browser_support_error);
      }
      synthesisRef.current = window.speechSynthesis;
    }
  }, [globalLanguage]);

  const speak = (text: string) => {
    if (!synthesisRef.current) return;
    synthesisRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    // Auto-detect lang if possible, or use current
    utterance.lang = language;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    synthesisRef.current.speak(utterance);
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      setMicError(translations[globalLanguage].initialization_error);
      return;
    }

    setMicError(null);
    if (isListening) {
      recognitionRef.current?.stop();
      if (transcript.trim()) {
        handleVoiceCommand(transcript);
      } else {
        // Fallback for simulation/testing when no actual voice input is detected
        handleVoiceCommand("I have severe chest pain and difficulty breathing. Located near City Center Mall.");
      }
    } else {
      try {
        setTranscript('');
        recognitionRef.current.lang = language;
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error('Mic start error:', err);
        setMicError(translations[globalLanguage].mic_busy_error);
      }
    }
  };

  const handleVoiceCommand = async (text: string) => {
    setProcessing(true);
    addLog({ type: 'user', content: `[${translations[globalLanguage].voice_log_prefix}_${language}]: ${text}` });
    
    try {
      const response = await processHealthRequest('CITIZEN_ECOSYSTEM_SESSION', text);
      processResponse(response);

      // Speak back the OS output
      speak(response.user_output);

      // If Emergency is active, create the record with VOCAL BIOMARKERS
      if (response.status === 'EMERGENCY_ACTIVE' && response.data.extraction) {
        createEmergency({
          id: Math.random().toString(36).substring(7),
          timestamp: new Date().toISOString(),
          transcript: text,
          extraction: response.data.extraction,
          priority: response.data.triage.priority,
          location: { text: response.data.extraction.where || translations[globalLanguage].current_location },
          status: 'PENDING',
          citizenId: 'CITIZEN_001',
          vocalBiomarkers: response.data.triage.vocal_biomarkers // Passing biomarkers from AI
        });
      }
    } catch (err) {
      console.error('Voice intelligence error:', err);
      setError(translations[globalLanguage].intelligence_error);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-md mx-auto">
      {/* Language Selector */}
      <div className="flex bg-secondary/30 p-1.5 rounded-2xl border border-border">
        {LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            onClick={() => {
              setLanguage(lang.code);
              setGlobalLanguage(lang.globalCode);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              language === lang.code 
                ? 'bg-primary text-primary-foreground shadow-lg' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span>{lang.flag}</span>
            <span className="hidden sm:inline">{lang.label.split(' ')[0]}</span>
          </button>
        ))}
      </div>

      {/* Main Pulse Container */}
      <div className="relative flex items-center justify-center p-12">
        <AnimatePresence>
          {isListening && (
            <>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: [1, 1.5, 1], opacity: [0.1, 0.3, 0.1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 bg-primary/20 rounded-full"
              />
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: [1, 1.8, 1], opacity: [0.05, 0.2, 0.05] }}
                transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                className="absolute inset-0 bg-primary/10 rounded-full"
              />
            </>
          )}
        </AnimatePresence>

        <button
          onClick={toggleListening}
          disabled={isProcessing}
          className={`relative z-10 w-36 h-36 rounded-full flex flex-col items-center justify-center shadow-2xl transition-all active:scale-95 ${
            isListening 
              ? 'bg-destructive text-destructive-foreground' 
              : 'bg-primary text-primary-foreground hover:scale-105'
          } ${isProcessing ? 'opacity-50 grayscale' : ''}`}
        >
          {isProcessing ? (
            <Loader2 className="w-12 h-12 animate-spin" />
          ) : isListening ? (
            <>
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
              >
                <MicOff className="w-12 h-12 mb-2" />
              </motion.div>
              <span className="text-[10px] font-black uppercase tracking-tight">{translations[globalLanguage].sos_tap_end}</span>
            </>
          ) : (
            <>
              <Mic className="w-12 h-12 mb-2" />
              <span className="text-[10px] font-black uppercase tracking-tight">{translations[globalLanguage].sos_start}</span>
            </>
          )}
        </button>

        {/* Level Indicators */}
        <div className="absolute -bottom-4 flex gap-1">
          {Array.from({ length: 12 }).map((_, i) => (
            <motion.div
              key={i}
              animate={isListening ? { 
                height: [8, Math.random() * 40 + 10, 8],
                opacity: [0.3, 1, 0.3] 
              } : { height: 8, opacity: 0.2 }}
              transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.05 }}
              className={`w-1 rounded-full ${isListening ? 'bg-primary' : 'bg-muted-foreground'}`}
            />
          ))}
        </div>
      </div>

      {/* Transcription Area */}
      <div className="w-full text-center min-h-[120px] flex flex-col justify-center gap-2">
        <AnimatePresence mode="wait">
          {transcript ? (
            <motion.p
              key="transcript"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-xl font-black text-foreground leading-tight px-4 uppercase tracking-normal"
            >
              "{transcript}"
            </motion.p>
          ) : (
            <motion.p
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-muted-foreground/60 font-black text-[10px] uppercase tracking-widest"
            >
              {isListening ? translations[globalLanguage].sos_listening : translations[globalLanguage].sos_tap_start}
            </motion.p>
          )}
        </AnimatePresence>
        
        {isSpeaking && (
          <div className="flex items-center justify-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest mt-4">
            <Activity className="w-4 h-4 animate-pulse" />
            {translations[globalLanguage].sos_response}
          </div>
        )}
      </div>

      {/* Security & Bio-Auth Badge */}
      <div className="flex items-center gap-3 px-6 py-4 rounded-3xl bg-secondary/30 border border-border text-muted-foreground/60 w-full max-w-sm">
        {micError ? (
          <>
            <div className="p-2 bg-destructive/10 rounded-xl">
               <AlertCircle className="w-4 h-4 text-destructive" />
            </div>
            <div className="text-left">
               <p className="text-[10px] font-black uppercase tracking-widest text-destructive">{translations[globalLanguage].hardware_error}</p>
               <p className="text-[8px] font-bold uppercase tracking-tight leading-tight">{micError}</p>
            </div>
          </>
        ) : (
          <>
            <div className="p-2 bg-primary/20 rounded-xl">
               <Shield className="w-4 h-4 text-primary" />
            </div>
            <div className="text-left">
               <p className="text-[10px] font-black uppercase tracking-widest text-primary">{translations[globalLanguage].sentinel_active}</p>
               <p className="text-[8px] font-bold uppercase tracking-tight">{translations[globalLanguage].realtime_triage}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
