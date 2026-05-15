"use client";
import React, { useState, useEffect } from 'react'; // Added useEffect
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    onAuthStateChanged, // Added this to check login status
    GoogleAuthProvider,
    signInWithPopup,
    sendEmailVerification,
    signOut
} from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { auth } from '@/app/(backend)/lib/firebase';
import Swal from 'sweetalert2';
import Image from 'next/image'; // Next.js Image component use kora bhalo

const ADMIN_EMAIL = 'admin@admin.com';

const Hero = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null); // User state
    const router = useRouter();

    // allow any valid email (HTML `type="email"` enforces basic format)

    // --- Check if User is Logged In ---
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            const isAdminUser = currentUser?.email?.toLowerCase() === ADMIN_EMAIL;

            // Check if user is logged in AND email is verified, or is the admin account
            if (currentUser && (currentUser.emailVerified || isAdminUser)) {
                setUser(currentUser);
            } else {
                setUser(null);
            }
        });
        return () => unsubscribe();
    }, []);

    const googleProvider = new GoogleAuthProvider();

    const handleGoogleLogin = async () => {
        setLoading(true);
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const isAdminUser = result.user?.email?.toLowerCase() === ADMIN_EMAIL;
            Swal.fire({ icon: 'success', title: 'Google Login Successful!', timer: 1400, showConfirmButton: false });
            setTimeout(() => router.push(isAdminUser ? '/admin' : '/dashboard'), 700);
        } catch (err) {
            Swal.fire({ icon: 'error', title: 'Google login failed or cancelled.' });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isLogin) {
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;
                const isAdminUser = user.email?.toLowerCase() === ADMIN_EMAIL;

                if (!user.emailVerified && !isAdminUser) {
                    await signOut(auth);
                    Swal.fire({
                        icon: 'warning',
                        title: 'Email Not Verified!',
                        text: 'Please check your email and click the verification link before logging in.',
                        showCancelButton: true,
                        confirmButtonText: 'Resend Link',
                        confirmButtonColor: '#2563EB',
                    }).then(async (result) => {
                        if (result.isConfirmed) {
                            const newUserCredential = await signInWithEmailAndPassword(auth, email, password);
                            await sendEmailVerification(newUserCredential.user);
                            await signOut(auth);
                            Swal.fire('Sent!', 'A new verification link has been sent to your email.', 'success');
                        }
                    });
                    setLoading(false);
                    return;
                }

                Swal.fire({
                    icon: 'success',
                    title: 'Welcome!',
                    text: 'Login successful.',
                    timer: 2000,
                    showConfirmButton: false
                });

                if (isAdminUser) {
                    router.push('/admin');
                }

            } else {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                await sendEmailVerification(userCredential.user);
                await signOut(auth);

                Swal.fire({
                    icon: 'success',
                    title: 'Account Created!',
                    text: 'A verification link has been sent to your email.',
                    confirmButtonColor: '#2563EB'
                });
                setIsLogin(true);
            }
        } catch (err) {
            let msg = "An error occurred. Please try again.";
            if (err.code === 'auth/email-already-in-use') msg = "This email is already registered!";
            if (err.code === 'auth/invalid-credential') msg = "Wrong email or password.";

            Swal.fire({ icon: 'error', title: 'Oops!', text: msg });
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
                </div>

                {/* --- Dynamic Content Side --- */}
                <div className="bg-white p-8 md:p-10 rounded-[40px] shadow-2xl w-full max-w-[450px] border border-gray-50 flex flex-col items-center">
                    
                    {user ? (
                        /* Logged In State: Show Logo */
                        <div className="text-center py-10 animate-in fade-in zoom-in duration-500">
                            <Image 
                                src="/logo/logo-removebg.png" 
                                alt="SkillBridge Logo" 
                                width={250} 
                                height={250}
                                className="mx-auto drop-shadow-xl"
                            />
                            <h2 className="mt-6 text-2xl font-bold text-gray-800">Welcome Back!</h2>
                            <p className="text-gray-500 mt-2">You are securely logged in.</p>
                            <button 
                                onClick={() => router.push(user?.email?.toLowerCase() === ADMIN_EMAIL ? '/admin' : '/dashboard')}
                                className="mt-8 px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all"
                            >
                                {user?.email?.toLowerCase() === ADMIN_EMAIL ? 'Go to Admin Panel' : 'Go to Dashboard'}
                            </button>
                        </div>
                    ) : (
                        /* Logged Out State: Show Form */
                        <>
                            <div className="flex bg-gray-100 p-1.5 rounded-2xl mb-8 w-full">
                                <button onClick={() => setIsLogin(true)} className={`flex-1 py-2.5 rounded-xl font-bold transition-all ${isLogin ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}>Login</button>
                                <button onClick={() => setIsLogin(false)} className={`flex-1 py-2.5 rounded-xl font-bold transition-all ${!isLogin ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}>Sign Up</button>
                            </div>

                            <form className="space-y-5 w-full" onSubmit={handleSubmit}>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 ml-1 uppercase">Email</label>
                                    <input
                                        type="email" required value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@example.com"
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
                                    {loading ? 'Processing...' : (isLogin ? 'Login Now' : 'Send Verification Link')}
                                </button>
                                <div className="mt-3">
                                    <button
                                        type="button"
                                        onClick={handleGoogleLogin}
                                        disabled={loading}
                                        className="w-full py-3 rounded-2xl border border-gray-200 bg-white text-gray-700 font-semibold flex items-center justify-center gap-3 mt-2 hover:shadow-sm"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 533.5 544.3" className="w-5 h-5">
                                            <path fill="#4285f4" d="M533.5 278.4c0-17.5-1.5-34.3-4.3-50.6H272v95.6h147.4c-6.4 34.6-25 63.9-53.6 83.6v69.3h86.6c50.6-46.6 81.1-115.2 81.1-198z"/>
                                            <path fill="#34a853" d="M272 544.3c72.6 0 133.6-24 178.1-65.2l-86.6-69.3c-24.1 16.2-55 25.7-91.5 25.7-70 0-129.3-47.4-150.5-111.2H30.8v69.9C74.8 482.1 167.8 544.3 272 544.3z"/>
                                            <path fill="#fbbc04" d="M121.5 325.5c-10.8-32.5-10.8-67.5 0-100l-90.7-70.1C7 205.4 0 238.3 0 272s7 66.6 30.8 116.6l90.7-63.1z"/>
                                            <path fill="#ea4335" d="M272 109.7c38.5 0 73 13.3 100.3 39.4l75.1-75.1C405.6 27.4 347.6 0 272 0 167.8 0 74.8 62.2 30.8 157.6l90.7 70.1C142.7 157.1 202 109.7 272 109.7z"/>
                                        </svg>
                                        Continue with Google
                                    </button>
                                </div>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </section>
    );
};

export default Hero;