/**
 * lib/alternatives.ts
 * ====================
 * 契約中のサブスクリストから代替提案を生成するロジック。
 *
 * 方針:
 * - 外部APIは使わない（ルールベース）
 * - 断定的な表現は使わない
 * - 「絶対に安い」「必ず解約すべき」とは言わない
 * - 提案はあくまで「比較候補」として提示する
 */

import { getServiceById } from '@/lib/serviceDb';
import type {
  Subscription,
  AlternativeSuggestion,
  AlternativeOption,
  DowngradeOption,
  ServiceTemplate,
} from '@/types';

// ================================================================
// メイン関数
// ================================================================

/**
 * 契約中のサブスクリストから代替提案を生成する。
 *
 * @param subscriptions - useSubscriptions から取得したサブスクリスト
 * @param maxResults    - 最大提案件数（デフォルト: 10）
 * @returns AlternativeSuggestion[] - 提案リスト
 *
 * @example
 * const suggestions = generateAlternatives(subscriptions);
 * // → [{ subscription: netflix, alternatives: [amazon-prime, unext], ... }]
 */
export function generateAlternatives(
  subscriptions: Subscription[],
  maxResults = 10,
): AlternativeSuggestion[] {
  const results: AlternativeSuggestion[] = [];

  for (const subscription of subscriptions) {
    if (results.length >= maxResults) break;

    // serviceId がないサブスク（手動登録）はスキップ
    if (!subscription.serviceId) continue;

    // サービスDBから取得
    const service = getServiceById(subscription.serviceId);
    if (!service) continue;

    // 提案を出す条件チェック
    const hasAlternatives  = (service.alternativeIds?.length ?? 0) > 0;
    const hasDowngrades    = (service.downgradeOptions?.length ?? 0) > 0;
    const hasBundleWarnings = (service.bundleWarnings?.length ?? 0) > 0;
    const hasWeaknesses    = (service.weaknesses?.length ?? 0) > 0;

    // 1つも条件がなければスキップ
    if (!hasAlternatives && !hasDowngrades && !hasBundleWarnings && !hasWeaknesses) {
      continue;
    }

    // ── 代替候補を構築 ─────────────────────────────────────────
    const alternatives: AlternativeOption[] = buildAlternatives(
      subscription,
      service,
    );

    // ── ダウングレード候補を構築 ──────────────────────────────
    const downgradeOptions: DowngradeOption[] = buildDowngradeOptions(
      subscription,
      service,
    );

    results.push({
      subscription,
      reasonsToKeep:        service.strengths       ?? [],
      reasonsToReconsider:  service.weaknesses      ?? [],
      alternatives,
      downgradeOptions,
      bundleWarnings:       service.bundleWarnings  ?? [],
    });
  }

  return results;
}

// ================================================================
// 内部ヘルパー
// ================================================================

/**
 * alternativeIds から代替候補の AlternativeOption[] を生成する。
 * 節約額はマイナスにならないよう 0 以上に補正する。
 */
function buildAlternatives(
  subscription: Subscription,
  service: ServiceTemplate,
): AlternativeOption[] {
  if (!service.alternativeIds || service.alternativeIds.length === 0) {
    return [];
  }

  return service.alternativeIds
    .map((id) => getServiceById(id))
    .filter((alt): alt is ServiceTemplate => alt !== undefined)
    .map((alt) => ({
      service: alt,
      estimatedMonthlySaving: calcSaving(
        subscription.amountMonthly,
        alt.defaultAmountMonthly,
      ),
    }));
}

/**
 * downgradeOptions から下位プラン候補の DowngradeOption[] を生成する。
 */
function buildDowngradeOptions(
  subscription: Subscription,
  service: ServiceTemplate,
): DowngradeOption[] {
  if (!service.downgradeOptions || service.downgradeOptions.length === 0) {
    return [];
  }

  return service.downgradeOptions
    .map((id) => getServiceById(id))
    .filter((s): s is ServiceTemplate => s !== undefined)
    .map((s) => ({
      service: s,
      planName: s.name,
      estimatedMonthlySaving: calcSaving(
        subscription.amountMonthly,
        s.defaultAmountMonthly,
      ),
    }));
}

/**
 * 節約額を計算する。
 * マイナスになる場合（代替が高い場合）は 0 を返す。
 * 金額が不明（undefined）の場合も 0 を返す。
 */
function calcSaving(
  currentMonthly: number,
  alternativeMonthly: number | undefined,
): number {
  if (alternativeMonthly === undefined) return 0;
  return Math.max(0, currentMonthly - alternativeMonthly);
}
