/* ========================================
  1. 設定データ (掃除箇所リスト)
  ======================================== */

// 掃除する場所と、必要な人数の設定
const cleaningConfig = [
    // ★重要: ここの名前("トイレ×2")と、後述の除外ロジックの名前を一致させています
{ name: "トイレ×2", capacity: 1 },                 // 必要人数: 1人
    { name: "リフレッシュルーム", capacity: 1 },         // 必要人数: 1人
    { name: "面談室", capacity: 1 },                     // 必要人数: 1人
    { name: "キッチン", capacity: 1 },                   // 必要人数: 1人
    { name: "1Fフロア(廊下込み)", capacity: 3 },         // 必要人数: 3人
    { name: "タオル洗濯", capacity: 1 },                 // 必要人数: 1人
    { name: "玄関", capacity: 1 },                       // 必要人数: 1人
    { name: "外(屋外)*中庭は無し", capacity: 2 },                   // 必要人数: 2人
    { name: "外(太陽光パネル下)", capacity: 1 }          // 必要人数: 1人      
];

// ★追加設定: トイレ掃除を担当しない（選択できない）メンバーの名前
// ※HTMLのリストにある名前と完全に一致させてください（スペースなどに注意）
const excludedFromToilet = ["宮城", "阿利", "名城"];

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
    let allStaff = Array.from(listItems).map(li => li.textContent.trim());

    if (allStaff.length === 0) {
        alert("エラー：メンバーが見つかりません。HTMLのリストを確認してください。");
        return;
    }

    // --- 手順2: グループ分け（トイレ担当NGかどうか） ---
    
    // Aグループ: トイレ掃除ができる人（全メンバーからNGの人を除外）
    // .filter は条件に合う人だけを残す命令です
    let groupForToilet = allStaff.filter(name => !excludedFromToilet.includes(name));
    
    // Bグループ: トイレ掃除ができない人（NGリストに含まれる人）
    let groupNoToilet = allStaff.filter(name => excludedFromToilet.includes(name));

    // Aグループ（トイレOK組）をシャッフルします
    shuffleArray(groupForToilet);

    // --- 手順3: テーブルの準備 ---
    const tbody = document.querySelector('#resultTable tbody');
    if (!tbody) return; 
    tbody.innerHTML = ""; // 前回の結果をクリア

    // --- 手順4: 割り当て処理 ---
    
    // 「残りの全メンバー」を管理するための変数（あとで合流させます）
    let mainPool = null;

    cleaningConfig.forEach(location => {
        
        let assignedMembers = []; // この場所に配属される人のリスト

        // ★判定: 今の場所は「トイレ」かどうか？
        if (location.name === "トイレ×2") {
            // --- トイレの場合の処理 ---
            
            // 定員数分だけ「Aグループ（トイレOK）」から取り出す
            for (let i = 0; i < location.capacity; i++) {
                if (groupForToilet.length > 0) {
                    // Aグループの先頭から1人抜き出して割り当て
                    assignedMembers.push(groupForToilet.shift());
                }
            }
            
        } else {
            // --- トイレ以外の場合の処理 ---
            
            // ★重要: まだ合流していなければ、ここで合流させる
            if (mainPool === null) {
                // 「トイレ担当にならなかった残りのAグループ」と「Bグループ」を合体
                mainPool = groupForToilet.concat(groupNoToilet);
                
                // 合体した全員をもう一度シャッフルする（公平にするため）
                shuffleArray(mainPool);
            }

            // 合流した「mainPool」から定員数分を取り出す
            for (let i = 0; i < location.capacity; i++) {
                if (mainPool.length > 0) {
                    assignedMembers.push(mainPool.shift());
                }
            }
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
            tdName.textContent = "（担当者なし）";
            tdName.style.color = "#ccc";
        }
        tr.appendChild(tdName);

        tbody.appendChild(tr);
    });

    // --- 手順6: 人が余った場合の処理 ---
    
    // 合流後のリスト(mainPool)にまだ人が残っているか確認
    // ※トイレだけで全員使い切った場合はmainPoolがnullのままなのでチェックが必要
    let remainingMembers = [];
    if (mainPool !== null && mainPool.length > 0) {
        remainingMembers = mainPool;
    } else if (mainPool === null && groupForToilet.length > 0) {
        // 万が一トイレだけで終わって合流しなかった場合の残り
        remainingMembers = groupForToilet.concat(groupNoToilet);
    }

    if (remainingMembers.length > 0) {
        const tr = document.createElement('tr');
        
        const tdPlace = document.createElement('td');
        tdPlace.textContent = "予備・待機";
        tdPlace.style.backgroundColor = "#fffde7"; 
        tr.appendChild(tdPlace);
        
        const tdName = document.createElement('td');
        tdName.textContent = remainingMembers.join('、 ');
        tdName.style.backgroundColor = "#fffde7";
        tr.appendChild(tdName);

        tbody.appendChild(tr);
    }
}

/**
 * 配列をランダムに並び替える関数（フィッシャー–イェーツのシャッフル）
 * 何度も使うので関数として切り出しました
 */
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}