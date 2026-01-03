'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { setToken } from '../../lib/auth';

export default function AuthSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');

    if (token) {
      setToken(token);
      console.log('Token received on auth-success page, redirecting to /studio');
      router.replace('/studio');
    } else {
      console.log('No token received on auth-success page, redirecting to /auth-error');
      router.replace('/auth-error');
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      <p>Processing authentication...</p>
    </div>
  );
}
