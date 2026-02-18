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
    insurance?: number; // 保険の所持数（Issue #34）
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
    insuranceUsed: boolean; // 保険が使われたか（Issue #34）
};

const ALTITUDE_CAP_SAFE_NORMAL = 7900; // SAFE/NORMALの上限（Issue #34）

/**
 * 最終標高を計算する純関数
 * RISKYルートの場合、50%の確率で滑落する（保険で無効化可能）
 * 天候ボーナスが適用される場合、+20%の倍率がかかる
 * SAFE/NORMALは7900m上限（Issue #34）
 */
export function computeFinalAltitude(input: ScoreInput): ScoreOutput {
    const {
        baseAltitude,
        routeId,
        routeMultiplier,
        bonusAltitude = 0,
        weatherId,
        labels = [],
        insurance = 0,
        rng = Math.random
    } = input;

    let insuranceUsed = false;

    // 1. RISKYルートの滑落判定（最優先）
    if (routeId === "RISKY" && rng() < 0.5) {
        // 保険チェック
        if (insurance > 0) {
            // 保険発動！滑落を無効化
            insuranceUsed = true;
            // 通常計算に進む（滑落しない）
        } else {
            // 保険なし、通常通り滑落
            return {
                finalAltitude: 0,
                didFall: true,
                fallReason: "滑落！",
                weatherApplied: false,
                insuranceUsed: false,
            };
        }
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
    let finalAltitude = weatherAltitude + bonusAltitude;

    // 5. SAFE/NORMALは7900m上限（Issue #34）
    if (routeId === "SAFE" || routeId === "NORMAL") {
        finalAltitude = Math.min(finalAltitude, ALTITUDE_CAP_SAFE_NORMAL);
    }

    return {
        finalAltitude,
        didFall: false,
        weatherApplied,
        weatherMultiplier,
        weatherBoostLabel,
        insuranceUsed,
    };
}
