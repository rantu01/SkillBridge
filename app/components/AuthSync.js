'use client';

import { useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '@/app/(backend)/lib/firebase';
import Swal from 'sweetalert2';

const AuthSync = () => {
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userData = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || '',
          isVerified: false
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
            if (result.user?.status === 'blocked') {
              await signOut(auth);
              Swal.fire({
                icon: 'error',
                title: 'Account Blocked',
                text: result.user.statusReason || 'Your account has been blocked. Please contact support.',
                confirmButtonColor: '#2563eb',
                background: '#ffffff',
                color: '#1e293b',
                customClass: { popup: 'rounded-[30px] shadow-2xl' }
              });
              return;
            }

            if (result.user?.status === 'suspended') {
              const untilDate = result.user.suspendedUntil ? new Date(result.user.suspendedUntil).toLocaleDateString() : '';
              await signOut(auth);
              Swal.fire({
                icon: 'warning',
                title: 'Account Suspended',
                text: `Your account is suspended until ${untilDate}.${result.user.statusReason ? ' Reason: ' + result.user.statusReason : ''}`,
                confirmButtonColor: '#2563eb',
                background: '#ffffff',
                color: '#1e293b',
                customClass: { popup: 'rounded-[30px] shadow-2xl' }
              });
              return;
            }

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

  return null;
};

export default AuthSync;