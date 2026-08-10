import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  LayoutDashboard,
  Bell,
  Bot,
  Mic,
  Calendar,
  CheckCircle2,
  FileSpreadsheet,
  GraduationCap,
  CalendarDays,
  Briefcase,
  FileText,
  User,
  Settings,
  Shield,
  BookOpen,
  LogOut,
  X
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const userRole = user?.role || 'Student';

  // Role-based Navigation Configuration
  let navItems = [];

  if (userRole === 'Student') {
    navItems = [
      { name: t('nav.dashboard', 'Dashboard'), path: '/dashboard', icon: LayoutDashboard },
      { name: t('nav.notices', 'Notice Board'), path: '/notices', icon: Bell, badge: 'NEW' },
      { name: t('nav.chatbot', 'AI Chatbot'), path: '/chatbot', icon: Bot },
      { name: t('nav.voice', 'Voice Assistant'), path: '/voice', icon: Mic },
      { name: t('nav.timetable', 'Timetable'), path: '/timetable', icon: Calendar },
      { name: t('nav.attendance', 'Attendance'), path: '/attendance', icon: CheckCircle2 },
      { name: t('nav.assignments', 'Assignments'), path: '/assignments', icon: FileSpreadsheet },
      { name: t('nav.results', 'Results'), path: '/results', icon: GraduationCap },
      { name: t('nav.events', 'Campus Events'), path: '/events', icon: CalendarDays },
      { name: t('nav.placements', 'Placements'), path: '/placements', icon: Briefcase },
      { name: t('nav.documents', 'Study Documents'), path: '/documents', icon: FileText },
      { name: t('nav.notifications', 'Notifications'), path: '/notifications', icon: Bell },
      { name: t('nav.profile', 'My Profile'), path: '/profile', icon: User },
      { name: t('nav.settings', 'Settings'), path: '/settings', icon: Settings },
    ];
  } else if (userRole === 'Faculty') {
    navItems = [
      { name: t('nav.dashboard', 'Dashboard'), path: '/dashboard', icon: LayoutDashboard },
      { name: t('nav.notices', 'Notice Board'), path: '/notices', icon: Bell, badge: 'NEW' },
      { name: t('nav.attendance', 'Mark Attendance'), path: '/attendance', icon: CheckCircle2, highlight: true },
      { name: t('nav.timetable', 'Timetable'), path: '/timetable', icon: Calendar },
      { name: t('nav.assignments', 'Assignments'), path: '/assignments', icon: FileSpreadsheet },
      { name: t('nav.events', 'Campus Events'), path: '/events', icon: CalendarDays },
      { name: t('nav.notifications', 'Notifications'), path: '/notifications', icon: Bell },
      { name: t('nav.faculty', 'Faculty Portal'), path: '/faculty', icon: BookOpen, highlight: true },
      { name: t('nav.profile', 'My Profile'), path: '/profile', icon: User },
      { name: t('nav.settings', 'Settings'), path: '/settings', icon: Settings },
    ];
  } else if (userRole === 'Admin') {
    navItems = [
      { name: t('nav.dashboard', 'Dashboard'), path: '/dashboard', icon: LayoutDashboard },
      { name: t('nav.admin', 'Admin Panel'), path: '/admin', icon: Shield, highlight: true },
      { name: t('nav.notices', 'Notice Board'), path: '/notices', icon: Bell, badge: 'NEW' },
      { name: t('nav.attendance', 'Manage Attendance'), path: '/attendance', icon: CheckCircle2 },
      { name: t('nav.timetable', 'Timetable'), path: '/timetable', icon: Calendar },
      { name: t('nav.assignments', 'Assignments'), path: '/assignments', icon: FileSpreadsheet },
      { name: t('nav.results', 'Results'), path: '/results', icon: GraduationCap },
      { name: t('nav.events', 'Campus Events'), path: '/events', icon: CalendarDays },
      { name: t('nav.placements', 'Placements'), path: '/placements', icon: Briefcase },
      { name: t('nav.documents', 'Study Documents'), path: '/documents', icon: FileText },
      { name: t('nav.notifications', 'Notifications'), path: '/notifications', icon: Bell },
      { name: t('nav.faculty', 'Faculty Portal'), path: '/faculty', icon: BookOpen },
      { name: t('nav.profile', 'My Profile'), path: '/profile', icon: User },
      { name: t('nav.settings', 'Settings'), path: '/settings', icon: Settings },
    ];
  }

  const handleLogout = () => {
    logout();
    if (onClose) onClose();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 bottom-0 w-64 bg-slate-950 text-slate-100 flex flex-col z-50 transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'
          } border-r border-slate-800 shadow-2xl`}
      >
        {/* Header Branding */}
        <div className="h-20 px-6 flex items-center justify-between border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-base tracking-tight text-white leading-tight">Smart Notice</h1>
              <span className="text-xs font-medium text-indigo-400">Academic Board</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white lg:hidden hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Role Badge */}
        <div className="px-6 py-4 border-b border-slate-800/50 bg-slate-900/40">
          <div className="flex items-center gap-3">
            <img
              src={user?.profile_pic_url || `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="%234F46E5"/><circle cx="50" cy="40" r="20" fill="%23FFFFFF"/><path d="M20,85 C20,65 35,55 50,55 C65,55 80,65 80,85 Z" fill="%23FFFFFF"/></svg>`}
              onError={(e) => { e.target.src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="%234F46E5"/><circle cx="50" cy="40" r="20" fill="%23FFFFFF"/><path d="M20,85 C20,65 35,55 50,55 C65,55 80,65 80,85 Z" fill="%23FFFFFF"/></svg>`; }}
              alt="Avatar"
              className="w-9 h-9 rounded-full object-cover ring-2 ring-indigo-500/50"
            />
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-white truncate">{user?.full_name || 'User Profile'}</p>
              <span className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border ${userRole === 'Admin'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  : userRole === 'Faculty'
                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                    : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                }`}>
                {userRole}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1.5 custom-scrollbar">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => onClose && onClose()}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : item.highlight
                    ? 'bg-purple-950/40 text-purple-300 border border-purple-800/50 hover:bg-purple-900/50'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-4 h-4" />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer Logout */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-rose-400 bg-rose-950/20 hover:bg-rose-900/40 border border-rose-900/30 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>{t('nav.signOut', 'Sign Out')}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
