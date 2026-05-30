"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { getRoute, type RouteId } from "@/lib/solo/routes";

type RouteCardProps = {
    routeId: RouteId;
    isSelected: boolean;
    onSelect: (routeId: RouteId) => void;
};

export const RouteCard = memo(function RouteCard({ routeId, isSelected, onSelect }: RouteCardProps) {
    const route = getRoute(routeId);
    const colorClass = routeId === "SAFE" ? "text-blue-500" : routeId === "RISKY" ? "text-red-500" : "text-amber-600";

    return (
        <button
            onClick={() => onSelect(routeId)}
            className={cn(
                "relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200",
                isSelected
                    ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 shadow-md transform scale-[1.02]"
                    : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white/50 dark:bg-slate-800/50"
            )}
        >
            {isSelected && (
                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-sm"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                </motion.div>
            )}

            <div className="text-3xl mb-2">{route.emoji}</div>
            <div className="text-sm font-bold text-slate-700 dark:text-slate-200">{route.label}</div>
            <div className={cn("text-xs font-bold mt-1", colorClass)}>
                x{route.multiplier}
            </div>
        </button>
    );
});
