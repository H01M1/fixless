'use client';

/**
 * app/add/page.tsx
 * ================
 * サブスク追加ページ。
 *
 * v2.1 変更点:
 * - タブを2つ → 3つに変更
 *   「サービスから選ぶ」「手動で入力」「スクショから追加」
 * - 既存の2タブの動作は変更なし
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LayoutGrid, PenLine, Camera } from 'lucide-react';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { PageHeader } from '@/components/layout/PageHeader';
import { ServicePicker } from '@/components/subscription/ServicePicker';
import { ManualForm } from '@/components/subscription/ManualForm';
import { ScreenshotImport } from '@/components/subscription/ScreenshotImport';
import type { SubscriptionInput } from '@/types';

// ================================================================
// タブ定義
// ================================================================

type Tab = 'picker' | 'manual' | 'screenshot';

interface TabDef {
  id: Tab;
  label: string;
  icon: React.FC<{ size: number; strokeWidth: number }>;
}

const TABS: TabDef[] = [
  { id: 'picker',     label: 'サービスから選ぶ',  icon: LayoutGrid },
  { id: 'manual',     label: '手動で入力',         icon: PenLine    },
  { id: 'screenshot', label: 'スクショから追加',   icon: Camera     },
];

// ================================================================
// ページコンポーネント
// ================================================================

export default function AddPage() {
  const router = useRouter();
  const { addSubscription } = useSubscriptions();
  const [activeTab, setActiveTab] = useState<Tab>('picker');

  // ── 登録ハンドラ（picker・manual タブで使う）─────────────────

  const handleAdd = async (input: SubscriptionInput): Promise<boolean> => {
    const result = await addSubscription(input);
    if (result) {
      router.push('/');
      return true;
    }
    return false;
  };

  // ================================================================
  // レンダリング
  // ================================================================

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ページヘッダー */}
      <PageHeader title="サブスクを追加" backHref="/" />

      {/* タブ切り替え */}
      <div className="flex bg-white border-b border-slate-200">
        {TABS.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`
                flex-1 flex flex-col items-center justify-center
                py-2.5 gap-1 text-[10px] font-medium border-b-2 transition-colors
                ${isActive
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
                }
              `}
              aria-selected={isActive}
            >
              <Icon size={15} strokeWidth={isActive ? 2.5 : 1.8} />
              {label}
            </button>
          );
        })}
      </div>

      {/* コンテンツ */}
      <div className="pb-6">
        {activeTab === 'picker' && (
          <ServicePicker onAdd={handleAdd} />
        )}
        {activeTab === 'manual' && (
          <ManualForm onAdd={handleAdd} />
        )}
        {activeTab === 'screenshot' && (
          <ScreenshotImport />
        )}
      </div>
    </div>
  );
}
