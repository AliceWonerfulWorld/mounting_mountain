/**
 * 時間帯別背景の設定定数
 * 各時間帯の定義、色設定、要素の配置などを管理
 */

/**
 * 時間帯の種類（6つ）
 */
export type TimeOfDay = 'dawn' | 'morning' | 'day' | 'afternoon' | 'sunset' | 'night';

/**
 * 後方互換性のため、旧バージョンの型も維持
 */
export type LegacyTimeOfDay = 'morning' | 'day' | 'evening' | 'night';

/**
 * 時間帯の設定
 */
export interface TimeOfDayConfig {
  /** 時間帯の識別子 */
  id: TimeOfDay;
  /** 表示名 */
  name: string;
  /** 開始時刻（時） */
  startHour: number;
  /** 開始時刻（分） */
  startMinute: number;
  /** 終了時刻（時） */
  endHour: number;
  /** 終了時刻（分） */
  endMinute: number;
  /** 背景のグラデーション設定 */
  gradient: {
    from: string;
    via: string;
    to: string;
  };
  /** 太陽/月の設定 */
  celestialBody: {
    type: 'sun' | 'moon';
    /** 画面上の位置（%） */
    position: {
      horizontal: number; // 0-100: 左から右
      vertical: number; // 0-100: 上から下
    };
  };
  /** 雲の設定 */
  clouds: {
    /** 基本色 */
    color: string;
    /** 不透明度 */
    opacity: number;
  };
  /** テキストの色 */
  textColor: {
    primary: string; // タイトル
    secondary: string; // サブテキスト
  };
}

/**
 * 各時間帯の設定
 */
export const TIME_OF_DAY_CONFIGS: Record<TimeOfDay, TimeOfDayConfig> = {
  // 1. 夜明け前 (Dawn) - 5:00～6:30
  dawn: {
    id: 'dawn',
    name: '夜明け前',
    startHour: 5,
    startMinute: 0,
    endHour: 6,
    endMinute: 30,
    gradient: {
      from: 'indigo-900',
      via: 'purple-700',
      to: 'orange-400',
    },
    celestialBody: {
      type: 'sun',
      position: {
        horizontal: 10, // 左下から昇る
        vertical: 80,
      },
    },
    clouds: {
      color: '#e9d5ff', // 紫がかった雲
      opacity: 0.7,
    },
    textColor: {
      primary: 'text-white',
      secondary: 'text-orange-100',
    },
  },

  // 2. 朝 (Morning) - 6:30～11:00
  morning: {
    id: 'morning',
    name: '朝',
    startHour: 6,
    startMinute: 30,
    endHour: 11,
    endMinute: 0,
    gradient: {
      from: 'sky-300',
      via: 'blue-200',
      to: 'yellow-100',
    },
    celestialBody: {
      type: 'sun',
      position: {
        horizontal: 25, // 左側、やや高い位置
        vertical: 25,
      },
    },
    clouds: {
      color: '#ffffff',
      opacity: 0.9,
    },
    textColor: {
      primary: 'text-white',
      secondary: 'text-gray-700',
    },
  },

  // 3. 昼 (Day) - 11:00～15:00 - 現在の実装を維持
  day: {
    id: 'day',
    name: '昼',
    startHour: 11,
    startMinute: 0,
    endHour: 15,
    endMinute: 0,
    gradient: {
      from: 'sky-400',
      via: 'blue-300',
      to: 'green-200',
    },
    celestialBody: {
      type: 'sun',
      position: {
        horizontal: 88, // 右上（現在の実装）
        vertical: 8,
      },
    },
    clouds: {
      color: '#ffffff',
      opacity: 0.95,
    },
    textColor: {
      primary: 'text-white',
      secondary: 'text-gray-700',
    },
  },

  // 4. 午後 (Afternoon) - 15:00～17:30
  afternoon: {
    id: 'afternoon',
    name: '午後',
    startHour: 15,
    startMinute: 0,
    endHour: 17,
    endMinute: 30,
    gradient: {
      from: 'orange-300',
      via: 'amber-200',
      to: 'yellow-100',
    },
    celestialBody: {
      type: 'sun',
      position: {
        horizontal: 75, // 右側、やや低い位置
        vertical: 40,
      },
    },
    clouds: {
      color: '#fed7aa', // オレンジがかった雲
      opacity: 0.85,
    },
    textColor: {
      primary: 'text-white',
      secondary: 'text-amber-900',
    },
  },

  // 5. 夕暮れ (Sunset) - 17:30～19:00
  sunset: {
    id: 'sunset',
    name: '夕暮れ',
    startHour: 17,
    startMinute: 30,
    endHour: 19,
    endMinute: 0,
    gradient: {
      from: 'pink-500',
      via: 'orange-400',
      to: 'purple-600',
    },
    celestialBody: {
      type: 'sun',
      position: {
        horizontal: 90, // 右下に沈む
        vertical: 70,
      },
    },
    clouds: {
      color: '#fda4af', // ピンク〜紫の雲
      opacity: 0.8,
    },
    textColor: {
      primary: 'text-white',
      secondary: 'text-pink-100',
    },
  },

  // 6. 夜 (Night) - 19:00～5:00
  night: {
    id: 'night',
    name: '夜',
    startHour: 19,
    startMinute: 0,
    endHour: 5,
    endMinute: 0,
    gradient: {
      from: 'slate-900',
      via: 'indigo-950',
      to: 'black',
    },
    celestialBody: {
      type: 'moon',
      position: {
        horizontal: 80, // 右上
        vertical: 20,
      },
    },
    clouds: {
      color: '#334155', // 青白い雲
      opacity: 0.6,
    },
    textColor: {
      primary: 'text-white',
      secondary: 'text-blue-100',
    },
  },
};

/**
 * 時間（時:分）を分に変換
 */
export function timeToMinutes(hours: number, minutes: number): number {
  return hours * 60 + minutes;
}

/**
 * 現在時刻から時間帯を判定
 */
export function getTimeOfDay(now: Date = new Date()): TimeOfDay {
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const currentMinutes = timeToMinutes(hours, minutes);

  // 各時間帯をチェック
  for (const config of Object.values(TIME_OF_DAY_CONFIGS)) {
    const startMinutes = timeToMinutes(config.startHour, config.startMinute);
    const endMinutes = timeToMinutes(config.endHour, config.endMinute);

    // 夜のみ特殊処理（19:00～翌5:00）
    if (config.id === 'night') {
      if (currentMinutes >= startMinutes || currentMinutes < endMinutes) {
        return 'night';
      }
    } else {
      if (currentMinutes >= startMinutes && currentMinutes < endMinutes) {
        return config.id;
      }
    }
  }

  // デフォルトは昼
  return 'day';
}

/**
 * 時間帯内での進行度を計算（0.0～1.0）
 * 時間帯の開始時刻を0、終了時刻を1とする
 */
export function getTimeOfDayProgress(now: Date = new Date()): number {
  const timeOfDay = getTimeOfDay(now);
  const config = TIME_OF_DAY_CONFIGS[timeOfDay];

  const hours = now.getHours();
  const minutes = now.getMinutes();
  const currentMinutes = timeToMinutes(hours, minutes);

  const startMinutes = timeToMinutes(config.startHour, config.startMinute);
  const endMinutes = timeToMinutes(config.endHour, config.endMinute);

  // 夜の特殊処理
  if (timeOfDay === 'night') {
    const totalDuration = (24 * 60 - startMinutes) + endMinutes; // 19:00～24:00 + 0:00～5:00
    let elapsed: number;

    if (currentMinutes >= startMinutes) {
      elapsed = currentMinutes - startMinutes;
    } else {
      elapsed = (24 * 60 - startMinutes) + currentMinutes;
    }

    return Math.min(Math.max(elapsed / totalDuration, 0), 1);
  }

  // 通常の時間帯
  const totalDuration = endMinutes - startMinutes;
  const elapsed = currentMinutes - startMinutes;

  return Math.min(Math.max(elapsed / totalDuration, 0), 1);
}

/**
 * 新しいTimeOfDayを旧バージョンのLegacyTimeOfDayに変換
 * 後方互換性のため
 */
export function toLegacyTimeOfDay(timeOfDay: TimeOfDay): LegacyTimeOfDay {
  switch (timeOfDay) {
    case 'dawn':
    case 'morning':
      return 'morning';
    case 'day':
      return 'day';
    case 'afternoon':
    case 'sunset':
      return 'evening';
    case 'night':
      return 'night';
  }
}
