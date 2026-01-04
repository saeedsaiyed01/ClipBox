import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';

const TOKEN_KEY = 'auth_token';
const AUTH_COOKIE_NAME = 'jwt_token';
const ONE_WEEK_SECONDS = 7 * 24 * 60 * 60;

const getCookieValue = (name: string) => {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
};

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(TOKEN_KEY);
  if (stored) return stored;

  const cookieToken = getCookieValue(AUTH_COOKIE_NAME);
  if (cookieToken) {
    localStorage.setItem(TOKEN_KEY, cookieToken);
  }

  return cookieToken;
}

export function setToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
  document.cookie = `${AUTH_COOKIE_NAME}=${encodeURIComponent(token)}; path=/; max-age=${ONE_WEEK_SECONDS}`;
}

export function removeToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  document.cookie = `${AUTH_COOKIE_NAME}=; path=/; max-age=0`;
}

const handler = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || 'dummy',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy',
    }),
  ],
});

export { handler as GET, handler as POST };
