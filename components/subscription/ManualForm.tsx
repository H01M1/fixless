'use client';

/**
 * components/subscription/ManualForm.tsx
 * ========================================
 * 手動でサブスクを登録するフォーム。
 *
 * 特徴:
 * - 全フィールドを1画面に表示（スクロール）
 * - 金額・請求サイクル・初回請求日が変わるたびにリアルタイムプレビューを更新
 * - バリデーションエラーはフィールド直下にインライン表示
 * - カテゴリはグリッドのタップで選択（セレクトボックスより使いやすい）
 * - 登録前に「月額換算・年額換算・次回請求日」をプレビューして確認できる
 */

import { useState, useMemo } from 'react';
import {
  calcAmountMonthly,
  calcAmountYearly,
  calcNextBillingDate,
  formatCurrency,
  formatDate,
  getBillingCycleLabel,
  getTodayStr,
} from '@/lib/billing';
import { getCategoryLabel, getCategoryEmoji, getPopulatedCategories } from '@/lib/serviceDb';
import {
  CATEGORIES,
  BILLING_CYCLES,
  CATEGORY_LABELS,
  CATEGORY_EMOJIS,
} from '@/types';
import type { SubscriptionInput, BillingCycle, Category } from '@/types';

// ================================================================
// Props
// ================================================================

interface ManualFormProps {
  /** 登録ボタンが押されたとき。成功: true, 失敗: false */
  onAdd: (input: SubscriptionInput) => Promise<boolean>;
}

// ================================================================
// フォーム状態の型
// ================================================================

interface FormState {
  name:             string;
  amount:           string;         // input は string として管理
  billingCycle:     BillingCycle;
  billingStartDate: string;
  category:         Category | '';  // 未選択は ''
  isFreeTrial:      boolean;
  freeTrialEndDate: string;
  memo:             string;
}

type FormErrors = Partial<Record<keyof FormState, string>>;

// ================================================================
// 初期値
// ================================================================

function createInitialState(): FormState {
  return {
    name:             '',
    amount:           '',
    billingCycle:     'monthly',
    billingStartDate: getTodayStr(),
    category:         '',
    isFreeTrial:      false,
    freeTrialEndDate: '',
    memo:             '',
  };
}

// ================================================================
// バリデーション
// ================================================================

function validate(form: FormState): FormErrors {
  const errors: FormErrors = {};

  if (!form.name.trim()) {
    errors.name = 'サービス名を入力してください';
  } else if (form.name.trim().length > 100) {
    errors.name = 'サービス名は100文字以内で入力してください';
  }

  const amountNum = parseInt(form.amount, 10);
  if (!form.amount) {
    errors.amount = '金額を入力してください';
  } else if (isNaN(amountNum) || amountNum < 1) {
    errors.amount = '金額は1円以上で入力してください';
  } else if (amountNum > 10_000_000) {
    errors.amount = '金額が大きすぎます（1,000万円以下）';
  }

  if (!form.billingStartDate) {
    errors.billingStartDate = '初回請求日を入力してください';
  }

  if (!form.category) {
    errors.category = 'カテゴリを選択してください';
  }

  if (form.isFreeTrial && !form.freeTrialEndDate) {
    errors.freeTrialEndDate = '無料期間終了日を入力してください';
  }

  return errors;
}

// ================================================================
// コンポーネント
// ================================================================

export function ManualForm({ onAdd }: ManualFormProps) {
  const [form, setForm]             = useState<FormState>(createInitialState);
  const [errors, setErrors]         = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError]   = useState<string | null>(null);

  // サービスが存在するカテゴリのみ表示
  const categories = Array.from(CATEGORIES);

  // ─── フィールド更新ヘルパー ───────────────────────────────
  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    // 入力されたフィールドのエラーをクリア
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  // ─── リアルタイムプレビュー計算 ──────────────────────────
  const preview = useMemo(() => {
    const amountNum = parseInt(form.amount, 10);
    if (!form.amount || isNaN(amountNum) || amountNum < 1 || !form.billingStartDate) {
      return null;
    }
    try {
      return {
        amountMonthly:   calcAmountMonthly(amountNum, form.billingCycle),
        amountYearly:    calcAmountYearly(amountNum, form.billingCycle),
        nextBillingDate: calcNextBillingDate(form.billingStartDate, form.billingCycle),
      };
    } catch {
      return null;
    }
  }, [form.amount, form.billingCycle, form.billingStartDate]);

  // ─── 送信ハンドラ ─────────────────────────────────────────
  const handleSubmit = async () => {
    // バリデーション
    const newErrors = validate(form);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // 最初のエラーフィールドにスクロール
      const firstErrorKey = Object.keys(newErrors)[0];
      document.getElementById(`field-${firstErrorKey}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
      return;
    }

    setSubmitError(null);
    setIsSubmitting(true);

    const amountNum = parseInt(form.amount, 10);
    const input: SubscriptionInput = {
      name:             form.name.trim(),
      category:         form.category as Category, // バリデーション済み
      amount:           amountNum,
      billingCycle:     form.billingCycle,
      billingStartDate: form.billingStartDate,
      isFreeTrial:      form.isFreeTrial,
      freeTrialEndDate: form.isFreeTrial ? form.freeTrialEndDate : undefined,
      memo:             form.memo.trim() || undefined,
    };

    const success = await onAdd(input);
    if (!success) {
      setSubmitError('登録に失敗しました。もう一度お試しください。');
      setIsSubmitting(false);
    }
    // 成功時は親が / にナビゲートする
  };

  // ================================================================
  // レンダリング
  // ================================================================

  return (
    <div className="px-4 pt-5 pb-6 space-y-5">

      {/* ── サービス名 ── */}
      <div id="field-name">
        <label className="block text-xs font-semibold text-slate-600 mb-1.5">
          サービス名 <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => update('name', e.target.value)}
          placeholder="例：ジムの月会費、電気代、Netflix..."
          maxLength={100}
          className={`
            w-full px-3 py-2.5 rounded-xl border text-sm text-slate-800
            bg-slate-50 placeholder:text-slate-400
            focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white
            transition-all
            ${errors.name ? 'border-rose-400 bg-rose-50' : 'border-slate-200'}
          `}
        />
        {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name}</p>}
      </div>

      {/* ── 金額 ── */}
      <div id="field-amount">
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
            className={`
              flex-1 px-3 py-2.5 rounded-xl border text-sm text-slate-800
              bg-slate-50 placeholder:text-slate-400
              focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white
              transition-all
              ${errors.amount ? 'border-rose-400 bg-rose-50' : 'border-slate-200'}
            `}
          />
          <span className="text-sm text-slate-500 whitespace-nowrap">円</span>
        </div>
        {errors.amount && <p className="text-xs text-rose-500 mt-1">{errors.amount}</p>}
      </div>

      {/* ── 請求サイクル ── */}
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
                py-2.5 rounded-xl text-xs font-medium border transition-colors
                ${form.billingCycle === cycle
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 active:border-indigo-300'
                }
              `}
            >
              {getBillingCycleLabel(cycle)}
            </button>
          ))}
        </div>
      </div>

      {/* ── 初回請求日 ── */}
      <div id="field-billingStartDate">
        <label className="block text-xs font-semibold text-slate-600 mb-1.5">
          初回請求日 <span className="text-rose-500">*</span>
        </label>
        <input
          type="date"
          value={form.billingStartDate}
          onChange={(e) => update('billingStartDate', e.target.value)}
          className={`
            w-full px-3 py-2.5 rounded-xl border text-sm text-slate-800
            bg-slate-50
            focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white
            transition-all
            ${errors.billingStartDate ? 'border-rose-400 bg-rose-50' : 'border-slate-200'}
          `}
        />
        {errors.billingStartDate && (
          <p className="text-xs text-rose-500 mt-1">{errors.billingStartDate}</p>
        )}
        <p className="text-xs text-slate-400 mt-1">
          ※ 毎月15日払いなら今月の15日を入力してください
        </p>
      </div>

      {/* ── カテゴリ ── */}
      <div id="field-category">
        <label className="block text-xs font-semibold text-slate-600 mb-2">
          カテゴリ <span className="text-rose-500">*</span>
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          {categories.map((cat) => {
            const isSelected = form.category === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => update('category', cat)}
                className={`
                  flex flex-col items-center gap-1 py-3 px-2 rounded-xl border
                  text-xs transition-colors
                  ${isSelected
                    ? 'bg-indigo-600 border-indigo-600 text-white'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300 active:border-indigo-300'
                  }
                `}
              >
                <span className="text-lg leading-none">
                  {CATEGORY_EMOJIS[cat]}
                </span>
                <span className={`text-[10px] font-medium text-center leading-tight ${isSelected ? 'text-white' : 'text-slate-500'}`}>
                  {CATEGORY_LABELS[cat]}
                </span>
              </button>
            );
          })}
        </div>
        {errors.category && (
          <p className="text-xs text-rose-500 mt-1">{errors.category}</p>
        )}
      </div>

      {/* ── 無料トライアル ── */}
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

        {/* 無料期間終了日 */}
        {form.isFreeTrial && (
          <div id="field-freeTrialEndDate" className="mt-3">
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              無料期間終了日 <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={form.freeTrialEndDate}
              onChange={(e) => update('freeTrialEndDate', e.target.value)}
              className={`
                w-full px-3 py-2.5 rounded-xl border text-sm text-slate-800
                bg-amber-50
                focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent
                transition-all
                ${errors.freeTrialEndDate ? 'border-rose-400' : 'border-amber-200'}
              `}
            />
            {errors.freeTrialEndDate && (
              <p className="text-xs text-rose-500 mt-1">{errors.freeTrialEndDate}</p>
            )}
          </div>
        )}
      </div>

      {/* ── メモ ── */}
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1.5">
          メモ <span className="text-slate-400 font-normal">（任意）</span>
        </label>
        <textarea
          value={form.memo}
          onChange={(e) => update('memo', e.target.value)}
          placeholder="解約のポイント・プラン名など自由に記入..."
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
          <p className="text-xs font-bold text-indigo-600 mb-2.5">登録プレビュー</p>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <p className="text-[10px] text-indigo-400 mb-1">月額換算</p>
              <p className="text-base font-bold text-indigo-700 leading-none">
                {formatCurrency(preview.amountMonthly)}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-indigo-400 mb-1">年額換算</p>
              <p className="text-base font-bold text-indigo-700 leading-none">
                {formatCurrency(preview.amountYearly)}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-indigo-400 mb-1">次回請求日</p>
              <p className="text-base font-bold text-indigo-700 leading-none">
                {formatDate(preview.nextBillingDate)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── エラー ── */}
      {submitError && (
        <p className="text-xs text-rose-500 text-center py-1">{submitError}</p>
      )}

      {/* ── 登録ボタン ── */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="
          w-full py-4 rounded-xl text-sm font-bold text-white
          bg-indigo-600 active:bg-indigo-700
          disabled:opacity-50 disabled:cursor-not-allowed
          shadow-md transition-colors
        "
      >
        {isSubmitting ? '登録中...' : '登録する →'}
      </button>

      {/* 下部の余白（ボトムナビが隠れないように） */}
      <div className="h-2" />
    </div>
  );
}
