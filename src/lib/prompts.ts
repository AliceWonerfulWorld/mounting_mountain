// src/lib/prompts.ts

/**
 * ゲームで使用するお題一覧
 * デモが安定するように、マウントしやすいテーマを用意する
 */

export type Prompt = {
  id: string;
  text: string;
  category:
    | "income"
    | "education"
    | "knowledge"
    | "effort"
    | "gaming"
    | "free"
    | "lifestyle"
    | "career"
    | "experience"
    | "skill"
    | "digital"
    | "relationship"
    | "health"
    | "culture";
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
  {
    id: "p7",
    text: "住んでいる場所の良さをアピールしてください。",
    category: "lifestyle",
  },
  {
    id: "p8",
    text: "睡眠時間の少なさを自慢してください。",
    category: "lifestyle",
  },
  {
    id: "p9",
    text: "忙しさをアピールしてください。",
    category: "lifestyle",
  },
  {
    id: "p10",
    text: "人脈の広さを誇示してください。",
    category: "relationship",
  },
  {
    id: "p11",
    text: "副業や複業の多さをアピールしてください。",
    category: "career",
  },
  {
    id: "p12",
    text: "早起き習慣を誇ってください。",
    category: "lifestyle",
  },
  {
    id: "p13",
    text: "海外経験の豊富さをアピールしてください。",
    category: "experience",
  },
  {
    id: "p14",
    text: "読書量の多さを誇示してください。",
    category: "culture",
  },
  {
    id: "p15",
    text: "グルメな自分をアピールしてください。",
    category: "culture",
  },
  {
    id: "p16",
    text: "語学力の高さを自慢してください。",
    category: "skill",
  },
  {
    id: "p17",
    text: "資格の数を誇ってください。",
    category: "skill",
  },
  {
    id: "p18",
    text: "運動能力や体力をアピールしてください。",
    category: "health",
  },
  {
    id: "p19",
    text: "SNSのフォロワー数を自慢してください。",
    category: "digital",
  },
  {
    id: "p20",
    text: "最新ガジェットへの投資をアピールしてください。",
    category: "digital",
  },
  {
    id: "p21",
    text: "子どもの優秀さをアピールしてください。",
    category: "relationship",
  },
  {
    id: "p22",
    text: "パートナーの魅力を誇ってください。",
    category: "relationship",
  },
  {
    id: "p23",
    text: "友人関係の充実度をアピールしてください。",
    category: "relationship",
  },
  {
    id: "p24",
    text: "健康意識の高さをアピールしてください。",
    category: "health",
  },
  {
    id: "p25",
    text: "自己投資の額を誇ってください。",
    category: "career",
  },
  {
    id: "p26",
    text: "時間管理の上手さをアピールしてください。",
    category: "lifestyle",
  },
  {
    id: "p27",
    text: "コーヒーやお酒へのこだわりを語ってください。",
    category: "culture",
  },
  {
    id: "p28",
    text: "ファッションセンスの良さをアピールしてください。",
    category: "lifestyle",
  },
  {
    id: "p29",
    text: "映画や音楽の造詣の深さを誇ってください。",
    category: "culture",
  },
  {
    id: "p30",
    text: "誰よりも早くトレンドに気づいたことをアピールしてください。",
    category: "culture",
  },
  {
    id: "p31",
    text: "節約や倹約の上手さを誇ってください（でもマウント取って）。",
    category: "free",
  },
  {
    id: "p32",
    text: "苦労話を通じて優位性をアピールしてください。",
    category: "effort",
  },
];
