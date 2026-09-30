import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { Report, ApiResponse } from '../types';
import { FileCheck2, Search, Download, Eye, FileText } from 'lucide-react';

export const Repository: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [formatFilter, setFormatFilter] = useState('');
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await api.get<ApiResponse<Report[]>>('/reports');
      if (res.data.success) {
        setReports(res.data.data);
      }
    } catch (e) {
      console.error('Failed to load repository', e);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (rep: Report) => {
    setDownloadingId(rep.id);
    try {
      const response = await api.get(`/reports/${rep.id}/download`, { responseType: 'blob' });
      const ext = rep.fileFormat === 'PDF' ? '.pdf' : '.docx';
      const filename = `${rep.reportNumber.replace(/\//g, '_')}${ext}`;
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Download failed, using direct link', e);
      window.open(`/api/reports/${rep.id}/download`, '_blank');
    } finally {
      setDownloadingId(null);
    }
  };

  const handlePreview = async (rep: Report) => {
    try {
      const response = await api.get(`/reports/${rep.id}/preview`, { responseType: 'blob' });
      const file = new Blob([response.data], { type: 'application/pdf' });
      const fileURL = URL.createObjectURL(file);
      window.open(fileURL, '_blank');
    } catch (e) {
      console.error('Preview failed', e);
      window.open(`/api/reports/${rep.id}/preview`, '_blank');
    }
  };

  const filtered = reports.filter((r) => {
    const matchesQuery = `${r.reportNumber} ${r.testId} ${r.instrumentId} ${r.instrumentModel} ${r.manufacturerName}`
      .toLowerCase()
      .includes(query.toLowerCase());
    const matchesFormat = formatFilter ? r.fileFormat === formatFilter : true;
    return matchesQuery && matchesFormat;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Digital Report Repository</h1>
          <p className="text-sm text-slate-500">
            Archival repository of standardized OIML R 76 Type Evaluation Test Reports.
          </p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="flex-1 flex items-center gap-3">
          <Search size={18} className="text-slate-400" />
          <input
            type="text"
            placeholder="Search by Report No, Test ID, Instrument ID, Model, Manufacturer..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-2 border-t sm:border-t-0 sm:border-l sm:pl-3 border-slate-200">
          <select
            value={formatFilter}
            onChange={(e) => setFormatFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-700"
          >
            <option value="">All Formats</option>
            <option value="PDF">PDF Only</option>
            <option value="DOCX">DOCX Only</option>
          </select>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-sm">Loading repository reports...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">No issued reports found in repository.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Report Number</th>
                  <th className="px-5 py-3.5">Evaluation Case</th>
                  <th className="px-5 py-3.5">Instrument Model</th>
                  <th className="px-5 py-3.5">Format</th>
                  <th className="px-5 py-3.5">Verdict</th>
                  <th className="px-5 py-3.5">SHA-256 Checksum</th>
                  <th className="px-5 py-3.5">Issued At</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((rep) => (
                  <tr key={rep.id} className="hover:bg-slate-50 transition">
                    <td className="px-5 py-4 font-mono font-bold text-slate-900">
                      {rep.reportNumber}
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-slate-600">
                      {rep.testId}
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-900">{rep.instrumentModel}</div>
                      <div className="text-xs text-slate-500">{rep.manufacturerName}</div>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${
                          rep.fileFormat === 'PDF'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}
                      >
                        {rep.fileFormat}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${
                          rep.overallResult === 'PASS'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                            : 'bg-rose-50 text-rose-700 border border-rose-300'
                        }`}
                      >
                        {rep.overallResult}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-mono text-[11px] text-slate-500">
                      <span title={rep.checksumSha256}>
                        {rep.checksumSha256 ? rep.checksumSha256.substring(0, 12) + '...' : '-'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-600">
                      {new Date(rep.generatedAt).toLocaleString()}
                    </td>
                    <td className="px-5 py-4 text-right space-x-2 whitespace-nowrap">
                      {rep.fileFormat === 'PDF' && (
                        <button
                          onClick={() => handlePreview(rep)}
                          className="inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-2.5 py-1.5 rounded-lg text-xs transition"
                          title="Preview PDF"
                        >
                          <Eye size={13} />
                          <span>Preview</span>
                        </button>
                      )}
                      <button
                        onClick={() => handleDownload(rep)}
                        disabled={downloadingId === rep.id}
                        className="inline-flex items-center gap-1 bg-slate-900 hover:bg-slate-800 text-white font-semibold px-3 py-1.5 rounded-lg text-xs transition shadow-sm"
                        title="Download Certificate"
                      >
                        <Download size={13} />
                        <span>{downloadingId === rep.id ? 'Downloading...' : 'Download'}</span>
                      </button>
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
