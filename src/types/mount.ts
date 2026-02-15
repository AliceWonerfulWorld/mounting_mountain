import type { RouteId } from "@/lib/solo/routes";
import type { LabelId } from "@/lib/labels";

/**
 * 内訳分析（各ラベルの寄与度）
 */
export type Breakdown = Partial<Record<LabelId, number>> & {
  penalty?: number; // -0.0 〜 -1.0（任意）
};

export type MountResult = {
  mountScore: number; // 0.00〜1.00
  altitude: number; // 0〜8848（メートル）
  labels: LabelId[]; // 固定enum（例: ["NUMERIC", "COMPARISON"]）

  // 新規フィールド
  breakdown: Breakdown; // 内訳分析
  tip: string; // 攻略ヒント（1行）
  commentary: string; // 実況コメント（1行）

  // 非推奨（互換性のため残す）
  rewrite?: string; // 優しい言い換え

  // ボーナス拡張
  baseAltitude?: number; // 素の標高
  bonusAltitude?: number; // ボーナス加算分
  finalAltitude?: number; // 最終標高（base + bonus）
  bonusReasons?: string[]; // ボーナス理由

  // ルート情報
  routeId?: RouteId; // 選択したルート
  routeMultiplier?: number; // ルート倍率

  // 滑落情報
  didFall?: boolean; // 滑落したかどうか
  fallReason?: string; // 滑落理由

  // 天候情報
  weatherApplied?: boolean; // 天候ボーナスが適用されたか
  weatherMultiplier?: number; // 天候倍率
  weatherBoostLabel?: string; // ブーストされたラベル

  // 保険情報（Issue #34）
  insuranceUsed?: boolean; // 保険が使われたか
};