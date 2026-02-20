# テスト実装計画

## 📋 概要

マウンティングマウンテンプロジェクトに対して、Vitestを使用したユニットテストと統合テストを導入します。特に、リファクタリング前にコアロジックを保護し、将来的な変更で既存機能が壊れないことを保証します。

## 🎯 目的

1. **リファクタリングの安全性確保**: 大規模ファイル（`solo/page.tsx`: 2446行）の分割時に既存機能が壊れないことを保証
2. **回帰バグの防止**: スコア計算、ミッション判定などの重要ロジックをテストで保護
3. **コード品質の向上**: テストを書くことで、関数の責務が明確になり、コードの可読性が向上
4. **CI/CDの強化**: GitHub Actionsでテストを自動実行し、PRマージ前に品質を保証

## 📦 技術スタック

- **テストランナー**: Vitest
- **UIコンポーネントテスト**: @testing-library/react
- **テストカバレッジ**: @vitest/coverage-v8
- **モック**: Vitest標準機能

## 🗂 実装する内容

### Phase 1: 環境構築（優先度: 高）

#### 1.1 Vitestのインストール

```bash
npm install -D vitest @vitejs/plugin-react @vitest/coverage-v8
npm install -D @testing-library/react @testing-library/jest-dom @testing-library/user-event
npm install -D jsdom
```

#### 1.2 設定ファイルの作成

- `vitest.config.ts`: Vitest設定
- `src/test/setup.ts`: テストセットアップ

#### 1.3 package.jsonへのスクリプト追加

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:run": "vitest run"
  }
}
```

### Phase 2: コアロジックのユニットテスト（優先度: 高）

重要なビジネスロジックを優先的にテスト。

#### 2.1 スコア計算ロジック

**対象**: `src/lib/solo/score.ts`

- ✅ `computeFinalAltitude`: 最終標高計算
  - ルート倍率の適用
  - 天候ボーナスの適用
  - 滑落判定
  - 保険の使用
  - SAFE/NORMALの上限（7900m）

**テストケース例**:
```typescript
describe('computeFinalAltitude', () => {
  it('NORMALルートで基本計算が正しいこと', () => {
    const result = computeFinalAltitude({
      baseAltitude: 5000,
      routeId: 'NORMAL',
      routeMultiplier: 1.0,
      bonusAltitude: 0,
    });
    expect(result.finalAltitude).toBe(5000);
    expect(result.didFall).toBe(false);
  });

  it('RISKYルートで滑落判定が動作すること', () => {
    const result = computeFinalAltitude({
      baseAltitude: 5000,
      routeId: 'RISKY',
      routeMultiplier: 1.5,
      bonusAltitude: 0,
      rng: () => 0.4, // 50%未満なので滑落
    });
    expect(result.finalAltitude).toBe(0);
    expect(result.didFall).toBe(true);
  });

  it('保険があれば滑落を無効化すること', () => {
    const result = computeFinalAltitude({
      baseAltitude: 5000,
      routeId: 'RISKY',
      routeMultiplier: 1.5,
      bonusAltitude: 0,
      insurance: 1,
      rng: () => 0.4, // 滑落判定だが保険で無効化
    });
    expect(result.finalAltitude).toBeGreaterThan(0);
    expect(result.didFall).toBe(false);
    expect(result.insuranceUsed).toBe(true);
  });

  // ... 他のテストケース
});
```

#### 2.2 ボーナス計算

**対象**: `src/lib/solo/bonus.ts`

- ✅ `computeBonus`: ラベル複合ボーナス

**テストケース例**:
```typescript
describe('computeBonus', () => {
  it('ラベルなしの場合はボーナス0', () => {
    const result = computeBonus([]);
    expect(result.bonusAltitude).toBe(0);
  });

  it('2つのラベルで+500m', () => {
    const result = computeBonus(['NUMERIC', 'COMPARISON']);
    expect(result.bonusAltitude).toBe(500);
  });

  it('3つ以上のラベルで+1000m', () => {
    const result = computeBonus(['NUMERIC', 'COMPARISON', 'EFFORT']);
    expect(result.bonusAltitude).toBe(1000);
  });
});
```

#### 2.3 ミッション判定

**対象**: `src/lib/solo/missions.ts`

- ✅ `evaluateMission`: ミッション達成判定

**テストケース例**:
```typescript
describe('evaluateMission', () => {
  it('ALTITUDE_6000ミッションの達成判定', () => {
    const mission = { id: 'ALTITUDE_6000', /* ... */ };
    const rounds = [
      { result: { finalAltitude: 2000 } },
      { result: { finalAltitude: 2500 } },
      { result: { finalAltitude: 2000 } },
    ];
    const result = evaluateMission(mission, rounds);
    expect(result.achieved).toBe(true); // 合計6500m
  });

  // ... 他のミッションのテスト
});
```

#### 2.4 AIバリデーター

**対象**: `src/lib/analyze/validator.ts`

- ✅ `validateAiOutput`: AI出力のサニタイズ

**テストケース例**:
```typescript
describe('validateAiOutput', () => {
  it('不正なmountScoreを0-1にクランプすること', () => {
    const result = validateAiOutput({ mountScore: 1.5 });
    expect(result.mountScore).toBe(1.0);
  });

  it('不正なラベルをフィルタすること', () => {
    const result = validateAiOutput({
      mountScore: 0.5,
      labels: ['NUMERIC', 'INVALID_LABEL', 'COMPARISON']
    });
    expect(result.labels).toEqual(['NUMERIC', 'COMPARISON']);
  });

  // ... 他のバリデーションルールのテスト
});
```

### Phase 3: プロンプト生成ロジックのテスト（優先度: 中）

**対象**: `src/lib/analyze/gemini.ts`

- ✅ `buildSoloPrompt`: ソロモード用プロンプト
- ✅ `buildVersusPrompt`: 対戦モード用プロンプト

**テストケース例**:
```typescript
describe('buildSoloPrompt', () => {
  it('正しいプロンプト構造を生成すること', () => {
    const prompt = buildSoloPrompt('テスト入力');
    expect(prompt).toContain('あなたは「マウンティング度」を客観的に評価');
    expect(prompt).toContain('テスト入力');
    expect(prompt).not.toContain('git'); // バグ修正の確認
  });
});
```

### Phase 4: 統合テスト（優先度: 中）

**対象**: `src/app/api/analyze/route.ts`

- リクエスト → バリデーション → レスポンスのフロー

```typescript
describe('POST /api/analyze', () => {
  it('正常なリクエストで200を返すこと', async () => {
    const response = await POST(new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ text: 'テスト', route: 'NORMAL' })
    }));
    expect(response.status).toBe(200);
  });

  it('空文字列で400を返すこと', async () => {
    const response = await POST(new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ text: '' })
    }));
    expect(response.status).toBe(400);
  });
});
```

### Phase 5: CI統合（優先度: 高）

**対象**: `.github/workflows/ci.yml`

コメントアウトされているテストジョブを有効化：

```yaml
test:
  name: Unit & Integration Tests
  runs-on: ubuntu-latest
  
  steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Run tests
      run: npm run test:run

    - name: Upload coverage
      uses: codecov/codecov-action@v3
      if: always()
```

## 📁 ファイル構成

```
src/
├── test/
│   ├── setup.ts                          # テストセットアップ
│   └── helpers.ts                        # テストヘルパー関数
├── lib/
│   ├── solo/
│   │   ├── score.test.ts                 # スコア計算テスト
│   │   ├── bonus.test.ts                 # ボーナス計算テスト
│   │   ├── missions.test.ts              # ミッション判定テスト
│   │   ├── weather.test.ts               # 天候システムテスト
│   │   └── routes.test.ts                # ルートシステムテスト
│   └── analyze/
│       ├── validator.test.ts             # バリデーターテスト
│       ├── gemini.test.ts                # プロンプト生成テスト
│       └── fallback.test.ts              # フォールバックテスト
└── app/
    └── api/
        └── analyze/
            └── route.test.ts             # APIエンドポイントテスト

vitest.config.ts                          # Vitest設定
```

## 🔧 実装手順

### Step 1: ブランチ作成

```bash
git checkout main
git pull origin main
git checkout -b feature/add-vitest-setup
```

### Step 2: Vitestインストール

```bash
npm install -D vitest @vitejs/plugin-react @vitest/coverage-v8
npm install -D @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

### Step 3: 設定ファイル作成

**`vitest.config.ts`**:
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData/',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

**`src/test/setup.ts`**:
```typescript
import '@testing-library/jest-dom';
```

### Step 4: package.json更新

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:run": "vitest run"
  }
}
```

### Step 5: テストファイル作成

Phase 2のテストから順番に実装。

### Step 6: CIへの統合

`.github/workflows/ci.yml`のテストジョブを有効化。

### Step 7: 動作確認

```bash
# テスト実行
npm test

# カバレッジ確認
npm run test:coverage

# CI相当のチェック
npm run ci && npm run test:run
```

### Step 8: PR作成

- テンプレートに従ってPR作成
- CodeRabbitのレビューを待つ
- CIがパスすることを確認

## ✅ 受け入れ基準

- [ ] Vitestが正常にインストールされている
- [ ] 設定ファイル（`vitest.config.ts`、`src/test/setup.ts`）が作成されている
- [ ] `npm test` でテストが実行できる
- [ ] Phase 2の重要ロジックのテストがすべて実装されている
  - [ ] `score.test.ts`
  - [ ] `bonus.test.ts`
  - [ ] `missions.test.ts`
  - [ ] `validator.test.ts`
- [ ] すべてのテストがパスする
- [ ] テストカバレッジが主要ロジックで80%以上
- [ ] CI（`.github/workflows/ci.yml`）でテストが自動実行される
- [ ] CIがグリーン（すべてのチェックがパス）
- [ ] `README.md`にテスト実行方法が記載されている

## 📊 期待される成果

1. **リファクタリングの準備完了**: コアロジックがテストで保護され、安心してリファクタリングできる
2. **CI/CDの強化**: PRマージ前に自動テストで品質を保証
3. **ドキュメント効果**: テストコードが仕様書としての役割を果たす
4. **バグの早期発見**: コード変更時に既存機能の破壊を即座に検知

## 🔗 参考リンク

- [Vitest公式ドキュメント](https://vitest.dev/)
- [Testing Library公式ドキュメント](https://testing-library.com/docs/react-testing-library/intro/)
- [Next.js Testing Guide](https://nextjs.org/docs/app/building-your-application/testing/vitest)

## 📝 備考

- テスト実装中に関数の設計が気になった場合は、テストを書きながらリファクタリングしてOK
- Phase 3以降は時間があれば実装、なくてもPhase 2が完了していれば十分な価値がある
- テストカバレッジは無理に100%を目指さず、重要なロジックを確実に保護することを優先
