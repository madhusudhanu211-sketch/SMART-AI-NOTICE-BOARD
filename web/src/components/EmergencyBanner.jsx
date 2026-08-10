import React from 'react';
import { AlertTriangle, ChevronRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function EmergencyBanner({ alert, onClose }) {
  const navigate = useNavigate();

  if (!alert) return null;

  return (
    <div className="bg-gradient-to-r from-rose-600 via-red-600 to-amber-600 text-white px-4 py-3 shadow-lg shadow-rose-900/20 border-b border-rose-500 flex items-center justify-between z-20 animate-in slide-in-from-top duration-300">
      <div className="flex items-center gap-3 max-w-5xl mx-auto flex-1 cursor-pointer" onClick={() => navigate('/notices')}>
        <div className="p-1.5 rounded-lg bg-white/20 backdrop-blur-sm animate-pulse">
          <AlertTriangle className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 overflow-hidden">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-black/30 tracking-widest text-amber-200">
              EMERGENCY BROADCAST
            </span>
            <span className="text-xs font-semibold opacity-90 hidden sm:inline">
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <p className="text-sm font-bold truncate mt-0.5">
            {alert.title || alert.message || 'Urgent announcement from campus administration! Click to read details.'}
          </p>
        </div>
        <div className="hidden md:flex items-center gap-1 text-xs font-bold bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors">
          <span>View Notice</span>
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>

      {onClose && (
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/20 ml-2 transition-colors"
          title="Dismiss Banner"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
