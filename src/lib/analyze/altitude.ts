/**
 * altitude変換の共通ユーティリティ
 * Issue #33: AIバランス修正
 */

export type RouteType = "SAFE" | "NORMAL" | "RISKY";

const EVEREST = 8848;

// 🔧 チューニングポイント
const SHAPE_POWER = 2.5; // 非線形化の強度（大きいほど上位帯が難しくなる）

const ROUTE_CAP: Record<RouteType, number> = {
    SAFE: 5500,    // 安全ルート: 最大5500m
    NORMAL: 6500,  // 通常ルート: 最大6500m
    RISKY: EVEREST, // 危険ルート: 最大8848m（エベレスト）
};

/**
 * mountScoreをaltitudeに変換する
 * 
 * @param mountScore 0.0〜1.0のスコア
 * @param route ルートタイプ（デフォルト: NORMAL）
 * @returns 標高（m）
 * 
 * @example
 * mountScoreToAltitude(0.8, "NORMAL") // => 4501m (旧: 7078m)
 * mountScoreToAltitude(1.0, "NORMAL") // => 6500m (旧: 8848m)
 * mountScoreToAltitude(1.0, "RISKY")  // => 8848m
 */
export function mountScoreToAltitude(
    mountScore: number,
    route: RouteType = "NORMAL"
): number {
    // clamp 0..1
    const s = Math.max(0, Math.min(1, mountScore));

    // 非線形変換（べき乗で上位帯を難しくする）
    const shaped = Math.pow(s, SHAPE_POWER);
    let altitude = Math.round(shaped * EVEREST);

    // ルート上限を適用
    altitude = Math.min(altitude, ROUTE_CAP[route]);

    return altitude;
}

/**
 * ルートの上限値を取得
 */
export function getRouteCap(route: RouteType): number {
    return ROUTE_CAP[route];
}
