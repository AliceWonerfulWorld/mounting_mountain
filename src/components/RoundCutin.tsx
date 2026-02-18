"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

type Props = {
    roundNumber: number;
    onComplete: () => void;
};

export function RoundCutin({ roundNumber, onComplete }: Props) {
    // Pre-calculate random values for snow particles
    const [snowflakes] = useState(() => 
        Array.from({ length: 15 }, () => ({
            startX: Math.random() * 100,
            x1: Math.random() * 100,
            x2: Math.random() * 100,
            x3: Math.random() * 100,
            duration: 8 + Math.random() * 4,
            delay: Math.random() * 3,
            width: 2 + Math.random() * 4,
            height: 2 + Math.random() * 4
        }))
    );
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
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
        >
            {/* 背景: 空から雪山へのグラデーション */}
            <motion.div
                initial={{ scale: 1.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="absolute inset-0 bg-gradient-to-b from-sky-500 via-blue-200 to-slate-200"
            />

            {/* 遠景の山々 - 最背面 */}
            <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
                <motion.svg
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.1 }}
                    viewBox="0 0 1200 400"
                    className="w-full h-auto text-slate-300/60 fill-current"
                    preserveAspectRatio="none"
                >
                    <path d="M0,400 L0,250 L150,180 L300,220 L450,150 L600,200 L750,170 L900,210 L1050,190 L1200,240 L1200,400 Z" />
                    {/* 雪キャップ */}
                    <path d="M450,150 L420,170 L480,170 Z" fill="white" opacity="0.8" />
                    <path d="M600,200 L570,215 L630,215 Z" fill="white" opacity="0.8" />
                    <path d="M750,170 L720,185 L780,185 Z" fill="white" opacity="0.8" />
                </motion.svg>
            </div>

            {/* 中景の山々 */}
            <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
                <motion.svg
                    initial={{ y: 80, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    viewBox="0 0 1200 350"
                    className="w-full h-auto text-slate-400/70 fill-current"
                    preserveAspectRatio="none"
                >
                    <path d="M0,350 L100,200 L180,240 L300,140 L420,180 L550,100 L680,160 L800,120 L920,180 L1050,140 L1200,220 L1200,350 Z" />
                    {/* 雪キャップと影 */}
                    <path d="M300,140 L260,165 L340,165 Z" fill="white" opacity="0.9" />
                    <path d="M550,100 L510,130 L590,130 Z" fill="white" opacity="0.9" />
                    <path d="M800,120 L760,145 L840,145 Z" fill="white" opacity="0.9" />
                    {/* 岩肌のディテール */}
                    <path d="M300,165 L280,200 L320,190 Z" fill="currentColor" opacity="0.3" />
                    <path d="M550,130 L530,170 L570,160 Z" fill="currentColor" opacity="0.3" />
                </motion.svg>
            </div>

            {/* 近景の山 - 左 */}
            <div className="absolute bottom-0 left-0 pointer-events-none">
                <motion.svg
                    initial={{ x: -100, y: 100, opacity: 0 }}
                    animate={{ x: 0, y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    viewBox="0 0 600 400"
                    className="w-auto h-[400px] text-slate-600/80 fill-current"
                    preserveAspectRatio="xMinYMax meet"
                >
                    <path d="M0,400 L200,120 L280,180 L350,140 L420,200 L500,160 L600,240 L600,400 Z" />
                    {/* 雪と岩肌 */}
                    <path d="M200,120 L160,155 L240,155 Z" fill="white" opacity="0.95" />
                    <path d="M350,140 L320,170 L380,170 Z" fill="white" opacity="0.95" />
                    <path d="M240,155 L220,200 L260,190 Z" fill="currentColor" opacity="0.4" />
                    <path d="M280,180 L260,220 L300,210 L320,240 Z" fill="currentColor" opacity="0.3" />
                </motion.svg>
            </div>

            {/* 近景の山 - 右 */}
            <div className="absolute bottom-0 right-0 pointer-events-none">
                <motion.svg
                    initial={{ x: 100, y: 100, opacity: 0 }}
                    animate={{ x: 0, y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    viewBox="0 0 600 400"
                    className="w-auto h-[400px] text-slate-600/80 fill-current"
                    preserveAspectRatio="xMaxYMax meet"
                >
                    <path d="M0,240 L100,180 L180,220 L250,140 L320,180 L400,100 L500,180 L600,400 L0,400 Z" />
                    {/* 雪キャップ */}
                    <path d="M400,100 L360,135 L440,135 Z" fill="white" opacity="0.95" />
                    <path d="M250,140 L220,170 L280,170 Z" fill="white" opacity="0.95" />
                    <path d="M360,135 L340,180 L380,170 L400,200 Z" fill="currentColor" opacity="0.4" />
                </motion.svg>
            </div>

            {/* 雲エフェクト */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(5)].map((_, i) => (
                    <motion.div
                        key={`cloud-${i}`}
                        initial={{ x: -200, opacity: 0 }}
                        animate={{ 
                            x: ["0%", "100%"],
                            opacity: [0, 0.3, 0.3, 0]
                        }}
                        transition={{
                            duration: 8 + i * 2,
                            ease: "linear",
                            repeat: Infinity,
                            delay: i * 0.5
                        }}
                        className="absolute"
                        style={{
                            top: `${20 + i * 15}%`,
                            width: `${100 + i * 20}px`,
                            height: `${40 + i * 10}px`,
                        }}
                    >
                        <div className="w-full h-full bg-white/40 rounded-full blur-xl" />
                    </motion.div>
                ))}
            </div>

            {/* 雪のパーティクル */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {snowflakes.map((snow, i) => (
                    <motion.div
                        key={`snow-${i}`}
                        initial={{ 
                            y: -20, 
                            x: snow.startX + "%",
                            opacity: 0
                        }}
                        animate={{ 
                            y: "100vh",
                            x: [
                                `${snow.x1}%`,
                                `${snow.x2}%`,
                                `${snow.x3}%`
                            ],
                            opacity: [0, 0.6, 0]
                        }}
                        transition={{
                            duration: snow.duration,
                            ease: "linear",
                            repeat: Infinity,
                            delay: snow.delay
                        }}
                        className="absolute"
                    >
                        <div 
                            className="bg-white rounded-full blur-sm"
                            style={{
                                width: `${snow.width}px`,
                                height: `${snow.height}px`,
                            }}
                        />
                    </motion.div>
                ))}
            </div>

            {/* メインコンテンツ */}
            <div className="relative z-10 flex flex-col items-center justify-center space-y-8">
                
                {/* 山のシルエット群 - 下から浮上 */}
                <motion.div
                    initial={{ y: 100, opacity: 0, scale: 0.5 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    transition={{
                        duration: 0.6,
                        ease: [0.34, 1.56, 0.64, 1]
                    }}
                    className="relative"
                >
                    {/* 光の背景 */}
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ 
                            duration: 0.5,
                            delay: 0.2,
                            ease: "easeOut"
                        }}
                        className="absolute inset-0 -m-16 bg-gradient-radial from-white/80 via-white/40 to-transparent rounded-full blur-3xl"
                    />
                    
                    {/* 3つの山のシルエット */}
                    <motion.svg
                        animate={{ 
                            y: [0, -5, 0],
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        viewBox="0 0 300 180"
                        className="relative w-72 h-auto drop-shadow-2xl"
                    >
                        {/* 背景の山 - 左 */}
                        <motion.path
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.4 }}
                            d="M0,180 L50,100 L80,120 L110,90 L130,110 L150,140 L0,180 Z"
                            fill="#64748b"
                            opacity="0.5"
                        />
                        {/* 雪キャップ - 左の山 */}
                        <path d="M50,100 L40,110 L60,110 Z" fill="white" opacity="0.6" />
                        <path d="M110,90 L100,100 L120,100 Z" fill="white" opacity="0.6" />

                        {/* 背景の山 - 右 */}
                        <motion.path
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.35, duration: 0.4 }}
                            d="M150,140 L170,110 L200,90 L230,110 L250,100 L280,130 L300,150 L300,180 L150,180 Z"
                            fill="#64748b"
                            opacity="0.5"
                        />
                        {/* 雪キャップ - 右の山 */}
                        <path d="M200,90 L190,100 L210,100 Z" fill="white" opacity="0.6" />
                        <path d="M250,100 L240,110 L260,110 Z" fill="white" opacity="0.6" />

                        {/* メインの山 - 中央（最も高い） */}
                        <motion.path
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.5 }}
                            d="M80,180 L120,110 L150,40 L180,100 L210,80 L240,120 L220,180 Z"
                            fill="#475569"
                            filter="drop-shadow(0 10px 20px rgba(0,0,0,0.3))"
                        />
                        {/* 雪キャップ - 中央の山頂 */}
                        <motion.path
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            d="M150,40 L130,65 L170,65 Z"
                            fill="white"
                            opacity="0.95"
                        />
                        {/* 山頂の旗 */}
                        <motion.g
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.8, duration: 0.3 }}
                        >
                            <line x1="150" y1="40" x2="150" y2="20" stroke="#ef4444" strokeWidth="2" />
                            <motion.path
                                animate={{ 
                                    d: [
                                        "M150,20 L170,25 L150,30 Z",
                                        "M150,20 L168,25 L150,30 Z",
                                        "M150,20 L170,25 L150,30 Z"
                                    ]
                                }}
                                transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                                fill="#ef4444"
                            />
                        </motion.g>
                        {/* 岩肌のディテール */}
                        <path d="M120,110 L110,140 L130,135 Z" fill="#334155" opacity="0.4" />
                        <path d="M180,100 L170,130 L190,125 Z" fill="#334155" opacity="0.4" />
                        <path d="M150,65 L145,90 L155,85 Z" fill="#334155" opacity="0.3" />
                    </motion.svg>
                </motion.div>

                {/* ROUND テキスト */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ 
                        duration: 0.5,
                        delay: 0.4,
                        ease: "easeOut"
                    }}
                    className="text-center space-y-2"
                >
                    <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{
                            duration: 0.3,
                            delay: 0.5
                        }}
                        className="text-8xl md:text-9xl font-black text-slate-800 tracking-tight leading-none"
                    >
                        ROUND
                    </motion.div>
                    
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                            duration: 0.4,
                            delay: 0.7,
                            ease: [0.34, 1.56, 0.64, 1]
                        }}
                        className="relative inline-block"
                    >
                        {/* 数字の背景円 */}
                        <div className="absolute inset-0 -m-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full blur-xl opacity-60" />
                        
                        <div className="relative text-9xl md:text-[12rem] font-black text-white drop-shadow-2xl">
                            {roundNumber}
                        </div>
                    </motion.div>
                </motion.div>

                {/* 準備完了メッセージ */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ 
                        duration: 0.4,
                        delay: 1.0
                    }}
                    className="text-center"
                >
                    <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg border-2 border-slate-200">
                        <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{
                                duration: 1,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        >
                            ⛰️
                        </motion.div>
                        <span className="text-lg font-bold text-slate-700 tracking-wide">
                            準備はいいですか？
                        </span>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}
