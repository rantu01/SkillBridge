'use client';

import React, { useState } from 'react';
import { Upload, ChevronDown, ArrowRight, Banknote } from 'lucide-react';

const ServiceForm = ({ initialData, onSave, onCancel }) => {
    const [formData, setFormData] = useState(initialData || {
        title: '',
        description: '',
        category: '',
        price: '',
        availability: true,
        image: '' // This will store the URL from DB
    });
    const [file, setFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(initialData?.image || null);
    const [loading, setLoading] = useState(false);
    const fileInputRef = React.useRef(null);

    React.useEffect(() => {
        if (initialData) {
            setFormData(initialData);
            setImagePreview(initialData.image || null);
        }
    }, [initialData]);

    const categories = ['Development', 'Design', 'Tutoring', 'Writing', 'Media', 'Marketing'];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSave(formData, file);
        } finally {
            setLoading(false);
        }
    };

    const handleThumbnailClick = () => {
        fileInputRef.current.click();
    };

    const handleImageChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(selectedFile);
        }
    };

    return (
        <div className="max-w-5xl mx-auto py-10">
            {/* Header Section */}
            <div className="text-center space-y-4 mb-12">
                <h1 className="text-[44px] font-black text-[#0F172A] tracking-tight">Post a New Service</h1>
                <p className="text-[#64748B] text-lg max-w-2xl mx-auto font-medium leading-relaxed">
                    Share your expertise with the student community and earn credits for your future needs.
                </p>
            </div>

            {/* Stepper - Exactly like image */}
            <div className="flex justify-center items-center gap-20 relative mb-16">
                <div className="absolute top-[8px] left-1/2 -translate-x-1/2 w-64 h-[2px] bg-[#F1F5F9] -z-10" />

                <div className="flex flex-col items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-[#0052CC] ring-8 ring-blue-50" />
                    <span className="text-[11px] font-black text-[#0052CC] uppercase tracking-widest">Details</span>
                </div>

                <div className="flex flex-col items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-[#E2E8F0]" />
                    <span className="text-[11px] font-black text-[#94A3B8] uppercase tracking-widest">Pricing</span>
                </div>

                <div className="flex flex-col items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-[#E2E8F0]" />
                    <span className="text-[11px] font-black text-[#94A3B8] uppercase tracking-widest">Review</span>
                </div>
            </div>

            {/* Main Form Card */}
            <div className="bg-white rounded-[45px] shadow-[0_32px_64px_-15px_rgba(0,0,0,0.05)] border border-[#F1F5F9] p-14 text-left">
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12">

                    {/* Left Side */}
                    <div className="space-y-10">
                        <div className="space-y-3">
                            <label className="text-[13px] font-black text-[#334155] ml-1 uppercase tracking-wide">Service Title</label>
                            <input
                                type="text"
                                placeholder="e.g., Python Basics Tutoring"
                                className="w-full px-6 py-[18px] rounded-2xl bg-[#F8FAFC]/50 border border-[#E2E8F0] focus:border-[#0052CC] focus:ring-4 focus:ring-blue-50/50 outline-none transition-all text-[15px] font-semibold placeholder:text-[#94A3B8]"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                            />
                            <p className="text-[11px] text-[#94A3B8] font-bold ml-1 tracking-tight">Try to be descriptive and concise.</p>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[13px] font-black text-[#334155] ml-1 uppercase tracking-wide">Category</label>
                            <div className="relative">
                                <select
                                    className="w-full px-6 py-[18px] rounded-2xl bg-[#F8FAFC]/50 border border-[#E2E8F0] focus:border-[#0052CC] focus:ring-4 focus:ring-blue-50/50 outline-none transition-all text-[15px] font-semibold appearance-none cursor-pointer text-[#334155]"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    required
                                >
                                    <option value="">Choose a category</option>
                                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                                <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none" size={20} />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[13px] font-black text-[#334155] ml-1 uppercase tracking-wide">Credit Price</label>
                            <div className="relative">
                                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-[#0052CC]">
                                    <Banknote size={22} />
                                </div>
                                <input
                                    type="number"
                                    className="w-full pl-16 pr-28 py-[18px] rounded-2xl bg-[#F8FAFC]/50 border border-[#E2E8F0] focus:border-[#0052CC] focus:ring-4 focus:ring-blue-50/50 outline-none transition-all text-[15px] font-bold"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    required
                                />
                                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[#94A3B8] text-[12px] font-black uppercase tracking-tighter">Credits / Hr</span>
                            </div>
                        </div>

                        {/* Available Toggle - Custom Styled */}
                        <div className="bg-[#F8FAFC] p-7 rounded-[30px] flex justify-between items-center border border-[#F1F5F9]">
                            <div>
                                <h4 className="text-[15px] font-black text-[#1E293B]">Available Now</h4>
                                <p className="text-[12px] font-bold text-[#94A3B8] tracking-tight">Accept bookings immediately</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, availability: !formData.availability })}
                                className={`w-14 h-[30px] rounded-full transition-all relative px-1 flex items-center ${formData.availability ? 'bg-[#0052CC]' : 'bg-[#E2E8F0]'}`}
                            >
                                <div className={`w-[22px] h-[22px] bg-white rounded-full shadow-sm transition-all duration-300 ${formData.availability ? 'translate-x-6' : 'translate-x-0'}`} />
                            </button>
                        </div>
                    </div>

                    {/* Right Side */}
                    <div className="space-y-10">
                        <div className="space-y-3">
                            <label className="text-[13px] font-black text-[#334155] ml-1 uppercase tracking-wide">Service Description</label>
                            <textarea
                                placeholder="Explain your service, methodology, and what students will learn..."
                                className="w-full px-6 py-5 rounded-3xl bg-[#F8FAFC]/50 border border-[#E2E8F0] focus:border-[#0052CC] focus:ring-4 focus:ring-blue-50/50 outline-none transition-all text-[15px] font-semibold min-h-[250px] shadow-sm resize-none leading-relaxed placeholder:text-[#94A3B8]"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                required
                            />
                            <div className="text-right text-[11px] text-[#94A3B8] font-bold uppercase tracking-widest">
                                {formData.description.length} / 1000 characters
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[13px] font-black text-[#334155] ml-1 uppercase tracking-wide">Service Thumbnail</label>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageChange}
                                className="hidden"
                                accept="image/*"
                            />
                            <div
                                onClick={handleThumbnailClick}
                                className="w-full border-2 border-dashed border-[#CBD5E1] rounded-[35px] p-4 flex flex-col items-center justify-center space-y-4 hover:bg-[#F8FAFC] hover:border-[#0052CC] transition-all cursor-pointer group bg-[#F8FAFC]/30 relative overflow-hidden min-h-[200px]"
                            >
                                {imagePreview ? (
                                    <div className="absolute inset-0 w-full h-full">
                                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                                            <p className="text-white font-bold uppercase text-xs tracking-widest">Change Image</p>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="w-16 h-16 bg-white rounded-2xl shadow-[0_8px_16px_-4px_rgba(0,0,0,0.05)] border border-[#F1F5F9] flex items-center justify-center text-[#94A3B8] group-hover:scale-110 transition-all">
                                            <Upload size={28} />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-[15px] font-black text-[#334155]">Drop your image here</p>
                                            <p className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-tighter mt-1">JPG or PNG, max 2MB</p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer Buttons */}
                    <div className="col-span-full flex items-center justify-between pt-12 border-t border-[#F1F5F9] mt-6">
                        <button type="button" onClick={onCancel} className="text-[13px] font-black text-[#94A3B8] hover:text-[#EF4444] uppercase tracking-[2px] transition-all">Cancel</button>
                        <div className="flex gap-10 items-center">
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-[#0052CC] text-white px-10 py-[18px] rounded-[20px] font-black text-[13px] uppercase tracking-[2px] flex items-center gap-3 hover:bg-[#0747a6] hover:shadow-2xl hover:shadow-blue-200 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>Posting... <span className="animate-spin">🌀</span></>
                                ) : (
                                    <>Post <ArrowRight size={18} strokeWidth={3} /></>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ServiceForm;