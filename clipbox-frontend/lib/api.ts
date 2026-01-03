import { getToken, removeToken } from './auth';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function authenticatedFetch(url: string, options?: RequestInit) {
  const token = getToken();

  const headers: Record<string, string> = {
    ...(options?.headers as Record<string, string> || {}),
  };

  // Only set Content-Type to application/json if body is not FormData
  if (!(options?.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BACKEND_URL}${url}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    removeToken();
    window.location.href = '/'; // Redirect to login page
    return response; // Return response to prevent further execution
  }

  return response;
}
