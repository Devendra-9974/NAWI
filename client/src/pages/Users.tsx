import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { User, Role, ApiResponse, Laboratory } from '../types';
import {
  Users as UsersIcon,
  Plus,
  CheckCircle,
  XCircle,
  UserCheck,
  UserX,
  Clock,
  Mail,
  Shield,
  Edit3,
} from 'lucide-react';

export const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<'active' | 'pending'>('active');
  const [labs, setLabs] = useState<Laboratory[]>([]);
  const [loading, setLoading] = useState(true);

  // Add User Modal
  const [showModal, setShowModal] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    role: 'TECHNICIAN' as Role,
    laboratoryId: 1,
  });

  // Rejection Modal
  const [rejectingUserId, setRejectingUserId] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Role Change Modal
  const [roleChangeUser, setRoleChangeUser] = useState<User | null>(null);
  const [selectedNewRole, setSelectedNewRole] = useState<Role>('TECHNICIAN');

  useEffect(() => {
    fetchUsers();
    fetchPendingUsers();
    fetchLaboratories();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get<ApiResponse<User[]>>('/users');
      if (res.data.success) {
        setUsers(res.data.data);
      }
    } catch (e) {
      console.error('Failed to load users', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingUsers = async () => {
    try {
      const res = await api.get<ApiResponse<User[]>>('/users/pending');
      if (res.data.success) {
        setPendingUsers(res.data.data);
      }
    } catch (e) {
      console.error('Failed to load pending users', e);
    }
  };

  const fetchLaboratories = async () => {
    try {
      const res = await api.get<ApiResponse<Laboratory[]>>('/laboratories');
      if (res.data.success) {
        setLabs(res.data.data);
      }
    } catch (e) {
      console.error('Failed to load laboratories', e);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post<ApiResponse<User>>('/users', newUser);
      if (res.data.success) {
        setShowModal(false);
        fetchUsers();
        setNewUser({
          username: '',
          email: '',
          password: '',
          fullName: '',
          role: 'TECHNICIAN',
          laboratoryId: labs[0]?.id || 1,
        });
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create user');
    }
  };

  const handleApprove = async (id: number) => {
    try {
      const res = await api.post<ApiResponse<User>>(`/users/${id}/approve`);
      if (res.data.success) {
        fetchPendingUsers();
        fetchUsers();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to approve user');
    }
  };

  const handleReject = async () => {
    if (!rejectingUserId) return;
    try {
      const res = await api.post<ApiResponse<User>>(`/users/${rejectingUserId}/reject`, {
        reason: rejectionReason || 'Application does not satisfy accreditation criteria',
      });
      if (res.data.success) {
        setRejectingUserId(null);
        setRejectionReason('');
        fetchPendingUsers();
        fetchUsers();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to reject user');
    }
  };

  const handleUpdateRole = async () => {
    if (!roleChangeUser) return;
    try {
      const res = await api.patch<ApiResponse<User>>(`/users/${roleChangeUser.id}/role`, {
        role: selectedNewRole,
      });
      if (res.data.success) {
        setRoleChangeUser(null);
        fetchUsers();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update user role');
    }
  };

  const toggleStatus = async (id: number) => {
    try {
      await api.patch(`/users/${id}/toggle-status`);
      fetchUsers();
    } catch (e) {
      console.error('Failed to toggle status', e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Laboratory Staff & User Administration</h1>
          <p className="text-sm text-slate-500">
            Authorize new signups, manage verification reviewers, assign RBAC permissions, and maintain staff records.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-lg shadow-sm text-sm transition"
        >
          <Plus size={16} />
          <span>Add Staff Member Directly</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('active')}
          className={`py-3 px-5 font-semibold text-sm border-b-2 flex items-center gap-2 transition ${
            activeTab === 'active'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <UsersIcon size={16} />
          <span>Active Staff & Users</span>
          <span className="bg-slate-100 text-slate-700 text-xs px-2 py-0.5 rounded-full font-bold">
            {users.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`py-3 px-5 font-semibold text-sm border-b-2 flex items-center gap-2 transition ${
            activeTab === 'pending'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock size={16} />
          <span>Pending Signup Approvals</span>
          {pendingUsers.length > 0 && (
            <span className="bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full font-bold animate-pulse">
              {pendingUsers.length}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: ACTIVE STAFF & USERS */}
      {activeTab === 'active' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Name</th>
                  <th className="px-5 py-3.5">Username</th>
                  <th className="px-5 py-3.5">Email</th>
                  <th className="px-5 py-3.5">Assigned Role</th>
                  <th className="px-5 py-3.5">Laboratory</th>
                  <th className="px-5 py-3.5">Account Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition">
                    <td className="px-5 py-4 font-semibold text-slate-900">{u.fullName}</td>
                    <td className="px-5 py-4 font-mono text-xs text-slate-600">{u.username}</td>
                    <td className="px-5 py-4 text-xs text-slate-600">{u.email}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded text-xs font-bold ${
                          u.role === 'ADMIN'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                            : u.role === 'REVIEWER'
                            ? 'bg-purple-50 text-purple-700 border border-purple-300'
                            : 'bg-blue-50 text-blue-700 border border-blue-300'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-500">
                      {u.laboratoryName || 'National Centre'}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-semibold ${
                          u.active ? 'text-emerald-700' : 'text-slate-400'
                        }`}
                      >
                        {u.active ? <CheckCircle size={14} /> : <XCircle size={14} />}
                        {u.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right space-x-3">
                      <button
                        onClick={() => {
                          setRoleChangeUser(u);
                          setSelectedNewRole(u.role);
                        }}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
                      >
                        <Edit3 size={13} />
                        <span>Change Role</span>
                      </button>
                      <button
                        onClick={() => toggleStatus(u.id)}
                        className={`text-xs font-semibold underline ${
                          u.active ? 'text-rose-600 hover:text-rose-800' : 'text-emerald-600 hover:text-emerald-800'
                        }`}
                      >
                        {u.active ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: PENDING SIGNUP REQUESTS */}
      {activeTab === 'pending' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {pendingUsers.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-sm">
              <CheckCircle className="mx-auto text-emerald-500 mb-2" size={32} />
              No pending registration requests. All applicant accounts are currently processed.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-amber-50/50 text-amber-900 text-xs font-semibold uppercase border-b border-amber-200">
                  <tr>
                    <th className="px-5 py-3.5">Applicant Name</th>
                    <th className="px-5 py-3.5">Username / Email</th>
                    <th className="px-5 py-3.5">Requested Role</th>
                    <th className="px-5 py-3.5">Email Verification</th>
                    <th className="px-5 py-3.5">Registration Date</th>
                    <th className="px-5 py-3.5 text-right">Approval Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pendingUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-amber-50/20 transition">
                      <td className="px-5 py-4 font-semibold text-slate-900">{u.fullName}</td>
                      <td className="px-5 py-4">
                        <div className="font-mono text-xs text-slate-800">{u.username}</div>
                        <div className="text-xs text-slate-500">{u.email}</div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-block px-2 py-0.5 rounded text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          {u.role}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-semibold ${
                            u.emailVerified ? 'text-emerald-700' : 'text-amber-700'
                          }`}
                        >
                          {u.emailVerified ? <CheckCircle size={14} /> : <Clock size={14} />}
                          {u.emailVerified ? 'Verified' : 'Pending Verification'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-500 font-mono">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Recent'}
                      </td>
                      <td className="px-5 py-4 text-right space-x-2">
                        <button
                          onClick={() => handleApprove(u.id)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold inline-flex items-center gap-1 shadow-sm transition"
                        >
                          <UserCheck size={14} />
                          <span>Approve User</span>
                        </button>
                        <button
                          onClick={() => setRejectingUserId(u.id)}
                          className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded text-xs font-semibold inline-flex items-center gap-1 transition"
                        >
                          <UserX size={14} />
                          <span>Reject</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Reject User Modal */}
      {rejectingUserId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900">Decline User Registration</h3>
            <p className="text-xs text-slate-500">
              Please enter the official reason for declining this applicant's access request:
            </p>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Rejection Reason</label>
              <textarea
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-rose-500"
                placeholder="e.g. Unverified laboratory affiliation or accreditation credentials."
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectingUserId(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReject}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-sm"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Role Modal */}
      {roleChangeUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900">Modify User Role</h3>
            <p className="text-xs text-slate-500">
              Update authorization role for <strong>{roleChangeUser.fullName}</strong> ({roleChangeUser.username}):
            </p>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Role</label>
              <select
                value={selectedNewRole}
                onChange={(e) => setSelectedNewRole(e.target.value as Role)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-semibold"
              >
                <option value="TECHNICIAN">TECHNICIAN (Records data, runs calculation)</option>
                <option value="REVIEWER">REVIEWER (Approves/rejects evaluations)</option>
                <option value="ADMIN">ADMIN (Full administrative privileges)</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRoleChangeUser(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdateRole}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm"
              >
                Save Role
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Direct User Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900">Add Laboratory Staff Member</h3>
            <p className="text-xs text-slate-500">
              Users added directly by Administrators are immediately active and approved.
            </p>
            <form onSubmit={handleCreateUser} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Legal Name</label>
                <input
                  type="text"
                  required
                  value={newUser.fullName}
                  onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Username</label>
                <input
                  type="text"
                  required
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Initial Password</label>
                <input
                  type="password"
                  required
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value as Role })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs"
                >
                  <option value="TECHNICIAN">TECHNICIAN (Records data, runs calculation)</option>
                  <option value="REVIEWER">REVIEWER (Approves/rejects tests)</option>
                  <option value="ADMIN">ADMIN (Full system access)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm"
                >
                  Save & Authorize Staff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
