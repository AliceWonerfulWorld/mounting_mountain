import type { MountResult } from "@/types/game";
import type { LabelId } from "@/lib/labels";
import type { Breakdown } from "@/types/mount";
import { isLabelId } from "@/lib/labels";
import { clamp01 } from "@/lib/utils";
import { mountScoreToAltitude, type RouteType } from "./altitude";

/**
 * AI出力をバリデーションして安全なMountResultに変換
 * @param raw AI出力の生データ
 * @param route ルートタイプ（altitude計算に使用）
 */
export function validateAiOutput(raw: unknown, route: RouteType = "NORMAL"): MountResult {
    // raw を any でキャストしてプロパティアクセスを可能にする (安全な範囲で)
    // 実務的には Zod などのバリデータを使うべきだが、既存ロジックに合わせてキャストで対応
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = raw as any;

    // mountScore のバリデーション
    const mountScore = clamp01(Number(data.mountScore ?? 0));
    const altitude = mountScoreToAltitude(mountScore, route);

    // labels のバリデーション
    let labels: LabelId[] = [];
    if (Array.isArray(data.labels)) {
        labels = data.labels
            .filter((label: unknown) => typeof label === "string" && isLabelId(label))
            .slice(0, 5) as LabelId[];
    }

    // breakdown のバリデーション
    const breakdown: Breakdown = {};
    if (typeof data.breakdown === "object" && data.breakdown !== null) {
        for (const [key, value] of Object.entries(data.breakdown)) {
            if (key === "penalty") {
                // penalty は -1.0 〜 0.0
                const penaltyValue = Number(value ?? 0);
                breakdown.penalty = Math.max(-1.0, Math.min(0.0, penaltyValue));
            } else if (isLabelId(key)) {
                // ラベルの寄与度は 0.0 〜 1.0
                breakdown[key] = clamp01(Number(value ?? 0));
            }
            // 未知のキーは無視
        }
    }

    // tip のバリデーション
    let tip = "";
    if (typeof data.tip === "string") {
        tip = data.tip.slice(0, 80).trim();
    }
    if (!tip) {
        tip = "次回もがんばりましょう！";
    }

    // commentary のバリデーション
    let commentary = "";
    if (typeof data.commentary === "string") {
        commentary = data.commentary.slice(0, 80).trim();
    }
    if (!commentary) {
        commentary = "いい感じです！";
    }

    // rewrite のバリデーション（互換性のため）
    let rewrite: string | undefined;
    if (typeof data.rewrite === "string") {
        rewrite = data.rewrite.slice(0, 200).trim();
    }

    return {
        mountScore,
        altitude,
        labels,
        breakdown,
        tip,
        commentary,
        rewrite,
    };
}
