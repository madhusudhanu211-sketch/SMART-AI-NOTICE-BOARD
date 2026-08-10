import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { CalendarDays, MapPin, Users, Ticket, CheckCircle2, X } from 'lucide-react';

export default function Events() {
  const [events, setEvents] = useState([
    {
      id: 1,
      title: 'National Level AI & Machine Learning Hackathon',
      type: 'Hackathon',
      date: '2026-08-25',
      time: '09:00 AM',
      location: 'Main Auditorium',
      organizer: 'Department of CSE',
      max_participants: 200,
      registered_count: 145,
      description: '36-hour non-stop innovation challenge to build AI solutions for smart cities and healthcare.',
    },
    {
      id: 2,
      title: 'Cloud Computing & DevOps Workshop',
      type: 'Workshop',
      date: '2026-08-18',
      time: '10:00 AM',
      location: 'Seminar Hall B',
      organizer: 'IEEE Student Branch',
      max_participants: 100,
      registered_count: 82,
      description: 'Hands-on training session on Docker, Kubernetes, AWS Services, and CI/CD pipelines.',
    },
  ]);

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [registered, setRegistered] = useState({});

  const handleRegister = (evt) => {
    setRegistered({ ...registered, [evt.id]: true });
    setSelectedEvent(evt);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <CalendarDays className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          <span>Campus Events & Workshops</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Register for upcoming technical workshops, hackathons, and cultural events
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {events.map((evt) => (
          <div key={evt.id} className="glass-card p-6 space-y-4 hover:border-purple-500/40 transition-colors flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold px-3 py-1 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 uppercase tracking-wider">
                  {evt.type}
                </span>
                <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  {evt.registered_count}/{evt.max_participants} Spots Filled
                </span>
              </div>

              <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">{evt.title}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">{evt.description}</p>

              <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-3.5 h-3.5 text-purple-500" />
                  <span>{evt.date} at {evt.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-purple-500" />
                  <span>{evt.location}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-semibold">Organized by: {evt.organizer}</span>
              {registered[evt.id] ? (
                <button
                  onClick={() => setSelectedEvent(evt)}
                  className="px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-600 font-bold text-xs flex items-center gap-1.5"
                >
                  <Ticket className="w-4 h-4" />
                  <span>View Pass QR</span>
                </button>
              ) : (
                <button
                  onClick={() => handleRegister(evt)}
                  className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-lg shadow-purple-600/30"
                >
                  Register Now
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* QR Pass Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-slate-950/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Event Entry Pass</h3>
              <button onClick={() => setSelectedEvent(null)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 space-y-1">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">{selectedEvent.title}</h4>
              <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold">{selectedEvent.date} • {selectedEvent.location}</p>
            </div>

            {/* QR Code Placeholder */}
            <div className="w-48 h-48 bg-slate-950 rounded-2xl mx-auto flex items-center justify-center p-4 border border-slate-800">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=EVENT_PASS_${selectedEvent.id}_REGISTERED`}
                alt="Event QR Pass"
                className="w-full h-full object-contain"
              />
            </div>

            <p className="text-[11px] text-slate-500 font-semibold">Scan QR pass at auditorium entrance desk</p>
          </div>
        </div>
      )}
    </div>
  );
}
