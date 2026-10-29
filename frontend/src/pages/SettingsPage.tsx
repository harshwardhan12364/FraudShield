import React, { useState } from 'react';
import { Settings, Save, CheckCircle2, Sliders, Blocks, Bell, Shield } from 'lucide-react';

export default function SettingsPage() {
  const [highRiskThreshold, setHighRiskThreshold] = useState(75);
  const [mediumRiskThreshold, setMediumRiskThreshold] = useState(40);
  const [autoAnchor, setAutoAnchor] = useState(true);
  const [rpcUrl, setRpcUrl] = useState('http://127.0.0.1:8545');
  const [contractAddress, setContractAddress] = useState('0x5FbDB2315678afecb367f032d93F642f64180aa3');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <Settings className="text-shield-blue" size={24} />
          <span>System & Risk Engine Configuration</span>
        </h1>
        <p className="text-slate-400 text-sm mt-0.5">
          Tune algorithmic threat sensitivity, blockchain RPC parameters, and automated triage triggers.
        </p>
      </div>

      {saved && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/50 flex items-center gap-2 text-emerald-300 text-xs animate-fade-in">
          <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
          <span>Configuration saved successfully. System parameters updated.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Risk Thresholds Card */}
        <div className="card p-6 space-y-4">
          <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <Sliders size={18} className="text-shield-blue" />
            <span>AI Risk Scoring Calibration</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase">
                High Risk Threshold (Current: {highRiskThreshold}/100)
              </label>
              <input
                type="range"
                min="50"
                max="95"
                className="w-full accent-red-500 cursor-pointer"
                value={highRiskThreshold}
                onChange={(e) => setHighRiskThreshold(Number(e.target.value))}
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Cases scoring above this require mandatory analyst triage within 60 minutes.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase">
                Medium Risk Threshold (Current: {mediumRiskThreshold}/100)
              </label>
              <input
                type="range"
                min="20"
                max="60"
                className="w-full accent-amber-500 cursor-pointer"
                value={mediumRiskThreshold}
                onChange={(e) => setMediumRiskThreshold(Number(e.target.value))}
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Cases scoring above this are prioritized for cross-case network entity correlation.
              </p>
            </div>
          </div>
        </div>

        {/* Blockchain Node & Contract Card */}
        <div className="card p-6 space-y-4">
          <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <Blocks size={18} className="text-shield-teal" />
            <span>MST Blockchain Smart Contract Connection</span>
          </h2>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase">
              MST Blockchain RPC Endpoint
            </label>
            <input
              type="text"
              className="w-full px-3.5 py-2.5 bg-navy-900 border border-navy-700 rounded-lg text-slate-100 text-sm font-mono outline-none focus:border-shield-teal"
              value={rpcUrl}
              onChange={(e) => setRpcUrl(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase">
              Deployed Smart Contract Address (FraudShieldAudit.sol)
            </label>
            <input
              type="text"
              className="w-full px-3.5 py-2.5 bg-navy-900 border border-navy-700 rounded-lg text-slate-100 text-sm font-mono outline-none focus:border-shield-teal"
              value={contractAddress}
              onChange={(e) => setContractAddress(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3 pt-1">
            <input
              type="checkbox"
              id="autoAnchorCheck"
              checked={autoAnchor}
              onChange={(e) => setAutoAnchor(e.target.checked)}
              className="w-4 h-4 text-shield-blue rounded bg-navy-900 border-navy-700"
            />
            <label htmlFor="autoAnchorCheck" className="text-xs font-semibold text-slate-200 cursor-pointer">
              Automatically commit evidence SHA-256 to ledger upon submission
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 bg-shield-blue hover:bg-blue-500 text-white rounded-lg font-semibold text-sm transition-all shadow-glow-blue"
          >
            <Save size={16} />
            <span>Save Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
}
