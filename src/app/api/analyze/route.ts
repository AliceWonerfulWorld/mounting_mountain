import { NextResponse } from "next/server";
import type { MountResult } from "@/types/mount";

export async function POST(req: Request) {
  const { text } = (await req.json()) as { text: string };

  // ダミー：文字数でスコアを決める（今のfakeAnalyzeと同等）
  const mountScore = Math.min(1, Math.max(0, text.length / 60));
  const altitude = Math.round(mountScore * 8848);
  const labels = altitude > 6000 ? ["数値", "比較"] : altitude > 3000 ? ["比較"] : ["弱め"];
  const rewrite = "（ダミーAPI）優しい言い方にするとこう！";

  const result: MountResult = { mountScore, altitude, labels, rewrite };
  return NextResponse.json(result);
}
