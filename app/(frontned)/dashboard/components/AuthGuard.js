'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/app/(backend)/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const AuthGuard = ({ children }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push('/login');
      } else {
        setLoading(false);
      }
    });
    return unsubscribe;
  }, [router]);

  if (loading) {
    return <div>Loading...</div>; // or a spinner
  }

  return <>{children}</>;
};

export default AuthGuard;