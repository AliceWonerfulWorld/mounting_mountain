import type { MountResult } from "@/types/game";
import { clamp01 } from "@/lib/utils";

/**
 * 🔹 fallback判定（APIキー無しでも動く）
 */
export function fallbackAnalyze(text: string): MountResult & { source: string } {
    const mountScore = clamp01(text.length / 60);
    const altitude = Math.round(mountScore * 8848);

    return {
        mountScore,
        altitude,
        labels:
            altitude > 6000
                ? ["数値", "比較"]
                : altitude > 3000
                    ? ["比較"]
                    : ["弱め"],
        rewrite: "（fallback）もう少し柔らかく言うといいかも！",
        source: "fallback",
    };
}
