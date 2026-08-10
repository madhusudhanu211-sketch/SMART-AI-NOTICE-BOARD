import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff, X, Volume2, Sparkles, Send } from 'lucide-react';
import api from '../services/api';

export default function VoiceMicModal({ isOpen, onClose }) {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [responseMessage, setResponseMessage] = useState('');
  const [recognition, setRecognition] = useState(null);
  const [speaking, setSpeaking] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onstart = () => setListening(true);
      rec.onresult = (event) => {
        const text = Array.from(event.results)
          .map(r => r[0].transcript)
          .join('');
        setTranscript(text);
      };

      rec.onend = () => {
        setListening(false);
      };

      rec.onerror = (e) => {
        console.warn('Speech recognition error:', e.error);
        setListening(false);
      };

      setRecognition(rec);
    }
  }, []);

  const startListening = () => {
    setTranscript('');
    setResponseMessage('');
    if (recognition) {
      try {
        recognition.start();
      } catch (e) {
        setListening(true);
      }
    } else {
      setListening(true);
    }
  };

  const stopListening = () => {
    if (recognition) {
      try { recognition.stop(); } catch (e) {}
    }
    setListening(false);
  };

  const handleProcessCommand = async (cmdText) => {
    const textToProcess = cmdText || transcript;
    if (!textToProcess.trim()) return;

    stopListening();
    setResponseMessage('Processing voice command...');

    try {
      const res = await api.post('/voice/process', { command: textToProcess });
      const { action, target, message } = res.data;
      setResponseMessage(message || 'Command executed.');

      // Text-to-speech audio feedback
      speakText(message || 'Command executed.');

      // Route navigation based on command intent
      setTimeout(() => {
        if (action === 'NAVIGATE' || target) {
          const lowerTarget = (target || '').toLowerCase();
          if (lowerTarget.includes('notice')) navigate('/notices');
          else if (lowerTarget.includes('timetable') || lowerTarget.includes('class')) navigate('/timetable');
          else if (lowerTarget.includes('attendance')) navigate('/attendance');
          else if (lowerTarget.includes('assignment')) navigate('/assignments');
          else if (lowerTarget.includes('placement')) navigate('/placements');
          else if (lowerTarget.includes('result')) navigate('/results');
          else if (lowerTarget.includes('event')) navigate('/events');
          else if (lowerTarget.includes('chatbot') || lowerTarget.includes('ask')) navigate('/chatbot');
          onClose();
        }
      }, 1200);
    } catch (err) {
      // Offline fallback processing
      const lower = textToProcess.toLowerCase();
      let msg = `Executed: "${textToProcess}"`;
      if (lower.includes('notice')) { navigate('/notices'); msg = 'Navigating to Notices'; }
      else if (lower.includes('timetable')) { navigate('/timetable'); msg = 'Opening Timetable'; }
      else if (lower.includes('attendance')) { navigate('/attendance'); msg = 'Opening Attendance Tracker'; }
      else if (lower.includes('assignment')) { navigate('/assignments'); msg = 'Opening Assignments'; }
      else if (lower.includes('placement')) { navigate('/placements'); msg = 'Opening Placement Portal'; }

      setResponseMessage(msg);
      speakText(msg);
      setTimeout(() => onClose(), 1500);
    }
  };

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onstart = () => setSpeaking(true);
      utterance.onend = () => setSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative text-center">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Voice Recognition AI</span>
        </div>

        {/* Pulsing Mic Circle */}
        <div className="flex justify-center my-6">
          <div className="relative">
            {listening && (
              <div className="absolute inset-0 rounded-full bg-indigo-500/30 animate-ping" />
            )}
            <button
              onClick={listening ? stopListening : startListening}
              className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center shadow-2xl transition-all transform hover:scale-105 ${
                listening
                  ? 'bg-gradient-to-tr from-rose-500 to-red-600 text-white ring-4 ring-rose-500/30'
                  : 'bg-gradient-to-tr from-indigo-600 to-purple-600 text-white ring-4 ring-indigo-500/30'
              }`}
            >
              {listening ? <MicOff className="w-10 h-10 animate-pulse" /> : <Mic className="w-10 h-10" />}
            </button>
          </div>
        </div>

        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2">
          {listening ? 'Listening... Speak your command now' : 'Click microphone to start speaking'}
        </p>

        {/* Realtime Transcript or Input */}
        <div className="min-h-[60px] p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 mb-4 flex items-center justify-center">
          <p className="text-sm font-medium text-slate-800 dark:text-slate-100 italic">
            {transcript ? `"${transcript}"` : 'Try saying: "Read latest notice" or "Show my attendance"'}
          </p>
        </div>

        {/* Response Feedback */}
        {responseMessage && (
          <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold flex items-center justify-center gap-2 mb-4 animate-in fade-in">
            <Volume2 className={`w-4 h-4 ${speaking ? 'animate-bounce' : ''}`} />
            <span>{responseMessage}</span>
          </div>
        )}

        {/* Manual Submit or Sample Commands */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Type command if mic is unavailable..."
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleProcessCommand()}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={() => handleProcessCommand()}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-1 transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Run</span>
          </button>
        </div>
      </div>
    </div>
  );
}
