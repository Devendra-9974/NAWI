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
          <h1 className="text-xl font-bold text-on-surface tracking-tight">Staff & RBAC Administration</h1>
          <p className="text-xs text-on-surface-variant">
            Authorize applicant signups, configure RBAC permissions, and manage active laboratory personnel.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary-container text-white font-label-caps text-xs font-bold py-2 px-3.5 rounded shadow-sm transition"
        >
          <Plus size={15} />
          <span>Add Staff Directly</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-surface-container">
        <button
          onClick={() => setActiveTab('active')}
          className={`py-2.5 px-4 font-label-caps text-xs uppercase tracking-wider font-bold border-b-2 flex items-center gap-2 transition ${
            activeTab === 'active'
              ? 'border-primary text-primary'
              : 'border-transparent text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <UsersIcon size={15} />
          <span>Active Staff ({users.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`py-2.5 px-4 font-label-caps text-xs uppercase tracking-wider font-bold border-b-2 flex items-center gap-2 transition ${
            activeTab === 'pending'
              ? 'border-primary text-primary'
              : 'border-transparent text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <Clock size={15} />
          <span>Pending Approvals</span>
          {pendingUsers.length > 0 && (
            <span className="bg-amber-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
              {pendingUsers.length}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: ACTIVE STAFF */}
      {activeTab === 'active' && (
        <div className="bg-white rounded-lg border border-surface-container shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-on-surface">
              <thead className="bg-surface-container-low text-on-surface-variant text-[11px] font-label-caps uppercase font-bold border-b border-surface-container">
                <tr>
                  <th className="px-4 py-3">Legal Name</th>
                  <th className="px-4 py-3">Username</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Assigned Role</th>
                  <th className="px-4 py-3">Laboratory</th>
                  <th className="px-4 py-3">Account Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-low">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-surface-container-lowest transition">
                    <td className="px-4 py-3 font-semibold text-on-surface">{u.fullName}</td>
                    <td className="px-4 py-3 font-mono text-[11px] text-on-surface-variant">{u.username}</td>
                    <td className="px-4 py-3 text-on-surface-variant">{u.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          u.role === 'ADMIN'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                            : u.role === 'REVIEWER'
                            ? 'bg-purple-50 text-purple-800 border border-purple-300'
                            : 'bg-blue-50 text-blue-800 border border-blue-300'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-on-surface-variant">
                      {u.laboratoryName || 'National Metrology Centre'}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                          u.active ? 'text-emerald-700' : 'text-on-surface-variant'
                        }`}
                      >
                        {u.active ? <CheckCircle size={13} /> : <XCircle size={13} />}
                        {u.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button
                        onClick={() => {
                          setRoleChangeUser(u);
                          setSelectedNewRole(u.role);
                        }}
                        className="text-[11px] font-bold text-primary hover:underline inline-flex items-center gap-1"
                      >
                        <Edit3 size={12} />
                        <span>Role</span>
                      </button>
                      <button
                        onClick={() => toggleStatus(u.id)}
                        className={`text-[11px] font-bold hover:underline ${
                          u.active ? 'text-error' : 'text-emerald-700'
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

      {/* TAB 2: PENDING APPROVALS */}
      {activeTab === 'pending' && (
        <div className="bg-white rounded-lg border border-surface-container shadow-sm overflow-hidden">
          {pendingUsers.length === 0 ? (
            <div className="p-10 text-center text-on-surface-variant text-xs">
              <CheckCircle className="mx-auto text-emerald-600 mb-2" size={28} />
              No pending registration requests. All applicant accounts are currently processed.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-on-surface">
                <thead className="bg-amber-50 text-amber-900 text-[11px] font-label-caps uppercase font-bold border-b border-amber-200">
                  <tr>
                    <th className="px-4 py-3">Applicant Name</th>
                    <th className="px-4 py-3">Username / Email</th>
                    <th className="px-4 py-3">Requested Role</th>
                    <th className="px-4 py-3">Email Verification</th>
                    <th className="px-4 py-3">Registration Date</th>
                    <th className="px-4 py-3 text-right">Approval Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-low">
                  {pendingUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-amber-50/20 transition">
                      <td className="px-4 py-3 font-semibold text-on-surface">{u.fullName}</td>
                      <td className="px-4 py-3">
                        <div className="font-mono text-[11px] text-on-surface">{u.username}</div>
                        <div className="text-[11px] text-on-surface-variant">{u.email}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                            u.emailVerified ? 'text-emerald-700' : 'text-amber-700'
                          }`}
                        >
                          {u.emailVerified ? <CheckCircle size={13} /> : <Clock size={13} />}
                          {u.emailVerified ? 'Verified' : 'Pending Verification'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-on-surface-variant font-mono text-[11px]">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Recent'}
                      </td>
                      <td className="px-4 py-3 text-right space-x-2">
                        <button
                          onClick={() => handleApprove(u.id)}
                          className="px-2.5 py-1 bg-primary text-white rounded text-xs font-bold inline-flex items-center gap-1 shadow-sm transition hover:bg-primary-container"
                        >
                          <UserCheck size={13} />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => setRejectingUserId(u.id)}
                          className="px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-300 rounded text-xs font-bold inline-flex items-center gap-1 transition hover:bg-rose-100"
                        >
                          <UserX size={13} />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl space-y-4 border border-surface-container">
            <h3 className="text-base font-bold text-on-surface">Decline User Registration</h3>
            <p className="text-xs text-on-surface-variant">
              Please enter the official reason for declining this applicant's access request:
            </p>
            <div>
              <label className="block font-label-caps text-[11px] uppercase tracking-wider font-bold text-on-surface-variant mb-1">
                Rejection Reason
              </label>
              <textarea
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full bg-surface-container-low border border-surface-container rounded p-2 text-xs focus:border-error"
                placeholder="e.g. Unverified laboratory affiliation or accreditation credentials."
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectingUserId(null)}
                className="px-3 py-1.5 border border-surface-container text-on-surface rounded text-xs font-bold hover:bg-surface-container-low"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReject}
                className="px-3 py-1.5 bg-error text-white rounded text-xs font-bold shadow-sm"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Role Modal */}
      {roleChangeUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg max-w-sm w-full p-6 shadow-xl space-y-4 border border-surface-container">
            <h3 className="text-base font-bold text-on-surface">Modify Staff Role</h3>
            <p className="text-xs text-on-surface-variant">
              Update authorization role for <strong>{roleChangeUser.fullName}</strong> ({roleChangeUser.username}):
            </p>
            <div>
              <label className="block font-label-caps text-[11px] uppercase tracking-wider font-bold text-on-surface-variant mb-1">
                Assigned Role
              </label>
              <select
                value={selectedNewRole}
                onChange={(e) => setSelectedNewRole(e.target.value as Role)}
                className="w-full bg-surface-container-low border border-surface-container rounded p-2 text-xs font-bold"
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
                className="px-3 py-1.5 border border-surface-container text-on-surface rounded text-xs font-bold hover:bg-surface-container-low"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdateRole}
                className="px-3 py-1.5 bg-primary text-white rounded text-xs font-bold shadow-sm"
              >
                Save Role
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Direct User Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl space-y-4 border border-surface-container">
            <h3 className="text-base font-bold text-on-surface">Add Laboratory Personnel Directly</h3>
            <p className="text-xs text-on-surface-variant">
              Personnel added directly by Administrators are immediately active and approved.
            </p>
            <form onSubmit={handleCreateUser} className="space-y-3">
              <div>
                <label className="block font-label-caps text-[11px] uppercase tracking-wider font-bold text-on-surface-variant mb-1">
                  Full Legal Name
                </label>
                <input
                  type="text"
                  required
                  value={newUser.fullName}
                  onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                  className="w-full bg-surface-container-low border border-surface-container rounded p-2 text-xs"
                />
              </div>
              <div>
                <label className="block font-label-caps text-[11px] uppercase tracking-wider font-bold text-on-surface-variant mb-1">
                  Username
                </label>
                <input
                  type="text"
                  required
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  className="w-full bg-surface-container-low border border-surface-container rounded p-2 text-xs font-mono"
                />
              </div>
              <div>
                <label className="block font-label-caps text-[11px] uppercase tracking-wider font-bold text-on-surface-variant mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full bg-surface-container-low border border-surface-container rounded p-2 text-xs"
                />
              </div>
              <div>
                <label className="block font-label-caps text-[11px] uppercase tracking-wider font-bold text-on-surface-variant mb-1">
                  Initial Password
                </label>
                <input
                  type="password"
                  required
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full bg-surface-container-low border border-surface-container rounded p-2 text-xs font-mono"
                />
              </div>
              <div>
                <label className="block font-label-caps text-[11px] uppercase tracking-wider font-bold text-on-surface-variant mb-1">
                  Role
                </label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value as Role })}
                  className="w-full bg-surface-container-low border border-surface-container rounded p-2 text-xs"
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
                  className="px-3 py-1.5 border border-surface-container text-on-surface rounded text-xs font-bold hover:bg-surface-container-low"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-primary text-white rounded text-xs font-bold shadow-sm"
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
