import React, { useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  BarChart2, Users, Bell, TrendingUp, Award, Briefcase,
  Calendar, Download, RefreshCw
} from 'lucide-react';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const attendanceData = [
  { week: 'Week 1', attendance: 91 },
  { week: 'Week 2', attendance: 88 },
  { week: 'Week 3', attendance: 85 },
  { week: 'Week 4', attendance: 90 },
  { week: 'Week 5', attendance: 87 },
  { week: 'Week 6', attendance: 93 },
  { week: 'Week 7', attendance: 89 },
  { week: 'Week 8', attendance: 92 },
];

const noticeCategories = [
  { name: 'Examination', value: 14 },
  { name: 'Academic', value: 22 },
  { name: 'Emergency', value: 4 },
  { name: 'Placement', value: 8 },
  { name: 'Events', value: 11 },
  { name: 'General', value: 18 },
];

const placementData = [
  { dept: 'CSE', placed: 145 },
  { dept: 'ECE', placed: 98 },
  { dept: 'MECH', placed: 72 },
  { dept: 'CIVIL', placed: 55 },
  { dept: 'IT', placed: 120 },
  { dept: 'EEE', placed: 63 },
];

const monthlyNotices = [
  { month: 'Mar', count: 18 },
  { month: 'Apr', count: 24 },
  { month: 'May', count: 31 },
  { month: 'Jun', count: 14 },
  { month: 'Jul', count: 28 },
  { month: 'Aug', count: 21 },
];

const kpis = [
  { label: 'Total Students', value: '1,250', icon: Users, color: 'indigo', delta: '+42 this month' },
  { label: 'Avg Attendance', value: '89.3%', icon: TrendingUp, color: 'emerald', delta: '+1.2% vs last month' },
  { label: 'Active Notices', value: '42', icon: Bell, color: 'amber', delta: '18 posted this week' },
  { label: 'Placed Students', value: '553', icon: Briefcase, color: 'purple', delta: '44.2% placement rate' },
];

const colorMap = {
  indigo: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
  emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card px-4 py-3 text-xs shadow-xl">
        <p className="font-bold text-slate-900 dark:text-white mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }} className="font-semibold">
            {p.name}: {p.value}{p.name === 'attendance' ? '%' : ''}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Analytics() {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <BarChart2 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <span>Analytics &amp; Reports</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Campus-wide performance metrics, attendance trends &amp; placement statistics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 transition-colors">
            <Download className="w-4 h-4" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="glass-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {kpi.label}
              </p>
              <div className={`p-2 rounded-xl ${colorMap[kpi.color]}`}>
                <kpi.icon className="w-4 h-4" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">{kpi.value}</h3>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                {kpi.delta}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Trend */}
        <div className="lg:col-span-2 glass-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-500" />
              Attendance Trend (8 Weeks)
            </h2>
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              Avg: 89.3%
            </span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={attendanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis domain={[75, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} unit="%" />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="attendance"
                name="attendance"
                stroke="#6366f1"
                strokeWidth={2.5}
                dot={{ fill: '#6366f1', r: 4, strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Notice Category Donut */}
        <div className="glass-card p-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-500" />
            Notice Categories
          </h2>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie
                data={noticeCategories}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={70}
                paddingAngle={3}
                dataKey="value"
              >
                {noticeCategories.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name) => [value, name]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5">
            {noticeCategories.map((cat, i) => (
              <div key={cat.name} className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                  <span className="text-slate-600 dark:text-slate-400">{cat.name}</span>
                </div>
                <span className="font-bold text-slate-900 dark:text-white">{cat.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Placement by Department */}
        <div className="glass-card p-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-emerald-500" />
            Placements by Department
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={placementData} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" vertical={false} />
              <XAxis dataKey="dept" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="placed" name="placed" radius={[6, 6, 0, 0]}>
                {placementData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Notice Volume */}
        <div className="glass-card p-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-purple-500" />
            Monthly Notice Volume
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyNotices} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Notices" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Stats Summary Table */}
      <div className="glass-card overflow-hidden">
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-500" />
            Department Performance Summary
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase tracking-wider font-bold">
              <tr>
                <th className="p-3.5">Department</th>
                <th className="p-3.5">Students</th>
                <th className="p-3.5">Avg Attendance</th>
                <th className="p-3.5">Placed</th>
                <th className="p-3.5">Placement %</th>
                <th className="p-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200 font-medium">
              {[
                { dept: 'Computer Science & Engg', students: 320, attendance: 91.2, placed: 145, pct: 45.3 },
                { dept: 'Information Technology', students: 280, attendance: 88.7, placed: 120, pct: 42.9 },
                { dept: 'Electronics & Communication', students: 260, attendance: 86.4, placed: 98, pct: 37.7 },
                { dept: 'Electrical & Electronics', students: 210, attendance: 84.1, placed: 63, pct: 30.0 },
                { dept: 'Mechanical Engineering', students: 180, attendance: 82.9, placed: 72, pct: 40.0 },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="p-3.5 font-bold">{row.dept}</td>
                  <td className="p-3.5">{row.students}</td>
                  <td className="p-3.5">
                    <span className={`font-bold ${row.attendance >= 90 ? 'text-emerald-600' : row.attendance >= 85 ? 'text-amber-600' : 'text-rose-600'}`}>
                      {row.attendance}%
                    </span>
                  </td>
                  <td className="p-3.5 font-bold text-indigo-600 dark:text-indigo-400">{row.placed}</td>
                  <td className="p-3.5 font-bold">{row.pct}%</td>
                  <td className="p-3.5">
                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase ${row.pct >= 40 ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'}`}>
                      {row.pct >= 40 ? 'Excellent' : 'Good'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
