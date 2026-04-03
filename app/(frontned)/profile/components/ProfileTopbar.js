'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Bell, Settings, ShieldCheck, Shield, UserCircle2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { auth } from '@/app/(backend)/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const ProfileTopbar = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                try {
                    const res = await fetch(`/api/sync-user`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            uid: currentUser.uid,
                            email: currentUser.email,
                            displayName: currentUser.displayName,
                        })
                    });
                    const data = await res.json();
                    if (data.success && data.user) {
                        setUser(data.user);
                    } else {
                        setUser(currentUser);
                    }
                } catch (error) {
                    console.error("Error syncing user for topbar:", error);
                    setUser(currentUser);
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    return (
        <div className="bg-white border-b border-gray-100">
            {/* Top Header */}
            <header className="h-20 px-6 md:px-12 flex items-center justify-between">
                {/* Left Side: Back Button & Title */}
                <div className="flex items-center gap-4">
                    <Link
                        href="/dashboard"
                        className="p-2 hover:bg-gray-100 rounded-full transition-all text-gray-500"
                    >
                        <ArrowLeft size={24} />
                    </Link>
                    <div>
                        <h1 className="text-xl font-black text-gray-900 leading-none">Account Settings</h1>
                        <p className={`text-[10px] font-bold uppercase mt-1.5 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border ${user?.isVerified ? 'text-blue-600 bg-blue-50 border-blue-100' : 'text-gray-400 bg-gray-50 border-gray-100'}`}>
                            {user?.isVerified ? (
                                <>
                                    <ShieldCheck size={12} fill="currentColor" fillOpacity={0.2} /> Verified Member
                                </>
                            ) : (
                                <>
                                    <Shield size={12} /> SkillBridge Member
                                </>
                            )}
                        </p>
                    </div>
                </div>

                {/* Navigation Menu */}
                <nav className="hidden lg:flex items-center gap-8 px-6">

                    <Link
                        href="/profile"
                        className="whitespace-nowrap text-sm font-bold text-gray-600 hover:text-blue-600 transition-colors pb-1 border-b-2 border-transparent hover:border-blue-600"
                    >
                        Profile
                    </Link>

                    <Link
                        href="/profile/my-services"
                        className="whitespace-nowrap text-sm font-bold text-gray-600 hover:text-blue-600 transition-colors pb-1 border-b-2 border-transparent hover:border-blue-600"
                    >
                        My Services
                    </Link>
                    <Link
                        href="/profile/student-verification"
                        className="whitespace-nowrap text-sm font-bold text-gray-600 hover:text-blue-600 transition-colors pb-1 border-b-2 border-transparent hover:border-blue-600"
                    >
                        Verification
                    </Link>
                </nav>

                {/* Right Side: Actions & Profile */}
                <div className="flex items-center gap-3 md:gap-6">
                    {/* Notifications */}
                    <button className="relative p-2 text-gray-400 hover:text-blue-600 transition-colors">
                        <Bell size={22} />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                    </button>

                    {/* User Info */}
                    <div className="flex items-center gap-3">
                        <div className="hidden md:block text-right">
                            <p className="text-sm font-black text-gray-800 leading-tight">{user?.displayName || 'User'}</p>
                            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                                UID: {user?.uid ? user.uid.slice(0, 8) : 'Not Logged In'}...
                            </p>
                        </div>
                        <div className="relative group cursor-pointer">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-400 p-[2px] shadow-sm transform group-hover:scale-105 transition-all">
                                <div className="w-full h-full bg-white rounded-[14px] overflow-hidden flex items-center justify-center relative">
                                    {user?.photoURL ? (
                                        <img
                                            src={user.photoURL}
                                            alt="User"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gray-50 flex items-center justify-center text-blue-600">
                                            <UserCircle2 size={24} />
                                        </div>
                                    )}
                                    {user?.isVerified && (
                                        <div className="absolute top-0 right-0 p-0.5 bg-blue-600 rounded-bl-lg">
                                            <ShieldCheck size={8} className="text-white" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <Link href="/profile/settings" className="p-2 text-gray-400 hover:text-blue-600 transition-colors hover:rotate-45 transition-transform duration-500">
                            <Settings size={20} />
                        </Link>
                    </div>
                </div>
            </header>
        </div>
    );
};

export default ProfileTopbar;