import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import NoticeCard from '../components/NoticeCard';
import api from '../services/api';
import {
  Bell,
  Search,
  Filter,
  Plus,
  Pin,
  AlertCircle,
  FileText,
  X,
  CheckCircle2,
  Paperclip
} from 'lucide-react';

export default function Notices() {
  const { user } = useAuth();
  const userRole = user?.role || 'Student';

  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPriority, setSelectedPriority] = useState('All');
  const [showPinnedOnly, setShowPinnedOnly] = useState(false);

  // Create Notice Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newNotice, setNewNotice] = useState({
    title: '',
    description: '',
    category: 'Academic',
    priority: 'Normal',
    is_pinned: false,
    attachment_url: '',
  });

  const categories = ['All', 'Academic', 'Examination', 'Placements', 'Circulars', 'Events', 'Sports', 'Emergency'];
  const priorities = ['All', 'Normal', 'High', 'Urgent'];

  const fetchNotices = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notices/');
      if (Array.isArray(res.data)) {
        setNotices(res.data);
      }
    } catch (err) {
      // Fallback notices
      setNotices([
        {
          id: 1,
          title: 'End-Semester Examination Schedule Announced',
          description: 'The final date sheet for B.Tech & M.Tech semester examinations starting 1st September 2026 is published.',
          category: 'Examination',
          priority: 'Urgent',
          author_name: 'Dr. S. K. Rao (CoE)',
          is_pinned: true,
          created_at: new Date().toISOString(),
          views_count: 512,
        },
        {
          id: 2,
          title: 'Campus Drive by Google Cloud & Microsoft Azure',
          description: 'Software Engineering & Cloud Architect roles open for CSE/IT 2026 passing out batch. Register before 15th August.',
          category: 'Placements',
          priority: 'High',
          author_name: 'Placement Officer',
          is_pinned: true,
          created_at: new Date().toISOString(),
          views_count: 820,
        },
        {
          id: 3,
          title: 'Annual National AI & Robotics Hackathon 2026',
          description: 'Participate in 36-hour hackathon with cash prizes up to INR 5 Lakhs. Registrations open on portal.',
          category: 'Events',
          priority: 'Normal',
          author_name: 'Student Activity Council',
          is_pinned: false,
          created_at: new Date().toISOString(),
          views_count: 290,
        },
        {
          id: 4,
          title: 'Submission Deadline for Web Development Assignment',
          description: 'All 3rd Year CSE students must submit React assignment before Friday 11:59 PM.',
          category: 'Academic',
          priority: 'High',
          author_name: 'Prof. Anitha Sharma',
          is_pinned: false,
          created_at: new Date().toISOString(),
          views_count: 180,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handleCreateNotice = async (e) => {
    e.preventDefault();
    try {
      await api.post('/notices/', newNotice);
      setShowCreateModal(false);
      setNewNotice({ title: '', description: '', category: 'Academic', priority: 'Normal', is_pinned: false, attachment_url: '' });
      fetchNotices();
    } catch (err) {
      // Demo add
      const created = {
        ...newNotice,
        id: Date.now(),
        author_name: user?.full_name || 'Admin',
        views_count: 1,
        created_at: new Date().toISOString(),
      };
      setNotices([created, ...notices]);
      setShowCreateModal(false);
    }
  };

  // Filtered Notices Logic
  const filteredNotices = notices.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || n.category === selectedCategory;
    const matchesPriority = selectedPriority === 'All' || n.priority === selectedPriority;
    const matchesPin = !showPinnedOnly || n.is_pinned;
    return matchesSearch && matchesCategory && matchesPriority && matchesPin;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Bell className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <span>Smart Notice Board</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time official campus circulars & department updates
          </p>
        </div>

        {(userRole === 'Admin' || userRole === 'Faculty') && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all transform active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Publish New Notice</span>
          </button>
        )}
      </div>

      {/* Search Bar & Filter Controls */}
      <div className="glass-card p-4 space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search announcements, keywords, subjects..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => setShowPinnedOnly(!showPinnedOnly)}
              className={`px-3 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all whitespace-nowrap ${
                showPinnedOnly
                  ? 'bg-amber-500/15 border-amber-500 text-amber-600 dark:text-amber-400'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Pin className="w-3.5 h-3.5" />
              <span>Pinned Only</span>
            </button>
          </div>
        </div>

        {/* Categories Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Notices Grid */}
      {filteredNotices.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotices.map((notice) => (
            <NoticeCard key={notice.id} notice={notice} />
          ))}
        </div>
      ) : (
        <div className="glass-card p-12 text-center">
          <FileText className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No Notices Found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Try adjusting your search criteria or category filter.
          </p>
        </div>
      )}

      {/* Create Notice Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl relative animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Publish Campus Notice</h2>
              <button onClick={() => setShowCreateModal(false)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNotice} className="space-y-3.5 mt-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Notice Title</label>
                <input
                  type="text"
                  required
                  value={newNotice.title}
                  onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
                  placeholder="e.g. Schedule for Mid-Term Exams"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Category</label>
                  <select
                    value={newNotice.category}
                    onChange={(e) => setNewNotice({ ...newNotice, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  >
                    {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Priority</label>
                  <select
                    value={newNotice.priority}
                    onChange={(e) => setNewNotice({ ...newNotice, priority: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  >
                    <option value="Normal">Normal</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Description / Content</label>
                <textarea
                  required
                  rows={4}
                  value={newNotice.description}
                  onChange={(e) => setNewNotice({ ...newNotice, description: e.target.value })}
                  placeholder="Provide full notice details here..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="pin"
                  checked={newNotice.is_pinned}
                  onChange={(e) => setNewNotice({ ...newNotice, is_pinned: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="pin" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Pin to Top of Notice Board
                </label>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-lg"
                >
                  Publish Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
