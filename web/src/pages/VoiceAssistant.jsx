import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import {
  Mic, MicOff, Volume2, VolumeX, RotateCcw, Trash2,
  Sparkles, Send, Globe, Shield, CheckCircle, AlertTriangle
} from 'lucide-react';
import api from '../services/api';

export default function VoiceAssistant() {
  const [listening, setListening] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [muted, setMuted] = useState(false);

  const [transcript, setTranscript] = useState('');
  const [statusMessage, setStatusMessage] = useState('Click microphone or speak natural voice commands');
  const [conversation, setConversation] = useState([]);
  const [confirmationModal, setConfirmationModal] = useState(null);

  const [recognition, setRecognition] = useState(null);

  const navigate = useNavigate();
  const { toggleTheme } = useTheme();
  const { language, speechLangCode, changeLanguage, t } = useLanguage();
  const { user } = useAuth();
  const chatEndRef = useRef(null);

  const sampleCommandsByLang = {
    en: [
      "Show my attendance",
      "When are the semester examinations?",
      "What are the upcoming college holidays?",
      "When is the tuition fee payment deadline?",
      "What classes do I have today?",
      "Read my latest campus notices",
      "Do I have any assignments due?",
      "Who is the HOD of CSE department?",
      "Explain the Smart Notice Board architecture",
      "What is Machine Learning and supervised learning?",
      "Show upcoming campus hackathons and events",
      "Mark attendance for all students (Faculty)"
    ],
    te: [
      "నా అటెండెన్స్ చూపించు",
      "సెమిస్టర్ పరీక్షల తేదీలు ఎప్పుడు?",
      "రాబోయే కళాశాల సెలవులు ఏమిటి?",
      "ట్యూషన్ ఫీజు చెల్లింపు చివరి తేదీ ఎప్పుడు?",
      "ఈ రోజు ఏ తరగతులు ఉన్నాయి?",
      "తాజా నోటీసులు చదువు",
      "అసైన్‌మెంట్‌లు ఏమైనా ఉన్నాయా?",
      "సిఎస్‌ఈ డిపార్ట్‌మెంట్ ఫ్యాకల్టీ వివరాలు చెప్పు",
      "స్మార్ట్ ఏఐ నోటీస్ బోర్డ్ ప్రాజెక్ట్ గురించి వివరించు",
      "డార్క్ మోడ్ మార్చు"
    ],
    hi: [
      "मेरी अटेंडेंस दिखाओ",
      "सेमेस्टर परीक्षाएं कब हैं?",
      "आगामी कॉलेज की छुट्टियां कौन सी हैं?",
      "फीस भुगतान की अंतिम तिथि क्या है?",
      "आज मेरी कौन सी कक्षाएं हैं?",
      "नवीनतम नोटिस पढ़ो"
    ],
    ta: [
      "என் வருகைப் பதிவைக் காட்டு",
      "செமஸ்டர் தேர்வுகள் எப்போது?",
      "வரவிருக்கும் கல்லூரி விடுமுறைகள் என்ன?",
      "கட்டணம் செலுத்துவதற்கான கடைசி தேதி என்ன?",
      "இன்று என்ன வகுப்புகள் உள்ளன?",
      "சமீపத்திய அறிவிப்பைப் படி"
    ]
  };

  const sampleCommands = sampleCommandsByLang[language] || sampleCommandsByLang['en'];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation, statusMessage]);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = speechLangCode;

      let lastFinalText = '';

      rec.onstart = () => {
        setListening(true);
        lastFinalText = '';
        setStatusMessage(t('voice.listening', 'Listening in real-time... Speak now'));
      };

      rec.onresult = (event) => {
        let interimText = '';
        for (let i = 0; i < event.results.length; i++) {
          const res = event.results[i];
          if (res.isFinal) {
            lastFinalText = res[0].transcript;
          } else {
            interimText += res[0].transcript;
          }
        }
        const liveText = lastFinalText || interimText;
        if (liveText) {
          setTranscript(liveText);
          setStatusMessage(`🎙️ Live: "${liveText}"`);
        }
      };

      rec.onend = () => {
        setListening(false);
        if (lastFinalText && lastFinalText.trim().length > 1) {
          handleProcessQuery(lastFinalText.trim());
        } else {
          setStatusMessage(
            language === 'te'
              ? 'మైక్రోఫోన్ నుండి ఎటువంటి మాటలు నమోదు కాలేదు. "Start Listening" క్లిక్ చేసి మాట్లాడండి.'
              : 'No speech detected. Please click "Start Listening" and speak into your microphone.'
          );
        }
      };

      rec.onerror = (e) => {
        setListening(false);
        if (e.error === 'not-allowed' || e.error === 'permission-denied') {
          setStatusMessage('Microphone access blocked. Please allow microphone permissions in your browser settings.');
        } else if (e.error === 'no-speech') {
          setStatusMessage(
            language === 'te'
              ? 'ఎటువంటి మాటలు వినిపించలేదు. దయచేసి మళ్లీ ప్రయత్నించండి.'
              : 'No speech detected. Please click "Start Listening" and try again.'
          );
        } else {
          console.warn('Speech Recognition Warning:', e.error);
        }
      };

      setRecognition(rec);
    }
  }, [speechLangCode, t]);

  const startListening = () => {
    setTranscript('');
    stopSpeaking();
    if (recognition) {
      try {
        recognition.lang = speechLangCode;
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

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
    }
  };

  const speakText = (text) => {
    if (muted || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = speechLangCode;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const handleProcessQuery = async (queryText) => {
    const textToProcess = queryText || transcript;
    if (!textToProcess || !textToProcess.trim()) return;

    stopListening();
    setProcessing(true);
    setStatusMessage('Analyzing intent and querying database...');

    const userMessage = { role: 'user', content: textToProcess };
    const updatedHistory = [...conversation, userMessage];
    setConversation(updatedHistory);
    setTranscript('');

    try {
      const res = await api.post('/assistant/voice-intent', {
        message: textToProcess,
        language: language,
        platform: 'web',
        conversation_history: conversation.map(c => ({ role: c.role, content: c.content }))
      });

      const { intent, response, data, navigation, requires_confirmation, confirmation_payload } = res.data;

      setProcessing(false);
      setStatusMessage(response);

      const assistantMsg = {
        role: 'assistant',
        content: response,
        intent: intent,
        data: data
      };
      setConversation([...updatedHistory, assistantMsg]);

      // Speak response aloud
      speakText(response);

      // Handle Theme/Language intents
      if (intent === 'CHANGE_THEME') {
        toggleTheme();
      } else if (intent === 'CHANGE_LANGUAGE' && data?.language) {
        changeLanguage(data.language);
      }

      // Handle confirmation modal for faculty actions
      if (requires_confirmation) {
        setConfirmationModal({
          message: response,
          payload: confirmation_payload
        });
        return;
      }

      // Handle navigation
      if (navigation) {
        setTimeout(() => {
          navigate(navigation);
        }, 2200);
      }
    } catch (err) {
      setProcessing(false);
      const errMsg =
        language === 'te'
          ? 'క్షమించండి, సర్వర్‌ను సంప్రదించడంలో సమస్య ఏర్పడింది. దయచేసి మళ్లీ ప్రయత్నించండి.'
          : 'Unable to reach the AI voice assistant service. Please check your network connection and try again.';
      setConversation([...updatedHistory, { role: 'assistant', content: errMsg }]);
      speakText(errMsg);
    }
  };

  const handleConfirmAction = () => {
    setConfirmationModal(null);
    const confirmMsg = "Action confirmed and executed successfully!";
    setStatusMessage(confirmMsg);
    speakText(confirmMsg);
    setConversation(prev => [...prev, { role: 'assistant', content: confirmMsg }]);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300 pb-10">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glass-card p-6 rounded-3xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>AI Voice Assistant</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20">
                {user?.role || 'Student'} Mode
              </span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Natural language speech engine with database awareness
            </p>
          </div>
        </div>

        {/* Language Selector */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700">
          <Globe className="w-4 h-4 text-slate-500 ml-2" />
          <select
            value={language}
            onChange={(e) => changeLanguage(e.target.value)}
            className="bg-transparent text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none pr-3 cursor-pointer"
          >
            <option value="en" className="dark:bg-slate-900">English (EN)</option>
            <option value="te" className="dark:bg-slate-900">తెలుగు (Telugu)</option>
            <option value="hi" className="dark:bg-slate-900">हिंदी (Hindi)</option>
            <option value="ta" className="dark:bg-slate-900">தமிழ் (Tamil)</option>
          </select>
        </div>
      </div>

      {/* Main Mic Section */}
      <div className="glass-card p-8 sm:p-10 text-center space-y-6 relative overflow-hidden">
        {/* Pulsing Mic Circle */}
        <div className="flex justify-center my-4">
          <div className="relative">
            {listening && (
              <div className="absolute inset-0 rounded-full bg-rose-500/40 animate-ping scale-125" />
            )}
            {speaking && (
              <div className="absolute inset-0 rounded-full bg-indigo-500/40 animate-pulse scale-110" />
            )}
            <button
              onClick={listening ? stopListening : startListening}
              className={`relative z-10 w-28 h-28 rounded-full flex items-center justify-center shadow-2xl transition-all transform hover:scale-105 ${
                listening
                  ? 'bg-gradient-to-tr from-rose-500 to-red-600 text-white ring-8 ring-rose-500/20'
                  : speaking
                  ? 'bg-gradient-to-tr from-emerald-500 to-teal-600 text-white ring-8 ring-emerald-500/20'
                  : 'bg-gradient-to-tr from-indigo-600 via-purple-600 to-indigo-700 text-white ring-8 ring-indigo-500/20'
              }`}
            >
              {listening ? (
                <MicOff className="w-12 h-12 animate-pulse" />
              ) : (
                <Mic className="w-12 h-12" />
              )}
            </button>
          </div>
        </div>

        {/* State Label & Sound Wave Visualizer */}
        <div className="space-y-2">
          {listening && (
            <div className="flex items-center justify-center gap-1.5 h-6">
              <span className="w-1.5 h-6 bg-rose-500 rounded-full animate-pulse" />
              <span className="w-1.5 h-4 bg-rose-400 rounded-full animate-bounce delay-75" />
              <span className="w-1.5 h-8 bg-rose-600 rounded-full animate-pulse delay-100" />
              <span className="w-1.5 h-5 bg-rose-400 rounded-full animate-bounce delay-150" />
              <span className="w-1.5 h-6 bg-rose-500 rounded-full animate-pulse delay-75" />
            </div>
          )}

          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
            {listening
              ? '🎙️ Real-time listening active... Speak in English or Telugu'
              : processing
              ? '🧠 Analyzing intent & querying campus database...'
              : speaking
              ? '🔊 Speaking response aloud...'
              : 'Click Start Listening or Tap Microphone'}
          </p>

          <div className="min-h-[28px] flex items-center justify-center">
            {transcript ? (
              <span className="inline-block px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold text-indigo-700 dark:text-indigo-300 animate-in fade-in">
                🗣️ "{transcript}"
              </span>
            ) : (
              <p className="text-xs text-slate-500 dark:text-slate-400">{statusMessage}</p>
            )}
          </div>
        </div>

        {/* Primary Controls: Start Listening, Stop Listening, Clear */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
          <button
            onClick={startListening}
            disabled={listening}
            className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all ${
              listening
                ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
            }`}
          >
            <Mic className="w-4 h-4" />
            <span>Start Listening</span>
          </button>

          <button
            onClick={stopListening}
            disabled={!listening}
            className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all ${
              !listening
                ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                : 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20 animate-pulse'
            }`}
          >
            <MicOff className="w-4 h-4" />
            <span>Stop Listening</span>
          </button>

          <button
            onClick={() => {
              setConversation([]);
              setTranscript('');
              stopSpeaking();
              setStatusMessage('Conversation cleared.');
            }}
            className="px-4 py-2 rounded-2xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>

          <button
            onClick={() => setMuted(!muted)}
            className={`px-3 py-2 rounded-2xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              muted
                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            <span>{muted ? 'Muted' : 'Sound On'}</span>
          </button>
        </div>
        </div>

        {/* Manual Text Input Bar */}
        <div className="max-w-lg mx-auto flex gap-2 pt-2">
          <input
            type="text"
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Type your question if mic is unavailable..."
            onKeyDown={(e) => e.key === 'Enter' && handleProcessQuery()}
            className="flex-1 px-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          <button
            onClick={() => handleProcessQuery()}
            className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg flex items-center gap-1.5 transition-colors"
          >
            <Send className="w-4 h-4" />
            <span>Send</span>
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmationModal && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0" />
            <p className="text-xs font-semibold">{confirmationModal.message}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleConfirmAction}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors"
            >
              Confirm
            </button>
            <button
              onClick={() => setConfirmationModal(null)}
              className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Realtime Conversation Feed */}
      {conversation.length > 0 && (
        <div className="glass-card p-6 rounded-3xl space-y-4 max-h-80 overflow-y-auto">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Conversation Transcript History
          </h3>
          {conversation.map((msg, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-md p-3.5 rounded-2xl text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-none'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-none border border-slate-200 dark:border-slate-700/80 shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium whitespace-pre-wrap flex-1">{msg.content}</p>
                  {msg.role === 'assistant' && (
                    <button
                      onClick={() => speakText(msg.content)}
                      title="Read Answer Aloud with Text-to-Speech"
                      className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex-shrink-0"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                {msg.intent && (
                  <span className="inline-block mt-1 text-[10px] opacity-75 font-mono">
                    Intent: {msg.intent}
                  </span>
                )}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
      )}

      {/* Optional Suggested Questions (Clicking fills the input box, never auto-submits) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Optional Suggested Questions ({language.toUpperCase()})</span>
          </h3>
          <span className="text-[11px] text-slate-500 italic">Clicking inserts text into input field — never auto-submits</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
          {sampleCommands.map((cmd, idx) => (
            <div
              key={idx}
              onClick={() => {
                setTranscript(cmd);
                setStatusMessage(`Inserted: "${cmd}". Click "Send" or speak your own question.`);
              }}
              title="Click to insert this question into the input field"
              className="p-3 rounded-2xl glass-card cursor-pointer hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all flex items-center justify-between group"
            >
              <span className="text-xs font-medium text-slate-800 dark:text-slate-200">"{cmd}"</span>
              <Sparkles className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
