/**
 * data/services.ts
 * ================
 * 日本向けサービスDB。30件の主要サブスク・固定費サービスを定義する。
 *
 * 運用ルール:
 * - 料金・解約手順は変更される可能性がある。各 cancellationNotes に免責文を記載。
 * - 金額はすべて円・税込の月額換算値。
 * - 年額サービス（Microsoft 365 等）は月額換算額を defaultAmountMonthly に入れ、
 *   defaultBillingCycle: 'monthly' として扱う（MVPの簡略化方針）。
 * - duplicateGroupId は重複検出に使う。同グループが2件以上登録されると警告する。
 *
 * ⚠️ 免責:
 * このファイルの料金・解約URL・解約手順は参考情報です。
 * 実際の料金・手順は各サービスの公式サイトでご確認ください。
 */

import type { ServiceTemplate } from '@/types';

// ================================================================
// 共通注意文（各サービスの cancellationNotes に付加する）
// ================================================================

const DISCLAIMER =
  '料金・解約方法は変更される場合があります。最終的には公式サイトをご確認ください。';

// ================================================================
// サービスDB
// ================================================================

export const SERVICES: ServiceTemplate[] = [

  // ============================================================
  // 動画・映像（video）— 6件
  // duplicateGroupId: 'video_svod_jp'
  // ============================================================

  {
    id: 'netflix-standard',
    name: 'Netflix スタンダード',
    nameKana: 'ねっとふりっくす すたんだーど',
    category: 'video',
    iconUrl: 'https://www.google.com/s2/favicons?domain=netflix.com&sz=64',
    defaultAmountMonthly: 1590,
    defaultBillingCycle: 'monthly',
    duplicateGroupId: 'video_svod_jp',
    cancellationUrl: 'https://www.netflix.com/cancelplan',
    cancellationDifficulty: 'easy',
    cancellationSteps: `1. Netflixにログインする
2. 画面右上のアイコン →「アカウント」を選択
3.「メンバーシップのキャンセル」をクリック
4.「キャンセルを続行する」→「メンバーシップをキャンセル」をクリック`,
    cancellationNotes: `解約後も請求期間末日まで視聴できます。\n${DISCLAIMER}`,
  },

  {
    id: 'unext',
    name: 'U-NEXT',
    nameKana: 'ゆーねくすと',
    category: 'video',
    iconUrl: 'https://www.google.com/s2/favicons?domain=unext.jp&sz=64',
    defaultAmountMonthly: 2189,
    defaultBillingCycle: 'monthly',
    duplicateGroupId: 'video_svod_jp',
    cancellationUrl: 'https://video.unext.jp/my/cancelService',
    cancellationDifficulty: 'easy',
    cancellationSteps: `1. U-NEXTにログインする
2. マイページ →「契約内容の確認・変更」を選択
3.「解約する」をクリック
4. 解約理由を選択して「解約する」をクリック`,
    cancellationNotes: `解約後も月末まで視聴できます。ポイントは失効します。\n${DISCLAIMER}`,
  },

  {
    id: 'disney-plus',
    name: 'Disney+',
    nameKana: 'でぃずにーぷらす',
    category: 'video',
    iconUrl: 'https://www.google.com/s2/favicons?domain=disneyplus.com&sz=64',
    defaultAmountMonthly: 990,
    defaultBillingCycle: 'monthly',
    duplicateGroupId: 'video_svod_jp',
    cancellationUrl: 'https://www.disneyplus.com/account',
    cancellationDifficulty: 'easy',
    cancellationSteps: `1. Disney+にログインする
2. 画面右上のアイコン →「アカウント」を選択
3.「サブスクリプション」→「解約する」をクリック
4. 確認画面で「解約する」をクリック`,
    cancellationNotes: `解約後も請求期間末日まで視聴できます。\n${DISCLAIMER}`,
  },

  {
    id: 'hulu',
    name: 'Hulu',
    nameKana: 'ふーる',
    category: 'video',
    iconUrl: 'https://www.google.com/s2/favicons?domain=hulu.jp&sz=64',
    defaultAmountMonthly: 1026,
    defaultBillingCycle: 'monthly',
    duplicateGroupId: 'video_svod_jp',
    cancellationUrl: 'https://www.hulu.jp/account',
    cancellationDifficulty: 'easy',
    cancellationSteps: `1. Huluにログインする
2. アカウントページ →「Huluを解約する」をクリック
3. 解約理由を選択して「解約する」をクリック`,
    cancellationNotes: `解約後も月末まで視聴できます。\n${DISCLAIMER}`,
  },

  {
    id: 'amazon-prime-video',
    name: 'Amazon Prime Video',
    nameKana: 'あまぞんぷらいむびでお',
    category: 'video',
    iconUrl: 'https://www.google.com/s2/favicons?domain=amazon.co.jp&sz=64',
    defaultAmountMonthly: 600,
    defaultBillingCycle: 'monthly',
    duplicateGroupId: 'video_svod_jp',
    cancellationUrl: 'https://www.amazon.co.jp/mc',
    cancellationDifficulty: 'medium',
    cancellationSteps: `1. Amazonにログインする
2.「アカウント&リスト」→「プライム会員情報」を選択
3.「プライム会員をやめる」をクリック
4. 確認画面の手順に従って解約を完了する`,
    cancellationNotes: `Prime Video 単体ではなく Amazon Prime 全体の解約になります。配送特典・Music・Reading なども同時に失効します。\n${DISCLAIMER}`,
  },

  {
    id: 'abema-premium',
    name: 'ABEMAプレミアム',
    nameKana: 'あべまぷれみあむ',
    category: 'video',
    iconUrl: 'https://www.google.com/s2/favicons?domain=abema.tv&sz=64',
    defaultAmountMonthly: 960,
    defaultBillingCycle: 'monthly',
    duplicateGroupId: 'video_svod_jp',
    cancellationUrl: 'https://abema.tv/settings',
    cancellationDifficulty: 'easy',
    cancellationSteps: `1. ABEMAにログインする
2. 設定 →「プレミアム」を選択
3.「解約する」をクリック
4. 解約理由を選択して完了する`,
    cancellationNotes: `解約後も請求期間末日まで利用できます。\n${DISCLAIMER}`,
  },

  // ============================================================
  // 音楽（music）— 4件
  // duplicateGroupId: 'music_streaming_jp'
  // ============================================================

  {
    id: 'spotify-premium',
    name: 'Spotify プレミアム',
    nameKana: 'すぽてぃふぁい ぷれみあむ',
    category: 'music',
    iconUrl: 'https://www.google.com/s2/favicons?domain=spotify.com&sz=64',
    defaultAmountMonthly: 980,
    defaultBillingCycle: 'monthly',
    duplicateGroupId: 'music_streaming_jp',
    cancellationUrl: 'https://www.spotify.com/jp/account/subscription/cancel/',
    cancellationDifficulty: 'easy',
    cancellationSteps: `1. Spotifyアカウントページ（account.spotify.com）にログインする
2.「プランを管理」→「プレミアムをキャンセル」をクリック
3.「プレミアムをキャンセル」をクリックして完了する`,
    cancellationNotes: `キャンセル後も請求期間末日まで利用できます。\n${DISCLAIMER}`,
  },

  {
    id: 'apple-music',
    name: 'Apple Music 個人',
    nameKana: 'あっぷるみゅーじっく こじん',
    category: 'music',
    iconUrl: 'https://www.google.com/s2/favicons?domain=apple.com&sz=64',
    defaultAmountMonthly: 1080,
    defaultBillingCycle: 'monthly',
    duplicateGroupId: 'music_streaming_jp',
    cancellationUrl: 'https://appleid.apple.com/account/manage',
    cancellationDifficulty: 'easy',
    cancellationSteps: `【iPhoneの場合】
1.「設定」→ 自分の名前（Apple ID）をタップ
2.「サブスクリプション」をタップ
3. Apple Music を選択
4.「サブスクリプションをキャンセルする」をタップ

【Webの場合】
1. appleid.apple.com にログイン
2.「メディアとアプリ」→「サブスクリプションを管理」
3. Apple Music を選択して解約`,
    cancellationNotes: `解約後も請求期間末日まで利用できます。\n${DISCLAIMER}`,
  },

  {
    id: 'amazon-music-unlimited',
    name: 'Amazon Music Unlimited',
    nameKana: 'あまぞんみゅーじっく あんりみてっど',
    category: 'music',
    iconUrl: 'https://www.google.com/s2/favicons?domain=music.amazon.co.jp&sz=64',
    defaultAmountMonthly: 980,
    defaultBillingCycle: 'monthly',
    duplicateGroupId: 'music_streaming_jp',
    cancellationUrl: 'https://www.amazon.co.jp/musicunlimited/your-account',
    cancellationDifficulty: 'easy',
    cancellationSteps: `1. Amazonにログインする
2.「アカウント&リスト」→「Music Unlimitedの管理」を選択
3.「解約する」または「キャンセル」をクリック
4. 確認画面で解約を完了する`,
    cancellationNotes: `解約後も請求期間末日まで利用できます。\n${DISCLAIMER}`,
  },

  {
    id: 'youtube-music-premium',
    name: 'YouTube Music Premium',
    nameKana: 'ゆーちゅーぶみゅーじっく ぷれみあむ',
    category: 'music',
    iconUrl: 'https://www.google.com/s2/favicons?domain=music.youtube.com&sz=64',
    defaultAmountMonthly: 980,
    defaultBillingCycle: 'monthly',
    duplicateGroupId: 'music_streaming_jp',
    cancellationUrl: 'https://myaccount.google.com/payments-and-subscriptions',
    cancellationDifficulty: 'easy',
    cancellationSteps: `1. Googleアカウントにログインする
2. myaccount.google.com →「お支払いとサブスクリプション」→「サブスクリプション」
3. YouTube Music Premium を選択
4.「定期購入を解約」をクリックして完了する`,
    cancellationNotes: `YouTube Premium に含まれている場合は YouTube Premium 全体の解約になります。\n${DISCLAIMER}`,
  },

  // ============================================================
  // AI・生成AI（ai）— 4件
  // duplicateGroupId: 'ai_assistant_jp'
  // ============================================================

  {
    id: 'chatgpt-plus',
    name: 'ChatGPT Plus',
    nameKana: 'ちゃっとじーぴーてぃー ぷらす',
    category: 'ai',
    iconUrl: 'https://www.google.com/s2/favicons?domain=openai.com&sz=64',
    defaultAmountMonthly: 3000,
    defaultBillingCycle: 'monthly',
    duplicateGroupId: 'ai_assistant_jp',
    cancellationUrl: 'https://chat.openai.com/my-account/billing',
    cancellationDifficulty: 'easy',
    cancellationSteps: `1. ChatGPTにログインする
2. 画面左下のプロフィールアイコン →「マイプラン」を選択
3.「プランをキャンセル」をクリック
4. 確認画面で「キャンセルを確認」をクリック`,
    cancellationNotes: `解約後も請求期間末日まで Plus 機能を利用できます。\n${DISCLAIMER}`,
  },

  {
    id: 'claude-pro',
    name: 'Claude Pro',
    nameKana: 'くろーど ぷろ',
    category: 'ai',
    iconUrl: 'https://www.google.com/s2/favicons?domain=claude.ai&sz=64',
    defaultAmountMonthly: 3000,
    defaultBillingCycle: 'monthly',
    duplicateGroupId: 'ai_assistant_jp',
    cancellationUrl: 'https://claude.ai/settings',
    cancellationDifficulty: 'easy',
    cancellationSteps: `1. claude.ai にログインする
2. 画面左下のメニュー →「プランと請求」を選択
3.「サブスクリプションをキャンセル」をクリック
4. 確認画面で「解約する」をクリック`,
    cancellationNotes: `解約後も請求期間末日まで Pro 機能を利用できます。\n${DISCLAIMER}`,
  },

  {
    id: 'gemini-advanced',
    name: 'Gemini Advanced',
    nameKana: 'じぇみにあどばんすど',
    category: 'ai',
    iconUrl: 'https://www.google.com/s2/favicons?domain=gemini.google.com&sz=64',
    defaultAmountMonthly: 2900,
    defaultBillingCycle: 'monthly',
    duplicateGroupId: 'ai_assistant_jp',
    cancellationUrl: 'https://one.google.com/about/plans',
    cancellationDifficulty: 'easy',
    cancellationSteps: `1. Googleアカウントにログインする
2. one.google.com →「プランを管理」を選択
3. Google One（Gemini Advanced 込み）の「解約」をクリック
4. 画面の指示に従って解約を完了する`,
    cancellationNotes: `Gemini Advanced は Google One プレミアムプランに含まれています。解約すると Google One の特典も失効します。\n${DISCLAIMER}`,
  },

  {
    id: 'copilot-pro',
    name: 'Copilot Pro',
    nameKana: 'こぱいろっと ぷろ',
    category: 'ai',
    iconUrl: 'https://www.google.com/s2/favicons?domain=microsoft.com&sz=64',
    defaultAmountMonthly: 3200,
    defaultBillingCycle: 'monthly',
    duplicateGroupId: 'ai_assistant_jp',
    cancellationUrl: 'https://account.microsoft.com/services',
    cancellationDifficulty: 'easy',
    cancellationSteps: `1. Microsoft アカウントにログインする
2. account.microsoft.com →「サービスとサブスクリプション」を選択
3. Copilot Pro を見つけて「キャンセル」をクリック
4. 確認画面で解約を完了する`,
    cancellationNotes: `解約後も請求期間末日まで利用できます。\n${DISCLAIMER}`,
  },

  // ============================================================
  // クラウドストレージ（cloud）— 4件
  // duplicateGroupId: 'cloud_storage_jp'
  // ============================================================

  {
    id: 'icloud-50gb',
    name: 'iCloud+ 50GB',
    nameKana: 'あいくらうどぷらす ごじゅうじーびー',
    category: 'cloud',
    iconUrl: 'https://www.google.com/s2/favicons?domain=icloud.com&sz=64',
    defaultAmountMonthly: 130,
    defaultBillingCycle: 'monthly',
    duplicateGroupId: 'cloud_storage_jp',
    cancellationUrl: 'https://appleid.apple.com/account/manage',
    cancellationDifficulty: 'easy',
    cancellationSteps: `【iPhoneの場合】
1.「設定」→ 自分の名前 →「iCloud」→「ストレージプランを管理」
2.「ストレージプランを変更」→「無料の 5GB」を選択
3.「ダウングレード」をタップして完了`,
    cancellationNotes: `ダウングレード後に 5GB を超えるデータがある場合、新しい写真やデータのバックアップができなくなります。\n${DISCLAIMER}`,
  },

  {
    id: 'icloud-200gb',
    name: 'iCloud+ 200GB',
    nameKana: 'あいくらうどぷらす にひゃくじーびー',
    category: 'cloud',
    iconUrl: 'https://www.google.com/s2/favicons?domain=icloud.com&sz=64',
    defaultAmountMonthly: 400,
    defaultBillingCycle: 'monthly',
    duplicateGroupId: 'cloud_storage_jp',
    cancellationUrl: 'https://appleid.apple.com/account/manage',
    cancellationDifficulty: 'easy',
    cancellationSteps: `【iPhoneの場合】
1.「設定」→ 自分の名前 →「iCloud」→「ストレージプランを管理」
2.「ストレージプランを変更」→ より小さいプランまたは「無料の 5GB」を選択
3.「ダウングレード」をタップして完了`,
    cancellationNotes: `ダウングレード後に容量を超えるデータがある場合、新しいデータのバックアップができなくなります。\n${DISCLAIMER}`,
  },

  {
    id: 'google-one-100gb',
    name: 'Google One 100GB',
    nameKana: 'ぐーぐるわん ひゃくじーびー',
    category: 'cloud',
    iconUrl: 'https://www.google.com/s2/favicons?domain=one.google.com&sz=64',
    defaultAmountMonthly: 250,
    defaultBillingCycle: 'monthly',
    duplicateGroupId: 'cloud_storage_jp',
    cancellationUrl: 'https://one.google.com/storage',
    cancellationDifficulty: 'easy',
    cancellationSteps: `1. one.google.com にアクセスしてログインする
2.「プランを管理」→「無料のストレージにダウングレード」を選択
3. 確認画面で「Google One をキャンセル」をクリック`,
    cancellationNotes: `Google Drive・Gmail・Google フォトの合計容量が 15GB を超えている場合、新しいデータの保存ができなくなります。\n${DISCLAIMER}`,
  },

  {
    id: 'google-one-2tb',
    name: 'Google One 2TB',
    nameKana: 'ぐーぐるわん にてらばいと',
    category: 'cloud',
    iconUrl: 'https://www.google.com/s2/favicons?domain=one.google.com&sz=64',
    defaultAmountMonthly: 1300,
    defaultBillingCycle: 'monthly',
    duplicateGroupId: 'cloud_storage_jp',
    cancellationUrl: 'https://one.google.com/storage',
    cancellationDifficulty: 'easy',
    cancellationSteps: `1. one.google.com にアクセスしてログインする
2.「プランを管理」→「無料のストレージにダウングレード」を選択
3. 確認画面で「Google One をキャンセル」をクリック`,
    cancellationNotes: `保存データが 15GB を超えている場合、事前にデータを整理するか、外部ストレージへの移行をご検討ください。\n${DISCLAIMER}`,
  },

  // ============================================================
  // ソフトウェア・ツール（software）— 4件
  // ============================================================

  {
    id: 'adobe-creative-cloud',
    name: 'Adobe Creative Cloud',
    nameKana: 'あどびくりえいてぃぶくらうど',
    category: 'software',
    iconUrl: 'https://www.google.com/s2/favicons?domain=adobe.com&sz=64',
    defaultAmountMonthly: 6028,
    defaultBillingCycle: 'monthly',
    cancellationUrl: 'https://account.adobe.com/plans',
    cancellationDifficulty: 'hard',
    cancellationSteps: `1. Adobe.com にログインする
2.「アカウント」→「プランを管理」を選択
3. 解約したいプランの「プランをキャンセル」をクリック
4. 画面の指示に従って解約手続きを完了する`,
    cancellationNotes: `⚠️ 年間プラン（月払い）の場合、中途解約に違約金（残り期間の料金の50%）が発生する場合があります。年間プランの更新前（更新日の14日前まで）に解約すると違約金なしで解約できます。\n${DISCLAIMER}`,
  },

  {
    id: 'microsoft-365-personal',
    name: 'Microsoft 365 Personal',
    nameKana: 'まいくろそふとさんびゃくろくじゅうご ぱーそなる',
    category: 'software',
    iconUrl: 'https://www.google.com/s2/favicons?domain=microsoft.com&sz=64',
    defaultAmountMonthly: 1082, // 12,984円/年 ÷ 12（月額換算）
    defaultBillingCycle: 'monthly',
    cancellationUrl: 'https://account.microsoft.com/services',
    cancellationDifficulty: 'easy',
    cancellationSteps: `1. Microsoft アカウントにログインする
2. account.microsoft.com →「サービスとサブスクリプション」を選択
3. Microsoft 365 Personal を見つけて「キャンセル」をクリック
4. 確認画面で解約を完了する`,
    cancellationNotes: `年間サブスクリプションの場合、次回更新日まで利用できます。Word・Excel・PowerPoint などが利用できなくなります。\n${DISCLAIMER}`,
  },

  {
    id: 'notion-plus',
    name: 'Notion Plus',
    nameKana: 'のーしょん ぷらす',
    category: 'software',
    iconUrl: 'https://www.google.com/s2/favicons?domain=notion.so&sz=64',
    defaultAmountMonthly: 1650,
    defaultBillingCycle: 'monthly',
    cancellationUrl: 'https://www.notion.so/my-account',
    cancellationDifficulty: 'easy',
    cancellationSteps: `1. Notion にログインする
2. 左サイドバー下部の「設定」→「プラン」を選択
3.「フリープランにダウングレード」をクリック
4. 確認してダウングレードを完了する`,
    cancellationNotes: `フリープランに戻すとアップロードできるファイルサイズに制限がかかります。\n${DISCLAIMER}`,
  },

  {
    id: 'canva-pro',
    name: 'Canva Pro',
    nameKana: 'きゃんば ぷろ',
    category: 'software',
    iconUrl: 'https://www.google.com/s2/favicons?domain=canva.com&sz=64',
    defaultAmountMonthly: 1700,
    defaultBillingCycle: 'monthly',
    cancellationUrl: 'https://www.canva.com/settings/purchase-history',
    cancellationDifficulty: 'easy',
    cancellationSteps: `1. Canva にログインする
2. 右上のアイコン →「アカウント設定」→「プランと請求」を選択
3.「プランをキャンセル」をクリック
4. 確認画面でキャンセルを完了する`,
    cancellationNotes: `解約後も請求期間末日まで Pro 機能を利用できます。Pro 素材を使ったデザインはダウンロード済みのものは引き続き使用可能です。\n${DISCLAIMER}`,
  },

  // ============================================================
  // 電子書籍・マンガ（book）— 2件
  // ============================================================

  {
    id: 'kindle-unlimited',
    name: 'Kindle Unlimited',
    nameKana: 'きんどる あんりみてっど',
    category: 'book',
    iconUrl: 'https://www.google.com/s2/favicons?domain=amazon.co.jp&sz=64',
    defaultAmountMonthly: 980,
    defaultBillingCycle: 'monthly',
    cancellationUrl: 'https://www.amazon.co.jp/hz/mycd/myx#/home/kindle/unlimited',
    cancellationDifficulty: 'easy',
    cancellationSteps: `1. Amazonにログインする
2.「アカウント&リスト」→「Kindle Unlimited の管理」を選択
3.「メンバーシップをキャンセル」をクリック
4. 確認画面でキャンセルを完了する`,
    cancellationNotes: `解約後は読み放題タイトルへのアクセスが終了します。購入済みの本は引き続き読めます。\n${DISCLAIMER}`,
  },

  {
    id: 'rakuten-magazine',
    name: '楽天マガジン',
    nameKana: 'らくてんまがじん',
    category: 'book',
    iconUrl: 'https://www.google.com/s2/favicons?domain=magazine.rakuten.co.jp&sz=64',
    defaultAmountMonthly: 418,
    defaultBillingCycle: 'monthly',
    cancellationUrl: 'https://magazine.rakuten.co.jp/resignation/',
    cancellationDifficulty: 'easy',
    cancellationSteps: `1. 楽天マガジンにログインする
2. サービストップ →「解約はこちら」を選択
3. 画面の指示に従って解約手続きを完了する`,
    cancellationNotes: `解約後も月末まで利用できます。\n${DISCLAIMER}`,
  },

  // ============================================================
  // ジム・フィットネス（gym）— 2件
  // ============================================================

  {
    id: 'anytime-fitness',
    name: 'エニタイムフィットネス',
    nameKana: 'えにたいむふぃっとねす',
    category: 'gym',
    iconUrl: 'https://www.google.com/s2/favicons?domain=anytimefitness.co.jp&sz=64',
    defaultAmountMonthly: 7700,
    defaultBillingCycle: 'monthly',
    cancellationDifficulty: 'medium',
    cancellationSteps: `1. 入会した店舗または最寄りのエニタイムフィットネスへ直接出向く
2. スタッフに退会を申し出る
3. 退会届に記入して手続きを完了する
※ 月末までに手続きすると翌月から退会となることが多いですが、店舗によって異なります`,
    cancellationNotes: `⚠️ エニタイムフィットネスは店舗での手続きが必要です。Webでの解約はできません。退会月の月会費は全額発生する場合があります。店舗によってルールが異なるため、事前に電話確認をおすすめします。\n${DISCLAIMER}`,
  },

  {
    id: 'apple-fitness-plus',
    name: 'Apple Fitness+',
    nameKana: 'あっぷるふぃっとねすぷらす',
    category: 'gym',
    iconUrl: 'https://www.google.com/s2/favicons?domain=apple.com&sz=64',
    defaultAmountMonthly: 1200,
    defaultBillingCycle: 'monthly',
    cancellationUrl: 'https://appleid.apple.com/account/manage',
    cancellationDifficulty: 'easy',
    cancellationSteps: `【iPhoneの場合】
1.「設定」→ 自分の名前 →「サブスクリプション」をタップ
2. Apple Fitness+ を選択
3.「サブスクリプションをキャンセルする」をタップ

【Webの場合】
1. appleid.apple.com にログイン
2.「メディアとアプリ」→「サブスクリプションを管理」
3. Apple Fitness+ を選択して解約`,
    cancellationNotes: `Apple One に含まれている場合は Apple One 全体の変更が必要です。\n${DISCLAIMER}`,
  },

  // ============================================================
  // 学習・語学（education）— 2件
  // ============================================================

  {
    id: 'duolingo-super',
    name: 'Duolingo Super',
    nameKana: 'でゅおりんご すーぱー',
    category: 'education',
    iconUrl: 'https://www.google.com/s2/favicons?domain=duolingo.com&sz=64',
    defaultAmountMonthly: 916, // 年額プランの月換算（10,990円/年 ÷ 12）
    defaultBillingCycle: 'monthly',
    cancellationUrl: 'https://www.duolingo.com/settings/super',
    cancellationDifficulty: 'easy',
    cancellationSteps: `【App Store（iPhone）の場合】
1.「設定」→ 自分の名前 →「サブスクリプション」をタップ
2. Duolingo Super を選択
3.「サブスクリプションをキャンセルする」をタップ

【Google Playの場合】
1. Google Play アプリ →「アカウント」→「定期購入」
2. Duolingo を選択して「解約」

【Webの場合】
1. duolingo.com の設定 →「Super Duolingo」から解約`,
    cancellationNotes: `解約後は広告が表示されるフリープランに戻ります。学習データは引き続き保存されます。\n${DISCLAIMER}`,
  },

  {
    id: 'studysapuri',
    name: 'スタディサプリ',
    nameKana: 'すたでぃさぷり',
    category: 'education',
    iconUrl: 'https://www.google.com/s2/favicons?domain=studysapuri.jp&sz=64',
    defaultAmountMonthly: 2178,
    defaultBillingCycle: 'monthly',
    cancellationUrl: 'https://studysapuri.jp/service/mypage/',
    cancellationDifficulty: 'easy',
    cancellationSteps: `1. スタディサプリにログインする
2. マイページ →「サブスクリプション管理」を選択
3.「解約する」をクリック
4. 確認画面で解約を完了する`,
    cancellationNotes: `解約後も当月末まで利用できます。進捗データは保存されます。\n${DISCLAIMER}`,
  },

  // ============================================================
  // ニュース・情報（news）— 2件
  // ============================================================

  {
    id: 'nikkei-digital',
    name: '日経電子版',
    nameKana: 'にっけいでんしばん',
    category: 'news',
    iconUrl: 'https://www.google.com/s2/favicons?domain=nikkei.com&sz=64',
    defaultAmountMonthly: 4277,
    defaultBillingCycle: 'monthly',
    cancellationUrl: 'https://r.nikkei.com/my/help/purchase/',
    cancellationDifficulty: 'medium',
    cancellationSteps: `1. 日経電子版にログインする
2. マイページ →「購読・契約内容の確認」を選択
3.「解約・変更」の手順に従って手続きを完了する`,
    cancellationNotes: `解約後も当月末まで閲覧できます。月末が近い場合は翌月まで待つか、月初に解約手続きをすることをおすすめします。\n${DISCLAIMER}`,
  },

  {
    id: 'newspicks-premium',
    name: 'NewsPicks プレミアム',
    nameKana: 'にゅーずぴっくす ぷれみあむ',
    category: 'news',
    iconUrl: 'https://www.google.com/s2/favicons?domain=newspicks.com&sz=64',
    defaultAmountMonthly: 1500,
    defaultBillingCycle: 'monthly',
    cancellationUrl: 'https://newspicks.com/settings/plan',
    cancellationDifficulty: 'easy',
    cancellationSteps: `1. NewsPicks にログインする
2. マイページ →「プレミアム会員設定」を選択
3.「解約する」をクリック
4. 解約理由を選択して完了する`,
    cancellationNotes: `解約後も当月末まで利用できます。\n${DISCLAIMER}`,
  },

];

// ================================================================
// エクスポート：件数確認用
// ================================================================

/** 登録サービス件数。30件であることを確認する定数。 */
export const SERVICES_COUNT = SERVICES.length;
