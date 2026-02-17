
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

/**
 * 数値を0から1の範囲に制限する
 */
export function clamp01(x: number) {
    return Math.max(0, Math.min(1, x));
}
