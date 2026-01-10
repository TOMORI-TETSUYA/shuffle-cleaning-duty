/* ========================================
  1. 設定データ (掃除箇所リスト)
  ======================================== */

// 掃除する場所と、必要な人数の設定
const cleaningConfig = [
{ name: "トイレ×2", capacity: 1 },                 // 必要人数: 1人
    { name: "リフレッシュルーム", capacity: 1 },         // 必要人数: 1人
    { name: "面談室", capacity: 1 },                     // 必要人数: 1人
    { name: "キッチン", capacity: 1 },                   // 必要人数: 1人
    { name: "1Fフロア(廊下込み)", capacity: 3 },         // 必要人数: 3人
    { name: "タオル洗濯", capacity: 1 },                 // 必要人数: 1人
    { name: "玄関", capacity: 1 },                       // 必要人数: 1人
    { name: "外(屋外)*中庭は無し", capacity: 2 },         // 必要人数: 2人
    { name: "外(太陽光パネル下)", capacity: 1 }          // 必要人数: 1人        
];

/* ========================================
  ★重要：担当NG（除外）設定リスト
  ======================================== */

// 「この場所」は「この人」を選ばない、という設定です。
// 左側に「掃除箇所名」、右側に「担当できない人の名前」を書きます。
// ※掃除箇所名は上の cleaningConfig と完全に一致させてください。
const ngConfig = {
    // 例：トイレには「宮城」「阿利」「名城」を選ばない
    "トイレ×2": ["宮城", "名城"],

    // 例：外(屋外)には「安藤」を選ばない（※必要ならコメントを外して使ってください）
    // "外(屋外)": ["安藤"],

    // 例：タオル洗濯には「玉城」と「大空」を選ばない
    // "タオル洗濯": ["玉城", "大空"],
    
    // ※設定がない場所は、誰でも選ばれます。
};


/* ========================================
  2. 画面読み込み時の処理
  ======================================== */
document.addEventListener('DOMContentLoaded', function() {
    const btn = document.getElementById('shuffleBtn');
    if (btn) {
        btn.addEventListener('click', runShuffle);
    }
});

/* ========================================
  3. シャッフル実行関数 (メインの処理)
  ======================================== */
function runShuffle() {
    
    // --- 手順1: HTMLから全メンバー名を取得 ---
    const listItems = document.querySelectorAll('#fixedMemberList li');
    
    // 名前を取得してリスト化（前後の空白は削除）
    let staffPool = Array.from(listItems).map(li => li.textContent.trim());

    if (staffPool.length === 0) {
        alert("エラー：メンバーが見つかりません。HTMLのリストを確認してください。");
        return;
    }

    // --- 手順2: 全員をシャッフル（ランダム並び替え） ---
    // まず全員をランダムに混ぜます
    shuffleArray(staffPool);

    // --- 手順3: テーブルの準備 ---
    const tbody = document.querySelector('#resultTable tbody');
    if (!tbody) return; 
    tbody.innerHTML = ""; // 前回の結果をクリア

    // --- 手順4: 割り当て処理（NGリストを考慮） ---
    
    // 場所ごとにループ処理
    cleaningConfig.forEach(location => {
        
        let assignedMembers = []; // この場所に決まった人を入れる箱
        
        // この場所の「NGメンバーリスト」を取得（設定がなければ空の配列）
        // ngConfig["トイレ×2"] のような形で取得します
        const ngList = ngConfig[location.name] || [];

        // --- 候補者選びのループ ---
        // staffPool（残っている人）の中から、条件に合う人を探します
        
        // staffPoolを先頭から順番にチェックしていく
        // (forループを逆回しにしているのは、途中で要素を削除(splice)してもインデックスがズレないようにするため)
        for (let i = 0; i < staffPool.length; i++) {
            
            // 必要な人数が集まったら探すのをやめる
            if (assignedMembers.length >= location.capacity) {
                break;
            }

            // 今チェックしている人
            const candidate = staffPool[i];

            // ★判定：この人は、この場所のNGリストに含まれているか？
            if (!ngList.includes(candidate)) {
                // NGに含まれていない（＝担当OK）なら
                
                // 1. 担当者に決定
                assignedMembers.push(candidate);
                
                // 2. 候補者リスト(staffPool)から削除する
                staffPool.splice(i, 1);
                
                // 3. 配列を削除してズレた分、インデックス(i)を1つ戻す
                i--; 
            }
            // NGリストに含まれている人は、スルーして次の人をチェックします
        }

        // --- 手順5: 行を作成して表示 ---
        const tr = document.createElement('tr');

        // 場所セル
        const tdPlace = document.createElement('td');
        tdPlace.textContent = location.name;
        tr.appendChild(tdPlace);

        // 名前セル
        const tdName = document.createElement('td');
        
        if (assignedMembers.length > 0) {
            tdName.textContent = assignedMembers.join('、 ');
        } else {
            // 誰も割り当てられなかった場合（全員がNGだった場合など）
            tdName.textContent = "（適任者なし・要調整）";
            tdName.style.color = "#e74c3c"; // 赤文字にする
        }
        tr.appendChild(tdName);

        tbody.appendChild(tr);
    });

    // --- 手順6: 最後に余った人の処理 ---
    if (staffPool.length > 0) {
        const tr = document.createElement('tr');
        
        const tdPlace = document.createElement('td');
        tdPlace.textContent = "予備・待機";
        tdPlace.style.backgroundColor = "#fffde7"; 
        tr.appendChild(tdPlace);
        
        const tdName = document.createElement('td');
        tdName.textContent = staffPool.join('、 ');
        tdName.style.backgroundColor = "#fffde7";
        tr.appendChild(tdName);

        tbody.appendChild(tr);
    }
}

/**
 * 配列をランダムに並び替える関数
 */
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}