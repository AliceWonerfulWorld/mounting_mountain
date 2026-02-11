import { useMemo } from "react";
import clsx from "clsx";

type MountainViewProps = {
    altitude: number;
    maxAltitude?: number;
    size?: number;
    className?: string;
};

export function MountainView({
    altitude,
    maxAltitude = 8848,
    size = 200,
    className,
}: MountainViewProps) {
    // 0.0 ~ 1.0 に正規化 (最大値を超えたら1.0)
    const ratio = Math.min(Math.max(altitude / maxAltitude, 0), 1.0);

    // 頂上のY座標 (100が底辺, 10が上端の余白)
    // ratio=0 -> y=100 (平地), ratio=1 -> y=20 (高い山)
    const peakY = 100 - ratio * 80;

    // 色の決定
    const colorClass = useMemo(() => {
        if (altitude < 2000) return "fill-green-600 dark:fill-green-500"; // 低山
        if (altitude < 6000) return "fill-stone-600 dark:fill-stone-500"; // 中山
        return "fill-stone-300 dark:fill-stone-200 stroke-stone-500"; // 高山 (雪山イメージ)
    }, [altitude]);

    return (
        <div
            className={clsx("relative flex items-end justify-center", className)}
            style={{ width: size, height: size }}
        >
            <svg
                viewBox="0 0 100 100"
                className="w-full h-full overflow-visible transition-all duration-700 ease-out"
            >
                {/*
          山の形状: 三角形
          左下(10, 100) -> 頂上(50, peakY) -> 右下(90, 100)
        */}
                <path
                    d={`M10,100 L50,${peakY} L90,100 Z`}
                    className={clsx("transition-[d] duration-700 ease-out", colorClass)}
                />

                {/* 6000m級以上で雪キャップ (簡易表現) */}
                {altitude >= 6000 && (
                    <path
                        d={`M35,${peakY + (100 - peakY) * 0.3} L50,${peakY} L65,${peakY + (100 - peakY) * 0.3} Z`}
                        className="fill-white/90"
                    />
                )}
            </svg>

            {/* 標高テキストラベル */}
            <div className="absolute bottom-2 font-bold text-white drop-shadow-md text-sm">
                {altitude.toLocaleString()}m
            </div>
        </div>
    );
}
