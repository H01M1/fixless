/**
 * types/index.ts
 * ==============
 * アプリ全体で使う型・定数の定義ファイル。
 *
 * 設計方針:
 * - 全日付は YYYY-MM-DD 形式の文字列で統一（Date オブジェクトは使わない）
 *   → localStorage への JSON 保存と Supabase の DATE 型の両方に互換性がある
 * - 金額はすべて円（整数）で統一
 * - camelCase で定義し、Supabase 移行時は StorageAdapter 層で snake_case に変換する
 */

// ================================================================
// カテゴリ
// ================================================================

/**
 * サブスク・固定費のカテゴリ一覧。
 * `as const` にすることで、文字列リテラルの配列として扱える。
 */
export const CATEGORIES = [
  'video',      // 動画・映像
  'music',      // 音楽
  'book',       // 電子書籍・マンガ
  'cloud',      // クラウドストレージ
  'software',   // ソフトウェア・ツール
  'ai',         // AI・生成AI
  'mobile',     // 携帯・通信オプション
  'gym',        // ジム・フィットネス
  'insurance',  // 保険
  'utility',    // 電気・ガス・水道
  'food',       // フード・ミールキット
  'news',       // ニュース・情報
  'education',  // 学習・語学
  'other',      // その他
] as const;

/** カテゴリの型（上記配列の要素のいずれか） */
export type Category = (typeof CATEGORIES)[number];

/** カテゴリの日本語ラベル */
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

/** カテゴリの絵文字アイコン（シンプルなUI実装用） */
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
  'monthly',    // 月額
  'yearly',     // 年額
  'weekly',     // 週額
  'quarterly',  // 四半期払い（3ヶ月ごと）
] as const;

export type BillingCycle = (typeof BILLING_CYCLES)[number];

/** 請求サイクルの日本語ラベル */
export const BILLING_CYCLE_LABELS: Record<BillingCycle, string> = {
  monthly:   '月額',
  yearly:    '年額',
  weekly:    '週額',
  quarterly: '四半期払い',
};

// ================================================================
// サブスクの状態
// ================================================================

/**
 * サブスクの状態。
 * - active:    現在有効
 * - cancelled: 解約済み（ソフトデリート。履歴として残す）
 * - paused:    一時停止中（将来対応。MVPでは使わない）
 */
export type SubscriptionStatus = 'active' | 'cancelled' | 'paused';

// ================================================================
// 解約難易度
// ================================================================

/**
 * 解約の難しさ。
 * 解約ガイド画面でユーザーに事前に伝えるために使う。
 * - easy:   Webサイトから即解約できる
 * - medium: 手順が複数ある、わかりにくい
 * - hard:   電話必須、解約を阻止しようとする（いわゆるダークパターン）
 */
export type CancellationDifficulty = 'easy' | 'medium' | 'hard';

// ================================================================
// サービスDB（プリセット）
// ================================================================

/**
 * アプリに事前に登録してある日本のサービス情報。
 * data/services.ts に定数として定義し、ユーザーのクイック追加で使う。
 *
 * 設計上の注意:
 * - このデータはアプリ側でしか更新しない（ユーザーが編集することはない）
 * - 将来的に Supabase の service_database テーブルに移行できる構造にしている
 */
export interface ServiceTemplate {
  /** サービスの一意ID（nanoid で生成。Supabase移行後はUUID） */
  id: string;

  /** サービス名（表示用）。例: "Netflix スタンダード" */
  name: string;

  /**
   * サービス名のよみがな（日本語インクリメンタルサーチ用）。
   * 例: "ねっとふりっくす"
   * → "ね" と入力すると Netflix が候補に出る
   */
  nameKana?: string;

  /** カテゴリ */
  category: Category;

  /**
   * サービスのアイコン画像URL。
   * MVPでは各サービスの favicon や CDN URL を使う。
   * 画像が取得できない場合は CATEGORY_EMOJIS にフォールバック。
   */
  iconUrl?: string;

  /**
   * デフォルトの月額金額（円・税込）。
   * ユーザーが追加する際の初期値として使う。
   * プランが複数ある場合は最もスタンダードなプランの金額を入れる。
   */
  defaultAmountMonthly?: number;

  /**
   * デフォルトの請求サイクル。
   * ほとんどのサービスは 'monthly'。Adobe CC などは 'yearly' がある。
   */
  defaultBillingCycle: BillingCycle;

  // --- 解約ガイド情報 ---

  /** 解約ページのURL。外部リンクとして表示する。 */
  cancellationUrl?: string;

  /**
   * 解約手順のテキスト（Markdown形式でも可）。
   * 例:
   * "1. Netflixにログインする\n2. 右上のアイコン → アカウントをクリック\n..."
   */
  cancellationSteps?: string;

  /**
   * 解約時の注意事項。
   * 例: "解約後も月末まで視聴可能です。"
   */
  cancellationNotes?: string;

  /**
   * 解約の難しさ。
   * ユーザーが解約前に心理的準備をするために表示する。
   */
  cancellationDifficulty?: CancellationDifficulty;

  // --- 重複検出 ---

  /**
   * 重複グループID。
   * 同じグループIDを持つサービスが複数登録されると「重複」として検出する。
   *
   * 例:
   * - Netflix, U-NEXT, Disney+ は全員 "video_svod_jp"
   * - Spotify, Apple Music は全員 "music_streaming_jp"
   *
   * グループIDがない場合は category レベルでのみ重複を検出する。
   */
  duplicateGroupId?: string;
}

// ================================================================
// ユーザーが登録したサブスク
// ================================================================

/**
 * ユーザーが登録した1件のサブスク・固定費データ。
 *
 * localStorage保存の設計:
 * - JSON.stringify/parse で完全にシリアライズできる型のみ使用
 * - Date型は使わず、全日付を YYYY-MM-DD 文字列で統一
 *
 * Supabase移行時の設計:
 * - フィールド名は camelCase のまま保持し、StorageAdapter層で変換する
 * - userId を最初から持つことで、RLS（行レベルセキュリティ）移行時に対応できる
 * - amountMonthly/amountYearly/nextBillingDate は計算済みキャッシュとして保存
 *   → Supabase移行後はDBトリガーで同様に計算する
 */
export interface Subscription {
  // --- 識別子 ---

  /** サブスクの一意ID。nanoid() で生成する。 */
  id: string;

  /**
   * ユーザーID。
   * MVPではログイン機能がないため undefined のままにしておく。
   * Phase 2 でSupabase Authと連携する際に埋める。
   */
  userId?: string;

  /**
   * 参照元のサービステンプレートID。
   * サービスDBから追加した場合に設定される。
   * 手動で登録した場合は undefined。
   */
  serviceId?: string;

  // --- 表示情報 ---

  /** サービス名。サービスDBから引き継ぐか、ユーザーが手入力する。 */
  name: string;

  /** カテゴリ。重複検出・未使用判定・フィルタリングに使う。 */
  category: Category;

  /** アイコンURL。サービスDBから引き継ぐ。なければ絵文字で代替。 */
  iconUrl?: string;

  // --- 金額（すべて円・税込・整数）---

  /** ユーザーが入力した実際の請求金額。 */
  amount: number;

  /** 請求サイクル。 */
  billingCycle: BillingCycle;

  /**
   * 月額換算金額（自動計算・保存済み）。
   * - monthly: amount そのまま
   * - yearly:  Math.floor(amount / 12)
   * - weekly:  Math.floor(amount * 52 / 12)
   * - quarterly: Math.floor(amount / 3)
   *
   * 保存することでソート・集計のたびに再計算しなくて済む。
   */
  amountMonthly: number;

  /**
   * 年額換算金額（自動計算・保存済み）。
   * - monthly:   amount * 12
   * - yearly:    amount そのまま
   * - weekly:    amount * 52
   * - quarterly: amount * 4
   */
  amountYearly: number;

  // --- 請求日（YYYY-MM-DD 文字列で保存）---

  /**
   * 初回請求日 / 契約開始日。
   * ユーザーが入力する。「毎月15日払い」なら "2025-06-15" のように設定する。
   */
  billingStartDate: string;

  /**
   * 次回請求日（自動計算・保存済み）。
   * billingStartDate と billingCycle から calcNextBillingDate() で計算する。
   * サブスクを保存するたびに再計算して更新する。
   */
  nextBillingDate: string;

  // --- 状態 ---

  /**
   * サブスクの状態。
   * - active:    有効（デフォルト）
   * - cancelled: 解約済み（deleteSubscription()後はこの状態で保存。ソフトデリート）
   * - paused:    一時停止（将来対応。MVPでは使わない）
   *
   * MVPでは削除=cancelled への更新とし、将来の「節約実績」表示に備える。
   */
  status: SubscriptionStatus;

  /** 無料トライアル中かどうか。 */
  isFreeTrial: boolean;

  /**
   * 無料期間終了日（YYYY-MM-DD）。
   * isFreeTrial が true の場合のみ設定する。
   * 終了日のN日前にダッシュボードでアラート表示する。
   */
  freeTrialEndDate?: string;

  // --- 使用確認（未使用検出に使う）---

  /**
   * 「今も使っている」を最後に確認した日（YYYY-MM-DD）。
   * ユーザーが節約候補画面で「今も使っている」ボタンを押した日を記録する。
   * この日から90日（ジム・学習系は60日）以上経過すると未使用候補に昇格する。
   */
  lastConfirmedActive?: string;

  // --- メモ ---

  /** ユーザーが自由に入力できるメモ欄。解約ポイントや特記事項など。 */
  memo?: string;

  // --- 管理（ISO 8601 文字列で保存）---

  /** 登録日時。new Date().toISOString() で設定する。 */
  createdAt: string;

  /** 最終更新日時。更新のたびに new Date().toISOString() で更新する。 */
  updatedAt: string;
}

// ================================================================
// フォーム入力型
// ================================================================

/**
 * addSubscription() に渡す入力データの型。
 *
 * id, userId, amountMonthly, amountYearly, nextBillingDate,
 * status, createdAt, updatedAt は lib/storage.ts 側で自動付与するため除外する。
 *
 * 使用例:
 * ```ts
 * const input: SubscriptionInput = {
 *   name: 'Netflix スタンダード',
 *   category: 'video',
 *   amount: 1590,
 *   billingCycle: 'monthly',
 *   billingStartDate: '2025-06-01',
 *   isFreeTrial: false,
 * };
 * const saved = addSubscription(input);
 * ```
 */
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

/**
 * updateSubscription() に渡す更新データの型。
 * id 以外はすべて任意（変更したいフィールドだけ渡す）。
 */
export type SubscriptionUpdateInput = Partial<
  Omit<Subscription, 'id' | 'userId' | 'createdAt'>
>;

// ================================================================
// 節約候補
// ================================================================

/** 節約候補の種別 */
export type SavingType = 'duplicate' | 'unused';

/**
 * 未使用判定の理由コード。
 * 節約候補カードに「なぜ未使用と判断したか」を表示するために使う。
 */
export type UnusedReason =
  | 'not_confirmed_90days'  // 90日以上「今も使っている」確認をしていない
  | 'not_confirmed_60days'  // 60日以上確認していない（ジム・学習系カテゴリ）
  | 'high_risk_category'    // 未使用になりやすいカテゴリ（ジム、学習など）
  | 'long_term_unconfirmed'; // 登録から一度も確認していない（6ヶ月以上）

/** 未使用理由の日本語ラベル */
export const UNUSED_REASON_LABELS: Record<UnusedReason, string> = {
  not_confirmed_90days:   '90日以上確認されていません',
  not_confirmed_60days:   '60日以上確認されていません',
  high_risk_category:     '使われなくなりやすいカテゴリです',
  long_term_unconfirmed:  '登録以来、使用確認をしていません',
};

/**
 * 節約候補データ。
 * 重複検出・未使用検出の両方をこの型で表現する。
 *
 * 重複の場合: subscriptions に 2件以上、suggestedCancelId で解約推奨を示す
 * 未使用の場合: subscriptions に 1件、reasons で判断理由を示す
 */
export interface SavingOpportunity {
  /**
   * 節約候補の一意ID。
   * dismiss 状態を localStorage に保存するキーになる。
   * 重複: "duplicate-{groupId or category}-{userId}"
   * 未使用: "unused-{subscriptionId}"
   */
  id: string;

  /** 節約候補の種別 */
  type: SavingType;

  /** 関連するサブスク一覧（重複は2件以上、未使用は1件） */
  subscriptions: Subscription[];

  /** 月額節約額（円）。未使用の場合はそのサブスクの月額。 */
  estimatedMonthlySaving: number;

  /** 年額節約額（円）。 */
  estimatedYearlySaving: number;

  /** ユーザーに表示するメッセージ。例: "NetflixとU-NEXTが重複しています" */
  message: string;

  // --- 重複候補のみ ---

  /**
   * 解約を推奨するサブスクのID（重複の場合のみ設定）。
   * 月額が高い方を suggestedCancelId にする。
   * ユーザーはこれに限らず自分で選べる。
   */
  suggestedCancelId?: string;

  // --- 未使用候補のみ ---

  /** 未使用と判断した理由リスト（未使用の場合のみ設定） */
  reasons?: UnusedReason[];

  /**
   * 未使用スコア（0〜100）。
   * 高いほど未使用の可能性が高い。表示の優先順位に使う。
   * 30以上で候補表示、60以上で強調表示。
   */
  unusedScore?: number;

  // --- UI状態 ---

  /**
   * ユーザーが「後で確認」を選んだかどうか。
   * true の場合は節約候補一覧から非表示にする。
   * 別の localStorage キーに保存して管理する。
   */
  dismissed: boolean;
}

// ================================================================
// ダッシュボード集計
// ================================================================

/**
 * 直近の請求情報（ダッシュボードの「次回請求」セクションで使う）。
 */
export interface UpcomingBilling {
  /** 対象のサブスク */
  subscription: Subscription;

  /**
   * 次回請求日までの残り日数。
   * 0 = 今日、1 = 明日、負の値 = 既に過ぎている（通常は発生しない）
   */
  daysUntil: number;

  /** 7日以内かどうか（赤バッジ表示判定） */
  isUrgent: boolean;

  /** 14日以内かどうか（オレンジバッジ表示判定） */
  isWarning: boolean;
}

/**
 * ダッシュボードに表示する集計データ。
 * calcDashboardSummary() が返す型。
 */
export interface DashboardSummary {
  /** アクティブなサブスクの月額合計（円） */
  totalMonthly: number;

  /** アクティブなサブスクの年額合計（円） */
  totalYearly: number;

  /** アクティブなサブスクの件数 */
  subscriptionCount: number;

  /** 節約候補リスト（dismissed=false のもののみ） */
  savingOpportunities: SavingOpportunity[];

  /** 全節約候補を解約した場合の月額節約合計（円） */
  totalPotentialMonthlySaving: number;

  /** 全節約候補を解約した場合の年額節約合計（円） */
  totalPotentialYearlySaving: number;

  /**
   * 直近14日以内の請求リスト（日付の近い順）。
   * ダッシュボードの「次の請求」セクションで使う。
   */
  upcomingBillings: UpcomingBilling[];
}

// ================================================================
// StorageAdapter インターフェース
// ================================================================

/**
 * データ永続化層の抽象インターフェース。
 *
 * このインターフェースを介してデータを読み書きすることで、
 * 実装を差し替えてもコンポーネント側のコードを変更しなくて済む。
 *
 * MVP段階: LocalStorageAdapter（localStorage使用）を実装
 * Phase 2: SupabaseAdapter（Supabase使用）に差し替え
 *
 * 使用例（コンポーネント側）:
 * ```ts
 * // hooks/useSubscriptions.ts でアダプターを注入する
 * const adapter: StorageAdapter = new LocalStorageAdapter();
 * const subs = await adapter.getSubscriptions();
 * ```
 */
export interface StorageAdapter {
  /** アクティブな全サブスクを取得する */
  getSubscriptions(): Promise<Subscription[]>;

  /**
   * 全サブスクを取得する（cancelled を含む）。
   * 将来の「節約実績」表示で使う。
   */
  getAllSubscriptions(): Promise<Subscription[]>;

  /**
   * サブスクを1件追加する。
   * id, amountMonthly, amountYearly, nextBillingDate, status,
   * createdAt, updatedAt は実装側で自動付与する。
   *
   * @returns 保存後のサブスク（自動付与フィールドを含む）
   */
  addSubscription(input: SubscriptionInput): Promise<Subscription>;

  /**
   * サブスクを更新する。
   * updatedAt, amountMonthly, amountYearly, nextBillingDate は
   * 自動で再計算・更新する。
   *
   * @returns 更新後のサブスク。IDが存在しない場合は null。
   */
  updateSubscription(
    id: string,
    data: SubscriptionUpdateInput,
  ): Promise<Subscription | null>;

  /**
   * サブスクを削除する（ソフトデリート）。
   * 実際には status を 'cancelled' に変更する。
   * 将来の節約実績表示のためにデータ自体は残す。
   */
  deleteSubscription(id: string): Promise<void>;
}

// ================================================================
// Feature Flag（将来のPro機能切り替え用）
// ================================================================

/**
 * Feature Flag のキー一覧。
 * MVPでは全機能が使えるが、将来 Pro プランで制限する機能を
 * 最初からここで定義しておく。
 *
 * 使い方:
 * ```ts
 * if (isFeatureEnabled(FEATURE_FLAGS.CSV_EXPORT, userPlan)) {
 *   // CSVエクスポートボタンを表示
 * }
 * ```
 */
export const FEATURE_FLAGS = {
  /** 登録件数の上限解除（Free: 10件, Pro: 無制限） */
  UNLIMITED_SUBSCRIPTIONS: 'unlimited_subscriptions',
  /** CSVエクスポート */
  CSV_EXPORT: 'csv_export',
  /** 詳細な節約レポート */
  DETAILED_REPORTS: 'detailed_reports',
  /** カスタム通知設定 */
  CUSTOM_NOTIFICATIONS: 'custom_notifications',
  /** クラウド同期（マルチデバイス） */
  CLOUD_SYNC: 'cloud_sync',
} as const;

export type FeatureFlagKey = (typeof FEATURE_FLAGS)[keyof typeof FEATURE_FLAGS];

/** ユーザープラン（将来のPro対応用） */
export type UserPlan = 'free' | 'pro';

// ================================================================
// 定数
// ================================================================

/**
 * 未使用判定の閾値（日数）。
 * カテゴリごとに異なるしきい値を設ける。
 */
export const UNUSED_THRESHOLDS = {
  /** 通常カテゴリ：90日以上確認なし → 未使用候補 */
  DEFAULT: 90,
  /** ジム・学習系：60日以上確認なし → 未使用候補（もともと使われにくいため短めに設定） */
  HIGH_RISK: 60,
} as const;

/**
 * 未使用になりやすいカテゴリ（しきい値を短く設定するカテゴリ）。
 * ジムは「幽霊部員」問題、学習系は「積ん読」問題が多い。
 */
export const HIGH_RISK_UNUSED_CATEGORIES: Category[] = ['gym', 'education'];

/**
 * 重複検出をスキップするカテゴリ。
 * 保険や公共料金は複数契約が一般的なので重複扱いしない。
 */
export const SKIP_DUPLICATE_DETECTION_CATEGORIES: Category[] = [
  'insurance',
  'utility',
  'mobile',
];

/** MVPでの登録件数上限（Free プランで後から制限を有効にするための定数） */
export const FREE_PLAN_SUBSCRIPTION_LIMIT = 10;

/** localStorage のキー */
export const STORAGE_KEYS = {
  SUBSCRIPTIONS: 'fixless_subscriptions',
  DISMISSED_OPPORTUNITIES: 'fixless_dismissed_opportunities',
  USER_SETTINGS: 'fixless_user_settings',
} as const;
