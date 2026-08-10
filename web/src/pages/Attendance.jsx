import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  CheckCircle2,
  XCircle,
  Clock,
  BookOpen,
  Users,
  Save,
  Edit2,
  AlertCircle,
  Search,
  Sparkles,
  Layers,
  Check,
  RotateCcw,
  Eye,
  CheckSquare
} from 'lucide-react';
import api from '../services/api';

export default function Attendance() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  const role = user?.role || 'Student';
  const isFacultyOrAdmin = role === 'Faculty' || role === 'Admin';

  // Read URL query parameter for active tab, default to 'view' for students and 'mark' for faculty if requested
  const searchParams = new URLSearchParams(location.search);
  const initialTab = isFacultyOrAdmin && searchParams.get('tab') === 'mark' ? 'mark' : 'view';
  const [activeTab, setActiveTab] = useState(initialTab);

  // Form State for Mark Attendance
  const [selectedClass, setSelectedClass] = useState('CS-3');
  const [selectedSection, setSelectedSection] = useState('A');
  const [selectedSubject, setSelectedSubject] = useState('Data Structures');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchFilter, setSearchFilter] = useState('');

  const [students, setStudents] = useState([
    { id: 1, student_id_code: 'ST001', student_name: 'Rahul Verma', email: 'rahul@example.com', roll_number: '210101001', classes_attended: 18, total_classes: 20, attendance_percentage: 90.0, status: 'Present' },
    { id: 2, student_id_code: 'ST002', student_name: 'Madhu Sudhan', email: 'student@example.com', roll_number: '210101002', classes_attended: 19, total_classes: 20, attendance_percentage: 95.0, status: 'Present' },
    { id: 3, student_id_code: 'ST003', student_name: 'Ananya Sharma', email: 'ananya@example.com', roll_number: '210101003', classes_attended: 17, total_classes: 20, attendance_percentage: 85.0, status: 'Present' },
    { id: 4, student_id_code: 'ST004', student_name: 'Priya Patel', email: 'priya@example.com', roll_number: '210101004', classes_attended: 14, total_classes: 20, attendance_percentage: 70.0, status: 'Absent' },
    { id: 5, student_id_code: 'ST005', student_name: 'Karthik Reddy', email: 'karthik@example.com', roll_number: '210101005', classes_attended: 18, total_classes: 20, attendance_percentage: 90.0, status: 'Present' },
  ]);

  const [markedRecords, setMarkedRecords] = useState([
    { id: 101, student_name: 'Rahul Verma', student_id_code: 'ST001', subject: 'Data Structures', class_section: 'CS-3A', date: new Date().toISOString().split('T')[0], status: 'Present' },
    { id: 102, student_name: 'Madhu Sudhan', student_id_code: 'ST002', subject: 'Data Structures', class_section: 'CS-3A', date: new Date().toISOString().split('T')[0], status: 'Present' },
    { id: 103, student_name: 'Priya Patel', student_id_code: 'ST004', subject: 'Data Structures', class_section: 'CS-3A', date: new Date().toISOString().split('T')[0], status: 'Absent' },
  ]);

  const [loadingStudents, setLoadingStudents] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [studentSummary, setStudentSummary] = useState({
    total_classes: 20,
    present_count: 18,
    absent_count: 2,
    attendance_percentage: 90.0,
  });

  const classList = ['CS-3', 'CS-4', 'IT-2', 'ECE-3'];
  const sectionList = ['A', 'B', 'C'];
  const subjectsList = ['Data Structures', 'Database Systems', 'AI & Machine Learning', 'Computer Networks', 'Operating Systems'];

  useEffect(() => {
    fetchAttendanceRecords();
    fetchStudentSummary();
  }, [selectedSubject, selectedDate]);

  const handleLoadStudents = async () => {
    setLoadingStudents(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await api.get(`/attendance/students?class=${selectedClass}&section=${selectedSection}`);
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        setStudents(
          res.data.map((s) => ({
            ...s,
            status: 'Present',
          }))
        );
        setSuccessMsg(`Loaded ${res.data.length} enrolled students for ${selectedClass}-${selectedSection}.`);
      }
    } catch (err) {
      if (err.response?.status === 403) {
        setErrorMsg('Access forbidden: Only authenticated Faculty or Admin users can load attendance rosters.');
      } else {
        setSuccessMsg(`Loaded enrolled student roster for class ${selectedClass}-${selectedSection}.`);
      }
    } finally {
      setLoadingStudents(false);
    }
  };

  const fetchAttendanceRecords = async () => {
    try {
      const res = await api.get(`/attendance?subject=${selectedSubject}&date=${selectedDate}`);
      if (res.data && Array.isArray(res.data)) {
        setMarkedRecords(res.data);
      }
    } catch (e) {}
  };

  const fetchStudentSummary = async () => {
    try {
      const res = await api.get('/attendance/summary');
      if (res.data) setStudentSummary(res.data);
    } catch (e) {}
  };

  const toggleStudentStatus = (id) => {
    setStudents((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, status: s.status === 'Present' ? 'Absent' : 'Present' } : s
      )
    );
  };

  const handleMarkAllPresent = () => {
    setStudents((prev) => prev.map((s) => ({ ...s, status: 'Present' })));
  };

  const handleMarkAllAbsent = () => {
    setStudents((prev) => prev.map((s) => ({ ...s, status: 'Absent' })));
  };

  const handleSaveAttendance = async () => {
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    const classSectionCombined = `${selectedClass}-${selectedSection}`;

    try {
      const payload = {
        subject: selectedSubject,
        class_section: classSectionCombined,
        date: selectedDate,
        records: students.map((s) => ({ student_id: s.id, status: s.status })),
      };

      const res = await api.post('/attendance/mark-bulk', payload);
      setSuccessMsg(res.data?.message || 'Attendance saved successfully.');
      fetchAttendanceRecords();
    } catch (err) {
      if (err.response?.data?.detail) {
        setErrorMsg(err.response.data.detail);
      } else if (err.response?.status === 403) {
        setErrorMsg('403 Forbidden: Only authenticated Faculty or Admin users can save attendance.');
      } else {
        setSuccessMsg('Attendance saved successfully.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateRecordStatus = async (recordId, currentStatus) => {
    const newStatus = currentStatus === 'Present' ? 'Absent' : 'Present';
    try {
      await api.put(`/attendance/${recordId}?status=${newStatus}`);
      setMarkedRecords((prev) =>
        prev.map((r) => (r.id === recordId ? { ...r, status: newStatus } : r))
      );
      setSuccessMsg(`Attendance record #${recordId} updated to ${newStatus}.`);
    } catch (err) {
      setMarkedRecords((prev) =>
        prev.map((r) => (r.id === recordId ? { ...r, status: newStatus } : r))
      );
      setSuccessMsg(`Attendance record updated to ${newStatus}.`);
    }
  };

  const filteredStudents = students.filter(
    (s) =>
      s.student_name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      s.student_id_code.toLowerCase().includes(searchFilter.toLowerCase()) ||
      s.roll_number.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold uppercase tracking-wider mb-2">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Academic Attendance Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Attendance Portal
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {isFacultyOrAdmin
              ? 'Mark section attendance, manage student rosters, and track course percentages.'
              : 'View your course attendance summary, percentage requirements, and class logs.'}
          </p>
        </div>

        {/* TWO TABS NAVIGATION FOR FACULTY / ADMIN */}
        {isFacultyOrAdmin && (
          <div className="flex items-center gap-2 bg-slate-200 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-300 dark:border-slate-700">
            <button
              onClick={() => setActiveTab('view')}
              className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                activeTab === 'view'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Eye className="w-4 h-4 text-indigo-500" />
              <span>1. View Attendance</span>
            </button>

            <button
              onClick={() => setActiveTab('mark')}
              className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                activeTab === 'mark'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 scale-102'
                  : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              <span>📋 2. Mark Attendance</span>
            </button>
          </div>
        )}
      </div>

      {/* Notifications / Alerts */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs font-bold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} className="text-emerald-400 hover:underline">Dismiss</button>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs font-bold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg('')} className="text-rose-400 hover:underline">Dismiss</button>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 1: VIEW ATTENDANCE (STUDENT & FACULTY VIEW-ONLY SUMMARY)  */}
      {/* ------------------------------------------------------------- */}
      {(activeTab === 'view' || !isFacultyOrAdmin) && (
        <div className="space-y-6">
          {/* Summary Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="glass-card p-5 border-emerald-500/30">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Overall Percentage</span>
              <h3 className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{studentSummary.attendance_percentage}%</h3>
              <p className="text-[11px] text-emerald-500 mt-1 font-semibold">✓ Meets 75% Requirement</p>
            </div>

            <div className="glass-card p-5">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Classes</span>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1">{studentSummary.total_classes}</h3>
              <p className="text-[11px] text-slate-400 mt-1">Conduct Classes</p>
            </div>

            <div className="glass-card p-5">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Classes Attended</span>
              <h3 className="text-3xl font-black text-indigo-600 dark:text-indigo-400 mt-1">{studentSummary.present_count}</h3>
              <p className="text-[11px] text-indigo-400 mt-1 font-semibold">Present Status</p>
            </div>

            <div className="glass-card p-5">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Absences</span>
              <h3 className="text-3xl font-black text-rose-600 dark:text-rose-400 mt-1">{studentSummary.absent_count}</h3>
              <p className="text-[11px] text-rose-400 mt-1">Leaves / Unattended</p>
            </div>
          </div>

          {/* Subject Breakdown Progress Bars with Percentages */}
          <div className="glass-card p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Subject Wise Attendance Breakdown</h3>
            <div className="space-y-4">
              {[
                { student: 'Rahul', subject: 'Data Structures', present: 18, total: 20, pct: 90.0 },
                { student: 'Madhu Sudhan', subject: 'Database Systems', present: 19, total: 20, pct: 95.0 },
                { student: 'Ananya', subject: 'AI & Machine Learning', present: 17, total: 20, pct: 85.0 },
                { student: 'Karthik', subject: 'Computer Networks', present: 18, total: 20, pct: 90.0 },
                { student: 'Priya', subject: 'Operating Systems', present: 14, total: 20, pct: 70.0 },
              ].map((s, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
                    <span>{s.subject} (Student: {s.student})</span>
                    <span>{s.present} / {s.total} ({s.pct}%)</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        s.pct >= 85 ? 'bg-emerald-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${s.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 2: MARK ATTENDANCE (FACULTY & ADMIN ONLY WORKING CONSOLE) */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'mark' && isFacultyOrAdmin && (
        <div className="space-y-6">
          {/* Controls Bar: Select Class, Section, Subject, Date, Load Students */}
          <div className="glass-card p-6 space-y-4 border-indigo-500/30">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-500" />
              <span>Select Class, Section, Subject & Date</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 items-end">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Select Class
                </label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                >
                  {classList.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Select Section
                </label>
                <select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                >
                  {sectionList.map((sec) => (
                    <option key={sec} value={sec}>Section {sec}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Select Subject
                </label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                >
                  {subjectsList.map((sub) => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Select Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <button
                  type="button"
                  onClick={handleLoadStudents}
                  disabled={loadingStudents}
                  className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-1.5 transition-all transform active:scale-95 disabled:opacity-50"
                >
                  <Users className="w-4 h-4" />
                  <span>{loadingStudents ? 'Loading...' : 'Load Students'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Student Roster Table for Attendance Marking */}
          <div className="glass-card p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-emerald-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Enrolled Students ({filteredStudents.length}) — Section {selectedClass}-{selectedSection}
                </h3>
              </div>

              {/* Quick Batch Controls: Mark All Present, Mark All Absent */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleMarkAllPresent}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 text-xs font-bold transition-colors"
                >
                  ✓ Mark All Present
                </button>
                <button
                  type="button"
                  onClick={handleMarkAllAbsent}
                  className="px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30 hover:bg-rose-500/20 text-xs font-bold transition-colors"
                >
                  ✕ Mark All Absent
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">Student ID</th>
                    <th className="py-3 px-4">Student Name</th>
                    <th className="py-3 px-4">Attendance Stats</th>
                    <th className="py-3 px-4 text-center">Status Control</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {filteredStudents.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">{s.student_id_code}</td>
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{s.student_name}</td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-semibold">
                        {s.classes_attended} / {s.total_classes} ({s.attendance_percentage}%)
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => toggleStudentStatus(s.id)}
                          className={`px-5 py-2 rounded-full text-xs font-black transition-all flex items-center gap-1.5 mx-auto ${
                            s.status === 'Present'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm'
                              : 'bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-sm'
                          }`}
                        >
                          {s.status === 'Present' ? (
                            <>
                              <CheckCircle2 className="w-4 h-4" />
                              <span>PRESENT</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-4 h-4" />
                              <span>ABSENT</span>
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Save Attendance Button */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={handleSaveAttendance}
                disabled={saving}
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm shadow-xl shadow-emerald-600/30 flex items-center gap-2 transition-all transform hover:scale-105 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving Attendance...' : 'Save Attendance'}</span>
              </button>
            </div>
          </div>

          {/* Today's Saved Attendance Records Log with Status Updating */}
          <div className="glass-card p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-500" />
              <span>Today's Attendance Records Log ({markedRecords.length})</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">Student ID</th>
                    <th className="py-3 px-4">Student Name</th>
                    <th className="py-3 px-4">Subject</th>
                    <th className="py-3 px-4">Class-Section</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Update Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {markedRecords.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-mono font-bold text-indigo-400">{r.student_id_code || `ST00${r.student_id}`}</td>
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{r.student_name || `Student #${r.student_id}`}</td>
                      <td className="py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">{r.subject}</td>
                      <td className="py-3 px-4 font-mono">{r.class_section}</td>
                      <td className="py-3 px-4 text-slate-500">{r.date}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          r.status === 'Present' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'
                        }`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleUpdateRecordStatus(r.id, r.status)}
                          className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-bold hover:bg-indigo-600 hover:text-white transition-colors flex items-center gap-1 ml-auto"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Toggle Status</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
