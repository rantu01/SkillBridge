'use client';

import React, { useState, useEffect } from 'react';
import { auth } from '@/app/(backend)/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Swal from 'sweetalert2';

const BookingForm = ({ service }) => {
    const [user, setUser] = useState(null);
    const [creditBalance, setCreditBalance] = useState(0);
    const [dateTime, setDateTime] = useState('');
    const [loading, setLoading] = useState(false);
    const servicePrice = Number(service?.price || 0);
    const insufficientCredits = Boolean(user) && creditBalance < servicePrice;

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (u) => {
            setUser(u);

            if (!u?.uid) {
                setCreditBalance(0);
                return;
            }

            try {
                const res = await fetch('/api/sync-user', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        uid: u.uid,
                        email: u.email,
                        displayName: u.displayName
                    })
                });
                const data = await res.json();
                if (data.success && data.user) {
                    setCreditBalance(Number(data.user.credits || 0));
                }
            } catch (error) {
                console.error('Error loading credit balance:', error);
            }
        });
        return unsub;
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) return Swal.fire({ icon: 'error', text: 'You must be signed in to request a booking.' });
        if (!dateTime) return Swal.fire({ icon: 'error', text: 'Please pick a date and time.' });
        if (insufficientCredits) {
            return Swal.fire({
                icon: 'warning',
                title: 'Insufficient credits',
                text: `You need ${servicePrice - creditBalance} more credits to request this booking.`,
            });
        }

        setLoading(true);
        try {
            const res = await fetch('/api/booking', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    serviceID: service._id || service.id,
                    requesterID: user.uid,
                    providerID: service.ownerID || service.owner || '',
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

            <div className={`rounded-2xl border p-4 ${insufficientCredits ? 'border-amber-200 bg-amber-50 text-amber-900' : 'border-gray-100 bg-gray-50 text-gray-700'}`}>
                <p className="text-xs font-black uppercase tracking-widest">Credit Check</p>
                <p className="mt-1 text-sm font-medium">
                    Your balance: <span className="font-black">{creditBalance}</span> credits. Booking cost: <span className="font-black">{servicePrice}</span> credits.
                </p>
                {insufficientCredits && (
                    <p className="mt-2 text-sm font-bold">
                        You need {servicePrice - creditBalance} more credits before you can request this booking.
                    </p>
                )}
            </div>

            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={loading || insufficientCredits}
                    className="bg-[#0052CC] text-white px-6 py-3 rounded-xl font-bold disabled:opacity-60"
                >
                    {loading ? 'Requesting...' : insufficientCredits ? 'Insufficient Credits' : 'Request Booking'}
                </button>
            </div>
        </form>
    );
};

export default BookingForm;
