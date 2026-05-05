/**
 * app/layout.tsx
 * ==============
 * アプリ全体のルートレイアウト（完全版）。
 *
 * 設定内容:
 * - metadata: SEO・OGP・Twitter Card・Apple Web App
 * - viewport: スマホ最適化
 * - フォント: Noto Sans JP
 * - PWA: manifest.json へのリンク
 * - BottomNav: 画面下部に固定
 * - InstallPrompt: ホーム画面追加の案内（iOS向け）
 */

import type { Metadata, Viewport } from 'next';
import { Noto_Sans_JP } from 'next/font/google';
import './globals.css';
import { BottomNav } from '@/components/layout/BottomNav';
import { InstallPrompt } from '@/components/pwa/InstallPrompt';
import { AuthProvider } from '@/providers/AuthProvider';

// ================================================================
// フォント設定
// ================================================================

const notoSansJP = Noto_Sans_JP({
  variable: '--font-noto',
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
  preload: true,
});

// ================================================================
// メタデータ
// ================================================================

const APP_URL  = process.env.NEXT_PUBLIC_APP_URL ?? 'https://fixless.vercel.app';
const APP_NAME = 'FixLess';
const APP_DESC =
  'サブスク・固定費を見える化して毎月の節約を実現。重複サブスクの検出、解約ガイド、次回請求日の管理が無料でできる節約アシスタントアプリ。';

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),

  title: {
    default:  `${APP_NAME} — 固定費を減らす節約アプリ`,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESC,
  keywords: [
    'サブスク管理', '固定費', '節約', '解約', 'サブスクリプション',
    'Netflix', 'Spotify', '家計', '節約アプリ', '固定費見直し',
  ],

  authors:   [{ name: APP_NAME }],
  creator:   APP_NAME,
  publisher: APP_NAME,

  robots: {
    index: true, follow: true,
    googleBot: { index: true, follow: true, 'max-snippet': -1 },
  },

  // PWA manifest
  manifest: '/manifest.json',

  // Apple Web App（ホーム画面追加時）
  appleWebApp: {
    capable:         true,
    title:           APP_NAME,
    statusBarStyle:  'default',
  },

  // OGP
  openGraph: {
    type:        'website',
    locale:      'ja_JP',
    url:          APP_URL,
    siteName:    APP_NAME,
    title:       `${APP_NAME} — 固定費を減らす節約アプリ`,
    description: APP_DESC,
    // OGP画像は Phase 2 で追加
    // images: [{ url: `${APP_URL}/og-image.png`, width: 1200, height: 630 }],
  },

  // Twitter Card
  twitter: {
    card:        'summary',
    title:       `${APP_NAME} — 固定費を減らす節約アプリ`,
    description: APP_DESC,
  },

  /*
   * iOS Safari が金額の数字を電話番号として
   * 自動リンクするのを防ぐ。
   */
  formatDetection: {
    telephone: false,
    email:     false,
    address:   false,
  },
};

// ================================================================
// Viewport
// ================================================================

export const viewport: Viewport = {
  width:        'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#4f46e5' },
    { media: '(prefers-color-scheme: dark)',  color: '#4f46e5' },
  ],
};

// ================================================================
// Root Layout
// ================================================================

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="ja"
      className={notoSansJP.variable}
      suppressHydrationWarning
    >
      <head>
        {/* Apple タッチアイコン */}
        <link rel="apple-touch-icon" sizes="192x192" href="/icon-192.png" />
        <link rel="apple-touch-icon" sizes="512x512" href="/icon-512.png" />
        {/* iOS フルスクリーン起動 */}
        <meta name="mobile-web-app-capable"            content="yes" />
        <meta name="apple-mobile-web-app-capable"      content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title"        content={APP_NAME} />
      </head>

      <body className="font-sans antialiased" suppressHydrationWarning>
  <AuthProvider>
    <div className="max-w-md mx-auto min-h-screen bg-slate-50 relative shadow-[0_0_40px_rgba(0,0,0,0.06)]">
      <main className="pb-nav">
        {children}
      </main>
    </div>
    <BottomNav />
    <InstallPrompt />
  </AuthProvider>
</body>
    </html>
  );
}
