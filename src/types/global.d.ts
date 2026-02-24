import type { TimeOfDay } from '@/lib/timeOfDayConfig';

declare global {
  interface Window {
    /**
     * デバッグ用：時間帯を強制的に設定
     * 開発環境でのみ有効
     * 
     * @example
     * // 夜に切り替え
     * window.__DEBUG_TIME_OF_DAY = 'night';
     * 
     * // 実際の時刻に戻す
     * window.__DEBUG_TIME_OF_DAY = undefined;
     */
    __DEBUG_TIME_OF_DAY?: TimeOfDay;
  }
}

export {};
