/**
 * lib/supabase/adapter.ts
 * ========================
 * Supabase を使った StorageAdapter の実装。
 *
 * snake_case（DBカラム）⇄ camelCase（TypeScript）の変換を担当。
 * nullable なカラムは安全にデフォルト値を設定する。
 */

import { getSupabaseClient } from '@/lib/supabase/client';
import { calcAmountMonthly, calcAmountYearly, calcNextBillingDate } from '@/lib/billing';
import type {
  StorageAdapter,
  Subscription,
  SubscriptionInput,
  SubscriptionUpdateInput,
} from '@/types';

// ================================================================
// DB 行の型
// ================================================================

interface SubscriptionRow {
  id: string;
  user_id: string;
  service_id: string | null;
  name: string;
  category: string;
  icon_url: string | null;
  amount: number;
  billing_cycle: string;
  amount_monthly: number;
  amount_yearly: number;
  billing_start_date: string;
  next_billing_date: string;
  status: string;
  is_free_trial: boolean;
  free_trial_end_date: string | null;
  last_confirmed_active: string | null;
  memo: string | null;
  created_at: string;
  updated_at: string;
}

// ================================================================
// 変換関数: DB row → Subscription（camelCase）
// ================================================================

function rowToSubscription(row: SubscriptionRow): Subscription {
  return {
    id:                   row.id,
    userId:               row.user_id,
    serviceId:            row.service_id ?? undefined,
    name:                 row.name,
    category:             row.category as Subscription['category'],
    iconUrl:              row.icon_url ?? undefined,
    amount:               row.amount,
    billingCycle:         row.billing_cycle as Subscription['billingCycle'],
    amountMonthly:        row.amount_monthly,
    amountYearly:         row.amount_yearly,
    billingStartDate:     row.billing_start_date,
    nextBillingDate:      row.next_billing_date,
    status:               row.status as Subscription['status'],
    isFreeTrial:          row.is_free_trial,
    freeTrialEndDate:     row.free_trial_end_date ?? undefined,
    lastConfirmedActive:  row.last_confirmed_active ?? undefined,
    memo:                 row.memo ?? undefined,
    createdAt:            row.created_at,
    updatedAt:            row.updated_at,
  };
}

// ================================================================
// 変換関数: SubscriptionInput → DB insert オブジェクト
// ================================================================

function inputToRow(
  input: SubscriptionInput,
  userId: string,
): Omit<SubscriptionRow, 'id' | 'created_at' | 'updated_at'> {
  const amountMonthly = calcAmountMonthly(input.amount, input.billingCycle);
  const amountYearly  = calcAmountYearly(input.amount, input.billingCycle);
  const nextBilling   = calcNextBillingDate(input.billingStartDate, input.billingCycle);

  return {
    user_id:              userId,
    service_id:           input.serviceId ?? null,
    name:                 input.name,
    category:             input.category,
    icon_url:             input.iconUrl ?? null,
    amount:               input.amount,
    billing_cycle:        input.billingCycle,
    amount_monthly:       amountMonthly,
    amount_yearly:        amountYearly,
    billing_start_date:   input.billingStartDate,
    next_billing_date:    nextBilling,
    status:               'active',
    is_free_trial:        input.isFreeTrial ?? false,
    free_trial_end_date:  input.freeTrialEndDate ?? null,
    last_confirmed_active: null,
    memo:                 input.memo ?? null,
  };
}

// ================================================================
// 変換関数: SubscriptionUpdateInput → DB update オブジェクト
// ================================================================

function updateInputToRow(
  data: SubscriptionUpdateInput,
): Partial<SubscriptionRow> {
  const row: Partial<SubscriptionRow> = {};

  if (data.name             !== undefined) row.name               = data.name;
  if (data.category         !== undefined) row.category           = data.category;
  if (data.iconUrl          !== undefined) row.icon_url           = data.iconUrl ?? null;
  if (data.amount           !== undefined) row.amount             = data.amount;
  if (data.billingCycle     !== undefined) row.billing_cycle      = data.billingCycle;
  if (data.billingStartDate !== undefined) row.billing_start_date = data.billingStartDate;
  if (data.nextBillingDate  !== undefined) row.next_billing_date  = data.nextBillingDate;
  if (data.status           !== undefined) row.status             = data.status;
  if (data.isFreeTrial      !== undefined) row.is_free_trial      = data.isFreeTrial;
  if (data.freeTrialEndDate !== undefined) row.free_trial_end_date = data.freeTrialEndDate ?? null;
  if (data.serviceId        !== undefined) row.service_id         = data.serviceId ?? null;
  if (data.memo             !== undefined) row.memo               = data.memo ?? null;

  if (data.lastConfirmedActive !== undefined) {
    row.last_confirmed_active = data.lastConfirmedActive ?? null;
  }

  // amount や billingCycle が変わった場合は amountMonthly / amountYearly を再計算
  if (data.amount !== undefined || data.billingCycle !== undefined) {
    // 計算のため両方の値が必要だが、片方だけ更新の場合は現状の値を使えないので
    // 呼び出し元で両方渡してもらう前提。渡されていれば再計算する。
    if (data.amount !== undefined && data.billingCycle !== undefined) {
      row.amount_monthly = calcAmountMonthly(data.amount, data.billingCycle);
      row.amount_yearly  = calcAmountYearly(data.amount, data.billingCycle);
    }
  }

  // 常に updated_at を更新
  row.updated_at = new Date().toISOString();

  return row;
}

// ================================================================
// SupabaseAdapter
// ================================================================

export class SupabaseAdapter implements StorageAdapter {
  constructor(private readonly userId: string) {}

  async getSubscriptions(): Promise<Subscription[]> {
    const supabase = getSupabaseClient();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', this.userId)
      .eq('status', 'active')
      .order('amount_monthly', { ascending: false });

    if (error) {
      console.error('[SupabaseAdapter] getSubscriptions error:', error);
      return [];
    }

    return (data as SubscriptionRow[]).map(rowToSubscription);
  }

  async getAllSubscriptions(): Promise<Subscription[]> {
    const supabase = getSupabaseClient();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', this.userId)
      .order('amount_monthly', { ascending: false });

    if (error) {
      console.error('[SupabaseAdapter] getAllSubscriptions error:', error);
      return [];
    }

    return (data as SubscriptionRow[]).map(rowToSubscription);
  }

  async addSubscription(input: SubscriptionInput): Promise<Subscription> {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error('Supabase client not available');

    const row = inputToRow(input, this.userId);

    const { data, error } = await supabase
      .from('subscriptions')
      .insert(row)
      .select()
      .single();

    if (error) {
      console.error('[SupabaseAdapter] addSubscription error:', error);
      throw error;
    }

    return rowToSubscription(data as SubscriptionRow);
  }

  async updateSubscription(
    id: string,
    data: SubscriptionUpdateInput,
  ): Promise<Subscription | null> {
    const supabase = getSupabaseClient();
    if (!supabase) return null;

    const row = updateInputToRow(data);

    const { data: updated, error } = await supabase
      .from('subscriptions')
      .update(row)
      .eq('id', id)
      .eq('user_id', this.userId) // 自分のデータだけ更新できる
      .select()
      .single();

    if (error) {
      console.error('[SupabaseAdapter] updateSubscription error:', error);
      return null;
    }

    return rowToSubscription(updated as SubscriptionRow);
  }

  async deleteSubscription(id: string): Promise<void> {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    const { error } = await supabase
      .from('subscriptions')
      .delete()
      .eq('id', id)
      .eq('user_id', this.userId); // 自分のデータだけ削除できる

    if (error) {
      console.error('[SupabaseAdapter] deleteSubscription error:', error);
      throw error;
    }
  }
}
