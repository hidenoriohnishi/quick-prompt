# アプリケーション調整タスクリスト

## UI/UX改善
- [ ] ショートカットでアプリを開いたあと、`ESC`キーでウィンドウを正しく閉じる
- [x] プロンプト選択画面で、カーソルキーによるプロンプト選択を有効にする
- [x] プロンプトフォーム画面で、最初の入力要素に自動でフォーカスする
- [x] プロンプトフォーム画面で、`Enter`キーでプロンプトを実行する

## ローディング画面改善
- [ ] フォーム送信後にローディング画面が表示されるように修正する
- [ ] ローディング画面に、生成中のテキストをストリーミング表示する
- [ ] ローディング画面に「キャンセル」ボタンを追加する
- [ ] ローディング中に`ESC`キーを押すと、プロンプト実行を中止してフォーム画面に戻る

## 結果画面改善
- [x] 結果を編集可能な`TextArea`に表示する
- [x] "assistant"ラベルを削除する
- [x] result 画面で「Copy(shift + enter)」したときnotificationがない。
- [x] result画面でESCを押しても画面が閉じない
- [x] result画面でClose(Esc)するとき状態をリセットし、次はプロンプトリストから始まるようにする。
- [x] result画面で「Back To Prompt」は不要。Close(ESC)したらリセットするようにするので。 