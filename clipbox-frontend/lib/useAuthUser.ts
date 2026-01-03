"use client";

import { useCallback, useEffect, useState } from "react";
import { getToken, removeToken } from "./auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api";

export interface AuthUser {
  name: string;
  email?: string;
  avatar?: string;
  plan?: 'free' | 'pro' | 'premium';
  credits?: number;
  creditsResetDate?: string;
}

export function useAuthUser() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    setLoading(true);
    const token = getToken();

    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = (await response.json()) as AuthUser & {
          picture?: string;
          image?: string;
          avatarUrl?: string;
        };
        const resolvedAvatar =
          data.avatar || data.picture || data.image || data.avatarUrl;
        setUser({
          ...data,
          avatar: resolvedAvatar,
        });
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const signOut = useCallback(() => {
    removeToken();
    setUser(null);
  }, []);

  return { user, loading, signOut, refetch: fetchUser };
}
