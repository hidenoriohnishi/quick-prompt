# QuickPrompt 開発タスクリスト

## 1. プロジェクト初期設定
- [x] `npm init` で `package.json` を作成
- [x] `dependencies` をインストール
- [x] `devDependencies` をインストール
- [x] `vite.config.ts` を作成・設定
- [x] `tsconfig.json` を作成・設定
- [x] `tailwind.config.js` と `postcss.config.js` を作成・設定
- [x] `package.json` の `scripts` を設定

## 2. ディレクトリ構造と基本ファイル作成
- [x] `spec.md` に基づくディレクトリ構造を作成 (`src/main`, `src/renderer`, `src/preload` など)
- [x] `index.html` を作成
- [x] Electronのメインプロセスエントリーポイント (`src/main/index.ts`) を作成
- [x] Reactのレンダラープロセスエントリーポイント (`src/renderer/main.tsx`) を作成
- [x] プリロードスクリプト (`src/preload/index.ts`) を作成

## 3. Electronメインプロセス実装
- [x] メインウィンドウの作成と管理
- [x] グローバルショートカットの登録 (`src/main/shortcuts.ts`)
- [x] 自動起動機能の実装 (`src/main/autoLaunch.ts`)
- [x] システムトレイ機能の実装 (`src/main/tray.ts`)
- [x] `electron-store` を使ったデータ永続化のセットアップ (`src/lib/storage.ts`)

## 4. レンダラープロセス実装 (UI & State)
- [x] `tailwind.css` のセットアップとグローバルスタイルの定義
- [ ] `spec.md` に基づくコンポーネントの雛形を作成
  - [x] `<WindowFrame>`
  - [x] `<TitleBar>`
  - [x] `<PromptSelector>`
  - [x] `<FormInput>`
  - [x] `<Result>`
  - [ ] etc...
- [x] `Zustand` によるストアのセットアップ
  - [x] `appStore.ts`
  - [x] `promptStore.ts`
  - [x] `settingsStore.ts`
- [x] `react-router-dom` (もしくは類似の機能) での画面遷移実装
- [x] UIと状態の接続

## 5. 機能実装
- [x] 動的フォームの生成ロジック
- [x] LLM API (OpenAI, Anthropic) との連携 (`Vercel AI SDK` を使用)
- [x] トークン数・料金計算
- [ ] プロンプト管理機能 (CRUD)
  - [ ] 設定画面レイアウト (`SettingsLayout`)
  - [ ] プロンプト一覧画面 (`PromptList`)
  - [ ] プロンプト詳細・編集画面 (`PromptDetail`)
- [ ] 設定画面の機能実装
  - [x] 一般設定 (`GeneralSettings`)
  - [ ] AI設定 (`AISettings`)
- [x] llm-request IPC イベントをリッスンし、OpenAI API にリクエストを送信する
- [x] レスポンスをストリーミングでレンダラープロセスに送り返す
- [x] `useLLM` フックをリファクタリングし、IPC を介してメインプロセスの LLM 機能を利用する
- [ ] 設定画面を作成して、API キーを保存できるようにする
- [ ] 保存された API キーを LLM リクエストで使用する
- [ ] プロンプト選択画面 (`PromptSelector`) を実装する

## 6. 仕上げ
- [x] アプリケーションアイコンの作成と設定
- [x] ビルドとパッケージング設定
- [ ] 最終テストとデバッグ 