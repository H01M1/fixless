/**
 * lib/serviceDb.ts
 * ================
 * サービスDB（data/services.ts）に対するクエリ関数群。
 *
 * v2.1 追加:
 * - getAppStoreLikelyServices(): スクショ追加機能の候補リスト用
 * - 既存の全関数は変更なし
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
// カテゴリ関連（変更なし）
// ================================================================

export function getCategories(): Category[] {
  return Array.from(CATEGORIES);
}

export function getCategoryLabel(category: Category): string {
  return CATEGORY_LABELS[category];
}

export function getCategoryEmoji(category: Category): string {
  return CATEGORY_EMOJIS[category];
}

export function isDuplicateDetectionTarget(category: Category): boolean {
  return !SKIP_DUPLICATE_DETECTION_CATEGORIES.includes(category);
}

// ================================================================
// サービス取得（変更なし）
// ================================================================

export function getAllServices(): ServiceTemplate[] {
  return [...SERVICES];
}

export function getServicesByCategory(category: Category): ServiceTemplate[] {
  return SERVICES.filter((s) => s.category === category);
}

export function getServiceById(id: string): ServiceTemplate | undefined {
  return SERVICES.find((s) => s.id === id);
}

export function getServicesByDuplicateGroup(
  duplicateGroupId: string,
): ServiceTemplate[] {
  return SERVICES.filter((s) => s.duplicateGroupId === duplicateGroupId);
}

// ================================================================
// 検索（変更なし）
// ================================================================

export function searchServices(query: string): ServiceTemplate[] {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const q = trimmed.toLocaleLowerCase();

  return SERVICES.filter((service) => {
    if (service.name.toLocaleLowerCase().includes(q)) return true;
    if (service.nameKana?.includes(q)) return true;
    const categoryLabel = CATEGORY_LABELS[service.category];
    if (categoryLabel.includes(q)) return true;

    // プラン名でも検索できるようにする（v2.1 追加）
    if (service.plans?.some((p) => p.planName.toLocaleLowerCase().includes(q))) return true;

    return false;
  });
}

// ================================================================
// 集計（変更なし）
// ================================================================

export function getServiceCountByCategory(): Map<Category, number> {
  const map = new Map<Category, number>();
  for (const cat of CATEGORIES) {
    map.set(cat, 0);
  }
  for (const service of SERVICES) {
    const current = map.get(service.category) ?? 0;
    map.set(service.category, current + 1);
  }
  return map;
}

export function getPopulatedCategories(): Category[] {
  const counts = getServiceCountByCategory();
  return Array.from(CATEGORIES).filter((cat) => (counts.get(cat) ?? 0) > 0);
}

// ================================================================
// 解約ガイド関連（変更なし）
// ================================================================

export function hasCancellationUrl(service: ServiceTemplate): boolean {
  return !!service.cancellationUrl;
}

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

// ================================================================
// [v2.1 新規追加] スクショ追加機能用
// ================================================================

/**
 * iPhoneの「設定 → Apple ID → サブスクリプション」に
 * 出やすいサービスの一覧を返す。
 *
 * スクショから追加タブの候補グリッドで使う。
 * appStoreLikely: true のサービスのみを返す。
 *
 * @returns ServiceTemplate[] — App Store 経由で課金されやすいサービス
 *
 * @example
 * const candidates = getAppStoreLikelyServices();
 * // → [Netflix, Disney+, Hulu, Spotify, Apple Music, ...]
 */
export function getAppStoreLikelyServices(): ServiceTemplate[] {
  return SERVICES.filter((s) => s.appStoreLikely === true);
}

/**
 * スクショ追加機能の候補をキーワードで絞り込む。
 * searchServices() と同じロジックだが、appStoreLikely: true のみを対象にする。
 *
 * @param query - 検索キーワード（空文字の場合は全件返す）
 * @returns ServiceTemplate[] — マッチしたサービス
 */
export function searchAppStoreLikelyServices(query: string): ServiceTemplate[] {
  const candidates = getAppStoreLikelyServices();
  const trimmed = query.trim();
  if (!trimmed) return candidates;

  const q = trimmed.toLocaleLowerCase();

  return candidates.filter((service) => {
    if (service.name.toLocaleLowerCase().includes(q)) return true;
    if (service.nameKana?.includes(q)) return true;
    const categoryLabel = CATEGORY_LABELS[service.category];
    if (categoryLabel.includes(q)) return true;
    if (service.plans?.some((p) => p.planName.toLocaleLowerCase().includes(q))) return true;
    return false;
  });
}
