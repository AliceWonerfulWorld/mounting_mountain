import type { LabelId } from "@/lib/labels";
import { CORE_LABELS, getLabelJa } from "@/lib/labels";

/**
 * 天候の種類
 */
export type WeatherId = "SUNNY" | "WINDY" | "BLIZZARD";

/**
 * 天候定義
 */
export type Weather = {
    id: WeatherId;
    label: string;
    boostLabel: LabelId; // 固定enumに変更
    emoji: string;
    description: string;
};

/**
 * 利用可能な天候一覧
 */
export const WEATHERS: Weather[] = [
    {
        id: "SUNNY",
        label: "晴天",
        boostLabel: "NUMERIC",
        emoji: "☀",
        description: "「数値」を含むと+20%",
    },
    {
        id: "WINDY",
        label: "強風",
        boostLabel: "COMPARISON",
        emoji: "💨",
        description: "「比較」を含むと+20%",
    },
    {
        id: "BLIZZARD",
        label: "吹雪",
        boostLabel: "EFFORT",
        emoji: "❄",
        description: "「努力」を含むと+20%",
    },
];

/**
 * ランダムに天候を選択
 * @param rng 乱数生成関数（テスト用、省略時はMath.random）
 * @returns 選択された天候
 */
export function pickWeather(rng: () => number = Math.random): Weather {
    const index = Math.floor(rng() * WEATHERS.length);
    return WEATHERS[index];
}

/**
 * 天候IDから天候情報を取得
 * @param weatherId 天候ID
 * @returns 天候情報
 */
export function getWeather(weatherId: WeatherId): Weather {
    return WEATHERS.find((w) => w.id === weatherId) || WEATHERS[0];
}
