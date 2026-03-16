'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Trash2, Eye, FileText, UserCircle2 } from 'lucide-react';
import Swal from 'sweetalert2';

const AdminDashboard = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState(null);

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const fetchPendingUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/pending-verifications');
      const data = await response.json();
      setPendingUsers(data.users || []);
    } catch (error) {
      console.error('Error fetching pending users:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateVerificationStatus = async (uid, action, successMessage) => {
    try {
      const response = await fetch('/api/admin/approve-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, action }),
      });

      if (response.ok) {
        setPendingUsers(pendingUsers.filter(user => user.uid !== uid));
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: successMessage,
          timer: 2000,
          showConfirmButton: false,
          background: '#ffffff',
          color: '#1e293b',
          iconColor: '#2563eb',
          customClass: {
            popup: 'rounded-[30px] border-none shadow-2xl',
          }
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: `Unable to ${action} user`,
          background: '#ffffff',
          color: '#1e293b',
          iconColor: '#ef4444',
          customClass: {
            popup: 'rounded-[30px] border-none shadow-2xl',
          }
        });
      }
    } catch (error) {
      console.error(`Error during ${action}:`, error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: `An error occurred while trying to ${action} user.`,
        background: '#ffffff',
        color: '#1e293b',
        iconColor: '#ef4444',
        customClass: {
          popup: 'rounded-[30px] border-none shadow-2xl',
        }
      });
    }
  };

  const handleApprove = (uid) => {
    Swal.fire({
      title: 'Approve Verification?',
      text: "Are you sure you want to approve this student verification?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#2563eb',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Yes, Approve',
      background: '#ffffff',
      color: '#1e293b',
      customClass: {
        popup: 'rounded-[30px] border-none shadow-2xl',
        confirmButton: 'rounded-xl font-bold px-6 py-3',
        cancelButton: 'rounded-xl font-bold px-6 py-3'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        updateVerificationStatus(uid, 'approve', 'User verified successfully!');
      }
    });
  };

  const handleReject = (uid) => {
    Swal.fire({
      title: 'Reject Verification?',
      text: "Are you sure you want to reject this verification?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f97316',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Yes, Reject',
      background: '#ffffff',
      color: '#1e293b',
      customClass: {
        popup: 'rounded-[30px] border-none shadow-2xl',
        confirmButton: 'rounded-xl font-bold px-6 py-3',
        cancelButton: 'rounded-xl font-bold px-6 py-3'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        updateVerificationStatus(uid, 'reject', 'User verification rejected.');
      }
    });
  };

  const handleDelete = (uid) => {
    Swal.fire({
      title: 'Delete Application?',
      text: "WARNING: This action cannot be undone. Are you sure you want to permanently delete this verification application?",
      icon: 'error',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Yes, Delete Permanently',
      background: '#ffffff',
      color: '#1e293b',
      customClass: {
        popup: 'rounded-[30px] border-none shadow-2xl',
        confirmButton: 'rounded-xl font-bold px-6 py-3',
        cancelButton: 'rounded-xl font-bold px-6 py-3'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        updateVerificationStatus(uid, 'delete', 'Verification application deleted permanently.');
      }
    });
  };

  return (
    <div className="space-y-8 container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="bg-white p-8 rounded-[30px] shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 mt-2 font-medium">Manage user verifications and system settings securely.</p>
        </div>
        <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-xl font-bold border border-blue-100">
          <Clock size={18} />
          {pendingUsers.length} Pending requests
        </div>
      </div>

      {/* Pending Verifications Table */}
      <div className="bg-white rounded-[30px] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-2xl font-black text-gray-900">Pending Verifications</h2>
        </div>

        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center text-center">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-75"></div>
              <div className="relative bg-white rounded-full p-4 border shadow-sm">
                <Clock className="text-blue-500 animate-spin" size={36} />
              </div>
            </div>
            <h3 className="text-lg font-bold text-gray-900">Loading Applications...</h3>
            <p className="text-gray-500 mt-1">Please wait while we fetch the pending verify queue.</p>
          </div>
        ) : pendingUsers.length === 0 ? (
          <div className="p-20 flex flex-col items-center justify-center text-center bg-gray-50/30">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-green-100 rounded-full blur-2xl opacity-60 animate-pulse"></div>
              <div className="relative bg-white p-8 rounded-full shadow-xl border border-green-50">
                <CheckCircle className="text-green-500" size={64} />
              </div>
            </div>
            <h3 className="text-3xl font-black text-gray-900 mb-3">All Requests Cleared!</h3>
            <p className="text-gray-500 max-w-md mx-auto font-medium leading-relaxed text-lg">
              Good job! There are currently no pending student verification requests. Everything is up to date.
            </p>
            <div className="mt-8 px-6 py-2 bg-white rounded-full border border-gray-100 shadow-sm text-gray-400 font-bold text-sm uppercase tracking-widest">
              ☕ Coffee Break Time
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-gray-50/80">
                <tr className="text-gray-500 text-xs font-bold uppercase tracking-wider">
                  <th className="px-8 py-4 rounded-tl-xl text-left">Applicant</th>
                  <th className="px-8 py-4">Contact Detail</th>
                  <th className="px-8 py-4">Submitted On</th>
                  <th className="px-8 py-4 text-center rounded-tr-xl">Action Panel</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {pendingUsers.map((user) => (
                  <tr key={user.uid} className="group hover:bg-gray-50/60 transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center font-black text-blue-600 text-lg shadow-inner border border-blue-100/50">
                          {user.displayName ? user.displayName[0].toUpperCase() : <UserCircle2 size={24} />}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{user.displayName || 'Unknown Student'}</p>
                          <p className="text-sm font-medium text-gray-400 font-mono mt-0.5">ID: {user.uid.slice(0, 8)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="inline-flex items-center px-3 py-1 rounded-full bg-gray-50 border border-gray-200 text-gray-600 text-sm font-medium">
                        {user.email}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2 text-gray-600 font-medium">
                        <Clock size={16} className="text-gray-400" />
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric', month: 'short', day: 'numeric'
                        }) : 'N/A'}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right w-full">
                      <div className="flex items-center justify-center gap-3">
                        {user.documentUrl ? (
                          <button
                            onClick={() => setSelectedDocument(user.documentUrl)}
                            title="View Document"
                            className="p-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-white hover:text-blue-600 hover:border-blue-200 hover:shadow-sm transition-all flex items-center gap-2 font-bold text-sm bg-gray-50 group"
                          >
                            <Eye size={18} className="group-hover:scale-110 transition-transform" />
                            <span>View</span>
                          </button>
                        ) : (
                          <span className="p-2.5 rounded-xl border border-gray-100 text-gray-300 flex items-center gap-2 font-bold text-sm bg-gray-50 cursor-not-allowed mx-1">
                            <FileText size={18} /> None
                          </span>
                        )}

                        <div className="h-6 w-px bg-gray-200 mx-1"></div>

                        <button
                          onClick={() => handleApprove(user.uid)}
                          title="Approve Verification"
                          className="p-2.5 rounded-xl bg-green-50 text-green-600 border border-transparent hover:bg-green-500 hover:text-white hover:shadow-md transition-all font-bold text-sm flex items-center gap-2 group transform hover:-translate-y-0.5"
                        >
                          <CheckCircle size={18} />
                          <span>Approve</span>
                        </button>

                        <button
                          onClick={() => handleReject(user.uid)}
                          title="Reject Verification"
                          className="p-2.5 rounded-xl bg-orange-50 text-orange-600 border border-transparent hover:bg-orange-500 hover:text-white hover:shadow-md transition-all font-bold text-sm flex items-center gap-2 group transform hover:-translate-y-0.5"
                        >
                          <XCircle size={18} />
                          <span>Reject</span>
                        </button>

                        <button
                          onClick={() => handleDelete(user.uid)}
                          title="Delete Application"
                          className="p-2.5 rounded-xl text-red-400 border border-transparent hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all ml-2"
                        >
                          <Trash2 size={20} />
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

      {/* Document Viewer Modal */}
      {selectedDocument && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 backdrop-blur-sm bg-gray-900/60 transition-opacity">
          <div
            className="bg-white rounded-[32px] w-full max-w-4xl max-h-[90vh] flex flex-col shadow-[0_0_40px_rgba(0,0,0,0.1)] border border-gray-100 relative transform transition-all animate-in fade-in zoom-in-95"
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 sm:px-8 border-b border-gray-100 shrinks-0">
              <div className="flex items-center gap-3">
                <FileText className="text-blue-500" size={24} />
                <h3 className="text-xl font-black text-gray-900">Verification Document Viewer</h3>
              </div>
              <button
                onClick={() => setSelectedDocument(null)}
                className="p-2 -mr-2 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors flex items-center justify-center group"
                aria-label="Close modal"
              >
                <XCircle size={28} className="group-hover:scale-110 transition-transform" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 overflow-auto flex-1 bg-gray-50/50 flex justify-center items-center min-h-[50vh]">
              <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 max-w-full">
                <img
                  src={selectedDocument}
                  alt="Student Uploaded Verification Document"
                  className="max-w-full max-h-[60vh] object-contain rounded-xl"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/800x600?text=Image+Load+Failed';
                  }}
                />
              </div>
            </div>
          </div>
          <div className="absolute inset-0 -z-10" onClick={() => setSelectedDocument(null)}></div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;