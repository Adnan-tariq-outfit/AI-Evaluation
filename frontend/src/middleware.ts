import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication
// Chat Hub is intentionally public; Agents remains protected
const protectedRoutes = ['/profile', '/settings', '/agents'];

// Routes that should only be accessible to unauthenticated users
const authRoutes = ['/login', '/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for API routes, Next.js internal routes, and static files
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Check auth state using the HTTP-only cookie
  // Since we rely on JWT only, if the access token exists, they are authenticated
  const accessToken = request.cookies.get('nexusai_access_token')?.value;
  const isAuthenticated = !!accessToken;

  // Protect dashboard routes
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    if (!isAuthenticated) {
      // Redirect to login with original url as redirect param
      const url = new URL('/login', request.url);
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
  }

  // Prevent authenticated users from accessing login/register pages
  if (authRoutes.some((route) => pathname.startsWith(route))) {
    if (isAuthenticated) {
      // Redirect to profile (avoid /dashboard 404)
      return NextResponse.redirect(new URL('/profile', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|images|svg|fonts).*)',
  ],
};
