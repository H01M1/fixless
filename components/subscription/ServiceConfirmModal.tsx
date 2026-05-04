'use client';

/**
 * components/subscription/ServiceConfirmModal.tsx
 * =================================================
 * サービスDBから選んだサービスを確認・編集して登録するボトムシートモーダル。
 *
 * 初期値はサービステンプレートのデフォルト値で埋める。
 * ユーザーは金額・請求サイクル・初回請求日・無料期間の有無を編集できる。
 * 下部に「月額換算・年額換算・次回請求日」のプレビューをリアルタイム表示する。
 *
 * ボトムシートデザイン:
 * - 画面下からスライドアップするスタイル（iOS っぽい UX）
 * - 暗いオーバーレイをタップでも閉じられる
 * - iOS のホームインジケーターのためにボトムパディングを追加
 */

import { useState, useEffect, useMemo } from 'react';
import { X } from 'lucide-react';
import {
  calcAmountMonthly,
  calcAmountYearly,
  calcNextBillingDate,
  formatCurrency,
  formatDate,
  getBillingCycleLabel,
  getTodayStr,
} from '@/lib/billing';
import { getCategoryEmoji } from '@/lib/serviceDb';
import { BILLING_CYCLES, BILLING_CYCLE_LABELS } from '@/types';
import type { ServiceTemplate, SubscriptionInput, BillingCycle } from '@/types';

interface ServiceConfirmModalProps {
  service: ServiceTemplate;
  onClose: () => void;
  /** 登録ボタンが押されたとき。成功: true, 失敗: false */
  onAdd: (input: SubscriptionInput) => Promise<boolean>;
}

// ================================================================
// モーダル内フォームの型
// ================================================================

interface ConfirmFormState {
  amount: string;          // input value は string（number に変換して使う）
  billingCycle: BillingCycle;
  billingStartDate: string;
  isFreeTrial: boolean;
  freeTrialEndDate: string;
  memo: string;
}

export function ServiceConfirmModal({ service, onClose, onAdd }: ServiceConfirmModalProps) {
  const [iconError, setIconError]   = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError]   = useState<string | null>(null);

  // フォーム状態（サービスのデフォルト値で初期化）
  const [form, setForm] = useState<ConfirmFormState>({
    amount:           String(service.defaultAmountMonthly ?? ''),
    billingCycle:     service.defaultBillingCycle,
    billingStartDate: getTodayStr(),
    isFreeTrial:      false,
    freeTrialEndDate: '',
    memo:             '',
  });

  // ─── サービスが変わったらフォームをリセット ───────────────
  useEffect(() => {
    setForm({
      amount:           String(service.defaultAmountMonthly ?? ''),
      billingCycle:     service.defaultBillingCycle,
      billingStartDate: getTodayStr(),
      isFreeTrial:      false,
      freeTrialEndDate: '',
      memo:             '',
    });
    setSubmitError(null);
  }, [service]);

  // ─── モーダル表示中は背面のスクロールを止める ────────────
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // ─── リアルタイムプレビュー ───────────────────────────────
  const preview = useMemo(() => {
    const amountNum = parseInt(form.amount, 10);
    if (!form.amount || isNaN(amountNum) || amountNum < 1 || !form.billingStartDate) {
      return null;
    }
    return {
      amountMonthly:   calcAmountMonthly(amountNum, form.billingCycle),
      amountYearly:    calcAmountYearly(amountNum, form.billingCycle),
      nextBillingDate: calcNextBillingDate(form.billingStartDate, form.billingCycle),
    };
  }, [form.amount, form.billingCycle, form.billingStartDate]);

  // ─── フィールド更新ヘルパー ───────────────────────────────
  const update = <K extends keyof ConfirmFormState>(
    key: K,
    value: ConfirmFormState[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // ─── 登録ハンドラ ─────────────────────────────────────────
  const handleSubmit = async () => {
    const amountNum = parseInt(form.amount, 10);

    // 簡易バリデーション
    if (!form.amount || isNaN(amountNum) || amountNum < 1) {
      setSubmitError('金額を正しく入力してください（1円以上）');
      return;
    }
    if (!form.billingStartDate) {
      setSubmitError('初回請求日を入力してください');
      return;
    }
    if (form.isFreeTrial && !form.freeTrialEndDate) {
      setSubmitError('無料期間終了日を入力してください');
      return;
    }

    setSubmitError(null);
    setIsSubmitting(true);

    const input: SubscriptionInput = {
      serviceId:        service.id,
      name:             service.name,
      category:         service.category,
      iconUrl:          service.iconUrl,
      amount:           amountNum,
      billingCycle:     form.billingCycle,
      billingStartDate: form.billingStartDate,
      isFreeTrial:      form.isFreeTrial,
      freeTrialEndDate: form.isFreeTrial ? form.freeTrialEndDate : undefined,
      memo:             form.memo || undefined,
    };

    const success = await onAdd(input);
    if (!success) {
      setSubmitError('登録に失敗しました。もう一度お試しください。');
      setIsSubmitting(false);
    }
    // 成功時は親が selectedService を null にしてモーダルが閉じる
  };

  // ================================================================
  // レンダリング
  // ================================================================

  return (
    // オーバーレイ
    <div className="fixed inset-0 z-50 flex items-end pb-16">
      {/* 暗い背景（タップで閉じる） */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* ボトムシート */}
      <div
        className="relative w-full max-h-[80svh] bg-white rounded-t-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()} // 背景クリックのバブリング防止
      >
        {/* ドラッグハンドル */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 bg-slate-300 rounded-full" />
        </div>

        {/* ── ヘッダー ── */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 flex-shrink-0">
          {/* サービスアイコン */}
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0">
            {service.iconUrl && !iconError ? (
              <img
                src={service.iconUrl}
                alt={service.name}
                width={24}
                height={24}
                className="w-6 h-6 object-contain"
                onError={() => setIconError(true)}
              />
            ) : (
              <span className="text-xl" aria-hidden="true">
                {getCategoryEmoji(service.category)}
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-800 truncate">{service.name}</p>
            <p className="text-xs text-slate-400 mt-0.5">詳細を確認して登録してください</p>
          </div>

          {/* 閉じるボタン */}
          <button
            onClick={onClose}
            className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 active:bg-slate-100 transition-colors"
            aria-label="閉じる"
          >
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        {/* ── スクロール可能なフォームエリア ── */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">

          {/* 金額 */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              金額 <span className="text-rose-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                value={form.amount}
                onChange={(e) => update('amount', e.target.value)}
                min="1"
                max="10000000"
                placeholder="1590"
                className="
                  flex-1 px-3 py-2.5 rounded-xl border border-slate-200
                  text-sm text-slate-800 bg-slate-50
                  focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white
                  transition-all
                "
              />
              <span className="text-sm text-slate-500 whitespace-nowrap">円</span>
            </div>
          </div>

          {/* 請求サイクル */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              請求サイクル
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {BILLING_CYCLES.map((cycle) => (
                <button
                  key={cycle}
                  type="button"
                  onClick={() => update('billingCycle', cycle)}
                  className={`
                    py-2 rounded-xl text-xs font-medium border transition-colors
                    ${form.billingCycle === cycle
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
                    }
                  `}
                >
                  {getBillingCycleLabel(cycle)}
                </button>
              ))}
            </div>
          </div>

          {/* 初回請求日 */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              初回請求日 <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={form.billingStartDate}
              onChange={(e) => update('billingStartDate', e.target.value)}
              className="
                w-full px-3 py-2.5 rounded-xl border border-slate-200
                text-sm text-slate-800 bg-slate-50
                focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white
                transition-all
              "
            />
          </div>

          {/* 無料期間中 */}
          <div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-600">無料トライアル中</p>
                <p className="text-xs text-slate-400 mt-0.5">無料期間が終わる前にお知らせします</p>
              </div>
              {/* トグルスイッチ */}
              <button
                type="button"
                onClick={() => {
                  update('isFreeTrial', !form.isFreeTrial);
                  if (form.isFreeTrial) update('freeTrialEndDate', '');
                }}
                className={`
                  relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0
                  ${form.isFreeTrial ? 'bg-indigo-600' : 'bg-slate-200'}
                `}
                role="switch"
                aria-checked={form.isFreeTrial}
              >
                <span
                  className={`
                    inline-block h-4 w-4 rounded-full bg-white shadow transition-transform
                    ${form.isFreeTrial ? 'translate-x-6' : 'translate-x-1'}
                  `}
                />
              </button>
            </div>

            {/* 無料期間終了日（isFreeTrial=true のときのみ表示） */}
            {form.isFreeTrial && (
              <div className="mt-3">
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  無料期間終了日 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={form.freeTrialEndDate}
                  onChange={(e) => update('freeTrialEndDate', e.target.value)}
                  className="
                    w-full px-3 py-2.5 rounded-xl border border-amber-200
                    text-sm text-slate-800 bg-amber-50
                    focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent
                    transition-all
                  "
                />
              </div>
            )}
          </div>

          {/* メモ */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              メモ <span className="text-slate-400 font-normal">（任意）</span>
            </label>
            <textarea
              value={form.memo}
              onChange={(e) => update('memo', e.target.value)}
              placeholder="解約のポイント・プラン名など..."
              rows={2}
              className="
                w-full px-3 py-2.5 rounded-xl border border-slate-200
                text-sm text-slate-800 bg-slate-50 resize-none
                focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white
                transition-all placeholder:text-slate-400
              "
            />
          </div>

          {/* ── プレビュー ── */}
          {preview && (
            <div className="rounded-xl bg-indigo-50 border border-indigo-100 px-4 py-3">
              <p className="text-xs font-bold text-indigo-600 mb-2">登録プレビュー</p>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <p className="text-[10px] text-indigo-400 mb-0.5">月額換算</p>
                  <p className="text-sm font-bold text-indigo-700">
                    {formatCurrency(preview.amountMonthly)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-indigo-400 mb-0.5">年額換算</p>
                  <p className="text-sm font-bold text-indigo-700">
                    {formatCurrency(preview.amountYearly)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-indigo-400 mb-0.5">次回請求日</p>
                  <p className="text-sm font-bold text-indigo-700">
                    {formatDate(preview.nextBillingDate)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* エラー */}
          {submitError && (
            <p className="text-xs text-rose-500 text-center">{submitError}</p>
          )}
        </div>

        {/* ── フッター（登録ボタン）── */}
        <div
          className="flex gap-3 px-5 py-4 border-t border-slate-100 flex-shrink-0 bg-white"
          style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}
        >
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 active:bg-slate-50 transition-colors"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="
              flex-1 py-3 rounded-xl text-sm font-bold text-white
              bg-indigo-600 active:bg-indigo-700
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors shadow-sm
            "
          >
            {isSubmitting ? '登録中...' : '登録する →'}
          </button>
        </div>
      </div>
    </div>
  );
}
