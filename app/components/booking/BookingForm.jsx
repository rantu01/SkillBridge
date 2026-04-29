'use client';

import React, { useState, useEffect } from 'react';
import { auth } from '@/app/(backend)/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Swal from 'sweetalert2';

const BookingForm = ({ service }) => {
    const [user, setUser] = useState(null);
    const [dateTime, setDateTime] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (u) => setUser(u));
        return unsub;
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) return Swal.fire({ icon: 'error', text: 'You must be signed in to request a booking.' });
        if (!dateTime) return Swal.fire({ icon: 'error', text: 'Please pick a date and time.' });

        setLoading(true);
        try {
            const res = await fetch('/api/booking', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    serviceID: service._id || service.id,
                    requesterID: user.uid,
                    providerID: service.ownerID || service.ownerID || service.owner || service.ownerID,
                    timeSlot: dateTime
                })
            });
            const data = await res.json();
            if (data.success) {
                Swal.fire({ icon: 'success', title: 'Requested', text: 'Booking request created.' });
                setDateTime('');
            } else {
                Swal.fire({ icon: 'error', text: data.error || 'Failed to create booking' });
            }
        } catch (err) {
            console.error(err);
            Swal.fire({ icon: 'error', text: 'Server error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block text-sm font-bold">Select Date & Time</label>
            <input
                type="datetime-local"
                className="w-full px-4 py-3 rounded-xl border border-gray-200"
                value={dateTime}
                onChange={(e) => setDateTime(e.target.value)}
                required
            />

            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-[#0052CC] text-white px-6 py-3 rounded-xl font-bold disabled:opacity-60"
                >
                    {loading ? 'Requesting...' : 'Request Booking'}
                </button>
            </div>
        </form>
    );
};

export default BookingForm;
