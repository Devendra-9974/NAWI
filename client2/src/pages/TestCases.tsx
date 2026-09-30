import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { TestCase, ApiResponse } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { ComplianceBadge } from '../components/ComplianceBadge';
import { FlaskConical, Plus, Search, Filter, ArrowRight } from 'lucide-react';

export const TestCases: React.FC = () => {
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchTestCases();
  }, []);

  const fetchTestCases = async () => {
    try {
      const res = await api.get<ApiResponse<TestCase[]>>('/tests');
      if (res.data.success) {
        setTestCases(res.data.data);
      }
    } catch (e) {
      console.error('Failed to load test cases', e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = testCases.filter((t) => {
    const matchesQuery = `${t.testId} ${t.instrument?.instrumentId} ${t.instrument?.modelName} ${t.instrument?.serialNumber} ${t.technicianName}`
      .toLowerCase()
      .includes(query.toLowerCase());
    const matchesStatus = statusFilter ? t.status === statusFilter : true;
    return matchesQuery && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Test Evaluations</h1>
          <p className="text-sm text-slate-500">
            Digitized OIML R 76 evaluation procedures and compliance records.
          </p>
        </div>
        <Link
          to="/tests/new"
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-lg shadow-sm text-sm transition"
        >
          <Plus size={16} />
          <span>New Evaluation</span>
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="flex-1 flex items-center gap-3">
          <Search size={18} className="text-slate-400" />
          <input
            type="text"
            placeholder="Search by Test ID, Instrument, Serial No, Technician..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-2 border-t sm:border-t-0 sm:border-l sm:pl-3 border-slate-200">
          <Filter size={16} className="text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-700 focus:ring-1 focus:ring-emerald-500"
          >
            <option value="">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="TESTING">Testing</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="REPORT_GENERATED">Report Issued</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-sm">Loading test evaluations...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">No evaluations found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Test ID</th>
                  <th className="px-5 py-3.5">Instrument</th>
                  <th className="px-5 py-3.5">Accuracy Class</th>
                  <th className="px-5 py-3.5">Standard Version</th>
                  <th className="px-5 py-3.5">Technician</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Verdict</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((tc) => (
                  <tr key={tc.id} className="hover:bg-slate-50 transition">
                    <td className="px-5 py-4 font-mono font-bold text-slate-900">
                      <Link to={`/tests/${tc.id}`} className="hover:text-emerald-600">
                        {tc.testId}
                      </Link>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-900">{tc.instrument?.modelName}</div>
                      <div className="text-xs font-mono text-slate-500">
                        {tc.instrument?.instrumentId} (SN: {tc.instrument?.serialNumber})
                      </div>
                    </td>
                    <td className="px-5 py-4 text-xs font-semibold text-blue-700">
                      {tc.instrument?.accuracyClass}
                    </td>
                    <td className="px-5 py-4 text-xs font-mono text-slate-600">
                      OIML R 76 ({tc.standardVersionCode})
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-700">
                      {tc.technicianName}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={tc.status} />
                    </td>
                    <td className="px-5 py-4">
                      <ComplianceBadge result={tc.overallResult} />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        to={`/tests/${tc.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition"
                      >
                        <span>Workspace</span>
                        <ArrowRight size={13} />
                      </Link>
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
