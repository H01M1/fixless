/**
 * lib/ocr.ts
 * ==========
 * Tesseract.js を使ったブラウザ内 OCR。
 *
 * ポリシー:
 * - 画像はサーバーに送信しない（ブラウザ内処理のみ）
 * - OCR結果は localStorage に保存しない
 * - dynamic import で SSR を回避する
 *
 * 使い方:
 *   const lines = await extractTextLines(dataUrl, (pct, msg) => { ... });
 */

export type OcrProgressCallback = (pct: number, statusLabel: string) => void;

/**
 * Tesseract.js のステータスコードを日本語ラベルに変換する。
 */
export function getOcrStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    'loading tesseract core':       '準備中...',
    'initializing tesseract':       '初期化中...',
    'loading language traineddata': '言語データを読み込み中...',
    'initializing api':             '初期化中...',
    'recognizing text':             'テキストを読み取り中...',
  };
  return labels[status] ?? '処理中...';
}

/**
 * 画像から OCR でテキスト行を抽出する。
 *
 * @param imageDataUrl  FileReader で生成した data URL（base64）
 * @param onProgress    進捗コールバック（0〜100, ステータスラベル）
 * @returns             抽出したテキスト行の配列（空行・1文字以下は除外済み）
 *
 * @example
 * const lines = await extractTextLines(dataUrl, (pct, msg) => {
 *   console.log(`${pct}% - ${msg}`);
 * });
 * // → ['Netflix', '1,590/月', 'Spotify', ...]
 */
export async function extractTextLines(
  imageDataUrl: string,
  onProgress: OcrProgressCallback,
): Promise<string[]> {
  // dynamic import: SSR（サーバーサイド）では実行しない
  const { createWorker } = await import('tesseract.js');

  let progressStage = 0;

  const worker = await createWorker('eng', 1, {
    logger: (m: { status: string; progress: number }) => {
      const status = m.status ?? '';
      const raw    = m.progress ?? 0;

      // 初期化フェーズ（0〜20%）と認識フェーズ（20〜100%）に分割して表示
      if (status === 'recognizing text') {
        onProgress(20 + Math.round(raw * 80), getOcrStatusLabel(status));
      } else {
        // 初期化フェーズでも少しずつ進捗を増やす
        if (raw > 0) {
          progressStage = Math.max(progressStage, Math.round(raw * 20));
        }
        onProgress(progressStage, getOcrStatusLabel(status));
      }
    },
  });

  try {
    const { data } = await worker.recognize(imageDataUrl);

    const fullText = (data as any).text as string ?? '';
    return fullText
      .split('\n')
      .map((line: string) => line.trim())
      .filter((line: string) => line.length > 1); // 空行・1文字以下を除外
  } finally {
    // 必ずワーカーを終了してメモリを解放する
    await worker.terminate();
  }
}
