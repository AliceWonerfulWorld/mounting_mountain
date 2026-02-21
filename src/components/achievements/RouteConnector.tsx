import clsx from "clsx";

type RouteConnectorProps = {
    isUnlocked: boolean;
};

/**
 * 実績ステップ間の接続線を描画するコンポーネント
 */
export function RouteConnector({ isUnlocked }: RouteConnectorProps) {
    return (
        <div className="flex justify-center my-2">
            <div
                className={clsx(
                    "w-1 h-8 rounded-full transition-all duration-500",
                    isUnlocked
                        ? "bg-gradient-to-b from-yellow-400 to-yellow-500 shadow-[0_0_10px_rgba(251,191,36,0.5)]"
                        : "bg-gradient-to-b from-slate-600 to-slate-700"
                )}
            />
        </div>
    );
}
