import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/client';
import { Instrument, Laboratory, StandardVersion, User, ApiResponse } from '../types';
import { FlaskConical, ArrowLeft, Save, AlertCircle } from 'lucide-react';

export const NewTestCase: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedInstrumentId = searchParams.get('instrumentId');

  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [laboratories, setLaboratories] = useState<Laboratory[]>([]);
  const [standardVersions, setStandardVersions] = useState<StandardVersion[]>([]);
  const [reviewers, setReviewers] = useState<User[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    instrumentId: preselectedInstrumentId || '',
    laboratoryId: '',
    standardVersionId: '',
    reviewerId: '',
    startDate: new Date().toISOString().split('T')[0],
    remarks: '',
  });

  useEffect(() => {
    fetchPrerequisites();
  }, []);

  const fetchPrerequisites = async () => {
    try {
      const [instrRes, labRes, stdRes] = await Promise.all([
        api.get<ApiResponse<Instrument[]>>('/instruments'),
        api.get<ApiResponse<Laboratory[]>>('/laboratories'),
        api.get<ApiResponse<StandardVersion[]>>('/standards/versions'),
      ]);

      if (instrRes.data.success && instrRes.data.data.length > 0) {
        setInstruments(instrRes.data.data);
        if (!preselectedInstrumentId) {
          setFormData((p) => ({ ...p, instrumentId: String(instrRes.data.data[0].id) }));
        }
      }

      if (labRes.data.success && labRes.data.data.length > 0) {
        setLaboratories(labRes.data.data);
        setFormData((p) => ({ ...p, laboratoryId: String(labRes.data.data[0].id) }));
      }

      if (stdRes.data.success && stdRes.data.data.length > 0) {
        setStandardVersions(stdRes.data.data);
        setFormData((p) => ({ ...p, standardVersionId: String(stdRes.data.data[0].id) }));
      }
    } catch (e) {
      console.error('Failed to load form prerequisites', e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload = {
        instrumentId: Number(formData.instrumentId),
        laboratoryId: Number(formData.laboratoryId),
        standardVersionId: Number(formData.standardVersionId),
        reviewerId: formData.reviewerId ? Number(formData.reviewerId) : null,
        startDate: formData.startDate,
        remarks: formData.remarks,
      };

      const res = await api.post('/tests', payload);
      if (res.data.success) {
        navigate(`/tests/${res.data.data.id}`);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to initialize test evaluation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/tests')}
          className="p-2 text-slate-400 hover:text-slate-600 rounded-lg transition"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Initiate NAWI Test Evaluation</h1>
          <p className="text-sm text-slate-500">
            Create an official evaluation dossier under OIML R 76.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-center gap-3 text-rose-700 text-sm">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Select Instrument Under Test *</label>
          <select
            required
            value={formData.instrumentId}
            onChange={(e) => setFormData({ ...formData, instrumentId: e.target.value })}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500"
          >
            {instruments.map((i) => (
              <option key={i.id} value={i.id}>
                {i.instrumentId} — {i.modelName} (SN: {i.serialNumber}, Class: {i.accuracyClass}, Max: {i.maxCapacity} {i.unit})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Testing Laboratory *</label>
            <select
              required
              value={formData.laboratoryId}
              onChange={(e) => setFormData({ ...formData, laboratoryId: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500"
            >
              {laboratories.map((lab) => (
                <option key={lab.id} value={lab.id}>
                  {lab.labName} ({lab.labCode})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">OIML Standard Version *</label>
            <select
              required
              value={formData.standardVersionId}
              onChange={(e) => setFormData({ ...formData, standardVersionId: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-sm font-semibold text-emerald-800 focus:ring-2 focus:ring-emerald-500"
            >
              {standardVersions.map((sv) => (
                <option key={sv.id} value={sv.id}>
                  OIML R 76-1: {sv.versionCode} (Official Version)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Evaluation Start Date</label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Initial Scope & Technical Remarks</label>
          <textarea
            rows={3}
            value={formData.remarks}
            onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500"
            placeholder="e.g. Type examination evaluation requested by applicant. Standard tests: Weighing, Repeatability, Eccentricity."
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => navigate('/tests')}
            className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-semibold text-sm transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-sm shadow-sm disabled:opacity-50 transition"
          >
            <FlaskConical size={16} />
            <span>{loading ? 'Initializing...' : 'Launch Workspace'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
