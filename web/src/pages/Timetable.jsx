import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Calendar, Clock, MapPin, User, BookOpen, Plus, X, CheckCircle2 } from 'lucide-react';

export default function Timetable() {
  const { user } = useAuth();
  const userRole = user?.role || 'Student';

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const [selectedDay, setSelectedDay] = useState('Monday');

  const [timetable, setTimetable] = useState([
    { id: 1, day: 'Monday', time: '09:00 - 10:00 AM', subject: 'Data Structures & Algorithms', faculty: 'Dr. Ramesh Kumar', room: 'Lab 3', type: 'Lab' },
    { id: 2, day: 'Monday', time: '10:15 - 11:15 AM', subject: 'Database Management Systems', faculty: 'Prof. Anitha Sharma', room: 'Hall 102', type: 'Lecture' },
    { id: 3, day: 'Monday', time: '11:30 - 12:30 PM', subject: 'Computer Networks', faculty: 'Mr. Rajesh V.', room: 'Hall 204', type: 'Lecture' },
    { id: 4, day: 'Tuesday', time: '09:00 - 10:00 AM', subject: 'Operating Systems', faculty: 'Dr. Suresh P.', room: 'Hall 101', type: 'Lecture' },
    { id: 5, day: 'Tuesday', time: '10:15 - 11:15 AM', subject: 'Software Engineering', faculty: 'Mrs. Kavitha R.', room: 'Lab 2', type: 'Lab' },
    { id: 6, day: 'Wednesday', time: '09:00 - 10:00 AM', subject: 'Machine Learning Basics', faculty: 'Dr. V. Prasad', room: 'Hall 305', type: 'Lecture' },
    { id: 7, day: 'Thursday', time: '11:30 - 12:30 PM', subject: 'Web Technologies Lab', faculty: 'Mr. Rajesh V.', room: 'Lab 4', type: 'Lab' },
    { id: 8, day: 'Friday', time: '10:15 - 11:15 AM', subject: 'Cyber Security Essentials', faculty: 'Prof. Anitha Sharma', room: 'Hall 102', type: 'Lecture' },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newSlot, setNewSlot] = useState({
    day: 'Monday',
    time: '09:00 - 10:00 AM',
    subject: '',
    faculty: '',
    room: '',
    type: 'Lecture',
  });

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        const res = await api.get('/timetable/');
        if (Array.isArray(res.data) && res.data.length > 0) {
          setTimetable(res.data.map(item => ({
            id: item.id,
            day: item.day_of_week || 'Monday',
            time: item.time_slot,
            subject: item.subject,
            faculty: item.faculty_name,
            room: item.room_number,
            type: item.subject.toLowerCase().includes('lab') ? 'Lab' : 'Lecture'
          })));
        }
      } catch (err) {}
    };
    fetchTimetable();
  }, []);

  const daySchedule = timetable.filter((item) => item.day.toLowerCase() === selectedDay.toLowerCase());

  const handleAddSlot = (e) => {
    e.preventDefault();
    const created = { ...newSlot, id: Date.now() };
    setTimetable([...timetable, created]);
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Calendar className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <span>Class & Lab Timetable</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Department of CSE • B.Tech Semester VI
          </p>
        </div>

        {(userRole === 'Admin' || userRole === 'Faculty') && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Class Slot</span>
          </button>
        )}
      </div>

      {/* Day Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
        {days.map((d) => (
          <button
            key={d}
            onClick={() => setSelectedDay(d)}
            className={`flex-1 min-w-[100px] py-3 px-4 rounded-2xl text-xs font-bold transition-all text-center ${
              selectedDay === d
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 ring-2 ring-indigo-400'
                : 'glass-card text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      {/* Timetable Schedule Cards */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-indigo-500" />
          <span>{selectedDay} Schedule ({daySchedule.length} Classes)</span>
        </h3>

        {daySchedule.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {daySchedule.map((cls) => (
              <div key={cls.id} className="glass-card p-5 space-y-4 hover:border-indigo-500/40 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold px-3 py-1 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                    {cls.time}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    cls.type === 'Lab' ? 'bg-purple-500/10 text-purple-600 border border-purple-500/20' : 'bg-blue-500/10 text-blue-600 border border-blue-500/20'
                  }`}>
                    {cls.type}
                  </span>
                </div>

                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                    {cls.subject}
                  </h4>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-indigo-500" />
                    <span>{cls.faculty}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                    <span>{cls.room}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card p-12 text-center">
            <BookOpen className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">No Classes Scheduled for {selectedDay}</h4>
            <p className="text-xs text-slate-500 mt-1">Enjoy your study break or lab preparation day!</p>
          </div>
        )}
      </div>

      {/* Add Slot Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Add Timetable Slot</h3>
              <button onClick={() => setShowAddModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            <form onSubmit={handleAddSlot} className="space-y-3 mt-4 text-xs">
              <div>
                <label className="font-bold text-slate-500">Day</label>
                <select value={newSlot.day} onChange={e => setNewSlot({...newSlot, day: e.target.value})} className="w-full mt-1 p-2 rounded-xl border bg-slate-50 dark:bg-slate-800 dark:text-white">
                  {days.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-500">Time Slot</label>
                <input type="text" required placeholder="09:00 - 10:00 AM" value={newSlot.time} onChange={e => setNewSlot({...newSlot, time: e.target.value})} className="w-full mt-1 p-2 rounded-xl border bg-slate-50 dark:bg-slate-800 dark:text-white" />
              </div>

              <div>
                <label className="font-bold text-slate-500">Subject Name</label>
                <input type="text" required placeholder="Data Structures" value={newSlot.subject} onChange={e => setNewSlot({...newSlot, subject: e.target.value})} className="w-full mt-1 p-2 rounded-xl border bg-slate-50 dark:bg-slate-800 dark:text-white" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-500">Faculty</label>
                  <input type="text" required placeholder="Dr. Ramesh" value={newSlot.faculty} onChange={e => setNewSlot({...newSlot, faculty: e.target.value})} className="w-full mt-1 p-2 rounded-xl border bg-slate-50 dark:bg-slate-800 dark:text-white" />
                </div>
                <div>
                  <label className="font-bold text-slate-500">Room</label>
                  <input type="text" required placeholder="Lab 3" value={newSlot.room} onChange={e => setNewSlot({...newSlot, room: e.target.value})} className="w-full mt-1 p-2 rounded-xl border bg-slate-50 dark:bg-slate-800 dark:text-white" />
                </div>
              </div>

              <button type="submit" className="w-full py-2.5 rounded-xl bg-indigo-600 text-white font-bold shadow-lg mt-2">Save Slot</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
