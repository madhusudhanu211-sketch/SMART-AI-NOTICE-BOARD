import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Pin,
  Eye,
  Paperclip,
  Calendar,
  User,
  ArrowRight,
  AlertCircle,
  Tag
} from 'lucide-react';

export default function NoticeCard({ notice, onPinToggle, onBookmarkToggle }) {
  const navigate = useNavigate();

  const getCategoryColor = (cat) => {
    switch (cat) {
      case 'Academic': return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      case 'Examination': return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
      case 'Placements': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'Events': return 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20';
      case 'Emergency': return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
      default: return 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20';
    }
  };

  const getPriorityBadge = (priority) => {
    if (priority === 'High' || priority === 'Urgent') {
      return <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">HIGH PRIORITY</span>;
    }
    return null;
  };

  return (
    <div className={`group glass-card p-5 flex flex-col justify-between transition-all duration-200 hover:shadow-xl hover:border-indigo-500/30 ${
      notice.is_pinned ? 'border-amber-500/40 bg-amber-500/5 dark:bg-amber-500/5' : ''
    }`}>
      <div>
        {/* Header Row: Category, Priority, Pin */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-lg border uppercase tracking-wider ${getCategoryColor(notice.category)}`}>
              {notice.category || 'Academic'}
            </span>
            {getPriorityBadge(notice.priority)}
          </div>

          <div className="flex items-center gap-1">
            {notice.is_pinned && (
              <span className="p-1 rounded-md bg-amber-500/15 text-amber-500" title="Pinned Announcement">
                <Pin className="w-3.5 h-3.5 fill-amber-500" />
              </span>
            )}
          </div>
        </div>

        {/* Title & Description */}
        <h3
          onClick={() => navigate(`/notices/${notice.id}`)}
          className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors cursor-pointer line-clamp-2 mb-2 leading-snug"
        >
          {notice.title}
        </h3>

        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 mb-4 leading-relaxed">
          {notice.description}
        </p>
      </div>

      {/* Footer Info */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1" title="Author">
            <User className="w-3.5 h-3.5" />
            <span className="truncate max-w-[100px]">{notice.author_name || 'Administration'}</span>
          </div>

          <div className="flex items-center gap-1" title="Views">
            <Eye className="w-3.5 h-3.5" />
            <span>{notice.views_count || 0}</span>
          </div>

          {notice.attachment_url && (
            <div className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-semibold" title="Attachment included">
              <Paperclip className="w-3.5 h-3.5" />
              <span>Attachment</span>
            </div>
          )}
        </div>

        <button
          onClick={() => navigate(`/notices/${notice.id}`)}
          className="p-1.5 rounded-lg text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center gap-1"
        >
          <span className="font-semibold text-xs">Read</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
