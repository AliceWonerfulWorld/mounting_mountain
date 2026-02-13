import type { RouteId } from "./routes";

/**
 * スコア計算の入力
 */
export type ScoreInput = {
    baseAltitude: number;
    routeId: RouteId;
    routeMultiplier: number;
    bonusAltitude?: number;
    rng?: () => number; // テスト用（省略時はMath.random）
};

/**
 * スコア計算の出力
 */
export type ScoreOutput = {
    finalAltitude: number;
    didFall: boolean;
    fallReason?: string;
};

/**
 * 最終標高を計算する純関数
 * RISKYルートの場合、50%の確率で滑落する
 */
export function computeFinalAltitude(input: ScoreInput): ScoreOutput {
    const { baseAltitude, routeId, routeMultiplier, bonusAltitude = 0, rng = Math.random } = input;

    // RISKYルートの滑落判定
    if (routeId === "RISKY" && rng() < 0.5) {
        return {
            finalAltitude: 2000,
            didFall: true,
            fallReason: "滑落！",
        };
    }

    // 通常計算
    const finalAltitude = Math.round(baseAltitude * routeMultiplier) + bonusAltitude;

    return {
        finalAltitude,
        didFall: false,
    };
}
