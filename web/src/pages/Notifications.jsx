import React, { useState } from 'react';
import { Bell, Check, Trash2, AlertTriangle, Calendar, FileSpreadsheet, Briefcase, CheckCircle2 } from 'lucide-react';

export default function Notifications() {
  const [notifications, setNotifications] = useState([
    { id: 1, title: '🚨 EMERGENCY ALERT: Heavy Rain Forecast - College Closed Tomorrow', type: 'Emergency', time: '10 mins ago', read: false },
    { id: 2, title: 'End-Semester Exam Date Sheet Published on Notice Board', type: 'Exam', time: '1 hour ago', read: false },
    { id: 3, title: 'New Assignment Added: Web Application Portal Development', type: 'Assignment', time: '3 hours ago', read: false },
    { id: 4, title: 'Google Cloud Campus Placement Drive Registrations Open', type: 'Placement', time: 'Yesterday', read: true },
    { id: 5, title: 'National Level AI Hackathon 2026 QR Pass Issued', type: 'Event', time: '2 days ago', read: true },
  ]);

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const getIcon = (type) => {
    switch (type) {
      case 'Emergency': return <AlertTriangle className="w-5 h-5 text-rose-500" />;
      case 'Exam': return <Calendar className="w-5 h-5 text-purple-500" />;
      case 'Assignment': return <FileSpreadsheet className="w-5 h-5 text-amber-500" />;
      case 'Placement': return <Briefcase className="w-5 h-5 text-emerald-500" />;
      default: return <Bell className="w-5 h-5 text-indigo-500" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Bell className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <span>Notification Center</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Alerts for notices, exams, assignments, and emergency broadcasts
          </p>
        </div>

        <button
          onClick={markAllAsRead}
          className="px-3.5 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:bg-indigo-100 transition-colors flex items-center gap-1.5"
        >
          <Check className="w-4 h-4" />
          <span>Mark All Read</span>
        </button>
      </div>

      <div className="glass-card divide-y divide-slate-100 dark:divide-slate-800">
        {notifications.map((notif) => (
          <div
            key={notif.id}
            className={`p-4 sm:p-5 flex items-start justify-between gap-4 transition-colors ${
              !notif.read ? 'bg-indigo-500/5 dark:bg-indigo-500/5' : ''
            }`}
          >
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 shrink-0">
                {getIcon(notif.type)}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {notif.type}
                  </span>
                  {!notif.read && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-600 text-white">NEW</span>
                  )}
                </div>
                <p className="text-sm font-bold text-slate-900 dark:text-white mt-1 leading-snug">{notif.title}</p>
                <span className="text-[11px] text-slate-400 mt-1 block">{notif.time}</span>
              </div>
            </div>

            <button
              onClick={() => deleteNotification(notif.id)}
              className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
              title="Delete Notification"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
