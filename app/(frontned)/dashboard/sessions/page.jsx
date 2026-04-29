'use client';

import React, { useState, useEffect } from 'react';
import { auth } from '@/app/(backend)/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import BookingStatusBadge from '@/app/components/booking/BookingStatusBadge';
import { Video, Copy, Check, AlertCircle } from 'lucide-react';

const SessionsPage = () => {
    const [user, setUser] = useState(null);
    const [allBookings, setAllBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [copiedLink, setCopiedLink] = useState(null);

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
                console.log('All bookings:', data.bookings);
                setAllBookings(data.bookings);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (link, id) => {
        navigator.clipboard.writeText(link);
        setCopiedLink(id);
        setTimeout(() => setCopiedLink(null), 2000);
    };

    const activeSessions = allBookings.filter(b => 
        (b.status === 'Approved' || b.status === 'In Progress') && b.meetLink
    );

    const approvedWithoutLink = allBookings.filter(b =>
        (b.status === 'Approved' || b.status === 'In Progress') && !b.meetLink
    );

    if (loading) return <div className="py-20 text-center">Loading sessions...</div>;

    return (
        <div className="min-h-screen p-6 bg-gray-50">
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-50">
                    <div className="flex items-center gap-3">
                        <Video className="text-blue-600" size={28} />
                        <div>
                            <h1 className="text-2xl font-bold">Active Sessions</h1>
                            <p className="text-sm text-gray-500">Your approved bookings with meeting links</p>
                        </div>
                    </div>
                </div>

                {/* Active Sessions with Meet Links */}
                {activeSessions.length > 0 ? (
                    <div className="space-y-4">
                        {activeSessions.map(b => (
                            <div key={b._id} className="bg-white p-6 rounded-2xl shadow-sm border border-green-200 hover:shadow-md transition">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className="font-bold text-lg">{b.service?.title || 'Service'}</h3>
                                            <BookingStatusBadge status={b.status} />
                                        </div>
                                        <div className="text-sm text-gray-600 space-y-1">
                                            <div>📅 When: {new Date(b.timeSlot).toLocaleString()}</div>
                                            <div>👤 With: {b.provider?.displayName || b.requester?.displayName || 'User'}</div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <a
                                            href={b.meetLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-center transition"
                                        >
                                            Join Meeting
                                        </a>
                                        <button
                                            onClick={() => copyToClipboard(b.meetLink, b._id)}
                                            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium flex items-center justify-center gap-2 transition"
                                        >
                                            {copiedLink === b._id ? (
                                                <>
                                                    <Check size={16} />
                                                    Copied!
                                                </>
                                            ) : (
                                                <>
                                                    <Copy size={16} />
                                                    Copy Link
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Meeting Link Display */}
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <p className="text-xs font-medium text-gray-500 mb-2">MEETING LINK</p>
                                    <div className="bg-gray-50 p-3 rounded-lg break-all text-sm text-gray-700">
                                        {b.meetLink}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white p-12 rounded-2xl text-center border border-gray-200">
                        <div className="space-y-4">
                            {allBookings.length === 0 ? (
                                <>
                                    <Video size={48} className="mx-auto text-gray-300" />
                                    <p className="text-gray-500 text-lg">No bookings yet</p>
                                    <p className="text-sm text-gray-400">Create or receive a booking first to see sessions</p>
                                </>
                            ) : approvedWithoutLink.length > 0 ? (
                                <>
                                    <AlertCircle size={48} className="mx-auto text-orange-400" />
                                    <p className="text-gray-600 text-lg font-medium">Waiting for meeting links</p>
                                    <p className="text-sm text-gray-400">
                                        You have {approvedWithoutLink.length} approved booking{approvedWithoutLink.length > 1 ? 's' : ''} without meeting links yet
                                    </p>
                                    <div className="mt-6 pt-6 border-t border-gray-200">
                                        <p className="text-sm font-medium text-gray-600 mb-3">Approved Bookings Awaiting Meet Links:</p>
                                        <div className="space-y-2 text-left">
                                            {approvedWithoutLink.map(b => (
                                                <div key={b._id} className="bg-gray-50 p-3 rounded-lg text-sm">
                                                    <p className="font-medium text-gray-800">{b.service?.title || 'Service'}</p>
                                                    <p className="text-gray-600">With: {b.provider?.displayName || b.requester?.displayName || 'User'}</p>
                                                    <p className="text-gray-500">📅 {new Date(b.timeSlot).toLocaleString()}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <Video size={48} className="mx-auto text-gray-300" />
                                    <p className="text-gray-500 text-lg">No active sessions yet</p>
                                    <p className="text-sm text-gray-400">Sessions will appear here once bookings are approved with meeting links</p>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* Debug Info - Show all bookings count */}
                {allBookings.length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg text-sm text-blue-800">
                        <p className="font-medium">📊 Booking Summary:</p>
                        <p className="text-xs text-blue-700 mt-1">
                            Total: {allBookings.length} | Approved with links: {activeSessions.length} | Approved without links: {approvedWithoutLink.length}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SessionsPage;
