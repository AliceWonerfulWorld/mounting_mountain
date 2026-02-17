import { useMemo } from "react";
import clsx from "clsx";
import { motion } from "framer-motion";

type DetailedMountainProps = {
    altitude: number;
    maxAltitude?: number;
    size?: number;
    className?: string;
    color?: "red" | "blue" | "neutral"; // versus用のカラーオプション
    isWinner?: boolean; // 勝者の山を強調
    animate?: boolean; // アニメーションを有効化
};

export function DetailedMountain({
    altitude,
    maxAltitude = 8848,
    size = 200,
    className,
    color = "neutral",
    isWinner = false,
    animate = true,
}: DetailedMountainProps) {
    // 0.0 ~ 1.0 に正規化
    const ratio = Math.min(Math.max(altitude / maxAltitude, 0), 1.0);

    // 山の高さ (100が底辺, 比率に応じて頂上の位置を計算)
    const peakY = 100 - ratio * 75;
    
    // 雪線の位置 (6000m以上で表示)
    const snowLine = altitude >= 6000 ? peakY + (100 - peakY) * 0.25 : null;

    // 色の決定
    const baseColors = useMemo(() => {
        if (color === "red") {
            return {
                primary: "#dc2626",
                secondary: "#991b1b",
                tertiary: "#7f1d1d",
                highlight: "#ef4444"
            };
        } else if (color === "blue") {
            return {
                primary: "#2563eb",
                secondary: "#1e40af",
                tertiary: "#1e3a8a",
                highlight: "#3b82f6"
            };
        } else {
            // 標高に応じた色
            if (altitude < 2000) {
                return {
                    primary: "#16a34a",
                    secondary: "#15803d",
                    tertiary: "#14532d",
                    highlight: "#22c55e"
                };
            } else if (altitude < 4000) {
                return {
                    primary: "#78716c",
                    secondary: "#57534e",
                    tertiary: "#44403c",
                    highlight: "#a8a29e"
                };
            } else {
                return {
                    primary: "#57534e",
                    secondary: "#44403c",
                    tertiary: "#292524",
                    highlight: "#78716c"
                };
            }
        }
    }, [altitude, color]);

    return (
        <motion.div
            initial={animate ? { opacity: 0, y: 50, scale: 0.8 } : undefined}
            animate={animate ? { 
                opacity: 1, 
                y: 0, 
                scale: isWinner ? 1.1 : 1 
            } : undefined}
            transition={animate ? {
                duration: 0.8,
                ease: [0.34, 1.56, 0.64, 1],
                delay: 0.2
            } : undefined}
            className={clsx("relative flex items-end justify-center", className)}
            style={{ 
                width: size, 
                height: size,
                filter: isWinner 
                    ? `drop-shadow(0 0 20px ${color === "red" ? "#ef4444" : color === "blue" ? "#3b82f6" : "#fbbf24"})`
                    : undefined
            }}
        >
            {/* 勝者用の輝き */}
            {isWinner && (
                <>
                    <motion.div
                        animate={{
                            scale: [1, 1.3, 1],
                            opacity: [0.3, 0.6, 0.3]
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="absolute inset-0 rounded-full blur-2xl"
                        style={{
                            background: `radial-gradient(circle, ${
                                color === "red" ? "rgba(239, 68, 68, 0.4)" : 
                                color === "blue" ? "rgba(59, 130, 246, 0.4)" : 
                                "rgba(251, 191, 36, 0.4)"
                            } 0%, transparent 70%)`
                        }}
                    />
                    {/* 星のエフェクト */}
                    {[...Array(6)].map((_, i) => (
                        <motion.div
                            key={`star-${i}`}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{
                                scale: [0, 1, 0],
                                opacity: [0, 1, 0],
                                x: [0, (Math.cos((i * Math.PI * 2) / 6) * 40)],
                                y: [0, (Math.sin((i * Math.PI * 2) / 6) * 40)]
                            }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                delay: i * 0.2,
                                ease: "easeOut"
                            }}
                            className="absolute top-1/2 left-1/2 text-2xl"
                            style={{
                                transform: 'translate(-50%, -50%)'
                            }}
                        >
                            ✨
                        </motion.div>
                    ))}
                </>
            )}
            <motion.svg
                initial={animate ? { scale: 0.5, opacity: 0 } : undefined}
                animate={animate ? { scale: 1, opacity: 1 } : undefined}
                transition={animate ? { 
                    duration: 0.6, 
                    delay: 0.3,
                    ease: "easeOut" 
                } : undefined}
                viewBox="0 0 120 100"
                className="w-full h-full overflow-visible transition-all duration-700 ease-out"
                style={{ filter: isWinner ? "drop-shadow(0 8px 16px rgba(0,0,0,0.4))" : "drop-shadow(0 4px 8px rgba(0,0,0,0.2))" }}
            >
                <defs>
                    {/* メインの山のグラデーション */}
                    <linearGradient id={`mountainGradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor={baseColors.primary} stopOpacity="1" />
                        <stop offset="70%" stopColor={baseColors.secondary} stopOpacity="1" />
                        <stop offset="100%" stopColor={baseColors.tertiary} stopOpacity="1" />
                    </linearGradient>

                    {/* 左側面（影側） */}
                    <linearGradient id={`shadowGradient-${color}`} x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor={baseColors.tertiary} stopOpacity="1" />
                        <stop offset="100%" stopColor={baseColors.secondary} stopOpacity="0.8" />
                    </linearGradient>

                    {/* 右側面（光が当たる側） */}
                    <linearGradient id={`highlightGradient-${color}`} x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor={baseColors.secondary} stopOpacity="0.9" />
                        <stop offset="100%" stopColor={baseColors.highlight} stopOpacity="0.7" />
                    </linearGradient>

                    {/* 雪のグラデーション */}
                    <linearGradient id={`snowGradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                        <stop offset="70%" stopColor="#f0f9ff" stopOpacity="0.95" />
                        <stop offset="100%" stopColor="#e0f2fe" stopOpacity="0.85" />
                    </linearGradient>
                </defs>

                {/* 背景の低い山（遠景） */}
                <path
                    d={`M0,100 L20,${80 + ratio * 10} L40,${85 + ratio * 8} L60,${82 + ratio * 10} L80,${88 + ratio * 5} L100,${85 + ratio * 8} L120,100 Z`}
                    fill={baseColors.tertiary}
                    opacity="0.3"
                />

                {/* メインの山 - 複雑な形状 */}
                <motion.g
                    animate={animate && altitude > 4000 ? {
                        y: [0, -3, 0]
                    } : undefined}
                    transition={animate && altitude > 4000 ? {
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                    } : undefined}
                >
                    {/* 左側面（影） */}
                    <motion.path
                        initial={animate ? { opacity: 0, x: -20 } : undefined}
                        animate={animate ? { opacity: 1, x: 0 } : undefined}
                        transition={animate ? { duration: 0.5, delay: 0.5 } : undefined}
                        d={`
                            M 15,100
                            L 30,${peakY + (100 - peakY) * 0.6}
                            L 40,${peakY + (100 - peakY) * 0.4}
                            L 45,${peakY + (100 - peakY) * 0.5}
                            L 50,${peakY + (100 - peakY) * 0.3}
                            L 55,${peakY + (100 - peakY) * 0.2}
                            L 60,${peakY}
                            L 60,100
                            Z
                        `}
                        fill={`url(#shadowGradient-${color})`}
                        className="transition-all duration-700 ease-out"
                    />

                    {/* 右側面（光） */}
                    <motion.path
                        initial={animate ? { opacity: 0, x: 20 } : undefined}
                        animate={animate ? { opacity: 1, x: 0 } : undefined}
                        transition={animate ? { duration: 0.5, delay: 0.6 } : undefined}
                        d={`
                            M 60,${peakY}
                            L 65,${peakY + (100 - peakY) * 0.15}
                            L 70,${peakY + (100 - peakY) * 0.25}
                            L 75,${peakY + (100 - peakY) * 0.2}
                            L 80,${peakY + (100 - peakY) * 0.35}
                            L 90,${peakY + (100 - peakY) * 0.5}
                            L 95,${peakY + (100 - peakY) * 0.55}
                            L 105,100
                            L 60,100
                            Z
                        `}
                        fill={`url(#highlightGradient-${color})`}
                        className="transition-all duration-700 ease-out"
                    />

                    {/* 岩肌のディテール（左） */}
                    <path
                        d={`M 30,${peakY + (100 - peakY) * 0.6} L 35,${peakY + (100 - peakY) * 0.55} L 32,${peakY + (100 - peakY) * 0.65} Z`}
                        fill={baseColors.tertiary}
                        opacity="0.6"
                    />
                    <path
                        d={`M 42,${peakY + (100 - peakY) * 0.45} L 47,${peakY + (100 - peakY) * 0.4} L 44,${peakY + (100 - peakY) * 0.5} Z`}
                        fill={baseColors.tertiary}
                        opacity="0.5"
                    />

                    {/* 岩肌のディテール（右） */}
                    <path
                        d={`M 70,${peakY + (100 - peakY) * 0.25} L 73,${peakY + (100 - peakY) * 0.28} L 72,${peakY + (100 - peakY) * 0.32} Z`}
                        fill={baseColors.highlight}
                        opacity="0.4"
                    />
                    <path
                        d={`M 82,${peakY + (100 - peakY) * 0.35} L 85,${peakY + (100 - peakY) * 0.38} L 84,${peakY + (100 - peakY) * 0.42} Z`}
                        fill={baseColors.highlight}
                        opacity="0.3"
                    />

                    {/* 雪線と雪キャップ */}
                    {snowLine && (
                        <>
                            {/* 山頂の雪（中央） */}
                            <motion.path
                                initial={animate ? { opacity: 0, scale: 0.5 } : undefined}
                                animate={animate ? { opacity: 0.95, scale: 1 } : undefined}
                                transition={animate ? { duration: 0.4, delay: 0.8 } : undefined}
                                d={`
                                    M 55,${peakY + (100 - peakY) * 0.2}
                                    L 60,${peakY}
                                    L 65,${peakY + (100 - peakY) * 0.15}
                                    L 62,${snowLine}
                                    L 58,${snowLine}
                                    Z
                                `}
                                fill={`url(#snowGradient-${color})`}
                            />

                            {/* 雪の影 */}
                            <path
                                d={`M 58,${snowLine} L 60,${peakY + (100 - peakY) * 0.1} L 62,${snowLine} Z`}
                                fill="#cbd5e1"
                                opacity="0.3"
                            />

                            {/* 雪の輝き - アニメーション */}
                            <motion.path
                                animate={animate ? {
                                    opacity: [0.8, 1, 0.8]
                                } : undefined}
                                transition={animate ? {
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                } : undefined}
                                d={`M 59,${peakY + (100 - peakY) * 0.05} L 60,${peakY} L 61,${peakY + (100 - peakY) * 0.05} Z`}
                                fill="white"
                                opacity="0.8"
                            />

                            {/* 追加の雪パッチ（左） */}
                            <path
                                d={`M 50,${peakY + (100 - peakY) * 0.3} L 53,${peakY + (100 - peakY) * 0.25} L 52,${peakY + (100 - peakY) * 0.35} Z`}
                                fill="white"
                                opacity="0.7"
                            />

                            {/* 追加の雪パッチ（右） */}
                            <path
                                d={`M 67,${peakY + (100 - peakY) * 0.25} L 70,${peakY + (100 - peakY) * 0.22} L 69,${peakY + (100 - peakY) * 0.3} Z`}
                                fill="white"
                                opacity="0.6"
                            />
                        </>
                    )}

                    {/* 8000m級の場合、頂上に旗を追加 */}
                    {altitude >= 8000 && (
                        <motion.g
                            initial={animate ? { opacity: 0, y: -10 } : undefined}
                            animate={animate ? { opacity: 1, y: 0 } : undefined}
                            transition={animate ? { duration: 0.4, delay: 1.0 } : undefined}
                        >
                            <line
                                x1="60"
                                y1={peakY}
                                x2="60"
                                y2={peakY - 8}
                                stroke={color === "red" ? "#ef4444" : color === "blue" ? "#3b82f6" : "#fbbf24"}
                                strokeWidth="0.5"
                            />
                            <motion.path
                                animate={animate ? {
                                    d: [
                                        `M 60,${peakY - 8} L 67,${peakY - 6} L 60,${peakY - 4} Z`,
                                        `M 60,${peakY - 8} L 66,${peakY - 6} L 60,${peakY - 4} Z`,
                                        `M 60,${peakY - 8} L 67,${peakY - 6} L 60,${peakY - 4} Z`
                                    ]
                                } : undefined}
                                transition={animate ? {
                                    duration: 1.5,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                } : undefined}
                                d={`M 60,${peakY - 8} L 67,${peakY - 6} L 60,${peakY - 4} Z`}
                                fill={color === "red" ? "#ef4444" : color === "blue" ? "#3b82f6" : "#fbbf24"}
                                opacity="0.9"
                            />
                        </motion.g>
                    )}
                </motion.g>
            </motion.svg>

            {/* 標高テキストラベル - アニメーション付き */}
            <motion.div
                initial={animate ? { opacity: 0, y: 10 } : undefined}
                animate={animate ? { opacity: 1, y: 0 } : undefined}
                transition={animate ? { duration: 0.4, delay: 0.6 } : undefined}
                className={clsx(
                    "absolute bottom-1 font-bold text-sm drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]",
                    isWinner ? "text-2xl" : "text-base"
                )}
                style={{
                    color: isWinner 
                        ? (color === "red" ? "#fef2f2" : color === "blue" ? "#eff6ff" : "#fffbeb")
                        : "white",
                    textShadow: isWinner 
                        ? `0 0 10px ${color === "red" ? "#ef4444" : color === "blue" ? "#3b82f6" : "#fbbf24"}, 0 2px 4px rgba(0,0,0,0.8)`
                        : undefined
                }}
            >
                {altitude.toLocaleString()}m
            </motion.div>
        </motion.div>
    );
}
