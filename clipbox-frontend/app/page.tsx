'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { getToken } from '../lib/auth';
import LandingPage from "./components/LandingPage";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const token = getToken();
    if (token) {
      router.replace('/studio');
    }
  }, [router]);

  return    <main><LandingPage />;</main>
}