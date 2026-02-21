"use client";

import { useEffect, useState } from "react";

type TimeOfDay = "morning" | "day" | "evening" | "night";

function getTimeOfDay(): TimeOfDay {
    const hour = new Date().getHours();
    
    if (hour >= 6 && hour < 11) return "morning";
    if (hour >= 11 && hour < 16) return "day";
    if (hour >= 16 && hour < 19) return "evening";
    return "night";
}

const backgrounds = {
    morning: {
        gradient: "from-orange-300 via-pink-200 to-sky-300",
        mountains: {
            far: { color: "from-purple-400 via-purple-300", opacity: "opacity-30" },
            mid: { color: "from-indigo-400 via-indigo-300", opacity: "opacity-35" },
            near: { color: "from-orange-400 via-orange-300", opacity: "opacity-45" },
            front: { color: "from-amber-500 via-amber-400", opacity: "opacity-55" },
            peak: { color: "from-indigo-500 via-indigo-400 to-pink-200", opacity: "opacity-65" }
        }
    },
    day: {
        gradient: "from-sky-400 via-blue-200 to-green-100",
        mountains: {
            far: { color: "from-blue-400 via-blue-300", opacity: "opacity-30" },
            mid: { color: "from-cyan-500 via-cyan-400", opacity: "opacity-40" },
            near: { color: "from-emerald-600 via-emerald-500", opacity: "opacity-50" },
            front: { color: "from-green-700 via-green-600", opacity: "opacity-60" },
            peak: { color: "from-slate-600 via-slate-500 to-white", opacity: "opacity-70" }
        }
    },
    evening: {
        gradient: "from-orange-500 via-pink-400 to-purple-300",
        mountains: {
            far: { color: "from-purple-600 via-purple-500", opacity: "opacity-35" },
            mid: { color: "from-orange-600 via-orange-500", opacity: "opacity-45" },
            near: { color: "from-red-700 via-red-600", opacity: "opacity-55" },
            front: { color: "from-amber-800 via-amber-700", opacity: "opacity-65" },
            peak: { color: "from-slate-700 via-slate-600 to-orange-300", opacity: "opacity-70" }
        }
    },
    night: {
        gradient: "from-indigo-900 via-purple-800 to-blue-900",
        mountains: {
            far: { color: "from-slate-800 via-slate-700", opacity: "opacity-25" },
            mid: { color: "from-slate-700 via-slate-600", opacity: "opacity-30" },
            near: { color: "from-slate-900 via-slate-800", opacity: "opacity-40" },
            front: { color: "from-gray-900 via-gray-800", opacity: "opacity-50" },
            peak: { color: "from-slate-900 via-slate-800 to-blue-200", opacity: "opacity-60" }
        }
    }
};

export function MountainBackground() {
    const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>("day");

    useEffect(() => {
        setTimeOfDay(getTimeOfDay());
        
        // 1分ごとに時間帯をチェック
        const interval = setInterval(() => {
            setTimeOfDay(getTimeOfDay());
        }, 60000);

        return () => clearInterval(interval);
    }, []);

    const theme = backgrounds[timeOfDay];

    return (
        <>
            {/* グラデーション背景 */}
            <div className={`absolute inset-0 bg-gradient-to-b ${theme.gradient} transition-colors duration-1000`} />

            {/* 山の背景 */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {/* 遠景の山々 */}
                <div className={`absolute bottom-0 left-0 right-0 h-[500px] ${theme.mountains.far.opacity} transition-opacity duration-1000`}>
                    <div className={`absolute bottom-0 w-full h-full bg-gradient-to-t ${theme.mountains.far.color} to-transparent`}
                         style={{
                             clipPath: 'polygon(0% 100%, 5% 50%, 12% 58%, 18% 42%, 25% 52%, 32% 38%, 40% 48%, 48% 32%, 55% 45%, 62% 28%, 70% 42%, 78% 25%, 85% 38%, 92% 22%, 100% 35%, 100% 100%)'
                         }}>
                    </div>
                </div>

                {/* 中景の山々 */}
                <div className={`absolute bottom-0 left-0 right-0 h-[400px] ${theme.mountains.mid.opacity} transition-opacity duration-1000`}>
                    <div className={`absolute bottom-0 w-full h-full bg-gradient-to-t ${theme.mountains.mid.color} to-transparent`}
                         style={{
                             clipPath: 'polygon(0% 100%, 8% 42%, 15% 52%, 23% 35%, 32% 45%, 42% 28%, 52% 38%, 62% 25%, 72% 35%, 82% 22%, 90% 32%, 100% 20%, 100% 100%)'
                         }}>
                    </div>
                </div>

                {/* 近景の山々 */}
                <div className={`absolute bottom-0 left-0 right-0 h-[320px] ${theme.mountains.near.opacity} transition-opacity duration-1000`}>
                    <div className={`absolute bottom-0 w-full h-full bg-gradient-to-t ${theme.mountains.near.color} to-transparent`}
                         style={{
                             clipPath: 'polygon(0% 100%, 10% 35%, 20% 45%, 30% 25%, 40% 38%, 50% 18%, 60% 32%, 70% 22%, 80% 35%, 90% 25%, 100% 32%, 100% 100%)'
                         }}>
                    </div>
                    {/* 山の陰影 */}
                    <div className="absolute bottom-0 w-full h-full bg-gradient-to-br from-transparent via-black/20 to-black/30 transition-opacity duration-1000"
                         style={{
                             clipPath: 'polygon(0% 100%, 10% 35%, 20% 45%, 30% 25%, 40% 38%, 50% 18%, 60% 32%, 70% 22%, 80% 35%, 90% 25%, 100% 32%, 100% 100%)'
                         }}>
                    </div>
                </div>

                {/* 最前景の山々 */}
                <div className={`absolute bottom-0 left-0 right-0 h-[240px] ${theme.mountains.front.opacity} transition-opacity duration-1000`}>
                    <div className={`absolute bottom-0 w-full h-full bg-gradient-to-t ${theme.mountains.front.color} to-transparent`}
                         style={{
                             clipPath: 'polygon(0% 100%, 15% 45%, 25% 55%, 35% 35%, 45% 48%, 55% 28%, 65% 42%, 75% 32%, 85% 45%, 95% 35%, 100% 42%, 100% 100%)'
                         }}>
                    </div>
                    {/* 最前景の山の陰影 */}
                    <div className="absolute bottom-0 w-full h-full bg-gradient-to-br from-transparent via-black/25 to-black/40 transition-opacity duration-1000"
                         style={{
                             clipPath: 'polygon(0% 100%, 15% 45%, 25% 55%, 35% 35%, 45% 48%, 55% 28%, 65% 42%, 75% 32%, 85% 45%, 95% 35%, 100% 42%, 100% 100%)'
                         }}>
                    </div>
                </div>

                {/* 雪を被った最高峰（中央のランドマーク） */}
                <div className={`absolute bottom-0 left-[40%] w-[20%] h-[280px] ${theme.mountains.peak.opacity} transition-opacity duration-1000`}>
                    <div className={`absolute bottom-0 w-full h-full bg-gradient-to-t ${theme.mountains.peak.color}`}
                         style={{
                             clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'
                         }}>
                    </div>
                    {/* 雪の輝き */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[40%] bg-gradient-to-b from-white/90 to-transparent blur-sm transition-opacity duration-1000"
                         style={{
                             clipPath: 'polygon(50% 0%, 20% 100%, 80% 100%)'
                         }}>
                    </div>
                </div>

                {/* 夜の場合は星を追加 */}
                {timeOfDay === "night" && (
                    <div className="absolute inset-0 animate-pulse" style={{ animationDuration: '4s' }}>
                        {[...Array(30)].map((_, i) => (
                            <div
                                key={i}
                                className="absolute w-1 h-1 bg-white rounded-full"
                                style={{
                                    left: `${Math.random() * 100}%`,
                                    top: `${Math.random() * 60}%`,
                                    opacity: Math.random() * 0.8 + 0.2
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
