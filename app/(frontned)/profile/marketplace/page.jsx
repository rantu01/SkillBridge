'use client';

import React, { useEffect, useState } from 'react';
import BookingForm from '@/app/components/booking/BookingForm';
import {
  Search, ChevronLeft, ChevronRight, BookOpen, PenTool, FileText,
  Terminal, MoreHorizontal, LayoutGrid, Heart, CheckCircle2
} from 'lucide-react';
import StarRating from '@/app/components/common/StarRating';

const categories = [
  { id: 'Tutoring', icon: BookOpen, color: 'text-blue-500' },
  { id: 'Development', icon: Terminal, color: 'text-indigo-500' },
  { id: 'Media', icon: Terminal, color: 'text-indigo-500' },
  { id: 'Design', icon: PenTool, color: 'text-pink-500' },
  { id: 'Notes', icon: FileText, color: 'text-orange-500' },
  { id: 'Tech', icon: Terminal, color: 'text-indigo-500' },
  { id: 'Writing', icon: MoreHorizontal, color: 'text-purple-500' },
  { id: 'Marketing', icon: MoreHorizontal, color: 'text-purple-500' },
  { id: 'Other', icon: MoreHorizontal, color: 'text-purple-500' },
];

const MarketplacePage = () => {
  const [selectedCategory, setSelectedCategory] = useState('Tutoring');
  const [searchQuery, setSearchQuery] = useState('');
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState(null);

  useEffect(() => {
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

    fetchServices();
  }, [selectedCategory]);

  const filteredServices = services.filter(service =>
    service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex min-h-screen flex-col bg-[#FDFDFD] font-sans text-slate-900 lg:flex-row">
      {/* Sidebar */}
      <aside className="w-full border-b border-slate-100 p-4 sm:p-6 lg:w-72 lg:shrink-0 lg:border-b-0 lg:border-r lg:p-10">
        <div className="mb-4 flex items-center justify-between lg:mb-8">
          <div className="px-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Categories</div>
          <span className="rounded-full bg-slate-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-400 lg:hidden">
            Filter
          </span>
        </div>

        <nav className="flex gap-2 overflow-x-auto pb-2 lg:mb-12 lg:flex-col lg:gap-1 lg:overflow-visible lg:pb-0">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex shrink-0 items-center gap-3 rounded-2xl px-4 py-3 transition-all duration-200 group lg:w-full lg:gap-4 ${selectedCategory === cat.id
                ? 'bg-[#F5F3FF] text-[#4F46E5]'
                : 'text-slate-500 hover:bg-slate-50'
                }`}
            >
              <cat.icon size={18} className={selectedCategory === cat.id ? 'text-[#4F46E5]' : 'text-slate-400'} />
              <span className="whitespace-nowrap text-sm font-bold">{cat.id}</span>
            </button>
          ))}
        </nav>

      </aside>

      {/* Main Content */}
      <main className="min-w-0 flex-1 w-full max-w-full p-4 sm:p-6 lg:p-10 xl:max-w-[1400px]">
        {/* Header Section */}
        <div className="mb-6 flex flex-col gap-4 lg:mb-10 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-3xl">
            <h1 className="text-3xl font-black tracking-tight text-slate-900 leading-tight sm:text-4xl lg:text-[40px]">Service Marketplace</h1>
            <p className="mt-1 text-sm font-bold uppercase tracking-tight text-slate-400 sm:text-base">Find skills to learn or exchange your own for campus credits.</p>
          </div>
          <button className="flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-100 bg-white px-5 py-3 text-[12px] font-black uppercase tracking-wider shadow-sm transition-all hover:bg-slate-50 sm:w-auto sm:px-6">
            <LayoutGrid size={16} className="text-slate-400" />
            Recommended
          </button>
        </div>

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center lg:mb-8">
          <label className="relative w-full sm:max-w-md">
            <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search services or descriptions"
              className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm font-medium text-slate-700 outline-none transition-all placeholder:text-slate-300 focus:border-[#4F46E5] focus:ring-4 focus:ring-indigo-50"
            />
          </label>
        </div>

        {/* Pill Filters */}
        <div className="mb-8 flex flex-wrap gap-3 lg:mb-12">
          <button className="flex items-center gap-2 rounded-full border border-[#4F46E5]/10 bg-[#EEF2FF] px-4 py-3 text-[11px] font-black uppercase tracking-widest text-[#4F46E5] sm:px-7">
            Verified Only <CheckCircle2 size={14} strokeWidth={3} />
          </button>
          {['Under 50 Credits', 'Top Rated', 'Recent'].map((filter) => (
            <button key={filter} className="rounded-full border border-slate-200 bg-white px-4 py-3 text-[11px] font-black uppercase tracking-widest text-slate-400 transition-all hover:border-slate-300 sm:px-7">
              {filter}
            </button>
          ))}
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {loading ? (
            <div className="col-span-full flex items-center justify-center py-20">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#4F46E5] border-t-transparent" />
            </div>
          ) : (
            filteredServices.map((service) => (
              <div
                key={service._id}
                className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white transition-all duration-500 hover:-translate-y-2 hover:border-[#4F46E5]/30 hover:shadow-[0_20px_60px_-15px_rgba(79,70,229,0.35)]"
              >
                {/* Thumbnail */}
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={
                      service.image ||
                      `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop`
                    }
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    alt=""
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                  {/* Category */}
                  <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold text-slate-700 backdrop-blur-md">
                    {service.category}
                  </div>

                  {/* Wishlist */}
                  <button className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-slate-400 backdrop-blur-md transition-all hover:scale-110 hover:text-pink-500">
                    <Heart size={18} />
                  </button>

                  {/* Price */}
                  <div className="absolute bottom-4 right-4 rounded-2xl bg-white/95 px-4 py-2 shadow-lg backdrop-blur-md">
                    <div className="flex items-center gap-1 text-lg font-black text-[#4F46E5]">
                      {service.price}
                      <span className="text-xs font-bold text-slate-400">Credits</span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-4 p-5">
                  {/* Title */}
                  <div>
                    <h3 className="line-clamp-1 text-xl font-black text-slate-800 transition-colors duration-300 group-hover:text-[#4F46E5]">
                      {service.title}
                    </h3>

                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-500">
                      {service.description}
                    </p>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-2">
                    <StarRating
                      rating={service.ratingSummary?.averageRating || 0}
                      count={service.ratingSummary?.reviewCount || 0}
                      size={14}
                      className="gap-0.5"
                      showValue={false}
                      showCount={false}
                      starClassName="text-amber-400 fill-amber-400"
                    />

                    {service.ratingSummary?.reviewCount > 0 ? (
                      <span className="text-sm font-semibold text-slate-600">
                        {service.ratingSummary.averageRating.toFixed(1)} •{" "}
                        {service.ratingSummary.reviewCount} reviews
                      </span>
                    ) : (
                      <span className="text-sm font-medium text-slate-400">
                        New listing
                      </span>
                    )}
                  </div>

                  {/* Divider */}
                  <div className="border-t border-slate-100" />

                  {/* Footer */}
                  <div className="flex items-center justify-between gap-3">
                    {/* User */}
                    <div className="flex min-w-0 items-center gap-3">
                      <img
                        src={
                          service.owner?.photoURL ||
                          `https://api.dicebear.com/7.x/avataaars/svg?seed=${service.ownerID}`
                        }
                        className="h-11 w-11 rounded-full border-2 border-white object-cover shadow-md"
                        alt=""
                      />

                      <div className="min-w-0">
                        <div className="flex items-center gap-1 text-sm font-bold text-slate-800">
                          <span className="truncate">
                            {service.owner?.displayName || "Student"}
                          </span>

                          <CheckCircle2
                            size={14}
                            className="text-[#4F46E5]"
                            strokeWidth={3}
                          />
                        </div>

                        <p className="text-xs text-slate-400">
                          Trusted Instructor
                        </p>
                      </div>
                    </div>


                  </div>
                  {/* Button */}
                  <button
                    onClick={() => setSelectedService(service)}
                    className="rounded-2xl bg-[#4F46E5] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition-all duration-300 hover:scale-105 hover:bg-[#4338CA]"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Booking Modal */}
        {selectedService && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-3 sm:items-center sm:p-4">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-4 shadow-2xl sm:rounded-[28px] sm:p-6">
              <div className="mb-4 flex items-start justify-between gap-4">
                <h3 className="text-lg font-bold leading-snug text-slate-900 sm:text-xl">Request Booking for {selectedService.title}</h3>
                <button onClick={() => setSelectedService(null)} className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-bold text-slate-500 transition-colors hover:bg-slate-200">Close</button>
              </div>
              <BookingForm service={selectedService} />
            </div>
          </div>
        )}

        {/* Pagination */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-3 sm:mt-24">
          <button className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-300 hover:text-[#4F46E5] transition-all">
            <ChevronLeft size={20} />
          </button>
          <div className="flex flex-wrap items-center justify-center gap-2">
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