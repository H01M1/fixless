/**
 * components/cancel/CancelNotice.tsx
 * ====================================
 * 解約時の注意事項と必須免責文を表示するコンポーネント。
 *
 * 表示するもの:
 * 1. cancellationNotes（サービス固有の注意事項）
 *    - amber（黄）ボックスで表示
 *    - 解約後の利用可否・データ消失・違約金など
 *
 * 2. 必須免責文（常に表示）
 *    - 「料金・解約方法は変更される可能性があります」
 *    - 「最終確認は公式サイトで」
 *    - このアプリは解約代行ではなく情報提供のみ
 *
 * 設計上の注意:
 * - data/services.ts の cancellationNotes にはすでに免責文が含まれているが、
 *   このコンポーネントで免責ボックスを別途表示することで「重要な情報」として
 *   目立つように設計している
 * - cancellationNotes が undefined の場合でも免責文は必ず表示する
 */

import { AlertCircle, Info } from 'lucide-react';

interface CancelNoticeProps {
  /** サービス固有の注意事項（data/services.ts の cancellationNotes） */
  notes?: string;
}

export function CancelNotice({ notes }: CancelNoticeProps) {
  return (
    <div className="space-y-3">

      {/* ── サービス固有の注意事項（ある場合のみ表示） ── */}
      {notes && (
        <div className="bg-amber-50 rounded-2xl border border-amber-200 px-5 py-4">
          {/* タイトル */}
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle
              size={16}
              className="text-amber-600 flex-shrink-0"
              strokeWidth={2.5}
            />
            <h3 className="text-sm font-bold text-amber-800">解約時の注意事項</h3>
          </div>

          {/* 注意事項テキスト（改行を保持して表示） */}
          <div className="space-y-2">
            {notes
              .split('\n')
              .filter((line) => line.trim())
              .map((line, index) => (
                <NoteLine key={index} text={line.trim()} />
              ))}
          </div>
        </div>
      )}

      {/* ── 必須免責文（常に表示） ── */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200 px-5 py-4">
        <div className="flex items-start gap-3">
          <Info
            size={16}
            className="text-slate-400 flex-shrink-0 mt-0.5"
            strokeWidth={2}
          />
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-600">
              ご確認ください
            </p>
            <ul className="space-y-1.5">
              <DisclaimerItem>
                料金・解約方法は変更される場合があります。
                最終確認は必ず公式サイトでお願いします。
              </DisclaimerItem>
              <DisclaimerItem>
                このアプリは解約の「案内」を提供するものであり、
                解約代行は行っておりません。
              </DisclaimerItem>
              <DisclaimerItem>
                解約後のデータ・コンテンツの扱いは各サービスの
                規約をご確認ください。
              </DisclaimerItem>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// ================================================================
// 内部コンポーネント
// ================================================================

/**
 * 注意事項の1行を表示する。
 * ⚠️ や ※ で始まる場合は視覚的に強調する。
 */
function NoteLine({ text }: { text: string }) {
  const isWarning =
    text.startsWith('⚠️') ||
    text.includes('違約金') ||
    text.includes('注意');

  return (
    <p
      className={`text-xs leading-relaxed ${
        isWarning ? 'text-amber-800 font-medium' : 'text-amber-700'
      }`}
    >
      {text}
    </p>
  );
}

/** 免責文の1項目 */
function DisclaimerItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-1.5">
      <span
        className="w-1 h-1 rounded-full bg-slate-400 flex-shrink-0 mt-1.5"
        aria-hidden="true"
      />
      <p className="text-xs text-slate-500 leading-relaxed">{children}</p>
    </li>
  );
}
