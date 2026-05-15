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
    return <div>Loading...</div>; // or a spinner
  }

  return <>{children}</>;
};

export default AuthGuard;