'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import BookingStatusBadge from '@/app/components/booking/BookingStatusBadge';

const statusOptions = ['all', 'Pending', 'Approved', 'In Progress', 'Completed', 'Rejected'];

const AdminBookingsPage = () => {
    const [bookings, setBookings] = useState([]);
    const [summary, setSummary] = useState({ all: 0, pending: 0, approved: 0, inProgress: 0, completed: 0, rejected: 0 });
    const [statusFilter, setStatusFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [actionLoadingId, setActionLoadingId] = useState(null);

    const fetchBookings = useCallback(async (activeFilter = statusFilter) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/bookings?status=${encodeURIComponent(activeFilter)}`);
            const data = await res.json();
            if (data.success) {
                setBookings(data.bookings || []);
                setSummary(data.summary || { all: 0, pending: 0, approved: 0, inProgress: 0, completed: 0, rejected: 0 });
            } else {
                Swal.fire({ icon: 'error', text: data.error || 'Failed to load bookings' });
            }
        } catch (error) {
            console.error('Error fetching admin bookings:', error);
            Swal.fire({ icon: 'error', text: 'Server error while loading bookings' });
        } finally {
            setLoading(false);
        }
    }, [statusFilter]);

    useEffect(() => {
        fetchBookings(statusFilter);
    }, [fetchBookings, statusFilter]);

    const filteredBookings = bookings;

    const updateBooking = async (bookingId, action) => {
        const isReject = action === 'reject';
        const confirmResult = await Swal.fire({
            title: isReject ? 'Reject booking?' : 'Approve booking?',
            text: isReject
                ? 'This will mark the booking as rejected.'
                : 'This will mark the booking as approved.',
            icon: isReject ? 'warning' : 'question',
            showCancelButton: true,
            confirmButtonText: isReject ? 'Yes, reject' : 'Yes, approve',
            confirmButtonColor: isReject ? '#ef4444' : '#2563eb'
        });

        if (!confirmResult.isConfirmed) return;

        setActionLoadingId(bookingId);
        try {
            const res = await fetch(`/api/admin/bookings/${encodeURIComponent(bookingId)}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, actorID: 'admin' })
            });
            const data = await res.json();
            if (data.success) {
                Swal.fire({ icon: 'success', text: isReject ? 'Booking rejected' : 'Booking approved' });
                await fetchBookings(statusFilter);
            } else {
                Swal.fire({ icon: 'error', text: data.error || 'Action failed' });
            }
        } catch (error) {
            console.error('Error updating booking:', error);
            Swal.fire({ icon: 'error', text: 'Server error' });
        } finally {
            setActionLoadingId(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
                    <div>
                        <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider">Phase 2</p>
                        <h1 className="text-3xl font-black text-gray-900 mt-1">Booking Management</h1>
                        <p className="text-gray-500 mt-2">Monitor, approve, reject, and review booking workflow from one place.</p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                        {[
                            ['All', summary.all],
                            ['Pending', summary.pending],
                            ['Approved', summary.approved],
                            ['In Progress', summary.inProgress],
                            ['Completed', summary.completed],
                            ['Rejected', summary.rejected],
                        ].map(([label, value]) => (
                            <div key={label} className="rounded-2xl bg-gray-50 border border-gray-100 px-4 py-3 text-center">
                                <div className="text-xl font-black text-gray-900">{value}</div>
                                <div className="text-xs font-semibold text-gray-500 mt-1">{label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm font-bold text-gray-900">Filter by status</p>
                    <p className="text-xs text-gray-500">Use this to review specific booking states quickly.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    {statusOptions.map((status) => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-colors ${statusFilter === status
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                            }`}
                        >
                            {status === 'all' ? 'All' : status}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-gray-500">Loading bookings...</div>
                ) : filteredBookings.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">No bookings found for the selected filter.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr className="text-xs uppercase tracking-wider text-gray-500">
                                    <th className="px-6 py-4">Service</th>
                                    <th className="px-6 py-4">Requester</th>
                                    <th className="px-6 py-4">Provider</th>
                                    <th className="px-6 py-4">Time Slot</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredBookings.map((booking) => (
                                    <tr key={booking._id} className="align-top hover:bg-gray-50/60 transition-colors">
                                        <td className="px-6 py-5">
                                            <div className="font-bold text-gray-900">{booking.service?.title || 'Service'}</div>
                                            <div className="text-sm text-gray-500">{booking.service?.category || 'Uncategorized'}</div>
                                            <div className="text-xs text-gray-400 mt-1">ID: {booking._id}</div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="font-semibold text-gray-900">{booking.requester?.displayName || 'Requester'}</div>
                                            <div className="text-sm text-gray-500 break-all">{booking.requester?.email || booking.requesterID}</div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="font-semibold text-gray-900">{booking.provider?.displayName || 'Provider'}</div>
                                            <div className="text-sm text-gray-500 break-all">{booking.provider?.email || booking.providerID}</div>
                                        </td>
                                        <td className="px-6 py-5 text-sm text-gray-700">
                                            {booking.timeSlot ? new Date(booking.timeSlot).toLocaleString() : 'N/A'}
                                            <div className="text-xs text-gray-400 mt-1">
                                                Created {booking.createdAt ? new Date(booking.createdAt).toLocaleString() : 'N/A'}
                                            </div>
                                            {booking.autoApproved && (
                                                <div className="mt-2 inline-flex px-2 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold">
                                                    Auto-approved
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-5">
                                            <BookingStatusBadge status={booking.status} />
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center justify-end gap-2">
                                                {booking.status === 'Pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => updateBooking(booking._id, 'approve')}
                                                            disabled={actionLoadingId === booking._id}
                                                            className="px-4 py-2 rounded-xl bg-green-600 text-white text-sm font-semibold disabled:opacity-60"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => updateBooking(booking._id, 'reject')}
                                                            disabled={actionLoadingId === booking._id}
                                                            className="px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-semibold disabled:opacity-60"
                                                        >
                                                            Reject
                                                        </button>
                                                    </>
                                                )}
                                                {booking.status !== 'Pending' && (
                                                    <span className="text-xs text-gray-400 font-medium">No action available</span>
                                                )}
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

export default AdminBookingsPage;