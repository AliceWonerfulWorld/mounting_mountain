"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Trophy, Medal, Crown, TrendingUp, User, ArrowLeft, Mountain } from "lucide-react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { getDisplayName } from "@/lib/displayName";
import type { Database } from "@/types/supabase";

type LeaderboardEntry = Database['public']['Views']['leaderboard']['Row'];

interface RankingData {
  entries: LeaderboardEntry[];
  myRank: number | null;
  myEntry: LeaderboardEntry | null;
}

export default function RankingPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<RankingData>({ entries: [], myRank: null, myEntry: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchRankingData = useCallback(async () => {
    const supabase = createClient();
    setLoading(true);
    setError("");

    try {
      // 上位100名のランキングを取得
      const { data: leaderboardData, error: leaderboardError } = await supabase
        .from('leaderboard')
        .select('*')
        .order('best_score', { ascending: false })
        .limit(100)
        .returns<LeaderboardEntry[]>();

      if (leaderboardError) throw leaderboardError;

      const entries = leaderboardData || [];
      let myRank: number | null = null;
      let myEntry: LeaderboardEntry | null = null;

      // ログインユーザーの順位を計算
      if (user) {
        const myIndex = entries.findIndex(entry => entry.id === user.id);
        if (myIndex !== -1) {
          myRank = myIndex + 1;
          myEntry = entries[myIndex];
        } else {
          // 上位100名に入っていない場合、全体での順位を取得
          const { data: allData, error: allError } = await supabase
            .from('leaderboard')
            .select('*')
            .order('best_score', { ascending: false })
            .returns<LeaderboardEntry[]>();

          if (!allError && allData) {
            const fullIndex = allData.findIndex(entry => entry.id === user.id);
            if (fullIndex !== -1) {
              myRank = fullIndex + 1;
              myEntry = allData[fullIndex];
            }
          }
        }
      }

      setData({ entries, myRank, myEntry });
    } catch (err) {
      console.error('Error fetching ranking:', err);
      setError('ランキングの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading) {
      fetchRankingData();
    }
  }, [authLoading, fetchRankingData]);

  // ランクアイコンを取得
  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-6 w-6 text-yellow-400" />;
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-300" />;
    if (rank === 3) return <Medal className="h-6 w-6 text-amber-600" />;
    return null;
  };

  // ランクごとの背景色
  const getRankBgClass = (rank: number) => {
    if (rank === 1) return "bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-400/50";
    if (rank === 2) return "bg-gradient-to-r from-gray-400/20 to-gray-500/20 border-gray-400/50";
    if (rank === 3) return "bg-gradient-to-r from-amber-600/20 to-amber-700/20 border-amber-600/50";
    return "bg-slate-800/80 border-blue-400/30";
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <Mountain className="h-16 w-16 text-blue-400 animate-pulse mx-auto mb-4" />
          <p className="text-xl text-blue-300">ランキングを読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-zinc-900/80 border-b border-blue-400/30">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-blue-300 hover:text-blue-100 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="font-semibold">ホームへ戻る</span>
          </Link>
          <div className="flex items-center gap-2">
            <Trophy className="h-8 w-8 text-yellow-400" />
            <h1 className="text-2xl md:text-3xl font-black">総合ランキング</h1>
          </div>
          <div className="w-24" /> {/* Spacer for center alignment */}
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* 自分の順位カード（ログインユーザーのみ） */}
        {user && data.myEntry && data.myRank && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-blue-600/30 to-cyan-600/30 border-2 border-blue-400/50 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <User className="h-6 w-6 text-blue-300" />
                  <span className="text-sm text-blue-200">あなたの順位</span>
                </div>
                <div className="text-3xl font-black text-white">
                  {data.myRank}位
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-blue-200">最高スコア</div>
                <div className="text-2xl font-bold text-white">
                  {data.myEntry.best_score.toLocaleString()}m
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* エラー表示 */}
        {error && (
          <div className="mb-8 p-4 rounded-lg bg-red-900/30 border border-red-500/50 text-red-200">
            {error}
          </div>
        )}

        {/* ランキングリスト */}
        {data.entries.length === 0 ? (
          <div className="text-center py-16">
            <Trophy className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <p className="text-xl text-gray-400 mb-2">まだランキングデータがありません</p>
            {!user ? (
              <>
                <p className="text-base text-gray-500 mb-6">
                  最初のランキング参加者になりませんか？
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link
                    href="/auth/signup"
                    className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold py-3 px-8 rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all duration-300 shadow-lg shadow-orange-500/30"
                  >
                    <Trophy className="h-5 w-5" />
                    無料登録してプレイ
                  </Link>
                  <Link
                    href="/solo"
                    className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold py-3 px-8 rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 shadow-lg"
                  >
                    ゲストでプレイ
                  </Link>
                </div>
              </>
            ) : (
              <Link
                href="/solo"
                className="inline-block mt-6 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold py-3 px-8 rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 shadow-lg"
              >
                ソロモードをプレイ
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {data.entries.map((entry, index) => {
              const rank = index + 1;
              const isCurrentUser = user && entry.id === user.id;
              const displayName = getDisplayName(entry);

              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className={`
                    p-4 rounded-xl border backdrop-blur-sm
                    transition-all duration-300 hover:scale-[1.02]
                    ${getRankBgClass(rank)}
                    ${isCurrentUser ? 'ring-2 ring-blue-400 shadow-lg shadow-blue-500/20' : ''}
                  `}
                >
                  <div className="flex items-center gap-4">
                    {/* 順位 */}
                    <div className="flex items-center justify-center w-12 h-12 flex-shrink-0">
                      {rank <= 3 ? (
                        getRankIcon(rank)
                      ) : (
                        <div className="text-xl font-bold text-gray-400">
                          {rank}
                        </div>
                      )}
                    </div>

                    {/* ユーザー名 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold truncate">
                          {displayName}
                        </h3>
                        {isCurrentUser && (
                          <span className="text-xs px-2 py-1 rounded-full bg-blue-500/30 text-blue-200 font-semibold">
                            あなた
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-400">
                        <span>プレイ {entry.total_games}回</span>
                        <span>完走 {entry.completed_games}回</span>
                        {entry.total_games > 0 && (
                          <span>
                            完走率 {Math.round((entry.completed_games / entry.total_games) * 100)}%
                          </span>
                        )}
                      </div>
                    </div>

                    {/* スコア */}
                    <div className="text-right flex-shrink-0">
                      <div className="flex items-center gap-1 justify-end mb-1">
                        <TrendingUp className="h-4 w-4 text-green-400" />
                        <span className="text-xs text-gray-400">最高</span>
                      </div>
                      <div className="text-2xl font-black text-white">
                        {entry.best_score.toLocaleString()}
                        <span className="text-sm text-gray-400 ml-1">m</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* フッター */}
        {data.entries.length > 0 && (
          <div className="mt-12 space-y-6">
            {/* 未登録ユーザー向けメッセージ */}
            {!user && (
              <div className="rounded-xl border border-yellow-400/30 bg-gradient-to-r from-yellow-600/10 to-orange-600/10 p-6 text-center backdrop-blur-sm">
                <div className="mb-2 flex items-center justify-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-400" />
                  <span className="text-lg font-bold text-yellow-200">
                    このランキングに参加するには
                  </span>
                </div>
                <p className="mb-4 text-sm text-gray-300">
                  無料のアカウント登録が必要です。今すぐ登録して、あなたのスコアをランキングに掲載しましょう！
                </p>
                <Link
                  href="/auth/signup"
                  className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-3 font-bold text-white shadow-lg shadow-orange-500/30 transition-all hover:from-amber-600 hover:to-orange-600 hover:shadow-orange-500/50"
                >
                  <Trophy className="h-4 w-4" />
                  無料登録してランキングに参加
                </Link>
              </div>
            )}

            {/* 一般情報 */}
            <div className="text-center text-gray-400 text-sm">
              <p>総合ランキングは完走したゲームの最高スコアで決まります</p>
              <p className="mt-2">ランキングは1分ごとに更新されます</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
