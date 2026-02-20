# solo/page.tsx リファクタリング計画

## 📋 概要

現在 `src/app/solo/page.tsx` は **2623行** の巨大ファイルとなっており、保守性・可読性・テスタビリティに課題があります。このドキュメントでは、適切な粒度でコンポーネントとカスタムフックに分割し、保守しやすいコードベースを構築する計画を記載します。

---

## 🎯 背景・目的

### 現状の課題
- ✅ **テストで保護済み**: issue #74でコアロジックのテストを完了（88.8%カバレッジ）
- ❌ **巨大なファイル**: 2623行の単一コンポーネント
- ❌ **責務の混在**: 状態管理、ビジネスロジック、UI表示が1ファイルに集約
- ❌ **テスト困難**: UIコンポーネントのテストが書きにくい構造
- ❌ **再利用不可**: ロジックやUIの再利用ができない

### リファクタリング後の目標
- ✅ **適切な粒度**: 各ファイル100-300行程度に分割
- ✅ **単一責任**: 1コンポーネント1責務を実現
- ✅ **テスト容易**: コンポーネント単位でテスト可能
- ✅ **再利用可能**: ロジックとUIを独立させて再利用性を向上
- ✅ **型安全性**: 既存の型定義を活用し、型安全性を維持

---

## 🗂 リファクタリング対象

### 対象ファイル
- `src/app/solo/page.tsx` (2623行) → **分割対象**

### 保持するファイル（変更なし）
- `src/lib/solo/score.ts` - スコア計算ロジック（テスト済み）
- `src/lib/solo/bonus.ts` - ボーナス計算（テスト済み）
- `src/lib/solo/missions.ts` - ミッション評価（テスト済み）
- `src/lib/analyze/validator.ts` - AI出力検証（テスト済み）

---

## 📦 分割計画

### Phase 1: カスタムフック分離（状態管理）
**優先度: 高**

#### `src/hooks/useSoloGame.ts` (新規作成)
ゲーム状態管理ロジックを集約

```typescript
export function useSoloGame() {
  // 状態
  const [game, setGame] = useState<GameState | null>(null);
  const [text, setText] = useState("");
  const [lastResult, setLastResult] = useState<Round | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 初期化
  const initializeGame = useCallback(() => { /* ... */ }, []);
  
  // ラウンド送信
  const submitRound = useCallback(async () => { /* ... */ }, [game, text]);
  
  // 次のラウンドへ
  const proceedToNextRound = useCallback(() => { /* ... */ }, []);
  
  // リセット
  const resetGame = useCallback(() => { /* ... */ }, []);
  
  // ルート選択
  const handleRouteSelect = useCallback((routeId: RouteId) => { /* ... */ }, []);

  return {
    game, text, setText, lastResult, loading, error,
    initializeGame, submitRound, proceedToNextRound, resetGame, handleRouteSelect
  };
}
```

**責務**: ゲームロジック・API通信・状態更新

**抽出する機能**:
- ゲーム初期化（お題選択、天候、ミッション）
- ラウンド送信とAPI通信
- スコア計算・ボーナス適用
- 保険システム
- ラウンド進行・ゲーム終了判定
- 実績更新

---

#### `src/hooks/useSoloCutins.ts` (新規作成)
カットイン演出の状態管理

```typescript
export function useSoloCutins() {
  const [showRoundCutin, setShowRoundCutin] = useState(false);
  const [showResultCutin, setShowResultCutin] = useState(false);
  const [showFallCutin, setShowFallCutin] = useState(false);
  const [showInsuranceCutin, setShowInsuranceCutin] = useState(false);
  const [cutinRoundNumber, setCutinRoundNumber] = useState(1);
  const [cutinTheme, setCutinTheme] = useState<0 | 1 | 2>(0);

  const triggerRoundCutin = useCallback((roundNumber: number) => { /* ... */ }, []);
  const triggerResultCutin = useCallback((result: MountResult) => { /* ... */ }, []);

  return {
    showRoundCutin, showResultCutin, showFallCutin, showInsuranceCutin,
    cutinRoundNumber, cutinTheme,
    triggerRoundCutin, triggerResultCutin
  };
}
```

**責務**: カットイン演出のタイミング制御

**抽出する機能**:
- ラウンド開始カットイン
- 結果表示カットイン
- 滑落カットイン
- 保険獲得カットイン
- テーマ選択（山岳/空/森林）

---

### Phase 2: UIコンポーネント分離
**優先度: 高**

#### `src/components/solo/MissionBriefingScreen.tsx` (新規作成)
ミッション説明画面（約500行）

```typescript
type Props = {
  mission: Mission | undefined;
  weather: WeatherId | undefined;
  missionTheme: 0 | 1 | 2;
  onStart: () => void;
};

export function MissionBriefingScreen({ mission, weather, missionTheme, onStart }: Props) {
  // 背景装飾のレンダリング（星空/朝焼け/雪山）
  // ミッション情報表示
  // 天候情報表示
  // スタートボタン
}
```

**責務**: ゲーム開始前のミッション説明UI

**含まれる要素**:
- 3種類の背景テーマ（夜の山と星空/朝焼けの山/雪山）
- ミッションタイトル・説明・達成条件
- 天候情報とエモーション
- スタートボタン

---

#### `src/components/solo/SoloGameMain.tsx` (新規作成)
メインゲーム画面（約400行）

```typescript
type Props = {
  game: GameState;
  currentRound: Round;
  text: string;
  loading: boolean;
  error: string | null;
  onTextChange: (text: string) => void;
  onRouteSelect: (routeId: RouteId) => void;
  onSubmit: () => void;
};

export function SoloGameMain({ 
  game, currentRound, text, loading, error, 
  onTextChange, onRouteSelect, onSubmit 
}: Props) {
  // お題表示
  // ルート選択UI
  // 入力エリア
  // 送信ボタン
  // ヘッダー情報（ラウンド数、合計標高、天候）
}
```

**責務**: ゲームプレイ中のメインUI

**含まれる要素**:
- ヘッダー（ラウンド番号、合計標高、天候、ミッション進捗）
- お題カード
- ルート選択ボタン（SAFE/NORMAL/RISKY）
- テキスト入力エリア（SoloInputArea使用）
- 送信ボタン
- エラー表示

---

#### `src/components/solo/SoloResultView.tsx` (新規作成)
結果表示画面（約300行）

```typescript
type Props = {
  round: Round;
  totalScore: number;
  isGameFinished: boolean;
  onNext: () => void;
  onReset: () => void;
};

export function SoloResultView({ 
  round, totalScore, isGameFinished, 
  onNext, onReset 
}: Props) {
  // 標高表示（メイン）
  // DetailedMountainビジュアル
  // ラベル表示
  // ボーナス理由
  // ルート情報
  // 天候ボーナス情報
  // 次へ/リセットボタン
}
```

**責務**: ラウンド結果・最終結果の表示

**含まれる要素**:
- 獲得標高の大きな表示
- 山のビジュアル（DetailedMountain）
- マウンティングラベル表示
- ボーナス理由の詳細
- ルート倍率・天候ボーナスの内訳
- AIコメント・攻略ヒント
- 次へ/最終結果/リセットボタン

---

#### `src/components/solo/SoloHistoryPanel.tsx` (新規作成)
履歴パネル（約200行）

```typescript
type Props = {
  rounds: Round[];
  isOpen: boolean;
  onToggle: () => void;
};

export function SoloHistoryPanel({ rounds, isOpen, onToggle }: Props) {
  // 過去のラウンド表示
  // 折りたたみUI
  // 各ラウンドの標高・ラベル・入力内容
}
```

**責務**: プレイ履歴の表示

**含まれる要素**:
- 開閉ボタン
- ラウンド履歴リスト（ラウンド番号、標高、ラベル、入力テキスト）
- 小さな山のビジュアル
- アニメーション効果

---

#### `src/components/solo/WeatherDetailModal.tsx` (新規作成)
天気詳細モーダル（約150行）

```typescript
type Props = {
  weatherId: WeatherId;
  isOpen: boolean;
  onClose: () => void;
};

export function WeatherDetailModal({ weatherId, isOpen, onClose }: Props) {
  // 天気情報表示
  // ボーナス条件表示
  // 閉じるボタン
}
```

**責務**: 天気詳細情報の表示

**含まれる要素**:
- 天候名・エモーション
- 効果説明
- ボーナス対象ラベル
- ボーナス倍率（+20%）
- 閉じるボタン

---

#### カットインコンポーネント群（新規作成）
**各80行程度**

##### `src/components/solo/FallCutin.tsx`
滑落演出カットイン

```typescript
type Props = {
  show: boolean;
};

export function FallCutin({ show }: Props) {
  // 滑落演出アニメーション
  // 警告表示
  // 自動で消える
}
```

---

##### `src/components/solo/InsuranceCutin.tsx`
保険獲得演出カットイン

```typescript
type Props = {
  show: boolean;
};

export function InsuranceCutin({ show }: Props) {
  // 保険獲得アニメーション
  // 励ましメッセージ
  // 自動で消える
}
```

---

##### `src/components/solo/ResultCutin.tsx`
結果演出カットイン

```typescript
type Props = {
  show: boolean;
  altitude: number;
};

export function ResultCutin({ show, altitude }: Props) {
  // 結果表示アニメーション
  // 標高の強調表示
  // 自動で消える
}
```

---

### Phase 3: 新しいpage.tsx（統合）
**優先度: 高**

#### `src/app/solo/page.tsx` (リファクタリング後)
**約150-200行に削減**

```typescript
"use client";

import { useState } from 'react';
import { useSoloGame } from '@/hooks/useSoloGame';
import { useSoloCutins } from '@/hooks/useSoloCutins';
import { MissionBriefingScreen } from '@/components/solo/MissionBriefingScreen';
import { SoloGameMain } from '@/components/solo/SoloGameMain';
import { SoloResultView } from '@/components/solo/SoloResultView';
import { SoloHistoryPanel } from '@/components/solo/SoloHistoryPanel';
import { WeatherDetailModal } from '@/components/solo/WeatherDetailModal';
import { RoundCutin } from '@/components/RoundCutin';
import { FallCutin } from '@/components/solo/FallCutin';
import { InsuranceCutin } from '@/components/solo/InsuranceCutin';
import { ResultCutin } from '@/components/solo/ResultCutin';

export default function SoloPage() {
  const gameHook = useSoloGame();
  const cutinHook = useSoloCutins();
  
  const [showMissionBriefing, setShowMissionBriefing] = useState(true);
  const [showingResult, setShowingResult] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [showWeatherDetail, setShowWeatherDetail] = useState(false);
  const [missionTheme] = useState(() => Math.floor(Math.random() * 3) as 0 | 1 | 2);

  const handleStart = () => {
    setShowMissionBriefing(false);
    cutinHook.triggerRoundCutin(1);
  };

  const handleSubmit = async () => {
    await gameHook.submitRound();
    setShowingResult(true);
  };

  const handleNext = () => {
    gameHook.proceedToNextRound();
    setShowingResult(false);
  };

  if (!gameHook.game) return <div>Loading...</div>;

  const currentRound = gameHook.game.players[0].rounds[gameHook.game.roundIndex];
  const isFinished = gameHook.game.status === 'finished';

  return (
    <main className="min-h-screen relative overflow-x-hidden">
      {/* ミッション説明画面 */}
      {showMissionBriefing && (
        <MissionBriefingScreen
          mission={gameHook.game.mission}
          weather={gameHook.game.weather}
          missionTheme={missionTheme}
          onStart={handleStart}
        />
      )}
      
      {/* メインゲーム画面 */}
      {!showMissionBriefing && !showingResult && (
        <>
          <SoloGameMain
            game={gameHook.game}
            currentRound={currentRound}
            text={gameHook.text}
            loading={gameHook.loading}
            error={gameHook.error}
            onTextChange={gameHook.setText}
            onRouteSelect={gameHook.handleRouteSelect}
            onSubmit={handleSubmit}
          />
          
          <SoloHistoryPanel
            rounds={gameHook.game.players[0].rounds}
            isOpen={isHistoryOpen}
            onToggle={() => setIsHistoryOpen(!isHistoryOpen)}
          />
        </>
      )}
      
      {/* 結果表示画面 */}
      {showingResult && gameHook.lastResult && (
        <SoloResultView
          round={gameHook.lastResult}
          totalScore={gameHook.game.players[0].totalScore}
          isGameFinished={isFinished}
          onNext={handleNext}
          onReset={gameHook.resetGame}
        />
      )}
      
      {/* カットイン演出 */}
      <RoundCutin
        show={cutinHook.showRoundCutin}
        roundNumber={cutinHook.cutinRoundNumber}
        theme={cutinHook.cutinTheme}
      />
      <FallCutin show={cutinHook.showFallCutin} />
      <InsuranceCutin show={cutinHook.showInsuranceCutin} />
      <ResultCutin
        show={cutinHook.showResultCutin}
        altitude={gameHook.lastResult?.result?.finalAltitude || 0}
      />
      
      {/* モーダル */}
      <WeatherDetailModal
        weatherId={gameHook.game.weather!}
        isOpen={showWeatherDetail}
        onClose={() => setShowWeatherDetail(false)}
      />
    </main>
  );
}
```

**責務**: ルーティング・画面遷移制御のみ

---

## 🚀 実装手順

### Step 1: 準備
- [ ] 新しいブランチ作成: `git checkout -b refactor/solo-page-split`
- [ ] ディレクトリ作成:
  ```bash
  mkdir -p src/hooks
  mkdir -p src/components/solo
  ```

### Step 2: カスタムフック分離
- [ ] `src/hooks/useSoloGame.ts` 作成
  - initializeGame, submitRound, proceedToNextRound, resetGame を移行
  - テスト実行: `npm run test:run`（既存テストが通ることを確認）
- [ ] `src/hooks/useSoloCutins.ts` 作成
  - カットイン関連の状態管理を移行

### Step 3: UIコンポーネント分離（優先順）
1. [ ] `MissionBriefingScreen.tsx` - 独立性が高い
2. [ ] `WeatherDetailModal.tsx` - 独立性が高い
3. [ ] `SoloHistoryPanel.tsx` - 比較的独立
4. [ ] カットインコンポーネント群（FallCutin, InsuranceCutin, ResultCutin）
5. [ ] `SoloResultView.tsx` - 結果表示
6. [ ] `SoloGameMain.tsx` - メインゲーム

### Step 4: page.tsx統合
- [ ] 新しい `src/app/solo/page.tsx` を作成
- [ ] 各コンポーネントをインポート・配置
- [ ] 画面遷移ロジックを実装

### Step 5: 動作確認
- [ ] 開発サーバー起動: `npm run dev`
- [ ] ソロモード全体の動作確認:
  - ミッション説明 → ゲームプレイ → 結果表示
  - ルート選択（SAFE/NORMAL/RISKY）
  - 滑落・保険の動作
  - 天候ボーナス
  - 履歴表示
  - 天候詳細モーダル
  - カットイン演出
- [ ] テスト実行: `npm run test:run`
- [ ] 型チェック: `npx tsc --noEmit`
- [ ] Lint: `npm run lint`

### Step 6: PR作成
- [ ] コミット: `git commit -m "refactor: split solo/page.tsx into components and hooks"`
- [ ] プッシュ: `git push origin refactor/solo-page-split`
- [ ] PR作成（テンプレート使用）

---

## ✅ 完了条件

- [ ] `src/app/solo/page.tsx` が200行以下になっている
- [ ] 各コンポーネントが100-300行の適切な粒度
- [ ] 全テストがパス（120テスト）
- [ ] 型エラーなし
- [ ] Lintエラーなし
- [ ] ソロモード全機能が正常動作
- [ ] 既存のUIと同じ見た目・動作

---

## 📊 分割前後の比較

### Before（現状）
```
src/app/solo/page.tsx                    2623行
```

### After（目標）
```
src/app/solo/page.tsx                     150-200行
src/hooks/useSoloGame.ts                  250-300行
src/hooks/useSoloCutins.ts                100-150行
src/components/solo/MissionBriefingScreen.tsx    500行
src/components/solo/SoloGameMain.tsx             400行
src/components/solo/SoloResultView.tsx           300行
src/components/solo/SoloHistoryPanel.tsx         200行
src/components/solo/WeatherDetailModal.tsx       150行
src/components/solo/FallCutin.tsx                 80行
src/components/solo/InsuranceCutin.tsx            80行
src/components/solo/ResultCutin.tsx               80行
---------------------------------------------------
合計                                     約2490行
```

**効果**:
- ページコンポーネントが93%削減（2623行 → 150-200行）
- 適切な粒度で分割（各ファイル80-500行）
- 再利用可能なコンポーネント・フックの獲得

---

## 📚 参考情報

### 関連ドキュメント
- [test-implementation-plan.md](./test-implementation-plan.md) - テスト戦略
- [solo-mode-implementation.md](./solo-mode-implementation.md) - ソロモード仕様

### 既存コンポーネント
- `src/components/SoloInputArea.tsx` - 入力エリアの既存実装
- `src/components/RoundCutin.tsx` - カットインの既存実装
- `src/components/DetailedMountain.tsx` - 山のビジュアル

### 型定義
- `src/types/game.ts` - GameState, Round, Player
- `src/types/mount.ts` - MountResult
- `src/lib/solo/routes.ts` - RouteId
- `src/lib/solo/weather.ts` - WeatherId
- `src/lib/solo/missions.ts` - Mission, MissionId

---

## 💡 設計原則

### コンポーネント設計
1. **単一責任の原則**: 1コンポーネント1責務
2. **Props設計**: 必要最小限のpropsを受け取る
3. **型安全**: すべてのpropsに型を定義
4. **Pure Component**: 副作用を最小限に抑える

### カスタムフック設計
1. **命名規則**: `use` プレフィックスを必ず付ける
2. **戻り値**: 明確な名前のオブジェクトで返す
3. **依存関係**: 依存配列を明示的に管理
4. **再利用性**: 複数コンポーネントで共有可能な設計

### ディレクトリ構造
```
src/
├── app/
│   └── solo/
│       └── page.tsx              # 統合・ルーティング
├── components/
│   └── solo/                     # ソロモード専用コンポーネント
│       ├── MissionBriefingScreen.tsx
│       ├── SoloGameMain.tsx
│       ├── SoloResultView.tsx
│       ├── SoloHistoryPanel.tsx
│       ├── WeatherDetailModal.tsx
│       ├── FallCutin.tsx
│       ├── InsuranceCutin.tsx
│       └── ResultCutin.tsx
└── hooks/
    ├── useSoloGame.ts            # ゲーム状態管理
    └── useSoloCutins.ts          # カットイン演出管理
```

---

## 🐛 注意点・落とし穴

### 1. 状態の共有
- カスタムフックで状態を集約し、コンポーネント間で共有
- Propsドリリングを避けるため、必要最小限のpropsのみ渡す

### 2. パフォーマンス
- `useCallback`, `useMemo` を適切に使用
- 重い計算は useMemo でメモ化
- イベントハンドラは useCallback でメモ化

### 3. アニメーション
- framer-motion の AnimatePresence を適切に配置
- カットイン演出のタイミングを正確に制御

### 4. エラーハンドリング
- API通信エラーを適切にキャッチ・表示
- Loading状態の管理

### 5. 型安全性
- すべてのコンポーネントpropsに型を定義
- 既存の型定義を最大限活用
- `any` の使用を避ける

---

## 📝 実装例

### useSoloGame.ts の実装例（抜粋）

```typescript
import { useState, useCallback } from 'react';
import type { GameState, Round } from '@/types/game';
import type { RouteId } from '@/lib/solo/routes';
import { pickN } from '@/lib/random';
import { PROMPTS } from '@/lib/prompts';
import { createRounds } from '@/lib/game';
import { pickWeather } from '@/lib/solo/weather';
import { pickMission } from '@/lib/solo/missions';
import { computeBonus } from '@/lib/solo/bonus';
import { getRoute } from '@/lib/solo/routes';
import { computeFinalAltitude } from '@/lib/solo/score';
import { updateStats } from '@/lib/achievementStore';

export function useSoloGame() {
  const ROUND_COUNT = 3;
  
  const [game, setGame] = useState<GameState | null>(null);
  const [text, setText] = useState("");
  const [lastResult, setLastResult] = useState<Round | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initializeGame = useCallback(() => {
    const selectedPrompts = pickN(PROMPTS, ROUND_COUNT).map((p) => p.text);
    const rounds = createRounds(selectedPrompts, ROUND_COUNT);
    const weather = pickWeather();
    const mission = pickMission();

    const newGame: GameState = {
      mode: "solo",
      status: "playing",
      roundIndex: 0,
      prompts: rounds.map((r) => r.prompt),
      weather: weather.id,
      mission,
      insurance: 0,
      players: [{
        id: "p1",
        name: "Player 1",
        totalScore: 0,
        rounds,
      }],
    };

    setGame(newGame);
    setText("");
    setLastResult(null);
    setError(null);
  }, []);

  const submitRound = useCallback(async () => {
    if (!game || !text.trim() || loading) return;

    const currentRound = game.players[0].rounds[game.roundIndex];
    
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: text.trim(),
          route: currentRound.routeId || "NORMAL"
        }),
      });

      if (!res.ok) {
        throw new Error(`API Error: ${res.status}`);
      }

      const result = await res.json();

      setGame((prev) => {
        if (!prev) return null;
        const next = structuredClone(prev);
        const player = next.players[0];
        const round = player.rounds[next.roundIndex];

        round.inputText = text.trim();

        const route = getRoute(round.routeId);
        const bonus = computeBonus(result.labels);
        
        const scoreResult = computeFinalAltitude({
          baseAltitude: result.altitude,
          routeId: round.routeId || "NORMAL",
          routeMultiplier: route.multiplier,
          bonusAltitude: bonus.bonusAltitude,
          weatherId: prev.weather,
          labels: result.labels,
          insurance: prev.insurance,
        });

        round.result = {
          ...result,
          ...scoreResult,
          bonusReasons: bonus.reasons,
        };

        if (scoreResult.insuranceUsed) {
          next.insurance = Math.max(0, prev.insurance - 1);
        }

        if (round.routeId === "SAFE") {
          next.insurance = Math.min(1, next.insurance + 1);
        }

        player.totalScore += scoreResult.finalAltitude;

        updateStats({
          highestAltitude: scoreResult.finalAltitude,
          snowCount: scoreResult.finalAltitude >= 6000 ? 1 : 0,
          everestCount: scoreResult.finalAltitude >= 8000 ? 1 : 0,
        });

        setLastResult(structuredClone(round));

        return next;
      });

      setText("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [game, text, loading]);

  const proceedToNextRound = useCallback(() => {
    setGame((prev) => {
      if (!prev) return null;
      const next = structuredClone(prev);

      if (next.roundIndex + 1 >= next.players[0].rounds.length) {
        next.status = "finished";
        updateStats({
          soloPlays: 1,
          highestTotalAltitude: next.players[0].totalScore,
        });
      } else {
        next.roundIndex += 1;
      }

      return next;
    });
  }, []);

  const resetGame = useCallback(() => {
    initializeGame();
  }, [initializeGame]);

  const handleRouteSelect = useCallback((routeId: RouteId) => {
    setGame((prev) => {
      if (!prev) return null;
      const next = structuredClone(prev);
      next.players[0].rounds[next.roundIndex].routeId = routeId;
      return next;
    });
  }, []);

  return {
    game,
    text,
    setText,
    lastResult,
    loading,
    error,
    initializeGame,
    submitRound,
    proceedToNextRound,
    resetGame,
    handleRouteSelect,
  };
}
```

---

## 🎯 まとめ

このリファクタリング計画に従うことで：

1. **保守性の向上**: 巨大ファイルが適切な粒度に分割される
2. **テスト容易性**: コンポーネント単位でテスト可能になる
3. **再利用性**: ロジックとUIが独立し、再利用可能になる
4. **可読性**: 各ファイルの責務が明確になり、理解しやすくなる
5. **型安全性**: 既存の型定義を活用し、型安全性を維持

段階的に進めることで、既存機能を壊さずにリファクタリングを完了できます。
