# FixLess プロジェクト引継ぎ

> このドキュメントは Claude や他の AI エージェントがセッションを跨いで作業する際の引継ぎ用です。
> Next.js 固有のルールは [AGENTS.md](./AGENTS.md) を参照。

## プロジェクト概要

- **アプリ名**: FixLess（フリーランス・副業者向け SaaS・サブスク経費見える化アプリ）
- **公開 URL**: https://fixless-zeta.vercel.app/
- **GitHub**: https://github.com/H01M1/fixless
- **技術スタック**: Next.js 16.2.4 (Turbopack), React 19.2.4, TypeScript, Tailwind CSS v4, Supabase, Vercel

---

## 完成した機能

### Phase 1
- サブスク一覧・追加・削除
- OCR スクリーンショット取り込み（tesseract.js）
- 代替サービス提案
- 節約候補表示
- 次回請求日管理

### Phase 2
- Supabase クライアント / アダプター実装
- localStorage → Supabase 移行処理
- Google OAuth ログイン
- ユーザーアバター・ログアウトメニュー
- 3 件以上でクラウド保存促進バナー（SyncPrompt）

### Phase 3
- **Service Worker キャッシュ問題の解消**: `public/sw.js` に自爆 SW を配置、`next.config.ts` に `Cache-Control: no-store` を追加
- **AuthProvider にタイムアウト保険を追加**: `getSession()` が固まる場合に備えて 5 秒タイムアウト
- **メール+パスワードログイン実装**: `/login` ページを新規作成、Google + メール両方選択可能
- **AuthProvider に `signInWithEmail` / `signUpWithEmail` メソッド追加**
- **LoginButton をログインページへ遷移する形に変更**（`/login` で Google or メール選択）

### Phase 3.1（同一セッション内の追加作業）
- **ピボット**: メインコピーを「SaaS・サブスク経費を見える化」に変更（フリーランス・副業者向け）
- **メタデータ更新**: タイトル・description・キーワードをフリーランス向けに調整
- **年額をヒーロー数値に**: SummaryCard を再設計、年間コストを最大表示
- **カテゴリ重複検出 UI**: `components/dashboard/DuplicateAlerts.tsx` を新規作成、ホーム画面に表示
- **サービス DB 拡充（+16 サービス）**: Perplexity, Dropbox, Figma, GitHub, Vercel, Cursor, Supabase, Google Workspace, Slack, Zoom, freee, マネーフォワード, 弥生, Udemy, Skillshare, Schoo

---

## 重要な設定情報

### Supabase
- **プロジェクト URL**: `https://cbxoowtdyokkgavcicyl.supabase.co`
- **Anon Key**: ハードコード済み（`lib/supabase/client.ts` と `app/auth/callback/route.ts`）
- **subscriptions テーブル**: 作成済み（RLS 設定済み）
- **Google OAuth**: 有効
- **Email Auth**: 有効（パスワード最低 6 文字、Confirm email デフォルト ON）
- **Redirect URLs**: `https://*.vercel.app/auth/callback` 追加済み

### Google Cloud Console
- **クライアント ID**: `915750432818-020o1e2ornlrkq9dvu0shf4m9k7p3d9m.apps.googleusercontent.com`
- **テストユーザー**: `tosaka720@gmail.com` 追加済み
- **公開状態**: テストモード（テストユーザーリストに登録されたメアドのみログイン可）

### Vercel
- **環境変数**: `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` 設定済み（ただしハードコードを優先）

---

## 重要な技術的注意事項

### ① Supabase URL/Key はハードコード
環境変数が正しく埋め込まれない問題があったため、`lib/supabase/client.ts` と `app/auth/callback/route.ts` に直接記述している。

### ② useSubscriptions のアダプター切り替え
```typescript
const adapter = useMemo(() => {
  if (user) return new SupabaseAdapter(user.id);
  return localStorageAdapter;
}, [user]);
```

### ③ Service Worker は使っていない（自爆 SW のみ）
過去のデプロイで PWA SW を登録した名残があるユーザーのために `public/sw.js` に自爆コードを置いている。新規ユーザーには登録されない。`next.config.ts` で `/sw.js` のキャッシュを無効化済み。

### ④ AuthProvider のタイムアウト保険
`getSession()` が稀に Promise を解決せずに固まる現象が発生したため、5 秒タイムアウトで強制的に `loading=false` にする保険コードを入れている。

### ⑤ localStorageAdapter のエクスポート名
`lib/storage.ts` のエクスポート名は `localStorageAdapter`（小文字始まり、インスタンス）。

### ⑥ 重複検出ロジックの構造
`lib/savings.ts` の `detectDuplicates()` は 2 段階。
- Step 1: `duplicateGroupId`（精密、例: ai_assistant_jp, cloud_storage_jp, accounting_jp）
- Step 2: `category`（フォールバック）
- 除外カテゴリ: insurance, utility, mobile（複数契約が前提のため）
- UI 表示は `components/dashboard/DuplicateAlerts.tsx` がカード形式で並べる

---

## 現在の動作状況

### 動作確認済み
- ✅ Google OAuth ログイン
- ✅ メール+パスワード新規登録（確認メール送信）
- ✅ メール+パスワードログイン
- ✅ 自動セッション復元
- ✅ サブスクの Supabase 保存
- ✅ ログアウトでゲストモードに戻る
- ✅ 通常ブラウザでの表示（Service Worker 問題は解消済み）
- ✅ カテゴリ単位の重複検出 UI 表示
- ✅ サービス DB 検索で新規 16 サービスがヒット

### 既知の課題
- `public/icon-192.png` が無く、コンソールに 404 が出る（PWA アイコン未設置、機能には影響なし）
- Google OAuth がテストモードのため、追加ユーザーは Google Cloud Console でテストユーザー登録が必要

---

## 次にやる候補

優先度や好みに合わせて選択:

- **オンボーディング改善（項目 5）**: 職業選択 → よく使うツール選択 → 月額入力で価値即体験
- **無料/Pro プラン分け（項目 6）**: 無料 3 件まで、Pro 月 500 円で無制限など
- **請求日前通知（項目 7）**: メール通知（無料 SMTP は要設定）
- **CSV 出力・経費メモ（項目 8）**: 経費カテゴリ・按分メモ・領収書 URL
- **サンプルデータ・デモ体験（項目 9）**: 未登録時に「デモを見る」で例を表示
- **OAuth 同意画面を Production に切り替え**: 誰でも Google ログインできるように
- **PWA アイコン（icon-192.png）を作成して配置**: コンソールエラー解消
- **パスワードリセット機能**: メールでリセットリンク送信
- **他の OAuth プロバイダ追加**: Apple、GitHub など
- **本番運用前のチェックリスト**: メール SMTP 設定、エラーハンドリング、E2E テスト

---

## セッションの履歴

最後の編集: 2026-05-07（Phase 3.1 完了 / フリーランス・副業向けピボット + サービス DB 拡充）