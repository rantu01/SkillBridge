'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { auth } from '@/app/(backend)/lib/firebase';
import { signOut } from 'firebase/auth';

const Topbar = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return unsubscribe;
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 fixed top-0 right-0 left-0 md:left-64 z-10 px-6 flex items-center justify-between">
      <div className="md:hidden font-bold text-blue-600 text-xl">
        SkillBridge
      </div>
      
      <div className="ml-auto flex items-center gap-4">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-bold text-gray-800">{user ? user.displayName || 'User' : 'NWU Student'}</p>
          <p className="text-xs text-gray-500">{user ? user.email : '20241080010@nwu.ac.bd'}</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center border border-blue-200 overflow-hidden">
          <Image src={user?.photoURL || "/logo/logo-removebg.png"} alt="Profile" width={40} height={40} />
        </div>
        {user && (
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Logout
          </button>
        )}
      </div>
    </header>
  );
};

export default Topbar;