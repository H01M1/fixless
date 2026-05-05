/**
 * lib/serviceMatching.ts
 * =======================
 * OCR で抽出したテキスト行とサービスDB を照合するロジック。
 *
 * 照合順序（優先度順）:
 * 1. service.name      完全・部分一致（大文字小文字無視）→ high
 * 2. service.aliases   aliases の各エントリで一致         → high
 * 3. service.provider  提供会社名で一致                   → low
 * 4. service.nameKana  ひらがな名で一致                   → low
 * 5. plan.planName     プラン名を含む場合                 → high
 *
 * 正規化ルール:
 * - 小文字に統一
 * - 全角スペース → 半角スペース
 * - 「+」「＋」→「plus」（Disney+ 対応）
 * - 空白・ハイフン・アンダースコアを除去
 * - 記号（!！・）を除去
 */

import { SERVICES } from '@/data/services';
import type { ServiceTemplate } from '@/types';

// ================================================================
// 型定義
// ================================================================

export interface MatchResult {
  /** マッチしたサービステンプレート */
  service: ServiceTemplate;
  /** OCR で検出されたテキスト（どの行にマッチしたか） */
  matchedText: string;
  /** 信頼度: high = name/aliases 一致, low = provider/nameKana 一致 */
  confidence: 'high' | 'low';
}

// ================================================================
// テキスト正規化
// ================================================================

/**
 * テキストを正規化して照合しやすくする。
 * OCR の誤認識・表記ゆれを吸収する。
 */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/\u3000/g, ' ')          // 全角スペース → 半角
    .replace(/[+\uFF0B]/g, 'plus')
    .replace(/[!\uFF01]/g, '')
    .replace(/\u30FB/g, '')
    .replace(/[\uFF08\uFF09()\u300C\u300D\u3010\u3011[\]]/g, '')
    .replace(/\s+/g, '')               // 空白除去
    .replace(/[-_]/g, '');             // ハイフン・アンダースコア除去
}

// ================================================================
// メインのマッチング関数
// ================================================================

/**
 * OCR で抽出したテキスト行からサービスを検出する。
 *
 * @param lines  extractTextLines の戻り値（テキスト行の配列）
 * @returns      マッチしたサービスの一覧（重複なし）
 *
 * @example
 * const matches = matchServicesFromText(['Netflix', '1,590/月', 'Spotify']);
 * // → [{ service: netflix, matchedText: 'Netflix', confidence: 'high' }, ...]
 */
export function matchServicesFromText(lines: string[]): MatchResult[] {
  const results: MatchResult[] = [];
  const matchedIds = new Set<string>();

  for (const line of lines) {
    const normalizedLine = normalize(line);

    // 短すぎる行はスキップ（ノイズ）
    if (normalizedLine.length < 2) continue;

    for (const service of SERVICES) {
      // すでにマッチ済みのサービスはスキップ（重複防止）
      if (matchedIds.has(service.id)) continue;

      // ── 照合処理 ──────────────────────────────────────────────

      // 1. service.name で照合
      if (normalizedLine.includes(normalize(service.name))) {
        results.push({ service, matchedText: line, confidence: 'high' });
        matchedIds.add(service.id);
        continue;
      }

      // 2. aliases で照合
      let aliasMatched = false;
      if (service.aliases) {
        for (const alias of service.aliases) {
          const normalizedAlias = normalize(alias);
          if (normalizedAlias.length < 2) continue;
          if (normalizedLine.includes(normalizedAlias)) {
            results.push({ service, matchedText: line, confidence: 'high' });
            matchedIds.add(service.id);
            aliasMatched = true;
            break;
          }
        }
      }
      if (aliasMatched) continue;

      // 3. プラン名（サービス名 + プラン名の組み合わせ）で照合
      let planMatched = false;
      if (service.plans) {
        for (const plan of service.plans) {
          // "Netflix スタンダード" → "netflixstandard" で照合
          const fullPlanName = normalize(`${service.name}${plan.planName}`);
          if (normalizedLine.includes(fullPlanName)) {
            results.push({ service, matchedText: line, confidence: 'high' });
            matchedIds.add(service.id);
            planMatched = true;
            break;
          }
        }
      }
      if (planMatched) continue;

      // 4. provider で照合（信頼度: low）
      // ただし "Apple" は Apple Music / iCloud+ / Fitness+ など複数あるため
      // provider 単独ではマッチさせない
      // → 将来的に実装予定

      // 5. nameKana で照合（信頼度: low）
      if (service.nameKana) {
        const normalizedKana = normalize(service.nameKana);
        if (normalizedKana.length >= 3 && normalizedLine.includes(normalizedKana)) {
          results.push({ service, matchedText: line, confidence: 'low' });
          matchedIds.add(service.id);
        }
      }
    }
  }

  // high 信頼度を先に表示
  return results.sort((a, b) => {
    if (a.confidence === b.confidence) return 0;
    return a.confidence === 'high' ? -1 : 1;
  });
}
