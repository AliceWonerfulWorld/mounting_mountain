import clsx from "clsx";

type RouteConnectorProps = {
    isUnlocked: boolean;
    index?: number; // アニメーション用
};

/**
 * 実績ステップ間の接続線を描画するコンポーネント
 */
export function RouteConnector({ isUnlocked, index = 0 }: RouteConnectorProps) {
    return (
        <div 
            className="flex justify-center my-2"
            style={{
                animation: `fadeIn 0.5s ease-out ${index * 0.1 + 0.2}s both`
            }}
        >
            <div className="relative">
                {/* メインの接続線 */}
                <div
                    className={clsx(
                        "w-1 h-8 rounded-full transition-all duration-700",
                        isUnlocked
                            ? "bg-gradient-to-b from-yellow-400 via-yellow-500 to-yellow-600"
                            : "bg-gradient-to-b from-slate-600 via-slate-650 to-slate-700"
                    )}
                />
                
                {/* グロー効果（解除済みの場合のみ） */}
                {isUnlocked && (
                    <div
                        className="absolute inset-0 w-1 h-8 rounded-full blur-sm"
                        style={{
                            background: "linear-gradient(to bottom, rgba(251, 191, 36, 0.6), rgba(245, 158, 11, 0.6))",
                            animation: "pulse 2s ease-in-out infinite"
                        }}
                    />
                )}
            </div>
        </div>
    );
}
