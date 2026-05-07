/**
 * lib/onboardingPresets.ts
 * =========================
 * オンボーディング時に提案する職種別おすすめサービス。
 */

export interface ProfessionPreset {
  id: string;
  label: string;
  emoji: string;
  description: string;
  recommendedServiceIds: string[];
}

export const PROFESSION_PRESETS: ProfessionPreset[] = [
  {
    id: 'designer',
    label: 'デザイナー',
    emoji: '🎨',
    description: 'UI/UX・グラフィック・Webデザインなど',
    recommendedServiceIds: [
      'chatgpt', 'claude', 'adobe', 'canva-pro', 'figma',
      'notion-plus', 'slack', 'google-one', 'dropbox-plus', 'skillshare',
    ],
  },
  {
    id: 'engineer',
    label: 'エンジニア',
    emoji: '💻',
    description: 'Web開発・アプリ開発・インフラなど',
    recommendedServiceIds: [
      'chatgpt', 'claude', 'cursor-pro', 'github', 'vercel-pro',
      'supabase-pro', 'notion-plus', 'slack', 'google-one', 'udemy-personal',
    ],
  },
  {
    id: 'writer',
    label: 'ライター',
    emoji: '✍️',
    description: 'ブロガー・ライター・コンテンツ作成者',
    recommendedServiceIds: [
      'chatgpt', 'claude', 'perplexity-pro', 'notion-plus', 'canva-pro',
      'spotify', 'kindle-unlimited', 'newspicks-premium', 'schoo',
    ],
  },
  {
    id: 'general',
    label: 'その他',
    emoji: '🤔',
    description: '会社員・学生・一般的な利用',
    recommendedServiceIds: [
      'chatgpt', 'netflix', 'amazon-prime', 'spotify', 'youtube-music',
      'icloud', 'notion-plus', 'kindle-unlimited', 'duolingo-super',
    ],
  },
];

export function getPresetById(id: string): ProfessionPreset | undefined {
  return PROFESSION_PRESETS.find((p) => p.id === id);
}