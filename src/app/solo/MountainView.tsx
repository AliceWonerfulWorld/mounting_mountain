"use client";

import { useMemo } from "react";
import clsx from "clsx";

type MountainViewProps = {
  altitude: number;
  maxAltitude?: number;
  size?: number;
  className?: string;
  animate?: boolean;
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
    if (altitude < 2000) return "fill-emerald-600 dark:fill-emerald-700"; // 低山 (緑)
    if (altitude < 6000) return "fill-stone-600 dark:fill-stone-600"; // 中山 (岩)
    return "fill-slate-300 dark:fill-slate-400 stroke-slate-500"; // 高山 (雪山イメージ)
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
        {/* 背景の山（装飾） */}
        <path
          d="M-20,100 L30,40 L80,100 Z"
          className="fill-stone-200 dark:fill-stone-800 opacity-50"
        />
        <path
          d="M40,100 L80,50 L120,100 Z"
          className="fill-stone-300 dark:fill-stone-700 opacity-50"
        />


        {/*
          メインの山: 三角形
          左下(10, 100) -> 頂上(50, peakY) -> 右下(90, 100)
        */}
        <path
          d={`M10,100 L50,${peakY} L90,100 Z`}
          className={clsx(
            "transition-[d] duration-1000 ease-out drop-shadow-md",
            colorClass
          )}
        />

        {/* 6000m級以上で雪キャップ (簡易表現) */}
        {altitude >= 6000 && (
          <path
            d={`M35,${peakY + (100 - peakY) * 0.3} L50,${peakY} L65,${peakY + (100 - peakY) * 0.3} Z`}
            className="fill-white/90 animate-in fade-in duration-1000"
          />
        )}

        {/* 8000m級以上で旗 */}
        {altitude >= 8000 && (
          <text x="50" y={peakY - 5} textAnchor="middle" fontSize="10" className="animate-bounce">
            🚩
          </text>
        )}
      </svg>

      {/* 雲の演出 (ランダムな動き) */}
      <div className="absolute top-1/4 left-0 w-full h-1/2 pointer-events-none overflow-hidden opacity-30">
        <div className="absolute top-0 -left-10 text-2xl animate-[float_10s_linear_infinite]">☁️</div>
        <div className="absolute top-4 -right-10 text-xl animate-[float_15s_linear_infinite_reverse]">☁️</div>
      </div>
    </div>
  );
}
