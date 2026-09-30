import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { AuditLog, ApiResponse } from '../types';
import { ShieldCheck, Search, Clock, User } from 'lucide-react';

export const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await api.get<ApiResponse<AuditLog[]>>('/audit-logs');
      if (res.data.success) {
        setLogs(res.data.data);
      }
    } catch (e) {
      console.error('Failed to load audit logs', e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = logs.filter((l) =>
    `${l.action} ${l.username} ${l.entityName} ${l.details}`
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Audit Trail</h1>
        <p className="text-sm text-slate-500">
          Tamper-evident logs of all laboratory events, test calculations, reviews, and report generation.
        </p>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
        <Search size={18} className="text-slate-400" />
        <input
          type="text"
          placeholder="Filter audit logs by user, action, entity, details..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
        />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-sm">Loading audit trail...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">No audit records found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Timestamp</th>
                  <th className="px-5 py-3.5">User</th>
                  <th className="px-5 py-3.5">Action</th>
                  <th className="px-5 py-3.5">Target Entity</th>
                  <th className="px-5 py-3.5">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-xs">
                {filtered.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition">
                    <td className="px-5 py-3 text-slate-500 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-5 py-3 font-sans font-semibold text-slate-900">
                      {log.username || 'System'}
                    </td>
                    <td className="px-5 py-3">
                      <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-bold text-[11px] border border-slate-200">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-600 font-sans">
                      {log.entityName} {log.entityId ? `#${log.entityId}` : ''}
                    </td>
                    <td className="px-5 py-3 font-sans text-slate-700 max-w-md truncate">
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
