import type { MountResult } from "@/types/game";
import type { LabelId } from "@/lib/labels";
import { clamp01 } from "@/lib/utils";

/**
 * 🔹 fallback判定（APIキー無しでも動く）
 */
export function fallbackAnalyze(text: string): MountResult & { source: string } {
    const mountScore = clamp01(text.length / 60);
    const altitude = Math.round(mountScore * 8848);

    // ラベルを固定enumで返す
    let labels: LabelId[];
    if (altitude > 6000) {
        labels = ["NUMERIC", "COMPARISON"];
    } else if (altitude > 3000) {
        labels = ["COMPARISON"];
    } else {
        labels = ["EFFORT"];
    }

    // breakdown を生成
    const breakdown: Record<string, number> = {};
    labels.forEach((label, index) => {
        breakdown[label] = 0.3 + (index * 0.1);
    });

    return {
        mountScore,
        altitude,
        labels,
        breakdown,
        tip: "文字数を増やすと標高が上がります！",
        commentary: "fallbackモードで判定しました",
        source: "fallback",
    };
}
