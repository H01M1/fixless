/**
 * components/dashboard/DemoFooterCTA.tsx
 * ========================================
 * デモ表示の最後に置く CTA セクション。
 * 「上のバナー」と「下の CTA」でデモ範囲を視覚的に挟むことで
 * 「ここまでが全部サンプル」と分かりやすくする。
 */

'use client';

import Link from 'next/link';
import { Sparkles, ArrowRight } from 'lucide-react';

export function DemoFooterCTA() {
  return (
    <div className="mx-4 mt-6 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-800 p-5 text-center shadow-md">
      <Sparkles size={28} className="text-yellow-300 mx-auto mb-2" strokeWidth={2.5} />
      <h3 className="text-white text-base font-bold mb-1">
        自分の年間コストはいくら？
      </h3>
      <p className="text-indigo-200 text-xs leading-relaxed mb-4 px-2">
        実際に使っているサブスクを入れると、<br />
        本当の年間コスト・重複・節約候補が見えます
      </p>
      <Link
        href="/add"
        className="inline-flex items-center justify-center gap-2 w-full bg-white text-indigo-700 py-3 rounded-xl text-sm font-bold shadow-sm active:bg-slate-50"
      >
        最初のサブスクを追加する
        <ArrowRight size={16} strokeWidth={2.5} />
      </Link>
    </div>
  );
}