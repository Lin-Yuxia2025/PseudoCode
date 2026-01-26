import React from 'react';

function OutputPanel({ output }) {

  // 表示する出力の整形
  const formatValue = (value) => {
    if (Array.isArray(value)) {               // 配列なら
      return value.join(',');                 // カンマを要素間に入れる
    }
    return value;                             // 何もなければそのまま
  };

  // output の中身をループ処理できる形に変換
  // Object.entries()  key-valueペアを[key, value]形式の配列に変換し、それらを含む配列を返す
  const outentries = Object.entries(output);

  return (
    <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: '1rem', background: '#fafafa', color: '#111',   
      height: 140,
      overflow: 'auto',           // はみ出したらスクロール
      }}>  
      <div style={{ background: '#fafafa',
        overflow: 'auto' }}>  {/* 内容がコンテナからはみ出たら、スクロールできるように */}
        <h3>出力</h3>
        {/* mapメソッドで囲んで、配列の要素ごとにループ処理して埋め込み */}
        {/* varentries の [キー, 値] を分割代入して、key と value に代入 */}
        {outentries.map(([key, value]) => (
          <div key={value} style={{ marginLeft: '2rem', marginBottom: '0.2rem', fontWeight: 'bold'}}>
                {formatValue(value)}  {/* formatValueを呼んで、整形してから値を埋め込み */}
          </div>
        ))}
      </div>
    </div>
  );
}

export default OutputPanel;
