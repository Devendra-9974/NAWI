import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { Instrument, ApiResponse } from '../types';
import { Scale, Plus, Search, FlaskConical, SlidersHorizontal, ArrowUpRight } from 'lucide-react';

export const Instruments: React.FC = () => {
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('ALL');

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

  const accuracyClasses = [
    { id: 'ALL', label: 'All Classes' },
    { id: 'CLASS_I', label: 'Class I (Special)' },
    { id: 'CLASS_II', label: 'Class II (High)' },
    { id: 'CLASS_III', label: 'Class III (Medium)' },
    { id: 'CLASS_IIII', label: 'Class IIII (Ordinary)' },
  ];

  const filtered = instruments.filter((i) => {
    const matchesQuery = `${i.instrumentId} ${i.modelName} ${i.serialNumber} ${i.manufacturerName} ${i.instrumentType}`
      .toLowerCase()
      .includes(query.toLowerCase());
    const matchesClass = selectedClass === 'ALL' || i.accuracyClass === selectedClass;
    return matchesQuery && matchesClass;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-headline-md text-xl sm:text-2xl font-bold text-on-surface tracking-tight">
              Instruments Registry
            </h1>
            <span className="font-mono text-xs bg-surface-container text-primary font-bold px-2 py-0.5 rounded">
              {instruments.length} NAWIs
            </span>
          </div>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
            Certified inventory of Non-Automatic Weighing Instruments subject to OIML R 76 evaluation.
          </p>
        </div>
        <Link
          to="/instruments/new"
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary-container text-white text-xs font-semibold py-2 px-4 rounded shadow-sm transition"
        >
          <Plus size={16} />
          <span>Register New Instrument</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-lg border border-surface-container shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 bg-surface-container-low px-3 py-1.5 rounded border border-surface-container">
            <Search size={16} className="text-on-surface-variant flex-shrink-0" />
            <input
              type="text"
              placeholder="Search by Instrument ID, Serial No, Model, Manufacturer..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full text-xs text-on-surface placeholder:text-on-surface-variant bg-transparent focus:outline-none"
            />
          </div>
        </div>

        {/* Accuracy Class Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
          <span className="text-xs text-on-surface-variant font-medium mr-1 flex items-center gap-1">
            <SlidersHorizontal size={13} /> Class:
          </span>
          {accuracyClasses.map((ac) => (
            <button
              key={ac.id}
              onClick={() => setSelectedClass(ac.id)}
              className={`text-xs px-2.5 py-1 rounded font-medium transition whitespace-nowrap ${
                selectedClass === ac.id
                  ? 'bg-primary text-white font-semibold shadow-sm'
                  : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
              }`}
            >
              {ac.label}
            </button>
          ))}
        </div>
      </div>

      {/* Instruments Table */}
      <div className="bg-white rounded-lg border border-surface-container shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-on-surface-variant">Loading instruments...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-on-surface-variant">
            No instruments found matching your search.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low border-b border-surface-container font-label-caps text-[11px] text-on-surface-variant uppercase tracking-wider">
                  <th className="py-2.5 px-4 font-semibold">Instrument ID</th>
                  <th className="py-2.5 px-4 font-semibold">Manufacturer</th>
                  <th className="py-2.5 px-4 font-semibold">Model & Type</th>
                  <th className="py-2.5 px-4 font-semibold">Serial Number</th>
                  <th className="py-2.5 px-4 font-semibold">Accuracy Class</th>
                  <th className="py-2.5 px-4 font-semibold">Capacity (Max / Min)</th>
                  <th className="py-2.5 px-4 font-semibold">Intervals (e / d / n)</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container text-xs">
                {filtered.map((inst) => (
                  <tr key={inst.id} className="hover:bg-surface-bright transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-primary">
                      {inst.instrumentId}
                    </td>
                    <td className="py-3 px-4 font-medium text-on-surface">
                      {inst.manufacturerName}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-on-surface">{inst.modelName}</div>
                      <div className="text-[11px] text-on-surface-variant">{inst.instrumentType}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-on-surface-variant">
                      {inst.serialNumber}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-[11px] bg-surface-container text-on-surface px-2 py-0.5 rounded font-bold">
                        {inst.accuracyClassDisplay || inst.accuracyClass}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-on-surface">
                      <div>
                        Max: <strong>{inst.maxCapacity} {inst.unit}</strong>
                      </div>
                      <div className="text-[11px] text-on-surface-variant">
                        Min: {inst.minCapacity} {inst.unit}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-on-surface-variant">
                      <div>
                        e: <strong className="text-on-surface">{inst.scaleIntervalE} {inst.unit}</strong>
                      </div>
                      <div>d: {inst.scaleIntervalD} {inst.unit}</div>
                      <div>n: {inst.numberOfIntervalsN ? inst.numberOfIntervalsN.toLocaleString() : '-'}</div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        to={`/tests/new?instrumentId=${inst.id}`}
                        className="inline-flex items-center gap-1 bg-surface-container hover:bg-surface-container-high text-primary font-semibold px-2.5 py-1 rounded transition text-xs"
                      >
                        <FlaskConical size={13} />
                        <span>Launch Test</span>
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
