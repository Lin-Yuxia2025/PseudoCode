import React, { useState, useEffect, Fragment, useRef } from 'react';
import EditorPanel from '../components/EditorPanel';
import VariablesPanel from '../components/VariablesPanel';
import OutputPanel from '../components/OutputPanel';

import { Combobox, Transition } from '@headlessui/react'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'

import problems from "../problems.json";                                  // プログラムリスト



export default function Home() {
  const [globalVars, setglobalVars] = useState({});
  const [output, setOutput] = useState({});
  const [callStack, setcallStack] = useState([]);                         // 関数が呼び出されるたびにステートを重ねる
  const [selectedProblemIndex, setSelectedProblemIndex] = useState(0);    // プログラム選択
  const [insertChoiceNumber, setinsertChoiceNumber] = useState(null);     // 選択肢から挿入する際の選択番号
  const [insertChoicedata, setinsertChoicedata] = useState(null);         // エディタに送る、置き換え内容


  // プログラム選択Combobox用

  const problemOptions = problems.map((p, idx) => ({
    id: idx,
    // 表示は「プログラム名 - 備考」
    name: `${p[0] ?? ''} - ${p[1] ?? ''}`.trim(),
  }));

  // Comboboxの選択状態（オブジェクトを持つ）
  const [selectedProgram, setSelectedProgram] = useState(problemOptions[selectedProblemIndex] ?? problemOptions[0]);
  const [programQuery, setProgramQuery] = useState('');

  const programInputRef = useRef(null);

  const filteredPrograms =
    programQuery === ''
      ? problemOptions
      : problemOptions.filter((item) =>
          item.name
            .toLowerCase()
            .replace(/\s+/g, '')
            .includes(programQuery.toLowerCase().replace(/\s+/g, ''))
        );

  // selectedProblemIndex が別処理で変わった時も選択プログラム更新
  useEffect(() => {
    setSelectedProgram(problemOptions[selectedProblemIndex] ?? problemOptions[0]);
  }, [selectedProblemIndex]);
  // プログラムメニューここまで


  const selectedProblem = problems[selectedProblemIndex];

  // const problemTitle = selectedProblem[0];
  // const problemMemo  = selectedProblem[1];
  const problemCode  = selectedProblem[2];
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



  // 予定

  // 配列の指定した要素番号への代入が未実装                                                完了
  // 複数の変数を同時に宣言が未実装                                                       完了
  // 宣言した変数に、関数の返り値を入れるが未実装                                           完了
  // 配列表示のために変数、配列を分ける判定が必要？                                         完了

  // エディタ上のコードの変更は残したまま、変数などのステートのみをリセットするボタン          完了
  // 最後まで実行するボタン                                                               完了
  // タブ切り替え(問題解答機能)                                                           完了                                                                                         
  // プログラムリストを多次元配列にして、プログラム名、補足などを入れてメニュー選択時に表示させる？   完了
  // ４つ目の要素に問題文を入れる                                                          完了
  // 問題文を表示と選択肢ボタンを明るくする？                                               完了
  // 問題文の"空欄"表示方法                                                               完了
  // 一行に選択肢を何個置くかを決める値をリストに持たせる？                                  完了

  // 選択肢からボタンで空欄に入力する機能を実装、あるいは入力が要らないように問題を改変する？     完了
  // 差し替え内容をリストにして、登録しておけば、ボタンから入力できる？　　　　[選択肢の番号][{内容, 行番号}]     完了
  // 変数パネルからエディターに送る必要がある（setを変数パネルに渡して、エディターにはステートを渡す？            完了
  // 渡されたら、エディター側で差し替える？                                                                  完了
  // 変数パネルからは挿入する選択肢の番号だけをindexに返す→indexから番号のオブジェクトをエディタに送る           完了
  // プログラムを変更したとき（selectedProblemが変更）したときにinsertChoiceNumberも初期化処理をいれる         完了
  // リセットのためにエディタにもsetを送らないといけない                                                      完了
  // insertChoiceListを変数パネルに渡して、置き換えボタンを表示するかの判定に使う                              完了
  // 全ての行を実行などのメッセージも解答結果などと統一する？                                                 完了
  // エラーメッセージにカレントラインも表示する                                                              完了
  // 全て実行後、無限ループに入ったら止めてメッセージを出す                                                   完了
  // parse.pyをインポートする形になったため global を nonlocal に変更                                        完了 

  //  {} で配列の値として扱うルール
  
  // エラー落ち全般                                                                                        字句、構文解析エラーには対応
  // 解答後に解説？
  // "="で代入など疑似言語ではない構文を使えるようにする
  // コメントアウトの色を変える
  // Ace Editorの言語設定(色)
  // 画面全体の表示サイズの自動調整(縦方向)
  // if文に入った後、ifを抜けた時にelifを一度解析するのが気持ち悪いからスキップ処理を入れる？
  // n × (n-1) の様な時に、(n-1)をvalueとして扱う必要がある     (valueを後から()で包んでもvalueとして扱えるようにする？)

  // 関数の戻り値をreturnできるようにする

  // 関数の戻り値を使う処理の前に、乗算などの処理があれば実行して値を作ってから、戻り値を使うようにする？
  // 戻り値との演算に使う変数の値は、呼び出した時と変わらないはずだから、呼び出した時点で数値として登録できる？
  // つまり、記号と、数値の２つを登録すればいい？

  // ダークモード対策　（スタイルシートの調整
  // ブレークポイント   色を変える（ラインの


  return (
    <div style={{ display: 'flex', gap: '1rem' }}>
      {/* 左側 Editor*/}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', flex: '1 1 50%' }}>  
        
        {/* プログラム選択メニュー */}
        <div className="relative z-50 w-72 mt-1 ml-6">
          <Combobox
            value={selectedProgram}
            onChange={(item) => {
              if (!item) return;                // メニューの入力が空になると、null が返ってエラーが起きるため return
              setSelectedProgram(item);
              setSelectedProblemIndex(item.id); // index更新
            }}
          >
            {({ open }) => (
              <div className="relative mt-1">
                <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-gray-200 text-left shadow-md sm:text-sm">
                  <Combobox.Input
                    ref={programInputRef}
                    // className="w-full border-none py-2 pl-3 pr-10 bg-[#f6f7f9] text-sm leading-5 text-gray-900 focus:outline-none focus:ring-0"
                    className="w-full border-none py-2 pl-3 pr-10 bg-[#F7F4F9] text-sm leading-5 text-gray-900 focus:outline-none focus:ring-0"
                    displayValue={(item) => item?.name ?? ''}
                    onChange={(event) => setProgramQuery(event.target.value)}
                  />

                  {/* 入力欄全体をクリックしたら必ず開く */}
                  <Combobox.Button
                    className="absolute inset-0"
                    onMouseDown={() => {
                      queueMicrotask(() => programInputRef.current?.focus());
                    }}
                  />

                  {/* 右端アイコン */}
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                    <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </div>
                </div>

                {open && (
                  <Transition
                    as={Fragment}
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                    afterLeave={() => setProgramQuery('')}
                  >
                    <Combobox.Options className="absolute mt-1 max-h-[75vh] w-full overflow-auto rounded-md bg-[#F7F4F9] py-1 text-sm shadow-lg sm:text-sm">
                      {filteredPrograms.length === 0 && programQuery !== '' ? (
                        <div className="relative cursor-default select-none px-4 py-2 text-gray-700">
                          Nothing found.
                        </div>
                      ) : (
                        filteredPrograms.map((item) => (
                          <Combobox.Option
                            key={item.id}
                            value={item}
                            className={({ active }) =>
                              `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                active ? 'bg-teal-600 text-white' : 'text-gray-900'
                              }`
                            }
                          >
                            {({ selected, active }) => (
                              <>
                                <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                  {item.name}
                                </span>
                                {selected ? (
                                  <span
                                    className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                      active ? 'text-white' : 'text-teal-600'
                                    }`}
                                  >
                                    <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                  </span>
                                ) : null}
                              </>
                            )}
                          </Combobox.Option>
                        ))
                      )}
                    </Combobox.Options>
                  </Transition>
                )}
              </div>
            )}
          </Combobox>
        </div>

        {/* problemCode (エディタに載せるコード) */}
        {/* setResult に setglobalVars関数 を入れて渡す(EditorPanelで globalVars を更新できる) */}
        <EditorPanel problemCode={problemCode} setResult={setglobalVars} globalVars={globalVars} setOutput={setOutput} output={output} 
        setcallStack={setcallStack} callStack={callStack} insertChoicedata={insertChoicedata} setinsertChoicedata={setinsertChoicedata} setinsertChoiceNumber={setinsertChoiceNumber}/>
      </div>

      {/* 右側：上に変数一覧、下に出力*/}
      <div
        style={{
          flex: '1 1 50%',         // エディタとの横幅
          display: 'flex',
          flexDirection: 'column', // 縦並び
          gap: '3.0rem',  
        }}>
        {/* 変数一覧に載せる、globalVars, callStack(local変数が入ってる)を渡す */}
        <div style={{height: 380}}>
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
