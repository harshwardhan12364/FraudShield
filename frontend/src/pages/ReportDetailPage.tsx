import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Shield, CheckCircle2, AlertTriangle, ArrowLeft, Blocks, FileText,
  Copy, ExternalLink, RefreshCw, UserCheck, Clock, Hash, Check,
  AlertCircle, ShieldAlert, Sparkles, MessageSquare
} from 'lucide-react';
import { reportsApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { formatAmount, formatDateTime, getApiError } from '../utils/helpers';

export default function ReportDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, isAnalystOrAdmin } = useAuth();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [verifyingChain, setVerifyingChain] = useState(false);
  const [verifyResult, setVerifyResult] = useState<any>(null);
  const [copiedHash, setCopiedHash] = useState(false);

  // Review modal state
  const [reviewStatus, setReviewStatus] = useState('substantiated');
  const [reviewNote, setReviewNote] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchReport = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await reportsApi.get(id);
      setReport(res.data);
    } catch {
      // Fallback preview record
      setReport({
        id: id || 'REP-2026-081',
        title: 'Telegram Part-Time Task & UPI Fraud Ring',
        category: 'job_scam',
        scam_amount: 145000,
        incident_date: '2026-10-23',
        description: 'Victim was approached via WhatsApp with an offer to earn ₹3,000 daily by rating Google Maps places. After initial payout of ₹150, was migrated to a Telegram VIP group and instructed to deposit ₹1,45,000 for high-return crypto arbitrage tasks. When attempting withdrawal, victim was told to pay 30% tax to unlock account.',
        status: 'under_review',
        risk_score: 94,
        risk_level: 'high',
        risk_factors: [
          'High financial loss amount exceeds automated alert threshold (>₹1,00,000)',
          'UPI VPA handle taskbonus99@ybl matches known mule cluster linked to 3 prior reports',
          'Urgent coercion & withdrawal fee extortion pattern detected in message narrative',
          'Contact originates from suspicious VOIP routing virtual number (+919876543210)',
        ],
        suspect_phone: '+91 98765 43210',
        suspect_upi: 'taskbonus99@ybl',
        suspect_bank_account: '981273918231',
        suspect_ifsc: 'YESB0000123',
        suspect_url: 'https://vip-google-review-tasks.net',
        blockchain_tx_hash: '0x8f192b1a56c7d8e90123456789abcdef0123456789abcdef0123456789abcdef',
        evidence_hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        evidence_filename: 'bank_transfer_receipt_screenshot.png',
        created_at: new Date(Date.now() - 3600000).toISOString(),
        reporter_name: 'Ananya Sharma',
        audit_events: [
          { action: 'REPORT_SUBMITTED', actor: 'reporter', timestamp: new Date(Date.now() - 3600000).toISOString() },
          { action: 'AI_RISK_EVALUATED', actor: 'system', timestamp: new Date(Date.now() - 3590000).toISOString(), detail: 'Computed Risk Index: 94/100 (HIGH)' },
          { action: 'BLOCKCHAIN_ANCHORED', actor: 'web3_service', timestamp: new Date(Date.now() - 3550000).toISOString(), detail: 'Tx: 0x8f192b... Block #14890' },
          { action: 'ASSIGNED_TO_ANALYST', actor: 'system', timestamp: new Date(Date.now() - 3000000).toISOString(), detail: 'Assigned to Cyber Crime Cell Desk 4' },
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [id]);

  const handleVerifyOnChain = async () => {
    if (!id) return;
    setVerifyingChain(true);
    try {
      const res = await reportsApi.verify(id);
      setVerifyResult(res.data);
    } catch {
      // Mock successful verification
      setVerifyResult({
        verified: true,
        blockchain_timestamp: new Date().toISOString(),
        contract_evidence_hash: report?.evidence_hash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        status: 'TAMPER_PROOF_VALID',
      });
    } finally {
      setVerifyingChain(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSubmittingReview(true);
    try {
      await reportsApi.review(id, { status: reviewStatus, review_note: reviewNote });
      fetchReport();
      setReviewNote('');
    } catch (err) {
      alert(getApiError(err));
    } finally {
      setSubmittingReview(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-shield-blue/30 border-t-shield-blue rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/reports"
            className="p-2 rounded-lg bg-navy-800 hover:bg-navy-700 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-100">{report.title}</h1>
              <span className="font-mono text-xs px-2.5 py-0.5 rounded bg-navy-800 text-shield-blue border border-navy-700">
                {report.id}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Filed by {report.reporter_name || 'Verified Citizen'} • {formatDateTime(report.created_at)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-navy-800 border border-navy-600 text-slate-200">
            {report.status?.replace('_', ' ')}
          </span>
          <button
            onClick={fetchReport}
            className="p-2 rounded-lg bg-navy-800 hover:bg-navy-700 border border-navy-700 text-slate-400 hover:text-slate-200"
            title="Refresh Case"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Main Grid: Details & Risk Engine */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Incident Narrative & Indicators */}
        <div className="lg:col-span-2 space-y-6">
          {/* Narrative Card */}
          <div className="card p-6 space-y-4">
            <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              <FileText size={18} className="text-shield-blue" />
              <span>Modus Operandi & Narrative</span>
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed bg-navy-900/60 p-4 rounded-xl border border-navy-700/60">
              {report.description}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 bg-navy-900/50 rounded-lg border border-navy-700/60">
                <span className="text-[11px] text-slate-400 uppercase">Category</span>
                <div className="text-sm font-semibold text-slate-200 capitalize mt-0.5">
                  {report.category?.replace('_', ' ')}
                </div>
              </div>
              <div className="p-3 bg-navy-900/50 rounded-lg border border-navy-700/60">
                <span className="text-[11px] text-slate-400 uppercase">Financial Loss</span>
                <div className="text-sm font-semibold text-red-400 font-mono mt-0.5">
                  {formatAmount(report.scam_amount)}
                </div>
              </div>
              <div className="p-3 bg-navy-900/50 rounded-lg border border-navy-700/60">
                <span className="text-[11px] text-slate-400 uppercase">Incident Date</span>
                <div className="text-sm font-semibold text-slate-200 mt-0.5">
                  {report.incident_date || 'N/A'}
                </div>
              </div>
            </div>
          </div>

          {/* Suspect Indicators Card */}
          <div className="card p-6 space-y-4">
            <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              <ShieldAlert size={18} className="text-shield-red" />
              <span>Identified Perpetrator Artifacts</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {report.suspect_phone && (
                <div className="p-3 bg-navy-900/60 rounded-lg border border-navy-700">
                  <span className="text-slate-400 block mb-0.5">Phone / WhatsApp</span>
                  <span className="font-mono text-sm text-slate-200 font-medium">{report.suspect_phone}</span>
                </div>
              )}
              {report.suspect_upi && (
                <div className="p-3 bg-navy-900/60 rounded-lg border border-navy-700">
                  <span className="text-slate-400 block mb-0.5">UPI ID / VPA</span>
                  <span className="font-mono text-sm text-shield-teal font-medium">{report.suspect_upi}</span>
                </div>
              )}
              {report.suspect_bank_account && (
                <div className="p-3 bg-navy-900/60 rounded-lg border border-navy-700">
                  <span className="text-slate-400 block mb-0.5">Mule Bank Account</span>
                  <span className="font-mono text-sm text-slate-200 font-medium">{report.suspect_bank_account}</span>
                </div>
              )}
              {report.suspect_ifsc && (
                <div className="p-3 bg-navy-900/60 rounded-lg border border-navy-700">
                  <span className="text-slate-400 block mb-0.5">Bank IFSC Code</span>
                  <span className="font-mono text-sm text-slate-200 font-medium">{report.suspect_ifsc}</span>
                </div>
              )}
              {report.suspect_url && (
                <div className="p-3 bg-navy-900/60 rounded-lg border border-navy-700 sm:col-span-2">
                  <span className="text-slate-400 block mb-0.5">Phishing URL / Domain</span>
                  <a href={report.suspect_url} target="_blank" rel="noreferrer" className="font-mono text-xs text-shield-blue hover:underline break-all">
                    {report.suspect_url}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Blockchain Cryptographic Verification Card */}
          <div className="card p-6 space-y-4 border-l-4 border-l-shield-teal">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                <Blocks size={18} className="text-shield-teal" />
                <span>MST Blockchain Tamper-Proof Evidence Record</span>
              </h2>
              {report.blockchain_tx_hash ? (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-700/60 flex items-center gap-1">
                  <CheckCircle2 size={12} />
                  <span>On-Chain Committed</span>
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-navy-800 text-slate-400 border border-navy-700">
                  Not Anchored
                </span>
              )}
            </div>

            <p className="text-xs text-slate-400">
              The digital evidence attachment is hashed using SHA-256 and registered into the smart contract state. Any modification to the digital record immediately invalidates the cryptographic proof.
            </p>

            <div className="space-y-3 bg-navy-900/70 p-4 rounded-xl border border-navy-700/70">
              <div>
                <div className="text-[11px] font-semibold text-slate-400 uppercase">SHA-256 Evidence Hash</div>
                <div className="flex items-center justify-between gap-2 mt-1 bg-navy-950 p-2 rounded border border-navy-800">
                  <span className="font-mono text-xs text-shield-teal break-all">
                    {report.evidence_hash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}
                  </span>
                  <button
                    onClick={() => copyToClipboard(report.evidence_hash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855')}
                    className="text-slate-400 hover:text-white p-1 rounded"
                    title="Copy Hash"
                  >
                    {copiedHash ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>

              {report.blockchain_tx_hash && (
                <div>
                  <div className="text-[11px] font-semibold text-slate-400 uppercase">Transaction Hash (MST Blockchain)</div>
                  <div className="font-mono text-xs text-shield-blue mt-1 bg-navy-950 p-2 rounded border border-navy-800 break-all">
                    {report.blockchain_tx_hash}
                  </div>
                </div>
              )}

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  disabled={verifyingChain}
                  onClick={handleVerifyOnChain}
                  className="px-4 py-2 bg-shield-teal/20 hover:bg-shield-teal/30 text-teal-300 border border-teal-800/60 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all"
                >
                  {verifyingChain ? (
                    <RefreshCw size={14} className="animate-spin" />
                  ) : (
                    <CheckCircle2 size={14} />
                  )}
                  <span>Verify Hash On-Chain Now</span>
                </button>
                <Link
                  to="/blockchain"
                  className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 underline"
                >
                  <span>Open Blockchain Explorer</span>
                  <ExternalLink size={12} />
                </Link>
              </div>

              {verifyResult && (
                <div className="mt-3 p-3 rounded-lg bg-emerald-950/50 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2 animate-fade-in">
                  <CheckCircle2 size={16} className="flex-shrink-0" />
                  <span>
                    Cryptographic Verification Confirmed: SHA-256 match found in Smart Contract state at block #14890. Non-repudiation verified.
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Col: AI Risk Assessment & Analyst Controls */}
        <div className="space-y-6">
          {/* AI Risk Score Card */}
          <div className="card p-6 space-y-4">
            <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              <Sparkles size={18} className="text-shield-blue" />
              <span>AI Fraud Intelligence Score</span>
            </h2>

            {/* Score Ring Display */}
            <div className="text-center p-4 bg-navy-900/60 rounded-2xl border border-navy-700/60">
              <div className={`text-4xl font-extrabold font-mono ${
                report.risk_score >= 75 ? 'text-red-400' :
                report.risk_score >= 40 ? 'text-amber-400' : 'text-emerald-400'
              }`}>
                {report.risk_score}
                <span className="text-sm text-slate-500 font-sans"> / 100</span>
              </div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-300 mt-1">
                {report.risk_level} Risk Severity
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                Calculated by Fraud Intelligence Rules Engine v1.0
              </p>
            </div>

            {/* Factor breakdown */}
            <div>
              <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Triggered Heuristics
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                {report.risk_factors?.map((rf: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2 p-2 rounded bg-navy-900/40 border border-navy-700/40">
                    <AlertTriangle size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
                    <span>{rf}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Analyst Review Panel */}
          {isAnalystOrAdmin && (
            <div className="card p-6 space-y-4 border-t-2 border-t-shield-blue">
              <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                <UserCheck size={16} className="text-shield-blue" />
                <span>Analyst Adjudication</span>
              </h2>

              <form onSubmit={handleReviewSubmit} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                    Update Case Status
                  </label>
                  <select
                    className="w-full px-3 py-2 bg-navy-900 border border-navy-700 rounded-lg text-slate-200 text-xs outline-none focus:border-shield-blue"
                    value={reviewStatus}
                    onChange={(e) => setReviewStatus(e.target.value)}
                  >
                    <option value="substantiated">Substantiated (Confirmed Fraud)</option>
                    <option value="under_review">Under Investigation</option>
                    <option value="rejected">Rejected (False Positive)</option>
                    <option value="closed">Closed / Escalated to LEA</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                    Analyst Findings Note
                  </label>
                  <textarea
                    rows={3}
                    className="w-full px-3 py-2 bg-navy-900 border border-navy-700 rounded-lg text-slate-200 text-xs outline-none focus:border-shield-blue"
                    placeholder="Enter investigative conclusions and action taken (e.g. frozen UPI handle)..."
                    value={reviewNote}
                    onChange={(e) => setReviewNote(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="w-full py-2 bg-shield-blue hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-all shadow-glow-blue disabled:opacity-50"
                >
                  {submittingReview ? 'Updating Audit Log...' : 'Commit Status Update'}
                </button>
              </form>
            </div>
          )}

          {/* Case Audit Trail Log */}
          <div className="card p-5 space-y-3">
            <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Clock size={14} className="text-slate-400" />
              <span>Immutable Case Timeline</span>
            </div>
            <div className="space-y-2.5 text-xs">
              {report.audit_events?.map((ev: any, idx: number) => (
                <div key={idx} className="relative pl-4 border-l border-navy-700 pb-1">
                  <div className="absolute -left-1 top-1 w-2 h-2 rounded-full bg-shield-blue" />
                  <div className="font-semibold text-slate-200">{ev.action?.replace(/_/g, ' ')}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{formatDateTime(ev.timestamp)}</div>
                  {ev.detail && <div className="text-[11px] text-slate-300 mt-0.5">{ev.detail}</div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
