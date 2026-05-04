/**
 * components/cancel/CancelSteps.tsx
 * ===================================
 * 解約手順をステップ形式で表示するコンポーネント。
 *
 * テキスト解析の仕様:
 * data/services.ts の cancellationSteps は改行区切りの書式を採用している。
 * このコンポーネントでパースして構造化して表示する。
 *
 * 対応している書式:
 * 1. 番号付きステップ: "1. ログインする" / "2.「設定」を..."
 * 2. セクション見出し: "【iPhoneの場合】" / "【Webの場合】"
 * 3. 注釈テキスト:    "※ 月末までに..." / "⚠️ 年間プランは..."
 * 4. 空行:           セクション間のスペーサー
 *
 * 解析例:
 * Input:
 *   "【iPhoneの場合】\n1. 設定を開く\n2. タップする\n\n【Webの場合】\n1. ..."
 * Output:
 *   [section, step(1), step(2), separator, section, step(1), ...]
 */

// ================================================================
// パース結果の型
// ================================================================

type StepLine =
  | { type: 'section';   content: string }
  | { type: 'step';      num: number; content: string }
  | { type: 'note';      content: string }
  | { type: 'separator' };

// ================================================================
// テキストパーサー
// ================================================================

/**
 * cancellationSteps の文字列を解析して構造化データに変換する。
 *
 * @param text - 改行区切りの解約手順テキスト
 * @returns StepLine[] - 解析結果
 */
function parseSteps(text: string): StepLine[] {
  const lines = text.split('\n');
  const result: StepLine[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    // ── 空行 → セパレーター ──────────────────────────────────
    if (!trimmed) {
      // 連続する空行は1つのセパレーターにまとめる
      if (result.length > 0 && result[result.length - 1].type !== 'separator') {
        result.push({ type: 'separator' });
      }
      continue;
    }

    // ── セクション見出し: 【...】 ────────────────────────────
    if (trimmed.startsWith('【') && trimmed.includes('】')) {
      result.push({ type: 'section', content: trimmed });
      continue;
    }

    // ── 番号付きステップ: "1. " "2.「" "3.　" ────────────────
    // 数字の後にピリオド or 。が続くパターン（全角数字も考慮）
    const stepMatch = trimmed.match(/^(\d+)[.)。]\s*(.+)/);
    if (stepMatch) {
      const num     = parseInt(stepMatch[1], 10);
      const content = stepMatch[2].trim();
      result.push({ type: 'step', num, content });
      continue;
    }

    // ── 注釈テキスト: ※ や ⚠️ で始まる行 ─────────────────────
    if (
      trimmed.startsWith('※') ||
      trimmed.startsWith('⚠️') ||
      trimmed.startsWith('注意') ||
      trimmed.startsWith('注：')
    ) {
      result.push({ type: 'note', content: trimmed });
      continue;
    }

    // ── それ以外 → 注釈として扱う ─────────────────────────────
    result.push({ type: 'note', content: trimmed });
  }

  // 末尾のセパレーターを削除（見た目がスッキリする）
  while (result.length > 0 && result[result.length - 1].type === 'separator') {
    result.pop();
  }

  return result;
}

// ================================================================
// コンポーネント
// ================================================================

interface CancelStepsProps {
  /** 解約手順テキスト（cancellationSteps の値） */
  steps?: string;
}

export function CancelSteps({ steps }: CancelStepsProps) {
  // 手順がない場合は何も表示しない
  if (!steps?.trim()) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-5">
        <SectionTitle title="解約の手順" />
        <p className="text-sm text-slate-400 mt-3">
          解約手順はまだ登録されていません。公式サイトをご確認ください。
        </p>
      </div>
    );
  }

  const parsed = parseSteps(steps);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-5 pt-5 pb-4">
      <SectionTitle title="解約の手順" />

      <div className="mt-4 space-y-0">
        {parsed.map((line, index) => {
          switch (line.type) {

            // ── セパレーター ──────────────────────────────────
            case 'separator':
              return <div key={index} className="h-4" aria-hidden="true" />;

            // ── セクション見出し ──────────────────────────────
            case 'section':
              return (
                <div key={index} className="py-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                      {line.content}
                    </span>
                  </div>
                </div>
              );

            // ── 番号付きステップ ──────────────────────────────
            case 'step':
              return (
                <div key={index} className="flex items-start gap-3 py-2.5">
                  {/* 番号の丸 */}
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center mt-0.5">
                    <span className="text-[11px] font-bold text-indigo-600">
                      {line.num}
                    </span>
                  </div>
                  {/* テキスト */}
                  <p className="flex-1 text-sm text-slate-700 leading-relaxed">
                    {line.content}
                  </p>
                </div>
              );

            // ── 注釈テキスト ──────────────────────────────────
            case 'note':
              return (
                <div key={index} className="py-1.5 pl-1">
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {line.content}
                  </p>
                </div>
              );

            default:
              return null;
          }
        })}
      </div>
    </div>
  );
}

// ================================================================
// 共通パーツ
// ================================================================

function SectionTitle({ title }: { title: string }) {
  return (
    <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
      <span className="w-1 h-4 bg-indigo-500 rounded-full inline-block" aria-hidden="true" />
      {title}
    </h3>
  );
}
