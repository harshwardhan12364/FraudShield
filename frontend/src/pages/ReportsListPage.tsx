import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, Filter, Plus, FileText, CheckCircle2, Clock, AlertTriangle,
  ArrowUpDown, ExternalLink, RefreshCw
} from 'lucide-react';
import { reportsApi } from '../api/client';
import { formatAmount, formatDate, formatDateTime, riskBadgeClass, statusBadgeClass } from '../utils/helpers';

export default function ReportsListPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [riskFilter, setRiskFilter] = useState('');

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (search) params.search = search;
      if (categoryFilter) params.category = categoryFilter;
      if (statusFilter) params.status = statusFilter;
      if (riskFilter) params.risk_level = riskFilter;
      const res = await reportsApi.list(params);
      if (res.data?.items) {
        setReports(res.data.items);
      } else if (Array.isArray(res.data)) {
        setReports(res.data);
      }
    } catch {
      // Sample mock data for fallback
      setReports([
        {
          id: 'REP-2026-081',
          title: 'Telegram Part-Time Task & UPI Fraud Ring',
          category: 'job_scam',
          scam_amount: 145000,
          risk_score: 94,
          risk_level: 'high',
          status: 'under_review',
          blockchain_tx_hash: '0x8f192b1a56c7d8e90123456789abcdef0123456789abcdef0123456789abcdef',
          created_at: new Date(Date.now() - 3600000).toISOString(),
          suspect_upi: 'taskbonus99@ybl',
          suspect_phone: '+919876543210'
        },
        {
          id: 'REP-2026-080',
          title: 'Fake Electricity Bill APK Remote Access Phish',
          category: 'phishing',
          scam_amount: 82000,
          risk_score: 88,
          risk_level: 'high',
          status: 'substantiated',
          blockchain_tx_hash: '0x22ab88e156c7d8e90123456789abcdef0123456789abcdef0123456789abcdef',
          created_at: new Date(Date.now() - 7200000).toISOString(),
          suspect_url: 'https://power-bill-update-quick.xyz',
          suspect_phone: '+918765432109'
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
          suspect_wallet: '0x71C...b8F9'
        },
        {
          id: 'REP-2026-078',
          title: 'Customs Courier Parcel KYC Verification Call',
          category: 'impersonation',
          scam_amount: 35000,
          risk_score: 64,
          risk_level: 'medium',
          status: 'submitted',
          blockchain_tx_hash: '0x99dd124c56c7d8e90123456789abcdef0123456789abcdef0123456789abcdef',
          created_at: new Date(Date.now() - 28800000).toISOString(),
          suspect_phone: '+919123456780'
        },
        {
          id: 'REP-2026-077',
          title: 'Fake Loan App Contact Harassment Syndicate',
          category: 'loan_fraud',
          scam_amount: 50000,
          risk_score: 82,
          risk_level: 'high',
          status: 'substantiated',
          blockchain_tx_hash: '0xfa3910c256c7d8e90123456789abcdef0123456789abcdef0123456789abcdef',
          created_at: new Date(Date.now() - 43200000).toISOString(),
          suspect_upi: 'instantcash7@okaxis'
        },
        {
          id: 'REP-2026-076',
          title: 'Suspicious E-Commerce Lucky Wheel Lottery SMS',
          category: 'phishing',
          scam_amount: 4999,
          risk_score: 41,
          risk_level: 'low',
          status: 'closed',
          blockchain_tx_hash: '0x12c49a0056c7d8e90123456789abcdef0123456789abcdef0123456789abcdef',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          suspect_url: 'http://win-suv-car.info'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [categoryFilter, statusFilter, riskFilter]);

  const filteredReports = reports.filter(r => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      r.id?.toLowerCase().includes(q) ||
      r.title?.toLowerCase().includes(q) ||
      r.category?.toLowerCase().includes(q) ||
      r.suspect_upi?.toLowerCase().includes(q) ||
      r.suspect_phone?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Fraud Case Intelligence</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Directory of reported incidents, automated AI scores, and cryptographic blockchain registrations.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchReports}
            className="p-2 rounded-lg bg-navy-800 hover:bg-navy-700 border border-navy-700 text-slate-400 hover:text-slate-200 transition-colors"
            title="Refresh"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <Link
            to="/reports/new"
            className="flex items-center gap-2 px-4 py-2 bg-shield-blue hover:bg-blue-500 text-white rounded-lg font-medium text-sm shadow-glow-blue transition-all"
          >
            <Plus size={16} />
            <span>Submit Report</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card p-4 flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2 bg-navy-900 border border-navy-700 rounded-lg text-slate-200 text-sm focus:border-shield-blue outline-none"
            placeholder="Search by Case ID, Title, UPI ID, Phone, or URL..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Category Filter */}
        <select
          className="px-3 py-2 bg-navy-900 border border-navy-700 rounded-lg text-slate-200 text-sm focus:border-shield-blue outline-none"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="">All Categories</option>
          <option value="job_scam">Job / Task Scam</option>
          <option value="phishing">Phishing / Malicious APK</option>
          <option value="crypto_rugpull">Crypto Rugpull / Bot</option>
          <option value="impersonation">Authority Impersonation</option>
          <option value="loan_fraud">Instant Loan Extortion</option>
        </select>

        {/* Status Filter */}
        <select
          className="px-3 py-2 bg-navy-900 border border-navy-700 rounded-lg text-slate-200 text-sm focus:border-shield-blue outline-none"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="submitted">Submitted</option>
          <option value="under_review">Under Review</option>
          <option value="substantiated">Substantiated</option>
          <option value="disputed">Disputed</option>
          <option value="closed">Closed</option>
        </select>

        {/* Risk Level Filter */}
        <select
          className="px-3 py-2 bg-navy-900 border border-navy-700 rounded-lg text-slate-200 text-sm focus:border-shield-blue outline-none"
          value={riskFilter}
          onChange={(e) => setRiskFilter(e.target.value)}
        >
          <option value="">All Risk Levels</option>
          <option value="high">High Risk (75-100)</option>
          <option value="medium">Medium Risk (40-74)</option>
          <option value="low">Low Risk (0-39)</option>
        </select>
      </div>

      {/* Reports Table Card */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-navy-950/70 border-b border-navy-700/60 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">Case ID</th>
                <th className="py-3.5 px-4">Incident Title & Suspect</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Loss Amount</th>
                <th className="py-3.5 px-4">AI Risk Score</th>
                <th className="py-3.5 px-4">Case Status</th>
                <th className="py-3.5 px-4">Blockchain Ledger</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-700/40">
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <FileText size={36} className="mx-auto mb-2 opacity-40" />
                    <p className="text-sm">No fraud reports match the selected criteria.</p>
                  </td>
                </tr>
              ) : (
                filteredReports.map((r) => (
                  <tr key={r.id} className="hover:bg-navy-700/25 transition-colors group">
                    <td className="py-4 px-4 font-mono text-xs font-bold text-shield-blue">
                      <Link to={`/reports/${r.id}`} className="hover:underline">
                        {r.id}
                      </Link>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-semibold text-slate-100 group-hover:text-shield-blue transition-colors">
                        {r.title}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                        {r.suspect_upi && <span>UPI: <span className="font-mono text-slate-300">{r.suspect_upi}</span></span>}
                        {r.suspect_phone && <span>Phone: <span className="font-mono text-slate-300">{r.suspect_phone}</span></span>}
                        {r.suspect_wallet && <span>Wallet: <span className="font-mono text-slate-300">{r.suspect_wallet}</span></span>}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-2.5 py-1 rounded bg-navy-900 border border-navy-700 text-xs text-slate-300">
                        {r.category?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-mono font-medium text-slate-200">
                      {formatAmount(r.scam_amount)}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded font-mono text-xs font-bold ${
                          r.risk_score >= 75 ? 'bg-red-950/80 text-red-400 border border-red-800' :
                          r.risk_score >= 40 ? 'bg-amber-950/80 text-amber-400 border border-amber-800' :
                          'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                        }`}>
                          {r.risk_score || 0} / 100
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-navy-700/80 text-slate-300 border border-navy-600">
                        {r.status?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      {r.blockchain_tx_hash ? (
                        <div className="flex items-center gap-1.5 text-xs text-shield-teal font-mono">
                          <CheckCircle2 size={14} className="text-shield-teal flex-shrink-0" />
                          <span title={r.blockchain_tx_hash}>
                            {r.blockchain_tx_hash.slice(0, 10)}...
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500 font-mono">Unregistered</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Link
                        to={`/reports/${r.id}`}
                        className="px-3 py-1.5 rounded-lg bg-navy-700 hover:bg-navy-600 text-slate-200 hover:text-white text-xs font-medium transition-colors"
                      >
                        Inspect
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
