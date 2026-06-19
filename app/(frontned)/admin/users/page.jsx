'use client';

import { useState, useEffect } from 'react';
import {
    Users, Search, ShieldCheck,
    Shield, Trash2, ChevronLeft,
    CheckCircle, XCircle, Mail,
    Clock, Wallet, PlusCircle, MinusCircle, X,
    Ban, Lock, Unlock, AlertTriangle
} from 'lucide-react';
import Link from 'next/link';
import Swal from 'sweetalert2';
import { auth } from '@/app/(backend)/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [currentAdmin, setCurrentAdmin] = useState(null);
    const [creditModalUser, setCreditModalUser] = useState(null);
    const [creditAction, setCreditAction] = useState('add');
    const [creditAmount, setCreditAmount] = useState('');
    const [creditNote, setCreditNote] = useState('');
    const [creditSubmitting, setCreditSubmitting] = useState(false);
    const [statusModalUser, setStatusModalUser] = useState(null);
    const [statusAction, setStatusAction] = useState('');
    const [statusReason, setStatusReason] = useState('');
    const [suspendDuration, setSuspendDuration] = useState('24');
    const [statusSubmitting, setStatusSubmitting] = useState(false);
    const [authReady, setAuthReady] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentAdmin(user);
            if (user) {
                setAuthReady(true);
            }
        });
        return unsubscribe;
    }, []);

    useEffect(() => {
        if (authReady && currentAdmin) {
            fetchUsers();
        }
    }, [authReady, currentAdmin]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/admin/users', {
                headers: { 'x-admin-email': currentAdmin?.email || '' }
            });
            const data = await res.json();
            if (data.success) {
                setUsers(data.users || []);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleVerification = async (uid, currentStatus) => {
        try {
            const res = await fetch('/api/admin/users', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'x-admin-email': currentAdmin?.email || '' },
                body: JSON.stringify({ uid, isVerified: !currentStatus })
            });
            const data = await res.json();
            if (data.success) {
                setUsers((prevUsers) => prevUsers.map(u => u.uid === uid ? data.user : u));
                Swal.fire({
                    icon: 'success',
                    title: 'Status Updated',
                    text: `User is now ${!currentStatus ? 'Verified' : 'Unverified'}`,
                    timer: 1500,
                    showConfirmButton: false,
                    background: '#ffffff',
                    color: '#1e293b',
                    customClass: { popup: 'rounded-[30px] shadow-2xl' }
                });
            }
        } catch (error) {
            console.error('Error toggling verification:', error);
        }
    };

    const openCreditModal = (user) => {
        setCreditModalUser(user);
        setCreditAction('add');
        setCreditAmount('');
        setCreditNote('');
    };

    const closeCreditModal = () => {
        setCreditModalUser(null);
        setCreditAction('add');
        setCreditAmount('');
        setCreditNote('');
    };

    const submitCreditAdjustment = async () => {
        if (!creditModalUser) return;
        const parsedAmount = Number(creditAmount);
        if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
            Swal.fire({ icon: 'error', title: 'Invalid amount', text: 'Enter a positive credit amount.' });
            return;
        }
        const creditsDelta = creditAction === 'add' ? parsedAmount : -parsedAmount;
        setCreditSubmitting(true);
        try {
            const res = await fetch('/api/admin/users', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'x-admin-email': currentAdmin?.email || '' },
                body: JSON.stringify({
                    uid: creditModalUser.uid,
                    creditsDelta,
                    creditsNote: creditNote,
                    actorID: currentAdmin?.uid || null,
                })
            });
            const data = await res.json();
            if (data.success && data.user) {
                await fetchUsers();
                closeCreditModal();
                Swal.fire({
                    icon: 'success',
                    title: 'Credits Updated',
                    text: `${creditAction === 'add' ? 'Added' : 'Removed'} ${parsedAmount} credits for ${creditModalUser.displayName || creditModalUser.email}`,
                    timer: 1800,
                    showConfirmButton: false,
                    background: '#ffffff',
                    color: '#1e293b',
                    customClass: { popup: 'rounded-[30px] shadow-2xl' }
                });
            } else {
                Swal.fire({
                    icon: 'error', title: 'Update Failed',
                    text: data.error || 'Unable to update credits',
                    background: '#ffffff', color: '#1e293b',
                    customClass: { popup: 'rounded-[30px] shadow-2xl' }
                });
            }
        } catch (error) {
            console.error('Error updating credits:', error);
            Swal.fire({ icon: 'error', title: 'Error', text: 'Server error while updating credits' });
        } finally {
            setCreditSubmitting(false);
        }
    };

    const handleDeleteUser = (uid) => {
        Swal.fire({
            title: 'Delete User?',
            text: "This will permanently remove the user from the database. This action cannot be undone!",
            icon: 'warning', showCancelButton: true,
            confirmButtonColor: '#ef4444', cancelButtonColor: '#94a3b8',
            confirmButtonText: 'Yes, Delete',
            background: '#ffffff', color: '#1e293b',
            customClass: {
                popup: 'rounded-[30px] border-none shadow-2xl',
                confirmButton: 'rounded-xl font-bold px-6 py-3',
                cancelButton: 'rounded-xl font-bold px-6 py-3'
            }
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const res = await fetch(`/api/admin/users?uid=${uid}`, {
                        method: 'DELETE',
                        headers: { 'x-admin-email': currentAdmin?.email || '' }
                    });
                    if (res.ok) {
                        setUsers(users.filter(u => u.uid !== uid));
                        Swal.fire({ icon: 'success', title: 'Deleted!', text: 'User has been removed.', timer: 1500, showConfirmButton: false });
                    }
                } catch (error) {
                    console.error('Error deleting user:', error);
                }
            }
        });
    };

    const openStatusModal = (user, action) => {
        setStatusModalUser(user);
        setStatusAction(action);
        setStatusReason('');
        setSuspendDuration('24');
    };

    const closeStatusModal = () => {
        setStatusModalUser(null);
        setStatusAction('');
        setStatusReason('');
        setSuspendDuration('24');
    };

    const submitStatusUpdate = async () => {
        if (!statusModalUser) return;
        setStatusSubmitting(true);
        try {
            let suspendedUntil = null;
            if (statusAction === 'suspended') {
                const hours = Number(suspendDuration);
                if (Number.isNaN(hours) || hours <= 0) {
                    Swal.fire({ icon: 'error', title: 'Invalid duration', text: 'Enter a valid suspension duration in hours.' });
                    setStatusSubmitting(false);
                    return;
                }
                suspendedUntil = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
            }

            const res = await fetch('/api/admin/users/status', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'x-admin-email': currentAdmin?.email || '' },
                body: JSON.stringify({
                    uid: statusModalUser.uid,
                    status: statusAction,
                    reason: statusReason,
                    suspendedUntil,
                    actorID: currentAdmin?.uid || null,
                })
            });
            const data = await res.json();
            if (data.success) {
                await fetchUsers();
                closeStatusModal();
                const actionLabel = statusAction === 'blocked' ? 'Blocked' : statusAction === 'suspended' ? 'Suspended' : 'Activated';
                Swal.fire({
                    icon: 'success', title: `${actionLabel}`,
                    text: `${statusModalUser.displayName || statusModalUser.email} has been ${actionLabel.toLowerCase()}.`,
                    timer: 1800, showConfirmButton: false,
                    background: '#ffffff', color: '#1e293b',
                    customClass: { popup: 'rounded-[30px] shadow-2xl' }
                });
            } else {
                Swal.fire({ icon: 'error', title: 'Update Failed', text: data.error || 'Unable to update user status' });
            }
        } catch (error) {
            console.error('Error updating status:', error);
            Swal.fire({ icon: 'error', title: 'Error', text: 'Server error while updating status' });
        } finally {
            setStatusSubmitting(false);
        }
    };

    const handleQuickBlock = (user) => {
        Swal.fire({
            title: 'Block User?',
            text: `This will immediately block ${user.displayName || user.email} from accessing the platform.`,
            icon: 'warning', showCancelButton: true,
            confirmButtonColor: '#ef4444', cancelButtonColor: '#94a3b8',
            confirmButtonText: 'Yes, Block',
            background: '#ffffff', color: '#1e293b',
            customClass: {
                popup: 'rounded-[30px] border-none shadow-2xl',
                confirmButton: 'rounded-xl font-bold px-6 py-3',
                cancelButton: 'rounded-xl font-bold px-6 py-3'
            }
        }).then(async (result) => {
            if (result.isConfirmed) {
                setStatusSubmitting(true);
                try {
                    const res = await fetch('/api/admin/users/status', {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json', 'x-admin-email': currentAdmin?.email || '' },
                        body: JSON.stringify({ uid: user.uid, status: 'blocked', reason: '', actorID: currentAdmin?.uid || null })
                    });
                    const data = await res.json();
                    if (data.success) {
                        await fetchUsers();
                        Swal.fire({ icon: 'success', title: 'Blocked', text: 'User has been blocked.', timer: 1500, showConfirmButton: false });
                    }
                } catch (error) {
                    console.error('Error blocking user:', error);
                } finally {
                    setStatusSubmitting(false);
                }
            }
        });
    };

    const handleQuickUnblock = (user) => {
        Swal.fire({
            title: 'Unblock User?',
            text: `Restore platform access for ${user.displayName || user.email}?`,
            icon: 'question', showCancelButton: true,
            confirmButtonColor: '#10b981', cancelButtonColor: '#94a3b8',
            confirmButtonText: 'Yes, Unblock',
            background: '#ffffff', color: '#1e293b',
            customClass: {
                popup: 'rounded-[30px] border-none shadow-2xl',
                confirmButton: 'rounded-xl font-bold px-6 py-3',
                cancelButton: 'rounded-xl font-bold px-6 py-3'
            }
        }).then(async (result) => {
            if (result.isConfirmed) {
                setStatusSubmitting(true);
                try {
                    const res = await fetch('/api/admin/users/status', {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json', 'x-admin-email': currentAdmin?.email || '' },
                        body: JSON.stringify({ uid: user.uid, status: 'active', reason: '', actorID: currentAdmin?.uid || null })
                    });
                    const data = await res.json();
                    if (data.success) {
                        await fetchUsers();
                        Swal.fire({ icon: 'success', title: 'Activated', text: 'User access has been restored.', timer: 1500, showConfirmButton: false });
                    }
                } catch (error) {
                    console.error('Error unblocking user:', error);
                } finally {
                    setStatusSubmitting(false);
                }
            }
        });
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase());

        if (filterStatus === 'verified') return matchesSearch && user.isVerified;
        if (filterStatus === 'unverified') return matchesSearch && !user.isVerified;
        if (filterStatus === 'blocked') return matchesSearch && user.status === 'blocked';
        if (filterStatus === 'suspended') return matchesSearch && user.status === 'suspended';
        if (filterStatus === 'active') return matchesSearch && (!user.status || user.status === 'active');
        return matchesSearch;
    });

    const stats = {
        total: users.length,
        verified: users.filter(u => u.isVerified).length,
        unverified: users.filter(u => !u.isVerified).length,
        blocked: users.filter(u => u.status === 'blocked').length,
        suspended: users.filter(u => u.status === 'suspended').length,
    };

    const statusBadge = (user) => {
        const accountStatus = user.status || 'active';
        if (accountStatus === 'blocked') {
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-600 border border-red-100 text-[10px] font-black uppercase tracking-wider">
                    <Ban size={10} /> Blocked
                </span>
            );
        }
        if (accountStatus === 'suspended') {
            const untilStr = user.suspendedUntil ? new Date(user.suspendedUntil).toLocaleDateString() : '';
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-600 border border-amber-100 text-[10px] font-black uppercase tracking-wider" title={untilStr ? `Until ${untilStr}` : ''}>
                    <Clock size={10} /> Suspended
                </span>
            );
        }
        if (user.isVerified) {
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-100 text-[10px] font-black uppercase tracking-wider">
                    <CheckCircle size={10} fill="currentColor" fillOpacity={0.2} /> Verified
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-50 text-gray-400 border border-gray-200 text-[10px] font-black uppercase tracking-wider">
                Active
            </span>
        );
    };

    return (
        <div className="space-y-8 container mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <Link href="/admin" className="p-3 bg-white hover:bg-gray-50 rounded-2xl shadow-sm border border-gray-100 text-gray-400 hover:text-blue-600 transition-all">
                        <ChevronLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900">User Management</h1>
                        <p className="text-gray-500 font-medium mt-1">Directory of all SkillBridge platform members</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 bg-blue-600 text-white rounded-2xl font-black text-sm shadow-lg shadow-blue-100 flex items-center gap-2">
                        <Users size={18} /> {stats.total} Total
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {[
                    { label: 'Total Members', value: stats.total, icon: <Users className="text-gray-400" />, color: 'bg-white text-gray-900 border-gray-100' },
                    { label: 'Verified', value: stats.verified, icon: <ShieldCheck className="text-blue-500" />, color: 'bg-blue-50 text-blue-700 border-blue-100' },
                    { label: 'Awaiting Verify', value: stats.unverified, icon: <Clock className="text-orange-500" />, color: 'bg-orange-50 text-orange-700 border-orange-100' },
                    { label: 'Blocked', value: stats.blocked, icon: <Ban className="text-red-500" />, color: 'bg-red-50 text-red-700 border-red-100' },
                    { label: 'Suspended', value: stats.suspended, icon: <AlertTriangle className="text-amber-500" />, color: 'bg-amber-50 text-amber-700 border-amber-100' },
                ].map((stat, i) => (
                    <div key={i} className={`p-5 rounded-[35px] border shadow-sm ${stat.color} flex items-center justify-between group hover:translate-y-[-4px] transition-all`}>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">{stat.label}</p>
                            <h3 className="text-4xl font-black italic tracking-tighter">{stat.value}</h3>
                        </div>
                        <div className="p-4 bg-white/50 rounded-2xl shadow-inner border border-white/50 group-hover:scale-110 transition-transform">
                            {stat.icon}
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white p-6 rounded-[35px] shadow-sm border border-gray-100 flex flex-col lg:flex-row items-center gap-4">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                    <input type="text" placeholder="Search by name, email or UID..."
                        className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-50 outline-none transition-all font-medium text-gray-700"
                        value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-2xl border border-gray-100 w-full overflow-x-auto">
                    {['all', 'verified', 'unverified', 'active', 'blocked', 'suspended'].map((status) => (
                        <button key={status} onClick={() => setFilterStatus(status)}
                            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all ${filterStatus === status
                                ? 'bg-white text-blue-600 shadow-sm border border-gray-100'
                                : 'text-gray-400 hover:text-gray-600'
                            }`}>
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-[40px] shadow-sm border border-gray-50 overflow-hidden">
                {loading ? (
                    <div className="p-32 flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-6"></div>
                        <h3 className="text-xl font-black text-gray-900 italic">Syncing Member Directory...</h3>
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="p-20 flex flex-col items-center justify-center text-center">
                        <div className="p-6 bg-gray-50 rounded-full mb-6 text-gray-300"><Search size={48} /></div>
                        <h3 className="text-2xl font-black text-gray-900">No Members Found</h3>
                        <p className="text-gray-500 font-medium max-w-xs mx-auto mt-2">Try adjusting your search or filters to see all users.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left whitespace-nowrap">
                            <thead className="bg-gray-50/80">
                                <tr className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                                    <th className="px-6 lg:px-10 py-6">Member Profile</th>
                                    <th className="px-6 lg:px-10 py-6">Contact Info</th>
                                    <th className="px-6 lg:px-10 py-6 text-center">Credits</th>
                                    <th className="px-6 lg:px-10 py-6 text-center">Status</th>
                                    <th className="px-6 lg:px-10 py-6 text-center">Joined Date</th>
                                    <th className="px-6 lg:px-10 py-6 text-center">Control Panel</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredUsers.map((user) => {
                                    const accountStatus = user.status || 'active';
                                    return (
                                        <tr key={user.uid} className={`group hover:bg-gray-50/50 transition-colors ${accountStatus !== 'active' ? 'opacity-80' : ''}`}>
                                            <td className="px-6 lg:px-10 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="relative">
                                                        <div className={`w-14 h-14 rounded-[22px] border-2 border-white shadow-sm overflow-hidden flex items-center justify-center ${accountStatus === 'blocked' ? 'bg-red-50' : accountStatus === 'suspended' ? 'bg-amber-50' : 'bg-gradient-to-br from-blue-100 to-indigo-50'}`}>
                                                            {user.photoURL ? (
                                                                <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <span className={`text-2xl font-black opacity-60 ${accountStatus === 'blocked' ? 'text-red-500' : accountStatus === 'suspended' ? 'text-amber-500' : 'text-blue-500'}`}>
                                                                    {user.displayName ? user.displayName[0].toUpperCase() : 'U'}
                                                                </span>
                                                            )}
                                                        </div>
                                                        {user.isVerified && accountStatus === 'active' && (
                                                            <div className="absolute -top-1 -right-1 bg-blue-600 text-white p-1 rounded-lg border-2 border-white shadow-sm">
                                                                <ShieldCheck size={12} fill="currentColor" fillOpacity={0.2} />
                                                            </div>
                                                        )}
                                                        {accountStatus === 'blocked' && (
                                                            <div className="absolute -top-1 -right-1 bg-red-600 text-white p-1 rounded-lg border-2 border-white shadow-sm">
                                                                <Ban size={12} />
                                                            </div>
                                                        )}
                                                        {accountStatus === 'suspended' && (
                                                            <div className="absolute -top-1 -right-1 bg-amber-600 text-white p-1 rounded-lg border-2 border-white shadow-sm">
                                                                <Clock size={12} />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-gray-900 text-lg group-hover:text-blue-600 transition-colors">{user.displayName || 'Unnamed User'}</p>
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5 font-mono">ID: {user.uid.slice(0, 10)}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 lg:px-10 py-6">
                                                <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                                    <Mail size={14} className="text-gray-300" /> {user.email}
                                                </div>
                                            </td>
                                            <td className="px-6 lg:px-10 py-6 text-center">
                                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100 font-black text-xs uppercase tracking-widest">
                                                    <Wallet size={14} /> {Number(user.credits || 0)} Cr
                                                </div>
                                                <button type="button" onClick={() => openCreditModal(user)} className="mt-2 block mx-auto text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 hover:text-emerald-700">
                                                    Edit Credits
                                                </button>
                                            </td>
                                            <td className="px-6 lg:px-10 py-6 text-center">
                                                <div className="flex flex-col items-center gap-1">
                                                    {statusBadge(user)}
                                                    {user.statusReason && (
                                                        <span className="text-[9px] text-gray-400 italic max-w-[120px] truncate" title={user.statusReason}>
                                                            {user.statusReason}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 lg:px-10 py-6 text-center">
                                                <p className="text-xs font-black text-gray-600 uppercase">
                                                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                                                </p>
                                            </td>
                                            <td className="px-6 lg:px-10 py-6">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button type="button" onClick={() => openCreditModal(user)} className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100 transition-all" title="Adjust Credits">
                                                        <PlusCircle size={18} />
                                                    </button>
                                                    <button type="button" onClick={() => toggleVerification(user.uid, user.isVerified)}
                                                        className={`p-2.5 rounded-xl border transition-all ${user.isVerified ? 'bg-orange-50 text-orange-600 border-orange-100 hover:bg-orange-100' : 'bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100'}`}
                                                        title={user.isVerified ? 'Remove Verification' : 'Verify User'}>
                                                        {user.isVerified ? <Shield size={18} /> : <ShieldCheck size={18} />}
                                                    </button>
                                                    {accountStatus === 'blocked' || accountStatus === 'suspended' ? (
                                                        <button type="button" onClick={() => handleQuickUnblock(user)} disabled={statusSubmitting}
                                                            className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100 transition-all disabled:opacity-50" title="Activate User">
                                                            <Unlock size={18} />
                                                        </button>
                                                    ) : (
                                                        <>
                                                            <button type="button" onClick={() => handleQuickBlock(user)} disabled={statusSubmitting}
                                                                className="p-2.5 rounded-xl bg-red-50 text-red-500 border border-red-100 hover:bg-red-500 hover:text-white transition-all disabled:opacity-50" title="Block User">
                                                                <Ban size={18} />
                                                            </button>
                                                            <button type="button" onClick={() => openStatusModal(user, 'suspended')} disabled={statusSubmitting}
                                                                className="p-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 hover:bg-amber-100 transition-all disabled:opacity-50" title="Suspend User">
                                                                <Clock size={18} />
                                                            </button>
                                                        </>
                                                    )}
                                                    <button type="button" onClick={() => handleDeleteUser(user.uid)}
                                                        className="p-2.5 rounded-xl bg-red-50 text-red-500 border border-red-100 hover:bg-red-500 hover:text-white transition-all" title="Delete User">
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {creditModalUser && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center px-4">
                    <div className="w-full max-w-lg bg-white rounded-[32px] shadow-2xl border border-gray-100 overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Credit Control</p>
                                <h3 className="text-2xl font-black text-gray-900 mt-1">Adjust balance</h3>
                            </div>
                            <button type="button" onClick={closeCreditModal} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500"><X size={20} /></button>
                        </div>
                        <div className="p-6 space-y-5">
                            <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4">
                                <p className="text-xs font-black uppercase tracking-widest text-gray-400">Selected Member</p>
                                <p className="text-lg font-black text-gray-900 mt-1">{creditModalUser.displayName || 'Unnamed User'}</p>
                                <p className="text-sm text-gray-500">{creditModalUser.email}</p>
                                <p className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100 text-xs font-black uppercase tracking-widest">
                                    <Wallet size={14} /> Current: {Number(creditModalUser.credits || 0)} credits
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <button type="button" onClick={() => setCreditAction('add')}
                                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-2xl font-black text-sm border transition-all ${creditAction === 'add' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}>
                                    <PlusCircle size={18} /> Give Credits
                                </button>
                                <button type="button" onClick={() => setCreditAction('remove')}
                                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-2xl font-black text-sm border transition-all ${creditAction === 'remove' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}>
                                    <MinusCircle size={18} /> Deduct Credits
                                </button>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Amount</label>
                                <input type="number" min="1" value={creditAmount} onChange={(e) => setCreditAmount(e.target.value)}
                                    placeholder="Enter credit amount" className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none font-bold" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Note</label>
                                <textarea value={creditNote} onChange={(e) => setCreditNote(e.target.value)} placeholder="Optional reason for this adjustment"
                                    rows={3} className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none font-medium resize-none" />
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={closeCreditModal} className="px-5 py-3 rounded-2xl border border-gray-200 text-gray-700 font-black hover:bg-gray-50 transition-all">Cancel</button>
                                <button type="button" onClick={submitCreditAdjustment} disabled={creditSubmitting}
                                    className={`px-5 py-3 rounded-2xl text-white font-black transition-all disabled:opacity-60 ${creditAction === 'add' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'}`}>
                                    {creditSubmitting ? 'Saving...' : creditAction === 'add' ? 'Give Credits' : 'Deduct Credits'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {statusModalUser && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center px-4">
                    <div className="w-full max-w-lg bg-white rounded-[32px] shadow-2xl border border-gray-100 overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Account Control</p>
                                <h3 className="text-2xl font-black text-gray-900 mt-1 capitalize">{statusAction === 'suspended' ? 'Suspend User' : statusAction === 'blocked' ? 'Block User' : 'Change Status'}</h3>
                            </div>
                            <button type="button" onClick={closeStatusModal} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500"><X size={20} /></button>
                        </div>
                        <div className="p-6 space-y-5">
                            <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4">
                                <p className="text-xs font-black uppercase tracking-widest text-gray-400">Selected Member</p>
                                <p className="text-lg font-black text-gray-900 mt-1">{statusModalUser.displayName || 'Unnamed User'}</p>
                                <p className="text-sm text-gray-500">{statusModalUser.email}</p>
                                <p className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-[10px] font-black uppercase tracking-wider">
                                    Current: {statusModalUser.status || 'active'}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                {['suspended', 'blocked'].map((action) => (
                                    <button key={action} type="button" onClick={() => setStatusAction(action)}
                                        className={`flex items-center justify-center gap-2 px-4 py-3 rounded-2xl font-black text-sm border transition-all capitalize ${statusAction === action
                                            ? action === 'blocked' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                                            : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}>
                                        {action === 'blocked' ? <Ban size={18} /> : <Clock size={18} />} {action === 'suspended' ? 'Suspend' : 'Block'}
                                    </button>
                                ))}
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Reason</label>
                                <textarea value={statusReason} onChange={(e) => setStatusReason(e.target.value)}
                                    placeholder="Reason for this action (optional)" rows={2}
                                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none font-medium resize-none" />
                            </div>

                            {statusAction === 'suspended' && (
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Suspension Duration</label>
                                    <select value={suspendDuration} onChange={(e) => setSuspendDuration(e.target.value)}
                                        className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none font-bold bg-white appearance-none cursor-pointer">
                                        <option value="1">1 hour</option>
                                        <option value="6">6 hours</option>
                                        <option value="12">12 hours</option>
                                        <option value="24">24 hours</option>
                                        <option value="48">2 days</option>
                                        <option value="72">3 days</option>
                                        <option value="168">7 days</option>
                                        <option value="720">30 days</option>
                                    </select>
                                </div>
                            )}

                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={closeStatusModal} className="px-5 py-3 rounded-2xl border border-gray-200 text-gray-700 font-black hover:bg-gray-50 transition-all">Cancel</button>
                                <button type="button" onClick={submitStatusUpdate} disabled={statusSubmitting}
                                    className={`px-5 py-3 rounded-2xl text-white font-black transition-all disabled:opacity-60 ${statusAction === 'blocked' ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-600 hover:bg-amber-700'}`}>
                                    {statusSubmitting ? 'Saving...' : `Confirm ${statusAction === 'suspended' ? 'Suspension' : 'Block'}`}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
