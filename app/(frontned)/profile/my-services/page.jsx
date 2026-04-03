'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, Tag, DollarSign, ShieldCheck } from 'lucide-react';
import { auth } from '@/app/(backend)/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import ServiceForm from '@/app/components/services/ServiceForm';
import Swal from 'sweetalert2';

const MyServicesPage = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [isAdding, setIsAdding] = useState(false);
    const [editingService, setEditingService] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                fetchUserServices(currentUser.uid);
            } else {
                setUser(null);
                setLoading(false);
            }
        });
        return unsubscribe;
    }, []);

    const fetchUserServices = async (uid) => {
        try {
            const res = await fetch(`/api/services/me?uid=${uid}`);
            const data = await res.json();
            if (data.success) setServices(data.services);
        } catch (error) {
            console.error('Error fetching services:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveService = async (formData, file) => {
        const url = editingService ? `/api/services/${editingService._id}` : '/api/services';
        const method = editingService ? 'PUT' : 'POST';

        const dataToSend = new FormData();
        dataToSend.append('title', formData.title);
        dataToSend.append('description', formData.description);
        dataToSend.append('category', formData.category);
        dataToSend.append('price', formData.price);
        dataToSend.append('availability', formData.availability);
        dataToSend.append('ownerID', user.uid);
        if (file) {
            dataToSend.append('file', file);
        }

        const res = await fetch(url, {
            method,
            body: dataToSend,
        });

        const data = await res.json();
        if (data.success) {
            Swal.fire({ icon: 'success', title: 'Success!', text: 'Service saved successfully.', timer: 1500, showConfirmButton: false });
            setIsAdding(false);
            setEditingService(null);
            fetchUserServices(user.uid);
        } else {
            Swal.fire({ icon: 'error', title: 'Error', text: data.error || 'Failed to save service' });
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Delete Service?',
            text: "This action cannot be undone.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#0052CC',
            cancelButtonColor: '#94A3B8',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                const res = await fetch(`/api/services/${id}?uid=${user.uid}`, {
                    method: 'DELETE',
                });
                const data = await res.json();
                if (data.success) {
                    Swal.fire({ icon: 'success', title: 'Deleted!', text: 'The service listing has been removed.', timer: 1500, showConfirmButton: false });
                    fetchUserServices(user.uid);
                }
            } catch (error) {
                console.error('Error deleting service:', error);
            }
        }
    };

    if (loading) return <div className="flex justify-center py-20 animate-pulse font-bold text-blue-600">Loading...</div>;

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-10">
            {!(isAdding || editingService) ? (
                <div className="max-w-6xl mx-auto space-y-8">
                    <div className="flex justify-between items-center bg-white p-8 rounded-[35px] border border-gray-100 shadow-sm">
                        <div>
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight">My Services</h1>
                            <p className="text-slate-500 font-medium">Manage and monitor your skill listings</p>
                        </div>
                        <button
                            onClick={() => setIsAdding(true)}
                            className="bg-[#0052CC] text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-xl shadow-blue-100"
                        >
                            <Plus size={20} /> Post New Service
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {services.map((service) => (
                            <div key={service._id} className="bg-white p-6 rounded-[40px] border border-gray-50 shadow-sm hover:shadow-xl transition-all group">
                                <div className="flex justify-between items-start mb-4">
                                    <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase rounded-lg border border-blue-100">
                                        {service.category}
                                    </span>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                        <button onClick={() => setEditingService(service)} className="p-2 bg-gray-50 hover:bg-blue-50 text-gray-400 hover:text-blue-600 rounded-xl transition-all"><Edit3 size={18} /></button>
                                        <button onClick={() => handleDelete(service._id)} className="p-2 bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-xl transition-all"><Trash2 size={18} /></button>
                                    </div>
                                </div>
                                <h3 className="text-xl font-black text-slate-800 mb-2 line-clamp-1">{service.title}</h3>
                                <p className="text-slate-500 text-sm line-clamp-2 mb-6 font-medium">{service.description}</p>
                                <div className="pt-6 border-t border-gray-50 flex justify-between items-center">
                                    <div className="flex items-center gap-1.5 text-blue-600 font-black text-xl">
                                        {service.price} <span className="text-[10px] uppercase text-gray-400 tracking-tighter">Credits</span>
                                    </div>
                                    <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase ${service.availability ? 'text-green-500' : 'text-gray-400'}`}>
                                        <div className={`w-2 h-2 rounded-full ${service.availability ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
                                        {service.availability ? 'Active' : 'Paused'}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="max-w-4xl mx-auto py-10">
                    <nav className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-8 ml-4">
                        DASHBOARD <span className="text-gray-300 font-normal">/</span> <span className="text-blue-600">CREATE SERVICE</span>
                    </nav>
                    <ServiceForm
                        initialData={editingService}
                        onSave={handleSaveService}
                        onCancel={() => { setIsAdding(false); setEditingService(null); }}
                    />
                </div>
            )}
        </div>
    );
};

export default MyServicesPage;