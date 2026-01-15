import React, { useState, useEffect } from 'react';
import EditorPanel from '../components/EditorPanel';
import VariablesPanel from '../components/VariablesPanel';
import OutputPanel from '../components/OutputPanel';

import problems from "../problems.json";                                  // プログラムリスト





export default function Home() {
  const [globalVars, setglobalVars] = useState({});
  const [output, setOutput] = useState({});
  const [callStack, setcallStack] = useState([]);                         // 関数が呼び出されるたびにステートを重ねる
  const [selectedProblemIndex, setSelectedProblemIndex] = useState(0);    // プログラム選択
  const [insertChoiceNumber, setinsertChoiceNumber] = useState(null);     // 選択肢から挿入する際の選択番号
  const [insertChoicedata, setinsertChoicedata] = useState(null);         // エディタに送る、置き換え内容



  const selectedProblem = problems[selectedProblemIndex];

  // const problemTitle = selectedProblem[0];
  // const problemMemo  = selectedProblem[1];
  const problemCode  = selectedProblem[2];                // コード
  const problemText = selectedProblem[3];                 // 問題文
  const answerChoices = selectedProblem[4] || [];         // 解答群 (無ければ空配列)
  const choiceitemsRow = selectedProblem[5] || 3;         // 一行に選択肢を何個置くか (なければデフォルト3個
  const insertChoiceList = selectedProblem[6] || [];      // 選択肢から挿入する内容のリスト [ア, イ, ウ]（無ければ空配列）
  

  // 選択肢から挿入ボタンが押されたら、内容を押された番号の内容を取得して、エディタに渡す
  useEffect(() => {
    if (insertChoiceNumber == null)
      return 
    // const insertChoiceList = selectedProblem[6] || [];            // 選択肢から挿入する内容（無ければ空配列）
    setinsertChoicedata(insertChoiceList[insertChoiceNumber]);       // 押された番号の置き換え内容を取得 [{text, line}, {text, line},]
  }, [insertChoiceNumber]);




  return (
    <div style={{ display: 'flex', gap: '1rem', height: "100vh" }}>
      {/* 左側 Editor*/}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', flex: '1 1 50%' }}>  
        <EditorPanel problemCode={problemCode} setResult={setglobalVars} globalVars={globalVars} setOutput={setOutput} output={output} 
          setcallStack={setcallStack} callStack={callStack} insertChoicedata={insertChoicedata} setinsertChoicedata={setinsertChoicedata} setinsertChoiceNumber={setinsertChoiceNumber}
          selectedProblemIndex={selectedProblemIndex} setSelectedProblemIndex={setSelectedProblemIndex} 
        />
      </div>

      {/* 右側：上に変数一覧、下に出力*/}
      <div
        style={{
          flex: '1 1 50%',         // エディタとの横幅
          display: 'flex',
          flexDirection: 'column', // 縦並び
          gap: '3.0rem',
          minHeight: 0,            // 縮めるように（出力パネルを押し出さない）
        }}>
        {/* 変数一覧に載せる、globalVars, callStack(local変数が入ってる)を渡す */}
        <div style={{ flex: 1, minHeight: 0}}>
          <VariablesPanel globalVars={globalVars} callStack={callStack} problemText={problemText}
           answerChoices={answerChoices} choiceitemsRow={choiceitemsRow} setinsertChoiceNumber={setinsertChoiceNumber} insertChoiceList={insertChoiceList}/>
        </div>
        <div style={{height: 140}}>
          <OutputPanel output={output} />
        </div>
      </div>
    </div>
  );
}
