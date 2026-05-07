/**
 * lib/sampleData.ts
 * =================
 * デモ表示用のサンプルサブスクデータ。複数のペルソナに対応。
 *
 * 各ペルソナ:
 * - 6 サービス前後の典型的な経費構成
 * - 必ず AI 系を 2 つ含む（重複検出 UI を見せるため）
 * - 1 つは請求が 5〜10 日後（緊急請求アラートを見せるため）
 *
 * 日付は今日基準で動的に生成するので、いつ表示しても自然に見える。
 *
 * 後方互換性: 既存の getSampleSubscriptions() はデフォルト（デザイナー）を返す。
 */

import type { Subscription } from '@/types';

// ================================================================
// ヘルパー
// ================================================================

/** 今日から N 日後の日付を YYYY-MM-DD 形式で返す */
function inDays(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().substring(0, 10);
}

/** 今日から N 日前の日付を ISO 形式で返す */
function daysAgoISO(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

// ================================================================
// ペルソナの型
// ================================================================

export interface PersonaPreset {
  /** ユニークID（state管理に使う） */
  id: string;
  /** タブ表示用ラベル */
  label: string;
  /** タブ表示用絵文字 */
  emoji: string;
  /** タブの下に表示される一行説明 */
  description: string;
  /** サブスク一覧を返す関数（日付動的生成のため関数形式） */
  getSubscriptions: () => Subscription[];
}

// ================================================================
// 🎨 デザイナー
// ================================================================

function designerSubscriptions(): Subscription[] {
  return [
    {
      id: 'sample-designer-chatgpt',
      serviceId: 'chatgpt',
      name: 'ChatGPT Plus',
      category: 'ai',
      amount: 3000,
      billingCycle: 'monthly',
      amountMonthly: 3000,
      amountYearly: 36000,
      billingStartDate: '2025-01-15',
      nextBillingDate: inDays(20),
      status: 'active',
      isFreeTrial: false,
      iconUrl: 'https://www.google.com/s2/favicons?domain=openai.com&sz=64',
      createdAt: daysAgoISO(120),
      updatedAt: daysAgoISO(30),
    },
    {
      id: 'sample-designer-claude',
      serviceId: 'claude',
      name: 'Claude Pro',
      category: 'ai',
      amount: 3000,
      billingCycle: 'monthly',
      amountMonthly: 3000,
      amountYearly: 36000,
      billingStartDate: '2025-03-10',
      nextBillingDate: inDays(15),
      status: 'active',
      isFreeTrial: false,
      iconUrl: 'https://www.google.com/s2/favicons?domain=claude.ai&sz=64',
      createdAt: daysAgoISO(70),
      updatedAt: daysAgoISO(20),
    },
    {
      id: 'sample-designer-adobe',
      serviceId: 'adobe',
      name: 'Adobe Creative Cloud',
      category: 'software',
      amount: 6028,
      billingCycle: 'monthly',
      amountMonthly: 6028,
      amountYearly: 72336,
      billingStartDate: '2024-04-01',
      nextBillingDate: inDays(5),
      status: 'active',
      isFreeTrial: false,
      iconUrl: 'https://www.google.com/s2/favicons?domain=adobe.com&sz=64',
      createdAt: daysAgoISO(400),
      updatedAt: daysAgoISO(60),
    },
    {
      id: 'sample-designer-canva',
      serviceId: 'canva-pro',
      name: 'Canva Pro',
      category: 'software',
      amount: 1700,
      billingCycle: 'monthly',
      amountMonthly: 1700,
      amountYearly: 20400,
      billingStartDate: '2025-06-20',
      nextBillingDate: inDays(25),
      status: 'active',
      isFreeTrial: false,
      iconUrl: 'https://www.google.com/s2/favicons?domain=canva.com&sz=64',
      createdAt: daysAgoISO(50),
      updatedAt: daysAgoISO(10),
    },
    {
      id: 'sample-designer-notion',
      serviceId: 'notion-plus',
      name: 'Notion Plus',
      category: 'software',
      amount: 1650,
      billingCycle: 'monthly',
      amountMonthly: 1650,
      amountYearly: 19800,
      billingStartDate: '2024-09-05',
      nextBillingDate: inDays(18),
      status: 'active',
      isFreeTrial: false,
      iconUrl: 'https://www.google.com/s2/favicons?domain=notion.so&sz=64',
      createdAt: daysAgoISO(240),
      updatedAt: daysAgoISO(40),
    },
    {
      id: 'sample-designer-google-one',
      serviceId: 'google-one',
      name: 'Google One',
      category: 'cloud',
      amount: 250,
      billingCycle: 'monthly',
      amountMonthly: 250,
      amountYearly: 3000,
      billingStartDate: '2024-02-12',
      nextBillingDate: inDays(12),
      status: 'active',
      isFreeTrial: false,
      iconUrl: 'https://www.google.com/s2/favicons?domain=one.google.com&sz=64',
      createdAt: daysAgoISO(450),
      updatedAt: daysAgoISO(15),
    },
  ];
}

// ================================================================
// 💻 エンジニア
// ================================================================

function engineerSubscriptions(): Subscription[] {
  return [
    {
      id: 'sample-engineer-chatgpt',
      serviceId: 'chatgpt',
      name: 'ChatGPT Plus',
      category: 'ai',
      amount: 3000,
      billingCycle: 'monthly',
      amountMonthly: 3000,
      amountYearly: 36000,
      billingStartDate: '2024-08-12',
      nextBillingDate: inDays(22),
      status: 'active',
      isFreeTrial: false,
      iconUrl: 'https://www.google.com/s2/favicons?domain=openai.com&sz=64',
      createdAt: daysAgoISO(280),
      updatedAt: daysAgoISO(20),
    },
    {
      id: 'sample-engineer-claude',
      serviceId: 'claude',
      name: 'Claude Pro',
      category: 'ai',
      amount: 3000,
      billingCycle: 'monthly',
      amountMonthly: 3000,
      amountYearly: 36000,
      billingStartDate: '2025-04-01',
      nextBillingDate: inDays(8),
      status: 'active',
      isFreeTrial: false,
      iconUrl: 'https://www.google.com/s2/favicons?domain=claude.ai&sz=64',
      createdAt: daysAgoISO(60),
      updatedAt: daysAgoISO(15),
    },
    {
      id: 'sample-engineer-cursor',
      serviceId: 'cursor-pro',
      name: 'Cursor Pro',
      category: 'ai',
      amount: 3000,
      billingCycle: 'monthly',
      amountMonthly: 3000,
      amountYearly: 36000,
      billingStartDate: '2025-02-15',
      nextBillingDate: inDays(17),
      status: 'active',
      isFreeTrial: false,
      iconUrl: 'https://www.google.com/s2/favicons?domain=cursor.com&sz=64',
      createdAt: daysAgoISO(90),
      updatedAt: daysAgoISO(10),
    },
    {
      id: 'sample-engineer-copilot',
      serviceId: 'github-copilot',
      name: 'GitHub Copilot',
      category: 'software',
      amount: 1500,
      billingCycle: 'monthly',
      amountMonthly: 1500,
      amountYearly: 18000,
      billingStartDate: '2024-11-20',
      nextBillingDate: inDays(13),
      status: 'active',
      isFreeTrial: false,
      iconUrl: 'https://www.google.com/s2/favicons?domain=github.com&sz=64',
      createdAt: daysAgoISO(170),
      updatedAt: daysAgoISO(25),
    },
    {
      id: 'sample-engineer-vercel',
      serviceId: 'vercel-pro',
      name: 'Vercel Pro',
      category: 'software',
      amount: 3000,
      billingCycle: 'monthly',
      amountMonthly: 3000,
      amountYearly: 36000,
      billingStartDate: '2024-10-05',
      nextBillingDate: inDays(28),
      status: 'active',
      isFreeTrial: false,
      iconUrl: 'https://www.google.com/s2/favicons?domain=vercel.com&sz=64',
      createdAt: daysAgoISO(200),
      updatedAt: daysAgoISO(35),
    },
    {
      id: 'sample-engineer-notion',
      serviceId: 'notion-plus',
      name: 'Notion Plus',
      category: 'software',
      amount: 1650,
      billingCycle: 'monthly',
      amountMonthly: 1650,
      amountYearly: 19800,
      billingStartDate: '2024-07-18',
      nextBillingDate: inDays(11),
      status: 'active',
      isFreeTrial: false,
      iconUrl: 'https://www.google.com/s2/favicons?domain=notion.so&sz=64',
      createdAt: daysAgoISO(310),
      updatedAt: daysAgoISO(20),
    },
  ];
}

// ================================================================
// ✍️ ライター・コンテンツクリエイター
// ================================================================

function writerSubscriptions(): Subscription[] {
  return [
    {
      id: 'sample-writer-chatgpt',
      serviceId: 'chatgpt',
      name: 'ChatGPT Plus',
      category: 'ai',
      amount: 3000,
      billingCycle: 'monthly',
      amountMonthly: 3000,
      amountYearly: 36000,
      billingStartDate: '2024-12-01',
      nextBillingDate: inDays(7),
      status: 'active',
      isFreeTrial: false,
      iconUrl: 'https://www.google.com/s2/favicons?domain=openai.com&sz=64',
      createdAt: daysAgoISO(160),
      updatedAt: daysAgoISO(15),
    },
    {
      id: 'sample-writer-claude',
      serviceId: 'claude',
      name: 'Claude Pro',
      category: 'ai',
      amount: 3000,
      billingCycle: 'monthly',
      amountMonthly: 3000,
      amountYearly: 36000,
      billingStartDate: '2025-02-20',
      nextBillingDate: inDays(19),
      status: 'active',
      isFreeTrial: false,
      iconUrl: 'https://www.google.com/s2/favicons?domain=claude.ai&sz=64',
      createdAt: daysAgoISO(85),
      updatedAt: daysAgoISO(20),
    },
    {
      id: 'sample-writer-notion',
      serviceId: 'notion-plus',
      name: 'Notion Plus',
      category: 'software',
      amount: 1650,
      billingCycle: 'monthly',
      amountMonthly: 1650,
      amountYearly: 19800,
      billingStartDate: '2024-06-10',
      nextBillingDate: inDays(14),
      status: 'active',
      isFreeTrial: false,
      iconUrl: 'https://www.google.com/s2/favicons?domain=notion.so&sz=64',
      createdAt: daysAgoISO(340),
      updatedAt: daysAgoISO(25),
    },
    {
      id: 'sample-writer-canva',
      serviceId: 'canva-pro',
      name: 'Canva Pro',
      category: 'software',
      amount: 1700,
      billingCycle: 'monthly',
      amountMonthly: 1700,
      amountYearly: 20400,
      billingStartDate: '2025-05-08',
      nextBillingDate: inDays(23),
      status: 'active',
      isFreeTrial: false,
      iconUrl: 'https://www.google.com/s2/favicons?domain=canva.com&sz=64',
      createdAt: daysAgoISO(45),
      updatedAt: daysAgoISO(8),
    },
    {
      id: 'sample-writer-spotify',
      serviceId: 'spotify',
      name: 'Spotify Premium',
      category: 'music',
      amount: 980,
      billingCycle: 'monthly',
      amountMonthly: 980,
      amountYearly: 11760,
      billingStartDate: '2024-03-15',
      nextBillingDate: inDays(9),
      status: 'active',
      isFreeTrial: false,
      iconUrl: 'https://www.google.com/s2/favicons?domain=spotify.com&sz=64',
      createdAt: daysAgoISO(420),
      updatedAt: daysAgoISO(50),
    },
    {
      id: 'sample-writer-schoo',
      serviceId: 'schoo',
      name: 'Schoo',
      category: 'education',
      amount: 980,
      billingCycle: 'monthly',
      amountMonthly: 980,
      amountYearly: 11760,
      billingStartDate: '2025-01-25',
      nextBillingDate: inDays(16),
      status: 'active',
      isFreeTrial: false,
      iconUrl: 'https://www.google.com/s2/favicons?domain=schoo.jp&sz=64',
      createdAt: daysAgoISO(110),
      updatedAt: daysAgoISO(18),
    },
  ];
}

// ================================================================
// エクスポート
// ================================================================

/**
 * 全ペルソナのプリセット一覧。
 * SamplePreview ではこれを iterate してタブを描画する。
 */
export const SAMPLE_PERSONAS: PersonaPreset[] = [
  {
    id: 'designer',
    label: 'デザイナー',
    emoji: '🎨',
    description: 'ChatGPT・Adobe・Canva などを契約している例',
    getSubscriptions: designerSubscriptions,
  },
  {
    id: 'engineer',
    label: 'エンジニア',
    emoji: '💻',
    description: 'Cursor・GitHub Copilot・Vercel などを契約している例',
    getSubscriptions: engineerSubscriptions,
  },
  {
    id: 'writer',
    label: 'ライター',
    emoji: '✍️',
    description: 'ChatGPT・Notion・Canva などを契約している例',
    getSubscriptions: writerSubscriptions,
  },
];

/**
 * 後方互換: デフォルト（デザイナー）のサブスク一覧を返す。
 * 既存コードからの呼び出しを壊さないため残してある。
 */
export function getSampleSubscriptions(): Subscription[] {
  return SAMPLE_PERSONAS[0].getSubscriptions();
}
