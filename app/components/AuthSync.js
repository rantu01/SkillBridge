'use client';

import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/app/(backend)/lib/firebase';

const AuthSync = () => {
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userData = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || '',
          isVerified: false  // Initially false, admin will approve later
        };

        try {
          const response = await fetch('/api/sync-user', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
          });

          const result = await response.json();

          if (response.ok) {
            console.log('User synced successfully:', result);
          } else {
            console.error('Error syncing user:', result.error);
          }
        } catch (error) {
          console.error('Network error syncing user:', error);
        }
      }
    });

    return unsubscribe;
  }, []);

  return null; // This component doesn't render anything
};

export default AuthSync;