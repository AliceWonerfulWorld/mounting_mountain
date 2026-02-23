# ランキング機能 要件定義書

## 📋 目的

プレイヤー間の競争を促進し、継続的なプレイ意欲を高めるためのランキング機能を実装する。

---

## 🎯 基本方針

### コアコンセプト
- **公正性**: 不正なスコアを排除し、公平な競争環境を提供
- **多様性**: 複数のランキング軸を提供し、様々なプレイスタイルを評価
- **達成感**: 自分の成長と順位変動を可視化
- **パフォーマンス**: 大量データでも高速表示

---

## 📊 ランキングの種類

### 1. ソロモード総合ランキング（必須・優先度：高）

#### 表示項目
| 順位 | ユーザー名 | 最高スコア | プレイ回数 | 完走率 |
|---|---|---|---|---|
| 1 | Alice | 25,840m | 120回 | 95% |
| 2 | Bob | 24,100m | 85回 | 88% |
| ... | ... | ... | ... | ... |

#### 集計基準
- **ランキング基準**: `best_score`（全プレイ中の最高標高）
- **対象**: `solo_game_history` テーブルの `completed = true` のデータ
- **表示件数**: 上位100名（ページネーション対応）
- **更新頻度**: リアルタイム（データベースクエリ）

#### 既存DBリソース
✅ 既存の `leaderboard` ビューを活用可能
```sql
SELECT * FROM leaderboard LIMIT 100;
```

---

### 2. 週間ランキング（オプション・優先度：中）

#### 目的
- 新規プレイヤーにもチャンスを提供
- 定期的な順位リセットで競争を活性化

#### 集計基準
- **期間**: 毎週月曜日 00:00 にリセット
- **ランキング基準**: 週内の最高スコア
- **対象**: `created_at` が当週のデータ

#### 必要なクエリ例
```sql
SELECT 
  p.id,
  p.username,
  p.display_name,
  MAX(sgh.total_score) as best_score_this_week
FROM profiles p
JOIN solo_game_history sgh ON p.id = sgh.user_id
WHERE sgh.created_at >= date_trunc('week', CURRENT_TIMESTAMP)
  AND sgh.completed = true
GROUP BY p.id, p.username, p.display_name
ORDER BY best_score_this_week DESC
LIMIT 100;
```

---

### 3. 月間ランキング（オプション・優先度：低）

#### 目的
- 中期的な目標設定
- 月間MVP的な称号付与

#### 集計基準
- **期間**: 毎月1日 00:00 にリセット
- **ランキング基準**: 月内の最高スコア
- **対象**: `created_at` が当月のデータ

---

### 4. プレイ回数ランキング（オプション・優先度：低）

#### 目的
- プレイ継続を評価
- 「やりこみ勢」を表彰

#### 集計基準
- **ランキング基準**: `total_games`（総プレイ回数）
- **注意**: 未完走ゲームもカウントするか検討が必要

---

### 5. 対戦モードランキング（将来拡張）

#### 実装タイミング
- 対戦モードのルート・天候システム実装後
- `versus_game_history` テーブルにデータが蓄積されてから

#### 集計基準案
- 勝率ランキング
- 連勝記録ランキング
- 対戦回数ランキング

---

## 🎨 UI/UX設計

### ページ構成

#### ルーティング
- **パス**: `/ranking` または `/leaderboard`
- **認証**: 不要（ゲストでも閲覧可能）

#### レイアウト案
```
┌─────────────────────────────────────┐
│  🏆 ランキング                       │
├─────────────────────────────────────┤
│  [総合] [週間] [月間] [プレイ回数]  │ ← タブ切り替え
├─────────────────────────────────────┤
│  🏅 1位  Alice      25,840m  120回  │
│  🥈 2位  Bob        24,100m   85回  │
│  🥉 3位  Charlie    23,500m  150回  │
│     4位  Dave       22,800m   62回  │
│     5位  Eve        22,100m   98回  │
│     ...                             │
│  [もっと見る]                       │
├─────────────────────────────────────┤
│  あなたの順位: 42位 (18,500m)       │ ← ログインユーザーのみ
└─────────────────────────────────────┘
```

### デザイン要素

#### 順位表示
- **1位**: 金色のトロフィー 🏆 + グラデーション背景
- **2位**: 銀色のメダル 🥈
- **3位**: 銅色のメダル 🥉
- **4位以降**: 通常表示

#### 自分の順位
- ハイライト表示（青枠・背景色変更）
- ページ下部に固定表示（常に見える）
- 「あなた」ラベルを付与

#### アニメーション
- 順位変動アニメーション（↑↓矢印）
- カウントアップアニメーション（数値）
- ホバー時のエフェクト

---

## 🗄️ データベース設計

### 既存リソースの活用

#### ✅ 利用可能な既存ビュー
```sql
CREATE OR REPLACE VIEW leaderboard AS
SELECT 
  p.id,
  p.username,
  p.display_name,
  p.avatar_url,
  MAX(sgh.total_score) as best_score,
  COUNT(sgh.id) as total_games,
  SUM(CASE WHEN sgh.completed THEN 1 ELSE 0 END) as completed_games
FROM profiles p
LEFT JOIN solo_game_history sgh ON p.id = sgh.user_id
GROUP BY p.id, p.username, p.display_name, p.avatar_url
ORDER BY best_score DESC NULLS LAST;
```

#### ✅ 既存インデックス
- `idx_solo_game_history_total_score` （スコア降順）
- `idx_solo_game_history_created_at` （日時降順）

### 追加検討事項

#### オプション: Materialized View（パフォーマンス最適化）
```sql
-- 総合ランキング用（1時間ごと更新）
CREATE MATERIALIZED VIEW leaderboard_cached AS
SELECT * FROM leaderboard;

CREATE INDEX idx_leaderboard_cached_best_score 
  ON leaderboard_cached(best_score DESC);

-- 更新用関数
CREATE OR REPLACE FUNCTION refresh_leaderboard_cache()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY leaderboard_cached;
END;
$$ LANGUAGE plpgsql;
```

#### オプション: ランク履歴テーブル（順位変動追跡）
```sql
CREATE TABLE ranking_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  rank INTEGER NOT NULL,
  score INTEGER NOT NULL,
  period_type TEXT NOT NULL, -- 'all_time', 'weekly', 'monthly'
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_ranking_history_user_period 
  ON ranking_history(user_id, period_type, recorded_at DESC);
```

---

## 🔒 セキュリティ・不正対策

### 1. データ検証
- **異常値検出**: 8848m（エベレスト）を超えるスコアを排除
- **プレイ時間**: 極端に短時間のクリアを無効化（1ラウンド最低10秒など）
- **入力パターン**: 同一文章の繰り返しをペナルティ対象に

### 2. Rate Limiting
- **API制限**: 同一ユーザーからの連続リクエストを制限
- **プレイ間隔**: 極端に連続したプレイを監視

### 3. Row Level Security (RLS)
```sql
-- 既存のRLSポリシーは適切（自分のデータのみ書き込み可能）
-- ランキングは全員が閲覧可能（問題なし）
```

### 4. 通報機能（将来拡張）
- ユーザーによる不正報告
- 運営による手動レビュー

---

## ⚡ パフォーマンス最適化

### 1. キャッシング戦略

#### クライアントサイド
- **SWR / React Query**: 5分間のキャッシュ
- **Incremental Static Regeneration (ISR)**: 1時間ごと再生成

#### サーバーサイド
- **Materialized View**: 大量データ時に検討
- **Redis**: トップ100位のみキャッシュ（5分TTL）

### 2. ページネーション
- **初期表示**: 上位50名
- **無限スクロール** または **ページャー**
- **自分の順位へジャンプ**: 任意の順位を直接表示

### 3. データ取得の最適化
```typescript
// 必要な項目のみ取得
const { data } = await supabase
  .from('leaderboard')
  .select('username, display_name, best_score, total_games')
  .order('best_score', { ascending: false })
  .limit(50);
```

---

## 📱 レスポンシブ対応

### デスクトップ
- 全項目表示（順位、名前、スコア、プレイ回数、完走率）
- ホバー時に詳細情報表示

### タブレット
- 主要項目のみ（順位、名前、スコア）
- タップで詳細モーダル

### スマホ
- コンパクト表示（順位、名前、スコア）
- アバター画像を小さく

---

## 🚀 実装ステップ（推奨順序）

### Phase 1: MVP（最小機能）✅ 実装対象

#### データベース
- [ ] `profiles` テーブルに `show_in_ranking` カラム追加
- [ ] `leaderboard` ビューを更新（`show_in_ranking = true` 条件追加）

#### API / データ取得
- [ ] `/api/ranking` エンドポイント作成（オプション：直接Supabaseクエリでも可）
- [ ] ランキングデータ取得関数（top 100 + 自分の順位）
- [ ] デフォルトネーム生成ユーティリティ関数

#### UI コンポーネント
- [ ] `/app/ranking/page.tsx` ページ作成
- [ ] `RankingList` コンポーネント（順位リスト表示）
- [ ] `RankingCard` コンポーネント（各ユーザーのカード）
- [ ] `MyRankCard` コンポーネント（自分の順位を固定表示）
- [ ] メダル・トロフィーアイコン（1-3位）

#### プロフィール設定
- [ ] プロフィール編集ページに「ランキングに表示」チェックボックス追加
- [ ] 設定変更のAPI処理

#### その他
- [ ] レスポンシブ対応
- [ ] ローディング・エラー状態
- [ ] 空データの場合の表示

**工数見積**: 2-3日

**実装優先度**:
1. データベース変更（マイグレーション）
2. デフォルトネーム関数
3. ランキングページUI
4. プロフィール設定追加

### Phase 2: 機能拡張
- [ ] タブ切り替え（総合/週間/月間）
- [ ] 週間・月間ランキングのクエリ実装
- [ ] ページネーション（無限スクロール）
- [ ] 順位変動表示（前回比）

**工数見積**: 3-4日

### Phase 3: 最適化
- [ ] Materialized View導入（必要に応じて）
- [ ] SWRによるキャッシング
- [ ] アニメーション追加
- [ ] パフォーマンス測定・改善

**工数見積**: 2-3日

### Phase 4: 将来拡張
- [ ] 対戦モードランキング
- [ ] フレンドランキング
- [ ] 期間別の詳細統計
- [ ] ランキング履歴グラフ

---

## ✅ 決定事項

### A. プライバシー設定
**決定**: プロフィール設定で非表示可能（デフォルトは表示ON）

**実装内容**:
- `profiles` テーブルに `show_in_ranking BOOLEAN DEFAULT TRUE` カラムを追加
- プロフィール設定ページに「ランキングに表示する」チェックボックス追加
- ランキングクエリで `show_in_ranking = true` の条件を追加

```sql
-- マイグレーション
ALTER TABLE profiles ADD COLUMN show_in_ranking BOOLEAN DEFAULT TRUE;
```

---

### B. ユーザー名の扱い
**決定**: デフォルトネーム「ただの登山家」系を使用

**デフォルトネームのルール**:
- `display_name` が NULL または空の場合、以下の名前をランダム表示
- 山岳用語を使った親しみやすい名前

**候補リスト**:
- ただの登山家
- 迷える登山家
- 駆け出し登山家
- ひっそり登山家
- 名もなき登山家
- 匿名の登山家
- 静かなる登山家
- 孤高の登山家

**実装方法**:
```typescript
function getDisplayName(profile: Profile): string {
  if (profile.display_name) return profile.display_name;
  if (profile.username) return profile.username;
  
  const defaultNames = [
    'ただの登山家',
    '迷える登山家',
    '駆け出し登山家',
    'ひっそり登山家',
    '名もなき登山家',
    '匿名の登山家',
    '静かなる登山家',
    '孤高の登山家',
  ];
  
  // user_idのハッシュから一貫した名前を選択
  const hash = profile.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return defaultNames[hash % defaultNames.length];
}
```

---

### C. 週間・月間ランキングの実装タイミング
**決定**: Phase 2で実装（MVP は総合ランキングのみ）

**MVP範囲**:
- 総合ランキング（歴代最高スコア）のみ
- タブUIは未実装（将来拡張を考慮した構造にしておく）

---

### D. スコア不正対策の厳密さ
**決定**: 段階的に強化（MVP は最小限）

**MVP での対策**:
- 8848m（エベレスト）超えのスコアを排除
- `completed = true` のみをランキング対象に

**将来の強化**:
- Phase 2: プレイ時間検証追加
- Phase 3: 機械学習でパターン検出（必要に応じて）

---

## 📐 技術スタック

### フロントエンド
- **Next.js App Router**: `/app/ranking/page.tsx`
- **React Query / SWR**: データフェッチング・キャッシング
- **Framer Motion**: アニメーション
- **Tailwind CSS**: スタイリング

### バックエンド
- **Supabase**: データベース・認証
- **PostgreSQL Views**: 集計処理
- **Edge Functions**: 複雑な計算（必要に応じて）

### 監視
- **Sentry**: エラー監視
- **Vercel An（実装開始）

### Step 1: データベースマイグレーション
```sql
-- profiles テーブルに show_in_ranking カラム追加
ALTER TABLE profiles ADD COLUMN show_in_ranking BOOLEAN DEFAULT TRUE;

-- leaderboard ビューを更新
CREATE OR REPLACE VIEW leaderboard AS
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
WHERE p.show_in_ranking = true
GROUP BY p.id, p.username, p.display_name, p.avatar_url, p.show_in_ranking
HAVING MAX(sgh.total_score) IS NOT NULL
ORDER BY best_score DESC;
```

### Step 2: ユーティリティ関数作成
`src/lib/displayName.ts`
- デフォルトネーム生成関数

### Step 3: ランキングページ実装
`src/app/ranking/page.tsx`
- データ取得
- UI表示

### Step 4: プロフィール設定更新
`src/app/profile/page.tsx`
- ランキング表示設定追加

### 実装準備完了 ✅
要件定義が確定したので、実装を開始できます。
### 定性指標
- ユーザーからの好意的なフィードバック
- 競争の活性化（プレイ回数の増加）

---

## 🎉 期待される効果

1. **競争意欲の向上**: 順位を上げたいという動機
2. **コミュニティ形成**: トッププレイヤーへの憧れ
3. **リテンション向上**: 定期的なランキング確認で再訪
4. **バイラリティ**: ランキング1位のシェア機能（将来実装）

---

## 📝 次のアクション

### 今すぐ決めるべきこと
1. **A. プライバシー設定** の方針
2. **B. ユーザー名の扱い** の方針
3. **C. 実装タイミング** の決定（MVP or Phase 2）

### この要件定義が承認されたら
1. Phase 1（MVP）の詳細設計
2. UIモックアップ作成
3. 実装開始

---

## 🔗 関連ドキュメント

- [Supabase認証実装計画書](./supabase-auth-implementation.md)
- [プロダクト全体ドキュメント](./product-overview.md)
- [データベーススキーマ](./supabase-auth-implementation.md#データベース設計)
