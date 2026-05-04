/**
 * lib/savings.ts
 * ==============
 * 節約候補の検出とダッシュボード集計ロジック。
 *
 * 設計方針:
 * - すべて純粋関数（引数が同じなら同じ値を返す。副作用なし）
 * - dismissed 状態は引数で受け取る（localStorage の読み書きはここではしない）
 * - 重複検出・未使用検出はそれぞれ独立した関数として実装
 *
 * 重複検出の優先度:
 * 1. duplicateGroupId がある場合 → グループ単位で検出（より精密）
 * 2. duplicateGroupId がない場合 → category 単位で検出（フォールバック）
 *
 * 未使用スコアの考え方（0〜100）:
 * - 30以上で候補として表示
 * - 60以上で強調表示（将来のUI拡張用）
 */

import type {
  Subscription,
  SavingOpportunity,
  DashboardSummary,
  UpcomingBilling,
  UnusedReason,
  Category,
} from '@/types';
import {
  SKIP_DUPLICATE_DETECTION_CATEGORIES,
  UNUSED_THRESHOLDS,
  CATEGORY_LABELS,
  UNUSED_REASON_LABELS,
} from '@/types';
import {
  calcDaysUntil,
  isWithinDays,
  formatCurrency,
} from '@/lib/billing';
import { getServiceById } from '@/lib/serviceDb';

// ================================================================
// 定数
// ================================================================

/**
 * 未使用リスクが高いカテゴリ。
 * このカテゴリは確認のしきい値を 90日 → 60日 に短縮する。
 * ジム・学習系は「幽霊会員」問題が特に多い。
 */
const HIGH_RISK_UNUSED_CATEGORIES: Category[] = [
  'gym',       // ジム（幽霊部員問題）
  'education', // 学習・語学（積ん読問題）
  'book',      // 電子書籍（購入したが読まない）
  'news',      // ニュース（情報疲れで読まなくなる）
  'software',  // ソフトウェア（使い始めたが定着しない）
];

/** 未使用候補として表示するスコアの最小値 */
const UNUSED_SCORE_THRESHOLD = 30;

// ================================================================
// 内部ヘルパー関数
// ================================================================

/**
 * サブスクの配列から、月額が最も高いものを返す。
 * 重複検出で「どれを解約候補にするか」を決めるために使う。
 */
function findMostExpensive(subs: Subscription[]): Subscription {
  return subs.reduce((max, sub) =>
    sub.amountMonthly > max.amountMonthly ? sub : max
  );
}

/**
 * サブスクの配列から、月額が最も低いものを返す。
 * 重複候補の中で「これだけ残す」を示すために使う。
 */
function findCheapest(subs: Subscription[]): Subscription {
  return subs.reduce((min, sub) =>
    sub.amountMonthly < min.amountMonthly ? sub : min
  );
}

/**
 * 重複グループからメッセージを生成する。
 *
 * 例:
 * - 2件: "Netflix スタンダードと U-NEXT が重複しています"
 * - 3件以上: "Netflix スタンダード、U-NEXT、Disney+ が重複しています"
 */
function buildDuplicateMessage(subs: Subscription[]): string {
  const names = subs.map((s) => s.name);
  if (names.length === 2) {
    return `${names[0]}と${names[1]}が重複しています`;
  }
  const last = names.pop();
  return `${names.join('、')}、${last}が重複しています`;
}

/**
 * 未使用候補のメッセージを生成する。
 */
function buildUnusedMessage(sub: Subscription, daysAgo: number): string {
  const categoryLabel = CATEGORY_LABELS[sub.category];

  if (sub.category === 'gym') {
    return `${sub.name}、最近通っていますか？${daysAgo}日以上確認されていません`;
  }
  if (sub.isFreeTrial && sub.freeTrialEndDate) {
    const daysUntilEnd = calcDaysUntil(sub.freeTrialEndDate);
    if (daysUntilEnd >= 0 && daysUntilEnd <= 14) {
      return `${sub.name}の無料期間が${daysUntilEnd}日後に終了します。使っていない場合は今すぐ解約を`;
    }
  }
  return `${sub.name}、最近使っていますか？${daysAgo}日以上確認されていません（${categoryLabel}）`;
}

/**
 * 1件のサブスクの「未使用スコア」と「理由」を計算する。
 *
 * スコアの内訳:
 * - 最終確認から経過した日数（最大40点）
 * - 高リスクカテゴリ（15点）
 * - 月額 2,000円以上（15点）
 * - 無料期間が14日以内に終了（20点）
 *
 * 合計30点以上 → 候補として表示
 * 合計60点以上 → 強調表示（将来のUI拡張用）
 */
function calcUnusedScore(sub: Subscription): {
  score: number;
  reasons: UnusedReason[];
  daysAgo: number;
} {
  let score = 0;
  const reasons: UnusedReason[] = [];

  const isHighRisk = HIGH_RISK_UNUSED_CATEGORIES.includes(sub.category);
  const threshold = isHighRisk
    ? UNUSED_THRESHOLDS.HIGH_RISK  // 60日
    : UNUSED_THRESHOLDS.DEFAULT;   // 90日

  // 最終確認日を決定する
  // lastConfirmedActive があればそれを使い、なければ登録日（createdAt）を使う
  const lastCheckDateStr = sub.lastConfirmedActive
    ?? sub.createdAt.substring(0, 10); // "2025-06-10T..." → "2025-06-10"

  // calcDaysUntil は「今日から見て何日後か」を返す
  // 過去の日付の場合は負の値になるので、絶対値を取る
  const rawDaysUntil = calcDaysUntil(lastCheckDateStr);
  const daysAgo = rawDaysUntil <= 0 ? Math.abs(rawDaysUntil) : 0;
  // daysAgo = 0 の場合は「今日以降」= 最近確認している → スコアなし

  // ─── ① 経過日数によるスコア ─────────────────────────────────

  if (daysAgo >= 180) {
    // 6ヶ月以上確認していない → 最重要シグナル
    score += 40;
    reasons.push('long_term_unconfirmed');
  } else if (daysAgo >= threshold) {
    // しきい値以上（通常90日、高リスクカテゴリ60日）
    score += 25;
    reasons.push(isHighRisk ? 'not_confirmed_60days' : 'not_confirmed_90days');
  } else if (isHighRisk && daysAgo >= 60) {
    // 高リスクカテゴリで60日以上（通常カテゴリなら対象外）
    score += 15;
    reasons.push('not_confirmed_60days');
  } else if (daysAgo >= 60) {
    // 通常カテゴリで60日以上 → 軽めのスコア（候補には入るが優先度低）
    score += 8;
  }

  // ─── ② 高リスクカテゴリによるスコア ─────────────────────────

  if (isHighRisk) {
    score += 15;
    // reasons に 'high_risk_category' を追加（まだ追加されていない場合のみ）
    // 既に days 系の reason がある場合は補足として追加する
    if (daysAgo >= 30) {
      // 登録から一定期間経ってからのみ表示（登録直後は除外）
      reasons.push('high_risk_category');
    }
  }

  // ─── ③ 高額サブスクによるスコア ─────────────────────────────
  // 月額 2,000円以上 → 「もったいない」感が強い → 優先して表示

  if (sub.amountMonthly >= 2000) {
    score += 15;
  }

  // ─── ④ 無料期間終了が近い ────────────────────────────────────
  // 無料期間が14日以内に終わる → 今すぐ解約判断が必要 → 最優先

  if (sub.isFreeTrial && sub.freeTrialEndDate) {
    const daysUntilEnd = calcDaysUntil(sub.freeTrialEndDate);
    if (daysUntilEnd >= 0 && daysUntilEnd <= 14) {
      score += 20;
    }
  }

  return { score, reasons, daysAgo };
}

// ================================================================
// detectDuplicates — 重複サブスクの検出
// ================================================================

/**
 * アクティブなサブスクの中から「重複している可能性がある」ペアを検出する。
 *
 * 検出方法:
 * Step 1: duplicateGroupId が同じサービスを先にグルーピング（精密）
 * Step 2: Step 1 で未処理のサブスクを category 単位でグルーピング（フォールバック）
 *
 * 除外カテゴリ:
 * - insurance（保険）: 複数契約が一般的
 * - utility（電気・ガス）: 電力会社と都市ガスを別々に登録するケースがある
 * - mobile（携帯オプション）: オプション複数契約が設計上あり得る
 * - other: 性質が不明なため除外
 *
 * @param subscriptions - 全サブスクのリスト（active 以外も含んでよい。内部でフィルタする）
 * @returns SavingOpportunity[] — 重複候補のリスト（dismissed は常に false で返す）
 */
export function detectDuplicates(subscriptions: Subscription[]): SavingOpportunity[] {
  const opportunities: SavingOpportunity[] = [];

  // アクティブなサブスクのみを対象にする
  const activeSubs = subscriptions.filter((s) => s.status === 'active');

  // 重複検出スキップカテゴリを除外
  const targets = activeSubs.filter(
    (s) => !SKIP_DUPLICATE_DETECTION_CATEGORIES.includes(s.category),
  );

  // 処理済みのサブスクIDを追跡（Step 2 で同じサブスクを二重に処理しないため）
  const handledIds = new Set<string>();

  // ─── Step 1: duplicateGroupId 単位でグルーピング ──────────────

  // サブスク → duplicateGroupId のマッピングを作る
  // サービスDB登録のサブスクは serviceId → ServiceTemplate → duplicateGroupId で取得
  const groupMap = new Map<string, Subscription[]>();

  for (const sub of targets) {
    // サービスID経由でグループIDを取得する
    const template = sub.serviceId ? getServiceById(sub.serviceId) : undefined;
    const groupId = template?.duplicateGroupId;

    if (groupId) {
      const existing = groupMap.get(groupId) ?? [];
      groupMap.set(groupId, [...existing, sub]);
    }
  }

  // 2件以上のグループのみ重複候補として処理する
  for (const [groupId, groupSubs] of groupMap.entries()) {
    if (groupSubs.length < 2) continue;

    // 月額が高い順にソート → 最も高いものを解約候補にする
    const sorted = [...groupSubs].sort((a, b) => b.amountMonthly - a.amountMonthly);
    const suggestedCancel = sorted[0]; // 最も高いもの

    opportunities.push({
      id: `duplicate-group-${groupId}`,
      type: 'duplicate',
      subscriptions: sorted,
      estimatedMonthlySaving: suggestedCancel.amountMonthly,
      estimatedYearlySaving: suggestedCancel.amountYearly,
      message: buildDuplicateMessage(sorted),
      suggestedCancelId: suggestedCancel.id,
      dismissed: false,
    });

    // 処理済みとしてマーク
    groupSubs.forEach((s) => handledIds.add(s.id));
  }

  // ─── Step 2: category 単位でグルーピング（フォールバック）───────

  // Step 1 で処理済みのサブスクを除いた残りをカテゴリ単位でグループ化する
  const remaining = targets.filter((s) => !handledIds.has(s.id));

  const categoryMap = new Map<Category, Subscription[]>();
  for (const sub of remaining) {
    const existing = categoryMap.get(sub.category) ?? [];
    categoryMap.set(sub.category, [...existing, sub]);
  }

  for (const [category, catSubs] of categoryMap.entries()) {
    if (catSubs.length < 2) continue;

    const sorted = [...catSubs].sort((a, b) => b.amountMonthly - a.amountMonthly);
    const suggestedCancel = sorted[0];

    opportunities.push({
      id: `duplicate-cat-${category}`,
      type: 'duplicate',
      subscriptions: sorted,
      estimatedMonthlySaving: suggestedCancel.amountMonthly,
      estimatedYearlySaving: suggestedCancel.amountYearly,
      message: buildDuplicateMessage(sorted),
      suggestedCancelId: suggestedCancel.id,
      dismissed: false,
    });
  }

  return opportunities;
}

// ================================================================
// detectUnused — 使っていない可能性があるサブスクの検出
// ================================================================

/**
 * アクティブなサブスクの中から「使っていない可能性がある」ものを検出する。
 *
 * 判定基準（スコアリング方式）:
 * - lastConfirmedActive がない、または 90日以上前（高リスクカテゴリは60日）
 * - 高リスクカテゴリ（gym, education, book, news, software）はしきい値を短縮
 * - 月額 2,000円以上は優先度アップ
 * - 無料期間終了が 14日以内 → 最優先
 *
 * 注意:
 * - 同じサブスクが複数の未使用候補に重複して出ることはない（1サブスク = 最大1候補）
 * - 重複候補と未使用候補に同一サブスクが出ることはある（それぞれ別の問題として扱う）
 *
 * @param subscriptions - 全サブスクのリスト
 * @returns SavingOpportunity[] — 未使用候補のリスト（スコア降順）
 */
export function detectUnused(subscriptions: Subscription[]): SavingOpportunity[] {
  const activeSubs = subscriptions.filter((s) => s.status === 'active');

  const candidates: Array<{
    sub: Subscription;
    score: number;
    reasons: UnusedReason[];
    daysAgo: number;
  }> = [];

  for (const sub of activeSubs) {
    const { score, reasons, daysAgo } = calcUnusedScore(sub);

    // しきい値未満はスキップ
    if (score < UNUSED_SCORE_THRESHOLD) continue;

    candidates.push({ sub, score, reasons, daysAgo });
  }

  // スコア降順でソート（優先度の高いものを先に表示）
  candidates.sort((a, b) => b.score - a.score);

  // SavingOpportunity に変換して返す
  return candidates.map(({ sub, score, reasons, daysAgo }) => ({
    id: `unused-${sub.id}`,
    type: 'unused' as const,
    subscriptions: [sub],
    estimatedMonthlySaving: sub.amountMonthly,
    estimatedYearlySaving: sub.amountYearly,
    message: buildUnusedMessage(sub, daysAgo),
    reasons,
    unusedScore: score,
    dismissed: false,
  }));
}

// ================================================================
// calcDashboardSummary — ダッシュボード集計
// ================================================================

/**
 * ダッシュボードに表示する全集計データを計算して返す。
 *
 * @param subscriptions - 全サブスクのリスト（active 以外も含んでよい）
 * @param dismissedOpportunityIds - ユーザーが「後で」にした節約候補のIDリスト
 *   （localStorageに保存された STORAGE_KEYS.DISMISSED_OPPORTUNITIES の値）
 * @returns DashboardSummary
 *
 * @example
 * // hooks/useDashboard.ts での使用例
 * const subs = await adapter.getSubscriptions();
 * const dismissed = getDismissedOpportunityIds(); // localStorage から取得
 * const summary = calcDashboardSummary(subs, dismissed);
 */
export function calcDashboardSummary(
  subscriptions: Subscription[],
  dismissedOpportunityIds: string[] = [],
): DashboardSummary {
  // アクティブなサブスクのみ集計する
  const activeSubs = subscriptions.filter((s) => s.status === 'active');

  // ─── 金額集計 ────────────────────────────────────────────────

  const totalMonthly = activeSubs.reduce((sum, s) => sum + s.amountMonthly, 0);
  const totalYearly  = activeSubs.reduce((sum, s) => sum + s.amountYearly,  0);

  // ─── 節約候補の検出 ─────────────────────────────────────────

  const duplicateOpportunities = detectDuplicates(activeSubs);
  const unusedOpportunities    = detectUnused(activeSubs);

  // 全候補をまとめて dismissed フラグを反映する
  const dismissedSet = new Set(dismissedOpportunityIds);

  const allOpportunities: SavingOpportunity[] = [
    ...duplicateOpportunities,
    ...unusedOpportunities,
  ].map((op) => ({
    ...op,
    dismissed: dismissedSet.has(op.id),
  }));

  // dismissed でないものだけを「表示する節約候補」とする
  const visibleOpportunities = allOpportunities.filter((op) => !op.dismissed);

  // ─── 節約合計額の計算 ─────────────────────────────────────

  // 同一サブスクが重複候補と未使用候補の両方に出る場合、
  // 節約額の二重計算を防ぐために subscription ID で重複排除する
  const countedSubIds = new Set<string>();
  let totalPotentialMonthlySaving = 0;
  let totalPotentialYearlySaving  = 0;

  for (const op of visibleOpportunities) {
    // 節約額の対象となるサブスクのIDを特定する
    // 重複候補 → suggestedCancelId のサブスク（1件）
    // 未使用候補 → そのサブスク自体（1件）
    const targetSub =
      op.type === 'duplicate' && op.suggestedCancelId
        ? op.subscriptions.find((s) => s.id === op.suggestedCancelId)
        : op.subscriptions[0];

    if (!targetSub) continue;

    // 既に計上済みのサブスクは除外（二重計算防止）
    if (countedSubIds.has(targetSub.id)) continue;
    countedSubIds.add(targetSub.id);

    totalPotentialMonthlySaving += targetSub.amountMonthly;
    totalPotentialYearlySaving  += targetSub.amountYearly;
  }

  // ─── 直近14日以内の請求 ─────────────────────────────────────

  const upcomingBillings: UpcomingBilling[] = activeSubs
    .filter((s) => isWithinDays(s.nextBillingDate, 14))
    .map((s) => {
      const daysUntil = calcDaysUntil(s.nextBillingDate);
      return {
        subscription: s,
        daysUntil,
        isUrgent:  daysUntil <= 7,
        isWarning: daysUntil <= 14,
      };
    })
    .sort((a, b) => a.daysUntil - b.daysUntil); // 近い順

  // 無料期間が14日以内に終了するサブスクも upcoming に含める
  // （ただし nextBillingDate でまだ含まれていないものだけ追加）
  const upcomingSubIds = new Set(upcomingBillings.map((u) => u.subscription.id));

  for (const sub of activeSubs) {
    if (upcomingSubIds.has(sub.id)) continue;
    if (!sub.isFreeTrial || !sub.freeTrialEndDate) continue;
    if (!isWithinDays(sub.freeTrialEndDate, 14)) continue;

    const daysUntil = calcDaysUntil(sub.freeTrialEndDate);
    upcomingBillings.push({
      subscription: sub,
      daysUntil,
      isUrgent:  daysUntil <= 3,  // 無料期間は3日以内を urgent にする
      isWarning: daysUntil <= 7,
    });
  }

  // 再ソート（無料期間終了を追加したので）
  upcomingBillings.sort((a, b) => a.daysUntil - b.daysUntil);

  return {
    totalMonthly,
    totalYearly,
    subscriptionCount: activeSubs.length,
    savingOpportunities: allOpportunities, // dismissed を含む全候補（UIでフィルタする）
    totalPotentialMonthlySaving,
    totalPotentialYearlySaving,
    upcomingBillings,
  };
}

// ================================================================
// dismiss 管理のヘルパー（storage には触らず、IDリストだけ操作する）
// ================================================================

/**
 * 節約候補を「後で確認」にする（dismissedOpportunityIds に追加する）。
 * この関数はIDリストの操作のみ行う。
 * localStorage への保存は呼び出し元（hooks）で行う。
 *
 * @param currentDismissed - 現在の dismissed ID リスト
 * @param opportunityId - dismiss する節約候補の ID
 * @returns 更新後の dismissed ID リスト
 */
export function addDismissed(
  currentDismissed: string[],
  opportunityId: string,
): string[] {
  if (currentDismissed.includes(opportunityId)) return currentDismissed;
  return [...currentDismissed, opportunityId];
}

/**
 * 「後で確認」を解除する（dismissedOpportunityIds から削除する）。
 *
 * @param currentDismissed - 現在の dismissed ID リスト
 * @param opportunityId - 解除する節約候補の ID
 * @returns 更新後の dismissed ID リスト
 */
export function removeDismissed(
  currentDismissed: string[],
  opportunityId: string,
): string[] {
  return currentDismissed.filter((id) => id !== opportunityId);
}
