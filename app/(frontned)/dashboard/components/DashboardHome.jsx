"use client"
import React, { useState, useEffect } from 'react';
import { Star, ArrowRight, Download, Calendar, DollarSign, Award, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { auth } from '@/app/(backend)/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const DashboardHome = () => {
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
                    console.error("Error syncing user:", error);
                    setUser(currentUser);
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const stats = [
        { label: 'Active Bookings', value: '04', change: '+1 from last week', icon: <Calendar className="text-blue-500" />, bg: 'bg-blue-50' },
        { label: 'Total Revenue', value: '1,250 Cr', change: 'Top 5% Earners', icon: <DollarSign className="text-purple-500" />, bg: 'bg-purple-50' },
        { label: 'Seller Rating', value: '4.92', change: 'Based on 24 reviews', icon: <Award className="text-orange-500" />, bg: 'bg-orange-50' },
    ];

    const handpicked = [
        { title: 'Advanced React & Tailwind Best Practices', author: 'Leo S.', price: '40', rating: '4.9(12)', tag: 'DEVELOPMENT', color: 'bg-indigo-600' },
        { title: 'Visual Identity & Personal Branding', author: 'Maya R.', price: '65', rating: '5.0(8)', tag: 'DESIGN', color: 'bg-orange-400' },
        { title: 'Essay Proofreading & Feedback', author: 'James T.', price: '25', rating: '4.8(31)', tag: 'WRITING', color: 'bg-blue-400' },
        { title: 'Basic Photography & Editing', author: 'Sarah L.', price: '50', rating: '4.7(5)', tag: 'MEDIA', color: 'bg-teal-600' },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96 w-full">
                <Loader2 className="animate-spin text-blue-600" size={48} />
            </div>
        );
    }

    return (
        <div className="space-y-10 pb-10 mt-100">
            {/* --- Welcome Header --- */}
            <div className="bg-white p-10 rounded-[40px] shadow-sm border border-gray-50 uppercase">
                <h1 className="text-4xl font-extrabold text-gray-900 leading-tight">
                    Welcome back, <span className="text-blue-600">{user?.displayName?.split(' ')[0] || 'User'}</span>! 👋
                </h1>
                <p className="text-gray-500 mt-2 text-lg normal-case">
                    You have <span className="text-blue-600 font-bold underline">2 new requests</span> and your "React Tutoring" service is trending this week.
                </p>
            </div>

            {/* --- Stats Cards --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white p-8 rounded-[35px] shadow-sm border border-gray-50 flex flex-col gap-4">
                        <div className="flex items-center gap-4">
                            <div className={`${stat.bg} p-4 rounded-2xl`}>{stat.icon}</div>
                            <div>
                                <p className="text-gray-400 text-sm font-bold uppercase">{stat.label}</p>
                                <h3 className="text-3xl font-black text-gray-800">{stat.value}</h3>
                            </div>
                        </div>
                        <div className="text-xs font-bold px-3 py-1 rounded-full bg-gray-50 w-fit text-gray-500 border border-gray-100">
                            {stat.change}
                        </div>
                    </div>
                ))}
            </div>

            {/* --- Handpicked Section --- */}
            <div>
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900">Handpicked for you</h2>
                        <p className="text-gray-400 text-sm">Based on your recent interests and major</p>
                    </div>
                    <button className="flex items-center gap-2 text-blue-600 font-bold hover:underline">
                        Explore all services <ArrowRight size={18} />
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {handpicked.map((item, i) => (
                        <div key={i} className="bg-white rounded-[30px] overflow-hidden shadow-sm border border-gray-50 group hover:shadow-xl transition-all">
                            <div className={`h-32 ${item.color} relative p-4 uppercase text-[10px] font-black text-white`}>
                                <span className="bg-white/20 backdrop-blur-md px-2 py-1 rounded-md">{item.tag}</span>
                                <div className="absolute inset-0 flex items-center justify-center opacity-20 text-white font-bold text-center p-2">
                                    [Illustration Placeholder]
                                </div>
                            </div>
                            <div className="p-5 space-y-3">
                                <div className="flex items-center gap-1 text-orange-400 font-bold text-xs">
                                    <Star size={14} fill="currentColor" /> {item.rating}
                                </div>
                                <h4 className="font-bold text-gray-800 leading-tight h-10 line-clamp-2">{item.title}</h4>
                                <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-gray-200" />
                                        <span className="text-xs text-gray-500 font-medium">{item.author}</span>
                                    </div>
                                    <span className="text-blue-600 font-black">{item.price}<small className="text-[10px] ml-0.5">Cr/hr</small></span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* --- Recent Transactions Table --- */}
            <div className="bg-white rounded-[40px] p-8 shadow-sm border border-gray-50">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-black text-gray-900">Recent Transactions</h2>
                    <button className="text-gray-400 font-bold text-sm hover:text-blue-600 flex items-center gap-2">
                        Download History <Download size={16} />
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-gray-400 text-xs font-black uppercase tracking-wider border-b border-gray-50">
                                <th className="pb-4">Service Details</th>
                                <th className="pb-4">Category</th>
                                <th className="pb-4">Date</th>
                                <th className="pb-4">Status</th>
                                <th className="pb-4 text-right">Credit Delta</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {[
                                { name: 'Guitar Fundamentals', cat: 'Creative', date: 'Oct 12, 2023', status: 'Completed', delta: '+120', color: 'text-green-500' },
                                { name: 'React Debugging Session', cat: 'Tech Help', date: 'Oct 10, 2023', status: 'Processing', delta: '-50', color: 'text-red-500' },
                            ].map((row, i) => (
                                <tr key={i} className="group hover:bg-gray-50/50 transition-all">
                                    <td className="py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center font-bold text-gray-400">#</div>
                                            <span className="font-bold text-gray-700">{row.name}</span>
                                        </div>
                                    </td>
                                    <td className="py-5"><span className="px-3 py-1 bg-gray-100 rounded-lg text-[10px] font-black uppercase text-gray-500">{row.cat}</span></td>
                                    <td className="py-5 text-gray-500 font-medium text-sm">{row.date}</td>
                                    <td className="py-5">
                                        <span className="flex items-center gap-1.5 text-xs font-bold text-gray-600">
                                            <span className={`w-1.5 h-1.5 rounded-full ${row.status === 'Completed' ? 'bg-green-500' : 'bg-orange-500'}`} />
                                            {row.status}
                                        </span>
                                    </td>
                                    <td className={`py-5 text-right font-black ${row.color}`}>{row.delta}<span className="text-[10px] ml-0.5">Cr</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DashboardHome;