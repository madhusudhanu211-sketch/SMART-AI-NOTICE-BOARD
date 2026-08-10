import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Menu,
  Sun,
  Moon,
  Bell,
  Mic,
  Bot,
  Search,
  User,
  LogOut,
  ChevronDown,
  Globe
} from 'lucide-react';

export default function Navbar({ onMenuToggle, onMicClick }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');

  const defaultAvatar = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="%234F46E5"/><circle cx="50" cy="40" r="20" fill="%23FFFFFF"/><path d="M20,85 C20,65 35,55 50,55 C65,55 80,65 80,85 Z" fill="%23FFFFFF"/></svg>`;

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return 'Dashboard Overview';
    if (path.includes('/notices')) return 'Smart Notice Board';
    if (path.includes('/chatbot')) return 'AI Assistant';
    if (path.includes('/voice')) return 'Voice Assistant';
    if (path.includes('/timetable')) return 'Class Timetable';
    if (path.includes('/attendance')) return 'Attendance Tracker';
    if (path.includes('/assignments')) return 'Course Assignments';
    if (path.includes('/results')) return 'Academic Results';
    if (path.includes('/events')) return 'Campus Events';
    if (path.includes('/placements')) return 'Placement Portal';
    if (path.includes('/documents')) return 'Study Materials';
    if (path.includes('/notifications')) return 'Notifications';
    if (path.includes('/profile')) return 'User Profile';
    if (path.includes('/settings')) return 'Portal Settings';
    if (path.includes('/admin')) return 'Admin Panel';
    if (path.includes('/faculty')) return 'Faculty Portal';
    return 'Smart Notice Board';
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (globalSearch.trim()) {
      navigate(`/notices?q=${encodeURIComponent(globalSearch)}`);
    }
  };

  const studentName = user?.full_name || 'Madhu Sudhan';
  const studentRole = user?.role || 'Student';

  return (
    <header className="sticky top-0 z-30 h-20 px-4 sm:px-8 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between transition-colors">
      {/* Left section: Hamburger & Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuToggle}
          className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden transition-colors"
          aria-label="Toggle Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            {getPageTitle()}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
            Smart Notice Board System • AY 2025-2026
          </p>
        </div>
      </div>

      {/* Center Search Bar */}
      <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center relative w-64 lg:w-80">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          value={globalSearch}
          onChange={(e) => setGlobalSearch(e.target.value)}
          placeholder="Search notices, exams, timetable..."
          className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </form>

      {/* Right section: Quick Shortcuts & User Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Voice Assistant Shortcut */}
        <button
          onClick={onMicClick || (() => navigate('/voice'))}
          className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-800/50 flex items-center gap-2 transition-all group shadow-sm"
          title="Voice Assistant Shortcut"
        >
          <Mic className="w-4 h-4 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-semibold hidden lg:inline">Voice Assistant</span>
        </button>

        {/* AI Chatbot Shortcut */}
        <button
          onClick={() => navigate('/chatbot')}
          className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/50 border border-purple-200 dark:border-purple-800/50 flex items-center gap-2 transition-all group shadow-sm"
          title="AI Assistant Shortcut"
        >
          <Bot className="w-4 h-4 group-hover:rotate-12 transition-transform" />
          <span className="text-xs font-semibold hidden lg:inline">AI Assistant</span>
        </button>

        {/* Dark/Light Mode Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Toggle Dark/Light Theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* Notification Bell */}
        <button
          onClick={() => navigate('/notifications')}
          className="relative p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-indigo-600 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
        </button>

        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1 hidden sm:block" />

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <img
              src={user?.profile_pic_url || defaultAvatar}
              onError={(e) => { e.target.src = defaultAvatar; }}
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-500/40"
            />
            <div className="text-left hidden sm:block">
              <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{studentName}</p>
              <p className="text-[10px] font-semibold text-indigo-500 dark:text-indigo-400 uppercase leading-none mt-0.5">{studentRole}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 py-2 z-50 animate-in fade-in zoom-in-95">
              <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-700">
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  {studentName}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email || 'madhusudhan@college.edu'}</p>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    navigate('/profile');
                    setShowProfileMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2"
                >
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  View Profile
                </button>
                <button
                  onClick={() => {
                    logout();
                    navigate('/login');
                  }}
                  className="w-full text-left px-4 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
