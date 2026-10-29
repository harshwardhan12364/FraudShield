import React, { useState } from 'react';
import {
  Users, UserCheck, Shield, AlertCircle, Search, Edit2,
  CheckCircle2, Ban, Lock, RefreshCw
} from 'lucide-react';
import { formatDate } from '../utils/helpers';

const INITIAL_USERS = [
  {
    id: 'USR-001',
    email: 'admin@fraudshield.io',
    display_name: 'Chief Security Officer',
    role: 'admin',
    is_active: true,
    created_at: '2026-10-01T10:00:00Z',
    cases_handled: 48,
  },
  {
    id: 'USR-002',
    email: 'analyst@fraudshield.io',
    display_name: 'Lead Cyber Investigator',
    role: 'analyst',
    is_active: true,
    created_at: '2026-10-05T12:00:00Z',
    cases_handled: 32,
  },
  {
    id: 'USR-003',
    email: 'reporter@fraudshield.io',
    display_name: 'Verified Citizen Reporter',
    role: 'reporter',
    is_active: true,
    created_at: '2026-10-12T15:30:00Z',
    cases_handled: 5,
  },
  {
    id: 'USR-004',
    email: 'victim_relief@ngo.org',
    display_name: 'Consumer Advocate Desk',
    role: 'reporter',
    is_active: true,
    created_at: '2026-10-18T09:15:00Z',
    cases_handled: 12,
  },
];

export default function UserManagementPage() {
  const [users, setUsers] = useState(INITIAL_USERS);
  const [search, setSearch] = useState('');
  const [editingUser, setEditingUser] = useState<any>(null);

  const handleRoleChange = (userId: string, newRole: string) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    setEditingUser(null);
  };

  const toggleStatus = (userId: string) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_active: !u.is_active } : u));
  };

  const filtered = users.filter(u =>
    !search ||
    u.display_name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Users className="text-shield-blue" size={24} />
            <span>Role-Based Access Control (RBAC) Management</span>
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Administer investigator roles, permissions, and security tokens across platform staff.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="card p-4">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2 bg-navy-900 border border-navy-700 rounded-lg text-slate-100 text-sm outline-none focus:border-shield-blue"
            placeholder="Search by User Name, Email, or Role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-navy-950/70 border-b border-navy-700/60 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">User</th>
                <th className="py-3.5 px-4">Role Permission</th>
                <th className="py-3.5 px-4">Account Status</th>
                <th className="py-3.5 px-4">Cases Handled</th>
                <th className="py-3.5 px-4">Joined Date</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-700/40 text-xs">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-navy-700/25 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-200">{u.display_name}</div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">{u.email}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-0.5 rounded font-semibold uppercase tracking-wider text-[10px] ${
                      u.role === 'admin' ? 'bg-purple-950 text-purple-300 border border-purple-800' :
                      u.role === 'analyst' ? 'bg-blue-950 text-shield-blue border border-blue-800' :
                      'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    {u.is_active ? (
                      <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                        <CheckCircle2 size={13} />
                        <span>Active</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-red-400 font-medium">
                        <Ban size={13} />
                        <span>Suspended</span>
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-300">
                    {u.cases_handled}
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">
                    {formatDate(u.created_at)}
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    <button
                      onClick={() => setEditingUser(u)}
                      className="px-2.5 py-1 rounded bg-navy-700 hover:bg-navy-600 text-slate-200 text-xs transition-colors"
                    >
                      Change Role
                    </button>
                    <button
                      onClick={() => toggleStatus(u.id)}
                      className="px-2.5 py-1 rounded bg-navy-800 hover:bg-navy-700 text-slate-400 hover:text-slate-200 text-xs transition-colors"
                    >
                      {u.is_active ? 'Suspend' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Change Role Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="card max-w-sm w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-100">
              Update Role: {editingUser.display_name}
            </h3>
            <p className="text-xs text-slate-400">
              Modifying roles immediately refreshes user capabilities and emits an immutable security audit event.
            </p>

            <div className="space-y-2">
              {['reporter', 'analyst', 'admin'].map(r => (
                <button
                  key={r}
                  onClick={() => handleRoleChange(editingUser.id, r)}
                  className={`w-full p-2.5 rounded-lg border text-xs font-semibold capitalize text-left flex items-center justify-between transition-all ${
                    editingUser.role === r
                      ? 'bg-shield-blue/20 border-shield-blue text-white'
                      : 'bg-navy-900 border-navy-700 text-slate-300 hover:border-navy-600'
                  }`}
                >
                  <span>{r}</span>
                  {editingUser.role === r && <CheckCircle2 size={14} className="text-shield-blue" />}
                </button>
              ))}
            </div>

            <div className="pt-2">
              <button
                onClick={() => setEditingUser(null)}
                className="w-full py-2 bg-navy-800 hover:bg-navy-700 text-slate-300 rounded-lg text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
