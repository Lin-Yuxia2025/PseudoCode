from flask import Flask, request, jsonify
import sys
from pathlib import Path

app = Flask(__name__)

# src/python-scriptsからimportできるように
root = Path(__file__).resolve().parent.parent
py_scripts = root / "src" / "python-scripts"
sys.path.append(str(py_scripts))

# parse.pyから関数parseを取得
import parse
parse_run = parse.parse

# Flaskが(このファイルで)起動していなければ(vercelで実行時)、/api/run-pythonで呼んでも、こっちは動かない
@app.route('/api/run-python', methods=['POST'])
def run_python():
    state = request.get_json()      # リクエストのJSON文字列をPythonの辞書に変換して取得

    result = parse_run(state)       # 呼び出し実行

    return jsonify(result)          # Pythonの辞書をJSON形式のレスポンスに変換して返す

# 直接実行(local)時のみ立ち上げて、import時は起動しない
if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5328)

