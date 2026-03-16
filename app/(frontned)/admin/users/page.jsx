'use client';

import { useState, useEffect } from 'react';
import {
    Users, Search, Filter, ShieldCheck,
    Shield, Trash2, Edit2, ChevronLeft,
    MoreVertical, CheckCircle, XCircle, Mail,
    UserCircle2, Clock, Zap, ArrowUpDown
} from 'lucide-react';
import Link from 'next/link';
import Swal from 'sweetalert2';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all'); // all, verified, unverified

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/admin/users');
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
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ uid, isVerified: !currentStatus })
            });
            const data = await res.json();
            if (data.success) {
                setUsers(users.map(u => u.uid === uid ? data.user : u));
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

    const handleDeleteUser = (uid) => {
        Swal.fire({
            title: 'Delete User?',
            text: "This will permanently remove the user from the database. This action cannot be undone!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#94a3b8',
            confirmButtonText: 'Yes, Delete',
            background: '#ffffff',
            color: '#1e293b',
            customClass: {
                popup: 'rounded-[30px] border-none shadow-2xl',
                confirmButton: 'rounded-xl font-bold px-6 py-3',
                cancelButton: 'rounded-xl font-bold px-6 py-3'
            }
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const res = await fetch(`/api/admin/users?uid=${uid}`, { method: 'DELETE' });
                    if (res.ok) {
                        setUsers(users.filter(u => u.uid !== uid));
                        Swal.fire({
                            icon: 'success',
                            title: 'Deleted!',
                            text: 'User has been removed.',
                            timer: 1500,
                            showConfirmButton: false
                        });
                    }
                } catch (error) {
                    console.error('Error deleting user:', error);
                }
            }
        });
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = (user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase()));

        if (filterStatus === 'verified') return matchesSearch && user.isVerified;
        if (filterStatus === 'unverified') return matchesSearch && !user.isVerified;
        return matchesSearch;
    });

    const stats = {
        total: users.length,
        verified: users.filter(u => u.isVerified).length,
        unverified: users.filter(u => !u.isVerified).length,
    };

    return (
        <div className="space-y-8 container mx-auto py-8 px-4 sm:px-6 lg:px-8">
            {/* Header & Back Action */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin"
                        className="p-3 bg-white hover:bg-gray-50 rounded-2xl shadow-sm border border-gray-100 text-gray-400 hover:text-blue-600 transition-all"
                    >
                        <ChevronLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900">User Management</h1>
                        <p className="text-gray-500 font-medium mt-1">Directory of all SkillBridge platform members</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 bg-blue-600 text-white rounded-2xl font-black text-sm shadow-lg shadow-blue-100 flex items-center gap-2">
                        <Users size={18} />
                        {stats.total} Total
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Total Members', value: stats.total, icon: <Users className="text-gray-400" />, color: 'bg-white text-gray-900 border-gray-100' },
                    { label: 'Verified', value: stats.verified, icon: <ShieldCheck className="text-blue-500" />, color: 'bg-blue-50 text-blue-700 border-blue-100' },
                    { label: 'Awaiting Verify', value: stats.unverified, icon: <Clock className="text-orange-500" />, color: 'bg-orange-50 text-orange-700 border-orange-100' },
                ].map((stat, i) => (
                    <div key={i} className={`p-6 rounded-[35px] border shadow-sm ${stat.color} flex items-center justify-between group hover:translate-y-[-4px] transition-all`}>
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

            {/* Search & Filters */}
            <div className="bg-white p-6 rounded-[35px] shadow-sm border border-gray-100 flex flex-col lg:flex-row items-center gap-4">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                    <input
                        type="text"
                        placeholder="Search by name, email or UID..."
                        className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-50 outline-none transition-all font-medium text-gray-700"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-2xl border border-gray-100 w-full lg:w-auto">
                    {['all', 'verified', 'unverified'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${filterStatus === status
                                    ? 'bg-white text-blue-600 shadow-sm border border-gray-100'
                                    : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-[40px] shadow-sm border border-gray-50 overflow-hidden">
                {loading ? (
                    <div className="p-32 flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-6"></div>
                        <h3 className="text-xl font-black text-gray-900 italic">Syncing Member Directory...</h3>
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="p-32 flex flex-col items-center justify-center text-center">
                        <div className="p-6 bg-gray-50 rounded-full mb-6 text-gray-300">
                            <Search size={48} />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900">No Members Found</h3>
                        <p className="text-gray-500 font-medium max-w-xs mx-auto mt-2">Try adjusting your search or filters to see all users.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left whitespace-nowrap">
                            <thead className="bg-gray-50/80">
                                <tr className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                                    <th className="px-10 py-6">Member Profile</th>
                                    <th className="px-10 py-6">Contact Info</th>
                                    <th className="px-10 py-6 text-center">Status</th>
                                    <th className="px-10 py-6 text-center">Joined Date</th>
                                    <th className="px-10 py-6 text-center">Control Panel</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredUsers.map((user) => (
                                    <tr key={user.uid} className="group hover:bg-gray-50/50 transition-colors">
                                        <td className="px-10 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="relative">
                                                    <div className="w-14 h-14 rounded-[22px] bg-gradient-to-br from-blue-100 to-indigo-50 border-2 border-white shadow-sm overflow-hidden flex items-center justify-center">
                                                        {user.photoURL ? (
                                                            <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span className="text-2xl font-black text-blue-500 opacity-60">
                                                                {user.displayName ? user.displayName[0].toUpperCase() : 'U'}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {user.isVerified && (
                                                        <div className="absolute -top-1 -right-1 bg-blue-600 text-white p-1 rounded-lg border-2 border-white shadow-sm">
                                                            <ShieldCheck size={12} fill="currentColor" fillOpacity={0.2} />
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-black text-gray-900 text-lg group-hover:text-blue-600 transition-colors">{user.displayName || 'Unnamed User'}</p>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5 font-mono">ID: {user.uid.slice(0, 10)}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                                    <Mail size={14} className="text-gray-300" />
                                                    {user.email}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6 text-center">
                                            {user.isVerified ? (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-100 text-[10px] font-black uppercase tracking-wider">
                                                    <CheckCircle size={10} fill="currentColor" fillOpacity={0.2} /> Verified
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-50 text-gray-400 border border-gray-200 text-[10px] font-black uppercase tracking-wider">
                                                    Unverified
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-10 py-6 text-center">
                                            <p className="text-xs font-black text-gray-600 uppercase">
                                                {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                                                    month: 'short', day: 'numeric', year: 'numeric'
                                                }) : 'N/A'}
                                            </p>
                                        </td>
                                        <td className="px-10 py-6">
                                            <div className="flex items-center justify-center gap-3">
                                                <button
                                                    onClick={() => toggleVerification(user.uid, user.isVerified)}
                                                    className={`p-2.5 rounded-xl border transition-all ${user.isVerified
                                                            ? 'bg-orange-50 text-orange-600 border-orange-100 hover:bg-orange-100'
                                                            : 'bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100'
                                                        }`}
                                                    title={user.isVerified ? 'Remove Verification' : 'Verify User'}
                                                >
                                                    {user.isVerified ? <Shield size={20} /> : <ShieldCheck size={20} />}
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteUser(user.uid)}
                                                    className="p-2.5 rounded-xl bg-red-50 text-red-500 border border-red-100 hover:bg-red-500 hover:text-white transition-all"
                                                    title="Delete User"
                                                >
                                                    <Trash2 size={20} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserManagement;
