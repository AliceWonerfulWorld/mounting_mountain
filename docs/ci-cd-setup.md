# CI/CD セットアップガイド

## 📋 概要

このプロジェクトには以下のCI/CDが設定されています：

- ✅ **GitHub Actions CI** - Lint/TypeCheck/Build
- ✅ **CodeRabbit** - AIコードレビュー
- ✅ **Dependabot** - 依存関係自動更新
- ✅ **Vercel** - 自動デプロイ（既存）

---

## 🚀 セットアップ手順

### 1. CodeRabbitの有効化

1. [CodeRabbit](https://coderabbit.ai/)にアクセス
2. GitHubアカウントでサインイン
3. このリポジトリへのアクセスを許可
4. 設定は `.github/coderabbit.yaml` で管理されます

**特徴:**
- 日本語でレビュー
- PR作成時に自動でコードレビュー
- any型の使用や型安全性の問題を指摘
- React/Next.jsのベストプラクティスをチェック

### 2. Dependabotの有効化

GitHubリポジトリで自動的に有効化されます。設定は `.github/dependabot.yml` にあります。

**動作:**
- 毎週月曜日 9:00 (JST) に依存関係をチェック
- セキュリティアップデートは即座に
- 最大5個のPRを同時に作成

### 3. GitHub Actions CI

リポジトリにpushすると自動的に実行されます。

**実行内容:**
- ESLintチェック
- TypeScript型チェック
- Next.jsビルドチェック

### 4. CODEOWNERSの設定

`.github/CODEOWNERS` を編集して、あなたのGitHubユーザー名に変更してください：

```
# 変更前
* @gomaa

# 変更後
* @your-github-username
```

---

## 🔧 ローカルでのCI相当チェック

PRを作成する前に、ローカルで以下を実行できます：

```bash
# すべてのCIチェックを実行
npm run ci

# 個別実行
npm run lint        # ESLint
npm run type-check  # TypeScript型チェック
npm run build       # ビルドチェック
```

---

## 📝 PRテンプレート

PRを作成すると、自動的にテンプレートが表示されます。
以下の項目を埋めてください：

- 変更内容
- 目的
- チェックリスト
- 関連Issue

---

## 🎯 ワークフロー

### 開発フロー

```
1. ブランチ作成
   ↓
2. コード変更
   ↓
3. ローカルでチェック (npm run ci)
   ↓
4. コミット & プッシュ
   ↓
5. PR作成
   ↓
6. CI実行 (自動)
   ↓
7. CodeRabbitレビュー (自動)
   ↓
8. レビュー対応 (必要に応じて)
   ↓
9. マージ
   ↓
10. Vercelに自動デプロイ
```

### ブランチ戦略

- `main` - 本番環境（安定版）
- `develop` - 開発環境（統合ブランチ）
- `feature/*` - 機能追加
- `fix/*` - バグ修正
- `refactor/*` - リファクタリング

---

## ⚙️ CI設定のカスタマイズ

### CIの実行タイミングを変更

[`.github/workflows/ci.yml`](.github/workflows/ci.yml)を編集：

```yaml
on:
  pull_request:
    branches: [main, develop, feature/*]  # ブランチ追加
  push:
    branches: [main]  # mainへのpush時のみ
```

### CodeRabbitのレビュー設定

[`.github/coderabbit.yaml`](.github/coderabbit.yaml)を編集：

```yaml
reviews:
  profile: "assertive"  # より厳しいレビュー
  # "chill" - 緩い
  # "balanced" - バランス
  # "assertive" - 厳しい
```

### Dependabotの更新頻度

[`.github/dependabot.yml`](.github/dependabot.yml)を編集：

```yaml
schedule:
  interval: "daily"  # daily, weekly, monthly
```

---

## 🐛 トラブルシューティング

### CIが失敗する場合

1. **型エラー**
   ```bash
   npm run type-check
   ```
   エラー箇所を確認して修正

2. **Lintエラー**
   ```bash
   npm run lint
   ```
   自動修正可能な場合：
   ```bash
   npx eslint . --fix
   ```

3. **ビルドエラー**
   ```bash
   npm run build
   ```
   エラーメッセージを確認して修正

### CodeRabbitが動作しない場合

- リポジトリの設定でCodeRabbitアプリがインストールされているか確認
- `.github/coderabbit.yaml` の構文エラーをチェック

### Dependabotが動作しない場合

- リポジトリの設定で Dependabot alerts が有効か確認
- `.github/dependabot.yml` の構文エラーをチェック

---

## 📚 参考リンク

- [GitHub Actions Documentation](https://docs.github.com/actions)
- [CodeRabbit Documentation](https://docs.coderabbit.ai/)
- [Dependabot Documentation](https://docs.github.com/code-security/dependabot)
- [Next.js CI/CD Best Practices](https://nextjs.org/docs/deployment)
