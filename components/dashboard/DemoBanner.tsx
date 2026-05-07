/**
 * components/dashboard/DemoBanner.tsx
 * ======================================
 * 未登録時に表示する「これはサンプルです」スティッキーバナー。
 *
 * デザイン方針:
 * - 黄色系で警告風 → 一目で「自分のデータではない」と分かる
 * - sticky top-0 で常に画面上部に固定 → スクロールしても見える
 * - インラインで CTA ボタン配置
 */

'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function DemoBanner() {
  return (
    <div className="sticky top-0 z-20 bg-gradient-to-r from-amber-400 to-yellow-400 shadow-md">
      <div className="px-4 py-2.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xl flex-shrink-0" aria-hidden="true">👀</span>
          <div className="min-w-0">
            <p className="text-amber-950 text-xs font-black leading-none">
              サンプル表示中
            </p>
            <p className="text-amber-900 text-[10px] mt-0.5 truncate">
              あなたのデータではありません
            </p>
          </div>
        </div>
        <Link
          href="/add"
          className="flex-shrink-0 inline-flex items-center gap-1 bg-white text-amber-700 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm active:bg-amber-50"
        >
          自分のを入れる
          <ArrowRight size={12} strokeWidth={3} />
        </Link>
      </div>
    </div>
  );
}