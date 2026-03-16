"use client";
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { auth } from '@/app/(backend)/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2'; // 👈 Swal import kora holo

const Navbar = () => {
    const [user, setUser] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    const handleLogout = async () => {
        // --- Custom Swal Confirmation ---
        Swal.fire({
            title: 'Are you sure?',
            text: "You will be logged out from your account!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#2563EB', // Blue color to match your theme
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, Logout!',
            cancelButtonText: 'Stay here'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await signOut(auth);

                    // --- Success Toast/Alert ---
                    Swal.fire({
                        icon: 'success',
                        title: 'Logged Out!',
                        text: 'See you again soon.',
                        showConfirmButton: false,
                        timer: 1500
                    });

                    router.push('/dashboard');
                } catch (error) {
                    Swal.fire('Error!', 'Logout failed. Please try again.', 'error');
                }
            }
        });
    };

    return (
        <div className='w-full px-8 bg-[#fcf7f7] border-b border-gray-100 shadow-sm'>
            <nav className="max-w-6xl mx-auto flex items-center justify-between ">
                {/* Left Side: Logo */}
                <Link href="/">
                    <div className="flex items-center gap-2 cursor-pointer">
                        <img
                            src="/logo/logo-removebg.png"
                            alt="SkillBridge Logo"
                            className="h-20 w-20 object-contain"
                        />
                    </div>
                </Link>

                {/* Center: Navigation Links */}
                <div className="hidden md:flex items-center gap-8">
                    <Link href="/HowItWorks" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">How it Works</Link>
                    <Link href="/about" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">About</Link>
                    <Link href="/SafetyRules" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">Safety Rules</Link>
                </div>

                {/* Right Side: Auth Buttons */}
                <div className="flex items-center gap-6">
                    {user ? (
                        <>

                            
                            <Link href="/dashboard" className="text-sm font-semibold text-gray-600 hover:text-gray-900">
                                Dashboard
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="bg-red-500 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-red-600 transition-all shadow-md shadow-red-100"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link href="/" className="text-sm font-semibold text-gray-600 hover:text-gray-900">
                                Login
                            </Link>
                            <Link href="/">
                                <button className="bg-[#2563EB] text-white px-6 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition-all shadow-md shadow-blue-100">
                                    Get Started
                                </button>
                            </Link>
                        </>
                    )}
                </div>
            </nav>
        </div>
    );
};

export default Navbar;