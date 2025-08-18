// utils/supabase/middleware.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  // This is the core of the protection logic.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If the user is not logged in and they are trying to access a protected route
  if (!user && request.nextUrl.pathname.startsWith('/admin')) {
    // Redirect them to the login page.
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If the user is logged in and they are on the login page, redirect them to the admin dashboard.
  if (user && request.nextUrl.pathname === '/login') {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return response;
}