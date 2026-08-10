import React, { useState } from 'react';
import { FileText, Download, Search, Upload, Eye, File, Plus } from 'lucide-react';

export default function Documents() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Notes', 'Question Papers', 'Syllabus', 'Lab Manuals', 'Circulars'];

  const documents = [
    { id: 1, title: 'Data Structures & Algorithms Complete Course Notes', category: 'Notes', subject: 'CSE301', size: '4.2 MB', uploader: 'Prof. Anitha Sharma', date: '2026-08-01', url: '#' },
    { id: 2, title: 'DBMS Semester V Previous Question Papers (2021-2025)', category: 'Question Papers', subject: 'CSE302', size: '8.1 MB', uploader: 'Academic Cell', date: '2026-07-28', url: '#' },
    { id: 3, title: 'Computer Networks Lab Execution Manual & Experiments', category: 'Lab Manuals', subject: 'CSE303', size: '2.8 MB', uploader: 'Dr. Ramesh Kumar', date: '2026-08-03', url: '#' },
    { id: 4, title: 'B.Tech CSE Semester VI Official Syllabus Document', category: 'Syllabus', subject: 'CSE All', size: '1.5 MB', uploader: 'HOD CSE', date: '2026-07-15', url: '#' },
  ];

  const filtered = documents.filter((doc) => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) || doc.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <FileText className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          <span>Study Materials & Documents Repository</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Download lecture notes, question banks, lab manuals, and syllabus PDFs
        </p>
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
        {filtered.map((doc) => (
          <div key={doc.id} className="glass-card p-5 flex items-start justify-between gap-4 hover:border-indigo-500/30 transition-all">
            <div className="flex items-start gap-3">
              <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0">
                <File className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 uppercase">
                  {doc.category}
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1 leading-snug">{doc.title}</h3>
                <p className="text-[11px] text-slate-500 mt-1">Uploaded by: {doc.uploader} • {doc.size}</p>
              </div>
            </div>

            <a
              href={doc.url}
              onClick={(e) => { e.preventDefault(); alert(`Downloading: ${doc.title}`); }}
              className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1 shadow shrink-0"
              title="Download File"
            >
              <Download className="w-4 h-4" />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
