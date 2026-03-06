"use client";
import React, { useState, useEffect } from 'react'; // Added useEffect
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    onAuthStateChanged, // Added this to check login status
    GoogleAuthProvider,
    sendEmailVerification,
    signOut
} from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { auth } from '@/app/(backend)/lib/firebase';
import Swal from 'sweetalert2';
import Image from 'next/image'; // Next.js Image component use kora bhalo

const Hero = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null); // User state
    const router = useRouter();

    const nwuEmailRegex = /^[0-9]{11}@nwu\.ac\.bd$/;

    // --- Check if User is Logged In ---
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            // Check if user is logged in AND email is verified
            if (currentUser && currentUser.emailVerified) {
                setUser(currentUser);
            } else {
                setUser(null);
            }
        });
        return () => unsubscribe();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

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
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;

                if (!user.emailVerified) {
                    await signOut(auth);
                    Swal.fire({
                        icon: 'warning',
                        title: 'Email Not Verified!',
                        text: 'Please check your NWU email and click the verification link before logging in.',
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

            } else {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                await sendEmailVerification(userCredential.user);
                await signOut(auth);
                
                Swal.fire({
                    icon: 'success',
                    title: 'Account Created!',
                    text: 'A verification link has been sent to your NWU email.',
                    confirmButtonColor: '#2563EB'
                });
                setIsLogin(true);
            }
        } catch (err) {
            let msg = "An error occurred. Please try again.";
            if (err.code === 'auth/email-already-in-use') msg = "This ID is already registered!";
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
                                onClick={() => router.push('/dashboard')} // Example redirect
                                className="mt-8 px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all"
                            >
                                Go to Dashboard
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
                                    {loading ? 'Processing...' : (isLogin ? 'Login Now' : 'Send Verification Link')}
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </section>
    );
};

export default Hero;