import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  Bell,
  CheckCircle2,
  FileSpreadsheet,
  CalendarDays,
  Briefcase,
  Bot,
  Mic,
  Pin,
  Clock,
  ArrowRight,
  Award,
  Sparkles,
  GraduationCap,
  FileText,
  Settings,
  Download,
  Bookmark,
  Volume2,
  Layers,
  Calendar,
  Users,
  ShieldCheck,
  BookOpen,
  PlusCircle
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const role = user?.role || 'Student';
  const userName = user?.full_name || 'Madhu Sudhan';

  const [notices] = useState([
    {
      id: 1,
      title: 'Urgent Campus Maintenance Notice',
      description: 'Power supply maintenance will occur on Block A tomorrow from 9:00 AM to 1:00 PM.',
      category: 'Emergency',
      priority: 'Urgent',
      author_name: 'Campus Infrastructure Dept',
      is_pinned: true,
      created_at: '2026-08-10T08:30:00Z',
    },
    {
      id: 2,
      title: 'End-Semester Examination Schedule Announced',
      description: 'The final date sheet for B.Tech & M.Tech semester examinations starting September 1st, 2026 is published on the portal.',
      category: 'Examination',
      priority: 'High',
      author_name: 'Controller of Exams',
      is_pinned: true,
      created_at: '2026-08-09T10:15:00Z',
    },
  ]);

  const [bookmarkedIds, setBookmarkedIds] = useState([1]);
  const [speakingId, setSpeakingId] = useState(null);

  const timetableToday = [
    { time: '09:00 AM', subject: 'Data Structures', room: 'CS-301', faculty: 'Dr. S. Jenkins' },
    { time: '10:15 AM', subject: 'Database Systems', room: 'Lab-2', faculty: 'Dr. R. Varma' },
    { time: '11:30 AM', subject: 'AI & Machine Learning', room: 'CS-304', faculty: 'Dr. A. Pendleton' },
  ];

  const handleSpeakNotice = (notice) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      if (speakingId === notice.id) {
        setSpeakingId(null);
        return;
      }
      setSpeakingId(notice.id);
      const textToSpeak = `${notice.title}. ${notice.description}`;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.onend = () => setSpeakingId(null);
      utterance.onerror = () => setSpeakingId(null);
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleBookmark = (id) => {
    setBookmarkedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Welcome Banner Customized by Role */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-indigo-950 via-indigo-900 to-purple-950 text-white p-6 sm:p-8 shadow-2xl border border-indigo-800/40">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold uppercase tracking-wider text-indigo-200">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{role} Academic Dashboard</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              Welcome Back, {userName}
            </h1>
            <p className="text-xs sm:text-sm text-indigo-200/90 max-w-xl">
              {role === 'Faculty'
                ? "Manage class attendance rosters, grade assignments, and post announcements."
                : role === 'Admin'
                ? "Oversee campus users, portal roles, notices, and system logs."
                : "Here's what's happening with your academic activities today."}
            </p>
          </div>

          {/* Role Action Shortcuts */}
          <div className="flex items-center gap-3 flex-wrap">
            {role === 'Faculty' ? (
              <button
                onClick={() => navigate('/attendance')}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-xs shadow-xl shadow-emerald-600/30 flex items-center gap-2 transition-all transform hover:scale-105"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Mark Attendance</span>
              </button>
            ) : role === 'Admin' ? (
              <button
                onClick={() => navigate('/admin')}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-black text-xs shadow-xl shadow-amber-600/30 flex items-center gap-2 transition-all transform hover:scale-105"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Admin Console</span>
              </button>
            ) : null}

            <button
              onClick={() => navigate('/voice')}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold text-xs shadow-lg flex items-center gap-2"
            >
              <Mic className="w-4 h-4" />
              <span>Voice AI</span>
            </button>
            <button
              onClick={() => navigate('/chatbot')}
              className="px-4 py-2.5 rounded-xl bg-white text-indigo-950 font-bold text-xs shadow-lg hover:bg-indigo-50 transition-all flex items-center gap-2"
            >
              <Bot className="w-4 h-4 text-indigo-600" />
              <span>AI Chatbot</span>
            </button>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* FACULTY DASHBOARD SUMMARY WIDGET                               */}
      {/* ------------------------------------------------------------- */}
      {role === 'Faculty' && (
        <div className="glass-card p-6 border-emerald-500/30 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span>📋 Mark Attendance Console</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Mark present/absent status for enrolled section students with duplicate record protection.
              </p>
            </div>

            <button
              onClick={() => navigate('/attendance?tab=mark')}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-xl shadow-emerald-600/30 flex items-center gap-2 transition-all transform hover:scale-105"
            >
              <PlusCircle className="w-4 h-4" />
              <span>📋 Mark Attendance</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Enrolled Students</span>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">142</h3>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Sections Taught</span>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">4 Sections</h3>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Classes Conducted</span>
              <h3 className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">28 Classes</h3>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Avg Attendance Rate</span>
              <h3 className="text-xl font-black text-indigo-600 dark:text-indigo-400 mt-0.5">89.4%</h3>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div onClick={() => navigate('/notices')} className="glass-card p-4 hover:border-indigo-500/50 cursor-pointer transition-all hover:scale-102">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 w-fit mb-2">
            <Bell className="w-4 h-4" />
          </div>
          <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('dashboard.stats.activeNotices', 'Active Notices')}</p>
          <h3 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">14</h3>
        </div>

        <div onClick={() => navigate('/attendance')} className="glass-card p-4 hover:border-emerald-500/50 cursor-pointer transition-all hover:scale-102">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 w-fit mb-2">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('dashboard.stats.attendancePct', 'Attendance %')}</p>
          <h3 className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">88.5%</h3>
        </div>

        <div onClick={() => navigate('/assignments')} className="glass-card p-4 hover:border-amber-500/50 cursor-pointer transition-all hover:scale-102">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 w-fit mb-2">
            <FileSpreadsheet className="w-4 h-4" />
          </div>
          <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('dashboard.stats.assignmentsDue', 'Assignments Due')}</p>
          <h3 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">3</h3>
        </div>

        <div onClick={() => navigate('/timetable')} className="glass-card p-4 hover:border-blue-500/50 cursor-pointer transition-all hover:scale-102">
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 w-fit mb-2">
            <Clock className="w-4 h-4" />
          </div>
          <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('dashboard.stats.classesToday', 'Classes Today')}</p>
          <h3 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">4</h3>
        </div>

        <div onClick={() => navigate('/notices')} className="glass-card p-4 hover:border-purple-500/50 cursor-pointer transition-all hover:scale-102">
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 w-fit mb-2">
            <Award className="w-4 h-4" />
          </div>
          <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('dashboard.stats.upcomingExams', 'Upcoming Exams')}</p>
          <h3 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">2</h3>
        </div>

        <div onClick={() => navigate('/placements')} className="glass-card p-4 hover:border-teal-500/50 cursor-pointer transition-all hover:scale-102">
          <div className="p-2 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 w-fit mb-2">
            <Briefcase className="w-4 h-4" />
          </div>
          <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('dashboard.stats.placements', 'Placement Drives')}</p>
          <h3 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">5</h3>
        </div>
      </div>

      {/* Main Grid: Pinned Announcements & Today's Timetable */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Pin className="w-5 h-5 text-amber-500 fill-amber-500" />
              <span>Pinned Announcements & Urgent Notices</span>
            </h2>
            <button
              onClick={() => navigate('/notices')}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>View All Notices</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-4">
            {notices.map((n) => (
              <div
                key={n.id}
                className="glass-card p-5 hover:border-indigo-500/40 transition-all space-y-3 relative"
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                      n.priority === 'Urgent' ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30' : 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30'
                    }`}>
                      {n.priority}
                    </span>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {n.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleSpeakNotice(n)}
                      className={`p-2 rounded-xl border text-xs transition-colors flex items-center gap-1 ${
                        speakingId === n.id
                          ? 'bg-rose-500 text-white border-rose-500'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      <Volume2 className={`w-3.5 h-3.5 ${speakingId === n.id ? 'animate-bounce' : ''}`} />
                      <span className="text-[11px] font-bold hidden sm:inline">
                        {speakingId === n.id ? 'Stop' : 'Listen'}
                      </span>
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">{n.title}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">{n.description}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-500">
                  <span>Posted by: <strong>{n.author_name}</strong></span>
                  <button
                    onClick={() => navigate(`/notices/${n.id}`)}
                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    <span>View Notice</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Today's Timetable Section */}
        <div className="space-y-4">
          <div className="glass-card p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Today's Timetable</span>
              </h3>
              <button
                onClick={() => navigate('/timetable')}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                View All
              </button>
            </div>

            <div className="space-y-3">
              {timetableToday.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-300">
                      {item.time}
                    </span>
                    <span className="text-[11px] font-bold text-slate-500">{item.room}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white pt-1">{item.subject}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{item.faculty}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
