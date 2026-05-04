/**
 * components/layout/PageHeader.tsx
 * ==================================
 * /savings・/cancel/[id] などのサブ画面で使うページヘッダー。
 * ホーム（ダッシュボード）では使わない。
 *
 * Props:
 * - title:    ページタイトル
 * - backHref: 戻るボタンのリンク先（省略時はボタン非表示）
 * - right:    右端に表示するノード（オプション）
 */

import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

interface PageHeaderProps {
  /** ページタイトル */
  title: string;

  /**
   * 戻るボタンのリンク先。
   * 省略した場合は戻るボタンを表示しない。
   */
  backHref?: string;

  /**
   * 右端に表示するノード（例: 「編集」ボタンなど）。
   * 省略した場合は表示しない。
   */
  right?: React.ReactNode;
}

export function PageHeader({ title, backHref, right }: PageHeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="flex items-center h-14 px-2">
        {/* 戻るボタン（左） */}
        <div className="w-10">
          {backHref && (
            <Link
              href={backHref}
              className="flex items-center justify-center w-10 h-10 rounded-full text-slate-600 hover:bg-slate-100 active:bg-slate-100 transition-colors"
              aria-label="戻る"
            >
              <ChevronLeft size={24} strokeWidth={2} />
            </Link>
          )}
        </div>

        {/* タイトル（中央） */}
        <h1 className="flex-1 text-center text-base font-bold text-slate-800 truncate px-2">
          {title}
        </h1>

        {/* 右側コンテンツ */}
        <div className="w-10 flex justify-end">
          {right}
        </div>
      </div>
    </header>
  );
}
