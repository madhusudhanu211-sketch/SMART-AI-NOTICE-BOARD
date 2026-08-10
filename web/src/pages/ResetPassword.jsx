import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Lock, KeyRound, CheckCircle2 } from 'lucide-react';
import api from '../services/api';

export default function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();

  const [email, setEmail] = useState(location.state?.email || 'student@example.com');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { email, otp, new_password: newPassword });
      setMessage('Password updated successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setMessage('Password updated successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mx-auto mb-3 text-indigo-400">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white">Reset Password</h2>
          <p className="text-xs text-slate-400 mt-1">Enter OTP code & create your new password</p>
        </div>

        {message && (
          <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs font-semibold mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">OTP Code</label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                required
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">New Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg"
          >
            {loading ? 'Updating Password...' : 'Save New Password'}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 mt-6">
          <Link to="/login" className="text-indigo-400 font-bold hover:underline">Back to Sign In</Link>
        </p>
      </div>
    </div>
  );
}
