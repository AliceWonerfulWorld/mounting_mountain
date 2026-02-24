# 時間帯別背景実装計画

## 概要
タイトル画面の背景を実際の時刻に基づいて動的に変化させ、没入感を高める。

## ⚠️ 重要な実装方針

### 1. 段階的実装と確認
- **各Phaseごとに実装を止めて、必ず確認を求める**
- ユーザーの承認を得てから次のPhaseに進む
- 問題があればすぐに戻せるよう、各Phase完了時点でコミット推奨

### 2. 既存デザインの保護
- **現在の昼の背景（11:00-15:00）は完全に保持**
- リファクタリング時は既存のクラス名・構造をできるだけ維持
- 移行は段階的に行い、一度に全てを変更しない
- 各変更後に必ずビジュアル確認を行う

### 3. パフォーマンス最適化（デザイン品質は妥協しない）
- **軽量化は必須、ただし見た目の美しさは維持**
- CSS/SVGで実装できるものは極力そちらを使用
- アニメーションはGPUアクセラレーションを活用
- 不要な再レンダリングを防ぐ
- モバイルでも60FPSを目指す

## 時間帯の定義

### 1. 夜明け前 (Dawn) 🌅
- **時間**: 5:00 - 6:30
- **背景グラデーション**: 
  - `from-indigo-900 via-purple-700 to-orange-400`
  - 暗い青紫から明るいオレンジへ
- **空の要素**:
  - 朝日（左下から昇る）
  - 薄い雲（紫〜オレンジのグラデーション）
  - 星が少し残る（フェードアウト）
- **文字色**: 白（warm tone）

### 2. 朝 (Morning) 🌤️
- **時間**: 6:30 - 11:00
- **背景グラデーション**:
  - `from-sky-300 via-blue-200 to-yellow-100`
  - 爽やかな朝の空
- **空の要素**:
  - 太陽（左側、まだ低い位置）
  - 白い雲（薄く爽やか）
  - 朝露のようなキラキラ感
- **文字色**: グレー/ネイビー

### 3. 昼 (Day) ☀️ - **現在の実装**
- **時間**: 11:00 - 15:00
- **背景グラデーション**:
  - `from-sky-400 via-blue-300 to-green-200`
  - 現在の実装そのまま
- **空の要素**:
  - 太陽（右上、高い位置）
  - 白い雲（明るく、はっきり）
- **文字色**: 白/グレー

### 4. 午後 (Afternoon) 🌇
- **時間**: 15:00 - 17:30
- **背景グラデーション**:
  - `from-orange-300 via-amber-200 to-yellow-100`
  - 柔らかい午後の光
- **空の要素**:
  - 太陽（右側、やや低い位置）
  - オレンジがかった雲
  - 暖かみのある雰囲気
- **文字色**: ダークブラウン/グレー

### 5. 夕暮れ (Sunset) 🌆
- **時間**: 17:30 - 19:00
- **背景グラデーション**:
  - `from-pink-500 via-orange-400 to-purple-600`
  - マジックアワーの美しい空
- **空の要素**:
  - 夕日（右下、沈みかけ）
  - ピンク〜紫の雲
  - シルエットが映える
- **文字色**: 白（warm tone）

### 6. 夜 (Night) 🌙
- **時間**: 19:00 - 5:00
- **背景グラデーション**:
  - `from-slate-900 via-indigo-950 to-black`
  - 深い夜の空
- **空の要素**:
  - 月（位置は時刻に応じて）
  - 星（キラキラアニメーション）
  - 薄暗い雲（青白い色）
- **文字色**: 白（cool tone）

## 技術実装

### 1. 時間帯判定フック (`useTimeOfDay`)
```typescript
// src/hooks/useTimeOfDay.ts
export type TimeOfDay = 'dawn' | 'morning' | 'day' | 'afternoon' | 'sunset' | 'night';

interface TimeOfDayConfig {
  timeOfDay: TimeOfDay;
  progress: number; // 0-1: その時間帯内での進行度
}

export function useTimeOfDay(): TimeOfDayConfig {
  const [config, setConfig] = useState<TimeOfDayConfig>(...);
  
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      // 時間帯判定ロジック
    };
    
    updateTime();
    const interval = setInterval(updateTime, 60000); // 1分ごと
    return () => clearInterval(interval);
  }, []);
  
  return config;
}
```

### 2. 背景コンポーネント分離
```typescript
// src/components/TimedBackground.tsx
- SkyBackground: グラデーション背景
- CelestialBody: 太陽/月（位置は時刻に応じてアニメーション）
- CloudLayer: 雲（色と透明度を時間帯に応じて変更）
- Stars: 星（夜のみ表示）
```

### 3. スムーズな遷移
- 時間帯が切り替わる時に、Framer Motionで5分かけてゆっくり遷移
- `animate` プロパティで背景色とグラデーションを変更

### 4. パフォーマンス最適化
- 太陽/月の位置計算は1分ごとに更新（秒単位は不要）
- 雲のアニメーションは`will-change`で最適化
- 背景はCSSグラデーションで軽量化

## ファイル構成

```
src/
├── hooks/
│   └── useTimeOfDay.ts          # 時間帯判定ロジック（既存）
├── components/
│   ├── TimedBackground.tsx      # 新規: 時間帯別背景のメインコンポーネント
│   ├── SkyBackground.tsx        # 新規: グラデーション背景
│   ├── CelestialBody.tsx        # 新規: 太陽/月コンポーネント
│   ├── CloudLayer.tsx           # 新規: 雲レイヤー
│   └── Stars.tsx                # 新規: 星空コンポーネント
└── lib/
    └── timeOfDay.ts             # 新規: 時間帯設定の定数とユーティリティ
```

## 実装ステップ

### Phase 1: 基盤構築 (1-2時間)
**目標**: 時間帯判定ロジックの拡張（見た目の変更なし）

- [ ] 既存の`useTimeOfDay`を6つの時間帯に拡張
- [ ] 時間帯設定の定数ファイル作成 (`src/lib/timeOfDayConfig.ts`)
- [ ] progress（時間帯内での進行度0-1）の計算ロジック追加
- [ ] 既存コードは一切変更せず、新規ファイルのみ作成
- [ ] 時間帯判定をuseMemoでメモ化（パフォーマンス最適化）

**成果物**:
- `src/lib/timeOfDayConfig.ts` (新規)
- `src/hooks/useTimeOfDay.ts` (拡張版、元のAPIも維持)

**確認ポイント** ✋:
- 時間帯判定が正しく動作するか
- 既存の表示に影響がないか
- コンソールエラーがないか
- **不要な再計算が発生していないか（React DevTools Profiler確認）**

---

### Phase 2: 背景コンポーネント作成 (2-3時間)
**目標**: 新しいコンポーネントを作成（まだ使用しない）

- [ ] `TimedBackground.tsx` コンポーネント作成
- [ ] 現在の昼の背景を完全に再現した状態で作成
- [ ] 太陽・雲のコードをコピーして新コンポーネント内に配置
- [ ] まだ `page.tsx` には統合しない（独立して動作確認）
- [ ] **React.memoでラップ（不要な再レンダリング防止）**
- [ ] **will-change, transform: translateZ(0) をCSSに追加（GPU合成）**
- [ ] **雲の数を画面サイズに応じて調整する仕組み追加**

**成果物**:
- `src/components/background/TimedBackground.tsx` (新規)
- Storybookまたはテストページで動作確認

**確認ポイント** ✋:
- 新コンポーネントが現在の見た目を完全に再現できているか
- アニメーションが正常に動作するか
- パフォーマンスに問題がないか（DevTools Performance確認）
- GPU合成が有効になっているか（Layers確認）

---

### Phase 3: page.tsx への慎重な統合 (1-2時間)
**目標**: 既存コードを新コンポーネントに置き換え（見た目は同じ）

- [ ] `page.tsx` の背景部分のみを `TimedBackground` に置き換え
- [ ] 他の要素（ヘッダー、タイトル、ボタン等）は一切変更しない
- [ ] まだ時間帯による変化は実装しない（昼固定）
- [ ] 置き換え前後でスクリーンショットを撮って比較

**成果物**:
- `src/app/page.tsx` (リファクタリング版)

**確認ポイント** ✋:
- 見た目が全く変わっていないか（ピクセル単位で確認）
- アニメーションの動きが同じか
- ヘッダーやボタンの位置・スタイルに影響がないか
- レスポンシブ対応が壊れていないか
- **Lighthouseスコアが維持されているか（ベースライン確立）**
- **FPSが60を維持しているか**

---

### Phase 4: 時間帯別デザイン実装 (3-4時間)
**目標**: 各時間帯のビジュアル実装

- [ ] `TimedBackground` に時間帯判定を追加
- [ ] 夜（night）のデザイン実装・確認 ✋
  - **星の数を制限（50-100個程度）、範囲も限定**
- [ ] 朝（morning）のデザイン実装・確認 ✋
  - **朝日の光をCSS shadowで軽量化**
- [ ] 夕暮れ（sunset）のデザイン実装・確認 ✋
- [ ] 夜明け前（dawn）のデザイン実装・確認 ✋
- [ ] 午後（afternoon）のデザイン実装・確認 ✋
- [ ] 文字色の自動調整実装
- [ ] **各時間帯でパフォーマンス測定（FPS、メモリ使用量）**

**注意**: 各時間帯を実装するたびに確認を求める

**成果物**:
- 6つの時間帯すべてのビジュアル

**確認ポイント** ✋ (各時間帯ごと):
- デザインが意図通りか
- 切り替わりタイミングが適切か
- 文字の視認性が保たれているか
- **その時間帯でもパフォーマンスが維持されているか**

---

### Phase 5: アニメーション・遷移 (1-2時間)
**目標**: スムーズな時間帯遷移

- [ ] 時間帯切り替え時のトランジション実装
- [ ] 太陽/月の移動アニメーション
- [ ] 星のキラキラエフェクト（夜のみ）
- [ ] `prefers-reduced-motion` 対応
- [ ] **トランジション中のパフォーマンス測定（60FPS維持確認）**
- [ ] **GPU合成の確認（Chrome DevTools Layers）**

**成果物**:
- 時間帯間のスムーズな遷移

**確認ポイント** ✋:
- 遷移が自然か
- パフォーマンスに問題がないか（遷移中も60FPS維持）
- モーション設定を無効にした場合も正常に動作するか

---

### Phase 6: 最終調整とテスト (1-2時間)
**目標**: 全体の仕上げ

- [ ] 全時間帯での動作確認
- [ ] モバイル表示の確認
- [ ] **パフォーマンス測定と最適化**
  - Lighthouse スコア測定（デスクトップ・モバイル）
  - Core Web Vitals 測定
  - メモリリーク確認（長時間表示テスト）
  - 各時間帯でのFPS測定
- [ ] エッジケースのテスト（時刻境界など）
- [ ] **必要に応じてさらなる最適化（デザインは維持）**

**成果物**:
- 完成版

**確認ポイント** ✋:
- すべてのデバイスで正常に表示されるか
- パフォーマンスが許容範囲か
  - **Lighthouse Performance: デスクトップ95+、モバイル90+**
  - **60 FPS維持（全時間帯、全デバイス）**
  - **LCP < 1.5秒**
  - **メモリ使用量が適切か**
- バグがないか

## 追加の検討事項

### オプション機能
- [ ] 天候のバリエーション（雨、雪など）
- [ ] 季節による変化（春は桜、夏は入道雲など）
- [ ] ユーザー設定で時間帯を固定できる機能
- [ ] デバッグモード（時間帯を手動で切り替え）

### パフォーマンス
- 太陽の光の拡散効果は重くなりがちなのでCSS shadowで実装
- 雲の数は画面サイズに応じて調整
- モバイルでは一部エフェクトを簡略化

### アクセシビリティ
- `prefers-reduced-motion`に対応
- アニメーションを無効化するオプション

## パフォーマンス最適化戦略

### 基本方針
**「美しさを保ちながら、軽く速く」**
- デザイン品質は一切妥協しない
- 技術的な工夫で軽量化を実現
- ユーザーが重さを感じない体験を提供

### 具体的な最適化手法

#### 1. レンダリング最適化
```typescript
// ✅ React.memoでコンポーネントの不要な再レンダリングを防ぐ
export const TimedBackground = React.memo(({ timeOfDay }) => {
  // ...
});

// ✅ useMemoで重い計算をキャッシュ
const sunPosition = useMemo(() => 
  calculateSunPosition(hour, minutes), 
  [hour, minutes]
);
```

#### 2. CSS最適化
```css
/* ✅ GPUアクセラレーションを有効化 */
.animated-element {
  will-change: transform;
  transform: translateZ(0); /* GPU層に配置 */
}

/* ✅ グラデーションはCSSで（JavaScriptより高速） */
background: linear-gradient(...);

/* ✅ box-shadowよりfilter: drop-shadowの方が軽い場合がある */
filter: drop-shadow(0 10px 20px rgba(0,0,0,0.2));
```

#### 3. アニメーション最適化
```typescript
// ✅ transform と opacity のみをアニメーション（リフローなし）
// ❌ width, height, top, left（リフローが発生）
<motion.div
  animate={{ 
    x: [0, 100],      // ✅ transform: translateX
    opacity: [0, 1]   // ✅ opacity
  }}
/>

// ✅ アニメーションの数を制限
// - 雲は同時に最大4つまで
// - 星は範囲を限定（200個→50個など）
```

#### 4. SVG最適化
```typescript
// ✅ 複雑なSVGは事前に最適化
// - 不要なパスを削除
// - 小数点以下を丸める
// - viewBoxを最適化

// ✅ SVGスプライト化でDOM要素を削減
<symbol id="cloud">
  {/* 雲のSVG定義 */}
</symbol>
<use href="#cloud" x="0" y="0" />
```

#### 5. 条件付きレンダリング
```typescript
// ✅ 見えない要素はレンダリングしない
{timeOfDay === 'night' && <Stars />}
{timeOfDay !== 'night' && <Sun />}

// ✅ 画面外の雲は削除（IntersectionObserver）
```

#### 6. デバウンス・スロットル
```typescript
// ✅ resize, scroll イベントはスロットル
const handleResize = useThrottle(() => {
  // リサイズ処理
}, 100);
```

#### 7. 画像最適化
```typescript
// ✅ 山の画像をWebP形式で提供
<Image 
  src="/mountain.webp" 
  loading="eager"  // タイトル画面なので即読み込み
  priority 
/>

// ✅ モバイル用に小さいサイズを用意
<source 
  media="(max-width: 768px)" 
  srcSet="/mountain-mobile.webp" 
/>
```

#### 8. 時間帯の更新頻度を調整
```typescript
// ✅ 1分ごとの更新で十分（秒単位は不要）
const interval = 60000; // 1分

// ✅ 時間帯境界の前後5分だけ頻繁にチェック
const isNearBoundary = /* ... */;
const interval = isNearBoundary ? 10000 : 60000;
```

#### 9. レイヤー分離
```css
/* ✅ 背景、雲、太陽を別レイヤーに分離 */
.background-layer { z-index: 1; }
.cloud-layer { z-index: 2; }
.sun-layer { z-index: 3; }

/* GPU合成を促進 */
.layer {
  transform: translateZ(0);
  backface-visibility: hidden;
}
```

#### 10. 開発者ツールでの測定
```typescript
// ✅ Phase 2, 4, 6 で以下を測定
// - Chrome DevTools Performance タブ
// - Lighthouse スコア（Performance 90+を目指す）
// - React DevTools Profiler
// - Core Web Vitals (LCP, FID, CLS)
```

### 各Phaseでの最適化タスク

**Phase 1**: 
- 時間帯判定ロジックをメモ化

**Phase 2**: 
- コンポーネントをReact.memoでラップ
- will-change, transform: translateZ(0) を追加

**Phase 3**: 
- 統合後のパフォーマンス測定（ベースライン確立）
- Lighthouse スコアを記録

**Phase 4**: 
- 各時間帯実装時にパフォーマンス確認
- 雲の数をデバイスに応じて調整
- アニメーションの最適化

**Phase 5**: 
- トランジションのパフォーマンス測定
- GPU合成の確認

**Phase 6**: 
- 最終的なパフォーマンス測定
- モバイルでの動作確認
- 必要に応じてさらなる最適化

### パフォーマンス目標
- **デスクトップ**: 60 FPS維持、Lighthouse Performance 95+
- **モバイル**: 60 FPS維持、Lighthouse Performance 90+
- **LCP**: 1.5秒以内
- **FID**: 50ms以内
- **CLS**: 0.05以内

### デザインを守りながら軽量化する例

❌ **悪い例：デザインを犠牲にする**
```typescript
// 雲を1つだけにする → つまらない
// アニメーションをなくす → 動きがない
// グラデーションを単色にする → 美しくない
```

✅ **良い例：技術で解決**
```typescript
// 雲は複数あるが、GPU合成で軽量化
// アニメーションはあるが、transformのみ使用
// グラデーションはCSSで実装して高速化
// 画面外の要素は非表示にして負荷削減
```

## 安全な実装のためのチェックリスト

### 各Phase開始前
- [ ] 現在のコードをGitでコミット（またはバックアップ）
- [ ] 実装する内容を再確認
- [ ] 影響範囲を明確にする

### 実装中
- [ ] 既存のクラス名やIDを変更しない
- [ ] 既存のpropsやAPIを維持する
- [ ] 新しいコードは既存コードの上に追加（置き換えない）
- [ ] 頻繁に保存して、ブラウザで確認

### Phase完了時
- [ ] ビジュアル確認（スクリーンショット比較）
- [ ] コンソールエラーのチェック
- [ ] レスポンシブ確認（デスクトップ・タブレット・モバイル）
- [ ] 既存機能（ボタン、リンク、モーダル等）の動作確認
- [ ] **パフォーマンス確認（FPS、メモリ、Lighthouseスコア）**
- [ ] **ユーザーに確認を求める** ✋

### ロールバック手順
問題が発生した場合：
1. `Ctrl+Z` または Git revertで元に戻す
2. 問題の原因を特定
3. より小さい単位で再実装

## デバッグ用の実装

Phase 1で以下のデバッグ機能も実装する：

```typescript
// 開発環境でのみ、時間帯を強制的に変更できるようにする
const DEBUG_TIME_OF_DAY = process.env.NODE_ENV === 'development' 
  ? (window as any).__DEBUG_TIME_OF_DAY 
  : undefined;
```

これにより、ブラウザのコンソールで以下のように時間帯をテストできる：
```javascript
window.__DEBUG_TIME_OF_DAY = 'night'; // 夜に切り替え
window.__DEBUG_TIME_OF_DAY = 'sunset'; // 夕暮れに切り替え
window.__DEBUG_TIME_OF_DAY = undefined; // 実際の時刻に戻す
```

## 見積もり工数
- **Phase 1**: 1-2時間 + 確認時間
- **Phase 2**: 2-3時間 + 確認時間（パフォーマンス測定含む）
- **Phase 3**: 1-2時間 + 確認時間（重要・Lighthouseベースライン確立）
- **Phase 4**: 3-4時間 + 確認時間（各時間帯ごと・パフォーマンス測定含む）
- **Phase 5**: 1-2時間 + 確認時間（遷移パフォーマンス測定含む）
- **Phase 6**: 1-2時間 + 最終確認（総合的なパフォーマンス測定）

**合計**: 9-15時間（純粋な実装時間） + 確認・調整時間 + パフォーマンス測定時間

### 段階別の推奨実装スケジュール
- **Day 1**: Phase 1-2（基盤とコンポーネント作成）
- **Day 2**: Phase 3（慎重な統合）
- **Day 3**: Phase 4（時間帯デザイン実装）
- **Day 4**: Phase 5-6（アニメーションと最終調整）

**重要**: 各Phaseの間に十分な確認時間を取ること

## 優先度
1. **High**: Phase 1-3（基本的な時間帯切り替え） + パフォーマンスベースライン確立
2. **Medium**: Phase 4（アニメーション） + 各時間帯のパフォーマンス最適化
3. **Low**: Phase 5の一部、オプション機能

**注**: パフォーマンス最適化は全Phaseで常に意識する

## 次のアクション

### 今すぐ実行
1. この計画書の内容を確認・承認
2. 変更をGitにコミット（安全のため）

### Phase 1 開始前の確認事項
- [ ] 既存の`useTimeOfDay`フックの動作確認
- [ ] 現在の`page.tsx`のスクリーンショット保存（比較用）
- [ ] 開発環境が正常に動作しているか確認

### 実装開始の合図
**「Phase 1を開始してください」と指示があれば開始**

各Phaseごとに：
1. 実装を行う
2. 動作確認を行う
3. **必ずユーザーに確認を求める** ✋
4. OKが出たら次のPhaseへ進む

**注意**: ユーザーの承認なしに次のPhaseには進まない！
