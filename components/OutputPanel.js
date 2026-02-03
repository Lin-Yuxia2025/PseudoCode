import React from 'react';

function OutputPanel({ output }) {

  // 表示する出力の整形
  const formatValue = (value) => {
    if (Array.isArray(value)) {               // 配列なら
      return value.join(',');                 // カンマを要素間に入れる
    }
    return value;                             // 何もなければそのまま
  };


  return (
    <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: '1rem', background: '#fafafa', color: '#111',   
      height: 140,
      overflow: 'auto',           // はみ出したらスクロール
      }}>  
      <div style={{ background: '#fafafa',
        overflow: 'auto' }}>  {/* 内容がコンテナからはみ出たら、スクロールできるように */}
        <h3>出力</h3>
        {/* mapメソッドで囲んで、配列の要素ごとにループ処理して埋め込み */}
        {output.map((value, index) => (
          <div key={index} style={{ marginLeft: '2rem', marginBottom: '0.2rem', fontWeight: 'bold'}}>
                {formatValue(value)}  {/* formatValueを呼んで、整形してから値を埋め込み */}
          </div>
        ))}
      </div>
    </div>
  );
}

export default OutputPanel;
