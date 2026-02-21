export type AchievementId = string;

export type AchievementCategory = 
  | "altitude"    // 標高達成系
  | "versus"      // 対戦系
  | "special";    // 特殊系

export type Achievement = {
    id: AchievementId;         // 変更しない（固定）
    title: string;
    description: string;
    icon?: string;             // 絵文字など
    category: AchievementCategory;  // カテゴリ
    order: number;                   // ルート内での順序（1から始まる）
    requiredValue?: number;          // 達成条件の値（標高や勝利数など）
};

export const ACHIEVEMENTS: Achievement[] = [
    // --- 標高達成ルート ---
    {
        id: "first_judgement",
        title: "第一歩",
        description: "初めて判定を行った",
        icon: "👣",
        category: "altitude",
        order: 1,
    },
    {
        id: "alps_reached",
        title: "アルピニスト",
        description: "3000m以上のマウントをとった",
        icon: "🏔️",
        category: "altitude",
        order: 2,
        requiredValue: 3000,
    },
    {
        id: "snow_reached",
        title: "銀世界",
        description: "6000m以上のマウントをとった",
        icon: "⛄",
        category: "altitude",
        order: 3,
        requiredValue: 6000,
    },
    {
        id: "everest_reached",
        title: "世界の頂",
        description: "8000m以上のマウントをとった",
        icon: "🚩",
        category: "altitude",
        order: 4,
        requiredValue: 8000,
    },
    {
        id: "total_10000m",
        title: "成層圏突入",
        description: "1ゲームの合計標高が10000mを超えた",
        icon: "🚀",
        category: "altitude",
        order: 5,
        requiredValue: 10000,
    },

    // --- 対戦ルート ---
    {
        id: "versus_first_play",
        title: "ライバル出現",
        description: "ローカル対戦を初めてプレイした",
        icon: "⚔️",
        category: "versus",
        order: 1,
    },
    {
        id: "versus_first_win",
        title: "初勝利",
        description: "ローカル対戦で初めて勝利した",
        icon: "🏆",
        category: "versus",
        order: 2,
    },
    {
        id: "versus_3wins",
        title: "常勝無敗",
        description: "ローカル対戦で累計3勝した",
        icon: "👑",
        category: "versus",
        order: 3,
        requiredValue: 3,
    },
    {
        id: "versus_win_by_3000",
        title: "圧倒的格差",
        description: "3000m以上の差をつけて勝利した",
        icon: "🔥",
        category: "versus",
        order: 4,
        requiredValue: 3000,
    },

    // --- 特殊ルート ---
    {
        id: "combo_master",
        title: "追撃の手",
        description: "【未実装】コンボボーナスを獲得した",
        icon: "⚡",
        category: "special",
        order: 1,
    },
];

/**
 * カテゴリの表示情報
 */
export const CATEGORY_INFO: Record<AchievementCategory, { label: string; icon: string }> = {
    altitude: { label: "標高達成ルート", icon: "⛰️" },
    versus: { label: "対戦の道", icon: "⚔️" },
    special: { label: "特殊ルート", icon: "✨" },
};

/**
 * 実績をカテゴリ別にグループ化し、各カテゴリ内で順序順にソートして返す
 */
export function groupAchievementsByCategory(): Record<AchievementCategory, Achievement[]> {
    const grouped: Record<AchievementCategory, Achievement[]> = {
        altitude: [],
        versus: [],
        special: [],
    };

    ACHIEVEMENTS.forEach(achievement => {
        grouped[achievement.category].push(achievement);
    });

    // 各カテゴリ内で order 順にソート
    (Object.keys(grouped) as AchievementCategory[]).forEach(category => {
        grouped[category].sort((a, b) => a.order - b.order);
    });

    return grouped;
}
