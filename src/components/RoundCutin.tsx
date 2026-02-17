"use client";

import { motion } from "framer-motion";
import { useEffect } from "react";

type Props = {
    roundNumber: number;
    onComplete: () => void;
};

export function RoundCutin({ roundNumber, onComplete }: Props) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onComplete();
        }, 4000); // 4秒後に完了
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md overflow-hidden"
        >
            {/* 背景エフェクト */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-b from-blue-900/50 via-purple-900/50 to-black/80" />

                {/* 集中線 */}
                <div className="absolute inset-0 overflow-hidden opacity-30">
                    {[...Array(12)].map((_, i) => (
                        <motion.div
                            key={`line-${i}`}
                            initial={{ scaleY: 0, opacity: 0 }}
                            animate={{ scaleY: 1, opacity: 0.15 }}
                            transition={{
                                duration: 0.3,
                                delay: i * 0.02,
                                ease: "easeOut"
                            }}
                            className="absolute top-1/2 left-1/2 w-0.5 h-full bg-white origin-top will-change-transform"
                            style={{
                                transform: `rotate(${(360 / 12) * i}deg) translateX(-50%)`,
                            }}
                        />
                    ))}
                </div>
            </div>

            <div className="relative z-10 w-full max-w-4xl h-full max-h-[600px] flex flex-col items-center justify-center">

                {/* 斜めストライプ装飾 - 上 */}
                <motion.div
                    initial={{ x: "-100%", rotate: -15 }}
                    animate={{ x: "0%", rotate: -15 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="absolute top-1/4 -left-20 w-[120vw] h-32 bg-gradient-to-r from-black/80 via-black/60 to-transparent border-y-4 border-yellow-300 will-change-transform"
                    style={{ transformOrigin: "left center" }}
                >
                    <div className="absolute right-40 top-1/2 -translate-y-1/2 text-white font-mono font-bold text-xl tracking-widest">
                        ROUND {roundNumber} START
                    </div>
                </motion.div>

                {/* 斜めストライプ装飾 - 下 */}
                <motion.div
                    initial={{ x: "100%", rotate: -15 }}
                    animate={{ x: "0%", rotate: -15 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="absolute bottom-1/4 -right-20 w-[120vw] h-32 bg-gradient-to-l from-black/80 via-black/60 to-transparent border-y-4 border-yellow-300 will-change-transform"
                    style={{ transformOrigin: "right center" }}
                >
                    <div className="absolute left-40 top-1/2 -translate-y-1/2 text-white font-mono font-bold text-xl tracking-widest">
                        READY FOR BATTLE
                    </div>
                </motion.div>

                {/* メインテキスト */}
                <div className="relative transform bg-black/40 p-12 rounded-3xl border border-white/10 backdrop-blur-sm">
                    <motion.div
                        initial={{ scale: 0, rotate: -90 }}
                        animate={{
                            scale: [0, 1.2, 1],
                            rotate: [90, -10, 0]
                        }}
                        transition={{
                            duration: 0.5,
                            times: [0, 0.6, 1],
                            ease: "easeOut"
                        }}
                        className="text-center"
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="space-y-2"
                        >
                            {/* Let's */}
                            <div className="text-5xl md:text-6xl font-black text-white tracking-wider drop-shadow-[0_0_30px_rgba(255,255,255,0.8)]"
                                style={{
                                    textShadow: '4px 4px 0px rgba(0,0,0,0.8), -2px -2px 0px rgba(255,255,255,0.5), 0 0 40px rgba(255,255,0,0.8)'
                                }}
                            >
                                Let&apos;s
                            </div>

                            {/* マウント！ */}
                            <motion.div
                                className="text-7xl md:text-9xl font-black bg-gradient-to-r from-yellow-200 via-orange-300 to-red-300 bg-clip-text text-transparent tracking-tight"
                                animate={{
                                    scale: [1, 1.05, 1],
                                }}
                                transition={{
                                    duration: 0.8,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                                style={{
                                    textShadow: '6px 6px 0px rgba(0,0,0,0.9), -3px -3px 0px rgba(255,255,255,0.3)',
                                    WebkitTextStroke: '3px #000',
                                    paintOrder: 'stroke fill'
                                }}
                            >
                                マウント！
                            </motion.div>
                        </motion.div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="mt-8 text-center"
                    >
                        <div className="inline-block bg-black/70 px-8 py-3 rounded-full border-2 border-yellow-400">
                            <div className="text-2xl font-black text-yellow-300 tracking-widest uppercase">
                                ROUND {roundNumber}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
}
