-- ランキング機能用データベースマイグレーション
-- 実行日: 2026-02-23
-- 目的: ランキング表示設定とリーダーボードビューの更新

-- ======================================
-- Step 1: profiles テーブルにカラム追加
-- ======================================

-- show_in_ranking カラムを追加（デフォルト: true）
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS show_in_ranking BOOLEAN DEFAULT TRUE;

-- カラムにコメントを追加
COMMENT ON COLUMN profiles.show_in_ranking IS 'ランキングに表示するかどうか（true: 表示, false: 非表示）';

-- ======================================
-- Step 2: leaderboard ビューを更新
-- ======================================

-- 既存のビューを削除して再作成
DROP VIEW IF EXISTS leaderboard;

CREATE VIEW leaderboard AS
SELECT 
  p.id,
  p.username,
  p.display_name,
  p.avatar_url,
  p.show_in_ranking,
  MAX(sgh.total_score) as best_score,
  COUNT(sgh.id) as total_games,
  SUM(CASE WHEN sgh.completed THEN 1 ELSE 0 END) as completed_games
FROM profiles p
LEFT JOIN solo_game_history sgh ON p.id = sgh.user_id
WHERE p.show_in_ranking = true  -- ランキング表示ONのユーザーのみ
GROUP BY p.id, p.username, p.display_name, p.avatar_url, p.show_in_ranking
HAVING MAX(sgh.total_score) IS NOT NULL  -- プレイ履歴があるユーザーのみ
ORDER BY best_score DESC;

-- ビューにコメントを追加
COMMENT ON VIEW leaderboard IS 'ソロモード総合ランキング（最高スコア順）';

-- ======================================
-- Step 3: インデックス確認（既存のインデックスを活用）
-- ======================================

-- 以下のインデックスは既に存在することを確認
-- - idx_solo_game_history_total_score (total_score DESC)
-- - idx_solo_game_history_user_id (user_id)

-- 新しいカラム用のインデックスは不要（フィルタリング条件として使用するのみ）

-- ======================================
-- Step 4: RLSポリシーの確認
-- ======================================

-- profiles テーブルの既存RLSポリシーを確認
-- - "Users can view own profile" - 自分のプロフィール閲覧可能
-- - "Users can update own profile" - 自分のプロフィール更新可能

-- leaderboard ビューは全ユーザーが閲覧可能（認証不要）
-- 特別なRLSポリシーは不要

-- ======================================
-- Step 5: マイグレーション完了確認
-- ======================================

-- カラムが正しく追加されたか確認
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'profiles' AND column_name = 'show_in_ranking';

-- ビューが正しく作成されたか確認
SELECT * FROM leaderboard LIMIT 10;

-- ======================================
-- ロールバック用SQL（問題があった場合）
-- ======================================

-- -- ビューを削除
-- DROP VIEW IF EXISTS leaderboard;
-- 
-- -- カラムを削除
-- ALTER TABLE profiles DROP COLUMN IF EXISTS show_in_ranking;
-- 
-- -- 元のビューを再作成
-- CREATE VIEW leaderboard AS
-- SELECT 
--   p.id,
--   p.username,
--   p.display_name,
--   p.avatar_url,
--   MAX(sgh.total_score) as best_score,
--   COUNT(sgh.id) as total_games,
--   SUM(CASE WHEN sgh.completed THEN 1 ELSE 0 END) as completed_games
-- FROM profiles p
-- LEFT JOIN solo_game_history sgh ON p.id = sgh.user_id
-- GROUP BY p.id, p.username, p.display_name, p.avatar_url
-- ORDER BY best_score DESC NULLS LAST;
