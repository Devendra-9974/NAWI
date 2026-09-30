import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { DashboardStats, ApiResponse } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { ComplianceBadge } from '../components/ComplianceBadge';
import {
  Scale,
  FlaskConical,
  Clock,
  CheckCircle,
  FileCheck2,
  AlertTriangle,
  ArrowUpRight,
  Download,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

import { useAuth } from '../context/AuthContext';

export const Dashboard: React.FC = () => {
  const { user, isReviewer, isAdmin } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get<ApiResponse<DashboardStats>>('/dashboard/stats');
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (e) {
      console.error('Failed to load dashboard stats', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mr-3"></div>
        <span>Loading laboratory metrics...</span>
      </div>
    );
  }

  const resultChartData = [
    { name: 'PASS', value: stats?.totalPass || 0, color: '#10b981' },
    { name: 'FAIL', value: stats?.totalFail || 0, color: '#f43f5e' },
    {
      name: 'PENDING',
      value: (stats?.testsInProgress || 0) + (stats?.testsSubmitted || 0),
      color: '#64748b',
    },
  ].filter((d) => d.value > 0);

  const statusChartData = stats?.statusDistribution
    ? Object.entries(stats.statusDistribution).map(([name, count]) => ({
        name,
        count,
      }))
    : [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Laboratory Overview</h1>
          <p className="text-sm text-slate-500">
            Real-time Non-Automatic Weighing Instruments (NAWI) testing and compliance status.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/tests/new"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-lg shadow-sm text-sm transition"
          >
            <FlaskConical size={16} />
            <span>New Evaluation</span>
          </Link>
          <Link
            to="/instruments/new"
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2 px-4 rounded-lg shadow-sm text-sm transition"
          >
            <Scale size={16} />
            <span>Register NAWI</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <Scale size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Instruments</p>
            <p className="text-2xl font-extrabold text-slate-900">{stats?.totalInstruments || 0}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">In Testing</p>
            <p className="text-2xl font-extrabold text-slate-900">{stats?.testsInProgress || 0}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Awaiting Review</p>
            <p className="text-2xl font-extrabold text-purple-700">{stats?.testsSubmitted || 0}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Approved</p>
            <p className="text-2xl font-extrabold text-emerald-600">{stats?.testsApproved || 0}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-teal-50 text-teal-600 rounded-lg">
            <FileCheck2 size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Reports Issued</p>
            <p className="text-2xl font-extrabold text-teal-700">{stats?.totalReportsGenerated || 0}</p>
          </div>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Compliance Distribution Pie */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 mb-4">Compliance Verdict Breakdown</h2>
          <div className="h-56">
            {resultChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={resultChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {resultChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-slate-400">
                No evaluation data available
              </div>
            )}
          </div>
          <div className="flex justify-center gap-4 text-xs font-medium mt-2">
            <span className="flex items-center gap-1 text-emerald-700">
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span> PASS: {stats?.totalPass || 0}
            </span>
            <span className="flex items-center gap-1 text-rose-700">
              <span className="w-3 h-3 rounded-full bg-rose-500 inline-block"></span> FAIL: {stats?.totalFail || 0}
            </span>
          </div>
        </div>

        {/* Status Distribution Bar Chart */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm lg:col-span-2">
          <h2 className="text-sm font-bold text-slate-900 mb-4">Test Workflow Lifecycle Distribution</h2>
          <div className="h-56">
            {statusChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#1e293b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-slate-400">
                No testing status records found
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pending Reviews Alert Banner (Shown only for Reviewers / Admins) */}
      {(isReviewer || isAdmin) && stats?.pendingReviewActions && stats.pendingReviewActions.length > 0 && (
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="text-purple-600" size={18} />
              <h3 className="font-bold text-purple-900 text-sm">
                Evaluations Submitted for Reviewer Verification ({stats.pendingReviewActions.length})
              </h3>
            </div>
            <span className="text-xs text-purple-700 font-medium">Action Required</span>
          </div>
          <div className="divide-y divide-purple-100">
            {stats.pendingReviewActions.map((tc) => (
              <div key={tc.id} className="py-2.5 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-900 text-sm">{tc.testId}</span>
                  <span className="text-xs text-slate-500 ml-2">
                    {tc.instrument?.modelName} (SN: {tc.instrument?.serialNumber}) — Submitted by {tc.technicianName}
                  </span>
                </div>
                <Link
                  to={`/tests/${tc.id}`}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs font-semibold transition"
                >
                  Verify Now <ArrowUpRight size={14} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Evaluations & Recent Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tests */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">Recent Test Evaluations</h3>
            <Link to="/tests" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700">
              View All
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {stats?.recentTests && stats.recentTests.length > 0 ? (
              stats.recentTests.map((t) => (
                <div key={t.id} className="p-4 hover:bg-slate-50 transition flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Link to={`/tests/${t.id}`} className="font-bold text-sm text-slate-900 hover:text-emerald-600">
                        {t.testId}
                      </Link>
                      <StatusBadge status={t.status} />
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {t.instrument?.modelName} | Class {t.instrument?.accuracyClass} | {t.technicianName}
                    </p>
                  </div>
                  <div>
                    <ComplianceBadge result={t.overallResult} />
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-xs text-slate-400">No recent evaluations recorded</div>
            )}
          </div>
        </div>

        {/* Recent Reports */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">Issued Type Evaluation Reports</h3>
            <Link to="/repository" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700">
              Repository
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {stats?.recentReports && stats.recentReports.length > 0 ? (
              stats.recentReports.map((r) => (
                <div key={r.id} className="p-4 hover:bg-slate-50 transition flex items-center justify-between">
                  <div>
                    <p className="font-bold text-sm text-slate-900">{r.reportNumber}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {r.instrumentModel} | Test: {r.testId} | {r.fileFormat}
                    </p>
                  </div>
                  <a
                    href={`/api/reports/${r.id}/download`}
                    className="p-2 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                    title="Download Report"
                  >
                    <Download size={16} />
                  </a>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-xs text-slate-400">No reports generated yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
