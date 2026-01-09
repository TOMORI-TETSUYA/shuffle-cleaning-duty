/* ========================================
  1. 設定データ (掃除箇所リスト)
  ======================================== */

// ここに掃除する場所と、必要な人数を設定します
// capacity の数字を変えると、割り当てる人数を変更できます
const cleaningConfig = [
    { name: "トイレ×2", capacity: 1 },                 // 必要人数: 1人
    { name: "リフレッシュルーム", capacity: 1 },         // 必要人数: 最大2人
    { name: "面談室", capacity: 1 },                     // 必要人数: 1人
    { name: "キッチン", capacity: 1 },                   // 必要人数: 1人
    { name: "1Fフロア(廊下込み)", capacity: 3 },         // 必要人数: 3人
    { name: "タオル洗濯", capacity: 1 },                 // 必要人数: 1人
    { name: "玄関", capacity: 1 },                       // 必要人数: 1人
    { name: "外(屋外)*中庭無し", capacity: 2 },                   // 必要人数: 2人
    { name: "外(太陽光パネル下)", capacity: 1 }          // 必要人数: 1人
];

/* ========================================
  2. 画面読み込み時の処理
  ======================================== */

// HTMLの準備がすべて整ったら実行されるブロック
document.addEventListener('DOMContentLoaded', function() {
    
    // HTMLにある「シャッフルボタン」を探して取得します
    const btn = document.getElementById('shuffleBtn');
    
    // もしボタンが見つかったら、「クリックされたら runShuffle を実行する」という設定をします
    if (btn) {
        btn.addEventListener('click', runShuffle);
    }
});

/* ========================================
  3. シャッフル実行関数 (メインの処理)
  ======================================== */
function runShuffle() {
    
    // --- 手順1: メンバー名簿の取得 ---
    
    // HTMLのリスト(ul#fixedMemberList)の中にある、すべての li (名前)を取得します
    const listItems = document.querySelectorAll('#fixedMemberList li');
    
    // 取得した要素から、文字（名前）だけを取り出して新しい配列（リスト）を作ります
    // .trim() は名前の前後の無駄な空白を削除する命令です
    let staffList = Array.from(listItems).map(li => li.textContent.trim());

    // 名前が1つもない場合はエラーとして処理を止めます
    if (staffList.length === 0) {
        alert("エラー：メンバーが見つかりません。HTMLのリストを確認してください。");
        return;
    }

    // --- 手順2: 名前のシャッフル（抽選） ---
    
    // 「フィッシャー–イェーツ」というアルゴリズムで、配列の中身をランダムにかき混ぜます
    for (let i = staffList.length - 1; i > 0; i--) {
        // 0からi番目までの間でランダムな数字(j)を選びます
        const j = Math.floor(Math.random() * (i + 1));
        // i番目の人と、ランダムに選ばれたj番目の人を入れ替えます
        [staffList[i], staffList[j]] = [staffList[j], staffList[i]];
    }

    // --- 手順3: テーブルの準備 ---
    
    // 結果を表示するテーブルの中身(tbody)を取得します
    const tbody = document.querySelector('#resultTable tbody');
    if (!tbody) return; // テーブルがなければ終了
    
    // 前回表示されていた結果をすべて消して空っぽにします
    tbody.innerHTML = ""; 

    // --- 手順4: 各掃除場所への割り当て ---
    
    let currentStaffIndex = 0; // いま名簿の何番目の人を見ているか（カウンター）

    // 設定しておいた掃除箇所リスト(cleaningConfig)を上から順に処理します
    cleaningConfig.forEach(location => {
        
        let assignedMembers = []; // この場所に配属される人の名前を入れる箱

        // その場所に必要な人数(capacity)の回数だけ繰り返します
        for (let i = 0; i < location.capacity; i++) {
            // まだ名簿に人が残っていれば
            if (currentStaffIndex < staffList.length) {
                // その人を配属リストに追加します
                assignedMembers.push(staffList[currentStaffIndex]);
                // カウンターを1つ進めます（次の人へ）
                currentStaffIndex++;
            }
        }

        // --- 手順5: テーブルに行を追加して表示 ---
        
        // 新しい行(tr)を作ります
        const tr = document.createElement('tr');

        // 左側のセル（掃除箇所名）を作って設定
        const tdPlace = document.createElement('td');
        tdPlace.textContent = location.name;
        tr.appendChild(tdPlace); // 行に追加

        // 右側のセル（担当者名）を作って設定
        const tdName = document.createElement('td');
        
        if (assignedMembers.length > 0) {
            // 担当者がいる場合は、「、」でつないで表示（例: 又吉、比嘉）
            tdName.textContent = assignedMembers.join('、 ');
        } else {
            // 人手が足りずに割り当てられなかった場合
            tdName.textContent = "（担当者なし）";
            tdName.style.color = "#ccc"; // 文字色を薄くする
        }
        tr.appendChild(tdName); // 行に追加

        // 完成した行をテーブル本体に追加して画面に表示させます
        tbody.appendChild(tr);
    });

    // --- 手順6: もし人が余った場合の処理 ---
    
    // まだ割り当てられていない人が残っている場合
    if (currentStaffIndex < staffList.length) {
        
        // 残りのメンバー全員の名前を取得します
        const remainingMembers = staffList.slice(currentStaffIndex);
        
        // 余り用の行を作ります
        const tr = document.createElement('tr');
        
        // 場所名セル（予備）
        const tdPlace = document.createElement('td');
        tdPlace.textContent = "予備・待機";
        tdPlace.style.backgroundColor = "#fffde7"; // 背景を薄い黄色にして目立たせる
        tr.appendChild(tdPlace);
        
        // 名前セル（余った人たち）
        const tdName = document.createElement('td');
        tdName.textContent = remainingMembers.join('、 ');
        tdName.style.backgroundColor = "#fffde7";
        tr.appendChild(tdName);

        // テーブルの一番下に追加します
        tbody.appendChild(tr);
    }
}