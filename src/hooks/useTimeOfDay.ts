import { useState, useEffect, useMemo } from "react";
import {
  type TimeOfDay as NewTimeOfDay,
  type LegacyTimeOfDay,
  getTimeOfDay as getNewTimeOfDay,
  getTimeOfDayProgress,
  toLegacyTimeOfDay,
} from "@/lib/timeOfDayConfig";

// 後方互換性のため、旧バージョンの型をエクスポート
export type TimeOfDay = LegacyTimeOfDay;

/**
 * 拡張版の時間帯情報
 */
export interface TimeOfDayInfo {
  /** 新しい6段階の時間帯 */
  timeOfDay: NewTimeOfDay;
  /** 旧バージョンの4段階の時間帯（後方互換性のため） */
  legacy: LegacyTimeOfDay;
  /** 時間帯内での進行度（0.0～1.0） */
  progress: number;
}

/**
 * 旧バージョンの時間帯判定関数（後方互換性のため）
 */
function getTimeOfDay(): LegacyTimeOfDay {
  const newTimeOfDay = getNewTimeOfDay();
  return toLegacyTimeOfDay(newTimeOfDay);
}

/**
 * 旧バージョンのuseTimeOfDayフック（後方互換性のため）
 * @deprecated 新しいuseTimeOfDayExtendedを使用してください
 */
export function useTimeOfDay(): LegacyTimeOfDay {
  const [timeOfDay, setTimeOfDay] = useState<LegacyTimeOfDay>(() => getTimeOfDay());

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeOfDay(getTimeOfDay());
    }, 60000); // 1分ごとにチェック

    return () => clearInterval(interval);
  }, []);

  return timeOfDay;
}

/**
 * 拡張版のuseTimeOfDayフック
 * 6つの時間帯と進行度を提供
 */
export function useTimeOfDayExtended(): TimeOfDayInfo {
  const [currentTime, setCurrentTime] = useState<Date>(() => new Date());

  useEffect(() => {
    // デバッグモード対応（開発環境のみ）
    if (process.env.NODE_ENV === "development") {
      const checkDebugMode = () => {
        const debugTimeOfDay = (window as any).__DEBUG_TIME_OF_DAY as NewTimeOfDay | undefined;
        if (debugTimeOfDay) {
          // デバッグモードの場合は更新しない
          return;
        }
        setCurrentTime(new Date());
      };

      const interval = setInterval(checkDebugMode, 60000); // 1分ごとにチェック
      return () => clearInterval(interval);
    } else {
      const interval = setInterval(() => {
        setCurrentTime(new Date());
      }, 60000); // 1分ごとにチェック

      return () => clearInterval(interval);
    }
  }, []);

  // デバッグモード対応（SSR対応）
  const debugTimeOfDay =
    process.env.NODE_ENV === "development" && typeof window !== 'undefined'
      ? ((window as any).__DEBUG_TIME_OF_DAY as NewTimeOfDay | undefined)
      : undefined;

  // useMemoでメモ化してパフォーマンス最適化
  const timeOfDayInfo = useMemo<TimeOfDayInfo>(() => {
    // デバッグモードの場合は指定された時間帯を使用
    if (debugTimeOfDay) {
      return {
        timeOfDay: debugTimeOfDay,
        legacy: toLegacyTimeOfDay(debugTimeOfDay),
        progress: 0.5, // デバッグ時は中間点
      };
    }

    const timeOfDay = getNewTimeOfDay(currentTime);
    const progress = getTimeOfDayProgress(currentTime);
    const legacy = toLegacyTimeOfDay(timeOfDay);

    return {
      timeOfDay,
      legacy,
      progress,
    };
  }, [currentTime, debugTimeOfDay]);

  return timeOfDayInfo;
}

// デフォルトエクスポートは旧バージョン（後方互換性のため）
export default useTimeOfDay;
