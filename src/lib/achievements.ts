export type AchievementId = string;

export type Achievement = {
    id: AchievementId;         // 変更しない（固定）
    title: string;
    description: string;
    icon?: string;             // 絵文字など
};

export const ACHIEVEMENTS: Achievement[] = [
    // --- ソロ系 ---
    {
        id: "first_judgement",
        title: "第一歩",
        description: "初めて判定を行った",
        icon: "👣",
    },
    {
        id: "alps_reached",
        title: "アルピニスト",
        description: "3000m以上のマウントをとった",
        icon: "🏔️",
    },
    {
        id: "snow_reached",
        title: "銀世界",
        description: "6000m以上のマウントをとった",
        icon: "⛄",
    },
    {
        id: "everest_reached",
        title: "世界の頂",
        description: "8000m以上のマウントをとった",
        icon: "🚩",
    },
    {
        id: "total_10000m",
        title: "成層圏突入",
        description: "1ゲームの合計標高が10000mを超えた",
        icon: "🚀",
    },

    // --- 対戦系 ---
    {
        id: "versus_first_play",
        title: "ライバル出現",
        description: "ローカル対戦を初めてプレイした",
        icon: "⚔️",
    },
    {
        id: "versus_first_win",
        title: "初勝利",
        description: "ローカル対戦で初めて勝利した",
        icon: "🏆",
    },
    {
        id: "versus_3wins",
        title: "常勝無敗",
        description: "ローカル対戦で累計3勝した",
        icon: "👑",
    },
    {
        id: "versus_win_by_3000",
        title: "圧倒的格差",
        description: "3000m以上の差をつけて勝利した",
        icon: "🔥",
    },

    // --- その他（将来拡張用） ---
    {
        id: "combo_master",
        title: "追撃の手",
        description: "【未実装】コンボボーナスを獲得した",
        icon: "⚡",
    },
];
