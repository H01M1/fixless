'use client';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getServiceById } from '@/lib/serviceDb';
import { PageHeader } from '@/components/layout/PageHeader';
import { CancelGuideCard } from '@/components/cancel/CancelGuideCard';
import { CancelSteps } from '@/components/cancel/CancelSteps';
import { CancelNotice } from '@/components/cancel/CancelNotice';

export default function CancelGuidePage() {
  const params = useParams();
  const serviceId = params.serviceId as string;
  const service = getServiceById(serviceId);

  if (!service) {
    return (
      <div className="min-h-screen bg-slate-50">
        <PageHeader title="解約ガイド" backHref="/savings" />
        <div className="px-4 pt-6">
          <CancelNotice />
          <div className="text-center mt-4">
            <Link href="/savings" className="text-xs text-slate-400">
              節約候補に戻る
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader title="解約ガイド" backHref="/savings" />
      <div className="px-4 pt-4 pb-8 space-y-4">
        <CancelGuideCard service={service} />
        <CancelSteps steps={service.cancellationSteps} />
        <CancelNotice notes={service.cancellationNotes} />
        <div className="text-center">
          <Link href="/savings" className="text-xs text-slate-400">
            節約候補に戻る
          </Link>
        </div>
      </div>
    </div>
  );
}