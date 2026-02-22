# 🏔 マウンティングマウンテン

[![CI](https://github.com/AliceWonerfulWorld/mounting-mountain/workflows/CI/badge.svg)](https://github.com/AliceWonerfulWorld/mounting-mountain/actions)
[![CodeRabbit](https://img.shields.io/badge/CodeRabbit-Enabled-brightgreen)](https://coderabbit.ai)

「マウント」を“標高”で可視化するAIゲーム。

入力された文章のマウンティング度をAIが判定し、
エベレスト（8848m）を目指す対戦型コミュニケーションゲームです。

---

## 🎮 アプリ概要

日常会話の中に潜む「マウンティング発言」を、
AIがスコアリングし、標高（m）として表示します。

- マウントが強いほど標高が上がる
- 角を取った言い換えも生成
- ラベルでマウントの種類を分類

例：
- 数値マウント
- 比較マウント
- 努力マウント
- 皮肉マウント

---

## 🧠 コンセプト

> 「なんとなく感じるマウント」を、数値で説明できるようにする。

技術で感情を可視化することで、
コミュニケーションの面白さと危うさを同時に体験できる設計です。

---

## 🕹 現在の機能（MVP）

### ✅ ソロモード
- 3ラウンド制
- お題に対して文章を入力
- AIがマウンティング度を判定
- 標高表示（0〜8848m）
- 合計標高を算出
- 履歴表示

### ✅ ユーザー認証
- Supabaseを使用したメール認証
- プロフィール管理（ユーザー名・表示名）
- ゲーム履歴の永続化
- クラウドベースのデータ保存
- マルチデバイス対応

### ✅ フォールバック判定
APIキーが無い環境でも動作する安全設計。

---

## 🏔 今後の拡張予定

- ローカル対戦モード
- 山の可視化UI（標高に応じて成長）
- マウント山脈モード（会話ログ解析）
- オンライン対戦
- ランキング機能

---

## 🛠 技術スタック

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Supabase (認証・データベース)
- Google Gemini API（オプション）
- Fallbackルールベース判定
- Vitest + Testing Library（テスト）

---

## 🧪 テスト

### テストコマンド

```bash
# テストを実行（1回のみ）
npm run test:run

# テストをウォッチモードで実行
npm test

# カバレッジレポート生成
npm run test:coverage

# テストUIを開く
npm run test:ui
```

### カバレッジ

現在のテストカバレッジ:
- **総合**: 88.8%
- **lib/solo**: 95.77% (score.ts, bonus.ts, missions.ts)
- **lib/analyze**: 80.85% (validator.ts, altitude.ts)

詳細: [テスト実装計画](./docs/test-implementation-plan.md)

---

## 🔧 CI/CD

- **GitHub Actions** - Lint/TypeCheck/Build
- **CodeRabbit** - AIコードレビュー（日本語対応）
- **Dependabot** - 依存関係自動更新
- **Vercel** - 自動デプロイ

詳細: [CI/CDセットアップガイド](./docs/ci-cd-setup.md)

---

## 🚀 セットアップ

### 開発環境構築

```bash
# 依存関係インストール
npm install

# 開発サーバー起動
npm run dev

# CI相当のチェックをローカルで実行
npm run ci
```

### 環境変数

`.env.local` を作成：

```bash
# オプション（なくてもフォールバック判定で動作）
GEMINI_API_KEY=your_api_key_here
```
