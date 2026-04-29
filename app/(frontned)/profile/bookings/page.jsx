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

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (u) => {
            setUser(u);
            if (u) fetchBookings(u.uid);
            else setLoading(false);
        });
        return unsub;
    }, []);

    const fetchBookings = async (uid) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/booking?userID=${uid}`);
            const data = await res.json();
            if (data.success) {
                setBookings(data.bookings);
                // Initialize meetLinks state
                const links = {};
                data.bookings.forEach(b => {
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

    if (loading) return <div className="py-20 text-center">Loading bookings...</div>;

    return (
        <div className="min-h-screen p-6">
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-50">
                    <h1 className="text-2xl font-bold">My Bookings</h1>
                    <p className="text-sm text-gray-500">Requests you've made or received</p>
                </div>

                {bookings.length === 0 ? (
                    <div className="bg-white p-6 rounded-2xl text-center text-gray-500">No bookings found.</div>
                ) : (
                    bookings.map(b => (
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
                                        {/* If current user is provider, show action to advance status */}
                                        {user && user.uid === b.providerID && b.status === 'Pending' && (
                                            <button onClick={() => setEditingMeetLink(b._id)} className="px-4 py-2 bg-green-600 text-white rounded-xl">Approve</button>
                                        )}
                                        {user && user.uid === b.providerID && b.status === 'Approved' && (
                                            <button onClick={() => advanceStatus(b._id, 'In Progress')} className="px-4 py-2 bg-blue-600 text-white rounded-xl">Start</button>
                                        )}
                                        {user && user.uid === b.providerID && b.status === 'In Progress' && (
                                            <button onClick={() => advanceStatus(b._id, 'Completed')} className="px-4 py-2 bg-gray-800 text-white rounded-xl">Complete</button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Meet Link Input - Show after approve click for Pending status */}
                            {editingMeetLink === b._id && b.status === 'Pending' && user && user.uid === b.providerID && (
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
                                            onClick={() => advanceStatus(b._id, 'Approved')}
                                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                        >
                                            Approve & Send
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
                            {b.status === 'Approved' && b.meetLink && user && user.uid === b.requesterID && (
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <p className="text-sm font-medium text-gray-700 mb-2">Meeting Link:</p>
                                    <a href={b.meetLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
                                        {b.meetLink}
                                    </a>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default BookingsPage;
