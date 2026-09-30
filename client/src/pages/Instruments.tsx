import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { Instrument, ApiResponse } from '../types';
import { Scale, Plus, Search, FlaskConical } from 'lucide-react';

export const Instruments: React.FC = () => {
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    fetchInstruments();
  }, []);

  const fetchInstruments = async () => {
    try {
      const res = await api.get<ApiResponse<Instrument[]>>('/instruments');
      if (res.data.success) {
        setInstruments(res.data.data);
      }
    } catch (e) {
      console.error('Failed to load instruments', e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = instruments.filter((i) =>
    `${i.instrumentId} ${i.modelName} ${i.serialNumber} ${i.manufacturerName} ${i.instrumentType}`
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Instruments Registry</h1>
          <p className="text-sm text-slate-500">
            Registered Non-Automatic Weighing Instruments (NAWIs) subject to OIML R 76 evaluation.
          </p>
        </div>
        <Link
          to="/instruments/new"
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-lg shadow-sm text-sm transition"
        >
          <Plus size={16} />
          <span>Register New Instrument</span>
        </Link>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
        <Search size={18} className="text-slate-400" />
        <input
          type="text"
          placeholder="Filter by Instrument ID, Serial No, Model, Manufacturer..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-sm">Loading instruments...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">No instruments matched your criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Instrument ID</th>
                  <th className="px-5 py-3.5">Manufacturer</th>
                  <th className="px-5 py-3.5">Model & Type</th>
                  <th className="px-5 py-3.5">Serial Number</th>
                  <th className="px-5 py-3.5">Accuracy Class</th>
                  <th className="px-5 py-3.5">Capacity (Max / Min)</th>
                  <th className="px-5 py-3.5">Intervals (e / d / n)</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((inst) => (
                  <tr key={inst.id} className="hover:bg-slate-50 transition">
                    <td className="px-5 py-4 font-mono font-semibold text-slate-900">
                      {inst.instrumentId}
                    </td>
                    <td className="px-5 py-4 font-medium text-slate-800">
                      {inst.manufacturerName}
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-900">{inst.modelName}</div>
                      <div className="text-xs text-slate-500">{inst.instrumentType}</div>
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-slate-600">
                      {inst.serialNumber}
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        {inst.accuracyClassDisplay || inst.accuracyClass}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs font-medium text-slate-800">
                      <div>Max: {inst.maxCapacity} {inst.unit}</div>
                      <div className="text-slate-500">Min: {inst.minCapacity} {inst.unit}</div>
                    </td>
                    <td className="px-5 py-4 text-xs font-mono text-slate-600">
                      <div>e = {inst.scaleIntervalE} {inst.unit}</div>
                      <div>d = {inst.scaleIntervalD} {inst.unit}</div>
                      {inst.numberOfIntervalsN && (
                        <div className="text-slate-500">n = {inst.numberOfIntervalsN.toLocaleString()}</div>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        to={`/tests/new?instrumentId=${inst.id}`}
                        className="inline-flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 font-semibold px-2.5 py-1.5 rounded-lg text-xs transition"
                      >
                        <FlaskConical size={13} />
                        <span>Evaluate</span>
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
