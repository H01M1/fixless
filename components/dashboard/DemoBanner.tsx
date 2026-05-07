/**
 * components/dashboard/DemoBanner.tsx
 * ======================================
 * 未登録時に表示する「これはサンプルです」バナー。
 *
 * クリックで /add ページに遷移し、自分のサブスクを登録できる。
 */

'use client';

import Link from 'next/link';
import { Eye, ArrowRight } from 'lucide-react';

export function DemoBanner() {
  return (
    <div className="mx-4 mt-4 rounded-xl bg-blue-50 border border-blue-200 px-4 py-3">
      <div className="flex items-start gap-2.5">
        <Eye size={16} className="text-blue-600 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
        <div className="flex-1 min-w-0">
          <p className="text-blue-900 text-xs font-bold mb-0.5">
            👀 サンプル表示（フリーランスデザイナーの例）
          </p>
          <p className="text-blue-700 text-[11px] leading-relaxed mb-2">
            実際の経費を入れると、あなたの年間コスト・重複・節約候補が見えます
          </p>
          <Link
            href="/add"
            className="inline-flex items-center gap-1 text-blue-700 text-xs font-bold hover:text-blue-900"
          >
            自分の経費を入れてみる
            <ArrowRight size={12} strokeWidth={2.5} />
          </Link>
        </div>
      </div>
    </div>
  );
}