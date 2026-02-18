/**
 * altitude変換の共通ユーティリティ
 * Issue #33: AIバランス修正
 */

export type RouteType = "SAFE" | "NORMAL" | "RISKY";

const EVEREST = 8848;

// 🔧 チューニングポイント
const SHAPE_POWER = 2.2; // ★ changed: 2.5 → 2.2 （偏りを減らすため）

const ROUTE_CAP: Record<RouteType, number> = {
    SAFE: 5500,    // 安全ルート: 最大5500m
    NORMAL: 6500,  // 通常ルート: 最大6500m
    RISKY: EVEREST, // 危険ルート: 最大8848m（エベレスト）
};

// ★ added: テキストベースの決定論的ハッシュ関数
/**
 * 文字列から0.0〜0.999の値を生成する（決定論的）
 * @param str 入力文字列
 * @returns 0.0〜0.999の値
 */
function hashToUnit(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
    }
    return (hash % 1000) / 1000; // 0.0〜0.999
}

// ★ added: clamp01ヘルパー（0〜1の範囲にクランプ）
/**
 * 値を0.0〜1.0の範囲にクランプする
 * @param x 入力値
 * @returns 0.0〜1.0の値
 */
function clamp01(x: number): number {
    return Math.max(0, Math.min(1, x));
}

/**
 * mountScoreをaltitudeに変換する
 * 
 * @param mountScore 0.0〜1.0のスコア
 * @param route ルートタイプ（デフォルト: NORMAL）
 * @param text テキスト（オプション、決定論的ノイズ生成用） ★ added
 * @returns 標高（m）
 * 
 * @example
 * mountScoreToAltitude(0.8, "NORMAL") // => 4355m
 * mountScoreToAltitude(1.0, "NORMAL") // => 6500m
 * mountScoreToAltitude(1.0, "RISKY")  // => 8848m
 * mountScoreToAltitude(0.8, "NORMAL", "東京大学卒です") // => テキスト依存で微調整される
 */
export function mountScoreToAltitude(
    mountScore: number,
    route: RouteType = "NORMAL",
    text: string = "" // ★ added: オプション引数（既存コードに影響なし）
): number {
    // clamp 0..1
    let s = clamp01(mountScore);

    // ★ added: テキストベースの決定論的ノイズを適用（±0.015の範囲）
    if (text && text.length > 0) {
        const noiseBase = hashToUnit(text); // 0..0.999
        const noise = (noiseBase - 0.5) * 0.03; // -0.015..0.015
        s = clamp01(s + noise);
    }

    // 非線形変換（べき乗で上位帯を難しくする）
    const shaped = Math.pow(s, SHAPE_POWER);
    let altitude = Math.floor(shaped * EVEREST); // ★ changed: Math.round → Math.floor

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
