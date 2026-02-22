'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { History, Home, Trophy, Calendar, CloudRain, Target, ArrowUp } from 'lucide-react';

type GameHistory = {
  id: string;
  created_at: string;
  total_score: number;
  weather_id: string;
  mission_id: string | null;
  rounds_data: {
    prompt: string;
    routeId: string;
    inputText: string;
    finalAltitude: number;
    didFall: boolean;
  }[];
  completed: boolean;
};

export default function HistoryPage() {
  const { user, loading: authLoading } = useAuth();
  const [history, setHistory] = useState<GameHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const supabase = createClient();

  const fetchHistory = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('solo_game_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      setHistory(data || []);
    } catch (err) {
      console.error('Error fetching history:', err);
      setError('履歴の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push('/auth/login');
      return;
    }

    fetchHistory();
  }, [user, authLoading, router, fetchHistory]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-black flex items-center justify-center">
        <div className="text-white text-xl">読み込み中...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRouteLabel = (routeId: string) => {
    const routes: Record<string, string> = {
      SAFE: '安全ルート',
      NORMAL: '通常ルート',
      RISKY: '危険ルート',
    };
    return routes[routeId] || routeId;
  };

  const getWeatherLabel = (weatherId: string) => {
    const weathers: Record<string, string> = {
      SUNNY: '晴天',
      BLIZZARD: '吹雪',
      WIND: '強風',
    };
    return weathers[weatherId] || weatherId;
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-zinc-900 to-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-black text-blue-100 flex items-center gap-3">
            <History className="h-10 w-10" />
            プレイ履歴
          </h1>
          <Link
            href="/"
            className="flex items-center gap-2 rounded-lg border border-blue-400/50 bg-blue-900/30 px-4 py-2 text-sm font-semibold text-blue-100 backdrop-blur-sm transition-all hover:bg-blue-800/50"
          >
            <Home className="h-4 w-4" />
            ホーム
          </Link>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 border-2 border-red-500 text-red-100 px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        {/* History List */}
        {history.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-blue-300/60">まだプレイ履歴がありません</p>
            <Link
              href="/solo"
              className="inline-block mt-6 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold py-3 px-8 rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 shadow-lg"
            >
              ソロモードをプレイ
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((game) => (
              <div
                key={game.id}
                className="bg-gradient-to-br from-slate-800/80 to-zinc-900/80 backdrop-blur-sm border border-blue-400/30 rounded-2xl p-6 shadow-xl"
              >
                {/* Game Summary */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        game.completed ? 'bg-green-500' : 'bg-yellow-500'
                      }`}
                    />
                    <div>
                      <div className="flex items-center gap-2 text-blue-300/70 text-sm">
                        <Calendar className="h-4 w-4" />
                        {formatDate(game.created_at)}
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        {game.completed ? '完走' : '未完走'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 text-2xl font-black text-blue-100">
                      <Trophy className="h-6 w-6 text-yellow-500" />
                      {game.total_score.toLocaleString()}m
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      総獲得高度
                    </div>
                  </div>
                </div>

                {/* Game Info */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="flex items-center gap-2 text-sm bg-slate-900/50 rounded-lg px-3 py-2">
                    <CloudRain className="h-4 w-4 text-cyan-400" />
                    <span className="text-slate-300">
                      {getWeatherLabel(game.weather_id)}
                    </span>
                  </div>
                  {game.mission_id && (
                    <div className="flex items-center gap-2 text-sm bg-slate-900/50 rounded-lg px-3 py-2">
                      <Target className="h-4 w-4 text-orange-400" />
                      <span className="text-slate-300">ミッション有</span>
                    </div>
                  )}
                </div>

                {/* Rounds */}
                <div className="space-y-2">
                  {game.rounds_data.map((round, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-900/30 rounded-lg p-3 border border-slate-700/50"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-blue-400">
                            Round {idx + 1}
                          </span>
                          <span className="text-xs bg-blue-900/50 text-blue-200 px-2 py-0.5 rounded">
                            {getRouteLabel(round.routeId)}
                          </span>
                          {round.didFall && (
                            <span className="text-xs bg-red-900/50 text-red-200 px-2 py-0.5 rounded">
                              転落
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-sm font-bold text-green-400">
                          <ArrowUp className="h-4 w-4" />
                          {round.finalAltitude.toLocaleString()}m
                        </div>
                      </div>
                      <div className="text-xs text-slate-400 truncate">
                        「{round.inputText}」
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats Summary */}
        {history.length > 0 && (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-900/50 to-cyan-900/50 backdrop-blur-sm border border-blue-400/30 rounded-xl p-4 text-center">
              <div className="text-3xl font-black text-blue-100">
                {history.length}
              </div>
              <div className="text-sm text-blue-300/70 mt-1">総プレイ回数</div>
            </div>
            <div className="bg-gradient-to-br from-green-900/50 to-emerald-900/50 backdrop-blur-sm border border-green-400/30 rounded-xl p-4 text-center">
              <div className="text-3xl font-black text-green-100">
                {Math.max(...history.map((g) => g.total_score)).toLocaleString()}m
              </div>
              <div className="text-sm text-green-300/70 mt-1">最高記録</div>
            </div>
            <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 backdrop-blur-sm border border-purple-400/30 rounded-xl p-4 text-center">
              <div className="text-3xl font-black text-purple-100">
                {history.filter((g) => g.completed).length}
              </div>
              <div className="text-sm text-purple-300/70 mt-1">完走回数</div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
