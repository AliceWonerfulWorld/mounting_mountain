/**
 * ルート選択の種類
 */
export type RouteId = "SAFE" | "NORMAL" | "RISKY";

/**
 * ルート定義
 */
export type Route = {
    id: RouteId;
    label: string;
    multiplier: number;
    description: string;
    emoji: string;
};

/**
 * 利用可能なルート一覧
 */
export const ROUTES: Route[] = [
    {
        id: "SAFE",
        label: "安全ルート",
        multiplier: 0.8,
        description: "確実に積む（×0.8）",
        emoji: "🛡️",
    },
    {
        id: "NORMAL",
        label: "通常ルート",
        multiplier: 1.0,
        description: "バランス型（×1.0）",
        emoji: "⛰️",
    },
    {
        id: "RISKY",
        label: "危険ルート",
        multiplier: 1.3,
        description: "一発逆転（×1.3）",
        emoji: "🔥",
    },
];

/**
 * ルートIDからルート情報を取得
 * @param routeId ルートID（未指定時はNORMAL）
 * @returns ルート情報
 */
export function getRoute(routeId?: RouteId): Route {
    const route = ROUTES.find((r) => r.id === (routeId || "NORMAL"));
    return route || ROUTES[1]; // フォールバックはNORMAL
}
