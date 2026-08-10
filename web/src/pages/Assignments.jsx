import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { FileSpreadsheet, Upload, Clock, CheckCircle2, AlertCircle, Calendar, Plus, X } from 'lucide-react';

export default function Assignments() {
  const { user } = useAuth();
  const userRole = user?.role || 'Student';

  const [activeTab, setActiveTab] = useState('All');
  const [assignments, setAssignments] = useState([
    {
      id: 1,
      title: 'Web Application Portal Development',
      subject: 'Web Technologies',
      due_date: '2026-08-15T23:59:00',
      max_marks: 100,
      status: 'Pending',
      faculty_name: 'Prof. Anitha Sharma',
      description: 'Implement full-stack Vite React web application connected to FastAPI backend APIs.',
    },
    {
      id: 2,
      title: 'DBMS ER Diagram & Schema Design',
      subject: 'Database Systems',
      due_date: '2026-08-10T23:59:00',
      max_marks: 50,
      status: 'Submitted',
      faculty_name: 'Dr. Ramesh Kumar',
      description: 'Submit ER model diagrams and normalized SQL schemas for notice board application.',
    },
    {
      id: 3,
      title: 'Data Structures Graph Algorithms Lab Report',
      subject: 'Data Structures',
      due_date: '2026-08-01T23:59:00',
      max_marks: 30,
      status: 'Overdue',
      faculty_name: 'Dr. Suresh P.',
      description: 'Implement Dijkstra shortest path algorithm in C++/Python and attach performance benchmarks.',
    },
  ]);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissionUrl, setSubmissionUrl] = useState('');
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const res = await api.get('/assignments/');
        if (Array.isArray(res.data) && res.data.length > 0) {
          setAssignments(res.data.map(a => ({
            ...a,
            status: a.submitted ? 'Submitted' : 'Pending'
          })));
        }
      } catch (e) {}
    };
    fetchAssignments();
  }, []);

  const handleOpenSubmission = (asgn) => {
    setSelectedAssignment(asgn);
    setSubmissionUrl('');
    setSubmissionNotes('');
    setShowUploadModal(true);
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/assignments/submit', {
        assignment_id: selectedAssignment.id,
        file_url: submissionUrl || 'https://drive.google.com/sample_submission.pdf',
        notes: submissionNotes,
      });
    } catch (e) {}

    setAssignments(assignments.map(a => a.id === selectedAssignment.id ? { ...a, status: 'Submitted' } : a));
    setSubmitting(false);
    setShowUploadModal(false);
  };

  const filtered = assignments.filter(a => activeTab === 'All' || a.status === activeTab);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <span>Course Assignments</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            View course assignments, track due dates, and upload submissions
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800">
          {['All', 'Pending', 'Submitted', 'Overdue'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Assignment List Cards */}
      <div className="space-y-4">
        {filtered.map((asgn) => (
          <div key={asgn.id} className="glass-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-indigo-500/30 transition-all">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                  {asgn.subject}
                </span>
                <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                  asgn.status === 'Submitted' ? 'bg-emerald-500/10 text-emerald-600' : asgn.status === 'Overdue' ? 'bg-rose-500/10 text-rose-600' : 'bg-amber-500/10 text-amber-600'
                }`}>
                  {asgn.status}
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">{asgn.title}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">{asgn.description}</p>

              <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                <span>Faculty: <strong>{asgn.faculty_name}</strong></span>
                <span>Max Marks: <strong>{asgn.max_marks}</strong></span>
              </div>
            </div>

            <div className="flex flex-col sm:items-end gap-3 shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                <Clock className="w-4 h-4 text-indigo-500" />
                <span>Due: {new Date(asgn.due_date).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
              </div>

              {asgn.status !== 'Submitted' ? (
                <button
                  onClick={() => handleOpenSubmission(asgn)}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload Submission</span>
                </button>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Submitted</span>
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Submission Modal */}
      {showUploadModal && selectedAssignment && (
        <div className="fixed inset-0 bg-slate-950/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Submit Assignment</h3>
              <button onClick={() => setShowUploadModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-3 mt-4 text-xs">
              <p className="font-bold text-indigo-600">{selectedAssignment.title}</p>

              <div>
                <label className="font-bold text-slate-500">Submission File Link / Google Drive URL</label>
                <input
                  type="url"
                  required
                  placeholder="https://drive.google.com/your-assignment.pdf"
                  value={submissionUrl}
                  onChange={(e) => setSubmissionUrl(e.target.value)}
                  className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-500">Submission Notes / Remarks</label>
                <textarea
                  rows={3}
                  placeholder="Any comments for faculty..."
                  value={submissionNotes}
                  onChange={(e) => setSubmissionNotes(e.target.value)}
                  className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-indigo-600 text-white font-bold shadow-lg"
              >
                {submitting ? 'Uploading...' : 'Confirm Submission'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
