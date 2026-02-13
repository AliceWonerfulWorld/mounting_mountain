import type { GameState } from "@/types/game";
import { evaluateMission } from "./missions";
import { getWeather } from "./weather";
import type { RouteId } from "./routes";

/**
 * ソロゲームのサマリー
 */
export type SoloSummary = {
    stars: 1 | 2 | 3;
    mission: {
        title: string;
        description: string;
        cleared: boolean;
        progressText: string;
        ratio?: number;
    };
    score: {
        total: number;
        max: number;
        avg: number;
    };
    routes: {
        SAFE: number;
        NORMAL: number;
        RISKY: number;
    };
    falls: number;
    weather: {
        id: string;
        label: string;
        emoji: string;
    };
};

/**
 * ゲーム結果からサマリーを生成
 * @param game ゲーム状態
 * @returns サマリー
 */
export function buildSoloSummary(game: GameState): SoloSummary {
    const player = game.players[0];
    const rounds = player.rounds;

    // スコア計算
    const total = player.totalScore;
    const altitudes = rounds.map((r) => r.result?.finalAltitude || r.result?.altitude || 0);
    const max = Math.max(...altitudes, 0);
    const avg = rounds.length > 0 ? Math.round(total / rounds.length) : 0;

    // ルート集計
    const routeCounts: Record<RouteId, number> = {
        SAFE: 0,
        NORMAL: 0,
        RISKY: 0,
    };

    rounds.forEach((r) => {
        const routeId = r.routeId || "NORMAL";
        routeCounts[routeId]++;
    });

    // 滑落回数
    const falls = rounds.filter((r) => r.result?.didFall).length;

    // ミッション評価
    const missionResult = game.mission ? evaluateMission(game) : {
        cleared: false,
        progressText: "ミッションなし",
        ratio: 0,
    };

    // 星評価
    let stars: 1 | 2 | 3 = 1;
    if (missionResult.cleared) {
        stars = 3;
    } else if (missionResult.ratio && missionResult.ratio >= 0.8) {
        stars = 2;
    }

    // 天候情報
    const weather = game.weather ? getWeather(game.weather) : {
        id: "SUNNY",
        label: "晴天",
        emoji: "☀",
        boostLabel: "数値",
        description: "",
    };

    return {
        stars,
        mission: {
            title: game.mission?.title || "ミッションなし",
            description: game.mission?.description || "",
            cleared: missionResult.cleared,
            progressText: missionResult.progressText,
            ratio: missionResult.ratio,
        },
        score: {
            total,
            max,
            avg,
        },
        routes: routeCounts,
        falls,
        weather: {
            id: weather.id,
            label: weather.label,
            emoji: weather.emoji,
        },
    };
}
