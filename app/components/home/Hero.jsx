"use client";
import React, { useState } from 'react';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    sendEmailVerification,
    signOut
} from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { auth } from '@/app/(backend)/lib/firebase';
import Swal from 'sweetalert2';

const Hero = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const googleProvider = new GoogleAuthProvider();
    const nwuEmailRegex = /^[0-9]{11}@nwu\.ac\.bd$/;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // 1. Strict NWU Format Validation
        if (!nwuEmailRegex.test(email)) {
            Swal.fire({
                icon: 'error',
                title: 'Invalid Email Format',
                text: 'You must use your student email (e.g., 20241080010@nwu.ac.bd)',
                confirmButtonColor: '#2563EB'
            });
            setLoading(false);
            return;
        }

        try {
            if (isLogin) {
                // --- LOGIN PROCESS ---
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;

                // 2. Check if Email is Verified
                if (!user.emailVerified) {
                    await signOut(auth); // Logic: Verified na thakle session rakha jabe na
                    Swal.fire({
                        icon: 'warning',
                        title: 'Email Not Verified!',
                        text: 'Please check your NWU email and click the verification link before logging in.',
                        showCancelButton: true,
                        confirmButtonText: 'Resend Link',
                        cancelButtonText: 'Okay',
                        confirmButtonColor: '#2563EB',
                    }).then(async (result) => {
                        if (result.isConfirmed) {
                            // User abar link pathate chaile
                            const newUserCredential = await signInWithEmailAndPassword(auth, email, password);
                            await sendEmailVerification(newUserCredential.user);
                            await signOut(auth);
                            Swal.fire('Sent!', 'A new verification link has been sent to your email.', 'success');
                        }
                    });
                    setLoading(false);
                    return;
                }

                // Success Login
                Swal.fire({
                    icon: 'success',
                    title: 'Welcome!',
                    text: 'Login successful. Redirecting to dashboard...',
                    timer: 2000,
                    showConfirmButton: false
                });
                setTimeout(() => router.push('/'), 2000);

            } else {
                // --- SIGNUP PROCESS ---
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                
                // 3. Send Verification Link immediately after account creation
                await sendEmailVerification(userCredential.user);
                
                // Force logout so they can't access dashboard without verifying
                await signOut(auth);
                
                Swal.fire({
                    icon: 'success',
                    title: 'Account Created!',
                    text: 'A verification link has been sent to your NWU email. Please verify it first, then you can login.',
                    confirmButtonColor: '#2563EB'
                });
                
                setIsLogin(true); // Switch to login tab
                setEmail('');
                setPassword('');
            }
        } catch (err) {
            let msg = "An error occurred. Please try again.";
            if (err.code === 'auth/email-already-in-use') msg = "This ID is already registered!";
            if (err.code === 'auth/invalid-credential') msg = "Wrong email or password.";
            if (err.code === 'auth/too-many-requests') msg = "Too many attempts. Try again later.";

            Swal.fire({
                icon: 'error',
                title: 'Oops!',
                text: msg,
                confirmButtonColor: '#2563EB'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="w-full min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 md:p-12">
            <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                
                <div className="space-y-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-200 bg-blue-50 text-blue-600 text-xs font-bold uppercase">
                        <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
                        NWU Student Marketplace
                    </div>
                    <h1 className="text-5xl md:text-7xl font-extrabold text-[#0F172A] leading-tight">
                        SkillBridge <br /> <span className="text-blue-600">Verified Access</span>
                    </h1>
                    <p className="text-gray-500 text-lg max-w-md font-medium">
                        Securely trade skills within the North Western University community.
                    </p>
                </div>

                <div className="bg-white p-8 md:p-10 rounded-[40px] shadow-2xl w-full max-w-[450px] border border-gray-50">
                    <div className="flex bg-gray-100 p-1.5 rounded-2xl mb-8">
                        <button onClick={() => setIsLogin(true)} className={`flex-1 py-2.5 rounded-xl font-bold transition-all ${isLogin ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}>Login</button>
                        <button onClick={() => setIsLogin(false)} className={`flex-1 py-2.5 rounded-xl font-bold transition-all ${!isLogin ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}>Sign Up</button>
                    </div>

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <div>
                            <label className="text-xs font-bold text-gray-400 ml-1 uppercase">NWU Student Email</label>
                            <input
                                type="email" required value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="20241080010@nwu.ac.bd"
                                className="w-full px-4 py-4 mt-1 rounded-xl bg-[#F8FAFC] border border-gray-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-400 ml-1 uppercase">Password</label>
                            <input
                                type="password" required value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full px-4 py-4 mt-1 rounded-xl bg-[#F8FAFC] border border-gray-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            />
                        </div>

                        <button
                            type="submit" disabled={loading}
                            className={`w-full py-4 rounded-2xl text-white font-bold text-lg transition-all shadow-lg ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700 active:scale-95 shadow-blue-100'}`}
                        >
                            {loading ? 'Sending...' : (isLogin ? 'Login Now' : 'Send Verification Link')}
                        </button>
                    </form>
                </div>
            </div>
        </section>
    );
};

export default Hero;