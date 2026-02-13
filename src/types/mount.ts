export type MountResult = {
  mountScore: number; // 0.00〜1.00
  altitude: number; // 0〜8848（メートル）
  labels: string[]; // 例: ["比較", "数値"]
  rewrite: string; // 優しい言い換え

  // ボーナス拡張
  baseAltitude?: number; // 素の標高
  bonusAltitude?: number; // ボーナス加算分
  finalAltitude?: number; // 最終標高（base + bonus）
  bonusReasons?: string[]; // ボーナス理由
};