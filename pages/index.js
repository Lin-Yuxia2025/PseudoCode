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
