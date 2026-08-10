import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Plus, CheckCircle2, FileSpreadsheet, Bell, Upload, Calendar, ArrowRight } from 'lucide-react';

export default function FacultyPanel() {
  const [activeTab, setActiveTab] = useState('Publish');
  const navigate = useNavigate();

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          <span>Faculty Control Center</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Faculty portal for notice broadcasting, attendance logging, and assignment management
        </p>
      </div>

      {/* Quick Action Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={() => setActiveTab('Publish')}
          className="glass-card p-5 text-left hover:border-purple-500/40 transition-all space-y-2 group"
        >
          <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-600 w-fit group-hover:scale-110 transition-transform">
            <Bell className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Publish Notice</h3>
          <p className="text-xs text-slate-500">Broadcast circular to department students</p>
        </button>

        <button
          onClick={() => navigate('/attendance')}
          className="glass-card p-5 text-left border-emerald-500/40 hover:border-emerald-500 transition-all space-y-2 group bg-emerald-500/5"
        >
          <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-500 w-fit group-hover:scale-110 transition-transform">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Mark Attendance</h3>
            <ArrowRight className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-xs text-slate-500">Log present/absent for today's lecture section</p>
        </button>

        <button
          onClick={() => setActiveTab('Assignment')}
          className="glass-card p-5 text-left hover:border-indigo-500/40 transition-all space-y-2 group"
        >
          <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-600 w-fit group-hover:scale-110 transition-transform">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Post Assignment</h3>
          <p className="text-xs text-slate-500">Create new course assignment & due date</p>
        </button>

        <button
          onClick={() => setActiveTab('Upload')}
          className="glass-card p-5 text-left hover:border-amber-500/40 transition-all space-y-2 group"
        >
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-600 w-fit group-hover:scale-110 transition-transform">
            <Upload className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Upload Notes</h3>
          <p className="text-xs text-slate-500">Share lecture notes & question banks</p>
        </button>
      </div>

      {/* Main Form Content */}
      <div className="glass-card p-6">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
          Faculty Action: {activeTab}
        </h3>

        {activeTab === 'Attendance' ? (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 space-y-3">
            <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold">
              Open the dedicated Attendance Console to mark student present/absent roster with duplicate prevention:
            </p>
            <button
              onClick={() => navigate('/attendance')}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Go to Attendance Console</span>
            </button>
          </div>
        ) : (
          <div className="text-xs text-slate-500">
            Form ready for {activeTab}. Published items immediately sync to student notice boards and portals.
          </div>
        )}
      </div>
    </div>
  );
}
