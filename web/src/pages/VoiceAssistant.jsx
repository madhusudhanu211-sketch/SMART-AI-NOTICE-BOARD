import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { Mic, MicOff, Volume2, Sparkles, Send, HelpCircle } from 'lucide-react';

export default function VoiceAssistant() {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [recognition, setRecognition] = useState(null);
  const [speaking, setSpeaking] = useState(false);

  const navigate = useNavigate();
  const { toggleTheme } = useTheme();
  const { language, speechLangCode, t } = useLanguage();

  const sampleCommandsByLang = {
    en: [
      'Read the latest notice',
      'What is the latest notice?',
      'Open assignments',
      'Show timetable schedule',
      'Show my attendance',
      'Open campus events',
    ],
    te: [
      'తాజా నోటీసు చదువు',
      'నోటీసులు తెరువు',
      'టైమ్‌టేబుల్ చూపించు',
      'నా అటెండెన్స్ చూపించు',
      'అసైన్‌మెంట్‌లు తెరువు',
      'ఈవెంట్‌లు చూపించు',
    ],
    hi: [
      'नवीनतम नोटिस पढ़ो',
      'नोटिस खोलो',
      'टाइमटेबल दिखाओ',
      'मेरी उपस्थिति दिखाओ',
      'असाइनमेंट खोलो',
      'इवेंट्स दिखाओ',
    ],
    ta: [
      'சமீபத்திய அறிவிப்பைப் படி',
      'அறிவிப்புகளைத் திற',
      'நேர அட்டவணையைக் காட்டு',
      'எனது வருகையைக் காட்டு',
      'ஒப்படைப்புகளைத் திற',
      'நிகழ்வுகளைக் காட்டு',
    ],
  };

  const sampleCommands = sampleCommandsByLang[language] || sampleCommandsByLang['en'];

  useEffect(() => {
    setStatusMessage(t('voice.tapToSpeak', 'Click microphone to speak natural language voice commands'));
  }, [language, t]);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = speechLangCode; // Dynamically set to en-IN, te-IN, hi-IN, or ta-IN

      rec.onstart = () => {
        setListening(true);
        setStatusMessage(t('voice.listening', 'Listening to your voice input...'));
      };

      rec.onresult = (event) => {
        const text = Array.from(event.results)
          .map((r) => r[0].transcript)
          .join('');
        setTranscript(text);
      };

      rec.onend = () => {
        setListening(false);
      };

      rec.onerror = () => {
        setListening(false);
        setStatusMessage('Speech recognition stopped or unavailable. You can type commands below.');
      };

      setRecognition(rec);
    }
  }, [speechLangCode, t]);

  const startListening = () => {
    setTranscript('');
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
      try {
        recognition.stop();
      } catch (e) {}
    }
    setListening(false);
  };

  /**
   * Multi-Language Intent Command Engine (English, Telugu, Hindi, Tamil)
   */
  const processVoiceIntent = (rawCommand) => {
    const text = rawCommand.toLowerCase().trim();

    // 1. Notice Board Intents (English, Telugu: నోటీసు/నోటీసులు, Hindi: नोटिस, Tamil: அறிவிப்பு)
    if (
      text.includes('notice') ||
      text.includes('announcement') ||
      text.includes('నోటీసు') ||
      text.includes('నోటీసులు') ||
      text.includes('नोटिस') ||
      text.includes('అறிவிப்பு') ||
      text.includes('அறிவிப்புகளை')
    ) {
      if (
        text.includes('read') ||
        text.includes('tell') ||
        text.includes('what') ||
        text.includes('latest') ||
        text.includes('చదువు') ||
        text.includes('పడొ') ||
        text.includes('पढ़ो') ||
        text.includes('படி')
      ) {
        const announcementText =
          language === 'te'
            ? 'తాజా నోటీసు: అత్యవసర క్యాంపస్ మరమ్మతుల నోటీసు. రేపు 9 గంటల నుండి బ్లాక్ ఎ లో విద్యుత్ సేవలు నిలిపివేయబడతాయి.'
            : language === 'hi'
            ? 'नवीनतम नोटिस: आपातकालीन परिसर रखरखाव नोटिस। कल सुबह 9 बजे से ब्लॉक ए में बिजली रखरखाव होगा।'
            : language === 'ta'
            ? 'சமீபத்திய அறிவிப்பு: அவசர வளாக பராமரிப்பு அறிவிப்பு. நாளை காலை 9 மணி முதல் பிளாக் ஏ இல் மின் விநியோகம் நிறுத்தப்படும்.'
            : 'Latest Notice: Urgent Campus Maintenance Notice. Power supply maintenance will occur on Block A tomorrow from 9 AM to 1 PM.';
        speakText(announcementText);
        setStatusMessage(announcementText);
        setTimeout(() => navigate('/notices'), 2200);
        return;
      }
      const msg = language === 'te' ? 'నోటీస్ బోర్డ్ తెరవబడుతోంది.' : language === 'hi' ? 'नोटिस बोर्ड खोला जा रहा है।' : language === 'ta' ? 'அறிவிப்பு பலகை திறக்கப்படுகிறது.' : 'Opening Smart Notice Board.';
      speakText(msg);
      setStatusMessage(msg);
      setTimeout(() => navigate('/notices'), 1200);
      return;
    }

    // 2. Timetable Intents (English: timetable/schedule, Telugu: టైమ్‌టేబుల్, Hindi: टाइमटेबल, Tamil: அட்டவணை)
    if (
      text.includes('timetable') ||
      text.includes('schedule') ||
      text.includes('class') ||
      text.includes('టైమ్‌టేబుల్') ||
      text.includes('టైమ్టేబుల్') ||
      text.includes('टाइमटेबल') ||
      text.includes('அட்டவணை') ||
      text.includes('நேர அட்டவணை')
    ) {
      const msg =
        language === 'te'
          ? 'టైమ్‌టేబుల్ తెరవబడుతోంది. ఈ రోజు మీకు 3 తరగతులు ఉన్నాయి.'
          : language === 'hi'
          ? 'टाइमटेबल खोला जा रहा है। आज आपकी 3 कक्षाएं हैं।'
          : language === 'ta'
          ? 'நேர அட்டவணை திறக்கப்படுகிறது. இன்று உங்களுக்கு 3 வகுப்புகள் உள்ளன.'
          : 'Opening Class Timetable. Today you have 3 classes scheduled.';
      speakText(msg);
      setStatusMessage(msg);
      setTimeout(() => navigate('/timetable'), 1500);
      return;
    }

    // 3. Attendance Intents (English: attendance, Telugu: అటెండెన్స్, Hindi: उपस्थिति, Tamil: வருகை)
    if (
      text.includes('attendance') ||
      text.includes('అటెండెన్స్') ||
      text.includes('హాజరు') ||
      text.includes('उपस्थिति') ||
      text.includes('வருகை') ||
      text.includes('வருகையை')
    ) {
      const msg =
        language === 'te'
          ? 'అటెండెన్స్ పోర్టల్ తెరవబడుతోంది. మీ ప్రస్తుత అటెండెన్స్ 88.5% గా ఉంది.'
          : language === 'hi'
          ? 'उपस्थिति पोर्टल खोला जा रहा है। आपकी वर्तमान उपस्थिति 88.5% है।'
          : language === 'ta'
          ? 'வருகைப் பதிவு திறக்கப்படுகிறது. உங்கள் தற்போதைய வருகை 88.5% ஆகும்.'
          : 'Opening Attendance Tracker. Your current attendance is 88.5%.';
      speakText(msg);
      setStatusMessage(msg);
      setTimeout(() => navigate('/attendance'), 1500);
      return;
    }

    // 4. Assignment Intents (English: assignment, Telugu: అసైన్‌మెంట్, Hindi: असाइनमेंट, Tamil: ஒப்படைப்பு)
    if (
      text.includes('assignment') ||
      text.includes('असाइनमेंट') ||
      text.includes('అసైన్‌మెంట్') ||
      text.includes('ఒప్పடைப்பு') ||
      text.includes('ஒப்படைப்புகளை')
    ) {
      const msg =
        language === 'te'
          ? 'అసైన్‌మెంట్‌ల పేజీ తెరవబడుతోంది. ఈ వారం 3 అసైన్‌మెంట్‌లు బాకీ ఉన్నాయి.'
          : language === 'hi'
          ? 'असाइनमेंट पेज खोला जा रहा है। इस सप्ताह 3 असाइनमेंट बकाया हैं।'
          : language === 'ta'
          ? 'ஒப்படைப்புகள் பக்கம் திறக்கப்படுகிறது. இந்த வாரம் 3 ஒப்படைப்புகள் நிலுவையில் உள்ளன.'
          : 'Opening Assignments page. You have 3 pending assignments due this week.';
      speakText(msg);
      setStatusMessage(msg);
      setTimeout(() => navigate('/assignments'), 1500);
      return;
    }

    // 5. Events Intents
    if (text.includes('event') || text.includes('ఈవెంట్') || text.includes('इवेंट') || text.includes('நிகழ்வு')) {
      const msg = 'Opening Campus Events.';
      speakText(msg);
      setStatusMessage(msg);
      setTimeout(() => navigate('/events'), 1200);
      return;
    }

    // Default Fallback
    const fallbackMsg = `Voice command: "${rawCommand}". Navigating to Notice Board.`;
    speakText(fallbackMsg);
    setStatusMessage(fallbackMsg);
    setTimeout(() => navigate('/notices'), 1500);
  };

  const handleProcessVoice = async (textCmd) => {
    const commandText = textCmd || transcript;
    if (!commandText.trim()) return;

    stopListening();
    setStatusMessage(`Processing command: "${commandText}"...`);
    processVoiceIntent(commandText);
  };

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = speechLangCode; // en-IN, te-IN, hi-IN, or ta-IN
      utterance.onstart = () => setSpeaking(true);
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Title Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{t('voice.badge', 'Hands-Free Flexible Speech Engine')}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          {t('voice.title', 'Voice Assistant Console')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
          {t('voice.sub', 'Control your academic portal hands-free using natural language speech commands')}
        </p>
      </div>

      {/* Main Mic Section */}
      <div className="glass-card p-8 sm:p-12 text-center space-y-6">
        <div className="flex justify-center">
          <div className="relative">
            {listening && <div className="absolute inset-0 rounded-full bg-rose-500/30 animate-ping" />}
            <button
              onClick={listening ? stopListening : startListening}
              className={`relative z-10 w-28 h-28 rounded-full flex items-center justify-center shadow-2xl transition-all transform hover:scale-105 ${
                listening
                  ? 'bg-gradient-to-tr from-rose-500 to-red-600 text-white ring-8 ring-rose-500/20'
                  : 'bg-gradient-to-tr from-indigo-600 via-purple-600 to-indigo-700 text-white ring-8 ring-indigo-500/20'
              }`}
            >
              {listening ? <MicOff className="w-12 h-12 animate-pulse" /> : <Mic className="w-12 h-12" />}
            </button>
          </div>
        </div>

        {/* Live Transcript Box */}
        <div className="max-w-xl mx-auto min-h-[70px] p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-center justify-center">
          <p className="text-sm font-semibold text-slate-900 dark:text-white italic leading-relaxed">
            {transcript ? `"${transcript}"` : statusMessage}
          </p>
        </div>

        {/* TTS Status */}
        {speaking && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold animate-bounce">
            <Volume2 className="w-4 h-4" />
            <span>{t('voice.speaking', 'Voice Assistant is speaking output...')}</span>
          </div>
        )}

        {/* Manual Input Bar */}
        <div className="max-w-lg mx-auto flex gap-2">
          <input
            type="text"
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder={t('voice.typePlaceholder', "Type speech command...")}
            onKeyDown={(e) => e.key === 'Enter' && handleProcessVoice()}
            className="flex-1 px-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={() => handleProcessVoice()}
            className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg flex items-center gap-1.5"
          >
            <Send className="w-4 h-4" />
            <span>{t('voice.process', 'Process')}</span>
          </button>
        </div>
      </div>

      {/* Flexible Command Suggestions in Selected Language */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-indigo-500" />
          <span>{t('voice.suggestedTitle', 'Supported Natural Language Phrases')} ({language.toUpperCase()})</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {sampleCommands.map((cmd, idx) => (
            <div
              key={idx}
              onClick={() => handleProcessVoice(cmd)}
              className="p-3.5 rounded-2xl glass-card cursor-pointer hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all flex items-center justify-between group"
            >
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">"{cmd}"</span>
              <Mic className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
