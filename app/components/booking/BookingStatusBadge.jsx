'use client';

import React from 'react';

const steps = ['Pending', 'Approved', 'In Progress', 'Completed'];

const BookingStatusBadge = ({ status }) => {
    const idx = steps.indexOf(status);

    return (
        <div className="flex items-center gap-3">
            {steps.map((s, i) => (
                <div key={s} className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${i <= idx ? 'bg-blue-600' : 'bg-gray-200'}`} />
                    <span className={`text-xs font-bold ${i <= idx ? 'text-gray-900' : 'text-gray-400'}`}>{s}</span>
                </div>
            ))}
        </div>
    );
};

export default BookingStatusBadge;
