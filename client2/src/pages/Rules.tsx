import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { Rule, StandardVersion, ApiResponse } from '../types';
import { BookOpen, ShieldCheck, CheckCircle2, Calculator, Sparkles, Sliders } from 'lucide-react';

export const Rules: React.FC = () => {
  const [versions, setVersions] = useState<StandardVersion[]>([]);
  const [selectedVersionId, setSelectedVersionId] = useState<number | null>(null);
  const [rules, setRules] = useState<Rule[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('CLASS_III');
  const [loading, setLoading] = useState(true);

  // Simulator State
  const [simClass, setSimClass] = useState<string>('CLASS_III');
  const [simScaleInterval, setSimScaleInterval] = useState<number>(0.01);
  const [simLoad, setSimLoad] = useState<number>(10.0);
  const [simResult, setSimResult] = useState<{
    mInScaleIntervals: number;
    tier: string;
    mpeFactor: number;
    mpeValue: number;
  }>({
    mInScaleIntervals: 1000,
    tier: '500 e < m <= 2000 e',
    mpeFactor: 1.0,
    mpeValue: 0.01,
  });

  useEffect(() => {
    fetchVersions();
  }, []);

  useEffect(() => {
    if (selectedVersionId) {
      fetchRules(selectedVersionId);
    }
  }, [selectedVersionId]);

  useEffect(() => {
    calculateSimTolerance();
  }, [simClass, simScaleInterval, simLoad]);

  const fetchVersions = async () => {
    try {
      const res = await api.get<ApiResponse<StandardVersion[]>>('/standards/versions');
      if (res.data.success && res.data.data.length > 0) {
        setVersions(res.data.data);
        setSelectedVersionId(res.data.data[0].id);
      }
    } catch (e) {
      console.error('Failed to load standard versions', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchRules = async (vId: number) => {
    try {
      const res = await api.get<ApiResponse<Rule[]>>(`/standards/versions/${vId}/rules`);
      if (res.data.success) {
        setRules(res.data.data);
      }
    } catch (e) {
      console.error('Failed to load rules', e);
    }
  };

  const calculateSimTolerance = () => {
    const e = Number(simScaleInterval) || 0.01;
    const load = Number(simLoad) || 0;
    const m = load / e;

    let factor = 1.0;
    let tierText = '';

    if (simClass === 'CLASS_I') {
      if (m <= 50000) {
        factor = 0.5;
        tierText = '0 <= m <= 50 000 e';
      } else if (m <= 200000) {
        factor = 1.0;
        tierText = '50 000 e < m <= 200 000 e';
      } else {
        factor = 1.5;
        tierText = 'm > 200 000 e';
      }
    } else if (simClass === 'CLASS_II') {
      if (m <= 5000) {
        factor = 0.5;
        tierText = '0 <= m <= 5 000 e';
      } else if (m <= 20000) {
        factor = 1.0;
        tierText = '5 000 e < m <= 20 000 e';
      } else {
        factor = 1.5;
        tierText = '20 000 e < m <= 100 000 e';
      }
    } else if (simClass === 'CLASS_III') {
      if (m <= 500) {
        factor = 0.5;
        tierText = '0 <= m <= 500 e';
      } else if (m <= 2000) {
        factor = 1.0;
        tierText = '500 e < m <= 2 000 e';
      } else {
        factor = 1.5;
        tierText = '2 000 e < m <= 10 000 e';
      }
    } else {
      if (m <= 50) {
        factor = 0.5;
        tierText = '0 <= m <= 50 e';
      } else if (m <= 200) {
        factor = 1.0;
        tierText = '50 e < m <= 200 e';
      } else {
        factor = 1.5;
        tierText = '200 e < m <= 1 000 e';
      }
    }

    setSimResult({
      mInScaleIntervals: Number(m.toFixed(2)),
      tier: tierText,
      mpeFactor: factor,
      mpeValue: Number((factor * e).toFixed(6)),
    });
  };

  const filteredRules = rules.filter(
    (r) => r.accuracyClass === selectedClass && r.testCode === 'WEIGHING_PERFORMANCE'
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="font-headline-md text-xl sm:text-2xl font-bold text-on-surface tracking-tight">
            OIML Rule Engine & Regulatory Standards
          </h1>
          <span className="font-mono text-xs bg-purple-100 text-secondary font-bold px-2 py-0.5 rounded border border-purple-200">
            OIML R 76-1:2006
          </span>
        </div>
        <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
          Official versioned metrological criteria, verification intervals ($e$), and Maximum Permissible Error (mpe) limits.
        </p>
      </div>

      {/* Regulatory Guarantee Banner */}
      <div className="bg-white border-l-4 border-l-primary border border-surface-container rounded-lg p-4 shadow-sm flex items-start gap-3">
        <div className="p-2 rounded-md bg-surface-container-low text-primary flex-shrink-0">
          <ShieldCheck size={20} />
        </div>
        <div className="text-xs text-on-surface space-y-1">
          <p className="font-bold text-sm text-primary">Immutable Standard Versioning Guarantee</p>
          <p className="text-on-surface-variant">
            Metrological rules are versioned and tamper-evident. When a type evaluation is executed, the specific ruleset version (e.g.{' '}
            <code className="bg-surface-container px-1 py-0.5 rounded font-mono font-bold text-primary">
              2006_E
            </code>
            ) is permanently snapshot alongside test observations, guaranteeing historical legal certitude.
          </p>
        </div>
      </div>

      {/* Interactive Tolerance Calculator / Simulator */}
      <div className="bg-white rounded-lg border border-purple-200 shadow-sm p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-surface-container pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-purple-100 text-secondary">
              <Calculator size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-on-surface">
                Interactive OIML R 76 Tolerance Simulator
              </h2>
              <p className="text-[11px] text-on-surface-variant">
                Live evaluation of Table 6 Maximum Permissible Error (mpe) boundaries for any test load
              </p>
            </div>
          </div>
          <span className="font-label-caps text-[10px] uppercase font-bold text-secondary bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
            Real-Time Engine
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block font-label-caps text-[11px] uppercase text-on-surface-variant font-bold mb-1">
              Accuracy Class
            </label>
            <select
              value={simClass}
              onChange={(e) => setSimClass(e.target.value)}
              className="w-full text-xs bg-surface-container-low border border-surface-container rounded p-2 text-on-surface font-medium focus:outline-none focus:border-primary"
            >
              <option value="CLASS_I">Class I (Special)</option>
              <option value="CLASS_II">Class II (High)</option>
              <option value="CLASS_III">Class III (Medium)</option>
              <option value="CLASS_IIII">Class IIII (Ordinary)</option>
            </select>
          </div>

          <div>
            <label className="block font-label-caps text-[11px] uppercase text-on-surface-variant font-bold mb-1">
              Verification Interval (e)
            </label>
            <div className="flex items-center">
              <input
                type="number"
                step="0.001"
                min="0.0001"
                value={simScaleInterval}
                onChange={(e) => setSimScaleInterval(parseFloat(e.target.value) || 0.01)}
                className="w-full text-xs font-mono bg-surface-container-low border border-surface-container rounded-l p-2 text-on-surface focus:outline-none focus:border-primary"
              />
              <span className="bg-surface-container text-on-surface-variant px-3 py-2 text-xs font-mono border-y border-r border-surface-container rounded-r">
                unit
              </span>
            </div>
          </div>

          <div>
            <label className="block font-label-caps text-[11px] uppercase text-on-surface-variant font-bold mb-1">
              Applied Load (L)
            </label>
            <div className="flex items-center">
              <input
                type="number"
                step="0.1"
                min="0"
                value={simLoad}
                onChange={(e) => setSimLoad(parseFloat(e.target.value) || 0)}
                className="w-full text-xs font-mono bg-surface-container-low border border-surface-container rounded-l p-2 text-on-surface focus:outline-none focus:border-primary"
              />
              <span className="bg-surface-container text-on-surface-variant px-3 py-2 text-xs font-mono border-y border-r border-surface-container rounded-r">
                unit
              </span>
            </div>
          </div>
        </div>

        {/* Simulator Computation Output */}
        <div className="bg-purple-50/70 border border-purple-200 rounded p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-xs font-mono">
            <div>
              <span className="text-[10px] uppercase font-bold text-on-surface-variant block font-sans">
                Load in Intervals (m = L / e)
              </span>
              <strong className="text-sm text-primary">{simResult.mInScaleIntervals.toLocaleString()} e</strong>
            </div>
            <div className="border-l border-purple-200 pl-4">
              <span className="text-[10px] uppercase font-bold text-on-surface-variant block font-sans">
                Resolved Rule Tier
              </span>
              <strong className="text-xs text-on-surface">{simResult.tier}</strong>
            </div>
            <div className="border-l border-purple-200 pl-4">
              <span className="text-[10px] uppercase font-bold text-on-surface-variant block font-sans">
                Tolerance Factor
              </span>
              <strong className="text-sm text-secondary">±{simResult.mpeFactor} e</strong>
            </div>
          </div>

          <div className="bg-white px-4 py-2 rounded border border-purple-300 shadow-sm text-center">
            <span className="font-label-caps text-[10px] uppercase font-bold text-on-surface-variant block">
              Max Permissible Error (MPE)
            </span>
            <span className="font-mono text-base font-bold text-emerald-700">
              ±{simResult.mpeValue}
            </span>
          </div>
        </div>
      </div>

      {/* Accuracy Class Selector for Regulatory Matrix */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
        {[
          { id: 'CLASS_III', label: 'Class III (Medium Accuracy)' },
          { id: 'CLASS_II', label: 'Class II (High Accuracy)' },
          { id: 'CLASS_I', label: 'Class I (Special Accuracy)' },
          { id: 'CLASS_IIII', label: 'Class IIII (Ordinary Accuracy)' },
        ].map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedClass(c.id)}
            className={`px-3.5 py-1.5 rounded text-xs font-semibold transition whitespace-nowrap ${
              selectedClass === c.id
                ? 'bg-primary text-white shadow-sm'
                : 'bg-white text-on-surface border border-surface-container hover:bg-surface-container-low'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Rules Matrix Table */}
      <div className="bg-white rounded-lg border border-surface-container shadow-sm overflow-hidden">
        <div className="p-4 border-b border-surface-container flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-on-surface">
              OIML R 76-1:2006 Table 6 — Maximum Permissible Errors on Initial Verification
            </h2>
            <p className="text-xs text-on-surface-variant">
              Active regulatory tolerance thresholds mapped for {selectedClass.replace('_', ' ')}
            </p>
          </div>
          <span className="font-mono text-xs text-on-surface-variant bg-surface-container px-2 py-0.5 rounded">
            Version: {versions[0]?.versionCode || '2006_E'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-surface-container font-label-caps text-[11px] text-on-surface-variant uppercase tracking-wider">
                <th className="py-2.5 px-4 font-semibold">Tier / Rule Name</th>
                <th className="py-2.5 px-4 font-semibold">Min Load (e)</th>
                <th className="py-2.5 px-4 font-semibold">Max Load (e)</th>
                <th className="py-2.5 px-4 font-semibold">MPE Limit (Factor e)</th>
                <th className="py-2.5 px-4 font-semibold">Calculation Formula</th>
                <th className="py-2.5 px-4 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container text-xs">
              {filteredRules.length > 0 ? (
                filteredRules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-surface-bright transition-colors">
                    <td className="py-3 px-4 font-medium text-on-surface">
                      {rule.ruleName}
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-primary">
                      {rule.minLoadE} e
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-primary">
                      {rule.maxLoadE ? `${rule.maxLoadE} e` : 'Max Capacity'}
                    </td>
                    <td className="py-3 px-4 font-mono">
                      <span className="bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded border border-emerald-200">
                        ±{rule.mpeFactorE} e
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-on-surface-variant">
                      {rule.description || `mpe = ±${rule.mpeFactorE} * e`}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="inline-flex items-center gap-1 font-label-caps text-[10px] uppercase font-bold text-primary bg-surface-container px-2 py-0.5 rounded">
                        <CheckCircle2 size={12} className="text-primary" />
                        Official
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-xs text-on-surface-variant">
                    No rules recorded for this accuracy class.
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
