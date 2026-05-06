import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code       = requestUrl.searchParams.get('code');
  const origin     = requestUrl.origin;

  if (code) {
    try {
      const { createServerClient } = await import('@supabase/ssr');
      const { cookies } = await import('next/headers');
      const cookieStore = await cookies();

      const supabase = createServerClient(
        'https://cbxoowtdyokkgavcicyl.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNieG9vd3RkeW9ra2dhdmNpY3lsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwMDA2MDIsImV4cCI6MjA5MzU3NjYwMn0.psAWSigMl-QRo8CzgLj-dgvvgf-j8hP35HDT0DJ6N5I',
        {
          cookies: {
            getAll() { return cookieStore.getAll(); },
            setAll(cookiesToSet) {
              try {
                cookiesToSet.forEach(({ name, value, options }) => {
                  cookieStore.set(name, value, options);
                });
              } catch { /* ignore */ }
            },
          },
        },
      );

      await supabase.auth.exchangeCodeForSession(code);
    } catch (err) {
      console.error('[auth/callback] error:', err);
      return NextResponse.redirect(`${origin}/?error=auth`);
    }
  }

  return NextResponse.redirect(`${origin}/`);
}