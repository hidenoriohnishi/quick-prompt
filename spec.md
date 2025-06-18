# QuickPrompt - Mac常駐LLMアシスタント 仕様書

## 概要
QuickPromptは、Alfredのようにショートカットキーで瞬時に起動し、事前登録したプロンプトテンプレートを使ってLLMと対話できるMac常駐アプリケーションです。Electronベースで開発され、OpenAIとAnthropicのAPIに対応します。

## 主要機能
1. **クイック起動**: カスタマイズ可能なグローバルショートカット（デフォルト: Cmd+Shift+Space）で即座に起動
2. **プロンプトテンプレート**: よく使うプロンプトを登録し、必要な入力フォームを動的生成
3. **マルチプロバイダー対応**: OpenAI、Anthropicなど複数のLLMプロバイダーに対応
4. **料金計算**: 使用したトークン数から料金を自動計算・表示
5. **キーボード操作**: 全ての操作をキーボードで完結可能
6. **自動起動**: macOS起動時の自動起動オプション

## 技術スタック
- **フレームワーク**: Electron
- **フロントエンド**: React + TypeScript
- **スタイリング**: Tailwind CSS
- **LLM連携**: Vercel AI SDK
- **状態管理**: Zustand
- **データ保存**: electron-store（ローカルJSON）
- **ショートカット**: electron-globalShortcut
- **自動起動**: electron-auto-launch

## ファイル構成
```
/src
  /main
    - index.ts              # Electronメインプロセス
    - shortcuts.ts          # グローバルショートカット管理
    - autoLaunch.ts        # 自動起動管理
    - tray.ts              # システムトレイ管理
  /renderer
    /components
      - WindowFrame.tsx     # ウィンドウフレーム
      - PromptSelector.tsx  # プロンプト選択画面
      - FormInput.tsx       # 動的フォーム生成
      - Loading.tsx         # ローディング画面
      - Result.tsx          # 結果表示画面
    /settings
      - SettingsLayout.tsx  # 設定画面レイアウト
      - GeneralSettings.tsx # 一般設定
      - PromptList.tsx      # プロンプト一覧
      - PromptDetail.tsx    # プロンプト詳細
      - AISettings.tsx      # AI設定
    /hooks
      - useShortcuts.ts     # ショートカットフック
      - useLLM.ts          # LLM連携フック
    /stores
      - appStore.ts         # アプリ状態管理
      - promptStore.ts      # プロンプト管理
      - settingsStore.ts    # 設定管理
    /lib
      - models.ts           # AIモデル定義（開発者編集可能）
      - llm.ts             # LLM APIクライアント
      - storage.ts         # データ永続化
```

## PBS仕様書

```pbs
# QuickPrompt
  @Structure
    - Main: メインウィンドウ（ショートカット起動）
      - PromptSelector: プロンプト選択
      - FormInput: 動的フォーム
      - Loading: 処理中
      - Result: 結果表示
    - (Settings): 設定画面
      - GeneralSettings: 一般設定
      - PromptList: プロンプト一覧
      - PromptDetail: プロンプト詳細
      - AISettings: AI設定

  @State
    // アプリケーション全体の状態
    App
      currentView: 'selector' | 'form' | 'loading' | 'result'
      selectedPromptId: uuid | null
      isVisible: boolean = false
      settingsWindow: boolean = false
    
    // 一般設定
    GeneralSettings
      globalShortcut: string = 'CommandOrControl+Shift+Space'
      launchAtLogin: boolean = false
      showInDock: boolean = false
      theme: 'light' | 'dark' | 'system' = 'system'
      language: 'ja' | 'en' = 'ja'
    
    // プロンプトテンプレート
    Prompt
      id: uuid
      name: string
      description: string
      template: string  // ${placeholder}形式のテンプレート
      placeholders: Placeholder[]
      providerId: string
      modelId: string
      temperature: number = 0.7
      maxTokens: number | null = null
      shortcut: string | null  // 個別のキーボードショートカット
      createdAt: datetime
      updatedAt: datetime
    
    // プレースホルダー定義
    Placeholder
      name: string
      type: 'input' | 'textarea' | 'select'
      label: string
      placeholder: string | null
      defaultValue: string | null
      options: string[] | null  // selectの場合の選択肢
      required: boolean = true
      validation: string | null  // 正規表現パターン
    
    // AIプロバイダー設定
    Provider
      id: string  // 'openai', 'anthropic' など
      name: string
      apiKey: string | null
      enabled: boolean = false
      baseUrl: string | null  // カスタムエンドポイント用
    
    // 処理中の状態
    Processing
      promptId: uuid
      formData: Record<string, string>
      startTime: datetime
      endTime: datetime | null
      inputTokens: number | null
      outputTokens: number | null
      cost: number | null
      response: string | null
      error: string | null
      model: string
      provider: string

  @Components
    <WindowFrame>
      (V): 全体のウィンドウフレーム
        {{Content}}
    
    <TitleBar>
      (H): カスタムタイトルバー
        [Text]: "QuickPrompt"
        [-]
        [Button]#Settings: "⚙" -> 設定画面を開く
        [Button]#Minimize: "−" -> 最小化
        [Button]#Close: "×" -> ウィンドウを隠す
    
    <PromptItem>
      (H): プロンプトリストの各項目
        (V)
          [Text]: {{name}}
          [Text]: {{description}} // 薄い色で表示
        [-]
        [Text]: {{shortcut || ''}} // ショートカット表示
    
    <FormField>
      (V): フォームフィールド
        (H)
          [Text]: {{label}}
          ? $required
            | true = [Text]: "*" // 赤色で表示
        ? $type
          | 'input' = [Input]#{{name}}: {{placeholder}}
          | 'textarea' = [TextArea]#{{name}}: {{placeholder}}
          | 'select' = 
            [Select]#{{name}}
              [Option]: "選択してください"
              [Option]: {{各選択肢}}
              ...
        ? $validation && $error
          | true = [Text]: {{errorMessage}} // エラーメッセージ
    
    <CostDisplay>
      (H): コスト表示
        [Icon]: Dollar
        [Text]: "${{cost.toFixed(4)}}"
        [Text]: "({{inputTokens}} + {{outputTokens}} tokens)"
    
    <ShortcutInput>
      (H): ショートカット入力フィールド
        [Input]#ShortcutField: "ショートカットキーを押してください"
        [Button]#ClearShortcut: "クリア"

## Main
  @Layout
    <WindowFrame>
      <TitleBar>
      ? $App.currentView
        | 'selector' = 
          (V): プロンプトセレクター
            [Input]#Search: "プロンプトを検索..." -> リアルタイム検索
            (V)#PromptList: 検索結果のプロンプト一覧
              <PromptItem>
              ...
            (H): ヒント
              [Text]: "↑↓: 選択, Enter: 決定, Esc: 閉じる"
        
        | 'form' = 
          (V): フォーム画面
            (H): ヘッダー
              [Text]: $selectedPrompt.name
              [-]
              [Text]: $selectedPrompt.provider + " / " + $selectedPrompt.model
            (V): フォーム本体
              // 各プレースホルダーに対応したフィールドを動的生成
              <FormField>
              ...
            (H): アクション
              [Button]#Cancel: "キャンセル (ESC)"
              [-]
              [Button]#Submit: "実行 (Enter)" // プライマリーボタン
        
        | 'loading' = 
          (V): ローディング画面
            (Z): 中央配置
              [Icon]: Spinner // 回転アニメーション
              [Text]: "処理中..."
              [Text]: {{経過時間}}秒
              [Button]#CancelLoading: "キャンセル (ESC)"
        
        | 'result' = 
          (V): 結果画面
            [TextArea]#Result: {{response}} // 全選択状態、等幅フォント
            (H): メタ情報
              [Text]: {{provider}} / {{model}}
              [-]
              <CostDisplay>
            (H): アクション
              [Button]#NewPrompt: "新規 (N)"
              [-]
              [Button]#Copy: "Copy (Cmd+C)"
              [Button]#Close: "閉じる (ESC)"
  
  @Flow
    // グローバルショートカット（メインプロセスで処理）
    On GlobalShortcut ->
      ? $App.isVisible
        | true = ウィンドウを隠す
        | false = 
          - ウィンドウを表示
          - currentViewを'selector'に
          - 検索フィールドにフォーカス
    
    // プロンプト選択
    On Input [Input]#Search ->
      - 入力値でプロンプトをフィルタリング
      - 最初の項目を自動選択
    
    On KeyDown [Input]#Search ->
      ? キー
        | ArrowDown = 次のプロンプトを選択
        | ArrowUp = 前のプロンプトを選択
        | Enter = 選択中のプロンプトでフォーム画面へ
        | Escape = ウィンドウを隠す
        | Cmd+Comma = 設定画面を開く
    
    On Click <PromptItem> ->
      - 該当プロンプトを選択
      - currentViewを'form'に変更
      - プレースホルダーに基づいてフォームを生成
      - 最初のフィールドにフォーカス
    
    // フォーム操作
    On Click [Button]#Submit ->
      - フォームバリデーション実行
      ? バリデーション結果
        | 成功 = 
          - フォームデータを収集
          - currentViewを'loading'に変更
          - 開始時刻を記録
          - LLM APIを呼び出し
        | 失敗 = エラーフィールドをハイライト
    
    On KeyDown in 'form' ->
      ? キー
        | Enter = 
          ? フォーカス要素
            | textarea以外 = フォーム送信
            | textarea = 何もしない
        | Cmd+Enter = フォーム送信（textareaでも）
        | Escape = プロンプト選択画面に戻る
        | Tab = 次のフィールドへ
        | Shift+Tab = 前のフィールドへ
    
    // ローディング中
    On APIResponse ->
      ? 結果
        | 成功 = 
          - レスポンスとトークン数を保存
          - コストを計算（models.tsの料金情報を使用）
          - currentViewを'result'に変更
          - 結果を全選択状態にする
        | 失敗 = 
          - エラーメッセージを保存
          - currentViewを'form'に戻す
          - エラーダイアログを表示
    
    On Click [Button]#CancelLoading ->
      - API呼び出しをキャンセル
      - currentViewを'form'に戻す
    
    // 結果画面
    On Click [Button]#Copy ->
      - テキストエリアの内容をクリップボードにコピー
      - ボタンテキストを一時的に"Copied!"に変更
    
    On Click [Button]#NewPrompt ->
      - currentViewを'selector'に変更
      - 検索フィールドをクリア
    
    On KeyDown in 'result' ->
      ? キー
        | Escape = ウィンドウを隠す
        | Cmd+C = クリップボードにコピー
        | N = 新規プロンプト（selector画面へ）

## GeneralSettings uses <SettingsLayout>
  @State
    ShortcutRecording
      isRecording: boolean = false
      currentKeys: string[] = []
  
  @Layout for Content
    (V)
      [Text]: "一般設定"
      
      (V): 起動設定
        [Text]: "起動設定"
        (H)
          [CheckBox]#LaunchAtLogin: "ログイン時に自動的に起動"
        (H)
          [CheckBox]#ShowInDock: "Dockにアイコンを表示"
      
      (V): ショートカット設定
        [Text]: "グローバルショートカット"
        (H)
          [Text]: "起動ショートカット:"
          <ShortcutInput>
        [Text]: "※ 他のアプリケーションと競合しないキーの組み合わせを選んでください"
      
      (V): 表示設定
        [Text]: "表示設定"
        (H)
          [Text]: "テーマ:"
          [Select]#Theme
            [Option]: "システム設定に従う"
            [Option]: "ライト"
            [Option]: "ダーク"
        (H)
          [Text]: "言語:"
          [Select]#Language
            [Option]: "日本語"
            [Option]: "English"
      
      (H): アクション
        [-]
        [Button]#SaveGeneral: "保存"
  
  @Flow
    On Click [CheckBox]#LaunchAtLogin ->
      - electron-auto-launchでログイン時起動を設定/解除
      - 設定を保存
    
    On Click [CheckBox]#ShowInDock ->
      - app.dock.hide() / show()を切り替え
      - 設定を保存
    
    On Focus <ShortcutInput> ->
      - isRecordingをtrueに
      - 「キーを押してください」と表示
    
    On KeyDown in ShortcutInput ->
      - 押されたキーの組み合わせを記録
      - モディファイアキー（Cmd, Ctrl, Alt, Shift）を検出
      - 通常キーが押されたら記録完了
    
    On Blur <ShortcutInput> ->
      - isRecordingをfalseに
      - 記録されたショートカットを表示
    
    On Click [Button]#ClearShortcut ->
      - ショートカットをクリア
      - デフォルト値に戻す
    
    On Click [Button]#SaveGeneral ->
      - 全ての設定を保存
      - グローバルショートカットを再登録
      - 成功メッセージを表示
      - 必要に応じてアプリを再起動

## PromptList uses <SettingsLayout>
  @State
    PromptListView
      searchQuery: string = ''
      sortBy: 'name' | 'created' | 'updated' = 'updated'
      
  @Layout for Content
    (V)
      (H): ヘッダー
        [Text]: "プロンプト管理"
        [-]
        [Button]#NewPrompt: "+ 新規作成"
      
      (H): 検索とソート
        [Input]#SearchPrompts: "プロンプトを検索..."
        [-]
        [Select]#SortBy
          [Option]: "更新日順"
          [Option]: "作成日順"
          [Option]: "名前順"
      
      (V)#PromptTable: プロンプト一覧
        (H): テーブルヘッダー
          [Text]: "名前"
          [Text]: "説明"
          [Text]: "プロバイダー/モデル"
          [Text]: "ショートカット"
          [Text]: "アクション"
        
        (H): 各プロンプト行
          (V)
            [Text]: {{name}}
            [Text]: {{description}} // 小さめのフォント
          [Text]: {{provider}} / {{model}}
          [Text]: {{shortcut || '-'}}
          (H): アクションボタン
            [Button]: "編集" -> PromptDetailへ
            [Button]: "複製" -> プロンプトを複製
            [Button]: "削除" -> 削除確認
        ...
      
      ? プロンプトが0件
        | true = 
          (V): 空状態
            [Text]: "プロンプトがまだ登録されていません"
            [Button]: "最初のプロンプトを作成" -> PromptDetailへ
  
  @Flow
    On Click [Button]#NewPrompt ->
      - 新規プロンプトオブジェクトを作成
      - PromptDetailへ遷移（新規作成モード）
    
    On Input [Input]#SearchPrompts ->
      - searchQueryを更新
      - プロンプトリストをフィルタリング
    
    On Change [Select]#SortBy ->
      - sortByを更新
      - プロンプトリストを再ソート
    
    On Click "複製" ->
      - 選択されたプロンプトをコピー
      - 名前に"(コピー)"を追加
      - 新しいIDを生成
      - プロンプトリストに追加
    
    On Click "削除" ->
      - 確認ダイアログを表示
      ? 確認結果
        | OK = 
          - プロンプトを削除
          - 関連するショートカットを解除
          - リストを更新

## PromptDetail uses <SettingsLayout>
  @State
    EditingPrompt: Prompt
    ValidationErrors: Record<string, string> = {}
    TestResult
      isLoading: boolean = false
      response: string | null = null
      error: string | null = null
      
  @Layout for Content
    (V)
      (H): ヘッダー
        [Button]#BackToList: "← 一覧に戻る"
        [-]
        [Text]: ? $EditingPrompt.id | exists = "プロンプト編集" | new = "新規プロンプト"
      
      (V): 基本情報
        [Text]: "基本情報"
        (H)
          (V)
            [Text]: "プロンプト名 *"
            [Input]#Name: "例: 日英翻訳"
            ? $ValidationErrors.name
              | exists = [Text]: {{ValidationErrors.name}}
          (V)
            [Text]: "ショートカット"
            <ShortcutInput>
        
        [Text]: "説明"
        [TextArea]#Description: "このプロンプトの用途を説明..."
      
      (V): プロンプトテンプレート
        [Text]: "プロンプトテンプレート *"
        [Text]: "※ ${変数名} の形式でプレースホルダーを指定できます"
        [TextArea]#Template: "プロンプト本文を入力..."
        (H): テンプレートアクション
          [Button]#ParseTemplate: "プレースホルダーを自動検出"
          [-]
          [Button]#TestPrompt: "テスト実行"
      
      (V): プレースホルダー設定
        [Text]: "プレースホルダー"
        [Button]#AddPlaceholder: "+ プレースホルダーを追加"
        
        (V): 各プレースホルダー
          (H)
            [Text]: "${{{name}}}"
            [-]
            [Button]: "削除"
          (H)
            (V)
              [Text]: "タイプ"
              [Select]#Type_{{name}}
                [Option]: "1行テキスト"
                [Option]: "複数行テキスト"
                [Option]: "選択肢"
            (V)
              [Text]: "ラベル"
              [Input]#Label_{{name}}: "表示名"
            (V)
              [Text]: "プレースホルダー"
              [Input]#Placeholder_{{name}}: "入力例"
          
          ? $type === 'select'
            | true = 
              (V)
                [Text]: "選択肢（改行区切り）"
                [TextArea]#Options_{{name}}
          
          (H)
            [CheckBox]#Required_{{name}}: "必須項目"
            [-]
            [Text]: "検証パターン（正規表現）:"
            [Input]#Validation_{{name}}: "例: ^[0-9]+$"
          ...
      
      (V): AI設定
        [Text]: "AI設定"
        (H)
          (V)
            [Text]: "プロバイダー"
            [Select]#Provider
              // 有効なプロバイダーのみ表示
              [Option]: {{enabledProviders}}
              ...
          (V)
            [Text]: "モデル"
            [Select]#Model
              // 選択されたプロバイダーのモデル
              [Option]: {{availableModels}}
              ...
        
        (H)
          (V)
            [Text]: "Temperature (0-2)"
            [Input]#Temperature: "0.7"
          (V)
            [Text]: "最大トークン数"
            [Input]#MaxTokens: "空欄で無制限"
      
      ? $TestResult.response || $TestResult.error
        | true = 
          (V): テスト結果
            [Text]: "テスト結果"
            ? $TestResult.error
              | true = [Text]: {{error}} // エラーは赤色
              | false = [TextArea]: {{response}} // 読み取り専用
      
      (H): アクション
        [Button]#Cancel: "キャンセル"
        [-]
        [Button]#SavePrompt: "保存"
  
  @Flow
    On Change [TextArea]#Template ->
      - リアルタイムで${...}パターンを検出
      - 検出されたプレースホルダーをハイライト
    
    On Click [Button]#ParseTemplate ->
      - テンプレートから${...}を全て抽出
      - 既存のプレースホルダーと比較
      - 新しいプレースホルダーを自動追加
      - 削除されたプレースホルダーを警告
    
    On Click [Button]#AddPlaceholder ->
      - 新しいプレースホルダーを追加
      - デフォルト値を設定
    
    On Click [Button]#TestPrompt ->
      - 現在の設定でテストフォームを生成
      - モーダルでフォームを表示
      - 入力後、実際にLLM APIを呼び出し
      - 結果を表示
    
    On Change [Select]#Provider ->
      - 選択されたプロバイダーのモデルリストを更新
      - 最初のモデルを自動選択
      - 料金情報を更新表示
    
    On Click [Button]#SavePrompt ->
      - バリデーション実行
        - 名前が空でないか
        - テンプレートが空でないか
        - プレースホルダーが正しく設定されているか
        - ショートカットが他と重複していないか
      ? バリデーション結果
        | 成功 = 
          - プロンプトを保存
          - ショートカットを登録
          - PromptListに戻る
        | 失敗 = 
          - エラーを表示
          - 該当フィールドにフォーカス

## AISettings uses <SettingsLayout>
  @State
    TestConnection
      provider: string | null = null
      isLoading: boolean = false
      result: 'success' | 'failure' | null = null
      error: string | null = null
  
  @Layout for Content
    (V)
      [Text]: "AI設定"
      [Text]: "APIキーは暗号化されて保存されます"
      
      (V): プロバイダー設定
        // models.tsから動的に生成
        (V): 各プロバイダー
          (H)
            [CheckBox]#{{provider.id}}_Enabled: {{provider.name}}を有効化
            [-]
            [Button]#Test_{{provider.id}}: "接続テスト"
          
          ? ${{provider.id}}_Enabled
            | true = 
              (V)
                [Input]#{{provider.id}}_ApiKey: "APIキー" // type=password
                ? $provider.supportsCustomEndpoint
                  | true = [Input]#{{provider.id}}_BaseUrl: "カスタムエンドポイント（オプション）"
                
                (V): 利用可能なモデル
                  [Text]: "利用可能なモデル:"
                  (V): モデルリスト
                    (H): 各モデル
                      [Text]: {{model.name}}
                      [-]
                      [Text]: "入力: ${{model.inputPrice}}/1K"
                      [Text]: "出力: ${{model.outputPrice}}/1K"
                    ...
          ...
      
      ? $TestConnection.provider
        | exists = 
          (H): テスト結果
            ? $TestConnection.isLoading
              | true = [Text]: "接続テスト中..."
              | false = 
                ? $TestConnection.result
                  | 'success' = [Text]: "✓ 接続成功" // 緑色
                  | 'failure' = [Text]: "✗ 接続失敗: {{error}}" // 赤色
      
      (H): アクション
        [-]
        [Button]#SaveAISettings: "保存"
  
  @Flow
    On Click [CheckBox] ->
      - プロバイダーの有効/無効を切り替え
      - 無効化時はAPIキーフィールドを非表示
    
    On Click [Button]#Test_* ->
      - プロバイダーIDを抽出
      - APIキーを取得
      - TestConnection.isLoadingをtrueに
      - 簡単なAPIコール（モデルリスト取得など）を実行
      ? 結果
        | 成功 = 
          - result = 'success'
          - 3秒後に結果をクリア
        | 失敗 = 
          - result = 'failure'
          - エラーメッセージを設定
    
    On Click [Button]#SaveAISettings ->
      - 各プロバイダーの設定を収集
      - APIキーを暗号化
      - electron-storeに保存
      - 成功メッセージを表示
      - プロンプトのプロバイダー選択肢を更新

  @Templates
    <SettingsLayout>
      (H): 設定画面レイアウト
        (V): サイドバー
          [Text]: "設定"
          (V): ナビゲーション
            [Link]#NavGeneral: "一般" -> GeneralSettingsへ
            [Link]#NavPrompts: "プロンプト" -> PromptListへ
            [Link]#NavAI: "AI設定" -> AISettingsへ
          [-]
          [Button]#CloseSettings: "設定を閉じる"
        
        (V): メインコンテンツ
          {{Content}}
```

## データモデル詳細

### models.ts（開発者が編集可能）
```typescript
// このファイルは開発者が自由に編集可能
// 新しいプロバイダーやモデルを追加する際はここを編集

export interface AIModel {
  id: string;
  name: string;
  inputPrice: number;  // USD per 1K tokens
  outputPrice: number; // USD per 1K tokens
  maxTokens: number;
  contextWindow: number;
}

export interface AIProvider {
  id: string;
  name: string;
  models: AIModel[];
  supportsCustomEndpoint?: boolean;
  defaultBaseUrl?: string;
}

export const AI_PROVIDERS: AIProvider[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    models: [
      {
        id: 'gpt-4-turbo',
        name: 'GPT-4 Turbo',
        inputPrice: 0.01,
        outputPrice: 0.03,
        maxTokens: 4096,
        contextWindow: 128000,
      },
      {
        id: 'gpt-4',
        name: 'GPT-4',
        inputPrice: 0.03,
        outputPrice: 0.06,
        maxTokens: 8192,
        contextWindow: 8192,
      },
      {
        id: 'gpt-3.5-turbo',
        name: 'GPT-3.5 Turbo',
        inputPrice: 0.0005,
        outputPrice: 0.0015,
        maxTokens: 4096,
        contextWindow: 16385,
      },
    ],
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    models: [
      {
        id: 'claude-3-opus-20240229',
        name: 'Claude 3 Opus',
        inputPrice: 0.015,
        outputPrice: 0.075,
        maxTokens: 4096,
        contextWindow: 200000,
      },
      {
        id: 'claude-3-sonnet-20240229',
        name: 'Claude 3 Sonnet',
        inputPrice: 0.003,
        outputPrice: 0.015,
        maxTokens: 4096,
        contextWindow: 200000,
      },
      {
        id: 'claude-3-haiku-20240307',
        name: 'Claude 3 Haiku',
        inputPrice: 0.00025,
        outputPrice: 0.00125,
        maxTokens: 4096,
        contextWindow: 200000,
      },
    ],
  },
  // 新しいプロバイダーを追加する場合はここに記述
];

// ヘルパー関数
export function getProvider(id: string): AIProvider | undefined {
  return AI_PROVIDERS.find(p => p.id === id);
}

export function getModel(providerId: string, modelId: string): AIModel | undefined {
  const provider = getProvider(providerId);
  return provider?.models.find(m => m.id === modelId);
}

export function calculateCost(
  providerId: string, 
  modelId: string, 
  inputTokens: number, 
  outputTokens: number
): number {
  const model = getModel(providerId, modelId);
  if (!model) return 0;
  
  return (inputTokens / 1000 * model.inputPrice) + 
         (outputTokens / 1000 * model.outputPrice);
}
```

## キーボードショートカット仕様

### グローバル（システム全体）
- `設定可能`: アプリを表示/非表示（デフォルト: Cmd+Shift+Space）
- 各プロンプトに設定された個別ショートカット

### アプリ内共通
- `Cmd+,`: 設定画面を開く
- `Cmd+W`: 現在のウィンドウを閉じる
- `Cmd+Q`: アプリを完全に終了

### プロンプト選択画面
- `↑/↓`: リスト内の選択移動
- `Enter`: 選択したプロンプトを開く
- `Escape`: ウィンドウを隠す
- `Cmd+F`: 検索フィールドにフォーカス

### フォーム画面
- `Tab/Shift+Tab`: フィールド間の移動
- `Enter`: フォーム送信（textareaではCtrl/Cmd+Enter）
- `Escape`: プロンプト選択に戻る

### 結果画面
- `Cmd+A`: 全選択
- `Cmd+C`: コピー
- `N`: 新規プロンプト
- `Escape`: ウィンドウを隠す

### 設定画面
- `Cmd+W` または `Escape`: 設定を閉じる
- `Cmd+S`: 現在の設定を保存

## ウィンドウ仕様

### メインウィンドウ
- サイズ: 600x400px
- 位置: 画面中央
- スタイル: フローティング、常に最前面
- 影付き、角丸
- カスタムタイトルバー

### 設定ウィンドウ
- サイズ: 900x600px
- 位置: 画面中央
- スタイル: 通常のウィンドウ
- リサイズ可能
- 最小サイズ: 700x500px

### 共通仕様
- ダークモード対応（システム設定に従う）
- アニメーション: フェードイン/アウト（200ms）
- macOSのVibrantウィンドウスタイル対応

## データ保存仕様

### 保存場所
- **アプリ設定**: `~/Library/Application Support/QuickPrompt/config.json`
- **プロンプト**: `~/Library/Application Support/QuickPrompt/prompts.json`
- **APIキー**: macOS Keychain（暗号化）
- **ログ**: `~/Library/Logs/QuickPrompt/`

### データ形式
```json
// config.json
{
  "version": "1.0.0",
  "general": {
    "globalShortcut": "CommandOrControl+Shift+Space",
    "launchAtLogin": false,
    "showInDock": false,
    "theme": "system",
    "language": "ja"
  },
  "window": {
    "main": {
      "width": 600,
      "height": 400
    },
    "settings": {
      "width": 900,
      "height": 600
    }
  }
}

// prompts.json
{
  "prompts": [
    {
      "id": "uuid-v4",
      "name": "日英翻訳",
      "description": "日本語を英語に翻訳",
      "template": "以下の日本語を自然な英語に翻訳してください:\n\n${text}",
      "placeholders": [
        {
          "name": "text",
          "type": "textarea",
          "label": "日本語原文",
          "placeholder": "翻訳したい日本語を入力...",
          "required": true
        }
      ],
      "providerId": "openai",
      "modelId": "gpt-4-turbo",
      "temperature": 0.3,
      "shortcut": "Cmd+Shift+T",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

## エラーハンドリング

### API通信エラー
- ネットワークエラー: 「インターネット接続を確認してください」
- 認証エラー: 「APIキーが無効です。設定を確認してください」
- レート制限: 「API制限に達しました。しばらく待ってから再試行してください」
- タイムアウト: 「リクエストがタイムアウトしました（30秒）」

### バリデーションエラー
- 必須フィールド: 「このフィールドは必須です」
- 正規表現: 「入力形式が正しくありません」
- ショートカット重複: 「このショートカットは既に使用されています」

### システムエラー
- ファイル保存失敗: 自動リトライ（3回）後、エラーダイアログ
- キーチェーンアクセス失敗: 権限の再要求

## セキュリティ考慮事項

1. **APIキー保護**
   - macOS Keychainに暗号化して保存
   - メモリ上でも暗号化状態を維持
   - ログには絶対に出力しない

2. **通信**
   - HTTPS通信のみ
   - 証明書検証を必須化

3. **入力検証**
   - XSS対策（React標準のエスケープ）
   - SQLインジェクション対策（ローカルJSONのため不要）

## パフォーマンス要件

- 起動時間: 100ms以内
- ショートカット反応: 50ms以内
- API応答待ち: タイムアウト30秒
- メモリ使用量: 100MB以下（通常時）

## 今後の拡張性考慮

1. **プラグインシステム**
   - カスタムプロバイダーの追加
   - カスタムアクションの追加

2. **同期機能**
   - iCloud同期
   - 設定のエクスポート/インポート

3. **統計機能**
   - 使用履歴
   - コスト集計

4. **チーム機能**
   - プロンプト共有
   - 組織アカウント対応