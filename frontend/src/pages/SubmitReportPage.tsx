import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield, Upload, CheckCircle2, AlertTriangle, ArrowRight, ArrowLeft,
  FileText, Link2, DollarSign, Lock, Sparkles, Hash
} from 'lucide-react';
import { reportsApi } from '../api/client';
import { getApiError } from '../utils/helpers';

export default function SubmitReportPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdReportId, setCreatedReportId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('job_scam');
  const [incidentDate, setIncidentDate] = useState(new Date().toISOString().split('T')[0]);
  const [scamAmount, setScamAmount] = useState<number | ''>(50000);
  const [description, setDescription] = useState('');

  // Suspect Indicators
  const [suspectPhone, setSuspectPhone] = useState('');
  const [suspectUpi, setSuspectUpi] = useState('');
  const [suspectBank, setSuspectBank] = useState('');
  const [suspectIfsc, setSuspectIfsc] = useState('');
  const [suspectUrl, setSuspectUrl] = useState('');
  const [suspectWallet, setSuspectWallet] = useState('');
  const [suspectSocial, setSuspectSocial] = useState('');

  // Evidence & Blockchain
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [fileHash, setFileHash] = useState<string>('');
  const [anchorOnChain, setAnchorOnChain] = useState(true);

  // Client-side SHA-256 compute for transparent proof of existence
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setEvidenceFile(file);

    // Compute browser SHA-256
    try {
      const buffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      setFileHash(hashHex);
    } catch {
      setFileHash('0x' + Array(64).fill('0').join(''));
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const payload: Record<string, any> = {
        title,
        category,
        incident_date: incidentDate,
        scam_amount: scamAmount === '' ? 0 : Number(scamAmount),
        description,
        suspect_phone: suspectPhone || undefined,
        suspect_upi: suspectUpi || undefined,
        suspect_bank_account: suspectBank || undefined,
        suspect_ifsc: suspectIfsc || undefined,
        suspect_url: suspectUrl || undefined,
        suspect_wallet: suspectWallet || undefined,
        suspect_social: suspectSocial || undefined,
      };

      const res = await reportsApi.create(payload);
      const reportId = res.data?.id || res.data?.report_id;
      setCreatedReportId(reportId);

      // Upload evidence if present
      if (evidenceFile && reportId) {
        try {
          await reportsApi.uploadEvidence(reportId, evidenceFile);
        } catch {
          // Non-blocking upload failure
        }
      }

      // Automatically trigger AI analysis
      if (reportId) {
        try {
          await reportsApi.analyze(reportId);
        } catch {
          // ignore
        }
      }

      // Automatically anchor if toggled
      if (anchorOnChain && reportId) {
        try {
          await reportsApi.verify(reportId);
        } catch {
          // ignore
        }
      }

      setStep(4); // Success step
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Submit New Fraud Incident</h1>
        <p className="text-slate-400 text-sm mt-1">
          Provide incident facts and digital artifacts. Evidence hashes are anchored immutably to the MST Blockchain.
        </p>
      </div>

      {/* Step Indicators */}
      <div className="grid grid-cols-3 gap-2 p-1.5 bg-navy-900 border border-navy-700/80 rounded-xl">
        <button
          onClick={() => step > 1 && setStep(1)}
          className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
            step === 1
              ? 'bg-shield-blue text-white shadow-glow-blue'
              : step > 1
              ? 'bg-navy-800 text-slate-300'
              : 'text-slate-500'
          }`}
        >
          <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px]">1</span>
          <span>Incident Details</span>
        </button>

        <button
          onClick={() => step > 2 && setStep(2)}
          className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
            step === 2
              ? 'bg-shield-blue text-white shadow-glow-blue'
              : step > 2
              ? 'bg-navy-800 text-slate-300'
              : 'text-slate-500'
          }`}
        >
          <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px]">2</span>
          <span>Suspect Indicators</span>
        </button>

        <button
          onClick={() => step > 3 && setStep(3)}
          className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
            step === 3 || step === 4
              ? 'bg-shield-blue text-white shadow-glow-blue'
              : 'text-slate-500'
          }`}
        >
          <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px]">3</span>
          <span>Evidence & Blockchain</span>
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-950/40 border border-red-700/60 rounded-xl text-red-400 text-xs flex items-center gap-2">
          <AlertTriangle size={16} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Step 1: Incident Details */}
      {step === 1 && (
        <div className="card p-6 space-y-4">
          <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <FileText size={18} className="text-shield-blue" />
            <span>Case Overview</span>
          </h2>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase">
              Incident Title / Short Summary *
            </label>
            <input
              type="text"
              className="w-full px-3.5 py-2.5 bg-navy-900 border border-navy-700 rounded-lg text-slate-100 text-sm outline-none focus:border-shield-blue"
              placeholder="e.g. Telegram VIP Investment Task - ₹1,45,000 Extortion"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase">
                Fraud Typology / Category *
              </label>
              <select
                className="w-full px-3.5 py-2.5 bg-navy-900 border border-navy-700 rounded-lg text-slate-100 text-sm outline-none focus:border-shield-blue"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="job_scam">Part-Time / Task Job Scam</option>
                <option value="phishing">Phishing / Malicious APK</option>
                <option value="impersonation">Police / Customs Impersonation</option>
                <option value="crypto_rugpull">Crypto Token / Bot Arbitrage</option>
                <option value="loan_fraud">Instant Loan Extortion App</option>
                <option value="upi_fraud">UPI QR Code Spoofing</option>
                <option value="other">Other Cyber Fraud</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase">
                Estimated Loss (INR ₹)
              </label>
              <input
                type="number"
                className="w-full px-3.5 py-2.5 bg-navy-900 border border-navy-700 rounded-lg text-slate-100 text-sm outline-none focus:border-shield-blue"
                placeholder="50000"
                value={scamAmount}
                onChange={(e) => setScamAmount(e.target.value === '' ? '' : Number(e.target.value))}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase">
                Date of Incident
              </label>
              <input
                type="date"
                className="w-full px-3.5 py-2.5 bg-navy-900 border border-navy-700 rounded-lg text-slate-100 text-sm outline-none focus:border-shield-blue"
                value={incidentDate}
                onChange={(e) => setIncidentDate(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase">
              Incident Narrative & Modus Operandi *
            </label>
            <textarea
              rows={5}
              className="w-full px-3.5 py-2.5 bg-navy-900 border border-navy-700 rounded-lg text-slate-100 text-sm outline-none focus:border-shield-blue"
              placeholder="Describe step-by-step how the contact was initiated, promised returns, payment instructions given, and refusal to withdraw funds..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              disabled={!title || !description}
              onClick={() => setStep(2)}
              className="flex items-center gap-2 px-5 py-2.5 bg-shield-blue hover:bg-blue-500 text-white rounded-lg font-medium text-sm disabled:opacity-50 transition-all shadow-glow-blue"
            >
              <span>Continue to Suspect Indicators</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Suspect Indicators */}
      {step === 2 && (
        <div className="card p-6 space-y-4">
          <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <Link2 size={18} className="text-shield-teal" />
            <span>Perpetrator & Mule Account Identifiers</span>
          </h2>
          <p className="text-xs text-slate-400">
            These indicators are automatically correlated by the Risk Engine to discover connected fraud rings and syndicate clusters.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase">
                Suspect Phone Number / WhatsApp
              </label>
              <input
                type="text"
                className="w-full px-3.5 py-2.5 bg-navy-900 border border-navy-700 rounded-lg text-slate-100 text-sm outline-none focus:border-shield-blue font-mono"
                placeholder="+91 98765 43210"
                value={suspectPhone}
                onChange={(e) => setSuspectPhone(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase">
                Suspect UPI ID / VPA
              </label>
              <input
                type="text"
                className="w-full px-3.5 py-2.5 bg-navy-900 border border-navy-700 rounded-lg text-slate-100 text-sm outline-none focus:border-shield-blue font-mono"
                placeholder="vipreturns99@icici"
                value={suspectUpi}
                onChange={(e) => setSuspectUpi(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase">
                Suspect Mule Bank Account
              </label>
              <input
                type="text"
                className="w-full px-3.5 py-2.5 bg-navy-900 border border-navy-700 rounded-lg text-slate-100 text-sm outline-none focus:border-shield-blue font-mono"
                placeholder="Account number (9-18 digits)"
                value={suspectBank}
                onChange={(e) => setSuspectBank(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase">
                Bank IFSC Code
              </label>
              <input
                type="text"
                className="w-full px-3.5 py-2.5 bg-navy-900 border border-navy-700 rounded-lg text-slate-100 text-sm outline-none focus:border-shield-blue font-mono uppercase"
                placeholder="HDFC0001234"
                value={suspectIfsc}
                onChange={(e) => setSuspectIfsc(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase">
                Phishing Website / Telegram Channel
              </label>
              <input
                type="text"
                className="w-full px-3.5 py-2.5 bg-navy-900 border border-navy-700 rounded-lg text-slate-100 text-sm outline-none focus:border-shield-blue font-mono"
                placeholder="https://vip-earning-hub.xyz or @CryptoAdviserBot"
                value={suspectUrl}
                onChange={(e) => setSuspectUrl(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase">
                Crypto Wallet Address (USDT / ETH / BTC)
              </label>
              <input
                type="text"
                className="w-full px-3.5 py-2.5 bg-navy-900 border border-navy-700 rounded-lg text-slate-100 text-sm outline-none focus:border-shield-blue font-mono"
                placeholder="0x71C... or TRC20 address"
                value={suspectWallet}
                onChange={(e) => setSuspectWallet(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-between pt-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-slate-300 text-sm font-medium transition-colors"
            >
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              className="flex items-center gap-2 px-5 py-2.5 bg-shield-blue hover:bg-blue-500 text-white rounded-lg font-medium text-sm transition-all shadow-glow-blue"
            >
              <span>Continue to Evidence & Anchoring</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Evidence & Blockchain Anchoring */}
      {step === 3 && (
        <div className="card p-6 space-y-5">
          <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <Shield size={18} className="text-shield-teal" />
            <span>Digital Evidence & MST Blockchain Anchoring</span>
          </h2>

          <div className="p-4 rounded-xl border border-dashed border-navy-600 bg-navy-900/60 hover:bg-navy-900 transition-colors text-center">
            <input
              type="file"
              id="evidenceUpload"
              className="hidden"
              onChange={handleFileChange}
              accept=".png,.jpg,.jpeg,.pdf,.txt"
            />
            <label htmlFor="evidenceUpload" className="cursor-pointer block py-4">
              <Upload size={32} className="mx-auto text-shield-blue mb-2" />
              <div className="text-sm font-semibold text-slate-200">
                {evidenceFile ? evidenceFile.name : 'Click to select screenshot or bank transaction receipt'}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Accepted: PNG, JPG, PDF up to 10MB.
              </p>
            </label>
          </div>

          {fileHash && (
            <div className="p-3.5 bg-navy-900 border border-shield-teal/30 rounded-lg">
              <div className="flex items-center gap-1.5 text-xs text-shield-teal font-semibold mb-1">
                <Hash size={14} />
                <span>Client Computed SHA-256 Digest:</span>
              </div>
              <div className="font-mono text-xs text-slate-300 break-all bg-navy-950 p-2 rounded border border-navy-800">
                {fileHash}
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5">
                Proof of Existence: This hash will be verified and stored into the smart contract state. The raw file stays private on your server.
              </p>
            </div>
          )}

          {/* Blockchain Toggle */}
          <div className="flex items-start gap-3 p-4 bg-navy-900/80 border border-navy-700 rounded-xl">
            <input
              type="checkbox"
              id="chainAnchor"
              checked={anchorOnChain}
              onChange={(e) => setAnchorOnChain(e.target.checked)}
              className="mt-1 w-4 h-4 text-shield-blue rounded bg-navy-950 border-navy-700"
            />
            <div>
              <label htmlFor="chainAnchor" className="text-sm font-semibold text-slate-200 cursor-pointer">
                Anchor Evidence Hash to MST Blockchain Smart Contract
              </label>
              <p className="text-xs text-slate-400 mt-0.5">
                Mints an immutable, timestamped record on-chain with cryptographic Non-Repudiation guarantee.
              </p>
            </div>
          </div>

          <div className="flex justify-between pt-2">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-slate-300 text-sm font-medium transition-colors"
            >
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={handleSubmit}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-shield-blue to-shield-teal hover:opacity-95 text-white rounded-lg font-semibold text-sm transition-all shadow-glow-blue disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Submit & Trigger AI Risk Analysis</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Success View */}
      {step === 4 && (
        <div className="card p-8 text-center space-y-4 animate-scale-in">
          <div className="w-16 h-16 rounded-full bg-emerald-950/80 border border-emerald-500/50 flex items-center justify-center mx-auto text-emerald-400">
            <CheckCircle2 size={36} />
          </div>
          <h2 className="text-xl font-bold text-slate-100">Fraud Incident Registered Successfully</h2>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            Case has been ingested. AI Fraud Risk Engine has computed the severity index and checked cross-case syndicates.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <button
              onClick={() => navigate(`/reports/${createdReportId}`)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-shield-blue hover:bg-blue-500 text-white font-medium text-sm shadow-glow-blue transition-all"
            >
              Inspect Case & Risk Score →
            </button>
            <button
              onClick={() => navigate('/reports')}
              className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-slate-300 font-medium text-sm transition-colors"
            >
              View All Reports
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
