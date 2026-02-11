import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-50">
      <h1 className="text-4xl font-bold mb-4">🏔 マウンティングマウンテン</h1>
      <p className="text-lg mb-8 text-zinc-600 dark:text-zinc-400">
        「マウント」を“標高”で可視化するAIゲーム
      </p>

      <div className="flex flex-col gap-4">
        <Link
          href="/solo"
          className="px-6 py-3 rounded-lg bg-black text-white dark:bg-white dark:text-black font-semibold hover:opacity-80 transition-opacity text-center"
        >
          ソロモードで遊ぶ
        </Link>
        <Link
          href="/versus/local"
          className="px-6 py-3 rounded-lg border border-black dark:border-white text-black dark:text-white font-semibold hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-center"
        >
          対戦モード (Beta)
        </Link>
      </div>
    </main>
  );
}
