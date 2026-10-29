import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert, TrendingUp, Blocks, FileCheck, AlertTriangle,
  ArrowUpRight, ShieldCheck, Activity, Search, RefreshCw, ChevronRight, CheckCircle2
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { reportsApi, publicApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { formatAmount, formatDateTime, riskBadgeClass, statusBadgeClass } from '../utils/helpers';

const RISK_COLORS = ['#ef4444', '#f97316', '#eab308', '#10b981'];

const trendData = [
  { day: 'Mon', reports: 12, highRisk: 4 },
  { day: 'Tue', reports: 19, highRisk: 7 },
  { day: 'Wed', reports: 15, highRisk: 5 },
  { day: 'Thu', reports: 28, highRisk: 12 },
  { day: 'Fri', reports: 34, highRisk: 15 },
  { day: 'Sat', reports: 22, highRisk: 8 },
  { day: 'Sun', reports: 29, highRisk: 11 },
];

const categoryData = [
  { name: 'UPI / Impersonation', value: 42, color: '#3b82f6' },
  { name: 'Investment / Ponzi', value: 28, color: '#8b5cf6' },
  { name: 'Part-Time Job Scam', value: 18, color: '#ec4899' },
  { name: 'Crypto / Rugpull', value: 12, color: '#14b8a6' },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState<any[]>([]);
  const [stats, setStats] = useState({
    total_reports: 124,
    high_risk_reports: 38,
    blockchain_anchored: 89,
    total_loss_prevented: 18450000,
  });
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await reportsApi.list({ limit: 6 });
      if (res.data?.items) {
        setReports(res.data.items);
      }
      const statsRes = await publicApi.stats();
      if (statsRes.data) {
        setStats(prev => ({ ...prev, ...statsRes.data }));
      }
    } catch {
      // Fallback sample data for preview if backend is spinning up
      setReports([
        {
          id: 'REP-2026-081',
          title: 'Telegram Part-Time Task & UPI Fraud Ring',
          category: 'job_scam',
          scam_amount: 145000,
          risk_score: 94,
          risk_level: 'high',
          status: 'under_review',
          blockchain_tx_hash: '0x8f192b1a...43a1',
          created_at: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: 'REP-2026-080',
          title: 'Fake Electricity Bill APK Remote Access Phish',
          category: 'phishing',
          scam_amount: 82000,
          risk_score: 88,
          risk_level: 'high',
          status: 'substantiated',
          blockchain_tx_hash: '0x22ab88e1...78b4',
          created_at: new Date(Date.now() - 7200000).toISOString(),
        },
        {
          id: 'REP-2026-079',
          title: 'Guaranteed 200% Crypto Arbitrage Bot Portal',
          category: 'crypto_rugpull',
          scam_amount: 450000,
          risk_score: 79,
          risk_level: 'high',
          status: 'submitted',
          blockchain_tx_hash: null,
          created_at: new Date(Date.now() - 14400000).toISOString(),
        },
        {
          id: 'REP-2026-078',
          title: 'Customs Courier Parcel KYC Verification Call',
          category: 'impersonation',
          scam_amount: 35000,
          risk_score: 64,
          risk_level: 'medium',
          status: 'submitted',
          blockchain_tx_hash: '0x99dd124c...cc55',
          created_at: new Date(Date.now() - 28800000).toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Banner Greeting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-navy-900 via-navy-800 to-navy-900 border border-navy-700/60 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-100">
              Welcome back, {user?.display_name || 'Investigator'}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-shield-blue/20 text-shield-blue border border-shield-blue/30">
              {user?.role || 'analyst'}
            </span>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Real-time fraud surveillance, AI risk correlation, and immutable MST blockchain audit logs.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="p-2.5 rounded-lg bg-navy-800 hover:bg-navy-700 border border-navy-700 text-slate-400 hover:text-slate-200 transition-colors"
            title="Refresh Intelligence Data"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <Link
            to="/reports/new"
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-shield-blue to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium text-sm shadow-glow-blue transition-all"
          >
            <AlertTriangle size={16} />
            <span>Submit Fraud Report</span>
          </Link>
        </div>
      </div>

      {/* Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="card p-5 relative overflow-hidden group hover:border-shield-blue/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Reports</span>
            <div className="w-9 h-9 rounded-lg bg-shield-blue/15 text-shield-blue flex items-center justify-center">
              <FileCheck size={18} />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-100 mt-2">{stats.total_reports}</div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 mt-2 font-medium">
            <TrendingUp size={14} />
            <span>+14.2% from last week</span>
          </div>
          <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-shield-blue/5 rounded-full blur-xl group-hover:bg-shield-blue/10 transition-all" />
        </div>

        {/* Card 2 */}
        <div className="card p-5 relative overflow-hidden group hover:border-red-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Critical Threats</span>
            <div className="w-9 h-9 rounded-lg bg-red-500/15 text-red-400 flex items-center justify-center">
              <ShieldAlert size={18} />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-100 mt-2">{stats.high_risk_reports}</div>
          <div className="flex items-center gap-1.5 text-xs text-red-400 mt-2 font-medium">
            <Activity size={14} />
            <span>Requires urgent analyst triage</span>
          </div>
          <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-red-500/5 rounded-full blur-xl group-hover:bg-red-500/10 transition-all" />
        </div>

        {/* Card 3 */}
        <div className="card p-5 relative overflow-hidden group hover:border-shield-teal/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">On-Chain Anchored</span>
            <div className="w-9 h-9 rounded-lg bg-shield-teal/15 text-shield-teal flex items-center justify-center">
              <Blocks size={18} />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-100 mt-2">{stats.blockchain_anchored}</div>
          <div className="flex items-center gap-1.5 text-xs text-shield-teal mt-2 font-medium">
            <ShieldCheck size={14} />
            <span>Cryptographically verifiable</span>
          </div>
          <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-shield-teal/5 rounded-full blur-xl group-hover:bg-shield-teal/10 transition-all" />
        </div>

        {/* Card 4 */}
        <div className="card p-5 relative overflow-hidden group hover:border-purple-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Flagged Volume</span>
            <div className="w-9 h-9 rounded-lg bg-purple-500/15 text-purple-400 flex items-center justify-center">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-100 mt-2">
            {formatAmount(stats.total_loss_prevented)}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-purple-300 mt-2 font-medium">
            <CheckCircle2 size={14} />
            <span>Potential freeze requested</span>
          </div>
          <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-purple-500/5 rounded-full blur-xl group-hover:bg-purple-500/10 transition-all" />
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Threat Trend Area Chart */}
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-slate-100">Fraud Incident & Risk Inflow</h2>
              <p className="text-xs text-slate-400">7-day volume of incoming incidents vs high-severity flags</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-shield-blue" />
                <span className="text-slate-300">All Reports</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <span className="text-slate-300">High Risk</span>
              </div>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorReports" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorHigh" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  itemStyle={{ color: '#e2e8f0', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="reports" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorReports)" />
                <Area type="monotone" dataKey="highRisk" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorHigh)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Fraud Category Pie Chart */}
        <div className="card p-5">
          <h2 className="text-base font-semibold text-slate-100">Attack Vectors</h2>
          <p className="text-xs text-slate-400 mb-3">Dominant scam typologies detected</p>
          <div className="h-52 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  itemStyle={{ color: '#e2e8f0', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1.5 mt-2">
            {categoryData.map(c => (
              <div key={c.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                  <span className="text-slate-300">{c.name}</span>
                </div>
                <span className="font-semibold text-slate-200">{c.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent High-Priority Reports & Quick Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table of recent reports */}
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-slate-100">Live Investigation Feed</h2>
              <p className="text-xs text-slate-400">Recently reported scams awaiting review or action</p>
            </div>
            <Link
              to="/reports"
              className="text-xs text-shield-blue hover:text-blue-400 flex items-center gap-1 font-medium"
            >
              <span>View all reports</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-navy-700/60 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 pl-2">Case ID & Title</th>
                  <th className="pb-3">Scam Amount</th>
                  <th className="pb-3">Risk Index</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Blockchain</th>
                  <th className="pb-3 text-right pr-2">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-700/40">
                {reports.map((r) => (
                  <tr key={r.id} className="hover:bg-navy-700/30 transition-colors group">
                    <td className="py-3 pl-2">
                      <div className="font-medium text-slate-200 group-hover:text-shield-blue transition-colors">
                        {r.title}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">{r.id}</div>
                    </td>
                    <td className="py-3 font-mono text-slate-300">
                      {formatAmount(r.scam_amount)}
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold font-mono ${
                        r.risk_score >= 80 ? 'bg-red-950/60 text-red-400 border border-red-800/50' :
                        r.risk_score >= 50 ? 'bg-amber-950/60 text-amber-400 border border-amber-800/50' :
                        'bg-emerald-950/60 text-emerald-400 border border-emerald-800/50'
                      }`}>
                        {r.risk_score}/100
                      </span>
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-navy-700 text-slate-300 border border-navy-600">
                        {r.status?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3">
                      {r.blockchain_tx_hash ? (
                        <div className="flex items-center gap-1 text-[11px] text-shield-teal font-mono">
                          <CheckCircle2 size={13} />
                          <span>Anchored</span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-500 font-mono">Pending</span>
                      )}
                    </td>
                    <td className="py-3 text-right pr-2">
                      <Link
                        to={`/reports/${r.id}`}
                        className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-100 p-1 rounded hover:bg-navy-700 transition-colors"
                      >
                        <span>Details</span>
                        <ArrowUpRight size={14} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Fast Action Cards & Chain Status */}
        <div className="space-y-4">
          {/* Quick AI Risk Screener Box */}
          <div className="card p-5 border-l-4 border-l-shield-blue">
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <Search size={16} className="text-shield-blue" />
              <span>Instant Risk Screener</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Evaluate suspicious UPI IDs, URLs, or SMS phishing copy with AI heuristics.
            </p>
            <Link
              to="/analysis"
              className="mt-3 block w-full text-center py-2 px-3 rounded-lg bg-navy-700 hover:bg-navy-600 border border-navy-600 text-xs font-medium text-slate-200 hover:text-white transition-colors"
            >
              Open Risk Screener Engine →
            </Link>
          </div>

          {/* Network Graph Box */}
          <div className="card p-5 border-l-4 border-l-shield-teal">
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <Activity size={16} className="text-shield-teal" />
              <span>Scam Entity Graph</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Trace mule bank accounts, shared phone numbers, and syndicate clusters across reports.
            </p>
            <Link
              to="/graph"
              className="mt-3 block w-full text-center py-2 px-3 rounded-lg bg-navy-700 hover:bg-navy-600 border border-navy-600 text-xs font-medium text-slate-200 hover:text-white transition-colors"
            >
              Inspect Correlation Network →
            </Link>
          </div>

          {/* MST Blockchain Node Info */}
          <div className="card p-4 bg-navy-950/80 border border-navy-700/80">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-semibold uppercase tracking-wider text-slate-300">MST Ledger Status</span>
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Active Node
              </span>
            </div>
            <div className="space-y-1.5 text-[11px] font-mono text-slate-400">
              <div className="flex justify-between">
                <span>Network:</span>
                <span className="text-slate-200">MST Blockchain (Local/Testnet)</span>
              </div>
              <div className="flex justify-between">
                <span>Contract:</span>
                <span className="text-shield-blue">FraudShieldAudit.sol</span>
              </div>
              <div className="flex justify-between">
                <span>Consensus Proof:</span>
                <span className="text-slate-200">SHA-256 Merkle Commit</span>
              </div>
            </div>
            <Link
              to="/blockchain"
              className="mt-3 block text-center text-xs text-shield-teal hover:underline font-medium"
            >
              Open Blockchain Ledger Explorer
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
