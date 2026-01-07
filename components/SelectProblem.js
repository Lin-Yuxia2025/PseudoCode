import React, { useState, useEffect, Fragment, useRef } from 'react';

import { Combobox, Transition } from '@headlessui/react'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'

import problems from "../problems.json";                                  // プログラムリスト



function SelectProblem({selectedProblemIndex, setSelectedProblemIndex,}) {

    // プログラム選択Combobox用

    const problemOptions = problems.map((p, idx) => ({
        id: idx,
        // 表示は「プログラム名 - 備考」
        name: `${p[0] ?? ''} - ${p[1] ?? ''}`,
    }));


    // Comboboxの選択状態
    const [selectedProgram, setSelectedProgram] = useState(problemOptions[selectedProblemIndex] ?? problemOptions[0]);
    const [programQuery, setProgramQuery] = useState('');       // 検索文字列

    const programInputRef = useRef(null);

    // 検索機能
    const filteredPrograms =
        programQuery === ''
            ? problemOptions                                                      // 空白なら全て表示
            // 入力されていれば、配列の各要素をチェックして条件を満たすものだけを残す
            : problemOptions.filter((item) =>       
                item.name
                    .toLowerCase()                                                // 大文字小文字無視
                    .replace(/\s+/g, '')                                          // 空白無視
                    .includes(programQuery.toLowerCase().replace(/\s+/g, ''))     // 部分一致
            );


    // selectedProblemIndexが別処理で変わった時も選択プログラム更新
    useEffect(() => {
        setSelectedProgram(problemOptions[selectedProblemIndex] ?? problemOptions[0]);
    }, [selectedProblemIndex]);




    return (
        <div className={`relative z-50 w-72 mt-1`}>
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
                                            該当する問題が見つかりません
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
    );
}

export default SelectProblem;