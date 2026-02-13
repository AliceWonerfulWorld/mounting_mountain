import type { MountResult } from "./mount";
import type { RouteId } from "@/lib/solo/routes";
import type { WeatherId } from "@/lib/solo/weather";
import type { Mission } from "@/lib/solo/missions";
export type { MountResult };


/**
 * 1ラウンドの状態
 * prompt（お題）に対して、プレイヤーが入力して、結果がつく
 */
export type Round = {
    id: string; // ラウンド識別子（"r1"みたいなのでOK）
    prompt: string; // お題
    routeId?: RouteId; // 選択したルート（未指定はNORMAL扱い）
    inputText?: string; // プレイヤー入力（未入力ならundefined）
    result?: MountResult; // AI結果（未解析ならundefined）
};

/**
 * プレイヤー情報（対戦に拡張しやすいように先に定義）
 * MVP(ソロ)では players は1人だけでOK
 */
export type Player = {
    id: string; // "p1" / "p2"
    name: string; // 表示名
    totalScore: number; // 合計スコア（例：標高合計など）
    rounds: Round[]; // 各ラウンドの入力・結果
};

/**
 * ゲーム全体の状態
 * mode は最初 "solo" だけ使う。後で "versus_local" など増やせる。
 */
export type GameMode = "solo" | "versus_local" | "versus_online";

export type GameState = {
    mode: GameMode;
    roundIndex: number; // 現在のラウンド（0-based）
    prompts: string[]; // お題リスト（元データ）
    players: Player[]; // MVPは1人だけ入れる
    status: "idle" | "playing" | "finished";
    weather?: WeatherId; // 天候（ソロモード用）
    mission?: Mission; // ミッション（ソロモード用）
};
