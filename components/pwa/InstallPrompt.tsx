'use client';

/**
 * components/pwa/InstallPrompt.tsx
 * ==================================
 * PWA のホーム画面追加を促すバナー。
 *
 * 動作:
 * - iOS Safari: 手動手順（共有ボタン → ホーム画面に追加）を案内する
 * - Android Chrome: ブラウザのネイティブインストールプロンプトに任せる
 *   （beforeinstallprompt イベントをキャプチャする実装も可能だが MVP では省略）
 * - すでにホーム画面から起動中（standalone mode）は表示しない
 * - 一度閉じたら localStorage に記録して再表示しない
 * - マウント後 2.5秒で表示（アプリの初期レンダリングを邪魔しない）
 *
 * 配置:
 * BottomNav の上（bottom-20）に表示する。
 * z-index は BottomNav（z-50）より小さい z-40 にする。
 *
 * 将来の拡張:
 * - Android の beforeinstallprompt 対応
 * - 表示回数・タイミングの調整
 * - Pro 版での「インストール特典」訴求
 */

import { useState, useEffect } from 'react';
import { X, Share, Plus } from 'lucide-react';

// localStorage に保存するキー
const DISMISSED_KEY = 'fixless_install_prompt_dismissed';

// ================================================================
// デバイス判定ユーティリティ（クライアントサイドのみ）
// ================================================================

function detectEnvironment(): { isIOS: boolean; isStandalone: boolean } {
  if (typeof window === 'undefined') {
    return { isIOS: false, isStandalone: false };
  }

  const ua = navigator.userAgent;

  // iOS 判定（iPhone / iPad / iPod。ただし Chrome on iOS は除外しない）
  const isIOS =
    /iPad|iPhone|iPod/.test(ua) && !(window as { MSStream?: unknown }).MSStream;

  // スタンドアロンモード判定
  // - window.matchMedia: Chrome / Firefox on Android、および iOS Safari 14.3+
  // - navigator.standalone: iOS Safari（非標準だが事実上標準）
  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;

  return { isIOS, isStandalone };
}

// ================================================================
// コンポーネント
// ================================================================

export function InstallPrompt() {
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS]         = useState(false);

  useEffect(() => {
    const { isIOS: ios, isStandalone } = detectEnvironment();

    // すでにスタンドアロン起動中の場合は表示しない
    if (isStandalone) return;

    // iOS のみを対象にする（Android はブラウザのネイティブプロンプトに任せる）
    if (!ios) return;

    // 一度閉じていたら再表示しない
    const dismissed = localStorage.getItem(DISMISSED_KEY) === 'true';
    if (dismissed) return;

    setIsIOS(true);

    // 2.5秒後に表示（アプリの初期レンダリングを邪魔しない）
    const timer = setTimeout(() => setIsVisible(true), 2500);
    return () => clearTimeout(timer);
  }, []);

  // dismiss ハンドラ
  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem(DISMISSED_KEY, 'true');
  };

  // 非表示の場合は何もレンダリングしない
  if (!isVisible) return null;

  return (
    /*
     * BottomNav (bottom-0 z-50) の上に重ねる。
     * bottom-[72px] = BottomNav の高さ 56px + 余白 16px
     */
    <div
      className="fixed bottom-[72px] left-0 right-0 z-40 px-4"
      style={{ bottom: 'calc(56px + env(safe-area-inset-bottom, 0px) + 12px)' }}
      role="banner"
      aria-label="ホーム画面への追加案内"
    >
      <div className="max-w-md mx-auto">
        <div className="bg-slate-800 rounded-2xl shadow-2xl px-4 py-3.5 flex items-start gap-3">

          {/* アイコン */}
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center mt-0.5">
            <span className="text-lg font-black text-white select-none">F</span>
          </div>

          {/* テキスト */}
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-bold leading-tight">
              ホーム画面に追加しませんか？
            </p>

            {isIOS ? (
              /* iOS: 手動手順の案内 */
              <div className="mt-1.5 space-y-1">
                <p className="text-slate-300 text-xs leading-relaxed">
                  ① 画面下の
                  <span className="inline-flex items-center gap-0.5 mx-1 align-middle">
                    <Share size={12} className="text-sky-400" strokeWidth={2.5} />
                    <span className="text-sky-400 font-medium">共有</span>
                  </span>
                  をタップ
                </p>
                <p className="text-slate-300 text-xs leading-relaxed">
                  ②
                  <span className="inline-flex items-center gap-0.5 mx-1 align-middle">
                    <Plus size={12} className="text-sky-400" strokeWidth={2.5} />
                    <span className="text-sky-400 font-medium">ホーム画面に追加</span>
                  </span>
                  を選択
                </p>
              </div>
            ) : (
              /* その他: 汎用メッセージ */
              <p className="text-slate-300 text-xs mt-1 leading-relaxed">
                アプリとして使うとより快適になります
              </p>
            )}
          </div>

          {/* 閉じるボタン */}
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-700 active:bg-slate-700 transition-colors -mt-0.5 -mr-1"
            aria-label="閉じる"
          >
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}
