import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('jwt_token');

  const protectedRoutes = ['/dashboard', '/studio'];
  const shouldProtect = protectedRoutes.some(route =>
    request.nextUrl.pathname.startsWith(route)
  );

  if (!token && shouldProtect) {
    return NextResponse.redirect(new URL('/signup', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/studio/:path*'],
};
