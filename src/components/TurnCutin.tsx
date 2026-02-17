"use client";

import { motion } from "framer-motion";
import { useEffect } from "react";

type Props = {
    playerName: string;
    playerIndex: 0 | 1; // 0: Player 1, 1: Player 2
    onComplete: () => void;
};

export function TurnCutin({ playerName, playerIndex, onComplete }: Props) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onComplete();
        }, 2500); // 2.5秒後に完了
        return () => clearTimeout(timer);
    }, [onComplete]);

    const isP1 = playerIndex === 0;
    const mainColor = isP1 ? "text-red-500" : "text-blue-500";
    const bgColor = isP1 ? "from-red-600 to-red-900" : "from-blue-600 to-blue-900";
    const borderColor = isP1 ? "border-red-400" : "border-blue-400";

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm overflow-hidden"
        >
            {/* 背景ストライプ */}
            <motion.div
                initial={{ x: isP1 ? "-100%" : "100%", skewX: -20 }}
                animate={{ x: "0%", skewX: -20 }}
                transition={{ duration: 0.4, type: "spring", stiffness: 100 }}
                className={`absolute inset-y-0 w-2/3 bg-gradient-to-r ${bgColor} opacity-90`}
                style={{
                    left: isP1 ? "-10%" : "auto",
                    right: isP1 ? "auto" : "-10%"
                }}
            />

            <div className="relative z-10 flex flex-col items-center">
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, type: "spring", bounce: 0.5 }}
                >
                    <div className={`text-2xl font-bold text-white uppercase tracking-widest mb-2 text-center`}>
                        NEXT TURN
                    </div>

                    <div className={`relative px-12 py-6 bg-black/80 border-y-4 ${borderColor}`}>
                        <motion.h1
                            className={`text-6xl md:text-8xl font-black ${mainColor} italic tracking-tighter`}
                            style={{ textShadow: "4px 4px 0px rgba(255,255,255,0.2)" }}
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
                        >
                            {playerName}
                        </motion.h1>

                        {/* 装飾的な要素 */}
                        <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-white" />
                        <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-white" />
                        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-white" />
                        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-white" />
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="mt-8 bg-white/10 px-6 py-2 rounded-full backdrop-blur-md border border-white/20"
                >
                    <span className="text-white font-bold tracking-wider">GET READY</span>
                </motion.div>
            </div>
        </motion.div>
    );
}
