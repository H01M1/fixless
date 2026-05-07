/**
 * lib/sampleData.ts
 * =================
 * デモ表示用のサンプルサブスクデータ。
 *
 * フリーランスデザイナーの典型的な経費構成を想定:
 * - AI 系を重複契約（ChatGPT + Claude）→ 重複検出 UI を見せられる
 * - ソフトウェア系を 3 種契約（Adobe + Canva + Notion）→ もう 1 つの重複検出
 * - Adobe の請求が 5 日後 → 緊急請求アラートも見せられる
 *
 * 日付は今日基準で動的に生成するので、いつ表示しても自然に見える。
 */

import type { Subscription } from '@/types';

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

export function getSampleSubscriptions(): Subscription[] {
  return [
    {
      id: 'sample-chatgpt',
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
      id: 'sample-claude',
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
      id: 'sample-adobe',
      serviceId: 'adobe',
      name: 'Adobe Creative Cloud',
      category: 'software',
      amount: 6028,
      billingCycle: 'monthly',
      amountMonthly: 6028,
      amountYearly: 72336,
      billingStartDate: '2024-04-01',
      nextBillingDate: inDays(5), // 5日後 → 緊急請求アラート発火
      status: 'active',
      isFreeTrial: false,
      iconUrl: 'https://www.google.com/s2/favicons?domain=adobe.com&sz=64',
      createdAt: daysAgoISO(400),
      updatedAt: daysAgoISO(60),
    },
    {
      id: 'sample-canva',
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
      id: 'sample-notion',
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
      id: 'sample-google-one',
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