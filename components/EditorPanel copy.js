import React, { useState, useRef, useEffect } from 'react';
import AceEditor from 'react-ace';
import "ace-builds/src-noconflict/mode-gobstones";
import "ace-builds/src-noconflict/theme-chrome";
import SelectProblem from './SelectProblem';
import { FlagIcon } from '@heroicons/react/20/solid';
import { ArrowUturnDownIcon } from '@heroicons/react/20/solid'
import { ArrowRightOnRectangleIcon } from '@heroicons/react/20/solid'


// 親(index)から渡された props 中の値を分割代入
function EditorPanel({ problemCode, setResult, globalVars, setOutput, output, setcallStack, callStack, insertChoicedata, setinsertChoicedata, setinsertChoiceNumber, 
  selectedProblemIndex, setSelectedProblemIndex,
}) {
  const [text, setText] = useState(problemCode);          // エディタのコード　(初期値は渡された problemCode)
  const [currentLine, setCurrentLine] = useState(0);      // 現在の行番号
  const [functions, setFunctions] = useState({});         // 関数定義の行番号など
  const [globalState, setglobalState] = useState({});     // グローバルスコープのif文などのステート
  const editorRef = useRef(null);                         // Aceエディタの参照  (次に実行するLineの印用)
  const [popupMessage, setPopupMessage] = useState(null); //
  const [breakPoint, setBreakPoint] = useState(new Set());// BreakPointに設定した行をSetオブジェクトで管理
  const [fontSize, setFontSize] = useState(16);           // エディタのフォントサイズ
  
  const fontSizeList = [10, 12, 14, 16, 18, 20, 22];      // フォントサイズ選択用リスト 

  // プログラムを選択し直したら、新しいコードをセット
  useEffect(() => {
    setText(problemCode);  

    // 初期化処理
    setResult({});                // グローバル変数を空に
    setglobalState({});           // グローバルスコープのステート
    setOutput([]);                // 出力を空に
    setFunctions({});             // 関数定義をリセット
    setText(problemCode);         // エディタのコードを最初に戻す
    setCurrentLine(0);            // 行番号を0に戻す
    setcallStack([]);             // 関数呼び出しリセット
    setinsertChoicedata(null);    // 置き換えデータ
    setinsertChoiceNumber(null)   // 置き換えボタン番号 （置き換えボタンが押された）
    setBreakPoint(new Set())      // ブレークポイント
    

    

  }, [problemCode]);  // problemCodeが変わったとき、処理

  // 置き換えボタンを押したら、
  useEffect(() => {
    if (insertChoicedata == null )
      return  
     
    const lines = text.split('\n');       // 改行で区切ってエディタの文を配列に
    for (let i = 0; i < insertChoicedata.length; i++) {
      const replacetext = insertChoicedata[i]["text"] 
      const replaceline = insertChoicedata[i]["line"]
      
      lines[replaceline] = replacetext              
    }
    
    const newlines = lines.join("\n");    // linesの配列に改行を挟んで文字列に戻す
    setText(newlines);
  }, [insertChoicedata]);                 // insertChoicedataが変わったとき、処理


  // currentLine(次に実行) の行に 印(GutterDecoration)を付ける
  useEffect(() => {
    const editor = editorRef.current.editor;   // AceEditorのオブジェクト
    if (!editor) return;                       // エディタがまだ、なければリターン
    const session = editor.getSession();       // 現在開いているテキストの編集セッションを取得
    const total = session.getLength();         // エディタの行数を取得

    // 全てのマークを消す(前の行だけを消そうとすると、残ることがあった)
    for (let i = 0; i < total; i++) {
      session.removeGutterDecoration(i, 'next-line-marker');                // 行を消す
    }
    
    // 全て実行していなければ、現在の行にだけマークを付ける
    if (currentLine < total) {
      session.addGutterDecoration(currentLine, 'next-line-marker');         // マークを付ける
    } 
  }, [currentLine, text]);  // currentLine または text が変わったとき、処理

  // BreakPointの行に付ける印(B)の切り替え
  useEffect(() => {
    const editor = editorRef.current?.editor;
    if (!editor) return;

    const session = editor.getSession();
    const total = session.getLength();

    // リセット
    for (let i = 0; i < total; i++) {
      session.removeGutterDecoration(i, 'breakpoint-marker');
    }

    // BreakPointの行にBを付ける
    for (const line of breakPoint) {
      session.addGutterDecoration(line, 'breakpoint-marker');
    }
  }, [breakPoint, text]);

  



  // 解析・実行
  const parseCode = async (runbutton) => {
    const lines = text.split('\n');     // 改行で区切ってエディタの文を配列に

    // 全て実行したか
    if (currentLine >= lines.length) {  
      // alert('すべての行を実行しました');
      setPopupMessage("全ての行を実行しました")
      return;
    }

    
    // エディタのtextをpyで構文解析するため、APIに送る  async(非同期)
    const breakPointArray = [...breakPoint];                      // Setオブジェクトを配列に変換

    const res = await fetch('/api/run-python', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // lines(コードを分けた配列)、 現在の変数、 、グローバルスコープのステート、 出力、 次に実行する行番号、 関数定義の情報、　関数呼び出し、実行ボタン、　ブレークポイント設定行を JSON文字列に変換して送る
      body: JSON.stringify({ text: lines, globalVars, globalState, output, currentLine, functions, callStack,
        runButton: runbutton, breakPointArray}),   
      // req.body.xxx で送った値を取り出せる
    });

    // 返ってきたResponseオブジェクト(res)に入ったJSON形式の値をJavaScriptオブジェクトに変換
    const data = await res.json();

    // pythonからerrorが返ってきた場合
    if(data.p_error){
      setPopupMessage(data.p_error);
      return;
    }

    // 解析実行後の値で更新
    setResult(data.globalVars);       // 結果が親(index.js)へコールバック → VariablesPanel に渡される
    setglobalState(data.globalState);
    setOutput(data.output);           //                〃
    setFunctions(data.functions);     // 関数定義の行番号などを登録 (一行目実行時のみ)
    setCurrentLine(data.currentLine); // 次の行へ  (python側で決めたcurrentLineをセットする)
    setcallStack(data.callStack);     // 関数の呼び出し情報をセット

    // ブレークポイントで停止したらメッセージ   (一般的な開発環境に近づけるため、不採用)
    // if(data.isbreak){
    //   setPopupMessage(`ブレークポイント(${data.currentLine + 1}行目)で停止しました`);
    // }
    
  };

  // エディタのコードは変更せずに実行状態のみリセット   (停止マークボタン)
  const resetState = () => {
    setResult({});          // グローバル変数を空に
    setglobalState({});     // グローバルスコープのステート
    setOutput([]);          // 出力を空に
    setFunctions({});       // 関数定義をリセット
    setCurrentLine(0);      // 行番号を0に戻す
    setcallStack([]);       // 関数呼び出しリセット
  };

  // すべて初期状態に戻す (初期化ボタン)
  const resetAll = () => {
    setResult({});                // グローバル変数を空に
    setglobalState({});           // グローバルスコープのステート
    setOutput([]);                // 出力を空に
    setFunctions({});             // 関数定義をリセット
    setText(problemCode);         // エディタのコードを最初に戻す
    setCurrentLine(0);            // 行番号を0に戻す
    setcallStack([]);             // 関数呼び出しリセット
    setinsertChoicedata(null);    // 置き換えデータ
    setinsertChoiceNumber(null)   // 置き換えボタン番号 （置き換えボタンが押された）
    setBreakPoint(new Set())      // ブレークポイント
  };


  // BrakePoint切り替え
  const switchingBreakPoint = () => {
    const editor = editorRef.current?.editor;        // 現在のエディタのリファレンスを取得
    const cursor = editor.getCursorPosition();       // エディタの選択中位置を取得
    const row = cursor.row;                          // 選択中の行番号を取得
    let newBreakPoint = new Set(breakPoint);         // 更新用のSetオブジェクトを作成


    if (newBreakPoint.has(row)) {                    // 選択中の行が既にbreakPointに設定されているなら
      newBreakPoint.delete(row);                     // 選択中の行番号をSetオブジェクトから削除
    }
    else {                                           // 選択中の行がbreakPointに設定されていないなら
      newBreakPoint.add(row);                        // 選択中の行番号をSetオブジェクトに追加
    }

    setBreakPoint(newBreakPoint);                    // 更新用のオブジェクトからBreakPointを更新         

  };

  // Setオブジェクトから配列に変換
  const breakPointArray = [...breakPoint];

  // aceEditorに渡すMarkerを初期化
  const aceMarkers = [];

  // 行番号ごとにmarkerを作る
  for (const line of breakPointArray) {
    const marker = {
      startRow: line,
      startCol: 0,
      endRow: line,     // 開始行のみ
      endCol: 1,
      className: "breakpoint_line",
      type: "fullLine",
    };

    aceMarkers.push(marker);
  }


  // ボタン用スタイル
  const buttonBarStyle = {
    marginTop: '0.6rem',
    display: 'flex',
    gap: '2rem',
    justifyContent: 'center',     // 横
    alignItems: 'center'          // 縦
  };

  const iconButtonStyle = {
    width: 60,
    height: 50,
    borderRadius: 8,
    border: '1px solid #555',
    background: '#ffffff',
    color: '#111',          // 文字色を固定 (ダークモード対策)
    cursor: 'pointer',
    fontSize: '2rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

const iconButtonStyleMini = {
    width: 50,
    height: 40,
    borderRadius: 8,
    border: '1px solid #555',
    background: '#ffffff',
    color: '#111',          // 文字色を固定 (ダークモード対策)
    cursor: 'pointer',
    fontSize: '2rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };



  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>

      {/* プログラム選択メニュー, ブレークポイント切り替え */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '3.0rem' }}>

        {/* プログラム選択メニュー */}
        <div style={{ flex: '0 0 auto', marginLeft: '1rem' }}>
          <SelectProblem
            selectedProblemIndex={selectedProblemIndex}
            setSelectedProblemIndex={setSelectedProblemIndex}
          />
        </div>

        {/* BreakPoint切り替え */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop:'0.1rem'}}>
          <button
            type="button"
            onClick={switchingBreakPoint}
            style={{
              width: 50,
              height: 30,
              borderRadius: 8,
              border: '1px solid #555',
              background: '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
            }}
          >
            <FlagIcon className="h-6 w-6 text-gray-700" />
          </button>

          <div style={{ fontSize: '0.7rem', marginTop: '0.1rem', textAlign: 'center' }}>
            ブレークポイント切替
          </div>
        </div>

        {/* Font Size 切替 */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '0.1rem' }}>
          <select
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            style={{
              height: 30,
              borderRadius: 8,
              border: '1px solid #555',
              background: '#ffffff',
              color: '#111',
              cursor: 'pointer',
              padding: '0 0.5rem',
            }}
          >
            {fontSizeList.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <div style={{ fontSize: '0.7rem', marginBottom: '0.2rem', textAlign: 'center' }}>フォントサイズ切替</div>
        </div>


      </div>



      {/* AceEditor の伸縮用 (エディタだけ、サイズを固定しない) */}
      <div style={{ flex: 1, marginTop: '0.2rem' }}>
        <AceEditor
          ref={editorRef}
          markers={aceMarkers}
          mode="gobstones"
          theme= "chrome"
          value={text}
          onChange={setText}
          width="100%"
          height="100%"
          name="ace-editor"
          fontSize={fontSize}         // 選択したフォントサイズを適用
          editorProps={{ $blockScrolling: false }}
          setOptions={{ 
            tabSize: 2,               // タブキーを押したときのインデント
            showPrintMargin: false,   // 縦線を消す
          }}
          style={{ width: "100%", height: "100%", border: '1px solid #ddd', borderRadius: 8 }}
        />
      </div>

      {/* 実行ボタン */}
      <div style={buttonBarStyle}>
        {/* 完全リセット */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <button
            type="button"
            onClick={resetAll}
            style={iconButtonStyle}
            title="コード初期化"
          >
            ↻
          </button>
          <span style={{ fontSize: '0.75rem', marginTop: '0.7rem' }}>
            コードを初期化する
          </span>
        </div>

        {/* リセット □ */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <button
            type="button"
            onClick={resetState}
            style={iconButtonStyle}
            title="リセット"
          >
            {/* リセットボタン内側 ■ のスタイル */}
            <div style={{
              width: '23px',
              height: '23px',
              backgroundColor: '#111',
            }}></div>
          </button>
          <span style={{ fontSize: '0.75rem', marginTop: '0.7rem' }}>
            実行前に戻す
          </span>
        </div>

        {/* 一行ずつ実行 ▶ */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <button
            type="button"
            onClick= {() => parseCode("step")}  // 実行ボタンを渡して解析
            style={iconButtonStyle}
            title="ステップ実行"
          >
            ▶
          </button>
          <span style={{ fontSize: '0.75rem', marginTop: '0.7rem' }}>
            ステップ実行
          </span>
        </div>

        {/* ステップオーバー*/}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <button
            type="button"
            onClick= {() => parseCode("over")}  // 実行ボタンを渡して解析
            style={iconButtonStyleMini}
            title="ステップオーバー"
          >
          <ArrowUturnDownIcon
            className="h-5 w-5"
            //  左右反転
            style={{ transform: 'scaleX(-1)' }}            
          />
          </button>
          <span style={{ fontSize: '0.7rem', marginTop: '0.4rem', textAlign: 'center' }}>
            ステップ<br />
            オーバー
          </span>
        </div>

        {/* ステップアウト */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <button
            type="button"
            onClick= {() => parseCode("out")}  // 実行ボタンを渡して解析
            style={iconButtonStyleMini}
            title="ステップアウト"
          >
          <ArrowRightOnRectangleIcon
            className="h-5 w-5"
          />
          </button>
          <span style={{ fontSize: '0.7rem', marginTop: '0.4rem', textAlign: 'center' }}>
            ステップ<br />
            アウト
          </span>
        </div>


        {/* 全て実行 */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <button
            type="button"
            onClick= {() => parseCode("all")}   // 実行ボタンを渡して解析
            style={{
              ...iconButtonStyle,
              letterSpacing: "-0.9rem"
            }

            }
            title="全て実行"
          >
            ▶┃
          </button>
          <span style={{ fontSize: '0.75rem', marginTop: '0.7rem' }}>
            全て実行
          </span>
        </div>

      </div>


      {/* メッセージがあれば表示(ポップアップ） */}
      {popupMessage && (
        <div
          style={{
            position: 'fixed',                 // 画面全体に固定
            top: 0,                            // 左上基準
            left: 0,
            width: '100vw',                    // 画面横全て
            height: '100vh',                   // 画面縦全て
            background: 'rgba(0,0,0,0.35)',  // 半透明の黒背景
            display: 'flex',
            alignItems: 'center',              // 上下
            justifyContent: 'center',          // 左右
            zIndex: 9999,                      // 他より前面に
          }}
        >
          <div
            style={{
              background: '#ffffff',
              padding: '1.2rem 1.6rem',
              borderRadius: 10,
              minWidth: 260,
              textAlign: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
              border: '2px solid #000000',
            }}
          >
            {/* メッセージ */}
            <div
              style={{
                fontSize: '1.1rem',
                fontWeight: 'bold',
                color: '#111',
                marginBottom: '0.8rem',
                whiteSpace: 'pre-wrap',   // 空白や改行文字を保持しつつ、テキストが必要に応じて折り返し
              }}
            >
              {popupMessage}
            </div>
            
            {/* 確認ボタン OK */}
            <button
              type="button"
              onClick={() => setPopupMessage(null)}    // 押したらメッセージをリセット
              style={{
                padding: '0.35rem 1.2rem',
                borderRadius: 6,
                border: '1px solid #555',
                cursor: 'pointer',
                fontSize: '0.9rem',
                color: '#111',
                background: '#f5f5f5',
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default EditorPanel;
