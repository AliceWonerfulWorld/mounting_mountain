import type { MountResult } from "@/types/game";
import type { LabelId } from "@/lib/labels";
import type { Breakdown } from "@/types/mount";
import { isLabelId } from "@/lib/labels";
import { clamp01 } from "@/lib/utils";

/**
 * AI出力をバリデーションして安全なMountResultに変換
 */
export function validateAiOutput(raw: any): MountResult {
    // mountScore のバリデーション
    const mountScore = clamp01(Number(raw.mountScore ?? 0));
    const altitude = Math.round(mountScore * 8848);

    // labels のバリデーション
    let labels: LabelId[] = [];
    if (Array.isArray(raw.labels)) {
        labels = raw.labels
            .filter((label: any) => typeof label === "string" && isLabelId(label))
            .slice(0, 5); // 最大5個
    }

    // breakdown のバリデーション
    let breakdown: Breakdown = {};
    if (typeof raw.breakdown === "object" && raw.breakdown !== null) {
        for (const [key, value] of Object.entries(raw.breakdown)) {
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
    if (typeof raw.tip === "string") {
        tip = raw.tip.slice(0, 80).trim();
    }
    if (!tip) {
        tip = "次回もがんばりましょう！";
    }

    // commentary のバリデーション
    let commentary = "";
    if (typeof raw.commentary === "string") {
        commentary = raw.commentary.slice(0, 80).trim();
    }
    if (!commentary) {
        commentary = "いい感じです！";
    }

    // rewrite のバリデーション（互換性のため）
    let rewrite: string | undefined;
    if (typeof raw.rewrite === "string") {
        rewrite = raw.rewrite.slice(0, 200).trim();
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
