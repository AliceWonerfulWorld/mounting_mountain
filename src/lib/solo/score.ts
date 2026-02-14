import type { RouteId } from "./routes";
import type { WeatherId } from "./weather";
import type { LabelId } from "@/lib/labels";
import { getWeather } from "./weather";

/**
 * スコア計算の入力
 */
export type ScoreInput = {
    baseAltitude: number;
    routeId: RouteId;
    routeMultiplier: number;
    bonusAltitude?: number;
    weatherId?: WeatherId;
    labels?: LabelId[]; // 固定enumに変更
    rng?: () => number; // テスト用（省略時はMath.random）
};

/**
 * スコア計算の出力
 */
export type ScoreOutput = {
    finalAltitude: number;
    didFall: boolean;
    fallReason?: string;
    weatherApplied: boolean;
    weatherMultiplier?: number;
    weatherBoostLabel?: string;
};

/**
 * 最終標高を計算する純関数
 * RISKYルートの場合、50%の確率で滑落する
 * 天候ボーナスが適用される場合、+20%の倍率がかかる
 */
export function computeFinalAltitude(input: ScoreInput): ScoreOutput {
    const {
        baseAltitude,
        routeId,
        routeMultiplier,
        bonusAltitude = 0,
        weatherId,
        labels = [],
        rng = Math.random
    } = input;

    // 1. RISKYルートの滑落判定（最優先）
    if (routeId === "RISKY" && rng() < 0.5) {
        return {
            finalAltitude: 2000,
            didFall: true,
            fallReason: "滑落！",
            weatherApplied: false,
        };
    }

    // 2. ルート倍率適用
    const routeApplied = Math.round(baseAltitude * routeMultiplier);

    // 3. 天候倍率適用
    let weatherApplied = false;
    let weatherMultiplier: number | undefined;
    let weatherBoostLabel: string | undefined;
    let weatherAltitude = routeApplied;

    if (weatherId) {
        const weather = getWeather(weatherId);
        const hasBoostLabel = labels.includes(weather.boostLabel);

        if (hasBoostLabel) {
            weatherApplied = true;
            weatherMultiplier = 1.2;
            weatherBoostLabel = weather.boostLabel;
            weatherAltitude = Math.round(routeApplied * 1.2);
        }
    }

    // 4. ボーナス加算
    const finalAltitude = weatherAltitude + bonusAltitude;

    return {
        finalAltitude,
        didFall: false,
        weatherApplied,
        weatherMultiplier,
        weatherBoostLabel,
    };
}
