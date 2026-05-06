# FixLess プロジェクト引継ぎ

> このドキュメントは Claude や他の AI エージェントがセッションを跨いで作業する際の引継ぎ用です。
> Next.js 固有のルールは [AGENTS.md](./AGENTS.md) を参照。

## プロジェクト概要

- **アプリ名**: FixLess（日本向けサブスク・固定費節約アプリ）
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

### Phase 3（最新セッション）
- **Service Worker キャッシュ問題の解消**: `public/sw.js` に自爆 SW を配置、`next.config.ts` に `Cache-Control: no-store` を追加
- **AuthProvider にタイムアウト保険を追加**: `getSession()` が固まる場合に備えて 5 秒タイムアウト
- **メール+パスワードログイン実装**: `/login` ページを新規作成、Google + メール両方選択可能
- **AuthProvider に `signInWithEmail` / `signUpWithEmail` メソッド追加**
- **LoginButton をログインページへ遷移する形に変更**（`/login` で Google or メール選択）

---

## ファイル構成（主要）
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

### 既知の課題
- `public/icon-192.png` が無く、コンソールに 404 が出る（PWA アイコン未設置、機能には影響なし）
- Google OAuth がテストモードのため、追加ユーザーは Google Cloud Console でテストユーザー登録が必要

---

## 次にやる候補

優先度や好みに合わせて選択:

- **OAuth 同意画面を Production に切り替え**: 誰でも Google ログインできるように
- **PWA アイコン（icon-192.png）を作成して配置**: コンソールエラー解消
- **パスワードリセット機能**: メールでリセットリンク送信
- **他の OAuth プロバイダ追加**: Apple、GitHub など
- **本番運用前のチェックリスト**: メール SMTP 設定、エラーハンドリング、E2E テスト

---

## セッションの履歴

最後の編集: 2026-05-07（Phase 3 完了）