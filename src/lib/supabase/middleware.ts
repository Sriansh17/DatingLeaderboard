import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Routes that require authentication
const PROTECTED_PATHS = ['/dashboard', '/posts', '/partners', '/profile', '/settings', '/leaderboards'];

// Routes where logged-in users should be redirected away
const AUTH_PATHS = ['/auth'];

// API routes that need session but shouldn't redirect
const API_PATHS = ['/api'];

export async function updateSession(request: NextRequest) {
  const start = Date.now();
  const pathname = request.nextUrl.pathname;

  let supabaseResponse = NextResponse.next({ request });

  const isProtected = PROTECTED_PATHS.some((path) => pathname.startsWith(path));
  const isAuthPage = AUTH_PATHS.some((path) => pathname.startsWith(path));
  const isApiRoute = API_PATHS.some((path) => pathname.startsWith(path));

  // Skip auth entirely for public pages (not protected, not auth, not API)
  if (!isProtected && !isAuthPage && !isApiRoute) {
    return supabaseResponse;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  let user = null;
  try {
    const authResult = await supabase.auth.getUser();
    user = authResult.data.user;
  } catch (err) {
    console.log(`[Middleware] ${pathname} | auth.getUser failed:`, err);
  }

  console.log(`[Middleware] ${pathname} | auth: ${Date.now() - start}ms | user: ${!!user}`);

  // API routes: just refresh session cookies, don't redirect
  if (isApiRoute) {
    return supabaseResponse;
  }

  // Protected route without auth → redirect to login
  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth/login';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // Logged-in user on auth page → redirect to dashboard
  if (isAuthPage && user) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
