"use client";

import { motion } from "framer-motion";
import { useEffect } from "react";

type Props = {
    onComplete: () => void;
};

export function BattleCutin({ onComplete }: Props) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onComplete();
        }, 2500); // 2.5秒後に完了
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
        >
            {/* 背景: 夕焼けの空から山へのグラデーション */}
            <motion.div
                initial={{ scale: 1.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 bg-gradient-to-b from-orange-400 via-red-400 to-slate-700"
            />

            {/* 遠景の山々シルエット - 左 */}
            <div className="absolute bottom-0 left-0 w-1/2 h-2/3 pointer-events-none">
                <motion.svg
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    viewBox="0 0 600 400"
                    className="w-full h-full"
                    preserveAspectRatio="xMinYMax meet"
                >
                    <motion.path
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        d="M0,400 L100,250 L200,200 L300,280 L400,220 L500,300 L600,260 L600,400 Z"
                        fill="#334155"
                        opacity="0.7"
                    />
                    {/* 雪キャップ */}
                    <path d="M200,200 L170,230 L230,230 Z" fill="white" opacity="0.8" />
                    <path d="M400,220 L370,250 L430,250 Z" fill="white" opacity="0.8" />
                </motion.svg>
            </div>

            {/* 遠景の山々シルエット - 右 */}
            <div className="absolute bottom-0 right-0 w-1/2 h-2/3 pointer-events-none">
                <motion.svg
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    viewBox="0 0 600 400"
                    className="w-full h-full"
                    preserveAspectRatio="xMaxYMax meet"
                >
                    <motion.path
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        d="M0,280 L100,240 L200,180 L300,220 L400,160 L500,240 L600,200 L600,400 L0,400 Z"
                        fill="#334155"
                        opacity="0.7"
                    />
                    {/* 雪キャップ */}
                    <path d="M200,180 L170,210 L230,210 Z" fill="white" opacity="0.8" />
                    <path d="M400,160 L370,190 L430,190 Z" fill="white" opacity="0.8" />
                </motion.svg>
            </div>

            {/* 中央の2つの競う山 */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-[60%] pointer-events-none">
                <motion.svg
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.3, type: "spring", stiffness: 100 }}
                    viewBox="0 0 800 400"
                    className="w-full h-full"
                    preserveAspectRatio="xMidYMax meet"
                >
                    {/* 左の山 (Player 1カラー) */}
                    <motion.g
                        initial={{ x: -50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                    >
                        <path
                            d="M0,400 L150,200 L250,100 L350,180 L420,240 L480,400 Z"
                            fill="url(#grad-red)"
                            filter="drop-shadow(0 10px 30px rgba(0,0,0,0.5))"
                        />
                        {/* 雪キャップ */}
                        <path d="M250,100 L220,140 L280,140 Z" fill="white" opacity="0.95" />
                        <path d="M150,200 L130,230 L170,230 Z" fill="white" opacity="0.9" />
                        {/* 旗 */}
                        <line x1="250" y1="100" x2="250" y2="70" stroke="#ef4444" strokeWidth="3" />
                        <motion.path
                            animate={{
                                d: [
                                    "M250,70 L280,78 L250,86 Z",
                                    "M250,70 L278,78 L250,86 Z",
                                    "M250,70 L280,78 L250,86 Z"
                                ]
                            }}
                            transition={{
                                duration: 1,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            fill="#ef4444"
                        />
                    </motion.g>

                    {/* 右の山 (Player 2カラー) */}
                    <motion.g
                        initial={{ x: 50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                    >
                        <path
                            d="M320,400 L380,220 L480,120 L550,80 L620,150 L700,210 L800,400 Z"
                            fill="url(#grad-blue)"
                            filter="drop-shadow(0 10px 30px rgba(0,0,0,0.5))"
                        />
                        {/* 雪キャップ */}
                        <path d="M550,80 L520,115 L580,115 Z" fill="white" opacity="0.95" />
                        <path d="M480,120 L460,150 L500,150 Z" fill="white" opacity="0.9" />
                        {/* 旗 */}
                        <line x1="550" y1="80" x2="550" y2="50" stroke="#3b82f6" strokeWidth="3" />
                        <motion.path
                            animate={{
                                d: [
                                    "M550,50 L580,58 L550,66 Z",
                                    "M550,50 L578,58 L550,66 Z",
                                    "M550,50 L580,58 L550,66 Z"
                                ]
                            }}
                            transition={{
                                duration: 1,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: 0.5
                            }}
                            fill="#3b82f6"
                        />
                    </motion.g>

                    {/* グラデーション定義 */}
                    <defs>
                        <linearGradient id="grad-red" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#dc2626" stopOpacity="0.9" />
                            <stop offset="100%" stopColor="#7f1d1d" stopOpacity="1" />
                        </linearGradient>
                        <linearGradient id="grad-blue" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.9" />
                            <stop offset="100%" stopColor="#1e3a8a" stopOpacity="1" />
                        </linearGradient>
                    </defs>
                </motion.svg>
            </div>

            {/* 稲妻エフェクト（対決感） */}
            <motion.div
                initial={{ scaleY: 0, opacity: 0 }}
                animate={{ scaleY: 1, opacity: [0, 1, 0.8, 1, 0] }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="absolute top-1/3 left-1/2 -translate-x-1/2 w-1 h-1/3 bg-gradient-to-b from-yellow-300 via-yellow-500 to-transparent origin-top"
                style={{
                    boxShadow: '0 0 20px rgba(250, 204, 21, 0.8), 0 0 40px rgba(250, 204, 21, 0.4)'
                }}
            />

            {/* 輝くパーティクル */}
            {[...Array(20)].map((_, i) => (
                <motion.div
                    key={`particle-${i}`}
                    initial={{
                        x: "50%",
                        y: "50%",
                        scale: 0,
                        opacity: 0
                    }}
                    animate={{
                        x: `${50 + (Math.random() - 0.5) * 100}%`,
                        y: `${50 + (Math.random() - 0.5) * 100}%`,
                        scale: [0, 1, 0],
                        opacity: [0, 1, 0]
                    }}
                    transition={{
                        duration: 1 + Math.random(),
                        delay: Math.random() * 0.5,
                        ease: "easeOut"
                    }}
                    className="absolute w-2 h-2 bg-white rounded-full blur-sm"
                />
            ))}

            {/* 雪のエフェクト */}
            {[...Array(15)].map((_, i) => (
                <motion.div
                    key={`snow-${i}`}
                    initial={{
                        y: -20,
                        x: Math.random() * 100 + "%",
                        opacity: 0
                    }}
                    animate={{
                        y: "100vh",
                        x: [
                            `${Math.random() * 100}%`,
                            `${Math.random() * 100}%`
                        ],
                        opacity: [0, 0.8, 0.8, 0],
                        rotate: [0, 360]
                    }}
                    transition={{
                        duration: 2 + Math.random() * 2,
                        ease: "linear",
                        delay: Math.random() * 0.5
                    }}
                    className="absolute"
                >
                    <div
                        className="bg-white rounded-full"
                        style={{
                            width: `${3 + Math.random() * 5}px`,
                            height: `${3 + Math.random() * 5}px`,
                            boxShadow: '0 0 3px rgba(255,255,255,0.8)'
                        }}
                    />
                </motion.div>
            ))}

            {/* メインテキスト */}
            <div className="relative z-10 text-center">
                <motion.div
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 15,
                        duration: 0.6
                    }}
                >
                    {/* Let's */}
                    <motion.div
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.3 }}
                        className="text-5xl md:text-7xl font-black text-white tracking-wider mb-4"
                        style={{
                            textShadow: '4px 4px 0px rgba(0,0,0,0.5), 0 0 30px rgba(255,255,255,0.8), 0 0 60px rgba(255,200,0,0.6)'
                        }}
                    >
                        Let&apos;s
                    </motion.div>

                    {/* マウント！ */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                            delay: 0.7,
                            type: "spring",
                            stiffness: 300,
                            damping: 10
                        }}
                        className="relative inline-block"
                    >
                        {/* 背景の光 */}
                        <div className="absolute inset-0 -m-8 bg-yellow-400/40 rounded-full blur-3xl" />
                        
                        <motion.div
                            animate={{
                                scale: [1, 1.02, 1],
                            }}
                            transition={{
                                duration: 0.8,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            className="relative text-8xl md:text-[10rem] font-black text-white tracking-tight leading-none"
                            style={{
                                textShadow: '8px 8px 0px rgba(0,0,0,0.6), -3px -3px 0px rgba(255,255,255,0.4), 0 0 40px rgba(255,200,0,1), 0 0 80px rgba(255,150,0,0.6)',
                                WebkitTextStroke: '4px rgba(0,0,0,0.4)',
                                paintOrder: 'stroke fill'
                            }}
                        >
                            マウント！
                        </motion.div>

                        {/* 山のピークアイコン装飾 */}
                        {[...Array(2)].map((_, i) => (
                            <motion.div
                                key={`peak-${i}`}
                                initial={{ scale: 0, y: 20 }}
                                animate={{ 
                                    scale: [0, 1, 1],
                                    y: [20, 0, -5, 0]
                                }}
                                transition={{
                                    duration: 0.8,
                                    delay: 1 + i * 0.1,
                                    ease: "easeOut"
                                }}
                                className="absolute text-5xl"
                                style={{
                                    top: i === 0 ? '10%' : '20%',
                                    left: i === 0 ? '-5%' : 'auto',
                                    right: i === 0 ? 'auto' : '-5%'
                                }}
                            >
                                ⛰️
                            </motion.div>
                        ))}

                        {/* キラキラエフェクト */}
                        {[...Array(3)].map((_, i) => (
                            <motion.div
                                key={`star-${i}`}
                                initial={{ scale: 0, rotate: 0 }}
                                animate={{
                                    scale: [0, 1, 0],
                                    rotate: [0, 180, 360],
                                    opacity: [0, 1, 0]
                                }}
                                transition={{
                                    duration: 1,
                                    delay: 1.0 + i * 0.15,
                                    ease: "easeOut"
                                }}
                                className="absolute text-yellow-300 text-4xl drop-shadow-lg"
                                style={{
                                    top: `${30 + i * 20}%`,
                                    left: `${-10 + i * 50}%`
                                }}
                            >
                                ✨
                            </motion.div>
                        ))}
                    </motion.div>
                </motion.div>

                {/* サブテキスト */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2, duration: 0.3 }}
                    className="mt-8"
                >
                    <div className="inline-flex items-center gap-2 bg-white/95 backdrop-blur-sm px-8 py-3 rounded-full shadow-2xl border-2 border-orange-300">
                        <span className="text-3xl">🏔️</span>
                        <span className="text-2xl font-black bg-gradient-to-r from-red-600 to-blue-600 bg-clip-text text-transparent tracking-wider">
                            頂上対決！
                        </span>
                        <span className="text-3xl">🏔️</span>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}
