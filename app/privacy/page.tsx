import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'プライバシーポリシー',
  description: 'ミナオス（Minaos）のプライバシーポリシー',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen px-5 py-6">
      <Link
        href="/"
        className="inline-flex items-center text-slate-600 text-sm mb-4 hover:text-slate-900"
      >
        <ArrowLeft size={16} className="mr-1" />
        ホームに戻る
      </Link>

      <h1 className="text-2xl font-bold text-slate-800 mb-1">プライバシーポリシー</h1>
      <p className="text-xs text-slate-500 mb-8">最終更新日: 2026年5月7日</p>

      <div className="space-y-7 text-sm text-slate-700 leading-relaxed">
        <p>
          ミナオス（Minaos）（以下「本サービス」）は、ご利用者様の個人情報を尊重し、適切に取り扱うため、本プライバシーポリシーを定めます。
        </p>

        <section>
          <h2 className="text-base font-bold text-slate-800 mb-3">1. 取得する情報</h2>
          <p className="mb-3">本サービスでは以下の情報を取得します。</p>

          <h3 className="text-sm font-bold text-slate-800 mt-4 mb-2">認証情報</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>メールアドレス</li>
            <li>
              Googleアカウントの基本プロフィール情報（表示名、プロフィール画像URL）
              ※Googleログイン利用時のみ
            </li>
          </ul>

          <h3 className="text-sm font-bold text-slate-800 mt-4 mb-2">サービス利用情報</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>登録されたサブスクリプション情報（サービス名、月額・年額、請求日など）</li>
            <li>これらは利用者様自身が入力した内容です</li>
          </ul>

          <h3 className="text-sm font-bold text-slate-800 mt-4 mb-2">自動取得情報</h3>
          <p>
            本サービスでは個別の利用ログ・アクセスログ・端末情報・位置情報などの自動取得は行いません（ホスティング基盤・データベース基盤の標準ログを除く）。
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-slate-800 mb-3">2. 情報の利用目的</h2>
          <p className="mb-2">取得した情報は以下の目的にのみ使用します。</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>本サービスの提供（サブスクリプション管理機能）</li>
            <li>ユーザー認証</li>
            <li>不正利用の防止</li>
            <li>お問い合わせへの対応</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-bold text-slate-800 mb-3">3. 第三者提供</h2>
          <p className="mb-2">取得した個人情報は、以下の場合を除き第三者に提供しません。</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>利用者様の同意がある場合</li>
            <li>法令に基づく開示要請がある場合</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-bold text-slate-800 mb-3">4. データの保管・委託先</h2>
          <p className="mb-2">利用者情報は以下のサービスを利用して保管されます。</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>Supabase Inc.</strong>（データベース・認証）
              <br />
              <a
                href="https://supabase.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:underline break-all"
              >
                https://supabase.com/privacy
              </a>
            </li>
            <li>
              <strong>Vercel Inc.</strong>（ホスティング）
              <br />
              <a
                href="https://vercel.com/legal/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:underline break-all"
              >
                https://vercel.com/legal/privacy-policy
              </a>
            </li>
            <li>
              <strong>Google LLC</strong>（OAuth認証）
              <br />
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:underline break-all"
              >
                https://policies.google.com/privacy
              </a>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-bold text-slate-800 mb-3">5. 利用者の権利</h2>
          <p className="mb-2">利用者様は以下を行う権利を有します。</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>登録情報の閲覧・修正・削除</li>
            <li>アカウントの削除</li>
            <li>データのエクスポート要求</li>
          </ul>
          <p className="mt-3">
            これらの権利を行使したい場合は、後述のお問い合わせ先までご連絡ください。
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-slate-800 mb-3">6. Cookie等の利用</h2>
          <p>
            本サービスは、ログイン状態の維持のために認証用のCookie（およびLocalStorage）を利用します。これらは本サービスの提供に必要不可欠な目的でのみ使用され、広告配信や行動追跡には使用しません。
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-slate-800 mb-3">7. お問い合わせ</h2>
          <p>本ポリシーに関するお問い合わせは下記までお願いします。</p>
          <p className="mt-2 font-semibold text-indigo-700">m1n40suf1xless@gmail.com</p>
        </section>

        <section>
          <h2 className="text-base font-bold text-slate-800 mb-3">8. 改定について</h2>
          <p>
            本ポリシーは予告なく改定される場合があります。重要な変更がある場合は本サービス内でお知らせします。
          </p>
        </section>
      </div>

      <div className="mt-12 mb-4 text-center">
        <Link href="/terms" className="text-sm text-indigo-600 hover:underline">
          利用規約はこちら →
        </Link>
      </div>
    </div>
  );
}
