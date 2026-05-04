/**
 * lib/serviceDb.ts
 * ================
 * サービスDB（data/services.ts）に対するクエリ関数群。
 *
 * 設計方針:
 * - すべて純粋関数（引数が同じなら同じ値を返す。副作用なし）
 * - data/services.ts の SERVICES 配列を読み取るだけで、変更は行わない
 * - 将来 Supabase に移行する際はこのファイルの実装だけ差し替えればよい
 *   （呼び出し側のコードは変更不要）
 *
 * 日本語検索の実装方針（MVP）:
 * - name・nameKana のインクリメンタル部分一致で検索
 * - カテゴリラベル（日本語）でも絞り込み可能
 * - 全角・半角の統一は MVP では省略（Phase 2 で必要なら追加）
 */

import { SERVICES } from '@/data/services';
import {
  CATEGORIES,
  CATEGORY_LABELS,
  CATEGORY_EMOJIS,
  SKIP_DUPLICATE_DETECTION_CATEGORIES,
} from '@/types';
import type { Category, ServiceTemplate } from '@/types';

// ================================================================
// カテゴリ関連
// ================================================================

/**
 * 全カテゴリの配列を返す。
 * サービス追加画面のカテゴリ選択UI（一覧表示）で使う。
 *
 * @returns Category[] — CATEGORIES 定数と同じ順序で返す
 *
 * @example
 * const categories = getCategories();
 * // → ['video', 'music', 'book', ...]
 */
export function getCategories(): Category[] {
  // CATEGORIES は readonly なので Array.from でコピーして返す
  return Array.from(CATEGORIES);
}

/**
 * カテゴリの日本語ラベルを返す。
 *
 * @param category - カテゴリ
 * @returns string — 日本語ラベル
 *
 * @example
 * getCategoryLabel('video')     // → '動画・映像'
 * getCategoryLabel('ai')        // → 'AI・生成AI'
 * getCategoryLabel('education') // → '学習・語学'
 */
export function getCategoryLabel(category: Category): string {
  return CATEGORY_LABELS[category];
}

/**
 * カテゴリの絵文字アイコンを返す。
 * サービスアイコン（iconUrl）が取得できない場合のフォールバックとして使う。
 *
 * @param category - カテゴリ
 * @returns string — 絵文字
 *
 * @example
 * getCategoryEmoji('video')     // → '🎬'
 * getCategoryEmoji('gym')       // → '🏋️'
 */
export function getCategoryEmoji(category: Category): string {
  return CATEGORY_EMOJIS[category];
}

/**
 * 重複検出の対象となるカテゴリかどうかを返す。
 * 保険・公共料金・携帯オプションは複数契約が一般的なので重複扱いしない。
 *
 * @param category - カテゴリ
 * @returns boolean — true: 重複検出対象, false: スキップ
 *
 * @example
 * isDuplicateDetectionTarget('video')     // → true
 * isDuplicateDetectionTarget('insurance') // → false
 */
export function isDuplicateDetectionTarget(category: Category): boolean {
  return !SKIP_DUPLICATE_DETECTION_CATEGORIES.includes(category);
}

// ================================================================
// サービス取得
// ================================================================

/**
 * 全サービスを返す。
 * デバッグやテスト用途。通常は getServicesByCategory() を使う。
 *
 * @returns ServiceTemplate[] — SERVICES 配列のコピー
 */
export function getAllServices(): ServiceTemplate[] {
  return [...SERVICES];
}

/**
 * 指定したカテゴリに属するサービス一覧を返す。
 * サービス追加画面でカテゴリを選んだ後の一覧表示に使う。
 *
 * @param category - 絞り込むカテゴリ
 * @returns ServiceTemplate[] — 該当サービスの配列（元の定義順）
 *
 * @example
 * getServicesByCategory('video')
 * // → [Netflix, U-NEXT, Disney+, Hulu, ...]
 *
 * getServicesByCategory('ai')
 * // → [ChatGPT Plus, Claude Pro, Gemini Advanced, Copilot Pro]
 */
export function getServicesByCategory(category: Category): ServiceTemplate[] {
  return SERVICES.filter((s) => s.category === category);
}

/**
 * サービスIDでサービスを1件取得する。
 * 解約ガイド画面（/cancel/[serviceId]）でサービス情報を取得するときに使う。
 *
 * @param id - サービスID（ServiceTemplate.id）
 * @returns ServiceTemplate | undefined — 見つからない場合は undefined
 *
 * @example
 * getServiceById('netflix-standard')
 * // → { id: 'netflix-standard', name: 'Netflix スタンダード', ... }
 *
 * getServiceById('not-exist')
 * // → undefined
 */
export function getServiceById(id: string): ServiceTemplate | undefined {
  return SERVICES.find((s) => s.id === id);
}

/**
 * 重複グループIDでサービス一覧を取得する。
 * 同じグループに属するサービスが「重複候補」として扱われる。
 *
 * @param duplicateGroupId - 重複グループID
 * @returns ServiceTemplate[] — 該当サービスの配列
 *
 * @example
 * getServicesByDuplicateGroup('video_svod_jp')
 * // → [Netflix, U-NEXT, Disney+, Hulu, Amazon Prime Video, ABEMA]
 */
export function getServicesByDuplicateGroup(
  duplicateGroupId: string,
): ServiceTemplate[] {
  return SERVICES.filter((s) => s.duplicateGroupId === duplicateGroupId);
}

// ================================================================
// 検索
// ================================================================

/**
 * キーワードでサービスを検索する。
 * サービス追加画面の検索ボックスで使う。
 *
 * 検索対象:
 * 1. サービス名（name）— 部分一致
 * 2. よみがな（nameKana）— 部分一致（ひらがな入力対応）
 * 3. カテゴリの日本語ラベル（例: "動画"でNetflixが出る）— 部分一致
 *
 * 検索の仕様:
 * - 大文字・小文字を区別しない（toLocaleLowerCase）
 * - クエリが空文字の場合は空配列を返す（全件表示はgetAllServices()を使う）
 * - クエリの前後の空白はトリムする
 *
 * MVPで省略している検索機能:
 * - 全角・半角の統一（"Ｎｅｔｆｌｉｘ" → "Netflix" の正規化）
 * - 曖昧検索（typoの許容）
 * → Phase 2 で必要なら追加する
 *
 * @param query - 検索キーワード
 * @returns ServiceTemplate[] — マッチしたサービスの配列（重複なし、元の定義順）
 *
 * @example
 * searchServices('netflix')  // → [Netflix スタンダード]
 * searchServices('ね')       // → [Netflix スタンダード]（nameKanaの"ねっとふりっくす"にマッチ）
 * searchServices('動画')     // → [Netflix, U-NEXT, Disney+, ...]（カテゴリラベルにマッチ）
 * searchServices('ai')       // → [ChatGPT Plus, Claude Pro, ...]（カテゴリにマッチ）
 * searchServices('')         // → []（空クエリは空配列）
 * searchServices('   ')      // → []（空白のみも空配列）
 */
export function searchServices(query: string): ServiceTemplate[] {
  const trimmed = query.trim();

  // 空クエリは空配列を返す
  if (!trimmed) return [];

  // 比較用に小文字化（英字の大文字小文字を無視するため）
  const q = trimmed.toLocaleLowerCase();

  return SERVICES.filter((service) => {
    // ① サービス名での部分一致（大文字小文字無視）
    if (service.name.toLocaleLowerCase().includes(q)) {
      return true;
    }

    // ② よみがなでの部分一致（ひらがな入力）
    if (service.nameKana?.includes(q)) {
      return true;
    }

    // ③ カテゴリの日本語ラベルでの部分一致
    // 例: "動画" と入力すると category='video' の全サービスが出る
    const categoryLabel = CATEGORY_LABELS[service.category];
    if (categoryLabel.includes(q)) {
      return true;
    }

    return false;
  });
}

// ================================================================
// 集計・統計（UIの「サービスを選ぶ」タブで使う）
// ================================================================

/**
 * カテゴリごとのサービス件数をまとめたMapを返す。
 * カテゴリ選択UIで「動画 6件」のように件数を表示するときに使う。
 *
 * @returns Map<Category, number> — カテゴリ → 件数
 *
 * @example
 * const counts = getServiceCountByCategory();
 * counts.get('video')  // → 6
 * counts.get('music')  // → 4
 * counts.get('other')  // → 0（該当サービスなし）
 */
export function getServiceCountByCategory(): Map<Category, number> {
  const map = new Map<Category, number>();

  // 全カテゴリを 0件で初期化（件数0のカテゴリも表示できるように）
  for (const cat of CATEGORIES) {
    map.set(cat, 0);
  }

  // 各サービスのカテゴリをカウント
  for (const service of SERVICES) {
    const current = map.get(service.category) ?? 0;
    map.set(service.category, current + 1);
  }

  return map;
}

/**
 * サービスが登録されているカテゴリのみを返す（件数0のカテゴリを除外）。
 * カテゴリ選択UIで「このカテゴリにはサービスがありません」を出さないために使う。
 *
 * @returns Category[] — 1件以上のサービスがあるカテゴリの配列
 *
 * @example
 * getPopulatedCategories()
 * // → ['video', 'music', 'book', 'cloud', 'software', 'ai', 'gym', 'education', 'news']
 * // （SERVICES に登録されているカテゴリのみ）
 */
export function getPopulatedCategories(): Category[] {
  const counts = getServiceCountByCategory();
  return Array.from(CATEGORIES).filter((cat) => (counts.get(cat) ?? 0) > 0);
}

// ================================================================
// 解約ガイド関連
// ================================================================

/**
 * 解約URLを持つサービスかどうかを返す。
 * 解約ガイド画面で「解約ページを開く」ボタンを表示するかどうかの判定に使う。
 *
 * @param service - サービス情報
 * @returns boolean — true: 解約URLあり, false: URLなし（店舗解約など）
 *
 * @example
 * hasCancellationUrl(getServiceById('netflix-standard')!)  // → true
 * hasCancellationUrl(getServiceById('anytime-fitness')!)   // → false（店舗解約）
 */
export function hasCancellationUrl(service: ServiceTemplate): boolean {
  return !!service.cancellationUrl;
}

/**
 * 解約難易度のラベルと色クラスを返す。
 * 解約ガイド画面のバッジ表示に使う。
 *
 * @param difficulty - 解約難易度
 * @returns { label: string; colorClass: string }
 *
 * @example
 * getCancellationDifficultyInfo('easy')
 * // → { label: '解約かんたん', colorClass: 'text-green-600 bg-green-50' }
 *
 * getCancellationDifficultyInfo('hard')
 * // → { label: '解約しにくい', colorClass: 'text-red-600 bg-red-50' }
 */
export function getCancellationDifficultyInfo(
  difficulty: ServiceTemplate['cancellationDifficulty'],
): { label: string; colorClass: string } {
  switch (difficulty) {
    case 'easy':
      return { label: '解約かんたん', colorClass: 'text-green-600 bg-green-50' };
    case 'medium':
      return { label: '手順あり', colorClass: 'text-yellow-600 bg-yellow-50' };
    case 'hard':
      return { label: '解約しにくい', colorClass: 'text-red-600 bg-red-50' };
    default:
      return { label: '要確認', colorClass: 'text-gray-600 bg-gray-50' };
  }
}
