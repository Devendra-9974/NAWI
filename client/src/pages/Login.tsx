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
  Building,
} from 'lucide-react';

type AuthView = 'login' | 'register' | 'verify' | 'status' | 'forgot' | 'reset';

export const Login: React.FC = () => {
  const [view, setView] = useState<AuthView>('login');

  // Sign In state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
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
    // Load labs for registration
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
      navigate('/dashboard');
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

  const fillCredentials = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setView('login');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-emerald-600 text-white shadow-lg mb-4">
          <Scale size={36} />
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">LegalMetrix</h1>
        <p className="mt-2 text-sm text-slate-400">
          Automated OIML R 76 NAWI Type Evaluation & Test Reporting Platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
        {/* Navigation Tabs */}
        <div className="flex bg-slate-800/80 p-1.5 rounded-xl border border-slate-700/80 mb-4 text-xs font-semibold text-slate-400">
          <button
            onClick={() => {
              setView('login');
              setError(null);
              setSuccess(null);
            }}
            className={`flex-1 py-2 text-center rounded-lg transition ${
              view === 'login' ? 'bg-emerald-600 text-white shadow' : 'hover:text-white'
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
            className={`flex-1 py-2 text-center rounded-lg transition ${
              view === 'register' ? 'bg-emerald-600 text-white shadow' : 'hover:text-white'
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
            className={`flex-1 py-2 text-center rounded-lg transition ${
              view === 'verify' ? 'bg-emerald-600 text-white shadow' : 'hover:text-white'
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
            className={`flex-1 py-2 text-center rounded-lg transition ${
              view === 'status' ? 'bg-emerald-600 text-white shadow' : 'hover:text-white'
            }`}
          >
            Check Status
          </button>
        </div>

        <div className="bg-slate-800 py-8 px-6 shadow-2xl rounded-2xl border border-slate-700 sm:px-10">
          {error && (
            <div className="mb-4 bg-rose-500/10 border border-rose-500/30 rounded-lg p-3 text-rose-400 text-xs">
              <div className="flex items-center gap-2 font-semibold">
                <AlertCircle size={15} />
                <span>{error}</span>
              </div>
              {error.toLowerCase().includes('email is not verified') && (
                <button
                  type="button"
                  onClick={() => {
                    setView('verify');
                    setError(null);
                  }}
                  className="mt-2 text-emerald-400 underline font-semibold text-xs block"
                >
                  Click here to verify email
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
                  className="mt-2 text-amber-400 underline font-semibold text-xs block"
                >
                  Click here to check approval status
                </button>
              )}
            </div>
          )}

          {success && (
            <div className="mb-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3 flex items-center gap-2 text-emerald-400 text-xs font-semibold">
              <CheckCircle2 size={16} />
              <span>{success}</span>
            </div>
          )}

          {/* VIEW 1: SIGN IN */}
          {view === 'login' && (
            <form className="space-y-4" onSubmit={handleLoginSubmit}>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 tracking-wider">
                  Username / Email
                </label>
                <div className="mt-1 relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    placeholder="Enter username"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold uppercase text-slate-300 tracking-wider">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setView('forgot');
                      setError(null);
                      setSuccess(null);
                    }}
                    className="text-xs text-emerald-400 hover:text-emerald-300 transition"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="mt-1 relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 transition"
              >
                {loading ? 'Authenticating...' : 'Sign In to Laboratory'}
                <ArrowRight size={16} />
              </button>
            </form>
          )}

          {/* VIEW 2: SIGN UP */}
          {view === 'register' && (
            <form className="space-y-3" onSubmit={handleRegisterSubmit}>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 tracking-wider">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={regData.fullName}
                  onChange={(e) => setRegData({ ...regData, fullName: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g. Dr. Rajesh Kumar"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 tracking-wider">
                    Username
                  </label>
                  <input
                    type="text"
                    required
                    value={regData.username}
                    onChange={(e) => setRegData({ ...regData, username: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs font-mono focus:ring-2 focus:ring-emerald-500"
                    placeholder="rajesh_k"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 tracking-wider">
                    Role
                  </label>
                  <select
                    value={regData.role}
                    onChange={(e) => setRegData({ ...regData, role: e.target.value as Role })}
                    className="mt-1 block w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="TECHNICIAN">Technician</option>
                    <option value="REVIEWER">Reviewer</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 tracking-wider">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={regData.email}
                  onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:ring-2 focus:ring-emerald-500"
                  placeholder="rajesh@metrology.gov.in"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 tracking-wider">
                  Laboratory Affiliation
                </label>
                <select
                  value={regData.laboratoryId}
                  onChange={(e) => setRegData({ ...regData, laboratoryId: Number(e.target.value) })}
                  className="mt-1 block w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:ring-2 focus:ring-emerald-500"
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
                <label className="block text-xs font-semibold uppercase text-slate-300 tracking-wider">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={regData.password}
                  onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:ring-2 focus:ring-emerald-500"
                  placeholder="Minimum 6 characters"
                />
              </div>

              <div className="p-3 bg-slate-900/60 border border-slate-700/60 rounded-lg text-[11px] text-slate-400">
                <p>
                  <strong>Approval Notice:</strong> After registration and email verification, accounts require
                  authorization by a Legal Metrology Administrator before access is enabled.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-2.5 px-4 rounded-lg shadow-sm text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 transition"
              >
                {loading ? 'Submitting Registration...' : 'Create Metrology Account'}
                <UserPlus size={15} />
              </button>
            </form>
          )}

          {/* VIEW 3: VERIFY EMAIL */}
          {view === 'verify' && (
            <form className="space-y-4" onSubmit={handleVerifySubmit}>
              <div className="text-center pb-2">
                <div className="inline-flex p-3 rounded-full bg-blue-900/40 text-blue-400 mb-2">
                  <Mail size={24} />
                </div>
                <h3 className="text-sm font-bold text-white">Email Address Verification</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Enter the 6-digit verification code issued to your email.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 tracking-wider">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={verifyEmail}
                  onChange={(e) => setVerifyEmail(e.target.value)}
                  className="mt-1 block w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs"
                  placeholder="name@agency.gov.in"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 tracking-wider">
                  6-Digit Verification Code
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={verifyToken}
                  onChange={(e) => setVerifyToken(e.target.value)}
                  className="mt-1 block w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-center tracking-widest text-lg font-bold"
                  placeholder="123456"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-2.5 px-4 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 transition"
              >
                {loading ? 'Verifying Code...' : 'Verify Email & Submit for Approval'}
                <CheckCircle2 size={16} />
              </button>
            </form>
          )}

          {/* VIEW 4: CHECK APPROVAL STATUS */}
          {view === 'status' && (
            <div className="space-y-4">
              <div className="text-center pb-1">
                <div className="inline-flex p-3 rounded-full bg-purple-900/40 text-purple-400 mb-2">
                  <ShieldCheck size={24} />
                </div>
                <h3 className="text-sm font-bold text-white">Application & Approval Status</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Check whether your account has been reviewed by the Metrology Administrator.
                </p>
              </div>

              <form onSubmit={(e) => handleCheckStatusSubmit(e)} className="flex gap-2">
                <input
                  type="text"
                  required
                  value={statusIdentifier}
                  onChange={(e) => setStatusIdentifier(e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs"
                  placeholder="Enter your email or username"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold"
                >
                  {loading ? 'Checking...' : 'Check'}
                </button>
              </form>

              {statusResult && (
                <div className="p-4 bg-slate-900 border border-slate-700 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">Applicant:</span>
                    <span className="text-xs font-bold text-white">{statusResult.fullName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">Username:</span>
                    <span className="text-xs font-mono text-slate-300">{statusResult.username}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">Role:</span>
                    <span className="text-xs font-bold text-blue-400">{statusResult.role}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">Email Verified:</span>
                    <span
                      className={`text-xs font-semibold ${
                        statusResult.emailVerified ? 'text-emerald-400' : 'text-amber-400'
                      }`}
                    >
                      {statusResult.emailVerified ? 'Verified' : 'Pending Verification'}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-slate-400">Approval State:</span>
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded ${
                          statusResult.approvalStatus === 'APPROVED'
                            ? 'bg-emerald-900/50 text-emerald-400 border border-emerald-700'
                            : statusResult.approvalStatus === 'REJECTED'
                            ? 'bg-rose-900/50 text-rose-400 border border-rose-700'
                            : 'bg-amber-900/50 text-amber-400 border border-amber-700'
                        }`}
                      >
                        {statusResult.approvalStatus === 'APPROVED' && <CheckCircle2 size={12} />}
                        {statusResult.approvalStatus === 'REJECTED' && <XCircle size={12} />}
                        {statusResult.approvalStatus === 'PENDING' && <Clock size={12} />}
                        {statusResult.approvalStatus}
                      </span>
                    </div>

                    {statusResult.approvalStatus === 'PENDING' && (
                      <p className="text-[11px] text-amber-300 bg-amber-950/40 p-2.5 rounded border border-amber-800">
                        Your account application is in the Administrator verification queue. Once approved, you
                        will be able to log in.
                      </p>
                    )}

                    {statusResult.approvalStatus === 'APPROVED' && (
                      <div className="space-y-2">
                        <p className="text-[11px] text-emerald-300 bg-emerald-950/40 p-2.5 rounded border border-emerald-800">
                          Your account has been approved and activated! You can now log in.
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setUsername(statusResult.username);
                            setView('login');
                          }}
                          className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold"
                        >
                          Proceed to Sign In
                        </button>
                      </div>
                    )}

                    {statusResult.approvalStatus === 'REJECTED' && (
                      <p className="text-[11px] text-rose-300 bg-rose-950/40 p-2.5 rounded border border-rose-800">
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
                <div className="inline-flex p-3 rounded-full bg-slate-700 text-slate-300 mb-2">
                  <KeyRound size={24} />
                </div>
                <h3 className="text-sm font-bold text-white">Reset Laboratory Password</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Enter your registered email address to receive a password reset token.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 tracking-wider">
                  Registered Email
                </label>
                <input
                  type="email"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs"
                  placeholder="name@agency.gov.in"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 transition"
              >
                {loading ? 'Sending Token...' : 'Generate Reset Token'}
              </button>

              <button
                type="button"
                onClick={() => setView('login')}
                className="w-full text-center text-xs text-slate-400 hover:text-slate-300"
              >
                Back to Sign In
              </button>
            </form>
          )}

          {/* VIEW 6: RESET PASSWORD */}
          {view === 'reset' && (
            <form className="space-y-4" onSubmit={handleResetPasswordSubmit}>
              <div className="text-center pb-1">
                <h3 className="text-sm font-bold text-white">Enter Reset Token & New Password</h3>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 tracking-wider">
                  Reset Token (6 digits)
                </label>
                <input
                  type="text"
                  required
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs font-mono text-center tracking-widest text-base font-bold"
                  placeholder="123456"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 tracking-wider">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs"
                  placeholder="Minimum 6 characters"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 transition"
              >
                {loading ? 'Updating Password...' : 'Save New Password & Sign In'}
              </button>
            </form>
          )}

          {/* Quick Demo Logins for Hackathon Evaluators */}
          <div className="mt-6 pt-6 border-t border-slate-700">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 text-center mb-3">
              SIH 2026 Demo Test Credentials
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => fillCredentials('technician', 'password123')}
                className="py-1.5 px-2 bg-blue-950/60 border border-blue-800 text-blue-300 hover:bg-blue-900 text-xs rounded font-medium transition"
              >
                Technician
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('reviewer', 'password123')}
                className="py-1.5 px-2 bg-purple-950/60 border border-purple-800 text-purple-300 hover:bg-purple-900 text-xs rounded font-medium transition"
              >
                Reviewer
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('admin', 'password123')}
                className="py-1.5 px-2 bg-emerald-950/60 border border-emerald-800 text-emerald-300 hover:bg-emerald-900 text-xs rounded font-medium transition"
              >
                Admin
              </button>
            </div>
            <p className="text-[11px] text-slate-500 text-center mt-2">
              Default password for all demo accounts: <code className="text-slate-300">password123</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
