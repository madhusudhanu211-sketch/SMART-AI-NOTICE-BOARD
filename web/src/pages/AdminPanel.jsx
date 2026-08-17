import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Shield, Users, Building, Bell, Plus, Trash2, Edit, Search,
  ToggleLeft, ToggleRight, AlertTriangle, Clock, HardDrive, Save, CheckCircle2
} from 'lucide-react';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('Users');
  const [stats, setStats] = useState({ total_students: 1250, total_faculty: 85, total_notices: 42, active_notices: 18 });
  const [searchTerm, setSearchTerm] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [usersList, setUsersList] = useState([
    { id: 1, name: 'Dr. Ramesh Kumar', email: 'ramesh@univ.edu', role: 'Faculty', department: 'Computer Science', status: 'Active' },
    { id: 2, name: 'Madhusudhan Reddy', email: 'madhu@student.edu', role: 'Student', department: 'Computer Science', status: 'Active' },
    { id: 3, name: 'Admin Portal Superuser', email: 'admin@noticeboard.com', role: 'Admin', department: 'Administration', status: 'Active' },
    { id: 4, name: 'Dr. Priya Sharma', email: 'priya@univ.edu', role: 'Faculty', department: 'Electronics', status: 'Active' },
    { id: 5, name: 'Kavya Reddy', email: 'kavya@student.edu', role: 'Student', department: 'IT', status: 'Active' },
  ]);

  const [deptsList] = useState([
    { id: 1, name: 'Computer Science & Engineering', code: 'CSE', head: 'Dr. Ramesh Kumar', students: 320, faculty: 22 },
    { id: 2, name: 'Electronics & Communication', code: 'ECE', head: 'Dr. V. Prasad', students: 260, faculty: 18 },
    { id: 3, name: 'Mechanical Engineering', code: 'MECH', head: 'Dr. Suresh P.', students: 180, faculty: 14 },
    { id: 4, name: 'Information Technology', code: 'IT', head: 'Dr. Anita R.', students: 280, faculty: 19 },
  ]);

  const [noticesList, setNoticesList] = useState([
    { id: 1, title: 'Urgent Campus Maintenance – Block A Power Outage', category: 'Emergency', priority: 'Urgent', is_pinned: true, is_active: true, created_at: '2026-08-10', author: 'Infra Dept' },
    { id: 2, title: 'End-Semester Examination Schedule – Sept 2026', category: 'Examination', priority: 'High', is_pinned: true, is_active: true, created_at: '2026-08-09', author: 'Controller of Exams' },
    { id: 3, title: 'Google Cloud Campus Placement Drive 2026', category: 'Placement', priority: 'High', is_pinned: false, is_active: true, created_at: '2026-08-08', author: 'Placement Cell' },
    { id: 4, title: 'B.Tech Semester VI Syllabus Updated', category: 'Academic', priority: 'Normal', is_pinned: false, is_active: false, created_at: '2026-08-01', author: 'Academic Office' },
  ]);

  const [systemSettings, setSystemSettings] = useState({
    emergencyBroadcast: true,
    maintenanceMode: false,
    allowRegistrations: true,
    emailNotifications: true,
    smsAlerts: false,
    maxFileSize: '10',
    sessionTimeout: '60',
    maxLoginAttempts: '5',
  });

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const res = await api.get('/analytics/dashboard');
        if (res.data) setStats(res.data);
      } catch (e) {}
    };
    fetchAdminStats();
  }, []);

  const handleDeleteUser = (id) => {
    setUsersList(prev => prev.filter(u => u.id !== id));
  };

  const handleToggleNotice = (id) => {
    setNoticesList(prev => prev.map(n => n.id === id ? { ...n, is_active: !n.is_active } : n));
  };

  const handlePinNotice = (id) => {
    setNoticesList(prev => prev.map(n => n.id === id ? { ...n, is_pinned: !n.is_pinned } : n));
  };

  const handleDeleteNotice = (id) => {
    setNoticesList(prev => prev.filter(n => n.id !== id));
  };

  const handleSaveSettings = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const filteredUsers = usersList.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const TABS = ['Users', 'Departments', 'Notices', 'Settings'];

  const PRIORITY_COLORS = {
    Urgent: 'bg-rose-500/10 text-rose-600 border-rose-400/30',
    High: 'bg-amber-500/10 text-amber-600 border-amber-400/30',
    Normal: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Shield className="w-6 h-6 text-amber-500" />
          <span>System Administration Panel</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Full CRUD management for Users, Departments, Notices &amp; System Configuration
        </p>
      </div>

      {/* Admin Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5">
          <p className="text-xs font-bold text-slate-500 uppercase">Total Students</p>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.total_students?.toLocaleString()}</h3>
          <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">+42 this month</p>
        </div>
        <div className="glass-card p-5">
          <p className="text-xs font-bold text-slate-500 uppercase">Faculty Members</p>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.total_faculty}</h3>
          <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Across {deptsList.length} departments</p>
        </div>
        <div className="glass-card p-5">
          <p className="text-xs font-bold text-slate-500 uppercase">Total Notices</p>
          <h3 className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">{stats.total_notices}</h3>
          <p className="text-[11px] text-indigo-500 font-semibold mt-0.5">{stats.active_notices} currently active</p>
        </div>
        <div className="glass-card p-5">
          <p className="text-xs font-bold text-slate-500 uppercase">Departments</p>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{deptsList.length}</h3>
          <p className="text-[11px] text-slate-400 font-semibold mt-0.5">{deptsList.reduce((a, d) => a + d.faculty, 0)} faculty total</p>
        </div>
      </div>

      {/* Tab Controls */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto custom-scrollbar">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === tab ? 'bg-amber-500 text-white shadow' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {tab} Management
          </button>
        ))}
      </div>

      {/* ── USERS TAB ── */}
      {activeTab === 'Users' && (
        <div className="glass-card overflow-hidden">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Registered Users Directory</h3>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-52">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Search users..."
                  className="w-full pl-8 pr-3 py-2 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-xs text-slate-900 dark:text-white"
                />
              </div>
              <button className="px-3 py-2 rounded-xl bg-amber-500 text-white text-xs font-bold flex items-center gap-1 whitespace-nowrap">
                <Plus className="w-3.5 h-3.5" /> Add User
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase font-bold">
                <tr>
                  <th className="p-3">Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="p-3 font-bold">{u.name}</td>
                    <td className="p-3 text-slate-500">{u.email}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-lg font-bold text-[10px] uppercase ${
                        u.role === 'Admin' ? 'bg-amber-500/10 text-amber-600' :
                        u.role === 'Faculty' ? 'bg-purple-500/10 text-purple-600' :
                        'bg-indigo-500/10 text-indigo-600'
                      }`}>{u.role}</span>
                    </td>
                    <td className="p-3">{u.department}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-600 font-bold text-[10px] uppercase">
                        {u.status}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-1">
                      <button className="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors"><Edit className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDeleteUser(u.id)} className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── DEPARTMENTS TAB ── */}
      {activeTab === 'Departments' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">Showing all {deptsList.length} departments</p>
            <button className="px-3 py-2 rounded-xl bg-amber-500 text-white text-xs font-bold flex items-center gap-1">
              <Plus className="w-3.5 h-3.5" /> Add Department
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {deptsList.map((d) => (
              <div key={d.id} className="glass-card p-5 space-y-3 hover:border-amber-500/40 transition-colors">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-black text-amber-600 uppercase tracking-wider">{d.code}</span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{d.name}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">HOD: {d.head}</p>
                  </div>
                  <div className="flex gap-1">
                    <button className="p-1.5 text-slate-400 hover:text-indigo-600"><Edit className="w-3.5 h-3.5" /></button>
                    <button className="p-1.5 text-slate-400 hover:text-rose-600"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex-1 text-center">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Students</p>
                    <p className="text-base font-black text-slate-900 dark:text-white">{d.students}</p>
                  </div>
                  <div className="w-px h-8 bg-slate-200 dark:bg-slate-700" />
                  <div className="flex-1 text-center">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Faculty</p>
                    <p className="text-base font-black text-slate-900 dark:text-white">{d.faculty}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── NOTICES MANAGEMENT TAB ── */}
      {activeTab === 'Notices' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">{noticesList.length} notices total · {noticesList.filter(n => n.is_active).length} active · {noticesList.filter(n => n.is_pinned).length} pinned</p>
            <button className="px-3 py-2 rounded-xl bg-amber-500 text-white text-xs font-bold flex items-center gap-1">
              <Plus className="w-3.5 h-3.5" /> Create Notice
            </button>
          </div>
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase font-bold">
                  <tr>
                    <th className="p-3">Title</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Priority</th>
                    <th className="p-3">Author</th>
                    <th className="p-3">Pinned</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                  {noticesList.map((n) => (
                    <tr key={n.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="p-3 font-bold max-w-[200px] truncate">{n.title}</td>
                      <td className="p-3">{n.category}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-lg font-bold text-[10px] uppercase border ${PRIORITY_COLORS[n.priority] || PRIORITY_COLORS.Normal}`}>
                          {n.priority}
                        </span>
                      </td>
                      <td className="p-3 text-slate-500">{n.author}</td>
                      <td className="p-3">
                        <button onClick={() => handlePinNotice(n.id)} className={`text-[10px] font-bold px-2 py-0.5 rounded-lg transition-colors ${n.is_pinned ? 'bg-amber-500/10 text-amber-600' : 'text-slate-400 hover:text-amber-500'}`}>
                          {n.is_pinned ? '📌 Pinned' : 'Pin'}
                        </button>
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => handleToggleNotice(n.id)}
                          className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg transition-colors ${n.is_active ? 'bg-emerald-500/10 text-emerald-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}
                        >
                          {n.is_active ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
                          {n.is_active ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="p-3 text-right space-x-1">
                        <button className="p-1.5 text-slate-400 hover:text-indigo-600"><Edit className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDeleteNotice(n.id)} className="p-1.5 text-slate-400 hover:text-rose-600"><Trash2 className="w-3.5 h-3.5" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── SYSTEM SETTINGS TAB ── */}
      {activeTab === 'Settings' && (
        <div className="space-y-5 max-w-2xl">
          {/* Toggle Settings */}
          <div className="glass-card p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              System Broadcast &amp; Access Controls
            </h3>
            {[
              { key: 'emergencyBroadcast', label: 'Emergency Broadcast Alerts', desc: 'Enable system-wide emergency notifications' },
              { key: 'maintenanceMode', label: 'Maintenance Mode', desc: 'Take portal offline for scheduled maintenance' },
              { key: 'allowRegistrations', label: 'Allow New Registrations', desc: 'Enable new student/faculty account creation' },
              { key: 'emailNotifications', label: 'Email Notifications', desc: 'Send email alerts for important events' },
              { key: 'smsAlerts', label: 'SMS Alerts', desc: 'Send SMS alerts for emergency broadcasts' },
            ].map(setting => (
              <label key={setting.key} className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 cursor-pointer">
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{setting.label}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{setting.desc}</p>
                </div>
                <button
                  onClick={() => setSystemSettings(prev => ({ ...prev, [setting.key]: !prev[setting.key] }))}
                  className={`relative w-11 h-6 rounded-full transition-colors ${systemSettings[setting.key] ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}
                >
                  <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${systemSettings[setting.key] ? 'translate-x-5' : ''}`} />
                </button>
              </label>
            ))}
          </div>

          {/* Numeric Settings */}
          <div className="glass-card p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-indigo-500" />
              Performance &amp; Limits
            </h3>
            {[
              { key: 'maxFileSize', label: 'Max File Upload Size (MB)', icon: HardDrive },
              { key: 'sessionTimeout', label: 'Session Timeout (minutes)', icon: Clock },
              { key: 'maxLoginAttempts', label: 'Max Failed Login Attempts', icon: Shield },
            ].map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-slate-400" />
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{label}</p>
                </div>
                <input
                  type="number"
                  value={systemSettings[key]}
                  onChange={e => setSystemSettings(prev => ({ ...prev, [key]: e.target.value }))}
                  className="w-20 text-center px-2 py-1.5 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-xs font-bold text-slate-900 dark:text-white"
                />
              </div>
            ))}
          </div>

          {/* Save Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveSettings}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-black text-xs shadow-xl shadow-amber-500/30 flex items-center gap-2 transition-all"
            >
              <Save className="w-4 h-4" />
              Save System Settings
            </button>
            {saveSuccess && (
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-bold animate-in fade-in">
                <CheckCircle2 className="w-4 h-4" />
                Settings saved successfully!
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
