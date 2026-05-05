/**
 * data/services.ts
 * ================
 * 日本向けサービスDB。
 *
 * v2.3 変更点:
 * - 優先16サービスに代替提案データを追加
 *   （strengths / weaknesses / bestFor / notBestFor /
 *     alternativeIds / downgradeOptions / bundleWarnings）
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
    // ── 代替提案 ──
    strengths: [
      'Netflixオリジナル作品が国内外で充実',
      '海外ドラマ・映画の品揃えが豊富',
      '使いやすいUI・レコメンド機能が優秀',
    ],
    weaknesses: [
      '月額が動画サービスの中で高め',
      '日本のアニメ・邦画はU-NEXTの方が充実する場合がある',
      '広告なしで低価格なプランがない（広告つきスタンダードあり）',
    ],
    bestFor: [
      'Netflixオリジナルドラマ・映画をよく見る',
      '海外ドラマ・映画が中心',
      '4K・高画質で視聴したい（プレミアムプラン）',
    ],
    notBestFor: [
      '日本映画・アニメ・邦ドラマ中心（U-NEXTが充実）',
      'とにかくコストを抑えたい（Amazon Primeが低コスト）',
    ],
    alternativeIds: ['amazon-prime', 'unext', 'disney-plus'],
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
    // ── 代替提案 ──
    strengths: [
      '日本映画・アニメ・ドラマの品揃えが国内最大級',
      'マンガ・雑誌・書籍も同一サービスで読める',
      'NHKオンデマンドとの連携が可能',
      '毎月1,200ポイント付与（新作レンタルに使える）',
    ],
    weaknesses: [
      '月額が動画サービスの中で最高水準',
      'Netflixオリジナル作品は視聴不可',
    ],
    bestFor: [
      '日本映画・アニメ・邦ドラマ中心',
      '動画だけでなくマンガも楽しみたい',
      'NHKの番組もまとめて見たい',
    ],
    notBestFor: [
      'Netflixオリジナルを重視する場合',
      'とにかくコストを抑えたい場合',
    ],
    alternativeIds: ['amazon-prime', 'disney-plus', 'hulu'],
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
    // ── 代替提案 ──
    strengths: [
      'ディズニー・マーベル・スターウォーズ・ピクサー作品が充実',
      '子ども向けコンテンツが豊富',
      '月額が動画サービスの中で比較的リーズナブル',
    ],
    weaknesses: [
      'ディズニー系以外のコンテンツは他サービスと重複しやすい',
      '日本映画・アニメはU-NEXTが充実',
    ],
    bestFor: [
      'ディズニー・マーベル・スターウォーズのファン',
      '子どもがいる家庭',
    ],
    notBestFor: [
      'ディズニー系に興味がない場合',
      '日本映画・アニメ中心の視聴スタイル',
    ],
    alternativeIds: ['amazon-prime', 'netflix'],
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
    // ── 代替提案 ──
    strengths: [
      '日本テレビ系のドラマ・バラエティが充実',
      '月額1,026円とコストパフォーマンスが高い',
      'フジテレビ・TBSなどのドラマも視聴可能',
    ],
    weaknesses: [
      '新作映画のラインナップは他サービスより少ない場合がある',
      '4K対応コンテンツが限られる',
    ],
    bestFor: [
      '国内ドラマ・バラエティ中心',
      '日本テレビ系コンテンツをよく見る',
    ],
    notBestFor: [
      '映画・海外ドラマ中心の場合（Netflix・U-NEXTが充実）',
    ],
    alternativeIds: ['amazon-prime', 'unext'],
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
    // ── 代替提案 ──
    strengths: [
      '月額600円（年額プランなら約500円/月）と動画サービス最安水準',
      '配送特典・Prime Music・Prime Readingもセットで使える',
      'オリジナル作品も充実してきている',
    ],
    weaknesses: [
      '動画コンテンツだけを目的とする場合は割高に感じる場合もある',
    ],
    bestFor: [
      'Amazonでよく買い物をする',
      'コスパ重視で動画・音楽・本もまとめて楽しみたい',
    ],
    notBestFor: [
      '特定の動画コンテンツ（Netflixオリジナル・U-NEXT独自作品）を重視する場合',
    ],
    bundleWarnings: [
      '配送特典・Prime Music・Prime Reading・Prime Gaming など多くの特典が含まれます。動画以外も活用するとさらにコスパが高まります',
    ],
    alternativeIds: ['netflix', 'disney-plus'],
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
    strengths: [
      'アニメ・国内ドラマが充実',
      'ニュース・スポーツ・オリジナル番組も視聴可能',
    ],
    weaknesses: [
      '映画のラインナップは他サービスと比べて少ない場合がある',
    ],
    bestFor: [
      'ABEMAオリジナル作品・アニメをよく見る',
      'ニュース・スポーツも合わせて見たい',
    ],
    alternativeIds: ['amazon-prime', 'disney-plus'],
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
    // ── 代替提案 ──
    strengths: [
      '世界最大規模の音楽ライブラリ',
      'プレイリスト・楽曲レコメンドの精度が高い',
      'ポッドキャストも豊富に聴ける',
      'クロスプラットフォーム対応（Android・iOS・PC）',
    ],
    weaknesses: [
      'Apple Musicと比べて一部の日本アーティストで配信なしの場合がある',
      '家族・複数人で使うならファミリープランに切り替えた方がコスパが高い場合がある',
    ],
    bestFor: [
      '音楽の「発見」や新しいアーティストを見つけたい',
      'ポッドキャストもあわせて聴く',
      'Apple以外のデバイスを主に使う',
    ],
    notBestFor: [
      'Apple デバイス中心（Apple Musicとの統合を重視する場合）',
      'Amazon Echo / Alexa を主に使う（Amazon Music Unlimitedが連携しやすい場合）',
    ],
    alternativeIds: ['apple-music', 'youtube-music', 'amazon-music-unlimited'],
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
    // ── 代替提案 ──
    strengths: [
      'iPhone・Mac・HomePodとの統合がシームレス',
      'ロスレス・空間オーディオ対応',
      'Apple Oneに含まれるためApple製品ユーザーにお得',
    ],
    weaknesses: [
      'Androidとの相性がやや劣る場合がある',
      'ポッドキャット機能はSpotifyより限定的',
    ],
    bestFor: [
      'Apple デバイスを主に使う（iPhone・Mac・AirPods）',
      '高音質で音楽を楽しみたい',
      'Apple Oneで複数サービスをまとめたい',
    ],
    notBestFor: [
      'Android・Windows 中心の場合',
      'ポッドキャストも同じアプリで聴きたい場合',
    ],
    bundleWarnings: [
      'Apple One（個人・ファミリープラン）に含まれます。Apple One契約中の場合は個別契約と重複します',
    ],
    alternativeIds: ['spotify', 'youtube-music'],
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
    // ── 代替提案 ──
    strengths: [
      'Amazon Echo・Alexaとの相性が抜群',
      'Amazon Prime会員は月額割引あり',
    ],
    weaknesses: [
      'レコメンド・発見機能はSpotifyより限定的な場合がある',
    ],
    bestFor: [
      'Amazon EchoやAlexa端末を使っている',
      'Amazon Primeとセットで使いたい',
    ],
    bundleWarnings: [
      'Amazon Prime Music（約200万曲）はAmazon Primeに含まれます。Prime会員であれば追加料金なしで基本的な音楽を楽しめます',
    ],
    alternativeIds: ['spotify', 'apple-music'],
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
    // ── 代替提案 ──
    strengths: [
      'YouTubeとの連携で動画・公式MV・ライブ映像もまとめて楽しめる',
      'YouTube Premiumに含まれるためYouTubeも広告なしで見られる',
    ],
    weaknesses: [
      'Spotifyと比べてプレイリスト・発見機能が限定的な場合がある',
      '音楽特化の体験を求める場合はSpotifyが優れる場合がある',
    ],
    bestFor: [
      'YouTubeをよく利用する',
      '音楽動画（MV・ライブ）もあわせて楽しみたい',
      'YouTube Premiumとセットで使いたい',
    ],
    bundleWarnings: [
      'YouTube Premiumに含まれます。YouTube Premium契約中の場合は個別契約と重複します',
    ],
    alternativeIds: ['spotify', 'apple-music'],
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
    // ── 代替提案 ──
    strengths: [
      'GPT-4oによる高品質な文章生成・対話が可能',
      '画像生成（DALL-E）・データ分析機能が使える',
      'プラグイン・ブラウジング機能が充実',
    ],
    weaknesses: [
      'Claude・Geminiと重複して契約している場合はコストが重なる',
      '長文処理の精度はClaudeが優れる場合がある',
    ],
    bestFor: [
      'GPT系のプラグインや独自機能を活用したい',
      '画像生成も合わせて使いたい',
      'OpenAIのエコシステム（APIなど）を活用している',
    ],
    notBestFor: [
      'ClaudeやGeminiと重複して契約している場合（いずれか1つで十分な場合がある）',
    ],
    alternativeIds: ['claude', 'gemini-advanced'],
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
    // ── 代替提案 ──
    strengths: [
      '長文読解・文章作成の精度が高い',
      '大量の文書処理・要約に強い',
      '文脈の一貫性が高く、長い会話でもブレにくい',
    ],
    weaknesses: [
      'Max ×20 / Max ×5 プランは月額が高め',
      '使用頻度が低い場合はオーバースペックになる可能性がある',
      'ChatGPT・Geminiと重複して契約している場合はコストが重なる',
    ],
    bestFor: [
      '大量の文章生成・読解・要約をする',
      '長いドキュメントの分析・整理',
      'コーディング支援・コードレビュー',
    ],
    notBestFor: [
      '軽い質問・チャット中心（Proプランで十分な場合がある）',
      'ChatGPT・Geminiと重複して複数のAIサービスを契約している場合',
    ],
    alternativeIds: ['chatgpt', 'gemini-advanced'],
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
    // ── 代替提案 ──
    strengths: [
      'Googleサービス（Gmail・Drive・Docs）との統合が強い',
      '月額がAI系サービスの中で比較的リーズナブル',
      'Google One（2TB）もセットで利用できる',
    ],
    weaknesses: [
      'ChatGPT・Claudeと重複して契約している場合はコストが重なる',
    ],
    bestFor: [
      'GmailやGoogle Driveとの連携を重視する',
      'Google One（2TB）も必要な場合',
    ],
    notBestFor: [
      'ChatGPT・Claude と重複して複数のAIを契約している場合',
    ],
    bundleWarnings: [
      'Google One AI Proプランに含まれます。Google One（2TB以上）のユーザーはセットで利用できる場合があります',
    ],
    alternativeIds: ['chatgpt', 'claude'],
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
    strengths: [
      'Microsoft 365（Word・Excel・PowerPoint）との統合が強い',
      'Officeドキュメントの自動作成・要約に対応',
    ],
    weaknesses: [
      'Microsoft 365を使わない場合はメリットが限定的',
      'ChatGPT・Claudeと重複して契約している場合はコストが重なる',
    ],
    bestFor: [
      'Word・Excel・PowerPointをよく使う',
      'Microsoft 365を仕事で活用している',
    ],
    alternativeIds: ['chatgpt', 'claude'],
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
    // ── 代替提案 ──
    strengths: [
      'iPhoneの写真・バックアップ管理が簡単',
      'Apple Oneに含まれるため複数サービスをまとめたい方にお得',
      '月額130円（50GB）から始められる',
    ],
    weaknesses: [
      '大容量プランはGoogle Oneと比べて割高になる場合がある',
      'Apple以外のデバイスとの連携が限定的',
    ],
    bestFor: [
      'iPhone・Macのバックアップ・写真管理を自動化したい',
      'Apple デバイスのみを使っている',
    ],
    notBestFor: [
      'Android・Windowsでも同じストレージを使いたい場合（Google Oneが適している）',
      '大容量が必要でコストを抑えたい場合',
    ],
    bundleWarnings: [
      'Apple One（ファミリー以上）に含まれます。Apple One契約中の場合は個別契約と重複します',
    ],
    alternativeIds: ['google-one'],
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
    // ── 代替提案 ──
    strengths: [
      'Gmail・Googleフォト・Driveで共通利用できる',
      '月額250円（100GB）からと低コスト',
      'Android・iOS・Windows・Macすべてで使える',
    ],
    weaknesses: [
      'Apple デバイスのバックアップにはiCloud+の方が統合しやすい',
    ],
    bestFor: [
      'Gmail・Googleフォト・Driveの容量が足りない',
      'クロスプラットフォームでストレージを使いたい',
    ],
    notBestFor: [
      'iPhoneのバックアップが主な目的（iCloud+の方が統合しやすい）',
    ],
    alternativeIds: ['icloud'],
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
    // ── 代替提案 ──
    strengths: [
      '業界標準のクリエイティブツール（Photoshop・Illustrator・Premiere Pro）',
      '全アプリプランで20以上のアプリを利用できる',
      'クラウドストレージ（100GB）も含まれる',
    ],
    weaknesses: [
      '全アプリプランは月額が高め',
      '特定のアプリしか使わない場合は単体プランの方がコスパが高い場合がある',
    ],
    bestFor: [
      'Photoshop・Illustrator・Premiere Proなど複数のアプリを使う',
      'プロのクリエイティブ業務に使用する',
    ],
    notBestFor: [
      'Photoshopだけ・フォトプランだけ使う場合（単体プランが安い）',
      '趣味・軽い用途（Canvaなどの代替も検討できる）',
    ],
    alternativeIds: ['canva-pro'],
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
    // ── 代替提案 ──
    strengths: [
      'Word・Excel・PowerPoint の最新版が常に使える',
      'OneDrive 1TB が含まれる',
      'Copilot Pro を追加するとAI機能が強化される',
    ],
    weaknesses: [
      'Google Workspace（Docs・Sheets・Slides）で代替できる場合がある（無料）',
    ],
    bestFor: [
      'Word・Excel・PowerPoint を日常的に使う',
      'OneDriveで1TBのストレージも欲しい',
    ],
    notBestFor: [
      'Google Docs / Sheets で十分な軽い用途の場合',
    ],
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
    strengths: [
      '柔軟なノート・データベース・タスク管理が一体化',
      'チームでの共有・コラボレーションが簡単',
    ],
    weaknesses: [
      '個人利用なら無料プランで十分な場合がある',
    ],
    bestFor: [
      'チームでの情報共有・プロジェクト管理をしたい',
      '大量のドキュメントをNotionで管理している',
    ],
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
    strengths: [
      '直感的なデザインツールで初心者でも使いやすい',
      'SNS投稿・プレゼン・ポスターなど幅広いテンプレート',
    ],
    weaknesses: [
      'Photoshop・Illustratorのような細かい編集には不向き',
      '無料版でも基本機能は使える',
    ],
    bestFor: [
      'SNS素材・チラシ・プレゼン資料を手軽に作りたい',
      'デザイン専門知識がなくてもきれいな素材を作りたい',
    ],
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
    strengths: [
      '月額定額で電子書籍が読み放題',
      'Amazon在庫からすぐ読み始められる',
    ],
    weaknesses: [
      '読み放題対象外の本も多い',
      '実際にあまり読まない月があれば割高になる可能性',
    ],
    bestFor: [
      '月に複数冊の電子書籍を読む',
      '様々なジャンルを試し読みしたい',
    ],
    bundleWarnings: [
      'Prime Reading（Prime会員特典）で読める本と対象が一部重複します。Prime会員の場合は対象範囲を確認してみてください',
    ],
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
    strengths: [
      '24時間365日利用可能',
      '全国・海外の店舗が使える',
    ],
    weaknesses: [
      '月額が比較的高め',
      '通っていない月があれば固定費として重くなる可能性',
    ],
    bestFor: [
      '早朝・深夜など不規則な時間に通いたい',
      '出張・旅行先でもジムを使いたい',
    ],
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
    strengths: [
      'Apple Watch との連携でワークアウトをリアルタイム計測',
      '月額が安く自宅で使えるフィットネスサービス',
    ],
    weaknesses: [
      'Apple Watch が必要',
    ],
    bestFor: [
      'Apple Watchを持っている',
      '自宅でフィットネスをしたい',
    ],
    bundleWarnings: [
      'Apple One（プレミアム以上）に含まれます。Apple One契約中の場合は個別契約と重複します',
    ],
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
    // ── 代替提案 ──
    strengths: [
      'ゲーム感覚で語学を継続できる',
      '無料版でも基本機能は使える',
      '広告なし・無制限のハートなどが追加される',
    ],
    weaknesses: [
      '無料版で目標が達成できている場合は有料版が不要な場合がある',
      '本格的な語学学習にはスタディサプリ等も候補になる',
    ],
    bestFor: [
      '毎日短時間で語学を続けたい',
      'ゲーム感覚で楽しく学習したい',
    ],
    notBestFor: [
      '無料版の機能で十分な場合',
      '試験対策など本格的な学習が目的の場合（スタディサプリが向いている）',
    ],
    alternativeIds: ['studysapuri'],
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
    strengths: [
      '大学受験・資格試験対策など目的別のコースが充実',
      'プロ講師による動画授業が見放題',
    ],
    weaknesses: [
      '継続的に使わないと元が取れない場合がある',
    ],
    bestFor: [
      '大学受験・資格試験の対策をしたい',
      '体系的に学習を進めたい',
    ],
    alternativeIds: ['duolingo-super'],
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
    // ── 代替提案 ──
    strengths: [
      '経済・ビジネス情報の網羅性が高い',
      '速報・深掘り記事が充実',
      '投資・市場情報のフォローにも適している',
    ],
    weaknesses: [
      '月額が高め（ニュースサービスの中で最高水準）',
      '経済ニュース以外を求める場合は他サービスで代替可能な場合がある',
    ],
    bestFor: [
      '経済・ビジネスニュースを毎日読む',
      '投資や市場動向を追いたい',
      '仕事でビジネス情報をインプットする必要がある',
    ],
    notBestFor: [
      '経済ニュースをほとんど読まない場合',
      'NewsPicks などより安価なサービスで代替できる場合',
    ],
    alternativeIds: ['newspicks-premium'],
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
    strengths: [
      'ビジネスパーソンのコメント・分析付きのニュースが読める',
      '月額が日経電子版より安い',
    ],
    weaknesses: [
      '速報性・網羅性は日経電子版に劣る場合がある',
    ],
    bestFor: [
      'ビジネスニュースをコメント・分析付きで読みたい',
      '日経電子版より安くビジネス情報を得たい',
    ],
    alternativeIds: ['nikkei-digital'],
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
