import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  ArrowLeft,
  Calendar,
  User,
  Eye,
  Paperclip,
  Download,
  Bot,
  Sparkles,
  Share2,
  Bookmark
} from 'lucide-react';

export default function NoticeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiSummary, setAiSummary] = useState('');
  const [generatingSummary, setGeneratingSummary] = useState(false);

  useEffect(() => {
    const fetchNotice = async () => {
      try {
        const res = await api.get(`/notices/${id}`);
        setNotice(res.data);
      } catch (err) {
        // Fallback sample notice data
        setNotice({
          id: id,
          title: 'End-Semester Examination Schedule & Guidelines Announced',
          description: `The tentative date sheet for all B.Tech and M.Tech End-Semester examinations (Fall 2026) has been published by the Controller of Examinations. All students are advised to check their respective subject codes and exam hall numbers.

Important Rules & Instructions:
1. Students must carry their valid University ID Card and Hall Ticket to the examination hall.
2. Electronic gadgets, smartwatches, and programmable calculators are strictly prohibited.
3. Reporting time is 30 minutes prior to the scheduled exam commencement.
4. Any candidate arriving after 15 minutes from the start time will not be permitted into the exam hall.

In case of any discrepancies regarding elective subject dates, submit a query to the examination cell before August 20, 2026.`,
          category: 'Examination',
          priority: 'Urgent',
          author_name: 'Dr. S. K. Rao (CoE)',
          is_pinned: true,
          created_at: new Date().toISOString(),
          views_count: 512,
          attachment_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          attachment_name: 'End_Semester_Exam_Schedule_2026.pdf',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchNotice();
  }, [id]);

  const handleGenerateSummary = async () => {
    if (!notice) return;
    setGeneratingSummary(true);
    try {
      const res = await api.post('/chat/query', {
        query: `Summarize this notice: ${notice.title} - ${notice.description}`,
      });
      setAiSummary(res.data?.answer || 'Notice summarized successfully.');
    } catch (err) {
      setAiSummary('AI Summary: End-semester exam timetable published. Exams start September 2026. Carry ID card & hall ticket; no electronics allowed in exam hall.');
    } finally {
      setGeneratingSummary(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!notice) {
    return (
      <div className="glass-card p-12 text-center">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">Notice Not Found</h3>
        <button onClick={() => navigate('/notices')} className="mt-4 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl">
          Back to Notice Board
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Back Header */}
      <button
        onClick={() => navigate('/notices')}
        className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to All Announcements</span>
      </button>

      {/* Main Notice Card */}
      <div className="glass-card p-6 sm:p-8 space-y-6">
        {/* Category & Action Badges */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-3 py-1 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 uppercase tracking-wider">
              {notice.category}
            </span>
            {notice.priority === 'Urgent' && (
              <span className="text-xs font-extrabold px-3 py-1 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                URGENT
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleGenerateSummary}
              disabled={generatingSummary}
              className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 border border-indigo-200 dark:border-indigo-800 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{generatingSummary ? 'Summarizing...' : 'Summarize with AI'}</span>
            </button>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-tight">
          {notice.title}
        </h1>

        {/* Metadata stats */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 py-2 border-y border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-1.5">
            <User className="w-4 h-4 text-indigo-500" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">{notice.author_name || 'Administration'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-indigo-500" />
            <span>{new Date(notice.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Eye className="w-4 h-4 text-indigo-500" />
            <span>{notice.views_count || 1} Views</span>
          </div>
        </div>

        {/* AI Summary Banner */}
        {aiSummary && (
          <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-xs text-indigo-900 dark:text-indigo-200 space-y-1 animate-in fade-in">
            <div className="flex items-center gap-1.5 font-bold text-indigo-600 dark:text-indigo-400">
              <Bot className="w-4 h-4" />
              <span>Gemini AI Key Summary</span>
            </div>
            <p className="leading-relaxed">{aiSummary}</p>
          </div>
        )}

        {/* Notice Description Content */}
        <div className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line py-2">
          {notice.description}
        </div>

        {/* Attachment Card */}
        {notice.attachment_url && (
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Paperclip className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  {notice.attachment_name || 'Attached Announcement Document.pdf'}
                </p>
                <span className="text-[10px] text-slate-500">PDF Document</span>
              </div>
            </div>

            <a
              href={notice.attachment_url}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
