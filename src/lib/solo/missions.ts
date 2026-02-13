import type { GameState } from "@/types/game";

/**
 * ミッションの種類
 */
export type MissionId = "TOTAL_15000" | "EVEREST_1" | "LABELS_3";

/**
 * ミッション定義
 */
export type Mission = {
    id: MissionId;
    title: string;
    description: string;
    target?: number;
};

/**
 * ミッション進捗
 */
export type MissionProgress = {
    cleared: boolean;
    progressText: string;
    ratio?: number; // 進捗率（0.0〜1.0）
};

/**
 * 利用可能なミッション一覧
 */
export const MISSIONS: Mission[] = [
    {
        id: "TOTAL_15000",
        title: "高峰制覇",
        description: "合計標高15000m以上を達成せよ",
        target: 15000,
    },
    {
        id: "EVEREST_1",
        title: "エベレスト級",
        description: "1回でも8000m以上を記録せよ",
        target: 8000,
    },
    {
        id: "LABELS_3",
        title: "多角的マウント",
        description: "3種類以上のラベルを出せ",
        target: 3,
    },
];

/**
 * ランダムにミッションを選択
 * @param rng 乱数生成関数（テスト用、省略時はMath.random）
 * @returns 選択されたミッション
 */
export function pickMission(rng: () => number = Math.random): Mission {
    const index = Math.floor(rng() * MISSIONS.length);
    return MISSIONS[index];
}

/**
 * ミッションIDからミッション情報を取得
 * @param missionId ミッションID
 * @returns ミッション情報
 */
export function getMission(missionId: MissionId): Mission {
    return MISSIONS.find((m) => m.id === missionId) || MISSIONS[0];
}

/**
 * ミッション達成判定と進捗計算
 * @param gameState ゲーム状態
 * @returns ミッション進捗
 */
export function evaluateMission(gameState: GameState): MissionProgress {
    if (!gameState.mission) {
        return {
            cleared: false,
            progressText: "ミッションなし",
        };
    }

    const mission = gameState.mission;
    const player = gameState.players[0];

    switch (mission.id) {
        case "TOTAL_15000": {
            const totalScore = player.totalScore;
            const target = mission.target || 15000;
            const cleared = totalScore >= target;
            const ratio = Math.min(totalScore / target, 1.0);
            return {
                cleared,
                progressText: `合計: ${totalScore.toLocaleString()} / ${target.toLocaleString()}m`,
                ratio,
            };
        }

        case "EVEREST_1": {
            const maxAltitude = Math.max(
                ...player.rounds
                    .map((r) => r.result?.finalAltitude || r.result?.altitude || 0)
            );
            const target = mission.target || 8000;
            const cleared = maxAltitude >= target;
            const ratio = Math.min(maxAltitude / target, 1.0);
            return {
                cleared,
                progressText: `最高: ${maxAltitude.toLocaleString()}m / ${target.toLocaleString()}m`,
                ratio,
            };
        }

        case "LABELS_3": {
            const allLabels = player.rounds
                .flatMap((r) => r.result?.labels || []);
            const uniqueLabels = new Set(allLabels);
            const count = uniqueLabels.size;
            const target = mission.target || 3;
            const cleared = count >= target;
            const ratio = Math.min(count / target, 1.0);
            return {
                cleared,
                progressText: `ラベル種類: ${count} / ${target}`,
                ratio,
            };
        }

        default:
            return {
                cleared: false,
                progressText: "不明なミッション",
            };
    }
}
