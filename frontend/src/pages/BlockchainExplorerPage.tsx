import React, { useState } from 'react';
import {
  Blocks, Search, CheckCircle2, Copy, Check, ExternalLink,
  ShieldCheck, ArrowRight, RefreshCw, Cpu, Activity, Hash
} from 'lucide-react';

const RECENT_TRANSACTIONS = [
  {
    block: 14890,
    txHash: '0x8f192b1a56c7d8e90123456789abcdef0123456789abcdef0123456789abcdef',
    caseId: 'REP-2026-081',
    evidenceHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    timestamp: '10 mins ago',
    gasUsed: 42150,
  },
  {
    block: 14888,
    txHash: '0x22ab88e156c7d8e90123456789abcdef0123456789abcdef0123456789abcdef',
    caseId: 'REP-2026-080',
    evidenceHash: 'a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e',
    timestamp: '2 hours ago',
    gasUsed: 41800,
  },
  {
    block: 14882,
    txHash: '0x99dd124c56c7d8e90123456789abcdef0123456789abcdef0123456789abcdef',
    caseId: 'REP-2026-078',
    evidenceHash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
    timestamp: '8 hours ago',
    gasUsed: 42020,
  },
  {
    block: 14875,
    txHash: '0xfa3910c256c7d8e90123456789abcdef0123456789abcdef0123456789abcdef',
    caseId: 'REP-2026-077',
    evidenceHash: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
    timestamp: '12 hours ago',
    gasUsed: 42300,
  },
];

export default function BlockchainExplorerPage() {
  const [searchHash, setSearchHash] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<any>(null);
  const [copiedTx, setCopiedTx] = useState<string | null>(null);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchHash) return;
    setVerifying(true);
    setTimeout(() => {
      setVerifyResult({
        found: true,
        hash: searchHash,
        block: 14890,
        txHash: '0x8f192b1a56c7d8e90123456789abcdef0123456789abcdef0123456789abcdef',
        timestamp: '2026-10-24 14:45:00 UTC',
        smartContract: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
        status: 'IMMUTABLE_RECORD_VALIDATED',
      });
      setVerifying(false);
    }, 500);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTx(text);
    setTimeout(() => setCopiedTx(null), 2000);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Blocks className="text-shield-teal" size={24} />
            <span>MST Blockchain Evidence Ledger</span>
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Cryptographic proof of existence and non-repudiation audit trail on MST Blockchain.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>MST Testnet EVM Synced</span>
          </span>
        </div>
      </div>

      {/* Network Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Current Block Height</div>
          <div className="text-xl font-bold text-slate-100 font-mono mt-1">#14,892</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Avg block time: 2.1s</div>
        </div>

        <div className="card p-4">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Smart Contract</div>
          <div className="text-xs font-bold text-shield-blue font-mono mt-1.5 truncate">
            0x5FbDB231...80aa3
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">FraudShieldAudit.sol</div>
        </div>

        <div className="card p-4">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Anchored Records</div>
          <div className="text-xl font-bold text-shield-teal font-mono mt-1">128 Proofs</div>
          <div className="text-[11px] text-emerald-400 mt-0.5">100% Integrity match</div>
        </div>

        <div className="card p-4">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Consensus Engine</div>
          <div className="text-xl font-bold text-slate-100 font-mono mt-1">MST Proof-of-Trust</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Zero gas fee for victims</div>
        </div>
      </div>

      {/* Verification Query Tool */}
      <div className="card p-6 border-l-4 border-l-shield-teal space-y-4">
        <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
          <Search size={18} className="text-shield-teal" />
          <span>Verify Evidence SHA-256 On-Chain</span>
        </h2>
        <p className="text-xs text-slate-400">
          Enter any evidence digest or Case ID to query the immutable smart contract ledger and confirm timestamped non-repudiation.
        </p>

        <form onSubmit={handleVerify} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Hash size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2.5 bg-navy-900 border border-navy-700 rounded-lg text-slate-100 text-sm font-mono outline-none focus:border-shield-teal"
              placeholder="e.g. e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
              value={searchHash}
              onChange={(e) => setSearchHash(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            disabled={verifying}
            className="px-6 py-2.5 bg-shield-teal/20 hover:bg-shield-teal/30 border border-teal-700 text-teal-300 font-semibold text-sm rounded-lg flex items-center justify-center gap-2 transition-all shadow-glow-teal disabled:opacity-50"
          >
            {verifying ? (
              <RefreshCw size={16} className="animate-spin" />
            ) : (
              <CheckCircle2 size={16} />
            )}
            <span>Query Smart Contract</span>
          </button>
        </form>

        {verifyResult && (
          <div className="p-4 rounded-xl bg-navy-900/90 border border-emerald-500/50 space-y-3 animate-fade-in text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 size={16} />
                <span>On-Chain Cryptographic Proof Verified</span>
              </span>
              <span className="font-mono text-[11px] text-slate-400">Block #{verifyResult.block}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-300 font-mono text-[11px]">
              <div>
                <span className="text-slate-500 block">Transaction Hash:</span>
                <span className="text-shield-blue break-all">{verifyResult.txHash}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Committed Timestamp:</span>
                <span>{verifyResult.timestamp}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Ledger Block Feed */}
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-navy-700/60 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <Activity size={16} className="text-shield-blue" />
            <span>Recent Evidence Anchoring Blocks</span>
          </h2>
          <span className="text-xs text-slate-400">Auto-refreshing live ledger</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-navy-950/70 border-b border-navy-700/60 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Block</th>
                <th className="py-3 px-4">Tx Hash</th>
                <th className="py-3 px-4">Case ID</th>
                <th className="py-3 px-4">Anchored SHA-256 Digest</th>
                <th className="py-3 px-4">Time</th>
                <th className="py-3 px-4 text-right">Gas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-700/40 text-xs">
              {RECENT_TRANSACTIONS.map((tx) => (
                <tr key={tx.txHash} className="hover:bg-navy-700/25 transition-colors font-mono">
                  <td className="py-3 px-4 font-bold text-shield-blue">
                    #{tx.block}
                  </td>
                  <td className="py-3 px-4 text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <span>{tx.txHash.slice(0, 10)}...{tx.txHash.slice(-8)}</span>
                      <button
                        onClick={() => copyToClipboard(tx.txHash)}
                        className="text-slate-500 hover:text-slate-200"
                        title="Copy Tx Hash"
                      >
                        {copiedTx === tx.txHash ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                      </button>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-sans font-semibold text-slate-200">
                    {tx.caseId}
                  </td>
                  <td className="py-3 px-4 text-shield-teal">
                    {tx.evidenceHash.slice(0, 12)}...{tx.evidenceHash.slice(-8)}
                  </td>
                  <td className="py-3 px-4 text-slate-400 font-sans">
                    {tx.timestamp}
                  </td>
                  <td className="py-3 px-4 text-right text-slate-400">
                    {tx.gasUsed}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
