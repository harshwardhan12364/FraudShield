import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Eye, EyeOff, AlertCircle, Lock, Mail, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getApiError } from '../utils/helpers';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', display_name: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await register(form.email, form.display_name, form.password);
      navigate('/login?registered=1');
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-mesh">
      <div className="w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-shield-blue to-shield-teal shadow-glow-blue mb-4">
            <Shield size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100">Create Account</h1>
          <p className="text-slate-500 text-sm mt-1">FraudShield 360 — Reporter Portal</p>
        </div>

        <div className="card p-8 space-y-5">
          {error && (
            <div className="alert-error">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input className="input pl-10" placeholder="Your display name" value={form.display_name}
                  onChange={e => setForm({ ...form, display_name: e.target.value })} required minLength={2} maxLength={100} />
              </div>
            </div>
            <div>
              <label className="label">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input className="input pl-10" type="email" placeholder="you@example.com" value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })} required />
              </div>
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input className="input pl-10 pr-10" type={showPass ? 'text' : 'password'}
                  placeholder="Min 10 chars, upper, lower, digit, special"
                  value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required minLength={10} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className="label">Confirm Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input className="input pl-10" type="password" placeholder="Repeat password"
                  value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })} required />
              </div>
            </div>

            <div className="text-xs text-slate-500 bg-navy-900/60 rounded-lg p-3 border border-navy-700/40">
              All new accounts are granted <strong className="text-slate-400">Reporter</strong> role.
              Contact an administrator to request analyst access.
            </div>

            <button type="submit" className="btn-primary w-full justify-center py-2.5" disabled={loading}>
              {loading ? <span className="spinner w-4 h-4" /> : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="text-shield-blue hover:text-blue-400 font-medium">Sign in</Link>
          </p>
        </div>

        <p className="text-center text-xs text-slate-600 mt-4">
          🔒 This is a demo system. Use fictional identifiers only.
        </p>
      </div>
    </div>
  );
}
