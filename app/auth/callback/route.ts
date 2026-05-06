/**
 * app/auth/callback/route.ts
 * ===========================
 * Supabase OAuth コールバック用 Route Handler。
 *
 * フロー:
 * 1. Google OAuth 後、Supabase がこのURLにリダイレクトする
 * 2. URL の code パラメータを Supabase セッションに交換する
 * 3. 成功したら `/` にリダイレクトする
 * 4. エラー時は `/?error=auth` にリダイレクトする
 */
 
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';
 
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code       = requestUrl.searchParams.get('code');
  const origin     = requestUrl.origin;
 
  if (code) {
    const cookieStore = await cookies();
 
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options);
              });
            } catch {
              // Server Component からの呼び出しでは set できない場合がある（無視してよい）
            }
          },
        },
      },
    );
 
    const { error } = await supabase.auth.exchangeCodeForSession(code);
 
    if (error) {
      console.error('[auth/callback] セッション交換エラー:', error);
      return NextResponse.redirect(`${origin}/?error=auth`);
    }
  }
 
  // ログイン成功 → ホームにリダイレクト
  return NextResponse.redirect(`${origin}/`);
}