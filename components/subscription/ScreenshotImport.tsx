'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, CheckCircle2 } from 'lucide-react';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import {
  getAppStoreLikelyServices,
  searchAppStoreLikelyServices,
} from '@/lib/serviceDb';
import { getTodayStr, formatCurrency } from '@/lib/billing';
import { ScreenshotPreview } from '@/components/subscription/ScreenshotPreview';
import { BulkAddList } from '@/components/subscription/BulkAddList';
import { PlanPicker } from '@/components/subscription/PlanPicker';
import { CATEGORY_EMOJIS } from '@/types';
import type { PendingSubscription, ServiceTemplate, ServicePlan } from '@/types';

export function ScreenshotImport() {
  const router = useRouter();
  const { addSubscription } = useSubscriptions();

  const [selectedServiceIds, setSelectedServiceIds] = useState<Set<string>>(new Set());
  const [pendingItems, setPendingItems]               = useState<PendingSubscription[]>([]);
  const [searchQuery, setSearchQuery]                 = useState('');
  const [isAdding, setIsAdding]                       = useState(false);
  const [serviceForPlanSelect, setServiceForPlanSelect] = useState<ServiceTemplate | null>(null);

  const candidates = useMemo(() => {
    if (searchQuery.trim()) return searchAppStoreLikelyServices(searchQuery);
    return getAppStoreLikelyServices();
  }, [searchQuery]);

  const handleCandidateTap = (service: ServiceTemplate) => {
    if (selectedServiceIds.has(service.id)) {
      setSelectedServiceIds((prev) => {
        const next = new Set(prev);
        next.delete(service.id);
        return next;
      });
      setPendingItems((prev) =>
        prev.filter((item) => item.service.id !== service.id),
      );
      return;
    }

    if ((service.plans?.length ?? 0) >= 2) {
      setServiceForPlanSelect(service);
      return;
    }

    addToPending(service, service.plans?.[0]);
  };

  const addToPending = (service: ServiceTemplate, plan?: ServicePlan) => {
    const serviceName  = plan ? `${service.name} ${plan.planName}` : service.name;
    const amount       = plan ? String(plan.defaultAmountMonthly) : String(service.defaultAmountMonthly ?? '');
    const billingCycle = plan ? plan.defaultBillingCycle : service.defaultBillingCycle;

    const newItem: PendingSubscription = {
      tempId:            crypto.randomUUID(),
      service:           { ...service, name: serviceName },
      selectedPlan:      plan,
      amount,
      billingCycle,
      billingStartDate:  getTodayStr(),
      isAmountConfirmed: !!amount && parseInt(amount, 10) > 0,
    };

    setSelectedServiceIds((prev) => new Set([...prev, service.id]));
    setPendingItems((prev) => [...prev, newItem]);
  };

  const handlePlanSelect = (service: ServiceTemplate, plan: ServicePlan) => {
    addToPending(service, plan);
    setServiceForPlanSelect(null);
  };

  const handleBulkAdd = async () => {
    setIsAdding(true);
    try {
      for (const item of pendingItems) {
        const amount = parseInt(item.amount, 10);
        if (!amount || amount < 1) continue;
        await addSubscription({
          serviceId:        item.service.id,
          name:             item.service.name,
          category:         item.service.category,
          iconUrl:          item.service.iconUrl,
          amount,
          billingCycle:     item.billingCycle,
          billingStartDate: item.billingStartDate,
          isFreeTrial:      false,
        });
      }
      setPendingItems([]);
      setSelectedServiceIds(new Set());
      router.push('/');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="px-4 pt-5 pb-6 space-y-5">
      <StepGuide />

      <div>
        <p className="text-xs font-semibold text-slate-600 mb-2">STEP 3: スクショをアップロード</p>
        <ScreenshotPreview onImageLoad={() => {}} onImageRemove={() => {}} />
      </div>

      <div>
        <p className="text-xs font-semibold text-slate-600 mb-2">STEP 4: スクショを見ながらサービスを選ぶ</p>

        <div className="relative mb-3">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" strokeWidth={2} />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="サービス名で絞り込む..."
            className="w-full pl-8 pr-8 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
          {searchQuery && (
            <button type="button" onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" aria-label="検索をクリア">
              <X size={14} />
            </button>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2">
          {candidates.map((service) => (
            <CandidateCard
              key={service.id}
              service={service}
              isSelected={selectedServiceIds.has(service.id)}
              onTap={() => handleCandidateTap(service)}
            />
          ))}
          {candidates.length === 0 && (
            <div className="col-span-3 text-center py-6 text-sm text-slate-400">
              「{searchQuery}」に一致するサービスが見つかりません
            </div>
          )}
        </div>

        <div className="mt-3 space-y-1">
          <p className="text-[10px] text-slate-400">※ Apple IDのサブスクリプション一覧は自動取得しません</p>
          <p className="text-[10px] text-slate-400">※ アップロードした画像はサーバーに送信されません</p>
          <p className="text-[10px] text-slate-400">※ 料金・解約方法は変更される場合があります。最終確認は公式サイトで</p>
        </div>
      </div>

      {pendingItems.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-600 mb-2">STEP 5: 金額・請求日を確認してまとめて追加</p>
          <BulkAddList
            items={pendingItems}
            onChange={setPendingItems}
            onBulkAdd={handleBulkAdd}
            isAdding={isAdding}
          />
        </div>
      )}

      {serviceForPlanSelect && (
        <div className="fixed inset-0 z-50 flex items-end">
          <div className="absolute inset-0 bg-black/50" onClick={() => setServiceForPlanSelect(null)} />
          <div className="relative w-full max-w-md mx-auto bg-white rounded-t-2xl pb-8 overflow-hidden">
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-slate-300 rounded-full" />
            </div>
            <PlanPicker
              service={serviceForPlanSelect}
              onSelectPlan={handlePlanSelect}
              onBack={() => setServiceForPlanSelect(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function StepGuide() {
  const steps = [
    { num: 1, text: 'iPhoneで「設定」アプリを開く' },
    { num: 2, text: 'Apple ID → サブスクリプション を開く' },
    { num: 3, text: 'サブスクリプション一覧のスクショを撮る' },
    { num: 4, text: 'そのスクショをここにアップロードする' },
    { num: 5, text: 'スクショを見ながら下の候補から選ぶ' },
  ];
  return (
    <div className="bg-indigo-50 rounded-xl border border-indigo-100 px-4 py-4">
      <p className="text-xs font-bold text-indigo-700 mb-3">📱 iPhoneのサブスクをまとめて追加する方法</p>
      <div className="space-y-2">
        {steps.map(({ num, text }) => (
          <div key={num} className="flex items-start gap-2.5">
            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-200 flex items-center justify-center mt-0.5">
              <span className="text-[10px] font-bold text-indigo-700">{num}</span>
            </div>
            <p className="text-xs text-indigo-800 leading-relaxed">{text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

interface CandidateCardProps {
  service: ServiceTemplate;
  isSelected: boolean;
  onTap: () => void;
}

function CandidateCard({ service, isSelected, onTap }: CandidateCardProps) {
  const [iconError, setIconError] = useState(false);
  return (
    <button
      type="button"
      onClick={onTap}
      className={`relative flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl border-2 transition-colors ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-200 hover:border-indigo-300 active:border-indigo-300'}`}
    >
      {isSelected && (
        <div className="absolute top-1.5 right-1.5">
          <CheckCircle2 size={14} className="text-white" strokeWidth={2.5} />
        </div>
      )}
      <div className={`w-10 h-10 rounded-full flex items-center justify-center overflow-hidden ${isSelected ? 'bg-indigo-500' : 'bg-slate-100'}`}>
        {service.iconUrl && !iconError ? (
          <img src={service.iconUrl} alt={service.name} width={24} height={24} className="w-6 h-6 object-contain" onError={() => setIconError(true)} />
        ) : (
          <span className="text-xl" aria-hidden="true">{CATEGORY_EMOJIS[service.category]}</span>
        )}
      </div>
      <p className={`text-[10px] font-semibold text-center leading-tight line-clamp-2 ${isSelected ? 'text-white' : 'text-slate-700'}`}>
        {service.name}
      </p>
      {(service.plans?.length ?? 0) >= 2 ? (
        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${isSelected ? 'bg-indigo-500 text-indigo-100' : 'bg-indigo-50 text-indigo-600'}`}>
          {service.plans!.length}プラン
        </span>
      ) : service.defaultAmountMonthly ? (
        <span className={`text-[9px] ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>
          {formatCurrency(service.defaultAmountMonthly)}/月
        </span>
      ) : null}
    </button>
  );
}