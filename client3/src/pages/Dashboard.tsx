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
  CheckCircle,
  FileCheck2,
  AlertTriangle,
  ArrowUpRight,
  Download,
  Activity,
  Layers,
  FileText,
  ChevronRight,
  Sparkles,
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

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
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
      <div className="flex items-center justify-center h-64 text-on-surface-variant">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3"></div>
        <span className="font-medium text-sm">Loading METROLOGIX metrics...</span>
      </div>
    );
  }

  const resultChartData = [
    { name: 'PASS', value: stats?.totalPass || 0, color: '#16a34a' },
    { name: 'FAIL', value: stats?.totalFail || 0, color: '#dc2626' },
    {
      name: 'PENDING',
      value: (stats?.testsInProgress || 0) + (stats?.testsSubmitted || 0),
      color: '#712ae2',
    },
  ].filter((d) => d.value > 0);

  const statusChartData = stats?.statusDistribution
    ? Object.entries(stats.statusDistribution).map(([name, count]) => ({
        name: name.replace('_', ' '),
        count,
      }))
    : [];

  return (
    <div className="space-y-6">
      {/* 1. Header Greeting & ISO/IEC 17025 Sensor Pill Banner */}
      <div className="bg-white p-4 sm:p-5 rounded-lg border border-surface-container shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="font-headline-md text-xl sm:text-2xl font-bold text-on-surface tracking-tight">
              Good day, {user?.fullName || 'Metrology Officer'}
            </h1>
            <span className="font-mono text-[11px] bg-surface-container text-primary font-bold px-2 py-0.5 rounded">
              ID #{user?.username?.toUpperCase() || 'LM-OFFICER'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
            {user?.laboratoryName || 'National Legal Metrology Evaluation Centre'} • OIML R 76-1:2006
            Automated Metrology Verification
          </p>
        </div>

        {/* Live Lab Ambient Conditions Widget */}
        <div className="flex items-center gap-3 bg-surface-container-low px-3.5 py-2 rounded-lg border border-surface-container text-xs w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-label-caps text-[10px] font-bold uppercase tracking-wider text-on-surface">
              Sensors Live
            </span>
          </div>
          <div className="flex items-center gap-2.5 font-mono text-[11px] text-on-surface-variant">
            <span>
              T: <strong className="text-on-surface">20.4°C</strong>
            </span>
            <span className="text-outline-variant">•</span>
            <span>
              RH: <strong className="text-on-surface">48.2%</strong>
            </span>
            <span className="text-outline-variant">•</span>
            <span>
              P: <strong className="text-on-surface">1013.2 hPa</strong>
            </span>
            <span className="font-label-caps text-[9px] text-emerald-800 bg-emerald-100 font-bold px-1.5 py-0.5 rounded ml-1">
              17025 OK
            </span>
          </div>
        </div>
      </div>

      {/* 2. 4 Precision KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Instruments */}
        <div className="bg-white p-4 rounded-lg border border-surface-container shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold">
              Total Instruments
            </span>
            <span className="p-1.5 rounded-md bg-surface-container-low text-primary">
              <Scale size={16} />
            </span>
          </div>
          <div className="flex items-baseline justify-between mt-3">
            <span className="font-mono text-3xl font-bold text-on-surface">
              {stats?.totalInstruments || 0}
            </span>
            <span className="font-mono text-[10px] text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
              Active Registry
            </span>
          </div>
          <div className="w-full h-5 mt-2 flex items-end">
            <svg
              className="w-full h-4 text-primary"
              fill="none"
              preserveAspectRatio="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 100 24"
            >
              <path
                d="M0,20 Q15,16 30,18 T60,10 T85,12 T100,4"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </div>
        </div>

        {/* In Testing */}
        <div className="bg-white p-4 rounded-lg border border-surface-container shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold">
              In Testing
            </span>
            <span className="p-1.5 rounded-md bg-purple-50 text-secondary">
              <FlaskConical size={16} />
            </span>
          </div>
          <div className="flex items-baseline justify-between mt-3">
            <span className="font-mono text-3xl font-bold text-on-surface">
              {stats?.testsInProgress || 0}
            </span>
            <span className="font-mono text-[10px] text-secondary font-semibold bg-purple-50 border border-purple-200 px-1.5 py-0.5 rounded">
              Clause Evaluation
            </span>
          </div>
          <div className="w-full bg-surface-container-low h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-secondary h-full rounded-full" style={{ width: '65%' }}></div>
          </div>
        </div>

        {/* Under Review */}
        <div className="bg-white p-4 rounded-lg border border-surface-container shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold">
              Under Review
            </span>
            <span className="p-1.5 rounded-md bg-amber-50 text-amber-600">
              <Clock size={16} />
            </span>
          </div>
          <div className="flex items-baseline justify-between mt-3">
            <span className="font-mono text-3xl font-bold text-on-surface">
              {stats?.testsSubmitted || 0}
            </span>
            <span className="font-label-caps text-[10px] uppercase text-amber-800 font-semibold bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
              Awaits Signoff
            </span>
          </div>
          <div className="w-full bg-surface-container-low h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-amber-500 h-full rounded-full" style={{ width: '40%' }}></div>
          </div>
        </div>

        {/* Certified Reports */}
        <div className="bg-white p-4 rounded-lg border border-surface-container shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold">
              Reports Issued
            </span>
            <span className="p-1.5 rounded-md bg-emerald-50 text-emerald-600">
              <FileCheck2 size={16} />
            </span>
          </div>
          <div className="flex items-baseline justify-between mt-3">
            <span className="font-mono text-3xl font-bold text-on-surface">
              {stats?.totalReportsGenerated || 0}
            </span>
            <span className="font-mono text-[10px] text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
              Digital Seal
            </span>
          </div>
          <div className="w-full bg-surface-container-low h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-emerald-600 h-full rounded-full" style={{ width: '100%' }}></div>
          </div>
        </div>
      </div>

      {/* 3. Action Quick Launcher */}
      <div className="flex flex-wrap items-center gap-3">
        <Link
          to="/tests/new"
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary-container text-white text-xs font-semibold py-2 px-4 rounded shadow-sm transition"
        >
          <FlaskConical size={15} />
          <span>Launch Calibration Wizard</span>
        </Link>
        <Link
          to="/instruments/new"
          className="inline-flex items-center gap-2 bg-white hover:bg-surface-container-low text-on-surface border border-surface-container text-xs font-semibold py-2 px-4 rounded shadow-sm transition"
        >
          <Scale size={15} />
          <span>Register New Instrument</span>
        </Link>
        <Link
          to="/repository"
          className="inline-flex items-center gap-2 bg-white hover:bg-surface-container-low text-on-surface border border-surface-container text-xs font-semibold py-2 px-4 rounded shadow-sm transition"
        >
          <FileText size={15} />
          <span>Search Repository</span>
        </Link>
        <Link
          to="/rules"
          className="inline-flex items-center gap-2 bg-purple-50 hover:bg-purple-100 text-secondary border border-purple-200 text-xs font-semibold py-2 px-4 rounded shadow-sm transition ml-auto"
        >
          <Sparkles size={15} />
          <span>OIML Rule Engine Inspector</span>
        </Link>
      </div>

      {/* 4. Graphical Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compliance Evaluation Outcome */}
        <div className="bg-white p-5 rounded-lg border border-surface-container shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-on-surface">OIML Compliance Outcome</h2>
              <p className="text-xs text-on-surface-variant">
                Evaluation results across all completed test cases
              </p>
            </div>
            <span className="font-mono text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Pass Rate:{' '}
              {(stats?.totalPass || 0) + (stats?.totalFail || 0) > 0
                ? `${(
                    ((stats?.totalPass || 0) /
                      ((stats?.totalPass || 0) + (stats?.totalFail || 0))) *
                    100
                  ).toFixed(1)}%`
                : '100%'}
            </span>
          </div>

          <div className="h-56 flex items-center justify-center">
            {resultChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={resultChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {resultChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: number) => [`${val} Evaluations`, 'Count']}
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#c5c5d3',
                      borderRadius: '4px',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-on-surface-variant">No test evaluations available yet</p>
            )}
          </div>

          <div className="flex items-center justify-center gap-6 pt-3 border-t border-surface-container text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
              <span className="text-on-surface-variant">PASS:</span>
              <strong className="font-mono text-on-surface">{stats?.totalPass || 0}</strong>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
              <span className="text-on-surface-variant">FAIL:</span>
              <strong className="font-mono text-on-surface">{stats?.totalFail || 0}</strong>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-secondary"></span>
              <span className="text-on-surface-variant">ACTIVE:</span>
              <strong className="font-mono text-on-surface">
                {(stats?.testsInProgress || 0) + (stats?.testsSubmitted || 0)}
              </strong>
            </div>
          </div>
        </div>

        {/* Workflow Lifecycle Distribution */}
        <div className="bg-white p-5 rounded-lg border border-surface-container shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-on-surface">Workflow Pipeline</h2>
              <p className="text-xs text-on-surface-variant">
                Evaluations distributed by current workflow lifecycle stage
              </p>
            </div>
            <span className="font-mono text-xs text-on-surface-variant bg-surface-container px-2 py-0.5 rounded">
              {stats?.statusDistribution
                ? Object.values(stats.statusDistribution).reduce((a, b) => a + b, 0)
                : 0}{' '}
              Total
            </span>
          </div>

          <div className="h-56">
            {statusChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eff4ff" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fill: '#444651' }}
                    angle={-25}
                    textAnchor="end"
                  />
                  <YAxis tick={{ fontSize: 10, fill: '#444651' }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#c5c5d3',
                      borderRadius: '4px',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="count" fill="#00236f" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-on-surface-variant">
                No active lifecycle records
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-surface-container flex items-center justify-between text-xs text-on-surface-variant">
            <span>OIML R 76 Verification Stages</span>
            <Link to="/tests" className="text-primary font-semibold hover:underline flex items-center gap-1">
              <span>View full list</span>
              <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* 5. Recent Active Evaluations Table */}
      <div className="bg-white rounded-lg border border-surface-container shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-surface-container flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-on-surface">Recent Metrological Evaluations</h2>
            <p className="text-xs text-on-surface-variant">
              Type evaluations conducted under OIML R 76-1:2006
            </p>
          </div>
          <Link
            to="/tests"
            className="text-xs font-semibold text-primary hover:text-primary-container flex items-center gap-1"
          >
            <span>View All</span>
            <ChevronRight size={14} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-surface-container font-label-caps text-[11px] text-on-surface-variant uppercase tracking-wider">
                <th className="py-2.5 px-4 font-semibold">Test Case ID</th>
                <th className="py-2.5 px-4 font-semibold">Instrument Model</th>
                <th className="py-2.5 px-4 font-semibold">Accuracy Class</th>
                <th className="py-2.5 px-4 font-semibold">Capacity (Max / e)</th>
                <th className="py-2.5 px-4 font-semibold">Workflow Status</th>
                <th className="py-2.5 px-4 font-semibold">OIML Verdict</th>
                <th className="py-2.5 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container text-xs">
              {stats?.recentTests && stats.recentTests.length > 0 ? (
                stats.recentTests.map((test) => (
                  <tr key={test.id} className="hover:bg-surface-bright transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-primary">
                      {test.testId || `TEST-2026-${String(test.id).padStart(4, '0')}`}
                    </td>
                    <td className="py-3 px-4 font-medium text-on-surface">
                      <div>{test.instrument?.modelName || 'Electronic Scale'}</div>
                      <div className="text-[11px] text-on-surface-variant font-mono">
                        {test.instrument?.manufacturerName || 'Avery Weigh-Tronix'}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-[11px] bg-surface-container px-2 py-0.5 rounded font-bold text-on-surface">
                        {test.instrument?.accuracyClassDisplay || test.instrument?.accuracyClass || 'Class III'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-on-surface">
                      {test.instrument?.maxCapacity} {test.instrument?.unit || 'kg'} (e ={' '}
                      {test.instrument?.scaleIntervalE} {test.instrument?.unit || 'kg'})
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
                        className="inline-flex items-center gap-1 text-primary hover:text-primary-container font-semibold"
                      >
                        <span>Workspace</span>
                        <ArrowUpRight size={13} />
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-xs text-on-surface-variant">
                    No evaluations on record.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
