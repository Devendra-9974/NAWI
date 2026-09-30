import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { Rule, StandardVersion, ApiResponse, AccuracyClass } from '../types';
import { BookOpen, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const Rules: React.FC = () => {
  const [versions, setVersions] = useState<StandardVersion[]>([]);
  const [selectedVersionId, setSelectedVersionId] = useState<number | null>(null);
  const [rules, setRules] = useState<Rule[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('CLASS_III');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVersions();
  }, []);

  useEffect(() => {
    if (selectedVersionId) {
      fetchRules(selectedVersionId);
    }
  }, [selectedVersionId]);

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

  const filteredRules = rules.filter(
    (r) => r.accuracyClass === selectedClass && r.testCode === 'WEIGHING_PERFORMANCE'
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">OIML R 76 Regulatory Rule Engine</h1>
        <p className="text-sm text-slate-500">
          Official versioned metrological criteria, load intervals, and maximum permissible error (mpe) tiers.
        </p>
      </div>

      {/* Architecture Alert */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <ShieldCheck className="text-blue-600 mt-0.5" size={20} />
        <div className="text-xs text-blue-900 space-y-1">
          <p className="font-bold">Versioned Regulatory Engine Integrity Guarantee</p>
          <p>
            Regulatory requirements are strictly versioned. When an evaluation test case is executed, the exact ruleset snapshot (e.g.{' '}
            <code className="bg-blue-100 px-1 py-0.5 rounded font-mono">OIML R 76-1:2006_E</code>) is bound to the test record,
            ensuring historical test results and reports remain immutable if future revisions are introduced.
          </p>
        </div>
      </div>

      {/* Class Selector */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedClass('CLASS_III')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
            selectedClass === 'CLASS_III'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Class III (Medium Accuracy)
        </button>
        <button
          onClick={() => setSelectedClass('CLASS_II')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
            selectedClass === 'CLASS_II'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Class II (High Accuracy)
        </button>
        <button
          onClick={() => setSelectedClass('CLASS_I')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
            selectedClass === 'CLASS_I'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Class I (Special Accuracy)
        </button>
        <button
          onClick={() => setSelectedClass('CLASS_IIII')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
            selectedClass === 'CLASS_IIII'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Class IIII (Ordinary Accuracy)
        </button>
      </div>

      {/* Rules Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">
            Table 6: Maximum Permissible Errors (MPE) for Net Load ({selectedClass})
          </h2>
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            Official OIML R 76-1:2006 (E)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">Tier Name</th>
                <th className="px-5 py-3.5">Load Range (m in verification intervals e)</th>
                <th className="px-5 py-3.5">Maximum Permissible Error (mpe)</th>
                <th className="px-5 py-3.5">Official Standard Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-xs">
              {filteredRules.map((rule) => (
                <tr key={rule.id} className="hover:bg-slate-50 transition">
                  <td className="px-5 py-4 font-sans font-semibold text-slate-900">
                    {rule.ruleName}
                  </td>
                  <td className="px-5 py-4 text-slate-800 font-bold">
                    {rule.minLoadE} e ≤ m ≤ {rule.maxLoadE} e
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-block px-2.5 py-1 rounded bg-blue-50 text-blue-800 font-bold border border-blue-200">
                      ± {rule.mpeFactorE} e
                    </span>
                  </td>
                  <td className="px-5 py-4 font-sans">
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-xs">
                      <CheckCircle2 size={14} /> Official Clause Table 6
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
