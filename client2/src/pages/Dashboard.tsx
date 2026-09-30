import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { DashboardStats, ApiResponse } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { ComplianceBadge } from '../components/ComplianceBadge';
import {
  Scale,
  FlaskConical,
  Clock,
  CheckCircle2,
  FileCheck2,
  AlertTriangle,
  ArrowUpRight,
  Download,
  Plus,
  Calendar,
  Layers,
  FileText,
  ChevronRight,
  Sparkles,
  Thermometer,
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
  Legend,
} from 'recharts';

export const Dashboard: React.FC = () => {
  const { user, isReviewer, isAdmin, isTechnician } = useAuth();
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
        <span className="font-medium text-sm">Loading METROLOGIX laboratory telemetry...</span>
      </div>
    );
  }

  // Activity Mock Data for Double Bar Chart (as displayed in Figma)
  const activityData = [
    { day: 'Mon', compliant: 4, evaluated: 5 },
    { day: 'Tue', compliant: 6, evaluated: 7 },
    { day: 'Wed', compliant: 3, evaluated: 4 },
    { day: 'Thu', compliant: 8, evaluated: 9 },
    { day: 'Fri', compliant: 7, evaluated: 8 },
    { day: 'Sat', compliant: 5, evaluated: 5 },
    { day: 'Sun', compliant: 2, evaluated: 2 },
  ];

  const totalPass = stats?.totalPass || 0;
  const totalFail = stats?.totalFail || 0;
  const inProgress = (stats?.testsInProgress || 0) + (stats?.testsSubmitted || 0);

  const complianceDonutData = [
    { name: 'PASS', value: totalPass, color: '#10b981' },
    { name: 'IN PROGRESS', value: inProgress, color: '#2563eb' },
    { name: 'UNDER REVIEW', value: stats?.testsSubmitted || 0, color: '#f59e0b' },
    { name: 'FAIL', value: totalFail, color: '#ef4444' },
  ].filter((d) => d.value > 0);

  const totalEvaluationsCount = totalPass + inProgress + totalFail;

  return (
    <div className="space-y-6">
      {/* 1. Header Greeting & Top Action Buttons (as seen in Figma) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Good morning, {user?.fullName?.split(' ')[0] || 'Metrologist'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Here is your OIML R 76 laboratory overview and today's testing queue.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/repository"
            className="inline-flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold py-2 px-3.5 rounded-lg shadow-sm transition"
          >
            <FileText size={14} className="text-slate-500" />
            <span>View Reports</span>
          </Link>

          <Link
            to="/tests/new"
            className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2 px-4 rounded-lg shadow-sm shadow-blue-500/20 transition"
          >
            <Plus size={16} />
            <span>New Evaluation</span>
          </Link>
        </div>
      </div>

      {/* 2. 4 Precision KPI Metric Cards (Figma Card Styling) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Instruments */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Total Instruments
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Scale size={16} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
              {stats?.totalInstruments || 24}
            </div>
            <div className="text-[11px] font-medium text-emerald-600 mt-1 flex items-center gap-1">
              <span>+3 this month</span>
            </div>
          </div>
        </div>

        {/* In Testing */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              In Testing
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <FlaskConical size={16} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
              {String(stats?.testsInProgress || 8).padStart(2, '0')}
            </div>
            <div className="text-[11px] font-medium text-purple-600 mt-1 flex items-center gap-1">
              <span>4 live test runs</span>
            </div>
          </div>
        </div>

        {/* Under Review */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Under Review
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock size={16} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
              {String(stats?.testsSubmitted || 5).padStart(2, '0')}
            </div>
            <div className="text-[11px] font-medium text-amber-600 mt-1 flex items-center gap-1">
              <span>Awaits Signoff</span>
            </div>
          </div>
        </div>

        {/* Completed Cycles */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Completed
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <FileCheck2 size={16} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
              {String(stats?.totalReportsGenerated || 11).padStart(2, '0')}
            </div>
            <div className="text-[11px] font-medium text-emerald-600 mt-1 flex items-center gap-1">
              <span>100% Certified</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Horizontal Status Signal Bar (as shown in Figma) */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="font-semibold text-slate-800">{totalPass} PASS</span>
            <span className="text-slate-400 font-medium">(Compliant)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <span className="font-semibold text-slate-800">{totalFail} FAIL</span>
            <span className="text-slate-400 font-medium">(Tolerance Exceeded)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span className="font-semibold text-slate-800">{stats?.testsSubmitted || 5} UNDER REVIEW</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-500 font-mono text-[11px] bg-slate-50 px-3 py-1 rounded-md border border-slate-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Sensors Live: <strong>20.4°C</strong> • <strong>48.2% RH</strong> • <strong>1013.2 hPa</strong></span>
        </div>
      </div>

      {/* 4. Middle Grid: Testing Activity (Left 65%) & Donut Chart (Right 35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Testing Activity (8 of 12 cols = ~66%) */}
        <div className="lg:col-span-8 bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Testing Activity</h2>
              <p className="text-xs text-slate-500">Evaluations conducted vs compliance verification</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg">
              <Calendar size={13} />
              <span>Last 7 Days</span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: '#fff',
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar name="Evaluations Run" dataKey="evaluated" fill="#2563eb" radius={[4, 4, 0, 0]} />
                <Bar name="Compliant (Pass)" dataKey="compliant" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Compliance Distribution (4 of 12 cols = ~34%) */}
        <div className="lg:col-span-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Compliance Distribution</h2>
            <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold">
              Total {totalEvaluationsCount}
            </span>
          </div>

          <div className="h-48 relative flex items-center justify-center my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={complianceDonutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={72}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {complianceDonutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: '#fff',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold font-mono text-slate-900">{totalEvaluationsCount}</span>
              <span className="text-[9px] uppercase font-bold text-slate-400">Total Cases</span>
            </div>
          </div>

          {/* Donut Legend */}
          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span className="text-slate-500">PASS:</span>
              <strong className="font-mono text-slate-800">{totalPass}</strong>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
              <span className="text-slate-500">Testing:</span>
              <strong className="font-mono text-slate-800">{stats?.testsInProgress || 0}</strong>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span className="text-slate-500">Review:</span>
              <strong className="font-mono text-slate-800">{stats?.testsSubmitted || 0}</strong>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              <span className="text-slate-500">FAIL:</span>
              <strong className="font-mono text-slate-800">{totalFail}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Bottom Section: Recent Evaluations Table (Left 65%) & Pending Actions (Right 35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Evaluations Table (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Recent Evaluations</h2>
              <p className="text-xs text-slate-500">Type evaluation runs under OIML R 76-1:2006</p>
            </div>
            <Link
              to="/tests"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-2.5 px-4 font-semibold">Test ID</th>
                  <th className="py-2.5 px-4 font-semibold">Instrument Model</th>
                  <th className="py-2.5 px-4 font-semibold">Class</th>
                  <th className="py-2.5 px-4 font-semibold">Status</th>
                  <th className="py-2.5 px-4 font-semibold">Outcome</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {stats?.recentTests && stats.recentTests.length > 0 ? (
                  stats.recentTests.slice(0, 5).map((test) => (
                    <tr key={test.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-mono font-semibold text-blue-600">
                        {test.testId || `TEST-2026-${String(test.id).padStart(4, '0')}`}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{test.instrument?.modelName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {test.instrument?.manufacturerName}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-bold">
                          {test.instrument?.accuracyClassDisplay || test.instrument?.accuracyClass}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={test.status} />
                      </td>
                      <td className="py-3 px-4">
                        <ComplianceBadge result={test.overallResult || 'PENDING'} />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          to={`/tests/${test.id}`}
                          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-semibold"
                        >
                          <span>Workspace</span>
                          <ArrowUpRight size={13} />
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-xs text-slate-400">
                      No evaluations recorded.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pending Actions & Reports (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Pending Reviews Card - Only for Reviewer or Admin */}
          {(isReviewer || isAdmin) && (
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock size={14} className="text-amber-500" />
                  <span>Pending Reviews</span>
                </h3>
                <span className="text-[10px] font-mono font-bold bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.2 rounded-full">
                  {stats?.testsSubmitted || 0} Awaiting
                </span>
              </div>

              <div className="space-y-2">
                {stats?.recentTests && stats.recentTests.filter((t) => t.status === 'SUBMITTED' || t.status === 'UNDER_REVIEW').length > 0 ? (
                  stats.recentTests
                    .filter((t) => t.status === 'SUBMITTED' || t.status === 'UNDER_REVIEW')
                    .slice(0, 3)
                    .map((t) => (
                      <div
                        key={t.id}
                        className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-mono font-bold text-slate-800">{t.testId}</div>
                          <div className="text-[10px] text-slate-500">{t.instrument?.modelName}</div>
                        </div>
                        <Link
                          to={`/tests/${t.id}`}
                          className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-0.5"
                        >
                          <span>Review</span>
                          <ChevronRight size={12} />
                        </Link>
                      </div>
                    ))
                ) : (
                  <div className="p-3 text-center text-xs text-slate-400">No tests awaiting reviewer signoff.</div>
                )}
              </div>
            </div>
          )}

          {/* Recent Reports Card */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <FileCheck2 size={14} className="text-emerald-500" />
                <span>Recent Reports</span>
              </h3>
              <Link to="/repository" className="text-[11px] font-semibold text-blue-600 hover:underline">
                Repository
              </Link>
            </div>

            <div className="space-y-2">
              {stats?.recentReports && stats.recentReports.length > 0 ? (
                stats.recentReports.slice(0, 3).map((rep) => (
                  <div
                    key={rep.id}
                    className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-mono font-bold text-slate-800">{rep.reportNumber}</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {rep.testId} • {rep.fileFormat}
                      </div>
                    </div>
                    <a
                      href={`/api/reports/${rep.id}/download`}
                      download
                      className="p-1.5 rounded-md bg-white border border-slate-200 text-slate-700 hover:text-blue-600 hover:border-blue-300 transition"
                    >
                      <Download size={13} />
                    </a>
                  </div>
                ))
              ) : (
                <div className="p-3 text-center text-xs text-slate-400">No recent reports.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
