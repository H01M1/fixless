'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LayoutGrid, PenLine } from 'lucide-react';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { PageHeader } from '@/components/layout/PageHeader';
import { ServicePicker } from '@/components/subscription/ServicePicker';
import { ManualForm } from '@/components/subscription/ManualForm';
import type { SubscriptionInput } from '@/types';

type Tab = 'picker' | 'manual';

const TABS: { id: Tab; label: string; icon: React.FC<{ size: number; strokeWidth: number }> }[] = [
  { id: 'picker', label: 'サービスから選ぶ', icon: LayoutGrid },
  { id: 'manual', label: '手動で入力',       icon: PenLine     },
];

export default function AddPage() {
  const router = useRouter();
  const { addSubscription } = useSubscriptions();
  const [activeTab, setActiveTab] = useState<Tab>('picker');

  const handleAdd = async (input: SubscriptionInput): Promise<boolean> => {
    const result = await addSubscription(input);
    if (result) {
      router.push('/');
      return true;
    }
    return false;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader title="サブスクを追加" backHref="/" />

      <div className="flex bg-white border-b border-slate-200 px-4">
        {TABS.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`
                flex-1 flex items-center justify-center gap-1.5
                py-3 text-xs font-medium border-b-2 transition-colors
                ${isActive
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
                }
              `}
              aria-selected={isActive}
            >
              <Icon size={14} strokeWidth={isActive ? 2.5 : 1.8} />
              {label}
            </button>
          );
        })}
      </div>

      <div className="pb-6">
        {activeTab === 'picker' ? (
          <ServicePicker onAdd={handleAdd} />
        ) : (
          <ManualForm onAdd={handleAdd} />
        )}
      </div>
    </div>
  );
}