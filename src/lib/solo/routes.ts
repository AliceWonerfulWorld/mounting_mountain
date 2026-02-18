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
        multiplier: 0.7, // 安全だが低め（Issue #34で調整）
        description: "滑落リスクなし。標高は控えめ。保険を獲得できる。",
        emoji: "🛡️",
    },
    {
        id: "NORMAL",
        label: "通常ルート",
        multiplier: 1.0,
        description: "バランス型。滑落リスクなし。",
        emoji: "⛰️",
    },
    {
        id: "RISKY",
        label: "危険ルート",
        multiplier: 1.3,
        description: "50%の確率で滑落（標高0m）。成功すれば高得点。8000m以上が狙える。",
        emoji: "⚡",
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
