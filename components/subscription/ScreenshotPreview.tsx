'use client';

/**
 * components/subscription/ScreenshotPreview.tsx
 * ===============================================
 * スクリーンショットの選択・プレビュー表示コンポーネント。
 *
 * 仕様:
 * - 画像ファイルを選択できる（input[type="file"]）
 * - FileReader で data URL に変換してブラウザ内のみで表示
 * - 画像はサーバーにも localStorage にも送らない
 * - 画像以外のファイルが選ばれた場合はエラー表示
 * - 削除ボタンで画像をリセットできる
 */

import { useState, useRef } from 'react';
import { Camera, X } from 'lucide-react';

// ================================================================
// Props
// ================================================================

interface ScreenshotPreviewProps {
  /** 画像が読み込まれたときに data URL を渡すコールバック */
  onImageLoad: (dataUrl: string) => void;
  /** 画像が削除されたときのコールバック */
  onImageRemove: () => void;
}

// ================================================================
// ScreenshotPreview
// ================================================================

export function ScreenshotPreview({ onImageLoad, onImageRemove }: ScreenshotPreviewProps) {
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ── ファイル選択ハンドラ ──────────────────────────────────────

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 画像ファイルかどうかチェック
    if (!file.type.startsWith('image/')) {
      setError('画像ファイルを選択してください（PNG・JPG・HEICなど）');
      // input をリセット
      e.target.value = '';
      return;
    }

    setError(null);

    // FileReader で data URL に変換（サーバー送信なし・localStorage保存なし）
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setImageDataUrl(dataUrl);
      onImageLoad(dataUrl);
    };
    reader.onerror = () => {
      setError('画像の読み込みに失敗しました。別の画像を選んでください。');
    };
    reader.readAsDataURL(file);

    // 同じファイルを再選択できるようにリセット
    e.target.value = '';
  };

  // ── 削除ハンドラ ──────────────────────────────────────────────

  const handleRemove = () => {
    setImageDataUrl(null);
    setError(null);
    onImageRemove();
  };

  // ================================================================
  // 画像表示中
  // ================================================================

  if (imageDataUrl) {
    return (
      <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
        <img
          src={imageDataUrl}
          alt="サブスクリプション一覧のスクリーンショット"
          className="w-full object-contain max-h-72"
        />
        {/* 削除ボタン */}
        <button
          onClick={handleRemove}
          className="
            absolute top-2 right-2
            w-8 h-8 rounded-full
            bg-slate-800/70 hover:bg-slate-800
            flex items-center justify-center
            text-white transition-colors
          "
          aria-label="画像を削除"
        >
          <X size={16} strokeWidth={2.5} />
        </button>
        {/* 画像の下に差し替えボタン */}
        <button
          onClick={() => inputRef.current?.click()}
          className="w-full py-2 bg-slate-800/60 text-white text-xs font-medium hover:bg-slate-800/80 transition-colors"
        >
          別の画像に変更する
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    );
  }

  // ================================================================
  // 画像未選択（アップロードエリア）
  // ================================================================

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="
          w-full flex flex-col items-center justify-center gap-3
          py-8 px-4 rounded-xl
          border-2 border-dashed border-slate-300 bg-slate-50
          hover:border-indigo-400 hover:bg-indigo-50
          active:bg-indigo-50
          transition-colors
        "
        aria-label="スクリーンショットを選ぶ"
      >
        <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
          <Camera size={24} className="text-indigo-600" strokeWidth={1.5} />
        </div>
        <div className="text-center">
          <p className="text-sm font-bold text-slate-700">スクショを選ぶ</p>
          <p className="text-xs text-slate-400 mt-0.5">PNG・JPG・HEICなど</p>
        </div>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        aria-label="スクリーンショットファイルを選択"
      />

      {error && (
        <p className="text-xs text-rose-500 mt-2 text-center">{error}</p>
      )}
    </div>
  );
}
