'use client';

import React, { useState, useEffect } from 'react';
import { auth } from '@/app/(backend)/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import BookingStatusBadge from '@/app/components/booking/BookingStatusBadge';
import Swal from 'sweetalert2';

const BookingsPage = () => {
    const [user, setUser] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [meetLinks, setMeetLinks] = useState({});
    const [editingMeetLink, setEditingMeetLink] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const bookingsPerPage = 5;

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (u) => {
            setUser(u);
            if (u) fetchBookings(u.uid);
            else setLoading(false);
        });
        return unsub;
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [bookings.length]);

    const fetchBookings = async (uid) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/booking?userID=${uid}&providerID=${uid}`);
            const data = await res.json();
            if (data.success) {
                const sortedBookings = [...data.bookings].sort((a, b) => {
                    const aTime = new Date(a.createdAt || a.timeSlot || 0).getTime();
                    const bTime = new Date(b.createdAt || b.timeSlot || 0).getTime();
                    return bTime - aTime;
                });

                setBookings(sortedBookings);
                // Initialize meetLinks state
                const links = {};
                sortedBookings.forEach(b => {
                    links[b._id] = b.meetLink || '';
                });
                setMeetLinks(links);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const sortedBookings = [...bookings].sort((a, b) => {
        const aTime = new Date(a.createdAt || a.timeSlot || 0).getTime();
        const bTime = new Date(b.createdAt || b.timeSlot || 0).getTime();
        return bTime - aTime;
    });

    const totalPages = Math.max(1, Math.ceil(sortedBookings.length / bookingsPerPage));
    const safePage = Math.min(currentPage, totalPages);
    const startIndex = (safePage - 1) * bookingsPerPage;
    const paginatedBookings = sortedBookings.slice(startIndex, startIndex + bookingsPerPage);

    const goToPage = (page) => {
        const nextPage = Math.min(Math.max(page, 1), totalPages);
        setCurrentPage(nextPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const advanceStatus = async (bookingId, nextStatus) => {
        if (!user) return;
        try {
            const res = await fetch(`/api/booking/${encodeURIComponent(bookingId)}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ newStatus: nextStatus, actorID: user.uid, meetLink: meetLinks[bookingId] })
            });
            const data = await res.json();
            if (data.success) {
                Swal.fire({ icon: 'success', text: 'Status updated' });
                setEditingMeetLink(null);
                fetchBookings(user.uid);
            } else {
                Swal.fire({ icon: 'error', text: data.error || 'Failed to update status' });
            }
        } catch (err) {
            console.error(err);
            Swal.fire({ icon: 'error', text: 'Server error' });
        }
    };

    const openMeetLink = (url) => {
        if (!url) return;
        try {
            window.open(url, '_blank');
        } catch (err) {
            console.error('Error opening link', err);
        }
    };

    const copyMeetLink = async (url) => {
        if (!url) return;
        try {
            await navigator.clipboard.writeText(url);
            Swal.fire({ icon: 'success', text: 'Meet link copied to clipboard' });
        } catch (err) {
            console.error('Copy failed', err);
            Swal.fire({ icon: 'error', text: 'Failed to copy link' });
        }
    };

    if (loading) return <div className="py-20 text-center">Loading bookings...</div>;

    return (
        <div className="min-h-screen p-6">
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-50">
                    <h1 className="text-2xl font-bold">My Bookings</h1>
                    <p className="text-sm text-gray-500">Requests you&apos;ve made or received</p>
                </div>

                {sortedBookings.length === 0 ? (
                    <div className="bg-white p-6 rounded-2xl text-center text-gray-500">No bookings found.</div>
                ) : (
                    <>
                        <div className="space-y-6">
                            {paginatedBookings.map(b => (
                                <div key={b._id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-50">
                            <div className="flex flex-col md:flex-row justify-between gap-4">
                                <div className="flex-1">
                                    <h3 className="font-bold text-lg">{b.service?.title || 'Service'}</h3>
                                    <div className="text-sm text-gray-600">When: {new Date(b.timeSlot).toLocaleString()}</div>
                                    <div className="text-sm text-gray-600">With: {b.provider?.displayName || b.requester?.displayName || 'User'}</div>
                                </div>
                                <div className="flex flex-col justify-between items-end gap-4">
                                    <BookingStatusBadge status={b.status} />
                                    <div className="flex gap-2">
                                        {/* Provider actions: admin approves now. Providers can add a meet link for Approved bookings and start them. */}
                                        {user && user.uid === b.providerID && b.status === 'Approved' && (
                                            meetLinks[b._id] ? (
                                                <button onClick={() => advanceStatus(b._id, 'In Progress')} className="px-4 py-2 bg-blue-600 text-white rounded-xl">Start & Send Link</button>
                                            ) : (
                                                <button onClick={() => setEditingMeetLink(b._id)} className="px-4 py-2 bg-green-600 text-white rounded-xl">Add Meet Link</button>
                                            )
                                        )}
                                        {user && user.uid === b.providerID && b.status === 'In Progress' && (
                                            <button onClick={() => advanceStatus(b._id, 'Completed')} className="px-4 py-2 bg-gray-800 text-white rounded-xl">Complete</button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 rounded-2xl border border-blue-50 bg-blue-50/50 p-4 text-sm text-slate-700">
                                <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-1">Credit Transaction</p>
                                {b.creditSummary?.settlement === 'pending' ? (
                                    <p>No credit movement yet. This booking is still waiting for approval.</p>
                                ) : user?.uid === b.requesterID ? (
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                        <p>
                                            Booking price: <span className="font-black">{b.creditSummary?.servicePrice ?? b.service?.price ?? 0}</span> credits
                                        </p>
                                        <p className="font-bold">
                                            You paid <span className="text-red-600">
                                                -{b.creditSummary?.servicePrice ?? b.service?.price ?? 0}
                                            </span> credits on this booking
                                        </p>
                                    </div>
                                ) : b.status === 'Completed' ? (
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                        <p>
                                            Booking price: <span className="font-black">{b.creditSummary?.servicePrice ?? b.service?.price ?? 0}</span> credits
                                        </p>
                                        <p className="font-bold">
                                            You earned <span className="text-green-600">+{b.creditSummary?.servicePrice ?? b.service?.price ?? 0}</span> credits on this booking
                                        </p>
                                    </div>
                                ) : (
                                    <p>Credits are reserved for this booking and will be released to the provider after completion.</p>
                                )}
                            </div>

                            {/* Meet Link Input - provider can add link when editing (for Approved bookings or when started) */}
                            {editingMeetLink === b._id && user && user.uid === b.providerID && (
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Add Meet Link</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="url"
                                            placeholder="https://meet.google.com/..."
                                            value={meetLinks[b._id] || ''}
                                            onChange={(e) => setMeetLinks({ ...meetLinks, [b._id]: e.target.value })}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                                        />
                                        <button
                                            onClick={() => advanceStatus(b._id, 'In Progress')}
                                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                        >
                                            Start & Send
                                        </button>
                                        <button
                                            onClick={() => setEditingMeetLink(null)}
                                            className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Show meet link if approved and has link */}
                            {b.meetLink && user && (user.uid === b.requesterID || user.uid === b.providerID) && (
                                <div className="mt-4 pt-4 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                    <div>
                                        <p className="text-sm font-medium text-gray-700 mb-2">Meeting Link</p>
                                        <a
                                            href={b.meetLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:underline break-all max-w-md block"
                                            onClick={(e) => { /* let default anchor behavior */ }}
                                        >
                                            {b.meetLink}
                                        </a>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => openMeetLink(b.meetLink)}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold"
                                        >
                                            Join Meeting
                                        </button>
                                        <button
                                            onClick={() => copyMeetLink(b.meetLink)}
                                            className="px-3 py-2 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50"
                                        >
                                            Copy Link
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                                <p className="text-sm text-gray-600">
                                    Showing {startIndex + 1}-{Math.min(startIndex + bookingsPerPage, sortedBookings.length)} of {sortedBookings.length}
                                </p>
                                <div className="flex items-center gap-2 flex-wrap justify-center">
                                    <button
                                        onClick={() => goToPage(safePage - 1)}
                                        disabled={safePage === 1}
                                        className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
                                    >
                                        Previous
                                    </button>

                                    {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                                        <button
                                            key={page}
                                            onClick={() => goToPage(page)}
                                            className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${page === safePage
                                                ? 'bg-blue-600 text-white border-blue-600'
                                                : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                                            }`}
                                        >
                                            {page}
                                        </button>
                                    ))}

                                    <button
                                        onClick={() => goToPage(safePage + 1)}
                                        disabled={safePage === totalPages}
                                        className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default BookingsPage;
