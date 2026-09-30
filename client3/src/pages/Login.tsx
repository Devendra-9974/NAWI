import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { Laboratory, ApiResponse, Role } from '../types';
import {
  Scale,
  Lock,
  User,
  AlertCircle,
  ArrowRight,
  Mail,
  UserPlus,
  KeyRound,
  CheckCircle2,
  Clock,
  XCircle,
  ShieldCheck,
} from 'lucide-react';

type AuthView = 'login' | 'register' | 'verify' | 'status' | 'forgot' | 'reset';

export const Login: React.FC = () => {
  const [view, setView] = useState<AuthView>('login');

  // Sign In state
  const [username, setUsername] = useState('technician');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Sign Up state
  const [regData, setRegData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    role: 'TECHNICIAN' as Role,
    laboratoryId: 1,
  });
  const [labs, setLabs] = useState<Laboratory[]>([]);

  // Email verification state
  const [verifyEmail, setVerifyEmail] = useState('');
  const [verifyToken, setVerifyToken] = useState('');

  // Status check state
  const [statusIdentifier, setStatusIdentifier] = useState('');
  const [statusResult, setStatusResult] = useState<any>(null);

  // Forgot / Reset password state
  const [resetEmail, setResetEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get<ApiResponse<Laboratory[]>>('/laboratories')
      .then((res) => {
        if (res.data.success && res.data.data.length > 0) {
          setLabs(res.data.data);
          setRegData((prev) => ({ ...prev, laboratoryId: res.data.data[0].id }));
        }
      })
      .catch(() => {});
  }, []);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      await login(username, password);
      navigate('/');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Invalid username or password';
      setError(msg);
      if (msg.toLowerCase().includes('email is not verified')) {
        setVerifyEmail(username);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setError(null);
    setLoading(true);
    try {
      await login(u, p);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const res = await api.post<ApiResponse<any>>('/auth/register', regData);
      if (res.data.success) {
        setSuccess('Registration submitted! Please verify your email with the 6-digit code.');
        setVerifyEmail(regData.email);
        setView('verify');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const res = await api.post<ApiResponse<any>>('/auth/verify-email', {
        email: verifyEmail,
        token: verifyToken,
      });
      if (res.data.success) {
        setSuccess('Email successfully verified! Your account is now pending Administrator approval.');
        setStatusIdentifier(verifyEmail);
        setView('status');
        handleCheckStatusSubmit(undefined, verifyEmail);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Email verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckStatusSubmit = async (e?: React.FormEvent, directId?: string) => {
    if (e) e.preventDefault();
    const idToQuery = directId || statusIdentifier;
    if (!idToQuery) return;
    setError(null);
    setLoading(true);

    try {
      const res = await api.get<ApiResponse<any>>(`/auth/pending-status?identifier=${encodeURIComponent(idToQuery)}`);
      if (res.data.success) {
        setStatusResult(res.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Account not found');
      setStatusResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const res = await api.post<ApiResponse<any>>('/auth/forgot-password', { email: resetEmail });
      if (res.data.success) {
        setSuccess('Password reset token generated! Please enter your token and new password.');
        setView('reset');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Password reset request failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const res = await api.post<ApiResponse<any>>('/auth/reset-password', {
        email: resetEmail,
        token: resetToken,
        newPassword: newPassword,
      });
      if (res.data.success) {
        setSuccess('Password reset successful! You can now sign in with your new credentials.');
        setUsername(resetEmail);
        setView('login');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Password reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Brand Icon */}
        <div className="inline-flex items-center justify-center h-14 w-14 rounded-xl bg-primary text-white shadow-lg shadow-primary/20 mb-3">
          <Scale size={32} className="stroke-[2.2]" />
        </div>
        <div className="flex items-center justify-center gap-2">
          <h1 className="text-2xl font-bold text-primary tracking-tight">METROLOGIX</h1>
          <span className="font-label-caps text-[10px] uppercase bg-surface-container text-primary font-bold px-2 py-0.5 rounded border border-surface-variant">
            NAWI
          </span>
        </div>
        <p className="mt-1.5 text-xs text-on-surface-variant">
          Non-Automatic Weighing Instruments Legal Metrology Platform (OIML R 76-1:2006)
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-lg">
        {/* Navigation Tabs */}
        <div className="flex bg-surface-container-low p-1 rounded-lg border border-surface-container mb-3 text-xs font-semibold text-on-surface-variant">
          <button
            onClick={() => {
              setView('login');
              setError(null);
              setSuccess(null);
            }}
            className={`flex-1 py-1.5 text-center rounded font-label-caps text-[11px] uppercase tracking-wider transition ${
              view === 'login' ? 'bg-primary text-white shadow-sm font-bold' : 'hover:text-on-surface'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setView('register');
              setError(null);
              setSuccess(null);
            }}
            className={`flex-1 py-1.5 text-center rounded font-label-caps text-[11px] uppercase tracking-wider transition ${
              view === 'register' ? 'bg-primary text-white shadow-sm font-bold' : 'hover:text-on-surface'
            }`}
          >
            Sign Up
          </button>
          <button
            onClick={() => {
              setView('verify');
              setError(null);
              setSuccess(null);
            }}
            className={`flex-1 py-1.5 text-center rounded font-label-caps text-[11px] uppercase tracking-wider transition ${
              view === 'verify' ? 'bg-primary text-white shadow-sm font-bold' : 'hover:text-on-surface'
            }`}
          >
            Verify Email
          </button>
          <button
            onClick={() => {
              setView('status');
              setError(null);
              setSuccess(null);
            }}
            className={`flex-1 py-1.5 text-center rounded font-label-caps text-[11px] uppercase tracking-wider transition ${
              view === 'status' ? 'bg-primary text-white shadow-sm font-bold' : 'hover:text-on-surface'
            }`}
          >
            Status
          </button>
        </div>

        <div className="bg-white py-8 px-6 shadow-sm rounded-lg border border-surface-container sm:px-10">
          {error && (
            <div className="mb-4 bg-error-container/40 border border-error/30 rounded p-3 text-error text-xs font-medium">
              <div className="flex items-center gap-2">
                <AlertCircle size={16} className="flex-shrink-0" />
                <span>{error}</span>
              </div>
              {error.toLowerCase().includes('email is not verified') && (
                <button
                  type="button"
                  onClick={() => {
                    setView('verify');
                    setError(null);
                  }}
                  className="mt-1 text-primary underline font-bold text-xs block"
                >
                  Verify your email address now
                </button>
              )}
              {error.toLowerCase().includes('pending approval') && (
                <button
                  type="button"
                  onClick={() => {
                    setView('status');
                    setStatusIdentifier(username);
                    setError(null);
                  }}
                  className="mt-1 text-secondary underline font-bold text-xs block"
                >
                  Check administrative approval status
                </button>
              )}
            </div>
          )}

          {success && (
            <div className="mb-4 bg-emerald-50 border border-emerald-300 rounded p-3 flex items-center gap-2 text-emerald-800 text-xs font-medium">
              <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* VIEW 1: SIGN IN */}
          {view === 'login' && (
            <form className="space-y-4" onSubmit={handleLoginSubmit}>
              <div>
                <label className="block font-label-caps text-[11px] uppercase tracking-wider font-bold text-on-surface-variant mb-1">
                  Username / Email
                </label>
                <div className="relative rounded">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-on-surface-variant">
                    <User size={16} />
                  </div>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="block w-full pl-9 pr-3 py-2 bg-surface-container-low border border-surface-container rounded text-xs text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary font-medium"
                    placeholder="Enter username"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-label-caps text-[11px] uppercase tracking-wider font-bold text-on-surface-variant">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setView('forgot');
                      setError(null);
                      setSuccess(null);
                    }}
                    className="text-[11px] text-primary hover:underline font-medium"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative rounded">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-on-surface-variant">
                    <Lock size={16} />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-9 pr-3 py-2 bg-surface-container-low border border-surface-container rounded text-xs text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary font-medium"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-2.5 px-4 rounded text-xs font-bold text-white bg-primary hover:bg-primary-container disabled:opacity-50 transition shadow-sm"
              >
                {loading ? 'Authenticating...' : 'Sign In to Laboratory'}
                <ArrowRight size={14} />
              </button>
            </form>
          )}

          {/* VIEW 2: SIGN UP */}
          {view === 'register' && (
            <form className="space-y-3" onSubmit={handleRegisterSubmit}>
              <div>
                <label className="block font-label-caps text-[11px] uppercase tracking-wider font-bold text-on-surface-variant mb-1">
                  Full Legal Name
                </label>
                <input
                  type="text"
                  required
                  value={regData.fullName}
                  onChange={(e) => setRegData({ ...regData, fullName: e.target.value })}
                  className="block w-full px-3 py-2 bg-surface-container-low border border-surface-container rounded text-xs text-on-surface focus:outline-none focus:border-primary font-medium"
                  placeholder="e.g. Dr. Rajesh Kumar"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-label-caps text-[11px] uppercase tracking-wider font-bold text-on-surface-variant mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    required
                    value={regData.username}
                    onChange={(e) => setRegData({ ...regData, username: e.target.value })}
                    className="block w-full px-3 py-2 bg-surface-container-low border border-surface-container rounded text-xs font-mono text-on-surface focus:outline-none focus:border-primary"
                    placeholder="rajesh_k"
                  />
                </div>
                <div>
                  <label className="block font-label-caps text-[11px] uppercase tracking-wider font-bold text-on-surface-variant mb-1">
                    Role
                  </label>
                  <select
                    value={regData.role}
                    onChange={(e) => setRegData({ ...regData, role: e.target.value as Role })}
                    className="block w-full px-3 py-2 bg-surface-container-low border border-surface-container rounded text-xs text-on-surface focus:outline-none focus:border-primary font-medium"
                  >
                    <option value="TECHNICIAN">Technician</option>
                    <option value="REVIEWER">Reviewer</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-label-caps text-[11px] uppercase tracking-wider font-bold text-on-surface-variant mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={regData.email}
                  onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                  className="block w-full px-3 py-2 bg-surface-container-low border border-surface-container rounded text-xs text-on-surface focus:outline-none focus:border-primary font-medium"
                  placeholder="rajesh@metrology.gov.in"
                />
              </div>

              <div>
                <label className="block font-label-caps text-[11px] uppercase tracking-wider font-bold text-on-surface-variant mb-1">
                  Laboratory Affiliation
                </label>
                <select
                  value={regData.laboratoryId}
                  onChange={(e) => setRegData({ ...regData, laboratoryId: Number(e.target.value) })}
                  className="block w-full px-3 py-2 bg-surface-container-low border border-surface-container rounded text-xs text-on-surface focus:outline-none focus:border-primary font-medium"
                >
                  {labs.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.labName} ({l.labCode})
                    </option>
                  ))}
                  {labs.length === 0 && <option value={1}>National Metrology Centre (NMC)</option>}
                </select>
              </div>

              <div>
                <label className="block font-label-caps text-[11px] uppercase tracking-wider font-bold text-on-surface-variant mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={regData.password}
                  onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                  className="block w-full px-3 py-2 bg-surface-container-low border border-surface-container rounded text-xs text-on-surface focus:outline-none focus:border-primary font-medium"
                  placeholder="Minimum 6 characters"
                />
              </div>

              <div className="p-2.5 bg-surface-container-low border border-surface-container rounded text-[11px] text-on-surface-variant">
                <strong>Administrative Verification:</strong> Following email verification, accounts must be approved
                by a Metrology Administrator before logging in.
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-2 px-4 rounded text-xs font-bold text-white bg-primary hover:bg-primary-container disabled:opacity-50 transition shadow-sm"
              >
                {loading ? 'Submitting Registration...' : 'Register Account'}
                <UserPlus size={14} />
              </button>
            </form>
          )}

          {/* VIEW 3: VERIFY EMAIL */}
          {view === 'verify' && (
            <form className="space-y-4" onSubmit={handleVerifySubmit}>
              <div className="text-center pb-2">
                <div className="inline-flex p-2.5 rounded-full bg-surface-container text-primary mb-2">
                  <Mail size={22} />
                </div>
                <h3 className="text-sm font-bold text-on-surface">Email Address Verification</h3>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Enter the 6-digit verification code issued to your email.
                </p>
              </div>

              <div>
                <label className="block font-label-caps text-[11px] uppercase tracking-wider font-bold text-on-surface-variant mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={verifyEmail}
                  onChange={(e) => setVerifyEmail(e.target.value)}
                  className="block w-full px-3 py-2 bg-surface-container-low border border-surface-container rounded text-xs text-on-surface"
                  placeholder="name@agency.gov.in"
                />
              </div>

              <div>
                <label className="block font-label-caps text-[11px] uppercase tracking-wider font-bold text-on-surface-variant mb-1">
                  6-Digit Verification Code
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={verifyToken}
                  onChange={(e) => setVerifyToken(e.target.value)}
                  className="block w-full px-3 py-2 bg-surface-container-low border border-surface-container rounded text-base font-mono text-center tracking-widest font-bold text-on-surface"
                  placeholder="123456"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-2.5 px-4 rounded text-xs font-bold text-white bg-primary hover:bg-primary-container disabled:opacity-50 transition shadow-sm"
              >
                {loading ? 'Verifying Code...' : 'Verify Email & Submit for Approval'}
                <CheckCircle2 size={15} />
              </button>
            </form>
          )}

          {/* VIEW 4: STATUS */}
          {view === 'status' && (
            <div className="space-y-4">
              <div className="text-center pb-1">
                <div className="inline-flex p-2.5 rounded-full bg-surface-container text-secondary mb-2">
                  <ShieldCheck size={22} />
                </div>
                <h3 className="text-sm font-bold text-on-surface">Application & Approval Status</h3>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Check whether your account has been reviewed by the Metrology Administrator.
                </p>
              </div>

              <form onSubmit={(e) => handleCheckStatusSubmit(e)} className="flex gap-2">
                <input
                  type="text"
                  required
                  value={statusIdentifier}
                  onChange={(e) => setStatusIdentifier(e.target.value)}
                  className="flex-1 px-3 py-2 bg-surface-container-low border border-surface-container rounded text-xs text-on-surface"
                  placeholder="Email or username"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-secondary text-white rounded text-xs font-bold hover:opacity-90"
                >
                  {loading ? 'Checking...' : 'Check'}
                </button>
              </form>

              {statusResult && (
                <div className="p-3.5 bg-surface-container-low border border-surface-container rounded-lg space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-on-surface-variant">Applicant:</span>
                    <span className="font-bold text-on-surface">{statusResult.fullName}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-on-surface-variant">Username:</span>
                    <span className="font-mono text-on-surface">{statusResult.username}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-on-surface-variant">Role:</span>
                    <span className="font-bold text-primary">{statusResult.role}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-on-surface-variant">Email Verified:</span>
                    <span
                      className={`font-semibold ${
                        statusResult.emailVerified ? 'text-emerald-700' : 'text-amber-700'
                      }`}
                    >
                      {statusResult.emailVerified ? 'Verified' : 'Pending Verification'}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-surface-container">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-on-surface-variant">Approval State:</span>
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded ${
                          statusResult.approvalStatus === 'APPROVED'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : statusResult.approvalStatus === 'REJECTED'
                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                            : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}
                      >
                        {statusResult.approvalStatus === 'APPROVED' && <CheckCircle2 size={12} />}
                        {statusResult.approvalStatus === 'REJECTED' && <XCircle size={12} />}
                        {statusResult.approvalStatus === 'PENDING' && <Clock size={12} />}
                        {statusResult.approvalStatus}
                      </span>
                    </div>

                    {statusResult.approvalStatus === 'PENDING' && (
                      <p className="text-[11px] text-amber-800 bg-amber-50 p-2.5 rounded border border-amber-200">
                        Your account application is awaiting Administrator verification. Once approved, you
                        will be able to log in.
                      </p>
                    )}

                    {statusResult.approvalStatus === 'APPROVED' && (
                      <div className="space-y-2">
                        <p className="text-[11px] text-emerald-800 bg-emerald-50 p-2.5 rounded border border-emerald-200">
                          Your account has been approved and activated! You can now log in.
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setUsername(statusResult.username);
                            setView('login');
                          }}
                          className="w-full py-1.5 bg-primary text-white rounded text-xs font-bold"
                        >
                          Proceed to Sign In
                        </button>
                      </div>
                    )}

                    {statusResult.approvalStatus === 'REJECTED' && (
                      <p className="text-[11px] text-rose-800 bg-rose-50 p-2.5 rounded border border-rose-200">
                        Reason: {statusResult.rejectionReason || 'Application criteria not met.'}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* VIEW 5: FORGOT PASSWORD */}
          {view === 'forgot' && (
            <form className="space-y-4" onSubmit={handleForgotPasswordSubmit}>
              <div className="text-center pb-1">
                <div className="inline-flex p-2.5 rounded-full bg-surface-container text-on-surface-variant mb-2">
                  <KeyRound size={22} />
                </div>
                <h3 className="text-sm font-bold text-on-surface">Reset Laboratory Password</h3>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Enter your registered email address to receive a password reset token.
                </p>
              </div>

              <div>
                <label className="block font-label-caps text-[11px] uppercase tracking-wider font-bold text-on-surface-variant mb-1">
                  Registered Email
                </label>
                <input
                  type="email"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="block w-full px-3 py-2 bg-surface-container-low border border-surface-container rounded text-xs text-on-surface"
                  placeholder="name@agency.gov.in"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded text-xs font-bold text-white bg-primary hover:bg-primary-container disabled:opacity-50 transition shadow-sm"
              >
                {loading ? 'Sending Token...' : 'Generate Reset Token'}
              </button>

              <button
                type="button"
                onClick={() => setView('login')}
                className="w-full text-center text-xs text-on-surface-variant hover:underline"
              >
                Back to Sign In
              </button>
            </form>
          )}

          {/* VIEW 6: RESET PASSWORD */}
          {view === 'reset' && (
            <form className="space-y-4" onSubmit={handleResetPasswordSubmit}>
              <div className="text-center pb-1">
                <h3 className="text-sm font-bold text-on-surface">Enter Reset Token & New Password</h3>
              </div>

              <div>
                <label className="block font-label-caps text-[11px] uppercase tracking-wider font-bold text-on-surface-variant mb-1">
                  Reset Token (6 digits)
                </label>
                <input
                  type="text"
                  required
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  className="block w-full px-3 py-2 bg-surface-container-low border border-surface-container rounded text-sm font-mono text-center tracking-widest font-bold text-on-surface"
                  placeholder="123456"
                />
              </div>

              <div>
                <label className="block font-label-caps text-[11px] uppercase tracking-wider font-bold text-on-surface-variant mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="block w-full px-3 py-2 bg-surface-container-low border border-surface-container rounded text-xs text-on-surface"
                  placeholder="Minimum 6 characters"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded text-xs font-bold text-white bg-primary hover:bg-primary-container disabled:opacity-50 transition shadow-sm"
              >
                {loading ? 'Updating Password...' : 'Save New Password & Sign In'}
              </button>
            </form>
          )}

          {/* Quick Demo Sign-In Switcher */}
          <div className="mt-6 pt-5 border-t border-surface-container">
            <p className="text-[11px] font-semibold text-on-surface-variant text-center uppercase tracking-wider mb-2.5">
              Quick Demo Access
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('technician', 'password123')}
                className="flex flex-col items-center justify-center p-2 rounded border border-surface-container bg-surface-container-low hover:bg-surface-container text-xs transition"
              >
                <span className="font-bold text-primary text-[11px]">Technician</span>
                <span className="font-mono text-[9px] text-on-surface-variant mt-0.5">Priya V.</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('reviewer', 'password123')}
                className="flex flex-col items-center justify-center p-2 rounded border border-surface-container bg-surface-container-low hover:bg-surface-container text-xs transition"
              >
                <span className="font-bold text-secondary text-[11px]">Reviewer</span>
                <span className="font-mono text-[9px] text-on-surface-variant mt-0.5">Arun P.</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('admin', 'password123')}
                className="flex flex-col items-center justify-center p-2 rounded border border-surface-container bg-surface-container-low hover:bg-surface-container text-xs transition"
              >
                <span className="font-bold text-tertiary text-[11px]">Director</span>
                <span className="font-mono text-[9px] text-on-surface-variant mt-0.5">Admin</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
