import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { Manufacturer, ApiResponse, AccuracyClass } from '../types';
import { Scale, ArrowLeft, Save, AlertCircle } from 'lucide-react';

export const NewInstrument: React.FC = () => {
  const navigate = useNavigate();
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    manufacturerId: '',
    modelName: '',
    modelNumber: '',
    serialNumber: '',
    instrumentType: 'Electronic Platform Scale',
    accuracyClass: 'CLASS_III' as AccuracyClass,
    maxCapacity: '',
    minCapacity: '',
    scaleIntervalE: '',
    scaleIntervalD: '',
    unit: 'kg',
    numLoadCells: '1',
    indicatorInfo: '',
    firmwareVersion: '',
    technicalSpecifications: '',
  });

  useEffect(() => {
    fetchManufacturers();
  }, []);

  const fetchManufacturers = async () => {
    try {
      const res = await api.get<ApiResponse<Manufacturer[]>>('/manufacturers');
      if (res.data.success && res.data.data.length > 0) {
        setManufacturers(res.data.data);
        setFormData((prev) => ({ ...prev, manufacturerId: String(res.data.data[0].id) }));
      }
    } catch (e) {
      console.error('Failed to load manufacturers', e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload = {
        manufacturerId: Number(formData.manufacturerId),
        modelName: formData.modelName,
        modelNumber: formData.modelNumber,
        serialNumber: formData.serialNumber,
        instrumentType: formData.instrumentType,
        accuracyClass: formData.accuracyClass,
        maxCapacity: Number(formData.maxCapacity),
        minCapacity: Number(formData.minCapacity),
        scaleIntervalE: Number(formData.scaleIntervalE),
        scaleIntervalD: Number(formData.scaleIntervalD),
        unit: formData.unit,
        numLoadCells: Number(formData.numLoadCells),
        indicatorInfo: formData.indicatorInfo,
        firmwareVersion: formData.firmwareVersion,
        technicalSpecifications: formData.technicalSpecifications,
      };

      const res = await api.post('/instruments', payload);
      if (res.data.success) {
        navigate('/instruments');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to register instrument');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/instruments')}
          className="p-2 text-slate-400 hover:text-slate-600 rounded-lg transition"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Register NAWI Instrument</h1>
          <p className="text-sm text-slate-500">
            Define metrological characteristics under OIML R 76.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-center gap-3 text-rose-700 text-sm">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
        {/* Section 1: Identification */}
        <div>
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b pb-2">
            1. Identification & Manufacturer
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Manufacturer *</label>
              <select
                required
                value={formData.manufacturerId}
                onChange={(e) => setFormData({ ...formData, manufacturerId: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500"
              >
                {manufacturers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.country})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Instrument Type *</label>
              <input
                type="text"
                required
                value={formData.instrumentType}
                onChange={(e) => setFormData({ ...formData, instrumentType: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500"
                placeholder="e.g. Platform Scale, Analytical Balance"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Model Name *</label>
              <input
                type="text"
                required
                value={formData.modelName}
                onChange={(e) => setFormData({ ...formData, modelName: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500"
                placeholder="e.g. PrecisionPro-5000"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Model Number</label>
              <input
                type="text"
                value={formData.modelNumber}
                onChange={(e) => setFormData({ ...formData, modelNumber: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500"
                placeholder="e.g. PP-50K"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Serial Number *</label>
              <input
                type="text"
                required
                value={formData.serialNumber}
                onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-sm font-mono focus:ring-2 focus:ring-emerald-500"
                placeholder="e.g. SN-2026-9901"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Metrological Characteristics */}
        <div>
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b pb-2">
            2. OIML R 76 Metrological Characteristics
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Accuracy Class *</label>
              <select
                required
                value={formData.accuracyClass}
                onChange={(e) => setFormData({ ...formData, accuracyClass: e.target.value as AccuracyClass })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500"
              >
                <option value="CLASS_I">Class I (Special Accuracy)</option>
                <option value="CLASS_II">Class II (High Accuracy)</option>
                <option value="CLASS_III">Class III (Medium Accuracy)</option>
                <option value="CLASS_IIII">Class IIII (Ordinary Accuracy)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Unit of Measurement *</label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500"
              >
                <option value="kg">kg (Kilograms)</option>
                <option value="g">g (Grams)</option>
                <option value="mg">mg (Milligrams)</option>
                <option value="t">t (Metric Tons)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Max Capacity (Max) *</label>
              <input
                type="number"
                step="any"
                required
                value={formData.maxCapacity}
                onChange={(e) => setFormData({ ...formData, maxCapacity: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500"
                placeholder="e.g. 30.00"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Min Capacity (Min) *</label>
              <input
                type="number"
                step="any"
                required
                value={formData.minCapacity}
                onChange={(e) => setFormData({ ...formData, minCapacity: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500"
                placeholder="e.g. 0.10"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Verification Interval (e) *</label>
              <input
                type="number"
                step="any"
                required
                value={formData.scaleIntervalE}
                onChange={(e) => setFormData({ ...formData, scaleIntervalE: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500"
                placeholder="e.g. 0.01"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Actual Interval (d) *</label>
              <input
                type="number"
                step="any"
                required
                value={formData.scaleIntervalD}
                onChange={(e) => setFormData({ ...formData, scaleIntervalD: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500"
                placeholder="e.g. 0.01"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Technical Specifications */}
        <div>
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b pb-2">
            3. Construction & Technical Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Indicator / Terminal Info</label>
              <input
                type="text"
                value={formData.indicatorInfo}
                onChange={(e) => setFormData({ ...formData, indicatorInfo: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500"
                placeholder="e.g. DI-700 with LED display"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Firmware Version</label>
              <input
                type="text"
                value={formData.firmwareVersion}
                onChange={(e) => setFormData({ ...formData, firmwareVersion: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500"
                placeholder="e.g. v2.4.1"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Technical Specifications</label>
              <textarea
                rows={3}
                value={formData.technicalSpecifications}
                onChange={(e) => setFormData({ ...formData, technicalSpecifications: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500"
                placeholder="Pan dimensions, load cell model, temperature range, interface ports..."
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => navigate('/instruments')}
            className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-semibold text-sm transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-sm shadow-sm disabled:opacity-50 transition"
          >
            <Save size={16} />
            <span>{loading ? 'Registering...' : 'Save Instrument'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
