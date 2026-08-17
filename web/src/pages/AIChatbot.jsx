import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  Bot, Send, User, Sparkles, Plus, Trash2, Edit3, Check, X,
  Copy, RefreshCw, ThumbsUp, ThumbsDown, Mic, MicOff, StopCircle,
  Search, MessageSquare, ChevronRight, Volume2, VolumeX, AlertCircle,
  Share2, Eraser
} from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────────────────────

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

const SUGGESTED_PROMPTS = {
  en: [
    { icon: '📊', text: 'Show my attendance' },
    { icon: '📢', text: "What are today's notices?" },
    { icon: '📅', text: 'Show my timetable' },
    { icon: '📝', text: 'What assignments are due?' },
    { icon: '🎉', text: 'Show upcoming events' },
    { icon: '🧠', text: 'Explain a programming concept' },
    { icon: '📚', text: 'Help me with my studies' },
    { icon: '💼', text: 'Show available placement opportunities' },
  ],
  te: [
    { icon: '📊', text: 'నా అటెండెన్స్ చూపించు' },
    { icon: '📢', text: 'ఈ రోజు నోటీసులు ఏమిటి?' },
    { icon: '📅', text: 'నా టైమ్‌టేబుల్ చూపించు' },
    { icon: '📝', text: 'బాకీ ఉన్న అసైన్‌మెంట్‌లు ఏమిటి?' },
    { icon: '🎉', text: 'రాబోయే ఈవెంట్‌లు చూపించు' },
    { icon: '🧠', text: 'ప్రోగ్రామింగ్ కాన్సెప్ట్ వివరించు' },
    { icon: '📚', text: 'నా చదువులో సహాయం చేయి' },
    { icon: '💼', text: 'ప్లేస్‌మెంట్ అవకాశాలు చూపించు' },
  ],
  hi: [
    { icon: '📊', text: 'मेरी उपस्थिति दिखाओ' },
    { icon: '📢', text: 'आज के नोटिस क्या हैं?' },
    { icon: '📅', text: 'मेरा टाइमटेबल दिखाओ' },
    { icon: '📝', text: 'कौन से असाइनमेंट बकाया हैं?' },
    { icon: '🎉', text: 'आगामी कार्यक्रम दिखाएं' },
    { icon: '🧠', text: 'एक प्रोग्रामिंग अवधारणा समझाएं' },
    { icon: '📚', text: 'मेरी पढ़ाई में मदद करें' },
    { icon: '💼', text: 'उपलब्ध प्लेसमेंट अवसर दिखाएं' },
  ],
  ta: [
    { icon: '📊', text: 'என் வருகையைக் காட்டு' },
    { icon: '📢', text: 'இன்றைய அறிவிப்புகள் என்ன?' },
    { icon: '📅', text: 'என் நேர அட்டவணையைக் காட்டு' },
    { icon: '📝', text: 'என்ன ஒப்படைப்புகள் நிலுவையில் உள்ளன?' },
    { icon: '🎉', text: 'வரவிருக்கும் நிகழ்வுகளைக் காட்டு' },
    { icon: '🧠', text: 'ஒரு நிரலாக்க கருத்தை விளக்குங்கள்' },
    { icon: '📚', text: 'என் படிப்பிற்கு உதவுங்கள்' },
    { icon: '💼', text: 'வேலை வாய்ப்புகளைக் காட்டு' },
  ],
};

const WELCOME = {
  en: "Hello! I'm **College AI Assistant**, your intelligent campus partner.",
  te: "నమస్కారం! నేను **College AI Assistant**, మీ తెలివైన కళాశాల సహాయకుడు.",
  hi: "नमस्ते! मैं **College AI Assistant** हूँ, आपका बुद्धिमान कॉलेज सहायक।",
  ta: "வணக்கம்! நான் **College AI Assistant**, உங்கள் புத்திசாலி கல்லூரி உதவியாளர்.",
};

const SUB = {
  en: "Ask me anything — attendance, notices, timetable, coursework, or general AI questions.",
  te: "ఏదైనా అడగండి — అటెండెన్స్, నోటీసులు, టైమ్‌టేబుల్ లేదా సాధారణ విషయాలు.",
  hi: "कुछ भी पूछें — उपस्थिति, नोटिस, टाइमटेबल या सामान्य प्रश्न।",
  ta: "எதையும் கேளுங்கள் — வருகை, அறிவிப்புகள், நேர அட்டவணை அல்லது பொதுவான கேள்விகள்.",
};

// ─── Typing animation dots ────────────────────────────────────────────────────

function TypingDots() {
  return (
    <div className="flex items-center gap-1 p-1">
      <span className="w-2 h-2 rounded-full bg-indigo-400 animate-[bounce_1s_ease-in-out_0s_infinite]" />
      <span className="w-2 h-2 rounded-full bg-indigo-400 animate-[bounce_1s_ease-in-out_0.2s_infinite]" />
      <span className="w-2 h-2 rounded-full bg-indigo-400 animate-[bounce_1s_ease-in-out_0.4s_infinite]" />
    </div>
  );
}

// ─── Markdown code block with copy button ───────────────────────────────────

function CodeBlock({ children, className }) {
  const [copied, setCopied] = useState(false);
  const language = (className || '').replace('language-', '') || 'text';
  const code = String(children).replace(/\n$/, '');

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="relative group my-3 rounded-xl overflow-hidden border border-slate-700">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800 text-slate-400 text-xs font-mono">
        <span>{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 hover:text-white transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied!' : 'Copy Code'}</span>
        </button>
      </div>
      <SyntaxHighlighter
        style={oneDark}
        language={language}
        PreTag="div"
        customStyle={{ margin: 0, borderRadius: 0, fontSize: '0.78rem' }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

// ─── Markdown renderer ───────────────────────────────────────────────────────

function MarkdownContent({ content }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      className="chat-markdown"
      components={{
        code({ node, inline, className, children, ...props }) {
          if (inline) {
            return (
              <code
                className="px-1.5 py-0.5 rounded bg-slate-700 text-indigo-300 text-xs font-mono"
                {...props}
              >
                {children}
              </code>
            );
          }
          return <CodeBlock className={className}>{children}</CodeBlock>;
        },
        table({ children }) {
          return (
            <div className="overflow-x-auto my-3">
              <table className="min-w-full text-xs border border-slate-600 rounded-lg overflow-hidden">
                {children}
              </table>
            </div>
          );
        },
        th({ children }) {
          return <th className="px-3 py-2 bg-slate-700 text-left font-semibold text-slate-200 border-b border-slate-600">{children}</th>;
        },
        td({ children }) {
          return <td className="px-3 py-2 border-b border-slate-700/50 text-slate-300">{children}</td>;
        },
        a({ href, children }) {
          return <a href={href} target="_blank" rel="noopener noreferrer" className="text-indigo-400 underline hover:text-indigo-300">{children}</a>;
        },
        blockquote({ children }) {
          return <blockquote className="border-l-4 border-indigo-500 pl-4 my-2 text-slate-400 italic">{children}</blockquote>;
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

// ─── Message action buttons (Copy, Regenerate, TTS, Like, Dislike) ─────────────

function MessageActions({ message, onCopy, onRegenerate, onFeedback, speakingMessageId, onSpeak }) {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState(message.feedback || null);
  const isSpeaking = speakingMessageId === message.id;

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      onCopy && onCopy();
    });
  };

  const handleFeedback = (type) => {
    const newFeedback = feedback === type ? 'none' : type;
    setFeedback(newFeedback === 'none' ? null : newFeedback);
    onFeedback && onFeedback(message.id, newFeedback);
  };

  return (
    <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
      <button
        onClick={() => onSpeak && onSpeak(message.id, message.content)}
        title={isSpeaking ? "Stop speaking" : "Read aloud (Text-to-Speech)"}
        className={`p-1.5 rounded-lg transition-colors text-xs flex items-center gap-1 ${
          isSpeaking
            ? 'text-indigo-400 bg-indigo-500/20 animate-pulse'
            : 'text-slate-400 hover:text-white hover:bg-slate-700'
        }`}
      >
        {isSpeaking ? <VolumeX className="w-3.5 h-3.5 text-indigo-400" /> : <Volume2 className="w-3.5 h-3.5" />}
        <span className="hidden sm:inline">{isSpeaking ? 'Speaking...' : 'Read'}</span>
      </button>

      <button
        onClick={handleCopy}
        title="Copy response"
        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors text-xs flex items-center gap-1"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
        <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
      </button>

      <button
        onClick={() => onRegenerate && onRegenerate(message)}
        title="Regenerate response"
        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors text-xs flex items-center gap-1"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Regenerate</span>
      </button>

      <button
        onClick={() => handleFeedback('like')}
        title="Like"
        className={`p-1.5 rounded-lg transition-colors ${
          feedback === 'like'
            ? 'text-emerald-400 bg-emerald-400/10'
            : 'text-slate-400 hover:text-emerald-400 hover:bg-slate-700'
        }`}
      >
        <ThumbsUp className="w-3.5 h-3.5" />
      </button>

      <button
        onClick={() => handleFeedback('dislike')}
        title="Dislike"
        className={`p-1.5 rounded-lg transition-colors ${
          feedback === 'dislike'
            ? 'text-rose-400 bg-rose-400/10'
            : 'text-slate-400 hover:text-rose-400 hover:bg-slate-700'
        }`}
      >
        <ThumbsDown className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ─── Sidebar conversation item ───────────────────────────────────────────────

function ConvItem({ conv, isActive, onSelect, onDelete, onRename }) {
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(conv.title);
  const inputRef = useRef(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const saveRename = () => {
    if (editTitle.trim()) onRename(conv.id, editTitle.trim());
    setEditing(false);
  };

  const relTime = (dateStr) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString();
  };

  return (
    <div
      className={`group relative flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 ${
        isActive
          ? 'bg-indigo-600/20 border border-indigo-500/40 text-white'
          : 'hover:bg-slate-800/60 text-slate-300 hover:text-white border border-transparent'
      }`}
      onClick={() => !editing && onSelect(conv)}
    >
      <MessageSquare className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />

      <div className="flex-1 min-w-0">
        {editing ? (
          <input
            ref={inputRef}
            value={editTitle}
            onChange={e => setEditTitle(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') saveRename();
              if (e.key === 'Escape') { setEditing(false); setEditTitle(conv.title); }
            }}
            onBlur={saveRename}
            className="w-full bg-slate-700 text-white text-xs rounded px-2 py-0.5 outline-none ring-1 ring-indigo-500"
            onClick={e => e.stopPropagation()}
          />
        ) : (
          <>
            <p className="text-xs font-medium truncate">{conv.title}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">{relTime(conv.updated_at)}</p>
          </>
        )}
      </div>

      {!editing && (
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            onClick={e => { e.stopPropagation(); setEditing(true); }}
            className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            title="Rename"
          >
            <Edit3 className="w-3 h-3" />
          </button>
          <button
            onClick={e => { e.stopPropagation(); onDelete(conv.id); }}
            className="p-1 rounded hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function AIChatbot() {
  const { language, speechLangCode } = useLanguage();
  const { user } = useAuth();

  // Conversations list
  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [convSearch, setConvSearch] = useState('');

  // Messages in active conversation
  const [messages, setMessages] = useState([]);
  const [streamingContent, setStreamingContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Input
  const [inputValue, setInputValue] = useState('');
  const textareaRef = useRef(null);
  const chatEndRef = useRef(null);

  // Voice input & TTS
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);
  const [speakingMessageId, setSpeakingMessageId] = useState(null);

  // SSE abort
  const eventSourceRef = useRef(null);

  // Sidebar mobile toggle
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Error & Status banner
  const [error, setError] = useState('');
  const [copiedConv, setCopiedConv] = useState(false);

  // ── Fetch conversations on mount ──────────────────────────────────────────
  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const res = await api.get('/ai/conversations');
      setConversations(res.data || []);
    } catch (e) {
      console.error('[Fetch Conversations]', e);
    }
  };

  // ── Auto-scroll ───────────────────────────────────────────────────────────
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent, isLoading]);

  // ── Auto-resize textarea ──────────────────────────────────────────────────
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 180) + 'px';
    }
  }, [inputValue]);

  // ── Voice recognition setup ───────────────────────────────────────────────
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      const rec = new SR();
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = speechLangCode || 'en-IN';
      rec.onresult = (e) => {
        const transcript = Array.from(e.results).map(r => r[0].transcript).join('');
        setInputValue(transcript);
      };
      rec.onend = () => setListening(false);
      rec.onerror = () => setListening(false);
      recognitionRef.current = rec;
    }
  }, [speechLangCode]);

  const toggleVoice = () => {
    if (!recognitionRef.current) return;
    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
    } else {
      setInputValue('');
      recognitionRef.current.lang = speechLangCode || 'en-IN';
      try { recognitionRef.current.start(); setListening(true); } catch (e) {}
    }
  };

  // ── Text-to-Speech (TTS) Handler ──────────────────────────────────────────
  const handleSpeak = (messageId, text) => {
    if (!('speechSynthesis' in window)) return;

    if (speakingMessageId === messageId) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      return;
    }

    window.speechSynthesis.cancel();
    // Clean up markdown formatting for clean audio reading
    const cleanText = text
      .replace(/[*_#`~>|-]/g, ' ')
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')
      .replace(/```[\s\S]*?```/g, ' Code snippet omitted for speech ');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = speechLangCode || 'en-IN';
    utterance.onend = () => setSpeakingMessageId(null);
    utterance.onerror = () => setSpeakingMessageId(null);

    setSpeakingMessageId(messageId);
    window.speechSynthesis.speak(utterance);
  };

  // ── Select a conversation and load its messages ───────────────────────────
  const selectConversation = async (conv) => {
    if (speakingMessageId) window.speechSynthesis.cancel();
    setActiveConvId(conv.id);
    setMessages([]);
    setStreamingContent('');
    setError('');
    setSidebarOpen(false);
    try {
      const res = await api.get(`/ai/conversations/${conv.id}/messages`);
      setMessages(res.data || []);
    } catch (e) {
      setError('Failed to load conversation messages.');
    }
  };

  // ── Create new conversation ───────────────────────────────────────────────
  const startNewConversation = async () => {
    if (speakingMessageId) window.speechSynthesis.cancel();
    setActiveConvId(null);
    setMessages([]);
    setStreamingContent('');
    setError('');
    setInputValue('');
    setSidebarOpen(false);
  };

  // ── Share / Copy Conversation transcript ─────────────────────────────────
  const shareConversation = () => {
    if (messages.length === 0) return;
    const transcript = messages
      .map(m => `**${m.role === 'user' ? 'User' : 'College AI Assistant'}**: ${m.content}`)
      .join('\n\n---\n\n');

    navigator.clipboard.writeText(transcript).then(() => {
      setCopiedConv(true);
      setTimeout(() => setCopiedConv(false), 2000);
    });
  };

  // ── Clear current chat messages ───────────────────────────────────────────
  const clearCurrentChat = async () => {
    if (speakingMessageId) window.speechSynthesis.cancel();
    if (!activeConvId) {
      setMessages([]);
      return;
    }
    try {
      await api.delete(`/ai/conversations/${activeConvId}/clear`);
      setMessages([]);
    } catch (e) {
      setError('Failed to clear conversation messages.');
    }
  };

  // ── Clear all user conversations ──────────────────────────────────────────
  const clearAllConversations = async () => {
    if (speakingMessageId) window.speechSynthesis.cancel();
    try {
      await api.delete('/ai/conversations/clear-all');
      setConversations([]);
      setActiveConvId(null);
      setMessages([]);
    } catch (e) {
      setError('Failed to clear conversations.');
    }
  };

  // ── Delete conversation ───────────────────────────────────────────────────
  const deleteConversation = async (convId) => {
    try {
      await api.delete(`/ai/conversations/${convId}`);
      setConversations(prev => prev.filter(c => c.id !== convId));
      if (activeConvId === convId) {
        setActiveConvId(null);
        setMessages([]);
      }
    } catch (e) {
      setError('Failed to delete conversation.');
    }
  };

  // ── Rename conversation ───────────────────────────────────────────────────
  const renameConversation = async (convId, newTitle) => {
    try {
      await api.patch(`/ai/conversations/${convId}/rename`, { title: newTitle });
      setConversations(prev => prev.map(c => c.id === convId ? { ...c, title: newTitle } : c));
    } catch (e) {
      setError('Failed to rename conversation.');
    }
  };

  // ── Send message ──────────────────────────────────────────────────────────
  const sendMessage = useCallback(async (overrideText) => {
    const text = (overrideText !== undefined ? overrideText : inputValue).trim();
    if (!text || isLoading || isStreaming) return;

    setInputValue('');
    setError('');
    setIsLoading(true);
    setStreamingContent('');

    // Optimistically add user message
    const tempUserMsg = {
      id: `temp-user-${Date.now()}`,
      role: 'user',
      content: text,
      created_at: new Date().toISOString(),
      feedback: null,
    };
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      let convId = activeConvId;

      // If no active conversation, create one first
      if (!convId) {
        const createRes = await api.post('/ai/conversations', { title: 'New Conversation' });
        convId = createRes.data.id;
        setActiveConvId(convId);
        const newConv = createRes.data;
        setConversations(prev => [newConv, ...prev]);
      }

      // Get JWT for EventSource
      const token = localStorage.getItem('jwt_token');
      const encodedMsg = encodeURIComponent(text);
      const url = `${API_BASE}/ai/conversations/${convId}/stream?msg=${encodedMsg}&lang=${language}&token=${token}`;

      setIsLoading(false);
      setIsStreaming(true);

      // Open SSE stream
      const evtSource = new EventSource(url);
      eventSourceRef.current = evtSource;

      let accumulated = '';
      let convTitle = null;

      evtSource.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data.type === 'meta') {
            convTitle = data.title;
          } else if (data.type === 'token') {
            accumulated += data.text;
            setStreamingContent(accumulated);
          } else if (data.type === 'done') {
            evtSource.close();
            eventSourceRef.current = null;
            const assistantMsg = {
              id: data.assistant_message_id,
              role: 'assistant',
              content: accumulated,
              created_at: new Date().toISOString(),
              feedback: null,
            };
            setMessages(prev => [...prev, assistantMsg]);
            setStreamingContent('');
            setIsStreaming(false);

            if (convTitle) {
              setConversations(prev => prev.map(c =>
                c.id === convId
                  ? { ...c, title: convTitle, updated_at: new Date().toISOString() }
                  : c
              ));
            }
            fetchConversations();
          } else if (data.type === 'error') {
            evtSource.close();
            setStreamingContent('');
            setIsStreaming(false);
            setError(data.message || 'An error occurred.');
          }
        } catch (parseErr) {
          console.error('[SSE parse error]', parseErr);
        }
      };

      evtSource.onerror = () => {
        evtSource.close();
        eventSourceRef.current = null;
        setIsStreaming(false);
        if (!accumulated) {
          setError('Connection issue. Please try again.');
          setMessages(prev => prev.filter(m => m.id !== tempUserMsg.id));
        } else {
          const partialMsg = {
            id: `partial-${Date.now()}`,
            role: 'assistant',
            content: accumulated,
            created_at: new Date().toISOString(),
            feedback: null,
          };
          setMessages(prev => [...prev, partialMsg]);
          setStreamingContent('');
        }
      };

    } catch (err) {
      console.error('[Send Message Error]', err);
      setIsLoading(false);
      setIsStreaming(false);
      setMessages(prev => prev.filter(m => m.id !== tempUserMsg.id));
      setError(
        err.response?.data?.detail ||
        'Sorry, I could not process your request right now. Please check your connection.'
      );
    }
  }, [inputValue, activeConvId, language, isLoading, isStreaming]);

  // ── Stop streaming ────────────────────────────────────────────────────────
  const stopStreaming = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (streamingContent) {
      setMessages(prev => [
        ...prev,
        {
          id: `stopped-${Date.now()}`,
          role: 'assistant',
          content: streamingContent + '\n\n*(Generation stopped)*',
          created_at: new Date().toISOString(),
          feedback: null,
        },
      ]);
      setStreamingContent('');
    }
    setIsStreaming(false);
  };

  // ── Regenerate last AI response ───────────────────────────────────────────
  const regenerateResponse = async (assistantMessage) => {
    const idx = messages.findIndex(m => m.id === assistantMessage.id);
    if (idx <= 0) return;
    const userMsg = messages.slice(0, idx).reverse().find(m => m.role === 'user');
    if (!userMsg) return;

    setMessages(prev => prev.filter(m => m.id !== assistantMessage.id));
    await sendMessage(userMsg.content);
  };

  // ── Like / dislike ────────────────────────────────────────────────────────
  const handleFeedback = async (messageId, feedbackType) => {
    if (typeof messageId === 'string') return;
    try {
      await api.patch(`/ai/messages/${messageId}/feedback`, { feedback: feedbackType });
    } catch (e) {
      console.error('[Feedback Error]', e);
    }
  };

  // ── Keyboard handler ──────────────────────────────────────────────────────
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ── Filtered sidebar ──────────────────────────────────────────────────────
  const filteredConvs = conversations.filter(c =>
    c.title.toLowerCase().includes(convSearch.toLowerCase())
  );

  // ── Suggested prompts ─────────────────────────────────────────────────────
  const prompts = SUGGESTED_PROMPTS[language] || SUGGESTED_PROMPTS.en;
  const welcome = WELCOME[language] || WELCOME.en;
  const sub = SUB[language] || SUB.en;

  const timestamp = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div
      className="flex h-[calc(100vh-140px)] overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl"
      style={{ background: 'var(--bg-secondary)' }}
    >
      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <div
        className={`
          absolute lg:relative z-30 h-full flex flex-col
          w-72 bg-slate-900 border-r border-slate-800
          transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* New Chat & Clear All */}
        <div className="p-3 border-b border-slate-800 flex items-center gap-2">
          <button
            onClick={startNewConversation}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-all shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30"
          >
            <Plus className="w-4 h-4" />
            New Chat
          </button>
          {conversations.length > 0 && (
            <button
              onClick={clearAllConversations}
              title="Clear all conversations"
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors border border-slate-700"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Search */}
        <div className="px-3 py-2 border-b border-slate-800">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700">
            <Search className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={convSearch}
              onChange={e => setConvSearch(e.target.value)}
              className="bg-transparent text-xs text-slate-300 placeholder-slate-500 w-full outline-none"
            />
          </div>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
          {filteredConvs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-slate-600 text-xs text-center px-4">
              <MessageSquare className="w-6 h-6 mb-2 opacity-40" />
              {convSearch ? 'No conversations match.' : 'No conversations yet.\nStart a new chat!'}
            </div>
          ) : (
            filteredConvs.map(conv => (
              <ConvItem
                key={conv.id}
                conv={conv}
                isActive={conv.id === activeConvId}
                onSelect={selectConversation}
                onDelete={deleteConversation}
                onRename={renameConversation}
              />
            ))
          )}
        </div>

        {/* User badge */}
        <div className="p-3 border-t border-slate-800">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800/60">
            <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {user?.full_name?.[0] || 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user?.full_name}</p>
              <p className="text-[10px] text-slate-400 truncate">{user?.role}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-20 bg-black/60"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Main Chat Panel ──────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-950">

        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-800 bg-slate-900/80 backdrop-blur shrink-0">
          {/* Mobile sidebar toggle */}
          <button
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-bold text-white truncate">
              {conversations.find(c => c.id === activeConvId)?.title || 'College AI Assistant'}
            </h2>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] text-emerald-400 font-semibold">Online • Smart Campus AI</span>
            </div>
          </div>

          {/* Action buttons: Share, Clear, New Chat */}
          <div className="flex items-center gap-1">
            {messages.length > 0 && (
              <>
                <button
                  onClick={shareConversation}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1 text-xs"
                  title="Share / Copy conversation transcript"
                >
                  {copiedConv ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={clearCurrentChat}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors flex items-center gap-1 text-xs"
                  title="Clear conversation messages"
                >
                  <Eraser className="w-4 h-4" />
                </button>
              </>
            )}

            {activeConvId && !isStreaming && (
              <button
                onClick={startNewConversation}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="New Chat"
              >
                <Plus className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mx-4 mt-3 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
            <button className="ml-auto" onClick={() => setError('')}><X className="w-3.5 h-3.5" /></button>
          </div>
        )}

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-6 space-y-6">

          {/* Welcome screen (no active conversation) */}
          {!activeConvId && messages.length === 0 && (
            <div className="flex flex-col items-center justify-center min-h-full text-center space-y-8 pb-4">
              <div className="space-y-4">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center mx-auto shadow-2xl shadow-indigo-500/30 animate-float">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
                <div>
                  <div className="text-lg sm:text-xl font-bold text-white mb-1">
                    <MarkdownContent content={welcome} />
                  </div>
                  <p className="text-slate-400 text-sm">{sub}</p>
                </div>
              </div>

              {/* Suggested prompts grid */}
              <div className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {prompts.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(p.text)}
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-800/60 border border-slate-700/50 hover:border-indigo-500/50 hover:bg-indigo-500/10 text-left transition-all duration-200 group shadow-sm"
                  >
                    <span className="text-xl shrink-0">{p.icon}</span>
                    <span className="text-xs text-slate-300 group-hover:text-white font-medium transition-colors">{p.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Message thread */}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gradient-to-tr from-purple-600 to-indigo-600 text-white'
                }`}
              >
                {msg.role === 'user'
                  ? <User className="w-4 h-4" />
                  : <Bot className="w-4 h-4" />
                }
              </div>

              {/* Bubble */}
              <div className={`group max-w-[85%] sm:max-w-[75%] lg:max-w-[70%] space-y-1 ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                <div
                  className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-tr-none'
                      : 'bg-slate-800 text-slate-100 border border-slate-700/50 rounded-tl-none'
                  }`}
                >
                  {msg.role === 'user' ? (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  ) : (
                    <MarkdownContent content={msg.content} />
                  )}
                </div>

                {/* Timestamp */}
                <span className={`text-[10px] text-slate-500 px-1 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                  {timestamp(msg.created_at)}
                </span>

                {/* Actions for assistant messages */}
                {msg.role === 'assistant' && (
                  <MessageActions
                    message={msg}
                    onRegenerate={regenerateResponse}
                    onFeedback={handleFeedback}
                    speakingMessageId={speakingMessageId}
                    onSpeak={handleSpeak}
                  />
                )}
              </div>
            </div>
          ))}

          {/* Streaming bubble */}
          {isStreaming && streamingContent && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="max-w-[85%] sm:max-w-[75%] lg:max-w-[70%]">
                <div className="px-4 py-3 rounded-2xl rounded-tl-none bg-slate-800 border border-slate-700/50 text-sm text-slate-100 leading-relaxed shadow-sm">
                  <MarkdownContent content={streamingContent} />
                  <span className="inline-block w-0.5 h-4 bg-indigo-400 animate-pulse ml-0.5 align-middle" />
                </div>
              </div>
            </div>
          )}

          {/* Loading dots (before stream starts) */}
          {isLoading && !streamingContent && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-white animate-pulse" />
              </div>
              <div className="px-4 py-3.5 rounded-2xl rounded-tl-none bg-slate-800 border border-slate-700/50 shadow-sm">
                <TypingDots />
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* ── Input area ──────────────────────────────────────────────────── */}
        <div className="shrink-0 p-4 border-t border-slate-800 bg-slate-900/80 backdrop-blur">
          {/* Stop streaming button */}
          {isStreaming && (
            <div className="flex justify-center mb-3">
              <button
                onClick={stopStreaming}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold transition-colors border border-slate-600 shadow-md"
              >
                <StopCircle className="w-4 h-4 text-rose-400" />
                Stop generating
              </button>
            </div>
          )}

          <div className="flex items-end gap-2 max-w-4xl mx-auto">
            {/* Textarea */}
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  listening
                    ? '🎙️ Listening to your voice...'
                    : isStreaming
                    ? 'AI is thinking...'
                    : 'Ask anything... (Enter to send, Shift+Enter for newline)'
                }
                disabled={isStreaming}
                rows={1}
                className="w-full px-4 py-3 pr-12 rounded-2xl bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 text-sm resize-none outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all custom-scrollbar disabled:opacity-60"
              />
              {/* Mic button inside textarea */}
              <button
                onClick={toggleVoice}
                disabled={isStreaming}
                title={listening ? 'Stop listening' : 'Voice input'}
                className={`absolute right-3 bottom-3 p-1.5 rounded-lg transition-all ${
                  listening
                    ? 'text-rose-400 bg-rose-400/10 animate-pulse'
                    : 'text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10'
                } disabled:opacity-40`}
              >
                {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            </div>

            {/* Send button */}
            <button
              onClick={() => sendMessage()}
              disabled={!inputValue.trim() || isLoading || isStreaming}
              className="p-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white shadow-lg shadow-indigo-600/30 transition-all hover:shadow-indigo-600/50 shrink-0"
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          <p className="text-[10px] text-slate-500 text-center mt-2">
            College AI Assistant provides personalized campus information and general AI help.
          </p>
        </div>
      </div>
    </div>
  );
}
