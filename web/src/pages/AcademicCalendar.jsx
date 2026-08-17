import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, X, Clock, MapPin, BookOpen, AlertTriangle } from 'lucide-react';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

const EVENT_TYPES = {
  exam:       { label: 'Exam',       color: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-400/30',        dot: 'bg-rose-500' },
  holiday:    { label: 'Holiday',    color: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-400/30', dot: 'bg-emerald-500' },
  workshop:   { label: 'Workshop',   color: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-400/30',  dot: 'bg-purple-500' },
  assignment: { label: 'Assignment', color: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-400/30',    dot: 'bg-amber-500' },
  event:      { label: 'Event',      color: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-400/30', dot: 'bg-indigo-500' },
};

// Sample academic events for August 2026
const EVENTS = [
  { id: 1, date: '2026-08-18', title: 'Cloud DevOps Workshop', type: 'workshop', time: '10:00 AM', location: 'Seminar Hall B', description: 'Hands-on Docker, Kubernetes & AWS training by IEEE Student Branch.' },
  { id: 2, date: '2026-08-20', title: 'Independence Day Holiday', type: 'holiday', time: 'Full Day', location: 'Campus Wide', description: 'National Independence Day – no academic activities.' },
  { id: 3, date: '2026-08-22', title: 'Web Dev Assignment Due', type: 'assignment', time: '11:59 PM', location: 'Online Portal', description: 'CS401 – Full-stack web application assignment submission deadline.' },
  { id: 4, date: '2026-08-25', title: 'AI & ML Hackathon', type: 'event', time: '09:00 AM', location: 'Main Auditorium', description: '36-hour national-level innovation hackathon.' },
  { id: 5, date: '2026-08-28', title: 'Internal Assessment Test 1', type: 'exam', time: '09:30 AM', location: 'All Exam Halls', description: 'Internal Assessment Test 1 for all B.Tech Semester V subjects.' },
  { id: 6, date: '2026-08-29', title: 'Internal Assessment Test 1 (cont.)', type: 'exam', time: '09:30 AM', location: 'All Exam Halls', description: 'Continuation of IA Test 1 – Lab Subjects & Electives.' },
  { id: 7, date: '2026-09-01', title: 'End-Semester Examinations Begin', type: 'exam', time: '09:00 AM', location: 'Exam Complex', description: 'End-semester exams begin for B.Tech & M.Tech students.' },
  { id: 8, date: '2026-09-05', title: 'AWS Placement Drive Deadline', type: 'assignment', time: '11:59 PM', location: 'Placement Portal', description: 'Last date to register for Amazon Web Services campus placement drive.' },
];

function getEventsForDate(dateStr) {
  return EVENTS.filter(e => e.date === dateStr);
}

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

export default function AcademicCalendar() {
  const today = new Date();
  const [viewYear, setViewYear] = useState(2026);
  const [viewMonth, setViewMonth] = useState(7); // August (0-indexed)
  const [selectedDay, setSelectedDay] = useState(null);
  const [popoverEvents, setPopoverEvents] = useState([]);

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
    setSelectedDay(null);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
    setSelectedDay(null);
  };

  const handleDayClick = (day) => {
    const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const evts = getEventsForDate(dateStr);
    setSelectedDay(day);
    setPopoverEvents(evts);
  };

  const isToday = (day) => {
    return today.getFullYear() === viewYear && today.getMonth() === viewMonth && today.getDate() === day;
  };

  const upcomingEvents = EVENTS
    .filter(e => new Date(e.date) >= today)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 6);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          <span>Academic Calendar</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Exam schedules, holidays, workshop dates &amp; assignment deadlines
        </p>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 flex-wrap">
        {Object.entries(EVENT_TYPES).map(([key, val]) => (
          <div key={key} className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400">
            <span className={`w-2.5 h-2.5 rounded-full ${val.dot}`} />
            {val.label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-2 glass-card p-6 space-y-4">
          {/* Month Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={prevMonth}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-base font-black text-slate-900 dark:text-white">
              {MONTHS[viewMonth]} {viewYear}
            </h2>
            <button
              onClick={nextMonth}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1">
            {DAYS.map(d => (
              <div key={d} className="text-center text-[10px] font-black text-slate-400 uppercase py-2">{d}</div>
            ))}
          </div>

          {/* Day Cells */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
              const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const dayEvents = getEventsForDate(dateStr);
              const todayClass = isToday(day)
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/40 font-black'
                : selectedDay === day
                ? 'bg-indigo-500/10 border-indigo-500/40 font-bold'
                : 'hover:bg-slate-100 dark:hover:bg-slate-800';

              return (
                <button
                  key={day}
                  onClick={() => handleDayClick(day)}
                  className={`relative aspect-square rounded-xl flex flex-col items-center justify-start p-1 text-xs border border-transparent transition-all ${todayClass}`}
                >
                  <span className={`text-xs font-bold ${isToday(day) ? 'text-white' : 'text-slate-700 dark:text-slate-200'}`}>
                    {day}
                  </span>
                  {dayEvents.length > 0 && (
                    <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center">
                      {dayEvents.slice(0, 3).map((evt, ei) => (
                        <span
                          key={ei}
                          className={`w-1.5 h-1.5 rounded-full ${EVENT_TYPES[evt.type]?.dot}`}
                        />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Day Events Detail */}
          {selectedDay && (
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {MONTHS[viewMonth]} {selectedDay}, {viewYear}
                </h3>
                <button onClick={() => { setSelectedDay(null); setPopoverEvents([]); }}>
                  <X className="w-4 h-4 text-slate-400 hover:text-slate-700 dark:hover:text-white" />
                </button>
              </div>
              {popoverEvents.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No events scheduled for this day.</p>
              ) : (
                popoverEvents.map(evt => (
                  <div key={evt.id} className={`p-3.5 rounded-2xl border ${EVENT_TYPES[evt.type]?.color} space-y-1`}>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider">{EVENT_TYPES[evt.type]?.label}</span>
                      <span className="text-[10px] font-semibold flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {evt.time}
                      </span>
                    </div>
                    <p className="text-sm font-bold">{evt.title}</p>
                    <p className="text-[11px] leading-relaxed opacity-80">{evt.description}</p>
                    <p className="text-[11px] font-semibold flex items-center gap-1 opacity-70">
                      <MapPin className="w-3 h-3" /> {evt.location}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Upcoming Events Sidebar */}
        <div className="space-y-4">
          <div className="glass-card p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Upcoming Events
            </h3>
            <div className="space-y-3">
              {upcomingEvents.map(evt => {
                const d = new Date(evt.date);
                return (
                  <div key={evt.id} className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    <div className="text-center min-w-[36px]">
                      <p className="text-[10px] font-bold text-slate-500 uppercase">{MONTHS[d.getMonth()].slice(0,3)}</p>
                      <p className="text-lg font-black text-slate-900 dark:text-white leading-none">{d.getDate()}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className={`w-2 h-2 rounded-full ${EVENT_TYPES[evt.type]?.dot}`} />
                        <span className="text-[10px] font-bold text-slate-500 uppercase">{EVENT_TYPES[evt.type]?.label}</span>
                      </div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white leading-snug">{evt.title}</p>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" /> {evt.time}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="glass-card p-5 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-500" />
              This Month Summary
            </h3>
            {[
              { label: 'Total Events', value: EVENTS.filter(e => e.date.startsWith(`${viewYear}-${String(viewMonth + 1).padStart(2, '0')}`)).length, color: 'text-indigo-600' },
              { label: 'Exams', value: EVENTS.filter(e => e.type === 'exam' && e.date.startsWith(`${viewYear}-${String(viewMonth + 1).padStart(2, '0')}`)).length, color: 'text-rose-600' },
              { label: 'Holidays', value: EVENTS.filter(e => e.type === 'holiday' && e.date.startsWith(`${viewYear}-${String(viewMonth + 1).padStart(2, '0')}`)).length, color: 'text-emerald-600' },
              { label: 'Workshops', value: EVENTS.filter(e => e.type === 'workshop' && e.date.startsWith(`${viewYear}-${String(viewMonth + 1).padStart(2, '0')}`)).length, color: 'text-purple-600' },
            ].map(stat => (
              <div key={stat.label} className="flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-400">{stat.label}</span>
                <span className={`font-black text-base ${stat.color}`}>{stat.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
