import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bell, User, Mail, Lock, Phone, Hash, CheckCircle2, GraduationCap, BookOpen, Shield } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    role: 'Student',
    roll_number: '',
    phone: '',
    department_id: 1,
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    const res = await register(formData);
    setLoading(false);

    if (res.success) {
      setMessage('Registration successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1500);
    } else {
      setError(res.error || 'Registration failed. Please check inputs.');
    }
  };

  const roles = [
    { id: 'Student', label: 'Student', icon: GraduationCap },
    { id: 'Faculty', label: 'Faculty', icon: BookOpen },
    { id: 'Admin', label: 'Admin', icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="w-full max-w-lg z-10">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-3 shadow-xl">
            <Bell className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Create Academic Account</h1>
          <p className="text-xs text-slate-400 mt-1">Register for Smart Notice Board Portal</p>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-4">
          {/* Role Selection Cards */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Select Your Role
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {roles.map((r) => {
                const isSelected = formData.role === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, role: r.id })}
                    className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-500 ring-2 ring-indigo-500/50 shadow-lg'
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

          {message && (
            <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{message}</span>
            </div>
          )}

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="John Doe"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Roll / ID Number
                </label>
                <div className="relative">
                  <Hash className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={formData.roll_number}
                    onChange={(e) => setFormData({ ...formData, roll_number: e.target.value })}
                    placeholder="210101001"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@college.edu"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 9876543210"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all transform active:scale-95"
            >
              {loading ? <span>Registering...</span> : <span>Complete Registration as {formData.role}</span>}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-500 mt-5">
          Already registered?{' '}
          <Link to="/login" className="text-indigo-400 font-bold hover:underline">
            Back to Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
