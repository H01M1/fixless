import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: '利用規約',
  description: 'ミナオス（Minaos）の利用規約',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen px-5 py-6">
      <Link
        href="/"
        className="inline-flex items-center text-slate-600 text-sm mb-4 hover:text-slate-900"
      >
        <ArrowLeft size={16} className="mr-1" />
        ホームに戻る
      </Link>

      <h1 className="text-2xl font-bold text-slate-800 mb-1">利用規約</h1>
      <p className="text-xs text-slate-500 mb-8">最終更新日: 2026年5月7日</p>

      <div className="space-y-7 text-sm text-slate-700 leading-relaxed">
        <p>
          本利用規約（以下「本規約」）は、ミナオス（Minaos）（以下「本サービス」）の利用条件を定めるものです。本サービスを利用される際は、本規約に同意いただいたものとみなします。
        </p>

        <section>
          <h2 className="text-base font-bold text-slate-800 mb-3">1. 適用</h2>
          <p>
            本規約は、利用者様（以下「ユーザー」）と本サービス運営者（以下「運営者」）との間の本サービスに関する一切の関係に適用されます。
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-slate-800 mb-3">2. 本サービスの内容</h2>
          <p>
            本サービスは、ユーザーが自身のサブスクリプションサービス・固定費を登録し、月額・年額の合計や重複契約・節約候補を可視化することを目的としたWebアプリケーションです。本サービスはあくまで情報整理の補助ツールであり、登録された情報の正確性・完全性を保証するものではありません。
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-slate-800 mb-3">3. アカウント登録</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>ユーザーは、登録時に正確な情報を提供する必要があります</li>
            <li>アカウントの管理責任はユーザー自身にあります</li>
            <li>パスワードの漏洩・第三者使用に関する損害は、運営者の責任ではありません</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-bold text-slate-800 mb-3">4. 禁止事項</h2>
          <p className="mb-2">ユーザーは以下の行為をしてはなりません。</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>法令、公序良俗に違反する行為</li>
            <li>犯罪行為に関連する行為</li>
            <li>本サービスのサーバーまたはネットワークの機能を破壊・妨害する行為</li>
            <li>本サービスの運営を妨害する行為</li>
            <li>他のユーザーになりすます行為</li>
            <li>本サービスを商業目的で複製・再配布・転売する行為</li>
            <li>その他、運営者が不適切と判断する行為</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-bold text-slate-800 mb-3">
            5. 本サービスの提供の停止等
          </h2>
          <p className="mb-2">
            運営者は以下の場合、事前の通知なく本サービスの全部または一部の提供を停止または中断できます。
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>本サービスのメンテナンス・更新を行う場合</li>
            <li>地震、停電、戦争などの不可抗力により提供が困難な場合</li>
            <li>コンピュータまたは通信回線の事故が発生した場合</li>
            <li>その他、運営者が停止・中断が必要と判断した場合</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-bold text-slate-800 mb-3">6. 免責事項</h2>
          <p className="mb-2">運営者は本サービスに関して以下を保証しません。</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>ユーザーの特定の目的に適合すること</li>
            <li>期待する機能・精度・正確性・安全性を有すること</li>
            <li>不具合・バグ・エラーが生じないこと</li>
            <li>本サービスに表示される情報・計算結果の正確性</li>
          </ul>
          <p className="mt-3">
            本サービスの利用または利用不能によりユーザーまたは第三者に生じたいかなる損害（金銭的損害、データ損失、機会損失等を含む）についても、運営者は一切の責任を負いません。
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-slate-800 mb-3">7. サービス内容の変更等</h2>
          <p>
            運営者は、ユーザーへの通知なく本サービスの内容を変更・追加・廃止できるものとし、ユーザーはこれを了承するものとします。
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-slate-800 mb-3">8. 規約の変更</h2>
          <p>
            運営者は、必要と判断した場合、ユーザーに通知することなくいつでも本規約を変更できるものとします。変更後の規約は本サービス上に掲示された時点で効力を生じます。
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-slate-800 mb-3">9. 知的財産権</h2>
          <p>
            本サービスに関する著作権、商標権その他の知的財産権は運営者または正当な権利者に帰属します。ユーザーは、運営者の書面による事前承諾なく、これらを複製・転載・改変等することはできません。
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-slate-800 mb-3">10. 準拠法・管轄裁判所</h2>
          <p>
            本規約の解釈にあたっては、日本法を準拠法とします。本サービスに関して紛争が生じた場合、運営者の所在地を管轄する裁判所を専属的合意管轄とします。
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-slate-800 mb-3">11. お問い合わせ</h2>
          <p>本規約に関するお問い合わせは下記までお願いします。</p>
          <p className="mt-2 font-semibold text-indigo-700">m1n40suf1xless@gmail.com</p>
        </section>
      </div>

      <div className="mt-12 mb-4 text-center">
        <Link href="/privacy" className="text-sm text-indigo-600 hover:underline">
          プライバシーポリシーはこちら →
        </Link>
      </div>
    </div>
  );
}
