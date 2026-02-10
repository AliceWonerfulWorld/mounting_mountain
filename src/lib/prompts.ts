// src/lib/prompts.ts

/**
 * ゲームで使用するお題一覧
 * デモが安定するように、マウントしやすいテーマを用意する
 */

export type Prompt = {
  id: string;
  text: string;
  category: "income" | "education" | "knowledge" | "effort" | "gaming" | "free";
};

export const PROMPTS: Prompt[] = [
  {
    id: "p1",
    text: "年収についてマウントを取ってください。",
    category: "income",
  },
  {
    id: "p2",
    text: "学歴についてマウントを取ってください。",
    category: "education",
  },
  {
    id: "p3",
    text: "知識量で優位に立つ発言をしてください。",
    category: "knowledge",
  },
  {
    id: "p4",
    text: "努力量を誇示してください。",
    category: "effort",
  },
  {
    id: "p5",
    text: "ゲームの実力でマウントを取ってください。",
    category: "gaming",
  },
  {
    id: "p6",
    text: "自由にマウントを取ってください。",
    category: "free",
  },
];
