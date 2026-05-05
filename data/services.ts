/**
 * data/services.ts
 * ================
 * 日本向けサービスDB。
 *
 * v2.2 変更点:
 * - App Store 経由サービスに aliases を追加（OCRマッチング精度向上）
 */

import type { ServiceTemplate } from '@/types';

const DISCLAIMER =
  '料金・解約方法は変更される場合があります。最終的には公式サイトをご確認ください。';

export const SERVICES: ServiceTemplate[] = [

  // ============================================================
  // 動画・映像（video）
  // ============================================================

  {
    id: 'netflix',
    name: 'Netflix',
    nameKana: 'ねっとふりっくす',
    category: 'video',
    provider: 'Netflix',
    appStoreLikely: true,
    aliases: ['ネットフリックス', 'net flix', 'netflix japan'],
    iconUrl: 'https://www.google.com/s2/favicons?domain=netflix.com&sz=64',
    defaultAmountMonthly: 1590,
    defaultBillingCycle: 'monthly',
    duplicateGroupId: 'video_svod_jp',
    plans: [
      {
        planId: 'ads-standard',
        planName: '広告つきスタンダード',
        defaultAmountMonthly: 790,
        defaultBillingCycle: 'monthly',
        description: '広告あり・FHD画質',
      },
      {
        planId: 'standard',
        planName: 'スタンダード',
        defaultAmountMonthly: 1590,
        defaultBillingCycle: 'monthly',
        description: '広告なし・FHD画質',
      },
      {
        planId: 'premium',
        planName: 'プレミアム',
        defaultAmountMonthly: 1980,
        defaultBillingCycle: 'monthly',
        description: '広告なし・4K対応・同時4画面',
      },
    ],
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
    appStoreLikely: false,
    aliases: ['ユーネクスト', 'unext japan'],
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
    appStoreLikely: true,
    aliases: ['disney', 'disney plus', 'ディズニー', 'ディズニープラス', 'disneyplus'],
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
    appStoreLikely: true,
    aliases: ['フール', 'フールー', 'hulu japan', 'hulujapan'],
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
    id: 'amazon-prime',
    name: 'Amazon Prime',
    nameKana: 'あまぞんぷらいむ',
    category: 'video',
    appStoreLikely: true,
    aliases: [
      'prime video', 'amazon prime video', 'amazonプライム',
      'アマゾンプライム', 'アマプラ', 'prime', 'プライムビデオ',
      'プライム', 'amazon prime membership',
    ],
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
    cancellationNotes: `Prime Video だけでなく配送特典・Music・Readingなども失効します。\n${DISCLAIMER}`,
  },

  {
    id: 'abema-premium',
    name: 'ABEMAプレミアム',
    nameKana: 'あべまぷれみあむ',
    category: 'video',
    appStoreLikely: true,
    aliases: ['abema', 'アベマ', 'abema premium', 'abemapremium', 'abema tv'],
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
  // 音楽（music）
  // ============================================================

  {
    id: 'spotify',
    name: 'Spotify',
    nameKana: 'すぽてぃふぁい',
    category: 'music',
    provider: 'Spotify',
    appStoreLikely: true,
    aliases: ['スポティファイ', 'spotify premium', 'spotifypremium', 'spotify individual'],
    iconUrl: 'https://www.google.com/s2/favicons?domain=spotify.com&sz=64',
    defaultAmountMonthly: 980,
    defaultBillingCycle: 'monthly',
    duplicateGroupId: 'music_streaming_jp',
    plans: [
      {
        planId: 'individual',
        planName: '個人',
        defaultAmountMonthly: 980,
        defaultBillingCycle: 'monthly',
        description: '1アカウント',
      },
      {
        planId: 'student',
        planName: '学生',
        defaultAmountMonthly: 480,
        defaultBillingCycle: 'monthly',
        description: '学生限定・要申請',
      },
      {
        planId: 'duo',
        planName: 'Duo',
        defaultAmountMonthly: 1280,
        defaultBillingCycle: 'monthly',
        description: '2アカウント（同居のみ）',
      },
      {
        planId: 'family',
        planName: 'ファミリー',
        defaultAmountMonthly: 1580,
        defaultBillingCycle: 'monthly',
        description: '最大6アカウント（同居のみ）',
      },
    ],
    cancellationUrl: 'https://www.spotify.com/jp/account/subscription/cancel/',
    cancellationDifficulty: 'easy',
    cancellationSteps: `1. Spotifyアカウントページにログインする
2.「プランを管理」→「プレミアムをキャンセル」をクリック
3.「プレミアムをキャンセル」をクリックして完了する`,
    cancellationNotes: `キャンセル後も請求期間末日まで利用できます。\n${DISCLAIMER}`,
  },

  {
    id: 'apple-music',
    name: 'Apple Music',
    nameKana: 'あっぷるみゅーじっく',
    category: 'music',
    provider: 'Apple',
    appStoreLikely: true,
    aliases: ['applemusic', 'アップルミュージック', 'apple music individual', 'apple music family', 'apple music student'],
    iconUrl: 'https://www.google.com/s2/favicons?domain=apple.com&sz=64',
    defaultAmountMonthly: 1080,
    defaultBillingCycle: 'monthly',
    duplicateGroupId: 'music_streaming_jp',
    cancellationUrl: 'https://appleid.apple.com/account/manage',
    cancellationDifficulty: 'easy',
    cancellationSteps: `【iPhoneの場合】
1.「設定」→ 自分の名前 →「サブスクリプション」をタップ
2. Apple Music を選択
3.「サブスクリプションをキャンセルする」をタップ`,
    cancellationNotes: `解約後も請求期間末日まで利用できます。\n${DISCLAIMER}`,
  },

  {
    id: 'amazon-music-unlimited',
    name: 'Amazon Music Unlimited',
    nameKana: 'あまぞんみゅーじっく あんりみてっど',
    category: 'music',
    appStoreLikely: false,
    aliases: ['amazon music', 'アマゾンミュージック', 'music unlimited'],
    iconUrl: 'https://www.google.com/s2/favicons?domain=music.amazon.co.jp&sz=64',
    defaultAmountMonthly: 980,
    defaultBillingCycle: 'monthly',
    duplicateGroupId: 'music_streaming_jp',
    cancellationUrl: 'https://www.amazon.co.jp/musicunlimited/your-account',
    cancellationDifficulty: 'easy',
    cancellationSteps: `1. Amazonにログインする
2.「アカウント&リスト」→「Music Unlimitedの管理」を選択
3.「解約する」をクリックして完了する`,
    cancellationNotes: `解約後も請求期間末日まで利用できます。\n${DISCLAIMER}`,
  },

  {
    id: 'youtube-music',
    name: 'YouTube Music',
    nameKana: 'ゆーちゅーぶみゅーじっく',
    category: 'music',
    provider: 'Google',
    appStoreLikely: true,
    aliases: ['youtube music premium', 'yt music', 'ytmusic', 'ユーチューブミュージック', 'youtubemusic'],
    iconUrl: 'https://www.google.com/s2/favicons?domain=music.youtube.com&sz=64',
    defaultAmountMonthly: 980,
    defaultBillingCycle: 'monthly',
    duplicateGroupId: 'music_streaming_jp',
    plans: [
      {
        planId: 'individual',
        planName: '個人',
        defaultAmountMonthly: 980,
        defaultBillingCycle: 'monthly',
        description: '1アカウント',
      },
      {
        planId: 'family',
        planName: 'ファミリー',
        defaultAmountMonthly: 1480,
        defaultBillingCycle: 'monthly',
        description: '最大6アカウント',
      },
      {
        planId: 'student',
        planName: '学生',
        defaultAmountMonthly: 480,
        defaultBillingCycle: 'monthly',
        description: '学生限定・要申請',
      },
    ],
    cancellationUrl: 'https://myaccount.google.com/payments-and-subscriptions',
    cancellationDifficulty: 'easy',
    cancellationSteps: `1. Googleアカウントにログインする
2. myaccount.google.com →「お支払いとサブスクリプション」
3. YouTube Music を選択 →「定期購入を解約」`,
    cancellationNotes: `YouTube Premium に含まれている場合は Premium 全体の解約になります。\n${DISCLAIMER}`,
  },

  // ============================================================
  // AI・生成AI（ai）
  // ============================================================

  {
    id: 'chatgpt',
    name: 'ChatGPT',
    nameKana: 'ちゃっとじーぴーてぃー',
    category: 'ai',
    provider: 'OpenAI',
    appStoreLikely: true,
    aliases: ['openai', 'chat gpt', 'chatgpt plus', 'chatgptplus', 'gpt plus', 'gpt4', 'openai chatgpt'],
    iconUrl: 'https://www.google.com/s2/favicons?domain=openai.com&sz=64',
    defaultAmountMonthly: 3000,
    defaultBillingCycle: 'monthly',
    duplicateGroupId: 'ai_assistant_jp',
    plans: [
      {
        planId: 'plus',
        planName: 'Plus',
        defaultAmountMonthly: 3000,
        defaultBillingCycle: 'monthly',
        description: 'GPT-4o・画像生成・プラグイン対応',
      },
      {
        planId: 'pro',
        planName: 'Pro',
        defaultAmountMonthly: 30000,
        defaultBillingCycle: 'monthly',
        description: '全モデル無制限・最高性能',
        isAmountEstimate: true,
      },
    ],
    cancellationUrl: 'https://chat.openai.com/my-account/billing',
    cancellationDifficulty: 'easy',
    cancellationSteps: `1. ChatGPTにログインする
2. 画面左下のプロフィールアイコン →「マイプラン」を選択
3.「プランをキャンセル」をクリック
4. 確認画面で「キャンセルを確認」をクリック`,
    cancellationNotes: `解約後も請求期間末日まで利用できます。\n${DISCLAIMER}`,
  },

  {
    id: 'claude',
    name: 'Claude',
    nameKana: 'くろーど',
    category: 'ai',
    provider: 'Anthropic',
    appStoreLikely: true,
    aliases: ['anthropic', 'claude pro', 'claudepro', 'claude max', 'anthropic claude'],
    iconUrl: 'https://www.google.com/s2/favicons?domain=claude.ai&sz=64',
    defaultAmountMonthly: 3000,
    defaultBillingCycle: 'monthly',
    duplicateGroupId: 'ai_assistant_jp',
    plans: [
      {
        planId: 'pro',
        planName: 'Pro',
        defaultAmountMonthly: 3000,
        defaultBillingCycle: 'monthly',
        description: '通常の5倍の利用量',
      },
      {
        planId: 'max-5x',
        planName: 'Max ×5',
        defaultAmountMonthly: 15000,
        defaultBillingCycle: 'monthly',
        description: 'Pro の5倍の利用量',
        isAmountEstimate: true,
      },
      {
        planId: 'max-20x',
        planName: 'Max ×20',
        defaultAmountMonthly: 30000,
        defaultBillingCycle: 'monthly',
        description: 'Pro の20倍の利用量',
        isAmountEstimate: true,
      },
    ],
    cancellationUrl: 'https://claude.ai/settings',
    cancellationDifficulty: 'easy',
    cancellationSteps: `1. claude.ai にログインする
2. 画面左下のメニュー →「プランと請求」を選択
3.「サブスクリプションをキャンセル」をクリック
4. 確認画面で「解約する」をクリック`,
    cancellationNotes: `解約後も請求期間末日まで利用できます。\n${DISCLAIMER}`,
  },

  {
    id: 'gemini-advanced',
    name: 'Gemini Advanced',
    nameKana: 'じぇみにあどばんすど',
    category: 'ai',
    appStoreLikely: false,
    aliases: ['gemini', 'google gemini', 'google one ai', 'gemini pro'],
    iconUrl: 'https://www.google.com/s2/favicons?domain=gemini.google.com&sz=64',
    defaultAmountMonthly: 2900,
    defaultBillingCycle: 'monthly',
    duplicateGroupId: 'ai_assistant_jp',
    cancellationUrl: 'https://one.google.com/about/plans',
    cancellationDifficulty: 'easy',
    cancellationSteps: `1. Googleアカウントにログインする
2. one.google.com →「プランを管理」を選択
3. Google One の「解約」をクリック
4. 画面の指示に従って解約を完了する`,
    cancellationNotes: `Gemini Advanced は Google One プレミアムプランに含まれています。\n${DISCLAIMER}`,
  },

  {
    id: 'copilot-pro',
    name: 'Copilot Pro',
    nameKana: 'こぱいろっとぷろ',
    category: 'ai',
    appStoreLikely: false,
    aliases: ['microsoft copilot', 'copilot', 'bing chat', 'microsoft ai'],
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
  // クラウドストレージ（cloud）
  // ============================================================

  {
    id: 'icloud',
    name: 'iCloud+',
    nameKana: 'あいくらうどぷらす',
    category: 'cloud',
    provider: 'Apple',
    appStoreLikely: true,
    aliases: [
      'icloud', 'icloud storage', 'icloudストレージ',
      'icloud drive', 'icloudplus', 'icloud backup',
      'アイクラウド', 'icloud plus',
    ],
    iconUrl: 'https://www.google.com/s2/favicons?domain=icloud.com&sz=64',
    defaultAmountMonthly: 400,
    defaultBillingCycle: 'monthly',
    duplicateGroupId: 'cloud_storage_jp',
    plans: [
      {
        planId: '50gb',
        planName: '50GB',
        defaultAmountMonthly: 130,
        defaultBillingCycle: 'monthly',
        description: '個人利用に最適',
      },
      {
        planId: '200gb',
        planName: '200GB',
        defaultAmountMonthly: 400,
        defaultBillingCycle: 'monthly',
        description: 'ファミリー共有可',
      },
      {
        planId: '2tb',
        planName: '2TB',
        defaultAmountMonthly: 1300,
        defaultBillingCycle: 'monthly',
        description: 'ファミリー共有可',
      },
      {
        planId: '6tb',
        planName: '6TB',
        defaultAmountMonthly: 3900,
        defaultBillingCycle: 'monthly',
        description: 'ファミリー共有可',
      },
      {
        planId: '12tb',
        planName: '12TB',
        defaultAmountMonthly: 7900,
        defaultBillingCycle: 'monthly',
        description: 'ファミリー共有可',
      },
    ],
    cancellationUrl: 'https://appleid.apple.com/account/manage',
    cancellationDifficulty: 'easy',
    cancellationSteps: `【iPhoneの場合】
1.「設定」→ 自分の名前 →「iCloud」→「ストレージプランを管理」
2.「ストレージプランを変更」→「無料の5GB」を選択
3.「ダウングレード」をタップして完了`,
    cancellationNotes: `保存データが5GBを超えると新しいデータのバックアップができなくなります。\n${DISCLAIMER}`,
  },

  {
    id: 'google-one',
    name: 'Google One',
    nameKana: 'ぐーぐるわん',
    category: 'cloud',
    provider: 'Google',
    appStoreLikely: false,
    aliases: ['googleone', 'グーグルワン', 'google storage', 'google drive storage'],
    iconUrl: 'https://www.google.com/s2/favicons?domain=one.google.com&sz=64',
    defaultAmountMonthly: 250,
    defaultBillingCycle: 'monthly',
    duplicateGroupId: 'cloud_storage_jp',
    plans: [
      {
        planId: '100gb',
        planName: '100GB',
        defaultAmountMonthly: 250,
        defaultBillingCycle: 'monthly',
        description: 'Drive・Gmail・フォト共通',
      },
      {
        planId: '200gb',
        planName: '200GB',
        defaultAmountMonthly: 380,
        defaultBillingCycle: 'monthly',
        description: 'Drive・Gmail・フォト共通',
      },
      {
        planId: '2tb',
        planName: '2TB',
        defaultAmountMonthly: 1300,
        defaultBillingCycle: 'monthly',
        description: 'Drive・Gmail・フォト共通',
      },
      {
        planId: 'ai-pro',
        planName: 'AI Pro',
        defaultAmountMonthly: 2900,
        defaultBillingCycle: 'monthly',
        description: '2TB + Gemini Advanced',
        isAmountEstimate: true,
      },
    ],
    cancellationUrl: 'https://one.google.com/storage',
    cancellationDifficulty: 'easy',
    cancellationSteps: `1. one.google.com にアクセスしてログインする
2.「プランを管理」→「無料のストレージにダウングレード」を選択
3. 確認画面で「Google One をキャンセル」をクリック`,
    cancellationNotes: `データが15GBを超えると新しいデータの保存ができなくなります。\n${DISCLAIMER}`,
  },

  // ============================================================
  // ソフトウェア・ツール（software）
  // ============================================================

  {
    id: 'adobe',
    name: 'Adobe',
    nameKana: 'あどび',
    category: 'software',
    provider: 'Adobe',
    appStoreLikely: false,
    aliases: ['adobe cc', 'creative cloud', 'adobecc', 'photoshop', 'illustrator', 'adobe creative cloud'],
    iconUrl: 'https://www.google.com/s2/favicons?domain=adobe.com&sz=64',
    defaultAmountMonthly: 6028,
    defaultBillingCycle: 'monthly',
    plans: [
      {
        planId: 'creative-cloud',
        planName: 'Creative Cloud（全アプリ）',
        defaultAmountMonthly: 6028,
        defaultBillingCycle: 'monthly',
        description: 'Photoshop・Illustrator など全アプリ',
        isAmountEstimate: true,
      },
      {
        planId: 'photo-plan',
        planName: 'フォトプラン',
        defaultAmountMonthly: 1180,
        defaultBillingCycle: 'monthly',
        description: 'Photoshop + Lightroom',
        isAmountEstimate: true,
      },
      {
        planId: 'photoshop',
        planName: 'Photoshop',
        defaultAmountMonthly: 3280,
        defaultBillingCycle: 'monthly',
        description: 'Photoshop 単体',
        isAmountEstimate: true,
      },
      {
        planId: 'illustrator',
        planName: 'Illustrator',
        defaultAmountMonthly: 3280,
        defaultBillingCycle: 'monthly',
        description: 'Illustrator 単体',
        isAmountEstimate: true,
      },
      {
        planId: 'acrobat-pro',
        planName: 'Acrobat Pro',
        defaultAmountMonthly: 2728,
        defaultBillingCycle: 'monthly',
        description: 'PDF編集・変換・署名',
        isAmountEstimate: true,
      },
    ],
    cancellationUrl: 'https://account.adobe.com/plans',
    cancellationDifficulty: 'hard',
    cancellationSteps: `1. Adobe.com にログインする
2.「アカウント」→「プランを管理」を選択
3. 解約したいプランの「プランをキャンセル」をクリック
4. 画面の指示に従って解約手続きを完了する`,
    cancellationNotes: `年間プラン（月払い）の場合、中途解約に違約金が発生する場合があります。更新前（14日前まで）の解約で違約金を回避できます。\n${DISCLAIMER}`,
  },

  {
    id: 'microsoft-365-personal',
    name: 'Microsoft 365 Personal',
    nameKana: 'まいくろそふとさんびゃくろくじゅうご',
    category: 'software',
    appStoreLikely: false,
    aliases: ['office 365', 'microsoft office', 'microsoft365', 'm365', 'office personal'],
    iconUrl: 'https://www.google.com/s2/favicons?domain=microsoft.com&sz=64',
    defaultAmountMonthly: 1082,
    defaultBillingCycle: 'monthly',
    cancellationUrl: 'https://account.microsoft.com/services',
    cancellationDifficulty: 'easy',
    cancellationSteps: `1. Microsoft アカウントにログインする
2. account.microsoft.com →「サービスとサブスクリプション」を選択
3. Microsoft 365 Personal を見つけて「キャンセル」をクリック`,
    cancellationNotes: `解約後、Word・Excel・PowerPointなどが利用できなくなります。\n${DISCLAIMER}`,
  },

  {
    id: 'notion-plus',
    name: 'Notion Plus',
    nameKana: 'のーしょんぷらす',
    category: 'software',
    appStoreLikely: false,
    aliases: ['notion', 'ノーション', 'notion pro', 'notion personal'],
    iconUrl: 'https://www.google.com/s2/favicons?domain=notion.so&sz=64',
    defaultAmountMonthly: 1650,
    defaultBillingCycle: 'monthly',
    cancellationUrl: 'https://www.notion.so/my-account',
    cancellationDifficulty: 'easy',
    cancellationSteps: `1. Notion にログインする
2. 左サイドバー下部の「設定」→「プラン」を選択
3.「フリープランにダウングレード」をクリック`,
    cancellationNotes: `フリープランに戻すとファイルサイズに制限がかかります。\n${DISCLAIMER}`,
  },

  {
    id: 'canva-pro',
    name: 'Canva Pro',
    nameKana: 'きゃんばぷろ',
    category: 'software',
    appStoreLikely: false,
    aliases: ['canva', 'キャンバ', 'canvapro'],
    iconUrl: 'https://www.google.com/s2/favicons?domain=canva.com&sz=64',
    defaultAmountMonthly: 1700,
    defaultBillingCycle: 'monthly',
    cancellationUrl: 'https://www.canva.com/settings/purchase-history',
    cancellationDifficulty: 'easy',
    cancellationSteps: `1. Canva にログインする
2. 右上のアイコン →「アカウント設定」→「プランと請求」を選択
3.「プランをキャンセル」をクリック`,
    cancellationNotes: `解約後も請求期間末日まで Pro 機能を利用できます。\n${DISCLAIMER}`,
  },

  // ============================================================
  // 電子書籍・マンガ（book）
  // ============================================================

  {
    id: 'kindle-unlimited',
    name: 'Kindle Unlimited',
    nameKana: 'きんどるあんりみてっど',
    category: 'book',
    appStoreLikely: true,
    aliases: ['kindle', 'キンドル', 'kindleunlimited', 'amazon kindle', 'kindle reading'],
    iconUrl: 'https://www.google.com/s2/favicons?domain=amazon.co.jp&sz=64',
    defaultAmountMonthly: 980,
    defaultBillingCycle: 'monthly',
    cancellationUrl: 'https://www.amazon.co.jp/hz/mycd/myx#/home/kindle/unlimited',
    cancellationDifficulty: 'easy',
    cancellationSteps: `1. Amazonにログインする
2.「アカウント&リスト」→「Kindle Unlimited の管理」を選択
3.「メンバーシップをキャンセル」をクリック`,
    cancellationNotes: `解約後は読み放題タイトルへのアクセスが終了します。\n${DISCLAIMER}`,
  },

  {
    id: 'rakuten-magazine',
    name: '楽天マガジン',
    nameKana: 'らくてんまがじん',
    category: 'book',
    appStoreLikely: false,
    aliases: ['楽天', 'rakuten', 'rakutenmagazine', 'マガジン'],
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
  // ジム・フィットネス（gym）
  // ============================================================

  {
    id: 'anytime-fitness',
    name: 'エニタイムフィットネス',
    nameKana: 'えにたいむふぃっとねす',
    category: 'gym',
    appStoreLikely: false,
    aliases: ['anytime', 'エニタイム', 'anytimefitness'],
    iconUrl: 'https://www.google.com/s2/favicons?domain=anytimefitness.co.jp&sz=64',
    defaultAmountMonthly: 7700,
    defaultBillingCycle: 'monthly',
    cancellationDifficulty: 'medium',
    cancellationSteps: `1. 入会した店舗または最寄りのエニタイムフィットネスへ直接出向く
2. スタッフに退会を申し出る
3. 退会届に記入して手続きを完了する`,
    cancellationNotes: `店舗での手続きが必要です。Webでの解約はできません。退会月の月会費は全額発生する場合があります。\n${DISCLAIMER}`,
  },

  {
    id: 'apple-fitness-plus',
    name: 'Apple Fitness+',
    nameKana: 'あっぷるふぃっとねすぷらす',
    category: 'gym',
    provider: 'Apple',
    appStoreLikely: true,
    aliases: ['fitness+', 'apple fitness', 'fitnessplus', 'フィットネス', 'apple fitness plus', 'fitness plus'],
    iconUrl: 'https://www.google.com/s2/favicons?domain=apple.com&sz=64',
    defaultAmountMonthly: 1200,
    defaultBillingCycle: 'monthly',
    cancellationUrl: 'https://appleid.apple.com/account/manage',
    cancellationDifficulty: 'easy',
    cancellationSteps: `【iPhoneの場合】
1.「設定」→ 自分の名前 →「サブスクリプション」をタップ
2. Apple Fitness+ を選択
3.「サブスクリプションをキャンセルする」をタップ`,
    cancellationNotes: `Apple One に含まれている場合は Apple One 全体の変更が必要です。\n${DISCLAIMER}`,
  },

  // ============================================================
  // 学習・語学（education）
  // ============================================================

  {
    id: 'duolingo-super',
    name: 'Duolingo Super',
    nameKana: 'でゅおりんごすーぱー',
    category: 'education',
    appStoreLikely: true,
    aliases: ['duolingo', 'デュオリンゴ', 'duolingo plus', 'duolingosuper', 'duolingo super'],
    iconUrl: 'https://www.google.com/s2/favicons?domain=duolingo.com&sz=64',
    defaultAmountMonthly: 916,
    defaultBillingCycle: 'monthly',
    cancellationUrl: 'https://www.duolingo.com/settings/super',
    cancellationDifficulty: 'easy',
    cancellationSteps: `【App Store（iPhone）の場合】
1.「設定」→ 自分の名前 →「サブスクリプション」をタップ
2. Duolingo Super を選択
3.「サブスクリプションをキャンセルする」をタップ`,
    cancellationNotes: `解約後は広告が表示されるフリープランに戻ります。\n${DISCLAIMER}`,
  },

  {
    id: 'studysapuri',
    name: 'スタディサプリ',
    nameKana: 'すたでぃさぷり',
    category: 'education',
    appStoreLikely: false,
    aliases: ['studysapuri', 'スタサプ', 'リクルート スタディ', 'study sapuri'],
    iconUrl: 'https://www.google.com/s2/favicons?domain=studysapuri.jp&sz=64',
    defaultAmountMonthly: 2178,
    defaultBillingCycle: 'monthly',
    cancellationUrl: 'https://studysapuri.jp/service/mypage/',
    cancellationDifficulty: 'easy',
    cancellationSteps: `1. スタディサプリにログインする
2. マイページ →「サブスクリプション管理」を選択
3.「解約する」をクリック
4. 確認画面で解約を完了する`,
    cancellationNotes: `解約後も当月末まで利用できます。\n${DISCLAIMER}`,
  },

  // ============================================================
  // ニュース・情報（news）
  // ============================================================

  {
    id: 'nikkei-digital',
    name: '日経電子版',
    nameKana: 'にっけいでんしばん',
    category: 'news',
    appStoreLikely: false,
    aliases: ['日経', '日本経済新聞', 'nikkei', '日経新聞', 'nikkei digital'],
    iconUrl: 'https://www.google.com/s2/favicons?domain=nikkei.com&sz=64',
    defaultAmountMonthly: 4277,
    defaultBillingCycle: 'monthly',
    cancellationUrl: 'https://r.nikkei.com/my/help/purchase/',
    cancellationDifficulty: 'medium',
    cancellationSteps: `1. 日経電子版にログインする
2. マイページ →「購読・契約内容の確認」を選択
3.「解約・変更」の手順に従って手続きを完了する`,
    cancellationNotes: `解約後も当月末まで閲覧できます。\n${DISCLAIMER}`,
  },

  {
    id: 'newspicks-premium',
    name: 'NewsPicks プレミアム',
    nameKana: 'にゅーずぴっくすぷれみあむ',
    category: 'news',
    appStoreLikely: false,
    aliases: ['newspicks', 'ニューズピックス', 'news picks', 'newspicks premium'],
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

export const SERVICES_COUNT = SERVICES.length;
