import React, { useState } from 'react';
import {
  GitBranch, Search, Filter, ShieldAlert, AlertCircle, Info,
  Share2, ZoomIn, ZoomOut, RefreshCw, Layers
} from 'lucide-react';

interface Node {
  id: string;
  label: string;
  type: 'report' | 'upi' | 'phone' | 'bank' | 'wallet';
  risk: 'high' | 'medium' | 'low';
  x: number;
  y: number;
  cases: string[];
}

interface Edge {
  from: string;
  to: string;
  relation: string;
}

const INITIAL_NODES: Node[] = [
  { id: 'R1', label: 'Case REP-081', type: 'report', risk: 'high', x: 200, y: 150, cases: ['REP-081'] },
  { id: 'R2', label: 'Case REP-077', type: 'report', risk: 'high', x: 380, y: 120, cases: ['REP-077'] },
  { id: 'R3', label: 'Case REP-072', type: 'report', risk: 'medium', x: 550, y: 180, cases: ['REP-072'] },
  { id: 'U1', label: 'taskbonus99@ybl', type: 'upi', risk: 'high', x: 280, y: 260, cases: ['REP-081', 'REP-077'] },
  { id: 'P1', label: '+919876543210', type: 'phone', risk: 'high', x: 420, y: 280, cases: ['REP-081', 'REP-072'] },
  { id: 'B1', label: 'YES Bank #981273918231', type: 'bank', risk: 'high', x: 220, y: 390, cases: ['REP-081'] },
  { id: 'W1', label: '0x71C...b8F9', type: 'wallet', risk: 'medium', x: 520, y: 360, cases: ['REP-072'] },
];

const INITIAL_EDGES: Edge[] = [
  { from: 'R1', to: 'U1', relation: 'Extorted Funds To' },
  { from: 'R2', to: 'U1', relation: 'Same Destination VPA' },
  { from: 'R1', to: 'P1', relation: 'Contact Origin' },
  { from: 'R3', to: 'P1', relation: 'Caller Identification' },
  { from: 'U1', to: 'B1', relation: 'Settlement Account' },
  { from: 'R3', to: 'W1', relation: 'Crypto Vault Deposit' },
];

export default function ScamNetworkPage() {
  const [nodes, setNodes] = useState<Node[]>(INITIAL_NODES);
  const [edges] = useState<Edge[]>(INITIAL_EDGES);
  const [selectedNode, setSelectedNode] = useState<Node | null>(INITIAL_NODES[3]); // Default select UPI node
  const [search, setSearch] = useState('');

  const nodeColor = (type: Node['type']) => {
    switch (type) {
      case 'report': return '#3b82f6';
      case 'upi': return '#ef4444';
      case 'phone': return '#f59e0b';
      case 'bank': return '#8b5cf6';
      case 'wallet': return '#14b8a6';
      default: return '#64748b';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <GitBranch className="text-shield-teal" size={24} />
            <span>Syndicate & Mule Network Correlation Graph</span>
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Automated entity resolution detecting shared VPAs, VOIP callers, and laundering mule accounts across reports.
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs bg-navy-900/80 p-2.5 rounded-xl border border-navy-700">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span className="text-slate-300">Report</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span className="text-slate-300">Mule UPI</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-slate-300">Phone</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
            <span className="text-slate-300">Bank Account</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
            <span className="text-slate-300">Crypto Wallet</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive SVG Canvas */}
        <div className="card p-4 lg:col-span-2 relative overflow-hidden bg-navy-950/90 border-navy-700 min-h-[500px] flex flex-col">
          {/* Canvas Toolbar */}
          <div className="flex items-center justify-between mb-3 text-xs text-slate-400 border-b border-navy-800 pb-2">
            <span className="font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Layers size={14} className="text-shield-teal" />
              <span>Interactive Syndicate Map (7 entities linked)</span>
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedNode(null)}
                className="px-2 py-1 rounded bg-navy-800 hover:bg-navy-700 text-slate-300 text-xs"
              >
                Reset Focus
              </button>
            </div>
          </div>

          <div className="flex-1 relative w-full h-[450px]">
            <svg className="w-full h-full cursor-crosshair">
              {/* Background grid lines */}
              <defs>
                <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                  <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#1e293b" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />

              {/* Edges */}
              {edges.map((e, idx) => {
                const source = nodes.find(n => n.id === e.from);
                const target = nodes.find(n => n.id === e.to);
                if (!source || !target) return null;
                const isHighlighted = selectedNode && (selectedNode.id === source.id || selectedNode.id === target.id);
                return (
                  <g key={idx}>
                    <line
                      x1={source.x}
                      y1={source.y}
                      x2={target.x}
                      y2={target.y}
                      stroke={isHighlighted ? '#14b8a6' : '#334155'}
                      strokeWidth={isHighlighted ? 2.5 : 1.5}
                      strokeDasharray={isHighlighted ? 'none' : '4 2'}
                    />
                    {/* Edge Label */}
                    <text
                      x={(source.x + target.x) / 2}
                      y={(source.y + target.y) / 2 - 4}
                      fill="#94a3b8"
                      fontSize={9}
                      textAnchor="middle"
                      className="select-none pointer-events-none"
                    >
                      {e.relation}
                    </text>
                  </g>
                );
              })}

              {/* Nodes */}
              {nodes.map((n) => {
                const isSelected = selectedNode?.id === n.id;
                return (
                  <g
                    key={n.id}
                    className="cursor-pointer transition-transform hover:scale-110"
                    onClick={() => setSelectedNode(n)}
                  >
                    {/* Glow ring if selected */}
                    {isSelected && (
                      <circle
                        cx={n.x}
                        cy={n.y}
                        r={24}
                        fill="none"
                        stroke="#14b8a6"
                        strokeWidth={2}
                        className="animate-pulse"
                      />
                    )}
                    <circle
                      cx={n.x}
                      cy={n.y}
                      r={16}
                      fill={nodeColor(n.type)}
                      stroke="#0f172a"
                      strokeWidth={3}
                    />
                    <text
                      x={n.x}
                      y={n.y + 28}
                      fill="#e2e8f0"
                      fontSize={11}
                      fontWeight={isSelected ? 'bold' : 'normal'}
                      textAnchor="middle"
                      className="select-none pointer-events-none"
                    >
                      {n.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Selected Entity Intelligence Drawer */}
        <div className="card p-5 space-y-4">
          <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <Info size={18} className="text-shield-blue" />
            <span>Entity Intelligence Profile</span>
          </h2>

          {!selectedNode ? (
            <div className="text-center py-12 text-slate-500">
              <GitBranch size={32} className="mx-auto mb-2 opacity-40 text-slate-400" />
              <p className="text-xs">Click any node on the graph to inspect correlated fraud evidence.</p>
            </div>
          ) : (
            <div className="space-y-4 animate-fade-in text-xs">
              <div className="p-3.5 rounded-xl bg-navy-900 border border-navy-700">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Entity Type: {selectedNode.type}</div>
                <div className="text-base font-bold text-slate-100 font-mono mt-0.5 break-all">
                  {selectedNode.label}
                </div>
                <span className="mt-2 inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-red-950/80 text-red-400 border border-red-800">
                  CONFIRMED MULE ARTIFACT
                </span>
              </div>

              <div>
                <span className="font-semibold text-slate-300 uppercase tracking-wider block mb-2">
                  Correlated Fraud Reports ({selectedNode.cases.length}):
                </span>
                <div className="space-y-2">
                  {selectedNode.cases.map(c => (
                    <div key={c} className="p-2.5 rounded-lg bg-navy-900/60 border border-navy-700/60 flex items-center justify-between">
                      <span className="font-mono font-semibold text-shield-blue">{c}</span>
                      <span className="text-[10px] text-emerald-400">Linked by AI Graph</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-red-950/30 border border-red-800/40 rounded-xl space-y-1 text-slate-300">
                <div className="font-bold text-red-400 flex items-center gap-1.5">
                  <ShieldAlert size={14} />
                  <span>Enforcement Recommendation</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Initiate automated Section 91 CrPC notice to NPCI/Bank to freeze this beneficiary handle immediately.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
