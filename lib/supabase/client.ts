/**
 * lib/supabase/client.ts
 * =======================
 * Supabase ブラウザクライアントのシングルトン。
 *
 * 注意:
 * - createBrowserClient は 'use client' コンポーネントからのみ呼び出すこと
 * - SSR 時（typeof window === 'undefined'）は null を返す
 * - NEXT_PUBLIC_ 環境変数は .env.local と Vercel の両方に設定が必要
 */

import { createBrowserClient } from '@supabase/ssr';

let client: ReturnType<typeof createBrowserClient> | null = null;

/**
 * Supabase クライアントを返す。
 * ブラウザ環境以外では null を返す（SSR 対策）。
 */
export function getSupabaseClient() {
  if (typeof window === 'undefined') return null;

  if (!client) {
    client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
  }

  return client;
}
