import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const response = NextResponse.redirect(`${origin}${next}`);
      // Ensure the host URL matches the app URL for CORS
      response.headers.set('x-forwarded-host', new URL(origin).host);
      return response;
    }
  }

  const errorUrl = new URL('/auth/login', origin);
  errorUrl.searchParams.set('error', 'auth_callback_error');
  return NextResponse.redirect(errorUrl);
}
