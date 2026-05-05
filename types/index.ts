/**
 * types/index.ts
 * ==============
 * アプリ全体で使う型・定数の定義ファイル。
 *
 * v2.1 変更点（後方互換性あり）:
 * - ServicePlan        を追加（プラン選択機能用）
 * - PendingSubscription を追加（スクショから一括追加機能用）
 * - ServiceTemplate に plans?, provider?, appStoreLikely? を追加（任意項目のみ）
 * - Subscription 型は変更なし（localStorage の既存データを保護）
 */

// ================================================================
// カテゴリ
// ================================================================

export const CATEGORIES = [
  'video',
  'music',
  'book',
  'cloud',
  'software',
  'ai',
  'mobile',
  'gym',
  'insurance',
  'utility',
  'food',
  'news',
  'education',
  'other',
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_LABELS: Record<Category, string> = {
  video:     '動画・映像',
  music:     '音楽',
  book:      '電子書籍・マンガ',
  cloud:     'クラウドストレージ',
  software:  'ソフトウェア・ツール',
  ai:        'AI・生成AI',
  mobile:    '携帯・通信オプション',
  gym:       'ジム・フィットネス',
  insurance: '保険',
  utility:   '電気・ガス・水道',
  food:      'フード・ミールキット',
  news:      'ニュース・情報',
  education: '学習・語学',
  other:     'その他',
};

export const CATEGORY_EMOJIS: Record<Category, string> = {
  video:     '🎬',
  music:     '🎵',
  book:      '📚',
  cloud:     '☁️',
  software:  '💻',
  ai:        '🤖',
  mobile:    '📱',
  gym:       '🏋️',
  insurance: '🛡️',
  utility:   '⚡',
  food:      '🍱',
  news:      '📰',
  education: '🎓',
  other:     '📦',
};

// ================================================================
// 請求サイクル
// ================================================================

export const BILLING_CYCLES = [
  'monthly',
  'yearly',
  'weekly',
  'quarterly',
] as const;

export type BillingCycle = (typeof BILLING_CYCLES)[number];

export const BILLING_CYCLE_LABELS: Record<BillingCycle, string> = {
  monthly:   '月額',
  yearly:    '年額',
  weekly:    '週額',
  quarterly: '四半期払い',
};

// ================================================================
// サブスクの状態
// ================================================================

export type SubscriptionStatus = 'active' | 'cancelled' | 'paused';

// ================================================================
// 解約難易度
// ================================================================

export type CancellationDifficulty = 'easy' | 'medium' | 'hard';

// ================================================================
// [v2.1 新規追加] サービスのプラン
// ================================================================

/**
 * 1つのサービスが持つプラン情報。
 *
 * 例（Netflix）:
 *   { planId: 'standard', planName: 'スタンダード', defaultAmountMonthly: 1590, ... }
 *
 * ServiceTemplate.plans に配列で持たせる。
 * plans が undefined のサービスは従来通りモーダルが直接開く（後方互換性あり）。
 */
export interface ServicePlan {
  /** プランの一意ID。サービスID内でユニークであればよい。例: 'standard' / 'max-5x' */
  planId: string;

  /** プラン名（UI表示用）。例: 'スタンダード' / 'Max ×5' */
  planName: string;

  /** 月額目安（円・税込）。*/
  defaultAmountMonthly: number;

  /** 請求サイクル。*/
  defaultBillingCycle: BillingCycle;

  /**
   * プランの補足説明。UI でサブテキストとして表示する。
   * 例: '広告あり・FHD画質' / 'Claude の利用量が Pro の5倍'
   */
  description?: string;

  /**
   * true の場合、金額は目安であることを UI に表示する。
   * 料金が変動しやすいサービス（Adobe など）に使う。
   */
  isAmountEstimate?: boolean;
}

// ================================================================
// サービスDB（プリセット）
// ================================================================

/**
 * アプリに事前に登録してある日本のサービス情報。
 *
 * v2.1 追加フィールド（すべて任意 = 既存サービスに影響なし）:
 *   provider?       サービス提供会社
 *   plans?          プラン一覧（あるとプラン選択UIが出る）
 *   appStoreLikely? iOSサブスク一覧に出やすいか（スクショ追加機能で使う）
 */
export interface ServiceTemplate {
  id: string;
  name: string;
  nameKana?: string;
  category: Category;
  iconUrl?: string;
  defaultAmountMonthly?: number;
  defaultBillingCycle: BillingCycle;
  cancellationUrl?: string;
  cancellationSteps?: string;
  cancellationNotes?: string;
  cancellationDifficulty?: CancellationDifficulty;
  duplicateGroupId?: string;
   aliases?: string[];

  // ── v2.1 追加（任意項目） ──────────────────────────────────────

  /**
   * サービス提供会社。
   * 例: 'Netflix' / 'Anthropic' / 'Apple'
   * 重複検出・バンドル検出の将来対応で使う予定。
   */
  provider?: string;

  /**
   * プラン一覧。
   * 設定すると /add でプラン選択ステップが表示される。
   * 未設定（undefined）のサービスは従来通りモーダルが直接開く。
   */
  plans?: ServicePlan[];

  /**
   * iPhoneの「設定 → Apple ID → サブスクリプション」に出やすいか。
   * スクショから追加機能の候補リストで使う。
   * App Store 経由で課金されるサービスに true を付ける。
   */
  appStoreLikely?: boolean;
  alternativeIds?: string[];
  strengths?: string[];
  weaknesses?: string[];
  bestFor?: string[];
  notBestFor?: string[];
  downgradeOptions?: string[];
  bundleWarnings?: string[];
}

// ================================================================
// ユーザーが登録したサブスク
// ================================================================

/**
 * ユーザーが登録した1件のサブスク・固定費データ。
 *
 * ⚠️ v2.1 では変更なし。localStorage の既存データを保護するため。
 *    planId などを追加したくなるが、name に "Netflix スタンダード" と
 *    入れることで情報の粒度は十分に保てる。
 */
export interface Subscription {
  id: string;
  userId?: string;
  serviceId?: string;
  name: string;
  category: Category;
  iconUrl?: string;
  amount: number;
  billingCycle: BillingCycle;
  amountMonthly: number;
  amountYearly: number;
  billingStartDate: string;
  nextBillingDate: string;
  status: SubscriptionStatus;
  isFreeTrial: boolean;
  freeTrialEndDate?: string;
  lastConfirmedActive?: string;
  memo?: string;
  createdAt: string;
  updatedAt: string;
}

// ================================================================
// フォーム入力型
// ================================================================

export type SubscriptionInput = Omit<
  Subscription,
  | 'id'
  | 'userId'
  | 'amountMonthly'
  | 'amountYearly'
  | 'nextBillingDate'
  | 'status'
  | 'createdAt'
  | 'updatedAt'
>;

export type SubscriptionUpdateInput = Partial<
  Omit<Subscription, 'id' | 'userId' | 'createdAt'>
>;

// ================================================================
// [v2.1 新規追加] スクショから一括追加で使う「追加予定」アイテム
// ================================================================

/**
 * ScreenshotImport でユーザーが選択し、追加前に編集できるアイテム。
 * addSubscription を呼ぶ前の一時的な状態管理に使う。
 *
 * amount を string で持つ理由:
 *   input[type="number"] の value は string で管理するのが React のベストプラクティス。
 *   空文字 '' → バリデーションエラー、数値文字列 '1590' → parseInt で変換。
 */
export interface PendingSubscription {
  /** BulkAddList の React key に使う一時ID（localStorage には保存しない） */
  tempId: string;

  /** 選択したサービスのテンプレート */
  service: ServiceTemplate;

  /** 選択したプラン（プランありサービスの場合のみ設定） */
  selectedPlan?: ServicePlan;

  /** ユーザーが入力中の金額（文字列。addSubscription 時に parseInt する） */
  amount: string;

  /** 請求サイクル */
  billingCycle: BillingCycle;

  /** 初回請求日（YYYY-MM-DD） */
  billingStartDate: string;

  /**
   * 金額が確定しているか。
   * false = 金額未入力 → UI でエラー表示・まとめて追加ボタンを無効化。
   * defaultAmountMonthly がある場合は最初から true。
   */
  isAmountConfirmed: boolean;
}

// ================================================================
// 代替サブスク提案
// ================================================================

export interface AlternativeOption {
  service: ServiceTemplate;
  estimatedMonthlySaving: number;
}

export interface DowngradeOption {
  service: ServiceTemplate;
  planName: string;
  estimatedMonthlySaving: number;
}

export interface AlternativeSuggestion {
  subscription: Subscription;
  reasonsToKeep: string[];
  reasonsToReconsider: string[];
  alternatives: AlternativeOption[];
  downgradeOptions: DowngradeOption[];
  bundleWarnings: string[];
}

// ================================================================
// 節約候補
// ================================================================

export type SavingType = 'duplicate' | 'unused';

export type UnusedReason =
  | 'not_confirmed_90days'
  | 'not_confirmed_60days'
  | 'high_risk_category'
  | 'long_term_unconfirmed';

export const UNUSED_REASON_LABELS: Record<UnusedReason, string> = {
  not_confirmed_90days:  '90日以上確認されていません',
  not_confirmed_60days:  '60日以上確認されていません',
  high_risk_category:    '使われなくなりやすいカテゴリです',
  long_term_unconfirmed: '登録以来、使用確認をしていません',
};

export interface SavingOpportunity {
  id: string;
  type: SavingType;
  subscriptions: Subscription[];
  estimatedMonthlySaving: number;
  estimatedYearlySaving: number;
  message: string;
  suggestedCancelId?: string;
  reasons?: UnusedReason[];
  unusedScore?: number;
  dismissed: boolean;
}

// ================================================================
// ダッシュボード集計
// ================================================================

export interface UpcomingBilling {
  subscription: Subscription;
  daysUntil: number;
  isUrgent: boolean;
  isWarning: boolean;
}

export interface DashboardSummary {
  totalMonthly: number;
  totalYearly: number;
  subscriptionCount: number;
  savingOpportunities: SavingOpportunity[];
  totalPotentialMonthlySaving: number;
  totalPotentialYearlySaving: number;
  upcomingBillings: UpcomingBilling[];
}

// ================================================================
// StorageAdapter インターフェース
// ================================================================

export interface StorageAdapter {
  getSubscriptions(): Promise<Subscription[]>;
  getAllSubscriptions(): Promise<Subscription[]>;
  addSubscription(input: SubscriptionInput): Promise<Subscription>;
  updateSubscription(id: string, data: SubscriptionUpdateInput): Promise<Subscription | null>;
  deleteSubscription(id: string): Promise<void>;
}

// ================================================================
// Feature Flag
// ================================================================

export const FEATURE_FLAGS = {
  UNLIMITED_SUBSCRIPTIONS: 'unlimited_subscriptions',
  CSV_EXPORT: 'csv_export',
  DETAILED_REPORTS: 'detailed_reports',
  CUSTOM_NOTIFICATIONS: 'custom_notifications',
  CLOUD_SYNC: 'cloud_sync',
} as const;

export type FeatureFlagKey = (typeof FEATURE_FLAGS)[keyof typeof FEATURE_FLAGS];
export type UserPlan = 'free' | 'pro';

// ================================================================
// 定数
// ================================================================

export const UNUSED_THRESHOLDS = {
  DEFAULT:   90,
  HIGH_RISK: 60,
} as const;

export const HIGH_RISK_UNUSED_CATEGORIES: Category[] = ['gym', 'education'];

export const SKIP_DUPLICATE_DETECTION_CATEGORIES: Category[] = [
  'insurance',
  'utility',
  'mobile',
];

export const FREE_PLAN_SUBSCRIPTION_LIMIT = 10;

export const STORAGE_KEYS = {
  SUBSCRIPTIONS:             'fixless_subscriptions',
  DISMISSED_OPPORTUNITIES:   'fixless_dismissed_opportunities',
  USER_SETTINGS:             'fixless_user_settings',
} as const;
