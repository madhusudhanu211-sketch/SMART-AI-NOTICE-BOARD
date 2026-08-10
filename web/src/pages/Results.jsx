import React, { useState } from 'react';
import { GraduationCap, Award, TrendingUp, BookOpen, CheckCircle2 } from 'lucide-react';

export default function Results() {
  const [cgpa, setCgpa] = useState(8.92);
  const [selectedSemester, setSelectedSemester] = useState('Semester VI');

  const semesters = ['Semester I', 'Semester II', 'Semester III', 'Semester IV', 'Semester V', 'Semester VI'];

  const resultsData = [
    { subject: 'Data Structures & Algorithms', code: 'CS301', internal: 28, external: 65, total: 93, grade: 'O', credits: 4 },
    { subject: 'Database Management Systems', code: 'CS302', internal: 26, external: 62, total: 88, grade: 'A+', credits: 4 },
    { subject: 'Computer Networks', code: 'CS303', internal: 27, external: 60, total: 87, grade: 'A+', credits: 3 },
    { subject: 'Operating Systems', code: 'CS304', internal: 29, external: 64, total: 93, grade: 'O', credits: 4 },
    { subject: 'Software Engineering', code: 'CS305', internal: 25, external: 58, total: 83, grade: 'A', credits: 3 },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <GraduationCap className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          <span>Academic Performance & Semester Results</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Official grades, SGPA, CGPA performance records
        </p>
      </div>

      {/* CGPA Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase">Cumulative GPA (CGPA)</p>
            <h2 className="text-3xl font-black text-indigo-600 dark:text-indigo-400 mt-1">{cgpa} / 10.0</h2>
            <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 mt-1">
              <TrendingUp className="w-3.5 h-3.5" /> First Class Distinction
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-600">
            <Award className="w-8 h-8" />
          </div>
        </div>

        <div className="glass-card p-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase">Semester SGPA</p>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mt-1">9.12</h2>
            <span className="text-[11px] font-bold text-slate-500 mt-1">Rank #3 in CSE Dept</span>
          </div>
          <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-600">
            <GraduationCap className="w-8 h-8" />
          </div>
        </div>

        <div className="glass-card p-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase">Total Credits Earned</p>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mt-1">138 / 160</h2>
            <span className="text-[11px] font-bold text-emerald-600 mt-1">On Track for Graduation</span>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600">
            <CheckCircle2 className="w-8 h-8" />
          </div>
        </div>
      </div>

      {/* Semester Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
        {semesters.map((sem) => (
          <button
            key={sem}
            onClick={() => setSelectedSemester(sem)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              selectedSemester === sem ? 'bg-indigo-600 text-white shadow' : 'glass-card text-slate-700 dark:text-slate-300'
            }`}
          >
            {sem}
          </button>
        ))}
      </div>

      {/* Results Table */}
      <div className="glass-card overflow-hidden">
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">{selectedSemester} Grade Sheet</h3>
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">SGPA: 9.12</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase tracking-wider font-bold">
              <tr>
                <th className="p-3.5">Code</th>
                <th className="p-3.5">Subject</th>
                <th className="p-3.5">Internal</th>
                <th className="p-3.5">External</th>
                <th className="p-3.5">Total Marks</th>
                <th className="p-3.5">Grade</th>
                <th className="p-3.5">Credits</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200 font-medium">
              {resultsData.map((res, i) => (
                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="p-3.5 font-bold text-indigo-600 dark:text-indigo-400">{res.code}</td>
                  <td className="p-3.5 font-bold">{res.subject}</td>
                  <td className="p-3.5">{res.internal}/30</td>
                  <td className="p-3.5">{res.external}/70</td>
                  <td className="p-3.5 font-bold">{res.total}/100</td>
                  <td className="p-3.5 font-black text-emerald-600 dark:text-emerald-400">{res.grade}</td>
                  <td className="p-3.5">{res.credits}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
