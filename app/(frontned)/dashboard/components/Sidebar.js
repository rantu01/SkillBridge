'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Home, User, Settings, ShoppingBag, LogOut, Store, Users, Video } from 'lucide-react';
import { auth } from '@/app/(backend)/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const Sidebar = () => {
  const [user, setUser] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (!user) return;
    const fetchPending = async () => {
      try {
        const res = await fetch(`/api/booking?providerID=${user.uid}`);
        const data = await res.json();
        if (data.success) {
          const count = (data.bookings || []).filter(b => b.status === 'Pending').length;
          setPendingCount(count);
        }
      } catch (err) {
        console.error('Error fetching pending bookings:', err);
      }
    };
    fetchPending();
  }, [user]);

  const menuItems = [
    { name: 'Dashboard', icon: <Home size={20} />, href: '/dashboard' },
    { name: 'Profile', icon: <User size={20} />, href: '/profile' },
    { name: 'Sessions', icon: <Video size={20} />, href: '/dashboard/sessions' },
    { name: 'My Trades', icon: <ShoppingBag size={20} />, href: '/dashboard/trades' },
    { name: 'Settings', icon: <Settings size={20} />, href: '/dashboard/settings' },
    { name: 'Marketplace', icon: <Store size={20} />, href: '/profile/marketplace' },
    { name: 'Community', icon: <Users size={20} />, href: '/community' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
      <div className="p-6">
        <Link href="/">
          <h2 className="text-2xl font-bold text-blue-600">SkillBridge</h2>
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {menuItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all font-medium"
          >
            {item.icon}
            {item.name}
          </Link>
        ))}

        {/* Bookings link with pending badge */}
        <Link href="/profile/bookings" className="flex items-center justify-between gap-3 px-4 py-3 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all font-medium">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10v6a2 2 0 0 1-2 2H5l-4 0V6a2 2 0 0 1 2-2h4"/></svg>
            Bookings
          </div>
          {pendingCount > 0 && (
            <div className="text-[12px] bg-red-500 text-white px-2 py-1 rounded-full font-bold">{pendingCount}</div>
          )}
        </Link>
      </nav>

      <div className="p-4 border-t border-gray-100">
        <button className="flex items-center gap-3 w-full px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-all font-medium">
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;