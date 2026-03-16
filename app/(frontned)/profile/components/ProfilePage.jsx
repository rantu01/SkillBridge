'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
    Edit3, Plus, Star, MapPin,
    ChevronRight, Zap, ArrowUpRight,
    ArrowDownRight, CheckCircle2, Camera, X, Save, Trash2, Loader2,
    ShieldCheck, Shield
} from 'lucide-react';
import Image from 'next/image';
import { auth } from '@/app/(backend)/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Swal from 'sweetalert2';

const ProfilePage = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [displayName, setDisplayName] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [photoAction, setPhotoAction] = useState('update'); // 'update' or 'delete_photo'
    const [saving, setSaving] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                // Fetch full user data from our backend to get photoURL from DB if needed
                try {
                    const res = await fetch(`/api/sync-user`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        cache: 'no-store',
                        body: JSON.stringify({
                            uid: currentUser.uid,
                            email: currentUser.email,
                            displayName: currentUser.displayName,
                        })
                    });
                    const data = await res.json();
                    console.log('[SyncUser] Response Data:', data);
                    if (data.success && data.user) {
                        setUser(data.user);
                        setDisplayName(data.user.displayName || '');
                    } else {
                        console.warn('[SyncUser] Failed or no user data, falling back to Firebase Auth');
                        setUser(currentUser);
                        setDisplayName(currentUser.displayName || '');
                    }
                } catch (error) {
                    console.error("Error syncing user:", error);
                    setUser(currentUser);
                    setDisplayName(currentUser.displayName || '');
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPhotoAction('update');
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDeletePhoto = () => {
        setPhotoAction('delete_photo');
        setPreviewUrl(null);
        setSelectedFile(null);
    };

    const handleSave = async () => {
        if (!user) return;
        setSaving(true);
        try {
            const formData = new FormData();
            formData.append('uid', user.uid);
            formData.append('displayName', displayName);
            formData.append('action', photoAction);
            if (selectedFile) {
                formData.append('file', selectedFile);
            }

            const res = await fetch('/api/update-profile', {
                method: 'POST',
                body: formData
            });

            const data = await res.json();
            console.log('[UpdateProfile] Response Data:', data);
            if (data.success && data.user) {
                // Add a small timestamp for frontend cache bursting
                const updatedUser = {
                    ...data.user,
                    photoURL: data.user.photoURL ? `${data.user.photoURL}?t=${Date.now()}` : ''
                };
                setUser(updatedUser);
                setDisplayName(data.user.displayName || '');
                setIsEditing(false);
                setSelectedFile(null);
                setPreviewUrl(null);
                setPhotoAction('update');
                Swal.fire({
                    icon: 'success',
                    title: 'Profile Updated',
                    text: 'Your profile has been updated successfully!',
                    timer: 2000,
                    showConfirmButton: false,
                    background: '#ffffff',
                    color: '#1e293b',
                    iconColor: '#2563eb',
                    customClass: {
                        popup: 'rounded-[30px] border-none shadow-2xl',
                    }
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Update Failed',
                    text: data.error || 'Failed to update profile - No user data returned',
                    background: '#ffffff',
                    color: '#1e293b',
                    iconColor: '#ef4444',
                    customClass: {
                        popup: 'rounded-[30px] border-none shadow-2xl',
                    }
                });
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'An error occurred while updating profile',
                background: '#ffffff',
                color: '#1e293b',
                iconColor: '#ef4444',
                customClass: {
                    popup: 'rounded-[30px] border-none shadow-2xl',
                }
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto space-y-6 flex items-center justify-center h-96">
                <p className="text-gray-500 text-xl">Loading profile...</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="max-w-7xl mx-auto space-y-6 flex items-center justify-center h-96">
                <p className="text-gray-500 text-xl">Please login to view profile</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6">

            {/* 1. Profile Header Card */}
            <div className="bg-white p-6 md:p-8 rounded-[40px] shadow-sm border border-gray-50 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left w-full md:w-auto">
                    <div className="relative group">
                        <div className="w-32 h-32 rounded-[35px] overflow-hidden bg-gray-100 border-4 border-blue-50 relative">
                            {photoAction === 'delete_photo' ? (
                                <div className="w-full h-full bg-[#E8D5C4] flex items-end justify-center">
                                    <span className="text-4xl">🧑‍💻</span>
                                </div>
                            ) : previewUrl ? (
                                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                            ) : user?.photoURL ? (
                                <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-[#E8D5C4] flex items-end justify-center">
                                    <span className="text-4xl">🧑‍💻</span>
                                </div>
                            )}

                            {isEditing && (
                                <div
                                    className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity gap-2"
                                >
                                    <button
                                        onClick={() => fileInputRef.current.click()}
                                        className="p-2 bg-white/20 hover:bg-white/40 rounded-full text-white"
                                        title="Change Photo"
                                    >
                                        <Camera size={24} />
                                    </button>
                                    {(user?.photoURL || previewUrl) && photoAction !== 'delete_photo' && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeletePhoto();
                                            }}
                                            className="p-2 bg-red-500/60 hover:bg-red-500/80 rounded-full text-white"
                                            title="Delete Photo"
                                        >
                                            <Trash2 size={24} />
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Visual indicator for saving on the image itself */}
                            {saving && (
                                <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center z-20">
                                    <Loader2 className="text-blue-600 animate-spin mb-2" size={32} />
                                    <span className="text-xs font-black text-blue-600 uppercase tracking-wider">Uploading...</span>
                                </div>
                            )}
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                            accept="image/*"
                        />
                        <div className={`absolute -right-2 -bottom-2 p-1.5 rounded-xl shadow-md border ${user?.isVerified ? 'bg-blue-600 border-blue-500' : 'bg-white border-gray-100'}`}>
                            <CheckCircle2
                                className={user?.isVerified ? 'text-white' : 'text-gray-300'}
                                size={20}
                                fill="currentColor"
                                fillOpacity={user?.isVerified ? 0.2 : 0.1}
                            />
                        </div>
                    </div>

                    <div className="flex-1 w-full max-w-md">
                        {isEditing ? (
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">Display Name</label>
                                <input
                                    type="text"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    className="w-full text-2xl font-black text-gray-900 border-b-2 border-blue-100 focus:border-blue-500 outline-none pb-1 bg-transparent"
                                    placeholder="Enter your name"
                                />
                                <p className="text-blue-600 font-bold text-lg">{user?.email}</p>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center gap-3">
                                    <h1 className="text-3xl font-black text-gray-900">{user?.displayName || 'User'}</h1>
                                    {user?.isVerified ? (
                                        <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-600 text-white rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm">
                                            <ShieldCheck size={12} />
                                            Verified
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-[10px] font-black uppercase tracking-wider border border-gray-200">
                                            <Shield size={12} />
                                            Member
                                        </div>
                                    )}
                                </div>
                                <p className="text-blue-600 font-bold text-lg mt-1">{user?.email}</p>
                            </>
                        )}

                        <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-3">
                            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-full text-xs font-bold text-gray-500 border border-gray-100">
                                <MapPin size={14} /> Campus
                            </span>
                            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 rounded-full text-xs font-bold text-green-600 border border-green-100">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> Available for tasks
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3">
                    {isEditing ? (
                        <>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="px-6 py-3 rounded-2xl bg-blue-600 text-white font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all flex items-center gap-2 disabled:bg-blue-400 disabled:cursor-not-allowed"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 size={20} className="animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Save size={20} />
                                        Save Changes
                                    </>
                                )}
                            </button>
                            <button
                                onClick={() => {
                                    setIsEditing(false);
                                    setDisplayName(user?.displayName || '');
                                    setSelectedFile(null);
                                    setPreviewUrl(null);
                                }}
                                className="px-6 py-3 rounded-2xl border border-gray-200 font-bold text-gray-700 hover:bg-gray-50 transition-all flex items-center gap-2"
                            >
                                <X size={20} /> Cancel
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => setIsEditing(true)}
                                className="px-6 py-3 rounded-2xl border border-gray-200 font-bold text-gray-700 hover:bg-gray-50 transition-all flex items-center gap-2"
                            >
                                <Edit3 size={20} /> Edit Profile
                            </button>
                            <button className="px-6 py-3 rounded-2xl bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">
                                Post Service
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column: Skills & Reviews */}
                <div className="lg:col-span-2 space-y-6">

                    {/* 2. Skills & Expertise */}
                    <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-50">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-50 rounded-xl text-purple-600"><Zap size={20} /></div>
                                <h2 className="text-xl font-black text-gray-800">Skills & Expertise</h2>
                            </div>
                            <button className="text-blue-600 font-bold text-sm hover:underline">Manage Skills</button>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {[
                                { name: 'Python Development', color: 'bg-blue-50 text-blue-700 border-blue-100' },
                                { name: 'UI/UX Design', color: 'bg-purple-50 text-purple-700 border-purple-100' },
                                { name: 'Academic Writing', color: 'bg-orange-50 text-orange-700 border-orange-100' },
                                { name: 'Calculus Tutoring', color: 'bg-green-50 text-green-700 border-green-100' },
                                { name: 'Spanish (Fluent)', color: 'bg-red-50 text-red-700 border-red-100' },
                                { name: 'React.js', color: 'bg-cyan-50 text-cyan-700 border-cyan-100' },
                                { name: 'Data Analysis', color: 'bg-teal-50 text-teal-700 border-teal-100' },
                            ].map((skill, i) => (
                                <span key={i} className={`px-4 py-2 rounded-xl text-sm font-bold border ${skill.color}`}>
                                    {skill.name}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* 3. Recent Reviews */}
                    <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-50">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-xl font-black text-gray-800">Recent Reviews</h2>
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 rounded-xl text-orange-600 font-black">
                                <Star size={16} fill="currentColor" /> 4.9 <span className="text-gray-400 font-bold text-xs ml-1">(24 ratings)</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {[
                                { name: 'Sarah Jenkins', time: '2 days ago', service: 'Python Tutoring', comment: '"Alex was incredibly helpful with my data structures project. He explained complex concepts in a way that actually made sense. Definitely worth the credits!"' },
                                { name: 'Mark Thompson', time: '1 week ago', service: 'UI/UX Design', comment: '"Great eye for design. Helped me refine my portfolio site\'s user journey. Efficient and professional."' }
                            ].map((review, i) => (
                                <div key={i} className="p-6 rounded-[30px] border border-gray-50 bg-[#F9FAFB]/50 space-y-3">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gray-200" />
                                            <div>
                                                <h4 className="font-bold text-gray-800">{review.name}</h4>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase">{review.time} • {review.service}</p>
                                            </div>
                                        </div>
                                        <div className="flex text-orange-400"><Star size={14} fill="currentColor" /> <Star size={14} fill="currentColor" /> <Star size={14} fill="currentColor" /> <Star size={14} fill="currentColor" /> <Star size={14} fill="currentColor" /></div>
                                    </div>
                                    <p className="text-gray-500 text-sm leading-relaxed italic">{review.comment}</p>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-6 text-blue-600 font-bold text-sm hover:underline">Read All 24 Reviews</button>
                    </div>
                </div>

                {/* Right Column: Balance & Transactions */}
                <div className="space-y-6">

                    {/* 4. Balance Card */}
                    <div className="bg-[#5C5CFF] p-8 rounded-[40px] shadow-xl shadow-blue-100 text-white relative overflow-hidden">
                        <div className="absolute top-[-20px] right-[-20px] w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
                        <p className="text-xs font-black uppercase tracking-widest opacity-80">Total Balance</p>
                        <div className="flex items-baseline gap-2 mt-2 mb-8">
                            <h2 className="text-5xl font-black italic">2,450</h2>
                            <span className="font-bold opacity-80">CREDITS</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <button className="py-3 bg-white text-blue-600 font-black rounded-2xl text-sm hover:bg-gray-50 transition-all">Buy Credits</button>
                            <button className="py-3 bg-white/20 backdrop-blur-md text-white font-black rounded-2xl text-sm hover:bg-white/30 transition-all">Transfer</button>
                        </div>
                        <div className="absolute top-8 right-8 p-2 bg-white/20 rounded-xl"><Zap size={20} /></div>
                    </div>

                    {/* 5. Recent Transactions (Sidebar style) */}
                    <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-50">
                        <h2 className="text-xl font-black text-gray-800 mb-6 flex items-center gap-2">
                            Recent Transactions
                        </h2>
                        <div className="space-y-6">
                            {[
                                { name: 'Python Tutoring', date: 'Oct 24', delta: '+300', icon: <ArrowUpRight className="text-green-500" />, bg: 'bg-green-50' },
                                { name: 'Campus Cafe', date: 'Oct 22', delta: '-45', icon: <ArrowDownRight className="text-red-500" />, bg: 'bg-red-50' },
                                { name: 'Logo Design Pack', date: 'Oct 20', delta: '+1.2k', icon: <ArrowUpRight className="text-green-500" />, bg: 'bg-green-50' },
                            ].map((tx, i) => (
                                <div key={i} className="flex items-center justify-between group cursor-pointer">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2.5 rounded-xl ${tx.bg}`}>{tx.icon}</div>
                                        <div>
                                            <h4 className="font-bold text-gray-800 text-sm">{tx.name}</h4>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase">{tx.date} • {tx.delta} credits</p>
                                        </div>
                                    </div>
                                    <span className={`font-black text-sm ${tx.delta.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                                        {tx.delta}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-8 py-3 text-gray-400 font-black text-xs uppercase tracking-widest hover:text-blue-600 transition-all border-t border-gray-50 pt-6">
                            View Statement
                        </button>
                    </div>

                    {/* 6. Mini Stats Footer */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-purple-50 p-6 rounded-[30px] border border-purple-100 text-center">
                            <p className="text-[10px] font-black text-purple-400 uppercase tracking-tighter">Total Earned</p>
                            <h3 className="text-2xl font-black text-purple-700 mt-1">8,420</h3>
                        </div>
                        <div className="bg-teal-50 p-6 rounded-[30px] border border-teal-100 text-center">
                            <p className="text-[10px] font-black text-teal-400 uppercase tracking-tighter">Services</p>
                            <h3 className="text-2xl font-black text-teal-700 mt-1">42</h3>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ProfilePage;