'use client';

import React from 'react';
import { Star } from 'lucide-react';

const StarRating = ({
    rating = 0,
    count = 0,
    size = 16,
    className = '',
    interactive = false,
    onChange,
    showValue = false,
    showCount = true,
    valueClassName = 'text-slate-500',
    starClassName = 'text-amber-400 fill-amber-400'
}) => {
    const safeRating = Number.isFinite(Number(rating)) ? Math.max(0, Math.min(5, Number(rating))) : 0;
    const activeStars = Math.round(safeRating);

    return (
        <div className={`inline-flex items-center gap-1.5 ${className}`}>
            {Array.from({ length: 5 }, (_, index) => {
                const isActive = index < activeStars;

                if (interactive) {
                    return (
                        <button
                            key={index}
                            type="button"
                            onClick={() => onChange?.(index + 1)}
                            className="transition-transform hover:scale-110"
                            aria-label={`Rate ${index + 1} stars`}
                        >
                            <Star size={size} className={isActive ? starClassName : 'text-slate-300'} fill={isActive ? 'currentColor' : 'none'} />
                        </button>
                    );
                }

                return (
                    <span key={index}>
                        <Star size={size} className={isActive ? starClassName : 'text-slate-300'} fill={isActive ? 'currentColor' : 'none'} />
                    </span>
                );
            })}

            {showValue && (
                <span className={`ml-1 text-sm font-bold ${valueClassName}`}>
                    {safeRating ? safeRating.toFixed(1) : '0.0'}
                </span>
            )}

            {showCount && count > 0 && (
                <span className="ml-0.5 text-xs font-bold text-slate-400">
                    ({count})
                </span>
            )}
        </div>
    );
};

export default StarRating;