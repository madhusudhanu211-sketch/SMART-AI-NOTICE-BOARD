import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bell, Lock, Mail, ArrowRight, GraduationCap, BookOpen, Shield } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('Student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setError('');
    setLoading(true);

    const result = await login(email, password, selectedRole);
    setLoading(false);

    if (result.success) {
      const userRole = (result.user?.role || selectedRole).toLowerCase();
      if (userRole === 'faculty') {
        navigate('/faculty/dashboard');
      } else if (userRole === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } else {
      setError(result.error || 'Invalid email or password. Please check your credentials.');
    }
  };

  const roles = [
    { id: 'Student', label: 'Student', icon: GraduationCap, color: 'from-blue-600 to-indigo-600' },
    { id: 'Faculty', label: 'Faculty', icon: BookOpen, color: 'from-purple-600 to-indigo-600' },
    { id: 'Admin', label: 'Admin', icon: Shield, color: 'from-amber-600 to-orange-600' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Animated Blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-pulse pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse pointer-events-none" />

      <div className="w-full max-w-md z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-indigo-500/30 ring-4 ring-indigo-500/20">
            <Bell className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Smart Notice Board</h1>
          <p className="text-sm text-slate-400 mt-1">Next-Generation Academic Portal & AI Assistant</p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
          <div>
            <h2 className="text-xl font-bold text-white">Sign in to your account</h2>
            <p className="text-xs text-slate-400 mt-1">Select your role and enter your portal credentials</p>
          </div>

          {/* Role Selection Cards */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Select Your Role
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {roles.map((r) => {
                const isSelected = selectedRole === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setSelectedRole(r.id)}
                    className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-500 ring-2 ring-indigo-500/50 shadow-lg shadow-indigo-600/30'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <r.icon className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                    <span className="text-xs font-bold">{r.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs font-semibold animate-in fade-in">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@college.edu"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Password
                </label>
                <Link to="/forgot-password" className="text-xs text-indigo-400 hover:underline">
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all transform active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In as {selectedRole}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer Link */}
        <p className="text-center text-xs text-slate-500 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-indigo-400 font-bold hover:underline">
            Register Account
          </Link>
        </p>
      </div>
    </div>
  );
}
