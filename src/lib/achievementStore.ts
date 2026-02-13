import { AchievementStats, INITIAL_STATS } from "./achievementStats";
import { evaluateUnlocked } from "./achievementEngine";

const KEY_UNLOCKED = "mm_achievements_unlocked";
const KEY_STATS = "mm_achievement_stats";

/**
 * 統計データをロード（無ければ初期値）
 */
export function loadStats(): AchievementStats {
    if (typeof window === "undefined") return INITIAL_STATS;
    try {
        const json = localStorage.getItem(KEY_STATS);
        if (!json) return INITIAL_STATS;
        return { ...INITIAL_STATS, ...JSON.parse(json) }; // 新しいキーが増えても大丈夫なようにマージ
    } catch {
        return INITIAL_STATS;
    }
}

/**
 * 統計データを保存
 */
export function saveStats(stats: AchievementStats) {
    if (typeof window === "undefined") return;
    try {
        localStorage.setItem(KEY_STATS, JSON.stringify(stats));
    } catch (e) {
        console.warn("Failed to save stats", e);
    }
}

/**
 * 解除済みIDリストをロード
 */
export function loadUnlocked(): string[] {
    if (typeof window === "undefined") return [];
    try {
        const json = localStorage.getItem(KEY_UNLOCKED);
        if (!json) return [];
        return JSON.parse(json);
    } catch {
        return [];
    }
}

/**
 * 解除済みIDリストを保存
 */
export function saveUnlocked(ids: string[]) {
    if (typeof window === "undefined") return;
    try {
        localStorage.setItem(KEY_UNLOCKED, JSON.stringify(ids));
    } catch (e) {
        console.warn("Failed to save unlocked achievements", e);
    }
}

/**
 * 統計を更新し、新たに解除された称号IDがあれば返す
 * @param partialStats 更新したい統計データ（差分）
 * @returns 新たに解除された称号IDの配列
 */
export function updateStats(partialStats: Partial<AchievementStats>): string[] {
    const currentStats = loadStats();

    // 統計の更新（単純な上書きではなく、最大値更新などは呼び出し元で計算済みであることを期待するか、ここでマージロジックを書くか）
    // 呼び出し元で "highestAltitude: Math.max(current, new)" して渡すのは大変なので、
    // ここでは「加算系」と「最大値系」を賢く扱うのが親切だが、
    // User Requirement said "updateStats(partialStats)".
    // Let's assume partialStats contains the NEW absolute values for max fields, and ADD values for count fields?
    // Or simple merge?
    // For simplicity and robustness, let's assume the caller passes the "intended new values" for max fields,
    // and for counters we might need to handle increment.
    // Actually, to fully control from caller, let's standard merge.
    // But for "counter increment", caller needs current value.
    // Let's make this function take a transform callback OR just merge.
    // Simple merge is safest if caller loads first. But we want to avoid double loading.

    // Let's do a smart merge for specific known keys if they are passed?
    // No, that's magic.
    // Let's stick to: Payload replaces the value.
    // BUT checks: e.g. if new highestAltitude < old, we should keep old?
    // Yes, let's impl safe logic here for "Highest" fields.

    const nextStats = { ...currentStats };

    if (partialStats.soloPlays !== undefined) nextStats.soloPlays = partialStats.soloPlays;
    if (partialStats.versusPlays !== undefined) nextStats.versusPlays = partialStats.versusPlays;
    if (partialStats.versusWinsP1 !== undefined) nextStats.versusWinsP1 = partialStats.versusWinsP1;

    if (partialStats.highestAltitude !== undefined) {
        nextStats.highestAltitude = Math.max(currentStats.highestAltitude, partialStats.highestAltitude);
    }
    if (partialStats.highestTotalAltitude !== undefined) {
        nextStats.highestTotalAltitude = Math.max(currentStats.highestTotalAltitude, partialStats.highestTotalAltitude);
    }

    if (partialStats.everestCount !== undefined) nextStats.everestCount = partialStats.everestCount;
    if (partialStats.snowCount !== undefined) nextStats.snowCount = partialStats.snowCount;
    if (partialStats.winStreakBest !== undefined) {
        nextStats.winStreakBest = Math.max(currentStats.winStreakBest, partialStats.winStreakBest);
    }
    if (partialStats.maxWinMargin !== undefined) {
        nextStats.maxWinMargin = Math.max(currentStats.maxWinMargin, partialStats.maxWinMargin);
    }

    // Save new stats
    saveStats(nextStats);

    // Check unlocks
    const currentUnlocked = new Set(loadUnlocked());
    const evaluated = evaluateUnlocked(nextStats);

    const newUnlocks: string[] = [];
    evaluated.forEach(id => {
        if (!currentUnlocked.has(id)) {
            currentUnlocked.add(id);
            newUnlocks.push(id);
        }
    });

    if (newUnlocks.length > 0) {
        saveUnlocked(Array.from(currentUnlocked));
        // ここでToast等を出すフックはUI側でやる
    }

    return newUnlocks;
}
