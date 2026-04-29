 'use client';

import React, { useEffect, useState } from 'react';
import BookingForm from '@/app/components/booking/BookingForm';
import {
  Search, Star, ShieldCheck, ChevronLeft,
  ChevronRight, BookOpen, PenTool, FileText,
  Terminal, MoreHorizontal, LayoutGrid, Heart,
  Plus, CheckCircle2
} from 'lucide-react';

const categories = [
  { id: 'Tutoring', icon: BookOpen, color: 'text-blue-500' },
  { id: 'Development', icon: Terminal, color: 'text-indigo-500' },
  { id: 'Design', icon: PenTool, color: 'text-pink-500' },
  { id: 'Notes', icon: FileText, color: 'text-orange-500' },
  { id: 'Tech', icon: Terminal, color: 'text-indigo-500' },
  { id: 'Other', icon: MoreHorizontal, color: 'text-purple-500' },
];

const MarketplacePage = () => {
  const [selectedCategory, setSelectedCategory] = useState('Tutoring');
  const [searchQuery, setSearchQuery] = useState('');
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
    const [selectedService, setSelectedService] = useState(null);

  useEffect(() => {
    fetchServices();
  }, [selectedCategory]);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/services?category=${selectedCategory}`);
      const data = await res.json();
      if (data.success) {
        setServices(data.services);
      }
    } catch (error) {
      console.error("Error fetching services:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredServices = services.filter(service =>
    service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-[#FDFDFD] font-sans text-slate-900">
      {/* Sidebar - Not Sticky, Simple Layout */}
      <aside className="w-72 p-10 flex flex-col">
        <div className="mb-8 uppercase text-[10px] font-black tracking-[0.2em] text-slate-400 px-2">Categories</div>

        <nav className="space-y-1 mb-12">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-200 group ${selectedCategory === cat.id
                ? 'bg-[#F5F3FF] text-[#4F46E5]'
                : 'text-slate-500 hover:bg-slate-50'
                }`}
            >
              <cat.icon size={18} className={selectedCategory === cat.id ? 'text-[#4F46E5]' : 'text-slate-400'} />
              <span className="text-sm font-bold">{cat.id}</span>
            </button>
          ))}
        </nav>

      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10 max-w-[1400px]">
        {/* Header Section */}
        <div className="flex justify-between items-start mb-10">
          <div>
            <h1 className="text-[40px] font-black tracking-tight text-slate-900 leading-tight">Service Marketplace</h1>
            <p className="text-slate-400 font-bold text-sm mt-1 uppercase tracking-tight">Find skills to learn or exchange your own for campus credits.</p>
          </div>
          <button className="flex items-center gap-3 bg-white border border-slate-100 px-6 py-3 rounded-2xl text-[12px] font-black shadow-sm hover:bg-slate-50 transition-all uppercase tracking-wider">
            <LayoutGrid size={16} className="text-slate-400" />
            Recommended
          </button>
        </div>

        {/* Pill Filters */}
        <div className="flex flex-wrap gap-4 mb-12">
          <button className="px-7 py-3 bg-[#EEF2FF] text-[#4F46E5] rounded-full text-[11px] font-black flex items-center gap-2 border border-[#4F46E5]/10 uppercase tracking-widest">
            Verified Only <CheckCircle2 size={14} strokeWidth={3} />
          </button>
          {['Under 50 Credits', 'Top Rated', 'Recent'].map((filter) => (
            <button key={filter} className="px-7 py-3 bg-white border border-slate-200 rounded-full text-[11px] font-black text-slate-400 hover:border-slate-300 transition-all uppercase tracking-widest">
              {filter}
            </button>
          ))}
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
            {loading ? (
            <div className="col-span-full py-20 flex flex-col items-center justify-center space-y-4">
              <div className="w-10 h-10 border-4 border-[#4F46E5] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            filteredServices.map((service) => (
              <div key={service._id} className="group bg-white rounded-[40px] overflow-hidden border border-slate-100 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)] hover:shadow-2xl hover:shadow-indigo-100 transition-all duration-500">
                {/* Thumbnail */}
                <div className="relative h-60 w-full">
                  <img
                    src={service.image || `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop`}
                    className="w-full h-full object-cover"
                    alt=""
                  />
                  <div className="absolute top-6 left-6 bg-white/95 px-4 py-2 rounded-xl text-[10px] font-black tracking-[0.15em] text-slate-800 uppercase shadow-sm">
                    {service.category}
                  </div>
                  <button className="absolute top-6 right-6 w-11 h-11 bg-white/95 rounded-full flex items-center justify-center text-slate-300 hover:text-pink-500 transition-all shadow-sm">
                    <Heart size={20} />
                  </button>
                </div>

                {/* Content */}
                <div className="p-8">
                  <h3 className="font-black text-xl mb-3 text-slate-800 leading-snug group-hover:text-[#4F46E5] transition-colors line-clamp-1">
                    {service.title}
                  </h3>
                  <p className="text-slate-400 text-sm font-bold leading-relaxed mb-8 line-clamp-2">
                    {service.description}
                  </p>

                  <div className="flex items-center justify-between pt-7 border-t border-slate-50">
                    <div className="flex items-center gap-3">
                      <img
                        src={service.owner?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${service.ownerID}`}
                        className="w-10 h-10 rounded-full object-cover bg-slate-100"
                        alt=""
                      />
                      <div>
                        <div className="text-xs font-black text-slate-800 flex items-center gap-1.5 uppercase tracking-tight">
                          {service.owner?.displayName || 'Student'} <CheckCircle2 size={12} className="text-[#4F46E5]" strokeWidth={3} />
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-slate-300 font-black">
                          <Star size={11} className="fill-amber-400 text-amber-400" />
                          4.9 (42)
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center justify-end gap-1.5 text-[#4F46E5] font-black text-2xl">
                        {service.price}
                        <div className="w-5 h-5 rounded-full border-2 border-[#4F46E5] flex items-center justify-center text-[10px] font-black">C</div>
                      </div>
                      <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-0.5">Per Session</div>
                    </div>
                    </div>
                  
                  <div className="mt-6 flex justify-end">
                    <button onClick={() => setSelectedService(service)} className="px-4 py-2 bg-[#0052CC] text-white rounded-2xl font-bold hover:bg-blue-700 transition-all">Book</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Booking Modal */}
        {selectedService && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl p-6 w-full max-w-2xl mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Request Booking for {selectedService.title}</h3>
                <button onClick={() => setSelectedService(null)} className="text-gray-500">Close</button>
              </div>
              <BookingForm service={selectedService} />
            </div>
          </div>
        )}

        {/* Pagination */}
        <div className="flex justify-center items-center gap-3 mt-24">
          <button className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-300 hover:text-[#4F46E5] transition-all">
            <ChevronLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            <button className="w-10 h-10 bg-[#4F46E5] text-white rounded-[14px] font-black text-sm shadow-lg shadow-indigo-100">1</button>
            {[2, 3].map(n => (
              <button key={n} className="w-10 h-10 hover:bg-slate-50 rounded-[14px] font-black text-sm text-slate-300 transition-colors">{n}</button>
            ))}
            <span className="px-1 text-slate-200 font-black">...</span>
            <button className="w-10 h-10 hover:bg-slate-50 rounded-[14px] font-black text-sm text-slate-300 transition-colors">12</button>
          </div>
          <button className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-300 hover:text-[#4F46E5] transition-all">
            <ChevronRight size={20} />
          </button>
        </div>
      </main>
    </div>
  );
};

export default MarketplacePage;