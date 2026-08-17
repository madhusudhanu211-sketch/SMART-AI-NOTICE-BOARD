import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen, Plus, CheckCircle2, FileSpreadsheet, Bell,
  Upload, Calendar, ArrowRight, Send, X
} from 'lucide-react';

export default function FacultyPanel() {
  const [activeTab, setActiveTab] = useState('Publish');
  const navigate = useNavigate();

  const [publishSuccess, setPublishSuccess] = useState('');

  // Publish Notice form
  const [notice, setNotice] = useState({ title: '', category: 'Academic', priority: 'Normal', body: '', expiryDate: '' });
  // Assignment form
  const [assignment, setAssignment] = useState({ subject: '', title: '', description: '', dueDate: '', maxMarks: '' });
  // Upload Notes form
  const [uploadFile, setUploadFile] = useState({ subject: '', title: '', category: 'Notes', fileName: '' });
  const [dragOver, setDragOver] = useState(false);

  const handlePublishNotice = (e) => {
    e.preventDefault();
    if (!notice.title.trim() || !notice.body.trim()) return;
    setPublishSuccess('Notice published successfully! It is now live on the student notice board.');
    setNotice({ title: '', category: 'Academic', priority: 'Normal', body: '', expiryDate: '' });
    setTimeout(() => setPublishSuccess(''), 4000);
  };

  const handlePostAssignment = (e) => {
    e.preventDefault();
    if (!assignment.title.trim() || !assignment.subject.trim()) return;
    setPublishSuccess(`Assignment "${assignment.title}" posted successfully! Students will be notified.`);
    setAssignment({ subject: '', title: '', description: '', dueDate: '', maxMarks: '' });
    setTimeout(() => setPublishSuccess(''), 4000);
  };

  const handleUploadNotes = (e) => {
    e.preventDefault();
    if (!uploadFile.title.trim() || !uploadFile.fileName) return;
    setPublishSuccess(`"${uploadFile.title}" uploaded to the study materials repository.`);
    setUploadFile({ subject: '', title: '', category: 'Notes', fileName: '' });
    setTimeout(() => setPublishSuccess(''), 4000);
  };

  const quickActions = [
    { id: 'Publish', icon: Bell, color: 'purple', label: 'Publish Notice', sub: 'Broadcast circular to students' },
    { id: 'Attendance', icon: CheckCircle2, color: 'emerald', label: 'Mark Attendance', sub: 'Log present/absent roster', redirect: true },
    { id: 'Assignment', icon: FileSpreadsheet, color: 'indigo', label: 'Post Assignment', sub: 'Create new course assignment' },
    { id: 'Upload', icon: Upload, color: 'amber', label: 'Upload Notes', sub: 'Share lecture notes & question banks' },
  ];

  const colorMap = {
    purple: { card: 'hover:border-purple-500/40', icon: 'bg-purple-500/20 text-purple-500' },
    emerald: { card: 'glass-card p-5 text-left border-emerald-500/40 hover:border-emerald-500 bg-emerald-500/5', icon: 'bg-emerald-500/20 text-emerald-500' },
    indigo: { card: 'hover:border-indigo-500/40', icon: 'bg-indigo-500/10 text-indigo-600' },
    amber: { card: 'hover:border-amber-500/40', icon: 'bg-amber-500/10 text-amber-600' },
  };

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
        {quickActions.map(({ id, icon: Icon, color, label, sub, redirect }) => (
          <button
            key={id}
            onClick={() => redirect ? navigate('/attendance') : setActiveTab(id)}
            className={`glass-card p-5 text-left transition-all space-y-2 group ${colorMap[color]?.card || ''}`}
          >
            <div className={`p-3 rounded-2xl w-fit group-hover:scale-110 transition-transform ${colorMap[color]?.icon}`}>
              <Icon className="w-6 h-6" />
            </div>
            {redirect ? (
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{label}</h3>
                <ArrowRight className="w-4 h-4 text-emerald-500" />
              </div>
            ) : (
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{label}</h3>
            )}
            <p className="text-xs text-slate-500">{sub}</p>
          </button>
        ))}
      </div>

      {/* Success Toast */}
      {publishSuccess && (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-400/30 text-emerald-700 dark:text-emerald-300 animate-in slide-in-from-top-2 duration-300">
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-xs font-semibold">{publishSuccess}</p>
          <button onClick={() => setPublishSuccess('')} className="ml-auto">
            <X className="w-4 h-4 opacity-60 hover:opacity-100" />
          </button>
        </div>
      )}

      {/* Forms Panel */}
      <div className="glass-card p-6 space-y-5">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
          {activeTab === 'Publish' ? '📢 Publish New Notice' :
           activeTab === 'Assignment' ? '📋 Post New Assignment' :
           activeTab === 'Upload' ? '📁 Upload Study Material' :
           'Faculty Action'}
        </h3>

        {/* ── PUBLISH NOTICE FORM ── */}
        {activeTab === 'Publish' && (
          <form onSubmit={handlePublishNotice} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Category</label>
                <select
                  value={notice.category}
                  onChange={e => setNotice(p => ({ ...p, category: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                >
                  {['Academic', 'Examination', 'Placement', 'Event', 'Emergency', 'General'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Priority</label>
                <select
                  value={notice.priority}
                  onChange={e => setNotice(p => ({ ...p, priority: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                >
                  {['Normal', 'High', 'Urgent'].map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Notice Title *</label>
              <input
                type="text"
                required
                value={notice.title}
                onChange={e => setNotice(p => ({ ...p, title: e.target.value }))}
                placeholder="e.g. Internal Assessment Test 1 Schedule"
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Notice Body *</label>
              <textarea
                required
                rows={4}
                value={notice.body}
                onChange={e => setNotice(p => ({ ...p, body: e.target.value }))}
                placeholder="Enter full notice content here. This will appear on student notice boards..."
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white resize-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Expiry Date (optional)</label>
              <input
                type="date"
                value={notice.expiryDate}
                onChange={e => setNotice(p => ({ ...p, expiryDate: e.target.value }))}
                className="w-full sm:w-48 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs shadow-xl shadow-purple-600/30 flex items-center gap-2 transition-all"
            >
              <Send className="w-4 h-4" />
              Publish Notice to Students
            </button>
          </form>
        )}

        {/* ── POST ASSIGNMENT FORM ── */}
        {activeTab === 'Assignment' && (
          <form onSubmit={handlePostAssignment} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Subject *</label>
                <input
                  type="text"
                  required
                  value={assignment.subject}
                  onChange={e => setAssignment(p => ({ ...p, subject: e.target.value }))}
                  placeholder="e.g. Data Structures & Algorithms"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Max Marks</label>
                <input
                  type="number"
                  value={assignment.maxMarks}
                  onChange={e => setAssignment(p => ({ ...p, maxMarks: e.target.value }))}
                  placeholder="e.g. 20"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Assignment Title *</label>
              <input
                type="text"
                required
                value={assignment.title}
                onChange={e => setAssignment(p => ({ ...p, title: e.target.value }))}
                placeholder="e.g. Implement AVL Tree with Rotations"
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Description / Instructions</label>
              <textarea
                rows={4}
                value={assignment.description}
                onChange={e => setAssignment(p => ({ ...p, description: e.target.value }))}
                placeholder="Detailed instructions, expected output format, submission guidelines..."
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white resize-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Due Date *</label>
              <input
                type="date"
                required
                value={assignment.dueDate}
                onChange={e => setAssignment(p => ({ ...p, dueDate: e.target.value }))}
                className="w-full sm:w-48 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-black text-xs shadow-xl shadow-indigo-600/30 flex items-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              Post Assignment to Students
            </button>
          </form>
        )}

        {/* ── UPLOAD NOTES FORM ── */}
        {activeTab === 'Upload' && (
          <form onSubmit={handleUploadNotes} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Subject</label>
                <input
                  type="text"
                  value={uploadFile.subject}
                  onChange={e => setUploadFile(p => ({ ...p, subject: e.target.value }))}
                  placeholder="e.g. Computer Networks"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Category</label>
                <select
                  value={uploadFile.category}
                  onChange={e => setUploadFile(p => ({ ...p, category: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                >
                  {['Notes', 'Question Papers', 'Lab Manuals', 'Syllabus', 'Circulars', 'Other'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Document Title *</label>
              <input
                type="text"
                required
                value={uploadFile.title}
                onChange={e => setUploadFile(p => ({ ...p, title: e.target.value }))}
                placeholder="e.g. Computer Networks – Unit 3 Notes"
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              />
            </div>

            {/* Drag & Drop Zone */}
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => {
                e.preventDefault();
                setDragOver(false);
                const f = e.dataTransfer.files[0];
                if (f) setUploadFile(p => ({ ...p, fileName: f.name }));
              }}
              className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
                dragOver
                  ? 'border-indigo-500 bg-indigo-500/5'
                  : uploadFile.fileName
                  ? 'border-emerald-500/50 bg-emerald-500/5'
                  : 'border-slate-300 dark:border-slate-700 hover:border-indigo-400'
              }`}
            >
              <input
                type="file"
                accept=".pdf,.doc,.docx,.pptx,.xlsx"
                onChange={e => {
                  const f = e.target.files[0];
                  if (f) setUploadFile(p => ({ ...p, fileName: f.name }));
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              {uploadFile.fileName ? (
                <div className="space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                  <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">{uploadFile.fileName}</p>
                  <p className="text-[11px] text-slate-500">File ready to upload</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Drag & drop file here</p>
                  <p className="text-[11px] text-slate-500">or click to browse</p>
                  <p className="text-[10px] text-slate-400">Supports PDF, DOC, DOCX, PPTX, XLSX (max 10MB)</p>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-black text-xs shadow-xl shadow-amber-500/30 flex items-center gap-2 transition-all"
            >
              <Upload className="w-4 h-4" />
              Upload to Study Repository
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
