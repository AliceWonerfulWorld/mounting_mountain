/**
 * 固定ラベルシステム
 * AI出力を安定化させるための固定enum定義
 */

/**
 * ラベルID（固定enum）
 */
export type LabelId =
    // コアラベル（ゲーム計算に使用）
    | "NUMERIC"      // 数値
    | "COMPARISON"   // 比較
    | "EFFORT"       // 努力
    // 追加ラベル（演出/分析に使用）
    | "AUTHORITY"    // 権威
    | "SARCASM"      // 皮肉
    | "CONDESCENDING" // 上から目線
    | "BACKHANDED"   // 褒めて落とす
    | "GATEKEEP";    // 分かってる人なら

/**
 * コアラベル（天候/ボーナス計算に使用）
 */
export const CORE_LABELS: readonly LabelId[] = [
    "NUMERIC",
    "COMPARISON",
    "EFFORT",
] as const;

/**
 * 全ラベル
 */
export const ALL_LABELS: readonly LabelId[] = [
    "NUMERIC",
    "COMPARISON",
    "EFFORT",
    "AUTHORITY",
    "SARCASM",
    "CONDESCENDING",
    "BACKHANDED",
    "GATEKEEP",
] as const;

/**
 * ラベルの日本語表示名
 */
export const LABEL_JA_MAP: Record<LabelId, string> = {
    NUMERIC: "数値",
    COMPARISON: "比較",
    EFFORT: "努力",
    AUTHORITY: "権威",
    SARCASM: "皮肉",
    CONDESCENDING: "上から目線",
    BACKHANDED: "褒めて落とす",
    GATEKEEP: "分かってる人なら",
};

/**
 * 文字列がLabelIdかどうかを判定
 */
export function isLabelId(value: string): value is LabelId {
    return ALL_LABELS.includes(value as LabelId);
}

/**
 * LabelIdを日本語に変換
 */
export function getLabelJa(labelId: LabelId): string {
    return LABEL_JA_MAP[labelId];
}
