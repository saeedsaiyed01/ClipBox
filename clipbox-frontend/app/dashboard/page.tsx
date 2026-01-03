'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { authenticatedFetch } from '../../lib/api';
import { getToken, removeToken } from '../../lib/auth';

interface UserData {
  name: string;
  email: string;
  plan: 'free' | 'pro' | 'premium';
  credits: number;
  creditsResetDate: string;
  videoGenerationsCount: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = getToken();
      if (!token) {
        router.replace('/');
        return;
      }

      try {
        const response = await authenticatedFetch('/auth/me');
        if (response.ok) {
          const data = await response.json();
          setUserData(data);
        } else {
          setError('Failed to fetch user data.');
          router.replace('/');
        }
      } catch (err) {
        setError('An error occurred while fetching user data.');
        router.replace('/');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  const handleLogout = () => {
    removeToken();
    router.replace('/');
  };

  const handleGenerateVideo = async () => {
    // Implement video generation logic here
    // This will likely involve another authenticatedFetch call to the backend
    alert('Video generation initiated!');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
        <p className="text-red-500">Error: {error}</p>
        <button onClick={handleLogout} className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-md">Go to Login</button>
      </div>
    );
  }

  const creditsRemaining = userData ? userData.credits : 0;
  const isGenerateButtonDisabled = creditsRemaining <= 0;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white p-4">
      <h1 className="text-4xl font-bold mb-6">Dashboard</h1>
      {userData && (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md w-full max-w-md text-center">
          <p className="text-lg mb-2">Welcome, {userData.name}!</p>
          <p className="text-gray-600 dark:text-gray-300 mb-4">{userData.email}</p>
          <p className="text-xl font-semibold mb-6">
            You have {creditsRemaining} credits remaining.
          </p>
          <button
            onClick={handleGenerateVideo}
            disabled={isGenerateButtonDisabled}
            className={`w-full px-6 py-3 rounded-md text-white font-semibold transition-colors ${isGenerateButtonDisabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            Process Video (1 credit)
          </button>
          {isGenerateButtonDisabled && (
            <p className="text-sm text-red-500 mt-2">No credits remaining. Upgrade your plan for more credits.</p>
          )}
          <button
            onClick={handleLogout}
            className="mt-4 w-full px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-md font-semibold transition-colors"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}