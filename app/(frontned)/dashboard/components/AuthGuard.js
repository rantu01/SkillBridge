'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/app/(backend)/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const AuthGuard = ({ children, allowedEmails = [], redirectTo = '/' }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace(redirectTo);
        return;
      }

      const email = user.email?.toLowerCase() || '';
      const normalizedAllowedEmails = allowedEmails.map((allowedEmail) => allowedEmail.toLowerCase());

      if (normalizedAllowedEmails.length > 0 && !normalizedAllowedEmails.includes(email)) {
        router.replace(redirectTo);
        return;
      }

      setLoading(false);
    });
    return unsubscribe;
  }, [allowedEmails, redirectTo, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthGuard;