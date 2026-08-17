import React, { useState } from 'react';
import { FileText, Download, Search, Upload, File, Plus, X, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Documents() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState('');

  const [uploadForm, setUploadForm] = useState({ title: '', subject: '', category: 'Notes', fileName: '' });

  const canUpload = user?.role === 'Faculty' || user?.role === 'Admin';

  const categories = ['All', 'Notes', 'Question Papers', 'Syllabus', 'Lab Manuals', 'Circulars'];

  const [documents, setDocuments] = useState([
    { id: 1, title: 'Data Structures & Algorithms Complete Course Notes', category: 'Notes', subject: 'CSE301', size: '4.2 MB', uploader: 'Prof. Anitha Sharma', date: '2026-08-01', url: '#' },
    { id: 2, title: 'DBMS Semester V Previous Question Papers (2021-2025)', category: 'Question Papers', subject: 'CSE302', size: '8.1 MB', uploader: 'Academic Cell', date: '2026-07-28', url: '#' },
    { id: 3, title: 'Computer Networks Lab Execution Manual & Experiments', category: 'Lab Manuals', subject: 'CSE303', size: '2.8 MB', uploader: 'Dr. Ramesh Kumar', date: '2026-08-03', url: '#' },
    { id: 4, title: 'B.Tech CSE Semester VI Official Syllabus Document', category: 'Syllabus', subject: 'CSE All', size: '1.5 MB', uploader: 'HOD CSE', date: '2026-07-15', url: '#' },
    { id: 5, title: 'Operating Systems – Process Scheduling Lecture Notes', category: 'Notes', subject: 'CSE304', size: '3.1 MB', uploader: 'Dr. Suresh P.', date: '2026-08-05', url: '#' },
    { id: 6, title: 'AI & Machine Learning – Unit 4 Deep Learning Notes', category: 'Notes', subject: 'CSE401', size: '5.6 MB', uploader: 'Dr. A. Pendleton', date: '2026-08-07', url: '#' },
  ]);

  const filtered = documents.filter((doc) => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) || doc.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleUploadSubmit = (e) => {
    e.preventDefault();
    if (!uploadForm.title.trim() || !uploadForm.fileName) return;
    const newDoc = {
      id: Date.now(),
      title: uploadForm.title,
      category: uploadForm.category,
      subject: uploadForm.subject || 'General',
      size: 'Uploading...',
      uploader: user?.full_name || 'Faculty',
      date: new Date().toISOString().split('T')[0],
      url: '#',
    };
    setDocuments(prev => [newDoc, ...prev]);
    setUploadSuccess(`"${uploadForm.title}" uploaded successfully!`);
    setUploadForm({ title: '', subject: '', category: 'Notes', fileName: '' });
    setTimeout(() => {
      setShowUploadModal(false);
      setUploadSuccess('');
    }, 2000);
  };

  const CATEGORY_COLORS = {
    Notes: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
    'Question Papers': 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    'Lab Manuals': 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    Syllabus: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    Circulars: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <span>Study Materials & Documents Repository</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Download lecture notes, question banks, lab manuals, and syllabus PDFs
          </p>
        </div>
        {canUpload && (
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all"
          >
            <Upload className="w-4 h-4" />
            Upload Document
          </button>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 dark:text-white">Upload Study Material</h3>
              <button onClick={() => setShowUploadModal(false)}>
                <X className="w-5 h-5 text-slate-400 hover:text-slate-700 dark:hover:text-white" />
              </button>
            </div>

            {uploadSuccess ? (
              <div className="flex flex-col items-center gap-3 py-6">
                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400 text-center">{uploadSuccess}</p>
              </div>
            ) : (
              <form onSubmit={handleUploadSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Category</label>
                    <select
                      value={uploadForm.category}
                      onChange={e => setUploadForm(p => ({ ...p, category: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                    >
                      {categories.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Subject Code</label>
                    <input
                      type="text"
                      value={uploadForm.subject}
                      onChange={e => setUploadForm(p => ({ ...p, subject: e.target.value }))}
                      placeholder="e.g. CSE301"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Document Title *</label>
                  <input
                    type="text"
                    required
                    value={uploadForm.title}
                    onChange={e => setUploadForm(p => ({ ...p, title: e.target.value }))}
                    placeholder="e.g. Data Structures Unit 4 Notes"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                {/* File Drop Zone */}
                <div
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={e => {
                    e.preventDefault();
                    setDragOver(false);
                    const f = e.dataTransfer.files[0];
                    if (f) setUploadForm(p => ({ ...p, fileName: f.name }));
                  }}
                  className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
                    dragOver ? 'border-indigo-500 bg-indigo-500/5' :
                    uploadForm.fileName ? 'border-emerald-500/50 bg-emerald-500/5' :
                    'border-slate-300 dark:border-slate-700 hover:border-indigo-400'
                  }`}
                >
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.pptx"
                    onChange={e => {
                      const f = e.target.files[0];
                      if (f) setUploadForm(p => ({ ...p, fileName: f.name }));
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {uploadForm.fileName ? (
                    <div className="space-y-1">
                      <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto" />
                      <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">{uploadForm.fileName}</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <Upload className="w-6 h-6 text-slate-400 mx-auto" />
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Drop file here or click to browse</p>
                      <p className="text-[10px] text-slate-400">PDF, DOC, PPTX (max 10MB)</p>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setShowUploadModal(false)} className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800">
                    Cancel
                  </button>
                  <button type="submit" className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow flex items-center gap-2">
                    <Upload className="w-3.5 h-3.5" />
                    Upload
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {categories.filter(c => c !== 'All').map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`glass-card p-3 text-center hover:border-indigo-500/30 transition-all ${selectedCategory === cat ? 'border-indigo-500/50' : ''}`}
          >
            <p className={`text-[10px] font-black uppercase mb-0.5 ${CATEGORY_COLORS[cat]?.split(' ')[1] || 'text-slate-500'}`}>{cat}</p>
            <p className="text-sm font-black text-slate-900 dark:text-white">
              {documents.filter(d => d.category === cat).length}
            </p>
          </button>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="glass-card p-4 space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search study materials, subjects, question papers..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
          />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCategory(c)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap ${
                selectedCategory === c ? 'bg-indigo-600 text-white shadow' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.length === 0 && (
          <div className="col-span-2 glass-card p-10 text-center text-slate-500 text-sm">
            No documents found. Try a different search or category.
          </div>
        )}
        {filtered.map((doc) => (
          <div key={doc.id} className="glass-card p-5 flex items-start justify-between gap-4 hover:border-indigo-500/30 transition-all group">
            <div className="flex items-start gap-3">
              <div className={`p-3 rounded-2xl shrink-0 ${CATEGORY_COLORS[doc.category] || 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                <File className="w-6 h-6" />
              </div>
              <div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${CATEGORY_COLORS[doc.category]}`}>
                  {doc.category}
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1 leading-snug">{doc.title}</h3>
                <p className="text-[11px] text-slate-500 mt-1">
                  <span className="font-bold text-slate-600 dark:text-slate-400">{doc.subject}</span> · {doc.uploader} · {doc.size}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">{doc.date}</p>
              </div>
            </div>

            <button
              onClick={() => alert(`Downloading: ${doc.title}`)}
              className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1 shadow shrink-0 group-hover:scale-105 transition-transform"
              title="Download File"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
