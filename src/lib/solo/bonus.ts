/**
 * ボーナス計算結果
 */
export type BonusOut = {
    bonusAltitude: number;
    reasons: string[];
};

/**
 * ラベルのユニーク数に基づいてボーナスを計算する純関数
 * @param labels マウント判定結果のラベル配列
 * @returns ボーナス標高と理由
 */
export function computeBonus(labels: string[]): BonusOut {
    const uniqueLabels = new Set(labels);
    const count = uniqueLabels.size;
    let bonusAltitude = 0;
    const reasons: string[] = [];

    // 1) ラベル数ボーナス
    if (count >= 4) {
        bonusAltitude += 1200;
        reasons.push(`深みのあるマウント（4種複合） +1200m`);
    } else if (count >= 3) {
        bonusAltitude += 700;
        reasons.push(`多角的なマウント（3種複合） +700m`);
    } else if (count >= 2) {
        bonusAltitude += 300;
        reasons.push(`複合マウント（2種複合） +300m`);
    }

    // 将来的に雪山ストリークなどを引数に追加して判定可能

    return {
        bonusAltitude,
        reasons,
    };
}
