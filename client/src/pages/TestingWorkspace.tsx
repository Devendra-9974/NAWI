import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  TestCase,
  TestExecution,
  ApiResponse,
  LaboratoryCondition,
  Report,
  Attachment,
  AttachmentCategory,
  DigitalSignature,
} from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { ComplianceBadge } from '../components/ComplianceBadge';
import {
  Scale,
  FlaskConical,
  Save,
  CheckCircle,
  AlertCircle,
  Play,
  Send,
  FileDown,
  Eye,
  Plus,
  Trash2,
  Thermometer,
  FileCheck2,
  Sparkles,
  X,
  Camera,
  Upload,
  FileText,
  ShieldCheck,
  Download,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

export const TestingWorkspace: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isReviewer, isTechnician } = useAuth();

  const [testCase, setTestCase] = useState<TestCase | null>(null);
  const [activeTab, setActiveTab] = useState<string>('weighing');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [generatingFormat, setGeneratingFormat] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Existing generated reports for this test case
  const [reports, setReports] = useState<Report[]>([]);

  // Conditions Form State
  const [conditions, setConditions] = useState<LaboratoryCondition>({
    temperatureCelsius: 22.5,
    relativeHumidityPct: 48.0,
    atmosphericPressureHpa: 1013.2,
    referenceStandardsUsed: 'E2 Class Stainless Steel Mass Set (1 mg to 20 kg)',
    calibrationCertNo: 'NPLI-CAL-2026-7810',
    operatorName: user?.fullName || 'Metrology Technician',
    remarks: 'Ambient conditions verified before commencement of test evaluation.',
  });

  // Active Observation Rows for the selected execution
  const [observations, setObservations] = useState<any[]>([]);

  // Review Dialog State
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewAction, setReviewAction] = useState<'APPROVE' | 'REJECT'>('APPROVE');
  const [reviewComments, setReviewComments] = useState('');

  // PDF Preview State
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);

  // Attachments State
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [attachmentCategory, setAttachmentCategory] = useState<AttachmentCategory>('INSTRUMENT_PHOTO');
  const [attachmentDescription, setAttachmentDescription] = useState('');
  const [attachmentIncludeInReport, setAttachmentIncludeInReport] = useState(true);

  // Digital Signature State for Review Modal
  const [signImmediately, setSignImmediately] = useState(true);
  const [signerRole, setSignerRole] = useState('Senior Legal Metrology Verification Officer');
  const [signatureDeclaration, setSignatureDeclaration] = useState(
    'I hereby certify under official Legal Metrology authority that this evaluation has been verified in strict compliance with OIML R 76-1:2006.'
  );

  useEffect(() => {
    fetchTestCase();
    fetchReports();
    fetchAttachments();
  }, [id]);

  const fetchAttachments = async () => {
    if (!id) return;
    try {
      const res = await api.get<ApiResponse<Attachment[]>>(`/attachments/test/${id}`);
      if (res.data.success) {
        setAttachments(res.data.data);
      }
    } catch (e) {
      console.error('Failed to load attachments', e);
    }
  };

  const handleUploadAttachment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!attachmentFile || !id) return;
    setUploadingAttachment(true);
    try {
      const formData = new FormData();
      formData.append('file', attachmentFile);
      formData.append('category', attachmentCategory);
      formData.append('testCaseId', id);
      formData.append('description', attachmentDescription);
      formData.append('includeInReport', String(attachmentIncludeInReport));

      const res = await api.post<ApiResponse<Attachment>>('/attachments/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        setAttachmentFile(null);
        setAttachmentDescription('');
        fetchAttachments();
        setSuccessMsg('Photograph / Evidence uploaded successfully!');
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to upload attachment');
    } finally {
      setUploadingAttachment(false);
    }
  };

  const handleDeleteAttachment = async (attId: number) => {
    if (!confirm('Are you sure you want to delete this attachment?')) return;
    try {
      const res = await api.delete<ApiResponse<void>>(`/attachments/${attId}`);
      if (res.data.success) {
        fetchAttachments();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete attachment');
    }
  };

  const fetchTestCase = async () => {
    try {
      const res = await api.get<ApiResponse<TestCase>>(`/tests/${id}`);
      if (res.data.success) {
        const tc = res.data.data;
        setTestCase(tc);
        if (tc.laboratoryCondition) {
          setConditions(tc.laboratoryCondition);
        }
        loadExecutionObservations(tc, activeTab);
      }
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to load test case');
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async () => {
    try {
      const res = await api.get<ApiResponse<Report[]>>('/reports');
      if (res.data.success) {
        setReports(res.data.data.filter((r) => String(r.testCaseId) === String(id)));
      }
    } catch (e) {
      console.error('Failed to load reports', e);
    }
  };

  const loadExecutionObservations = (tc: TestCase, tab: string) => {
    let testCode = 'WEIGHING_PERFORMANCE';
    if (tab === 'repeatability') testCode = 'REPEATABILITY';
    if (tab === 'eccentricity') testCode = 'ECCENTRICITY';

    const exec = tc.testExecutions.find((e) => e.testCode === testCode);
    if (exec && exec.observations && exec.observations.length > 0) {
      setObservations(
        exec.observations.map((o) => ({
          pointIndex: o.pointIndex,
          loadDirection: o.loadDirection,
          appliedLoad: o.appliedLoad,
          indicatedValue: o.indicatedValue,
          changeoverLoad: o.changeoverLoad ?? '',
          positionLocation: o.positionLocation || 'CENTER',
          errorValue: o.errorValue,
          correctedError: o.correctedError,
          mpeValue: o.mpeValue,
          pointCompliance: o.pointCompliance,
        }))
      );
    } else {
      if (testCode === 'WEIGHING_PERFORMANCE') {
        prefillWeighingPoints(tc);
      } else if (testCode === 'REPEATABILITY') {
        prefillRepeatabilityPoints(tc);
      } else if (testCode === 'ECCENTRICITY') {
        prefillEccentricityPoints(tc);
      }
    }
  };

  const prefillWeighingPoints = (tc: TestCase) => {
    const max = Number(tc.instrument.maxCapacity);
    const e = Number(tc.instrument.scaleIntervalE);
    const points = [
      { pointIndex: 1, loadDirection: 'INCREASING', appliedLoad: 0, indicatedValue: 0, changeoverLoad: '' },
      { pointIndex: 2, loadDirection: 'INCREASING', appliedLoad: Number((500 * e).toFixed(4)), indicatedValue: Number((500 * e).toFixed(4)), changeoverLoad: '' },
      { pointIndex: 3, loadDirection: 'INCREASING', appliedLoad: Number((1000 * e).toFixed(4)), indicatedValue: Number((1000 * e + 0.5 * e).toFixed(4)), changeoverLoad: Number((0.5 * e).toFixed(4)) },
      { pointIndex: 4, loadDirection: 'INCREASING', appliedLoad: Number((2000 * e).toFixed(4)), indicatedValue: Number((2000 * e).toFixed(4)), changeoverLoad: '' },
      { pointIndex: 5, loadDirection: 'INCREASING', appliedLoad: max, indicatedValue: max, changeoverLoad: '' },
      { pointIndex: 6, loadDirection: 'DECREASING', appliedLoad: Number((2000 * e).toFixed(4)), indicatedValue: Number((2000 * e).toFixed(4)), changeoverLoad: '' },
      { pointIndex: 7, loadDirection: 'DECREASING', appliedLoad: 0, indicatedValue: 0, changeoverLoad: '' },
    ];
    setObservations(points);
  };

  const prefillRepeatabilityPoints = (tc: TestCase) => {
    const halfMax = Number((Number(tc.instrument.maxCapacity) * 0.5).toFixed(4));
    const points = [
      { pointIndex: 1, loadDirection: 'INCREASING', appliedLoad: halfMax, indicatedValue: halfMax, changeoverLoad: '' },
      { pointIndex: 2, loadDirection: 'INCREASING', appliedLoad: halfMax, indicatedValue: Number((halfMax + Number(tc.instrument.scaleIntervalE) * 0.2).toFixed(4)), changeoverLoad: '' },
      { pointIndex: 3, loadDirection: 'INCREASING', appliedLoad: halfMax, indicatedValue: halfMax, changeoverLoad: '' },
    ];
    setObservations(points);
  };

  const prefillEccentricityPoints = (tc: TestCase) => {
    const testLoad = Number((Number(tc.instrument.maxCapacity) * 0.3333).toFixed(4));
    const positions = ['CENTER', 'CORNER_1', 'CORNER_2', 'CORNER_3', 'CORNER_4'];
    const points = positions.map((pos, idx) => ({
      pointIndex: idx + 1,
      loadDirection: 'INCREASING',
      appliedLoad: testLoad,
      indicatedValue: testLoad,
      changeoverLoad: '',
      positionLocation: pos,
    }));
    setObservations(points);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (testCase) {
      loadExecutionObservations(testCase, tab);
    }
  };

  const getCurrentExecution = (): TestExecution | undefined => {
    if (!testCase) return undefined;
    let code = 'WEIGHING_PERFORMANCE';
    if (activeTab === 'repeatability') code = 'REPEATABILITY';
    if (activeTab === 'eccentricity') code = 'ECCENTRICITY';
    return testCase.testExecutions.find((e) => e.testCode === code);
  };

  const handleSaveConditions = async () => {
    if (!testCase) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await api.post(`/tests/${testCase.id}/conditions`, conditions);
      if (res.data.success) {
        setSuccessMsg('Laboratory and environmental conditions saved successfully.');
        setTimeout(() => setSuccessMsg(null), 3000);
        fetchTestCase();
      }
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to save laboratory conditions');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveObservationsAndCalculate = async () => {
    const exec = getCurrentExecution();
    if (!testCase || !exec) return;

    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        observations: observations.map((o) => ({
          pointIndex: Number(o.pointIndex),
          loadDirection: o.loadDirection,
          appliedLoad: Number(o.appliedLoad),
          nominalValue: Number(o.appliedLoad),
          indicatedValue: Number(o.indicatedValue),
          changeoverLoad: o.changeoverLoad !== '' ? Number(o.changeoverLoad) : null,
          positionLocation: o.positionLocation,
        })),
      };

      await api.post(`/tests/${testCase.id}/executions/${exec.id}/observations`, payload);

      const calcRes = await api.post<ApiResponse<TestExecution>>(
        `/tests/${testCase.id}/executions/${exec.id}/calculate`
      );

      if (calcRes.data.success) {
        setSuccessMsg(
          `Calculation Engine executed: Result is ${calcRes.data.data.testResult}`
        );
        setTimeout(() => setSuccessMsg(null), 3500);
        fetchTestCase();
      }
    } catch (e: any) {
      setError(e.response?.data?.message || 'Calculation or validation error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitForReview = async () => {
    if (!testCase) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await api.post(`/tests/${testCase.id}/submit`);
      if (res.data.success) {
        setSuccessMsg('Evaluation successfully submitted for technical review!');
        setTimeout(() => setSuccessMsg(null), 3500);
        fetchTestCase();
      }
    } catch (e: any) {
      setError(e.response?.data?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleProcessReview = async () => {
    if (!testCase) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await api.post(`/tests/${testCase.id}/review`, {
        action: reviewAction,
        comments: reviewComments,
      });
      if (res.data.success) {
        setShowReviewModal(false);
        setSuccessMsg(`Review recorded: Evaluation marked as ${res.data.data.status}`);
        setTimeout(() => setSuccessMsg(null), 3500);
        fetchTestCase();
      }
    } catch (e: any) {
      setError(e.response?.data?.message || 'Review processing failed');
    } finally {
      setSubmitting(false);
    }
  };

  // Automated Report Generation & Instant Browser Download
  const handleGenerateAndDownload = async (format: 'PDF' | 'DOCX') => {
    if (!testCase) return;
    setGeneratingFormat(format);
    setError(null);

    try {
      // 1. Trigger backend generation / update
      const genRes = await api.post<ApiResponse<Report>>(
        `/reports/test/${testCase.id}/generate?format=${format}`
      );

      if (!genRes.data.success) {
        throw new Error(genRes.data.message || 'Generation failed');
      }

      const generatedReport = genRes.data.data;
      setSuccessMsg(`Generated ${format} report: ${generatedReport.reportNumber}. Downloading...`);

      // 2. Fetch binary stream via authenticated endpoint
      const response = await api.get(`/reports/${generatedReport.id}/download`, {
        responseType: 'blob',
      });

      // 3. Trigger immediate browser download
      const ext = format === 'PDF' ? '.pdf' : '.docx';
      const filename = `${generatedReport.reportNumber.replace(/\//g, '_')}${ext}`;
      const blob = new Blob([response.data], {
        type: format === 'PDF' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      fetchReports();
      fetchTestCase();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      console.error('Report generation error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to generate report');
    } finally {
      setGeneratingFormat(null);
    }
  };

  // Preview PDF in browser modal
  const handlePreviewPdf = async () => {
    if (!testCase) return;
    setGeneratingFormat('PREVIEW');
    setError(null);
    try {
      // Find or generate PDF
      let pdfReport = reports.find((r) => r.fileFormat === 'PDF');
      if (!pdfReport) {
        const genRes = await api.post<ApiResponse<Report>>(`/reports/test/${testCase.id}/generate?format=PDF`);
        if (genRes.data.success) {
          pdfReport = genRes.data.data;
          fetchReports();
        }
      }

      if (pdfReport) {
        const response = await api.get(`/reports/${pdfReport.id}/preview`, { responseType: 'blob' });
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        setPreviewBlobUrl(url);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not load PDF preview');
    } finally {
      setGeneratingFormat(null);
    }
  };

  const addObservationRow = () => {
    setObservations((prev) => [
      ...prev,
      {
        pointIndex: prev.length + 1,
        loadDirection: 'INCREASING',
        appliedLoad: 0,
        indicatedValue: 0,
        changeoverLoad: '',
        positionLocation: 'CENTER',
      },
    ]);
  };

  const removeObservationRow = (index: number) => {
    setObservations((prev) => prev.filter((_, idx) => idx !== index));
  };

  const updateObservationField = (index: number, field: string, val: any) => {
    setObservations((prev) =>
      prev.map((row, idx) => (idx === index ? { ...row, [field]: val } : row))
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mr-3"></div>
        <span>Loading testing workspace...</span>
      </div>
    );
  }

  if (!testCase) {
    return (
      <div className="p-8 text-center text-rose-600 bg-white rounded-xl border border-rose-200">
        Evaluation case not found.
      </div>
    );
  }

  const currentExec = getCurrentExecution();
  const canEdit = testCase.status !== 'APPROVED' && testCase.status !== 'REPORT_GENERATED';

  // Format chart data for error vs load curve
  const chartData = observations
    .filter((o) => o.errorValue !== undefined && o.mpeValue !== undefined)
    .map((o) => ({
      load: Number(o.appliedLoad),
      error: Number(o.correctedError ?? o.errorValue),
      upperMpe: Number(o.mpeValue),
      lowerMpe: -Number(o.mpeValue),
    }))
    .sort((a, b) => a.load - b.load);

  return (
    <div className="space-y-6">
      {/* Digital Signature Official Seal Banner */}
      {testCase.digitalSignature && (
        <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400">
              <ShieldCheck size={32} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-bold text-white tracking-tight">Digitally Signed & Certified Type Evaluation</span>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {testCase.digitalSignature.signatureReference}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Signer: <strong className="text-white">{testCase.digitalSignature.signerName}</strong> ({testCase.digitalSignature.signerRole}) &bull; Verified on {new Date(testCase.digitalSignature.signedAt).toLocaleString()}
              </p>
              <p className="text-[10px] font-mono text-emerald-400/80 mt-0.5">
                SHA-256 Digest: {testCase.digitalSignature.signatureDigest.slice(0, 36)}... &bull; Status: Valid
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-950/60 px-3 py-1.5 rounded-lg border border-emerald-700/60">
              <CheckCircle size={14} />
              OIML R 76-1 Compliant
            </span>
          </div>
        </div>
      )}

      {/* Workspace Header */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight font-mono">
                {testCase.testId}
              </h1>
              <StatusBadge status={testCase.status} />
              <ComplianceBadge result={testCase.overallResult} size="md" />
            </div>
            <p className="text-sm text-slate-600">
              <span className="font-semibold text-slate-900">{testCase.instrument.modelName}</span> (SN: {testCase.instrument.serialNumber})
              {' — '}
              <span className="font-medium text-blue-700">{testCase.instrument.accuracyClassDisplay || testCase.instrument.accuracyClass}</span>
              {' | '}Max: {testCase.instrument.maxCapacity} {testCase.instrument.unit} | e: {testCase.instrument.scaleIntervalE} {testCase.instrument.unit}
            </p>
            <p className="text-xs text-slate-400">
              Laboratory: {testCase.laboratoryName} | Standard: OIML R 76-1: {testCase.standardVersionCode} | Technician: {testCase.technicianName}
            </p>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            {canEdit && testCase.status !== 'SUBMITTED' && (
              <button
                onClick={handleSubmitForReview}
                disabled={submitting}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-sm text-xs transition"
              >
                <Send size={15} />
                <span>Submit for Review</span>
              </button>
            )}

            {isReviewer && (testCase.status === 'SUBMITTED' || testCase.status === 'UNDER_REVIEW') && (
              <button
                onClick={() => setShowReviewModal(true)}
                className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg shadow-sm text-xs transition"
              >
                <CheckCircle size={15} />
                <span>Review Decision</span>
              </button>
            )}

            {/* Always Available Download & Preview Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleGenerateAndDownload('PDF')}
                disabled={generatingFormat !== null}
                className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-3.5 rounded-lg shadow-sm text-xs transition disabled:opacity-50"
              >
                <FileDown size={15} />
                <span>{generatingFormat === 'PDF' ? 'Generating PDF...' : 'Download PDF'}</span>
              </button>
              <button
                onClick={() => handleGenerateAndDownload('DOCX')}
                disabled={generatingFormat !== null}
                className="inline-flex items-center gap-1.5 bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2 px-3.5 rounded-lg shadow-sm text-xs transition disabled:opacity-50"
              >
                <FileDown size={15} />
                <span>{generatingFormat === 'DOCX' ? 'Generating DOCX...' : 'Download DOCX'}</span>
              </button>
              <button
                onClick={handlePreviewPdf}
                disabled={generatingFormat !== null}
                className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-900 text-white font-semibold py-2 px-3 rounded-lg shadow-sm text-xs transition disabled:opacity-50"
              >
                <Eye size={15} />
                <span>{generatingFormat === 'PREVIEW' ? 'Loading...' : 'Preview'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center gap-2 text-sm shadow-sm">
          <CheckCircle size={18} className="text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl flex items-center gap-2 text-sm shadow-sm">
          <AlertCircle size={18} className="text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Workspace Tabs */}
      <div className="border-b border-slate-200 bg-white rounded-t-xl px-4 flex space-x-2 overflow-x-auto shadow-sm">
        <button
          onClick={() => handleTabChange('conditions')}
          className={`py-3.5 px-4 font-semibold text-xs border-b-2 flex items-center gap-2 whitespace-nowrap transition ${
            activeTab === 'conditions'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Thermometer size={16} />
          <span>1. Lab Conditions</span>
          {testCase.laboratoryCondition && (
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          )}
        </button>

        <button
          onClick={() => handleTabChange('weighing')}
          className={`py-3.5 px-4 font-semibold text-xs border-b-2 flex items-center gap-2 whitespace-nowrap transition ${
            activeTab === 'weighing'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Scale size={16} />
          <span>2. Weighing Test (A.4.4)</span>
          {testCase.testExecutions.find((e) => e.testCode === 'WEIGHING_PERFORMANCE')?.testResult && (
            <ComplianceBadge
              result={testCase.testExecutions.find((e) => e.testCode === 'WEIGHING_PERFORMANCE')!.testResult}
            />
          )}
        </button>

        <button
          onClick={() => handleTabChange('repeatability')}
          className={`py-3.5 px-4 font-semibold text-xs border-b-2 flex items-center gap-2 whitespace-nowrap transition ${
            activeTab === 'repeatability'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FlaskConical size={16} />
          <span>3. Repeatability (A.4.10)</span>
          {testCase.testExecutions.find((e) => e.testCode === 'REPEATABILITY')?.testResult && (
            <ComplianceBadge
              result={testCase.testExecutions.find((e) => e.testCode === 'REPEATABILITY')!.testResult}
            />
          )}
        </button>

        <button
          onClick={() => handleTabChange('eccentricity')}
          className={`py-3.5 px-4 font-semibold text-xs border-b-2 flex items-center gap-2 whitespace-nowrap transition ${
            activeTab === 'eccentricity'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sparkles size={16} />
          <span>4. Eccentric Loading (A.4.7)</span>
          {testCase.testExecutions.find((e) => e.testCode === 'ECCENTRICITY')?.testResult && (
            <ComplianceBadge
              result={testCase.testExecutions.find((e) => e.testCode === 'ECCENTRICITY')!.testResult}
            />
          )}
        </button>

        <button
          onClick={() => handleTabChange('evidence')}
          className={`py-3.5 px-4 font-semibold text-xs border-b-2 flex items-center gap-2 whitespace-nowrap transition ${
            activeTab === 'evidence'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Camera size={16} />
          <span>5. Photographs & Evidence</span>
          {attachments.length > 0 && (
            <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {attachments.length}
            </span>
          )}
        </button>

        <button
          onClick={() => handleTabChange('reports')}
          className={`py-3.5 px-4 font-semibold text-xs border-b-2 flex items-center gap-2 whitespace-nowrap transition ${
            activeTab === 'reports'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileCheck2 size={16} />
          <span>6. Certificates & Reports</span>
          {reports.length > 0 && (
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {reports.length}
            </span>
          )}
        </button>
      </div>

      {/* TAB CONTENT: 1. Environmental & Laboratory Conditions */}
      {activeTab === 'conditions' && (
        <div className="bg-white rounded-b-xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">Laboratory & Environmental Record</h2>
              <p className="text-xs text-slate-500">
                OIML R 76 requires recording ambient parameters and reference mass standards traceability.
              </p>
            </div>
            {canEdit && (
              <button
                onClick={handleSaveConditions}
                disabled={submitting}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
              >
                <Save size={14} />
                <span>Save Environmental Data</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Ambient Temperature (°C) *</label>
              <input
                type="number"
                step="0.1"
                disabled={!canEdit}
                value={conditions.temperatureCelsius}
                onChange={(e) => setConditions({ ...conditions, temperatureCelsius: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Relative Humidity (% RH) *</label>
              <input
                type="number"
                step="0.1"
                disabled={!canEdit}
                value={conditions.relativeHumidityPct}
                onChange={(e) => setConditions({ ...conditions, relativeHumidityPct: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Atmospheric Pressure (hPa)</label>
              <input
                type="number"
                step="0.1"
                disabled={!canEdit}
                value={conditions.atmosphericPressureHpa || ''}
                onChange={(e) => setConditions({ ...conditions, atmosphericPressureHpa: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-sm"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Reference Mass Standards Used</label>
              <input
                type="text"
                disabled={!canEdit}
                value={conditions.referenceStandardsUsed || ''}
                onChange={(e) => setConditions({ ...conditions, referenceStandardsUsed: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-sm"
                placeholder="e.g. OIML E2 Class Standard Weight Set (1 mg - 20 kg)"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Calibration Certificate No.</label>
              <input
                type="text"
                disabled={!canEdit}
                value={conditions.calibrationCertNo || ''}
                onChange={(e) => setConditions({ ...conditions, calibrationCertNo: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-sm font-mono"
                placeholder="e.g. NABL/CAL/2026-908"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Observations & Environmental Remarks</label>
              <textarea
                rows={3}
                disabled={!canEdit}
                value={conditions.remarks || ''}
                onChange={(e) => setConditions({ ...conditions, remarks: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-sm"
                placeholder="Air draft shielding, stabilization time, zero setting observations..."
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 2, 3, 4: Dynamic Observation Tables for Selected Procedure */}
      {(activeTab === 'weighing' || activeTab === 'repeatability' || activeTab === 'eccentricity') && (
        <div className="bg-white rounded-b-xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  {currentExec?.testName || 'Test Procedure'}
                </h2>
                {currentExec && <ComplianceBadge result={currentExec.testResult} />}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                OIML R 76-1:2006 Clause A.4 • High-Precision Calculation & Regulatory Rule Evaluation
              </p>
            </div>

            {canEdit && (
              <div className="flex items-center gap-2">
                <button
                  onClick={addObservationRow}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
                >
                  <Plus size={14} />
                  <span>Add Point</span>
                </button>
                <button
                  onClick={handleSaveObservationsAndCalculate}
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
                >
                  <Play size={14} />
                  <span>{submitting ? 'Evaluating...' : 'Run Backend OIML Compliance Engine'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Dynamic Observations Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-900 text-white uppercase text-[11px] font-semibold tracking-wider">
                <tr>
                  <th className="px-4 py-3">#</th>
                  {activeTab === 'weighing' && <th className="px-4 py-3">Direction</th>}
                  {activeTab === 'eccentricity' && <th className="px-4 py-3">Position</th>}
                  <th className="px-4 py-3 text-right">Applied Load (L) [{testCase.instrument.unit}] *</th>
                  <th className="px-4 py-3 text-right">Indication (I) [{testCase.instrument.unit}] *</th>
                  <th className="px-4 py-3 text-right">Changeover (ΔL) [{testCase.instrument.unit}]</th>
                  <th className="px-4 py-3 text-right bg-slate-800 text-slate-200">Error (E)</th>
                  <th className="px-4 py-3 text-right bg-slate-800 text-slate-200">Corrected (Ec)</th>
                  <th className="px-4 py-3 text-right bg-slate-800 text-slate-200">OIML MPE</th>
                  <th className="px-4 py-3 text-center bg-slate-800 text-slate-200">Compliance</th>
                  {canEdit && <th className="px-4 py-3 text-center">Delete</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white font-mono">
                {observations.map((row, index) => (
                  <tr key={index} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-2.5 font-bold text-slate-900">{index + 1}</td>

                    {/* Direction for Weighing */}
                    {activeTab === 'weighing' && (
                      <td className="px-4 py-2.5">
                        <select
                          disabled={!canEdit}
                          value={row.loadDirection}
                          onChange={(e) => updateObservationField(index, 'loadDirection', e.target.value)}
                          className="bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs font-sans"
                        >
                          <option value="INCREASING">▲ Increasing</option>
                          <option value="DECREASING">▼ Decreasing</option>
                        </select>
                      </td>
                    )}

                    {/* Position for Eccentricity */}
                    {activeTab === 'eccentricity' && (
                      <td className="px-4 py-2.5">
                        <select
                          disabled={!canEdit}
                          value={row.positionLocation}
                          onChange={(e) => updateObservationField(index, 'positionLocation', e.target.value)}
                          className="bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs font-sans"
                        >
                          <option value="CENTER">Center</option>
                          <option value="CORNER_1">Front-Left</option>
                          <option value="CORNER_2">Front-Right</option>
                          <option value="CORNER_3">Back-Left</option>
                          <option value="CORNER_4">Back-Right</option>
                        </select>
                      </td>
                    )}

                    {/* Applied Load */}
                    <td className="px-4 py-2.5 text-right">
                      <input
                        type="number"
                        step="any"
                        disabled={!canEdit}
                        value={row.appliedLoad}
                        onChange={(e) => updateObservationField(index, 'appliedLoad', e.target.value)}
                        className="w-28 text-right bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs"
                      />
                    </td>

                    {/* Indicated Value */}
                    <td className="px-4 py-2.5 text-right">
                      <input
                        type="number"
                        step="any"
                        disabled={!canEdit}
                        value={row.indicatedValue}
                        onChange={(e) => updateObservationField(index, 'indicatedValue', e.target.value)}
                        className="w-28 text-right bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs font-bold text-slate-900"
                      />
                    </td>

                    {/* Changeover Load delta L */}
                    <td className="px-4 py-2.5 text-right">
                      <input
                        type="number"
                        step="any"
                        disabled={!canEdit}
                        value={row.changeoverLoad}
                        onChange={(e) => updateObservationField(index, 'changeoverLoad', e.target.value)}
                        placeholder="opt"
                        className="w-20 text-right bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs"
                      />
                    </td>

                    {/* Calculated Error E */}
                    <td className="px-4 py-2.5 text-right bg-slate-50 font-bold">
                      {row.errorValue !== undefined
                        ? (row.errorValue > 0 ? '+' : '') + Number(row.errorValue).toFixed(4)
                        : '-'}
                    </td>

                    {/* Corrected Error Ec */}
                    <td className="px-4 py-2.5 text-right bg-slate-50 font-bold">
                      {row.correctedError !== undefined
                        ? (row.correctedError > 0 ? '+' : '') + Number(row.correctedError).toFixed(4)
                        : '-'}
                    </td>

                    {/* MPE Limit */}
                    <td className="px-4 py-2.5 text-right bg-slate-50 text-slate-600">
                      {row.mpeValue !== undefined ? `±${Number(row.mpeValue).toFixed(4)}` : '-'}
                    </td>

                    {/* Compliance */}
                    <td className="px-4 py-2.5 text-center bg-slate-50">
                      {row.pointCompliance ? (
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            row.pointCompliance === 'PASS'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {row.pointCompliance}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    {/* Delete */}
                    {canEdit && (
                      <td className="px-4 py-2.5 text-center">
                        <button
                          type="button"
                          onClick={() => removeObservationRow(index)}
                          className="text-slate-400 hover:text-rose-600 transition"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Test Summary Notes / Repeatability details */}
          {currentExec?.summaryNotes && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900 font-medium">
              {currentExec.summaryNotes}
            </div>
          )}

          {/* Visual Error vs Load Chart (for Weighing Performance) */}
          {activeTab === 'weighing' && chartData.length > 0 && (
            <div className="pt-4 border-t border-slate-200">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                Error Curve vs. OIML R 76 Permissible Tolerance Envelopes
              </h3>
              <div className="h-64 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      dataKey="load"
                      name="Load"
                      unit={` ${testCase.instrument.unit}`}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis
                      name="Error"
                      unit={` ${testCase.instrument.unit}`}
                      tick={{ fontSize: 11 }}
                    />
                    <Tooltip />
                    <Legend />
                    <ReferenceLine y={0} stroke="#94a3b8" />
                    <Line
                      type="stepAfter"
                      dataKey="upperMpe"
                      stroke="#ef4444"
                      strokeDasharray="4 4"
                      name="Upper MPE (+)"
                      dot={false}
                    />
                    <Line
                      type="stepAfter"
                      dataKey="lowerMpe"
                      stroke="#ef4444"
                      strokeDasharray="4 4"
                      name="Lower MPE (-)"
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="error"
                      stroke="#10b981"
                      strokeWidth={2}
                      name="Measured Error (Ec)"
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: 5. Certificates & Reports */}
      {activeTab === 'reports' && (
        <div className="bg-white rounded-b-xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Standardized Test Certificates & Documents</h2>
              <p className="text-xs text-slate-500">
                Official ISO/IEC 17025 & OIML R 76 type evaluation reports in PDF and editable DOCX formats.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleGenerateAndDownload('PDF')}
                disabled={generatingFormat !== null}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition disabled:opacity-50"
              >
                <FileDown size={14} />
                <span>{generatingFormat === 'PDF' ? 'Generating PDF...' : 'Download PDF'}</span>
              </button>
              <button
                onClick={() => handleGenerateAndDownload('DOCX')}
                disabled={generatingFormat !== null}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-sm transition disabled:opacity-50"
              >
                <FileDown size={14} />
                <span>{generatingFormat === 'DOCX' ? 'Generating DOCX...' : 'Download DOCX'}</span>
              </button>
              <button
                onClick={handlePreviewPdf}
                disabled={generatingFormat !== null}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold shadow-sm transition disabled:opacity-50"
              >
                <Eye size={14} />
                <span>{generatingFormat === 'PREVIEW' ? 'Loading...' : 'Preview Certificate'}</span>
              </button>
            </div>
          </div>

          {/* Test Status Banner */}
          <div
            className={`p-4 rounded-xl flex items-center justify-between border ${
              testCase.status === 'APPROVED' || testCase.status === 'REPORT_GENERATED'
                ? 'bg-emerald-50 border-emerald-200'
                : 'bg-amber-50 border-amber-200'
            }`}
          >
            <div>
              <h3
                className={`font-bold text-sm ${
                  testCase.status === 'APPROVED' || testCase.status === 'REPORT_GENERATED'
                    ? 'text-emerald-950'
                    : 'text-amber-950'
                }`}
              >
                {testCase.status === 'APPROVED' || testCase.status === 'REPORT_GENERATED'
                  ? 'Evaluation Formally Approved — Official Certificate Ready'
                  : 'Draft / Pre-Evaluation Test Report Available'}
              </h3>
              <p
                className={`text-xs mt-0.5 ${
                  testCase.status === 'APPROVED' || testCase.status === 'REPORT_GENERATED'
                    ? 'text-emerald-700'
                    : 'text-amber-800'
                }`}
              >
                {testCase.status === 'APPROVED' || testCase.status === 'REPORT_GENERATED'
                  ? `Metrological compliance verified by ${testCase.reviewerName || 'Technical Reviewer'}.`
                  : 'You can generate and download working draft reports at any point during testing.'}
              </p>
            </div>
            <ComplianceBadge result={testCase.overallResult} size="md" />
          </div>

          {/* Format Download Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-900 text-sm">Official PDF Certificate</span>
                  <span className="text-[11px] font-bold bg-rose-50 text-rose-700 px-2 py-0.5 rounded border border-rose-200">
                    PDF (A4)
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-4">
                  Tamper-evident legal metrology certificate with laboratory header, OIML R 76 clause breakdown, metrological tables, and signature stamps.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleGenerateAndDownload('PDF')}
                  disabled={generatingFormat !== null}
                  className="flex-1 py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition disabled:opacity-50"
                >
                  <FileDown size={14} />
                  <span>{generatingFormat === 'PDF' ? 'Generating...' : 'Download PDF'}</span>
                </button>
                <button
                  onClick={handlePreviewPdf}
                  disabled={generatingFormat !== null}
                  className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                >
                  <Eye size={14} />
                  <span>Preview</span>
                </button>
              </div>
            </div>

            <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-900 text-sm">Editable DOCX Test Report</span>
                  <span className="text-[11px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
                    Word DOCX
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-4">
                  Complete Microsoft Word report document ready for laboratory record archival, customer attachments, or internal documentation.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleGenerateAndDownload('DOCX')}
                  disabled={generatingFormat !== null}
                  className="flex-1 py-2 px-3 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition disabled:opacity-50"
                >
                  <FileDown size={14} />
                  <span>{generatingFormat === 'DOCX' ? 'Generating...' : 'Download DOCX'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* List of Issued Reports for this test */}
          {reports.length > 0 && (
            <div className="border border-slate-200 rounded-xl overflow-hidden mt-6">
              <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 font-bold text-xs text-slate-800 uppercase tracking-wider">
                Issued Reports History ({reports.length})
              </div>
              <div className="divide-y divide-slate-100 text-xs">
                {reports.map((rep) => (
                  <div key={rep.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                    <div>
                      <p className="font-bold text-slate-900 font-mono text-sm">{rep.reportNumber}</p>
                      <p className="text-slate-500 text-[11px] mt-0.5">
                        Format: <span className="font-semibold text-slate-700">{rep.fileFormat}</span> | Version: {rep.reportVersion} | Size: {((rep.fileSize || 0) / 1024).toFixed(1)} KB | SHA-256: {rep.checksumSha256?.substring(0, 16)}...
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {rep.fileFormat === 'PDF' && (
                        <button
                          onClick={handlePreviewPdf}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs flex items-center gap-1"
                        >
                          <Eye size={13} />
                          <span>Preview</span>
                        </button>
                      )}
                      <button
                        onClick={() => handleGenerateAndDownload(rep.fileFormat)}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg text-xs flex items-center gap-1"
                      >
                        <FileDown size={13} />
                        <span>Download</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Reviewer Action Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900">Technical Reviewer Verification</h3>
            <p className="text-xs text-slate-500">
              Verify observations, calculation derivations, and OIML R 76 compliance limits before rendering decision.
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setReviewAction('APPROVE')}
                className={`flex-1 py-2.5 rounded-lg text-xs font-bold border transition ${
                  reviewAction === 'APPROVE'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Approve Evaluation
              </button>
              <button
                type="button"
                onClick={() => setReviewAction('REJECT')}
                className={`flex-1 py-2.5 rounded-lg text-xs font-bold border transition ${
                  reviewAction === 'REJECT'
                    ? 'bg-rose-600 text-white border-rose-600 shadow'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Reject / Request Changes
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Review Comments / Verification Remarks *
              </label>
              <textarea
                rows={3}
                required
                value={reviewComments}
                onChange={(e) => setReviewComments(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-purple-500"
                placeholder="Confirm that observations comply with Table 6 MPE limits, repeatability spread is within bounds..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowReviewModal(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleProcessReview}
                disabled={submitting}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-sm"
              >
                {submitting ? 'Submitting...' : 'Confirm Decision'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PDF Inline Preview Modal */}
      {previewBlobUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl h-[90vh] shadow-2xl flex flex-col overflow-hidden border border-slate-200">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCheck2 size={18} className="text-emerald-400" />
                <span className="font-bold text-sm">OIML R 76 Type Evaluation Certificate Preview</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleGenerateAndDownload('PDF')}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1"
                >
                  <FileDown size={13} />
                  <span>Download</span>
                </button>
                <button
                  onClick={() => {
                    window.URL.revokeObjectURL(previewBlobUrl);
                    setPreviewBlobUrl(null);
                  }}
                  className="p-1 text-slate-400 hover:text-white rounded-lg transition"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="flex-1 bg-slate-100 p-2">
              <iframe
                src={previewBlobUrl}
                className="w-full h-full rounded-lg border border-slate-300"
                title="Certificate PDF Preview"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
