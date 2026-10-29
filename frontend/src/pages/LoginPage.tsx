import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Shield, Eye, EyeOff, AlertCircle, Lock, Mail, ArrowRight, CheckCircle2, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getApiError } from '../utils/helpers';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const registered = searchParams.get('registered');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-mesh relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-shield-blue/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-shield-teal/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md animate-slide-up relative z-10">
        {/* Brand header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-shield-blue to-shield-teal shadow-glow-blue mb-4">
            <Shield size={30} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">FraudShield 360</h1>
          <p className="text-slate-400 text-sm mt-1">AI Fraud Intelligence & Blockchain Verification</p>
        </div>

        <div className="card p-8 space-y-6 shadow-2xl border-navy-700/60">
          {registered && (
            <div className="flex items-center gap-2 p-3 bg-emerald-950/40 border border-emerald-700/50 rounded-lg text-emerald-400 text-xs">
              <CheckCircle2 size={16} className="flex-shrink-0" />
              <span>Registration successful! Sign in with your credentials below.</span>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-950/40 border border-red-700/50 rounded-lg text-red-400 text-xs">
              <AlertCircle size={16} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  className="w-full pl-10 pr-4 py-2.5 bg-navy-900 border border-navy-700 rounded-lg text-slate-100 text-sm focus:border-shield-blue focus:ring-1 focus:ring-shield-blue transition-colors outline-none"
                  placeholder="analyst@fraudshield.io"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPass ? 'text' : 'password'}
                  className="w-full pl-10 pr-10 py-2.5 bg-navy-900 border border-navy-700 rounded-lg text-slate-100 text-sm focus:border-shield-blue focus:ring-1 focus:ring-shield-blue transition-colors outline-none"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-shield-blue hover:bg-blue-500 active:scale-[0.99] text-white font-medium text-sm rounded-lg flex items-center justify-center gap-2 shadow-glow-blue transition-all disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In to Platform</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Access Roles */}
          <div className="pt-2 border-t border-navy-700/60">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-2.5">
              <UserCheck size={14} className="text-shield-teal" />
              <span>Demo Quick-Fill Credentials</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@fraudshield.io', 'Admin@123456')}
                className="px-2 py-1.5 rounded bg-navy-900 hover:bg-navy-700 border border-navy-700/70 text-[11px] text-slate-300 hover:text-white transition-all text-center"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('analyst@fraudshield.io', 'Analyst@123456')}
                className="px-2 py-1.5 rounded bg-navy-900 hover:bg-navy-700 border border-navy-700/70 text-[11px] text-slate-300 hover:text-white transition-all text-center"
              >
                Analyst
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('reporter@fraudshield.io', 'Reporter@123456')}
                className="px-2 py-1.5 rounded bg-navy-900 hover:bg-navy-700 border border-navy-700/70 text-[11px] text-slate-300 hover:text-white transition-all text-center"
              >
                Reporter
              </button>
            </div>
          </div>

          <div className="text-center text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-shield-teal hover:underline font-medium">
              Create account
            </Link>
          </div>
        </div>

        {/* Security badge footer */}
        <div className="text-center mt-6 text-[11px] text-slate-500 flex items-center justify-center gap-2">
          <Shield size={12} className="text-shield-teal" />
          <span>Zero-Trust Architecture • SHA-256 Anchored • Argon2id Encrypted</span>
        </div>
      </div>
    </div>
  );
}
