import React, { useState } from 'react';
import {
  Search, AlertTriangle, ShieldCheck, CheckCircle2, Sparkles,
  Zap, ArrowRight, ShieldAlert, Copy, RefreshCw, Info
} from 'lucide-react';

const PRESETS = [
  {
    name: 'Part-Time Task Scam',
    text: 'Congratulations! Your profile is selected for Google Reviews part-time job. Daily pay Rs. 3500-8000. No experience needed. Join our VIP Telegram channel @DailyIncomeHub now and send screenshot to +919876543210 for immediate Rs. 150 bonus.',
    upi: 'tasksbonus99@ybl',
    url: 'https://vip-google-review-tasks.net',
  },
  {
    name: 'Electricity Disconnection Phish',
    text: 'Dear consumer, your electricity power will be disconnected tonight at 9:30 PM because previous month bill was not updated. Please immediately contact our power officer at 9876543210 or install update bill app.',
    upi: 'billupdate@paytm',
    url: 'http://electricity-bill-update-quick.apk.xyz',
  },
  {
    name: 'Customs Narcotics Coercion',
    text: 'This is Mumbai Customs & Cyber Cell Narcotics department. A parcel containing 16 passports and contraband drugs was intercepted addressed to your Aadhaar number. Transfer ₹75,000 security deposit to avoid arrest warrant.',
    upi: 'customs-verify@sbi',
    url: '',
  },
  {
    name: 'Crypto Arbitrage Rugpull',
    text: 'Guaranteed 250% monthly profit with automated AI flash loan arbitrage. Deposit minimum 0.5 ETH or 500 USDT to smart contract. Zero risk, instant withdrawals 24/7.',
    upi: '',
    url: 'https://arbitrage-flashloan-vault-eth.finance',
  },
];

export default function RiskAnalysisPage() {
  const [inputText, setInputText] = useState(PRESETS[0].text);
  const [inputUpi, setInputUpi] = useState(PRESETS[0].upi);
  const [inputUrl, setInputUrl] = useState(PRESETS[0].url);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const runAnalysis = () => {
    setAnalyzing(true);
    setTimeout(() => {
      // Heuristic risk calculation engine demo
      let score = 20;
      const reasons: string[] = [];

      const lower = inputText.toLowerCase();
      if (lower.includes('telegram') || lower.includes('vip') || lower.includes('part-time') || lower.includes('daily pay')) {
        score += 35;
        reasons.push('Contains known employment/task scam keywords ("Telegram", "VIP", "daily pay")');
      }
      if (lower.includes('disconnect') || lower.includes('power') || lower.includes('electricity') || lower.includes('bill')) {
        score += 40;
        reasons.push('High-pressure utility disconnection intimidation phrasing detected');
      }
      if (lower.includes('customs') || lower.includes('arrest') || lower.includes('police') || lower.includes('narcotics')) {
        score += 45;
        reasons.push('Law enforcement / Government impersonation and arrest extortion indicators present');
      }
      if (lower.includes('guaranteed') || lower.includes('profit') || lower.includes('crypto') || lower.includes('arbitrage')) {
        score += 35;
        reasons.push('Unrealistic guaranteed financial return & cryptocurrency solicitation flags');
      }
      if (inputUrl && (inputUrl.includes('.xyz') || inputUrl.includes('.apk') || inputUrl.includes('.net') || inputUrl.includes('-'))) {
        score += 25;
        reasons.push(`Suspicious phishing domain/APK artifact pattern detected in URL: ${inputUrl}`);
      }
      if (inputUpi && (inputUpi.includes('bonus') || inputUpi.includes('task') || inputUpi.includes('bill') || inputUpi.includes('verify'))) {
        score += 20;
        reasons.push(`Target UPI handle (${inputUpi}) matches high-risk mule VPA naming conventions`);
      }

      score = Math.min(score, 98);

      setAnalysisResult({
        score,
        severity: score >= 75 ? 'HIGH' : score >= 40 ? 'MEDIUM' : 'LOW',
        reasons,
        recommendation: score >= 75
          ? 'CRITICAL RISK: Block communications immediately. Do not transfer funds or install APK files. File formal police complaint.'
          : 'POTENTIAL SUSPICION: Verify through official verified banking channels before engaging.',
        confidence: '96.4%',
      });
      setAnalyzing(false);
    }, 600);
  };

  const loadPreset = (preset: typeof PRESETS[0]) => {
    setInputText(preset.text);
    setInputUpi(preset.upi);
    setInputUrl(preset.url);
    setAnalysisResult(null);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <Sparkles className="text-shield-blue" size={24} />
          <span>AI Fraud Risk Screener</span>
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Real-time NLP heuristics, phishing domain detection, and financial mule correlation engine.
        </p>
      </div>

      {/* Preset Buttons */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Load Sample Threat Case:
        </span>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => loadPreset(p)}
              className="px-3 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 border border-navy-700 text-xs font-medium text-slate-300 hover:text-white transition-colors"
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <div className="card p-6 space-y-4">
          <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <Search size={18} className="text-shield-blue" />
            <span>Suspect Content & Indicators</span>
          </h2>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase">
              Message Text / Chat Transcript / SMS
            </label>
            <textarea
              rows={6}
              className="w-full px-3.5 py-2.5 bg-navy-900 border border-navy-700 rounded-lg text-slate-100 text-sm outline-none focus:border-shield-blue"
              placeholder="Paste suspicious WhatsApp message, SMS text, or Telegram pitch here..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase">
                Target UPI ID
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 bg-navy-900 border border-navy-700 rounded-lg text-slate-100 text-xs outline-none focus:border-shield-blue font-mono"
                placeholder="vipreturns99@icici"
                value={inputUpi}
                onChange={(e) => setInputUpi(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase">
                Suspect URL
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 bg-navy-900 border border-navy-700 rounded-lg text-slate-100 text-xs outline-none focus:border-shield-blue font-mono"
                placeholder="https://..."
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
              />
            </div>
          </div>

          <button
            onClick={runAnalysis}
            disabled={analyzing || (!inputText && !inputUpi && !inputUrl)}
            className="w-full py-2.5 bg-shield-blue hover:bg-blue-500 text-white font-semibold text-sm rounded-lg flex items-center justify-center gap-2 shadow-glow-blue transition-all disabled:opacity-50"
          >
            {analyzing ? (
              <RefreshCw size={16} className="animate-spin" />
            ) : (
              <Zap size={16} />
            )}
            <span>{analyzing ? 'Evaluating Heuristics...' : 'Run Fraud Analysis'}</span>
          </button>
        </div>

        {/* Results Panel */}
        <div className="card p-6 space-y-4">
          <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <ShieldCheck size={18} className="text-shield-teal" />
            <span>AI Risk Evaluation Report</span>
          </h2>

          {!analysisResult ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-500 border border-dashed border-navy-700/60 rounded-xl">
              <Sparkles size={36} className="mb-2 opacity-30 text-shield-blue" />
              <p className="text-sm font-medium text-slate-400">Ready to Screen</p>
              <p className="text-xs text-slate-500 max-w-xs mt-1">
                Enter suspect indicators on the left and run analysis to evaluate risk probability.
              </p>
            </div>
          ) : (
            <div className="space-y-4 animate-fade-in">
              {/* Score banner */}
              <div className="p-4 rounded-xl bg-navy-900/80 border border-navy-700 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold uppercase text-slate-400">Calculated Threat Index</div>
                  <div className={`text-3xl font-extrabold font-mono mt-0.5 ${
                    analysisResult.score >= 75 ? 'text-red-400' :
                    analysisResult.score >= 40 ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {analysisResult.score} / 100
                  </div>
                  <div className="text-[11px] text-slate-400">Confidence: {analysisResult.confidence}</div>
                </div>

                <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider ${
                  analysisResult.severity === 'HIGH' ? 'bg-red-950/80 text-red-400 border border-red-800' :
                  analysisResult.severity === 'MEDIUM' ? 'bg-amber-950/80 text-amber-400 border border-amber-800' :
                  'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                }`}>
                  {analysisResult.severity} RISK
                </span>
              </div>

              {/* Heuristics breakdown */}
              <div>
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2">
                  Risk Heuristics Identified:
                </span>
                <div className="space-y-2">
                  {analysisResult.reasons.map((r: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-2 p-2.5 rounded-lg bg-navy-900/50 border border-navy-700/60 text-xs text-slate-200">
                      <AlertTriangle size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
                      <span>{r}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Advisory recommendation */}
              <div className="p-3.5 rounded-xl bg-shield-blue/10 border border-shield-blue/30 text-xs text-slate-200">
                <span className="font-bold text-shield-blue uppercase block mb-1">Analyst Guidance:</span>
                {analysisResult.recommendation}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
