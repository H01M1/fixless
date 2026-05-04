'use client';

/**
 * components/layout/BottomNav.tsx
 * ================================
 * スマホ向けの固定ボトムナビゲーション。
 *
 * タブ構成:
 * - ホーム (/)     : ダッシュボード
 * - 追加 (/add)   : サブスク追加（中央の＋ボタン）
 * - 節約 (/savings): 節約候補一覧
 *
 * アクティブ判定:
 * usePathname() で現在のパスを取得し、一致するタブをハイライトする。
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, PlusCircle, TrendingDown } from 'lucide-react';

// ================================================================
// ナビアイテム定義
// ================================================================

const NAV_ITEMS = [
  {
    href: '/',
    label: 'ホーム',
    icon: LayoutDashboard,
    // exact: true にすることで /add や /savings で「ホーム」がアクティブにならない
    exact: true,
  },
  {
    href: '/add',
    label: '追加',
    icon: PlusCircle,
    exact: false,
  },
  {
    href: '/savings',
    label: '節約',
    icon: TrendingDown,
    exact: false,
  },
] as const;

// ================================================================
// コンポーネント
// ================================================================

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }} // iOS ホームインジケーター対応
      aria-label="メインナビゲーション"
    >
      {/* max-w-md で中央揃え（layout.tsx の main と幅を合わせる） */}
      <div className="max-w-md mx-auto flex">
        {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
          // アクティブ判定
          const isActive = exact ? pathname === href : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={`
                flex-1 flex flex-col items-center justify-center
                py-2 gap-0.5 min-h-[56px]
                transition-colors duration-150 select-none
                ${isActive
                  ? 'text-indigo-600'
                  : 'text-slate-400 hover:text-slate-600 active:text-slate-600'
                }
              `}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon
                size={24}
                strokeWidth={isActive ? 2.5 : 1.8}
                aria-hidden="true"
              />
              <span
                className={`text-[10px] leading-none ${
                  isActive ? 'font-bold' : 'font-normal'
                }`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
