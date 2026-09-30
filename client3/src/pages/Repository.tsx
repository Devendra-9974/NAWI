import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { Report, ApiResponse } from '../types';
import { FileCheck2, Search, Download, Eye, FileText, CheckCircle2, ShieldCheck, Copy, Check } from 'lucide-react';
import { ComplianceBadge } from '../components/ComplianceBadge';

export const Repository: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [formatFilter, setFormatFilter] = useState('');
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

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

  const copyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const filtered = reports.filter((r) => {
    const matchesQuery = `${r.reportNumber} ${r.testId} ${r.instrumentId} ${r.instrumentModel} ${r.manufacturerName} ${r.generatedByName}`
      .toLowerCase()
      .includes(query.toLowerCase());
    const matchesFormat = formatFilter ? r.fileFormat === formatFilter : true;
    return matchesQuery && matchesFormat;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-headline-md text-xl sm:text-2xl font-bold text-on-surface tracking-tight">
              Verification Reports & Certificates
            </h1>
            <span className="font-mono text-xs bg-surface-container text-primary font-bold px-2 py-0.5 rounded">
              {reports.length} Sealed Documents
            </span>
          </div>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
            Standardized OIML R 76 Type Evaluation Certificates, digital signatures, and SHA-256 tamper-evident checksums.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-lg border border-surface-container shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 bg-surface-container-low px-3 py-1.5 rounded border border-surface-container">
            <Search size={16} className="text-on-surface-variant flex-shrink-0" />
            <input
              type="text"
              placeholder="Search by Report No, Test Case ID, Instrument Model, Officer..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full text-xs text-on-surface placeholder:text-on-surface-variant bg-transparent focus:outline-none"
            />
          </div>
        </div>

        {/* Format Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
          <span className="text-xs text-on-surface-variant font-medium mr-1">Format:</span>
          {[
            { id: '', label: 'All Reports' },
            { id: 'PDF', label: 'PDF Certificates' },
            { id: 'DOCX', label: 'DOCX Word Reports' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFormatFilter(f.id)}
              className={`text-xs px-3 py-1 rounded font-medium transition whitespace-nowrap ${
                formatFilter === f.id
                  ? 'bg-primary text-white font-semibold shadow-sm'
                  : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-lg border border-surface-container shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-on-surface-variant">
            Loading repository files...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-on-surface-variant">
            No certificates found in repository.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low border-b border-surface-container font-label-caps text-[11px] text-on-surface-variant uppercase tracking-wider">
                  <th className="py-2.5 px-4 font-semibold">Report Number</th>
                  <th className="py-2.5 px-4 font-semibold">Evaluation ID</th>
                  <th className="py-2.5 px-4 font-semibold">Instrument & Manufacturer</th>
                  <th className="py-2.5 px-4 font-semibold">OIML Outcome</th>
                  <th className="py-2.5 px-4 font-semibold">Digital Seal</th>
                  <th className="py-2.5 px-4 font-semibold">Format & Size</th>
                  <th className="py-2.5 px-4 font-semibold">SHA-256 Checksum</th>
                  <th className="py-2.5 px-4 font-semibold">Issued By & Date</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container text-xs">
                {filtered.map((rep) => (
                  <tr key={rep.id} className="hover:bg-surface-bright transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-primary">
                      {rep.reportNumber}
                    </td>
                    <td className="py-3 px-4 font-mono text-on-surface-variant">
                      {rep.testId}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-on-surface">{rep.instrumentModel}</div>
                      <div className="text-[11px] text-on-surface-variant font-mono">
                        {rep.manufacturerName}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <ComplianceBadge result={rep.overallResult || 'PASS'} />
                    </td>
                    <td className="py-3 px-4 font-mono">
                      <span
                        className={`inline-block px-2 py-0.5 rounded font-bold text-[10px] uppercase ${
                          rep.fileFormat === 'PDF'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}
                      >
                        {rep.fileFormat}
                      </span>
                      <span className="text-[11px] text-on-surface-variant ml-1.5">
                        {rep.fileSize ? `${(rep.fileSize / 1024).toFixed(1)} KB` : 'Draft'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {rep.checksumSha256 ? (
                        <div
                          className="flex items-center gap-1 cursor-pointer group"
                          onClick={() => copyHash(rep.checksumSha256)}
                          title="Click to copy full SHA-256"
                        >
                          <ShieldCheck size={13} className="text-emerald-600 flex-shrink-0" />
                          <span className="font-mono text-[10px] text-on-surface-variant group-hover:text-primary underline decoration-dotted">
                            {rep.checksumSha256.substring(0, 10)}...
                          </span>
                          {copiedHash === rep.checksumSha256 ? (
                            <Check size={11} className="text-emerald-600" />
                          ) : (
                            <Copy size={11} className="text-outline-variant opacity-0 group-hover:opacity-100" />
                          )}
                        </div>
                      ) : (
                        <span className="text-outline text-[11px]">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-on-surface-variant">
                      <div>{rep.generatedByName || 'Verification Officer'}</div>
                      <div className="text-[11px] font-mono">
                        {rep.generatedAt ? new Date(rep.generatedAt).toLocaleDateString() : 'Active'}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {rep.fileFormat === 'PDF' && (
                          <button
                            onClick={() => handlePreview(rep)}
                            title="Preview PDF"
                            className="p-1 rounded bg-surface-container-low hover:bg-surface-container text-primary transition"
                          >
                            <Eye size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDownload(rep)}
                          disabled={downloadingId === rep.id}
                          className="inline-flex items-center gap-1 bg-primary hover:bg-primary-container text-white px-2.5 py-1 rounded text-xs font-semibold shadow-sm transition disabled:opacity-50"
                        >
                          <Download size={13} />
                          <span>{downloadingId === rep.id ? 'Saving...' : 'Download'}</span>
                        </button>
                      </div>
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
