import React, { useState } from 'react';
import { Trophy, GraduationCap, CheckCircle2, Award, Medal, Star, TrendingUp, Users } from 'lucide-react';

const CGPA_LEADERS = [
  { rank: 1, name: 'Priya Krishnamurthy', dept: 'CSE', cgpa: 9.96, badges: ['Gold', 'Topper'], avgAttendance: 97 },
  { rank: 2, name: 'Arjun Venkatesh', dept: 'IT', cgpa: 9.88, badges: ['Silver'], avgAttendance: 95 },
  { rank: 3, name: 'Sowmya Reddipalli', dept: 'CSE', cgpa: 9.84, badges: ['Bronze'], avgAttendance: 98 },
  { rank: 4, name: 'Rahul Gupta', dept: 'ECE', cgpa: 9.76, badges: [], avgAttendance: 91 },
  { rank: 5, name: 'Meena Lakshmanan', dept: 'CSE', cgpa: 9.72, badges: [], avgAttendance: 94 },
  { rank: 6, name: 'Karthik Selvam', dept: 'MECH', cgpa: 9.68, badges: [], avgAttendance: 89 },
  { rank: 7, name: 'Ananya Iyer', dept: 'IT', cgpa: 9.64, badges: [], avgAttendance: 93 },
  { rank: 8, name: 'Dev Prakash', dept: 'CSE', cgpa: 9.60, badges: [], avgAttendance: 88 },
  { rank: 9, name: 'Tanvi Joshi', dept: 'ECE', cgpa: 9.56, badges: [], avgAttendance: 90 },
  { rank: 10, name: 'Madhusudhan Reddy', dept: 'CSE', cgpa: 9.52, badges: [], avgAttendance: 92 },
];

const ATTENDANCE_LEADERS = [
  { rank: 1, name: 'Sowmya Reddipalli', dept: 'CSE', attendance: 99.1, classes: 248, present: 246 },
  { rank: 2, name: 'Priya Krishnamurthy', dept: 'CSE', attendance: 97.2, classes: 248, present: 241 },
  { rank: 3, name: 'Arjun Venkatesh', dept: 'IT', attendance: 95.6, classes: 248, present: 237 },
  { rank: 4, name: 'Tanvi Joshi', dept: 'ECE', attendance: 94.8, classes: 248, present: 235 },
  { rank: 5, name: 'Meena Lakshmanan', dept: 'CSE', attendance: 94.3, classes: 248, present: 234 },
  { rank: 6, name: 'Ananya Iyer', dept: 'IT', attendance: 93.1, classes: 248, present: 231 },
  { rank: 7, name: 'Rahul Gupta', dept: 'ECE', attendance: 91.5, classes: 248, present: 227 },
  { rank: 8, name: 'Madhusudhan Reddy', dept: 'CSE', attendance: 92.3, classes: 248, present: 229 },
  { rank: 9, name: 'Dev Prakash', dept: 'CSE', attendance: 88.7, classes: 248, present: 220 },
  { rank: 10, name: 'Karthik Selvam', dept: 'MECH', attendance: 89.5, classes: 248, present: 222 },
];

const DEPT_COLORS = {
  CSE: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
  IT: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  ECE: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  MECH: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
};

const BADGE_CONFIG = {
  Gold: { icon: Trophy, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  Silver: { icon: Medal, color: 'text-slate-400', bg: 'bg-slate-200/60 dark:bg-slate-700' },
  Bronze: { icon: Medal, color: 'text-orange-600', bg: 'bg-orange-500/10' },
  Topper: { icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
};

const RankBadge = ({ rank }) => {
  if (rank === 1) return (
    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/40">
      <Trophy className="w-4 h-4 text-white" />
    </div>
  );
  if (rank === 2) return (
    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-300 to-slate-500 flex items-center justify-center shadow-lg">
      <Medal className="w-4 h-4 text-white" />
    </div>
  );
  if (rank === 3) return (
    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
      <Award className="w-4 h-4 text-white" />
    </div>
  );
  return (
    <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
      <span className="text-xs font-black text-slate-600 dark:text-slate-300">#{rank}</span>
    </div>
  );
};

export default function Leaderboard() {
  const [activeTab, setActiveTab] = useState('Academic');

  const data = activeTab === 'Academic' ? CGPA_LEADERS : ATTENDANCE_LEADERS;

  // Top 3 podium
  const podium = data.slice(0, 3);
  const rest = data.slice(3);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Trophy className="w-6 h-6 text-amber-500" />
          <span>Campus Leaderboard</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Top performing students ranked by academic excellence &amp; attendance
        </p>
      </div>

      {/* Tab Toggle */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl w-fit">
        {['Academic', 'Attendance'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
              activeTab === tab
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-md'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            {tab === 'Academic' ? <GraduationCap className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
            {tab} Rank
          </button>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass-card p-4 text-center">
          <div className="mx-auto w-8 h-8 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mb-2">
            <Trophy className="w-4 h-4" />
          </div>
          <p className="text-[10px] font-bold text-slate-500 uppercase">Top CGPA</p>
          <h3 className="text-xl font-black text-amber-600 dark:text-amber-400">{CGPA_LEADERS[0].cgpa}</h3>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="mx-auto w-8 h-8 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-2">
            <Users className="w-4 h-4" />
          </div>
          <p className="text-[10px] font-bold text-slate-500 uppercase">Ranked Students</p>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">1,250</h3>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="mx-auto w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-2">
            <TrendingUp className="w-4 h-4" />
          </div>
          <p className="text-[10px] font-bold text-slate-500 uppercase">Top Attendance</p>
          <h3 className="text-xl font-black text-emerald-600 dark:text-emerald-400">{ATTENDANCE_LEADERS[0].attendance}%</h3>
        </div>
      </div>

      {/* Podium – Top 3 */}
      <div className="glass-card p-6 space-y-4">
        <h2 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Star className="w-4 h-4 text-amber-500" />
          🏆 Top Performers
        </h2>
        <div className="flex items-end justify-center gap-4 pt-4">
          {/* 2nd place */}
          <div className="flex flex-col items-center gap-2 flex-1">
            <div className="relative">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-lg shadow-lg">
                {podium[1]?.name.charAt(0)}
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-br from-slate-300 to-slate-500 flex items-center justify-center shadow">
                <span className="text-[9px] font-black text-white">2</span>
              </div>
            </div>
            <div className="text-center">
              <p className="text-xs font-bold text-slate-900 dark:text-white">{podium[1]?.name.split(' ')[0]}</p>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${DEPT_COLORS[podium[1]?.dept]}`}>{podium[1]?.dept}</span>
            </div>
            <div className="w-full h-20 bg-gradient-to-t from-slate-300/40 to-slate-200/20 dark:from-slate-600/40 dark:to-slate-700/20 rounded-t-2xl flex items-end justify-center pb-2">
              <span className="text-sm font-black text-slate-700 dark:text-slate-300">
                {activeTab === 'Academic' ? podium[1]?.cgpa : `${podium[1]?.attendance}%`}
              </span>
            </div>
          </div>

          {/* 1st place */}
          <div className="flex flex-col items-center gap-2 flex-1 -mt-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-black text-xl shadow-xl shadow-amber-500/40">
                {podium[0]?.name.charAt(0)}
              </div>
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-lg">👑</div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow">
                <span className="text-[9px] font-black text-white">1</span>
              </div>
            </div>
            <div className="text-center">
              <p className="text-xs font-bold text-slate-900 dark:text-white">{podium[0]?.name.split(' ')[0]}</p>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${DEPT_COLORS[podium[0]?.dept]}`}>{podium[0]?.dept}</span>
            </div>
            <div className="w-full h-28 bg-gradient-to-t from-amber-500/30 to-amber-300/10 rounded-t-2xl flex items-end justify-center pb-2">
              <span className="text-sm font-black text-amber-600 dark:text-amber-400">
                {activeTab === 'Academic' ? podium[0]?.cgpa : `${podium[0]?.attendance}%`}
              </span>
            </div>
          </div>

          {/* 3rd place */}
          <div className="flex flex-col items-center gap-2 flex-1">
            <div className="relative">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-orange-400/30">
                {podium[2]?.name.charAt(0)}
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow">
                <span className="text-[9px] font-black text-white">3</span>
              </div>
            </div>
            <div className="text-center">
              <p className="text-xs font-bold text-slate-900 dark:text-white">{podium[2]?.name.split(' ')[0]}</p>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${DEPT_COLORS[podium[2]?.dept]}`}>{podium[2]?.dept}</span>
            </div>
            <div className="w-full h-14 bg-gradient-to-t from-orange-300/30 to-orange-200/10 dark:from-orange-700/30 dark:to-orange-600/10 rounded-t-2xl flex items-end justify-center pb-2">
              <span className="text-sm font-black text-orange-600 dark:text-orange-400">
                {activeTab === 'Academic' ? podium[2]?.cgpa : `${podium[2]?.attendance}%`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Full Rankings Table */}
      <div className="glass-card overflow-hidden">
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            {activeTab === 'Academic' ? <GraduationCap className="w-4 h-4 text-indigo-500" /> : <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
            {activeTab === 'Academic' ? 'Academic Excellence Rankings (by CGPA)' : 'Attendance Rankings (by Attendance %)'}
          </h3>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {data.map((student) => (
            <div
              key={student.rank}
              className={`flex items-center gap-4 p-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 ${student.rank <= 3 ? 'bg-amber-500/3' : ''}`}
            >
              <RankBadge rank={student.rank} />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{student.name}</p>
                  {activeTab === 'Academic' && student.badges.map(badge => {
                    const cfg = BADGE_CONFIG[badge];
                    return (
                      <span key={badge} className={`inline-flex items-center gap-1 text-[10px] font-black px-1.5 py-0.5 rounded ${cfg.bg} ${cfg.color}`}>
                        <cfg.icon className="w-3 h-3" />
                        {badge}
                      </span>
                    );
                  })}
                </div>
                <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${DEPT_COLORS[student.dept] || 'bg-slate-200 text-slate-600'}`}>
                  {student.dept}
                </span>
              </div>

              {activeTab === 'Academic' ? (
                <div className="text-right">
                  <p className="text-base font-black text-indigo-600 dark:text-indigo-400">{student.cgpa}</p>
                  <p className="text-[10px] text-slate-500">CGPA / 10.0</p>
                </div>
              ) : (
                <div className="text-right">
                  <p className="text-base font-black text-emerald-600 dark:text-emerald-400">{student.attendance}%</p>
                  <p className="text-[10px] text-slate-500">{student.present}/{student.classes} classes</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
