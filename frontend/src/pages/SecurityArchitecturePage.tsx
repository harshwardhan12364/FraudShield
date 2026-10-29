import React from 'react';
import {
  Lock, Shield, CheckCircle2, Server, Database, Blocks,
  Key, FileCheck, AlertOctagon, Terminal, ArrowRight
} from 'lucide-react';

export default function SecurityArchitecturePage() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <Lock className="text-shield-teal" size={24} />
          <span>Security Architecture & Cryptographic Trust Boundaries</span>
        </h1>
        <p className="text-slate-400 text-sm mt-0.5">
          Zero-Trust multi-tier protection, SHA-256 evidence anchoring, and non-repudiation threat defense.
        </p>
      </div>

      {/* Trust Boundary Diagram */}
      <div className="card p-6 space-y-4">
        <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
          <Shield size={18} className="text-shield-blue" />
          <span>Interactive Platform Trust Boundary Flow</span>
        </h2>
        <p className="text-xs text-slate-400">
          Raw victim artifacts and PII never touch public ledgers. Only irreversible cryptographic SHA-256 state hashes are anchored to the MST Blockchain.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2">
          {/* Tier 1 */}
          <div className="p-4 rounded-xl bg-navy-900 border border-navy-700/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tier 1</span>
              <span className="w-2 h-2 rounded-full bg-blue-500" />
            </div>
            <div className="font-bold text-slate-100 text-sm">Citizen Portal</div>
            <p className="text-[11px] text-slate-400">
              HTTPS / TLS 1.3 encrypted browser interface. Client-side SHA-256 evidence hashing computed before transit.
            </p>
          </div>

          {/* Tier 2 */}
          <div className="p-4 rounded-xl bg-navy-900 border border-navy-700/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tier 2</span>
              <span className="w-2 h-2 rounded-full bg-teal-500" />
            </div>
            <div className="font-bold text-slate-100 text-sm">API Gateway & RBAC</div>
            <p className="text-[11px] text-slate-400">
              FastAPI backend with Argon2id password verification, HttpOnly JWT cookies, and rate-limiting anti-abuse throttles.
            </p>
          </div>

          {/* Tier 3 */}
          <div className="p-4 rounded-xl bg-navy-900 border border-navy-700/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tier 3</span>
              <span className="w-2 h-2 rounded-full bg-purple-500" />
            </div>
            <div className="font-bold text-slate-100 text-sm">AI Risk & Entity Graph</div>
            <p className="text-[11px] text-slate-400">
              Isolated heuristic analysis engine correlates mule VPAs and scam phones into an in-memory NetworkX correlation graph.
            </p>
          </div>

          {/* Tier 4 */}
          <div className="p-4 rounded-xl bg-navy-900 border border-navy-700/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tier 4</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            <div className="font-bold text-slate-100 text-sm">MST Blockchain Ledger</div>
            <p className="text-[11px] text-slate-400">
              FraudShieldAudit.sol smart contract anchors timestamped Merkle roots for immutable court-admissible proof of evidence.
            </p>
          </div>
        </div>
      </div>

      {/* Security Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-5 space-y-2 border-l-4 border-l-shield-blue">
          <div className="text-xs font-bold text-slate-400 uppercase">Cryptographic Hashing</div>
          <div className="text-base font-bold text-slate-100">SHA-256 Evidence Anchoring</div>
          <p className="text-xs text-slate-400">
            Digital screenshots and bank receipts are hashed using NIST FIPS 180-4 standard. Any bit modification results in completely discordant digest.
          </p>
        </div>

        <div className="card p-5 space-y-2 border-l-4 border-l-shield-teal">
          <div className="text-xs font-bold text-slate-400 uppercase">Authentication & Storage</div>
          <div className="text-base font-bold text-slate-100">Argon2id Password Defense</div>
          <p className="text-xs text-slate-400">
            Memory-hard hashing function resistant to GPU and ASIC brute-force attacks. Tokens are transmitted exclusively through secure HttpOnly cookies.
          </p>
        </div>

        <div className="card p-5 space-y-2 border-l-4 border-l-purple-500">
          <div className="text-xs font-bold text-slate-400 uppercase">Legal Evidence Standard</div>
          <div className="text-base font-bold text-slate-100">Section 65B Electronic Proof</div>
          <p className="text-xs text-slate-400">
            Court-compliant chain of custody. Proves evidence was collected at a specific block height without retrospective tampering.
          </p>
        </div>
      </div>

      {/* Attack Mitigation Matrix */}
      <div className="card p-6 space-y-4">
        <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
          <AlertOctagon size={18} className="text-red-400" />
          <span>Threat Vector & Vulnerability Mitigation Matrix</span>
        </h2>

        <div className="space-y-3 text-xs">
          <div className="p-3 bg-navy-900 rounded-lg border border-navy-700/80 flex items-start justify-between gap-4">
            <div>
              <span className="font-bold text-slate-200">Sybil & Spam Report Inundation:</span>
              <p className="text-slate-400 mt-0.5">Automated IP rate limiting, token buckets, and mandatory citizen account verification prevent bot flooding.</p>
            </div>
            <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold">MITIGATED</span>
          </div>

          <div className="p-3 bg-navy-900 rounded-lg border border-navy-700/80 flex items-start justify-between gap-4">
            <div>
              <span className="font-bold text-slate-200">Evidence Forgery & Retroactive Editing:</span>
              <p className="text-slate-400 mt-0.5">Smart contract state mappings prevent overwriting existing evidence hashes once committed to the blockchain.</p>
            </div>
            <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold">MITIGATED</span>
          </div>

          <div className="p-3 bg-navy-900 rounded-lg border border-navy-700/80 flex items-start justify-between gap-4">
            <div>
              <span className="font-bold text-slate-200">PII Leakage on Public Ledger:</span>
              <p className="text-slate-400 mt-0.5">Strict Zero-Knowledge principle: Zero names, phone numbers, or account details are ever committed to the blockchain.</p>
            </div>
            <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold">MITIGATED</span>
          </div>
        </div>
      </div>
    </div>
  );
}
