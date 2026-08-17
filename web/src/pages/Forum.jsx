import React, { useState } from 'react';
import {
  MessageSquare, Plus, ThumbsUp, CheckCircle2, Tag,
  ChevronDown, ChevronUp, Search, X, Send, Filter
} from 'lucide-react';

const TAG_STYLES = {
  Doubt:         'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-400/30',
  Discussion:    'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-400/30',
  Resource:      'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-400/30',
  Announcement:  'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-400/30',
};

const SAMPLE_THREADS = [
  {
    id: 1, tag: 'Doubt', subject: 'Data Structures', resolved: false, upvotes: 14,
    title: 'How does AVL tree rotation differ from Red-Black tree balancing?',
    body: 'I am confused about when to apply single vs double rotations in AVL trees compared to color flipping in Red-Black trees. Can someone explain with a use case?',
    author: 'Aarav Mehta', time: '2 hours ago',
    replies: [
      { id: 1, author: 'Dr. Priya S.', body: 'Great question! AVL trees are strictly balanced (height diff ≤ 1), hence more rotations. Red-Black trees use color properties allowing up to 2× height difference, so fewer rotations but relaxed balance.', time: '1 hour ago', isStaff: true },
      { id: 2, author: 'Riya P.', body: 'Also, AVL trees are better for lookup-heavy operations while Red-Black trees suit insertion/deletion-heavy scenarios.', time: '45 mins ago', isStaff: false },
    ]
  },
  {
    id: 2, tag: 'Resource', subject: 'DBMS', resolved: false, upvotes: 8,
    title: 'Sharing best free resources for SQL query optimization',
    body: 'I compiled a list of free resources I found useful for learning SQL query optimization, indexing strategies, and execution plans. Sharing for everyone\'s benefit.',
    author: 'Kavya R.', time: '5 hours ago',
    replies: [
      { id: 1, author: 'Rahul K.', body: 'Thanks! I would also add "Use The Index, Luke" – it\'s an excellent free book on database indexing.', time: '4 hours ago', isStaff: false },
    ]
  },
  {
    id: 3, tag: 'Doubt', subject: 'Operating Systems', resolved: true, upvotes: 22,
    title: 'Difference between process and thread – why does the OS treat them differently?',
    body: 'My professor mentioned that threads share heap memory but have separate stacks. Why exactly does OS manage their scheduling differently if they belong to the same process?',
    author: 'Suresh T.', time: 'Yesterday',
    replies: [
      { id: 1, author: 'Dr. Anand V.', body: 'Threads share the same memory address space (code, data, heap) but each thread has its own stack and registers. Context switching between threads is cheaper than between processes because no page table switch is needed.', time: 'Yesterday', isStaff: true },
    ]
  },
  {
    id: 4, tag: 'Announcement', subject: 'General', resolved: false, upvotes: 31,
    title: '📢 Internal Assessment 1 – Study Group Formation for CSE Sem V',
    body: 'Forming study groups for upcoming Internal Assessment 1. Topics covered: Data Structures, DBMS, OS, Networks. Message here if you want to join – groups of 4-5 students.',
    author: 'Class Rep – CSE-B', time: '2 days ago',
    replies: []
  },
  {
    id: 5, tag: 'Discussion', subject: 'AI & ML', resolved: false, upvotes: 18,
    title: 'Which ML framework is better for beginners – TensorFlow or PyTorch?',
    body: 'Starting my AI project for the hackathon. I have basic Python knowledge. Should I start with TensorFlow/Keras or jump directly into PyTorch? What are the trade-offs?',
    author: 'Meena L.', time: '3 days ago',
    replies: [
      { id: 1, author: 'Prof. Keerthi', body: 'For beginners I recommend starting with PyTorch – it\'s more Pythonic and has better debugging capabilities. TensorFlow is great for production deployment though.', time: '3 days ago', isStaff: true },
      { id: 2, author: 'Dev P.', body: 'Agreed! PyTorch has more community tutorials and the "define-by-run" dynamic graph is much easier to debug as a learner.', time: '2 days ago', isStaff: false },
    ]
  },
];

const SUBJECTS = ['All', 'Data Structures', 'DBMS', 'Operating Systems', 'AI & ML', 'Computer Networks', 'General'];
const TAGS = ['All', 'Doubt', 'Discussion', 'Resource', 'Announcement'];

export default function Forum() {
  const [threads, setThreads] = useState(SAMPLE_THREADS);
  const [expandedId, setExpandedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTag, setFilterTag] = useState('All');
  const [filterSubject, setFilterSubject] = useState('All');
  const [showNewThread, setShowNewThread] = useState(false);
  const [replyInputs, setReplyInputs] = useState({});
  const [upvoted, setUpvoted] = useState({});

  // New thread form state
  const [newThread, setNewThread] = useState({ title: '', body: '', tag: 'Doubt', subject: 'General' });

  const filtered = threads.filter(t => {
    const matchSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.body.toLowerCase().includes(searchTerm.toLowerCase());
    const matchTag = filterTag === 'All' || t.tag === filterTag;
    const matchSubject = filterSubject === 'All' || t.subject === filterSubject;
    return matchSearch && matchTag && matchSubject;
  });

  const handleUpvote = (id) => {
    if (upvoted[id]) return;
    setUpvoted(prev => ({ ...prev, [id]: true }));
    setThreads(prev => prev.map(t => t.id === id ? { ...t, upvotes: t.upvotes + 1 } : t));
  };

  const handleResolve = (id) => {
    setThreads(prev => prev.map(t => t.id === id ? { ...t, resolved: !t.resolved } : t));
  };

  const handleReply = (threadId) => {
    const body = replyInputs[threadId];
    if (!body?.trim()) return;
    setThreads(prev => prev.map(t => {
      if (t.id !== threadId) return t;
      return {
        ...t,
        replies: [...t.replies, {
          id: t.replies.length + 1,
          author: 'You',
          body,
          time: 'Just now',
          isStaff: false,
        }]
      };
    }));
    setReplyInputs(prev => ({ ...prev, [threadId]: '' }));
  };

  const handlePostThread = () => {
    if (!newThread.title.trim() || !newThread.body.trim()) return;
    setThreads(prev => [{
      id: Date.now(),
      ...newThread,
      resolved: false,
      upvotes: 0,
      author: 'You',
      time: 'Just now',
      replies: [],
    }, ...prev]);
    setNewThread({ title: '', body: '', tag: 'Doubt', subject: 'General' });
    setShowNewThread(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <span>Discussion Forum</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Ask doubts, share resources, and discuss academic topics with peers &amp; faculty
          </p>
        </div>
        <button
          onClick={() => setShowNewThread(true)}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all"
        >
          <Plus className="w-4 h-4" />
          New Thread
        </button>
      </div>

      {/* New Thread Modal */}
      {showNewThread && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 max-w-xl w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 dark:text-white">Post New Thread</h3>
              <button onClick={() => setShowNewThread(false)}>
                <X className="w-5 h-5 text-slate-400 hover:text-slate-700 dark:hover:text-white" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Tag</label>
                <select
                  value={newThread.tag}
                  onChange={e => setNewThread(p => ({ ...p, tag: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                >
                  {TAGS.filter(t => t !== 'All').map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Subject</label>
                <select
                  value={newThread.subject}
                  onChange={e => setNewThread(p => ({ ...p, subject: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                >
                  {SUBJECTS.filter(s => s !== 'All').map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Thread Title</label>
              <input
                type="text"
                value={newThread.title}
                onChange={e => setNewThread(p => ({ ...p, title: e.target.value }))}
                placeholder="Write a clear, descriptive title..."
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Details / Description</label>
              <textarea
                value={newThread.body}
                onChange={e => setNewThread(p => ({ ...p, body: e.target.value }))}
                rows={4}
                placeholder="Describe your question or discussion topic in detail..."
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white resize-none"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowNewThread(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handlePostThread}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow flex items-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                Post Thread
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="glass-card p-4 space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search threads by title or content..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
          />
        </div>
        <div className="flex gap-4 flex-wrap items-center text-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500 font-semibold">Tag:</span>
            {TAGS.map(tag => (
              <button
                key={tag}
                onClick={() => setFilterTag(tag)}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${filterTag === tag ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'}`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Thread List */}
      <div className="space-y-4">
        {filtered.length === 0 && (
          <div className="glass-card p-10 text-center text-slate-500 text-sm">
            No threads found. Try adjusting your filters or start a new thread!
          </div>
        )}
        {filtered.map(thread => (
          <div
            key={thread.id}
            className={`glass-card overflow-hidden transition-all ${thread.resolved ? 'border-emerald-500/30' : ''}`}
          >
            {/* Thread Header */}
            <div className="p-5 space-y-3">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${TAG_STYLES[thread.tag]}`}>
                    <Tag className="w-3 h-3 inline mr-0.5" />
                    {thread.tag}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase">
                    {thread.subject}
                  </span>
                  {thread.resolved && (
                    <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-400/30 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Resolved
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleUpvote(thread.id)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold transition-all border ${upvoted[thread.id] ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-400'}`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    {thread.upvotes}
                  </button>
                  <button
                    onClick={() => handleResolve(thread.id)}
                    className={`p-1.5 rounded-xl border transition-all text-xs ${thread.resolved ? 'bg-emerald-500/10 text-emerald-600 border-emerald-400/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700 hover:border-emerald-400'}`}
                    title={thread.resolved ? 'Mark as Unresolved' : 'Mark as Resolved'}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">{thread.title}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed line-clamp-2">{thread.body}</p>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-500">
                  Posted by <strong className="text-slate-700 dark:text-slate-300">{thread.author}</strong> · {thread.time}
                </span>
                <button
                  onClick={() => setExpandedId(expandedId === thread.id ? null : thread.id)}
                  className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  {thread.replies.length} {thread.replies.length === 1 ? 'Reply' : 'Replies'}
                  {expandedId === thread.id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Expanded Replies */}
            {expandedId === thread.id && (
              <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-3 p-5">
                {thread.replies.length === 0 && (
                  <p className="text-xs text-slate-500 italic">No replies yet. Be the first to respond!</p>
                )}
                {thread.replies.map(reply => (
                  <div
                    key={reply.id}
                    className={`p-4 rounded-2xl space-y-1 ${reply.isStaff ? 'bg-indigo-500/8 border border-indigo-500/20' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700'}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{reply.author}</span>
                      {reply.isStaff && (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-indigo-600 text-white">
                          Faculty
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400 ml-auto">{reply.time}</span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{reply.body}</p>
                  </div>
                ))}

                {/* Reply Input */}
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="text"
                    value={replyInputs[thread.id] || ''}
                    onChange={e => setReplyInputs(prev => ({ ...prev, [thread.id]: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && handleReply(thread.id)}
                    placeholder="Write a reply..."
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  />
                  <button
                    onClick={() => handleReply(thread.id)}
                    className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
