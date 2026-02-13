import type { AchievementStats } from "./achievementStats";

/**
 * 統計データに基づいて解除済みの称号IDリストを返す純関数
 */
export function evaluateUnlocked(stats: AchievementStats): string[] {
    const unlocked: string[] = [];

    // --- ソロ系 ---
    // first_judgement: 初めて判定を行った (soloPlays >= 1 OR versusPlays >= 1)
    if (stats.soloPlays >= 1 || stats.versusPlays >= 1) {
        unlocked.push("first_judgement");
    }

    // alps_reached: 3000m以上
    if (stats.highestAltitude >= 3000) {
        unlocked.push("alps_reached");
    }

    // snow_reached: 6000m以上
    if (stats.highestAltitude >= 6000 || stats.snowCount >= 1) {
        unlocked.push("snow_reached");
    }

    // everest_reached: 8000m以上
    if (stats.highestAltitude >= 8000 || stats.everestCount >= 1) {
        unlocked.push("everest_reached");
    }

    // total_10000m: 1ゲーム合計10000m以上
    if (stats.highestTotalAltitude >= 10000) {
        unlocked.push("total_10000m");
    }

    // --- 対戦系 ---
    // versus_first_play: ローカル対戦を初めてプレイ
    if (stats.versusPlays >= 1) {
        unlocked.push("versus_first_play");
    }

    // versus_first_win: 初勝利
    if (stats.versusWinsP1 >= 1) {
        unlocked.push("versus_first_win");
    }

    // versus_3wins: 累計3勝
    if (stats.versusWinsP1 >= 3) {
        unlocked.push("versus_3wins");
    }

    // versus_win_by_3000: 3000m以上差をつけて勝利
    if (stats.maxWinMargin >= 3000) {
        unlocked.push("versus_win_by_3000");
    }

    return unlocked;
}
