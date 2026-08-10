import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Shield, Users, Building, Bell, Calendar, Plus, Trash2, Edit, Search } from 'lucide-react';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('Users');
  const [stats, setStats] = useState({ total_students: 1250, total_faculty: 85, total_notices: 42, active_notices: 18 });

  const [usersList, setUsersList] = useState([
    { id: 1, name: 'Dr. Ramesh Kumar', email: 'ramesh@univ.edu', role: 'Faculty', department: 'Computer Science' },
    { id: 2, name: 'Madhusudhan Reddy', email: 'madhu@student.edu', role: 'Student', department: 'Computer Science' },
    { id: 3, name: 'Admin Portal Superuser', email: 'admin@noticeboard.com', role: 'Admin', department: 'Administration' },
  ]);

  const [deptsList, setDeptsList] = useState([
    { id: 1, name: 'Computer Science & Engineering', code: 'CSE', head: 'Dr. Ramesh Kumar' },
    { id: 2, name: 'Electronics & Communication', code: 'ECE', head: 'Dr. V. Prasad' },
    { id: 3, name: 'Mechanical Engineering', code: 'MECH', head: 'Dr. Suresh P.' },
  ]);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const res = await api.get('/analytics/dashboard');
        if (res.data) setStats(res.data);
      } catch (e) {}
    };
    fetchAdminStats();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Shield className="w-6 h-6 text-amber-500" />
          <span>System Administration Panel</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Full CRUD management for Users, Departments, System Notices, and Master Data
        </p>
      </div>

      {/* Admin Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5">
          <p className="text-xs font-bold text-slate-500 uppercase">Total Students</p>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.total_students}</h3>
        </div>
        <div className="glass-card p-5">
          <p className="text-xs font-bold text-slate-500 uppercase">Faculty Members</p>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.total_faculty}</h3>
        </div>
        <div className="glass-card p-5">
          <p className="text-xs font-bold text-slate-500 uppercase">Total Notices</p>
          <h3 className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">{stats.total_notices}</h3>
        </div>
        <div className="glass-card p-5">
          <p className="text-xs font-bold text-slate-500 uppercase">Departments</p>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{deptsList.length}</h3>
        </div>
      </div>

      {/* Tab Controls */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        {['Users', 'Departments', 'Notices', 'Settings'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab ? 'bg-amber-500 text-white shadow' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {tab} Management
          </button>
        ))}
      </div>

      {/* Users Management */}
      {activeTab === 'Users' && (
        <div className="glass-card overflow-hidden">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/80 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Registered Users Account Directory</h3>
            <button className="px-3 py-1.5 rounded-xl bg-amber-500 text-white text-xs font-bold flex items-center gap-1">
              <Plus className="w-3.5 h-3.5" /> Add User Account
            </button>
          </div>

          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase font-bold">
              <tr>
                <th className="p-3">User Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Role</th>
                <th className="p-3">Department</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
              {usersList.map((u) => (
                <tr key={u.id}>
                  <td className="p-3 font-bold">{u.name}</td>
                  <td className="p-3">{u.email}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 font-bold">{u.role}</span>
                  </td>
                  <td className="p-3">{u.department}</td>
                  <td className="p-3 text-right space-x-2">
                    <button className="p-1 text-slate-400 hover:text-indigo-600"><Edit className="w-4 h-4" /></button>
                    <button className="p-1 text-slate-400 hover:text-rose-600"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Departments Management */}
      {activeTab === 'Departments' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {deptsList.map((d) => (
            <div key={d.id} className="glass-card p-5 space-y-2">
              <span className="text-xs font-bold text-amber-600">{d.code}</span>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">{d.name}</h4>
              <p className="text-xs text-slate-500">HOD: {d.head}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
