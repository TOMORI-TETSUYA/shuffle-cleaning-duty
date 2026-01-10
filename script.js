/* ========================================
  1. 設定データ (掃除箇所リスト)
  ======================================== */

// 掃除する場所と、必要な人数の設定
const cleaningConfig = [
    { name: "トイレ(2ヵ所)", capacity: 1 },              // 必要人数: 1人
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
  2. 初期化・イベント設定
  ======================================== */

// HTMLの読み込みが完了したら実行されるブロック
document.addEventListener('DOMContentLoaded', function() {
    
    // シャッフルボタンを取得してクリックイベントを設定
    const btn = document.getElementById('shuffleBtn');
    if (btn) {
        btn.addEventListener('click', handleShuffleClick);
    }

    // ★重要: ページを開いた瞬間に、URLに保存されたデータがあるかチェックする
    // これにより、共有されたURLを開いたときに同じ結果を表示できます
    checkUrlData();
});


/* ========================================
  3. メイン処理フロー
  ======================================== */

/**
 * 【ボタンクリック時】の処理
 * 1. HTMLから名前を取得
 * 2. シャッフル
 * 3. 画面に表示
 * 4. URLを書き換え（共有用）
 */
function handleShuffleClick() {
    // 1. HTMLリストから全メンバー名を取得
    const staffPool = getStaffListFromHtml();
    if (!staffPool) return; // エラーなら中断

    // 2. メンバー配列をランダムに並び替え
    shuffleArray(staffPool);

    // 3. 並び替えた順序で掃除箇所に割り当てて表示
    assignAndRender(staffPool);

    // 4. 結果（並び順）をURLに保存して、共有できるようにする
    saveResultToUrl(staffPool);
}

/**
 * 【ページ読み込み時】URLの確認処理
 * URLに「?order=...」というデータがあれば、それを復元して表示します。
 */
function checkUrlData() {
    // 現在のURLからパラメータ部分(?以降)を取得
    const urlParams = new URLSearchParams(window.location.search);
    const data = urlParams.get('order'); // orderという名前のデータを取得

    if (data) {
        // データがある場合（＝誰かが共有したURLを開いた場合）
        try {
            // URL用に変換されていた日本語を元に戻し、カンマで区切って配列にする
            const savedOrder = decodeURIComponent(data).split(',');
            
            // 保存されていた順序のまま、割り当て処理を実行（シャッフルはしない）
            assignAndRender(savedOrder);

            // 共有モードであることを分かりやすくするため、ボタンの見た目を変える
            const btn = document.getElementById('shuffleBtn');
            if(btn) {
                btn.textContent = "⚠ 共有された固定結果を表示中（クリックで再抽選）";
                btn.style.backgroundColor = "#e67e22"; // ボタンをオレンジ色に変更
            }

        } catch (e) {
            console.error("データの読み込みに失敗しました", e);
        }
    }
}


/* ========================================
  4. 割り当てロジック (Assign Logic)
  ======================================== */

/**
 * 渡されたメンバーリストの順序に従って、掃除箇所を割り当て、表を描画する関数
 * @param {Array} staffList - 順序決定済みのメンバー配列
 */
function assignAndRender(staffList) {
    
    // 元の配列を壊さないようにコピーを作成して作業用プールにする
    let currentPool = [...staffList];

    // 結果表示用のテーブル本体(tbody)を取得し、中身をクリアする
    const tbody = document.querySelector('#resultTable tbody');
    if (!tbody) return; 
    tbody.innerHTML = ""; 

    // 設定データ(cleaningConfig)にある場所を順番に処理
    cleaningConfig.forEach(location => {
        let assignedMembers = []; // この場所に決まった人リスト
        
        // この場所のNG設定を取得（なければ空の配列）
        const ngList = ngConfig[location.name] || [];

        // --- 候補者選びのループ ---
        // プールにいる人を先頭から順にチェック
        for (let i = 0; i < currentPool.length; i++) {
            
            // 定員に達したら終了
            if (assignedMembers.length >= location.capacity) break;

            const candidate = currentPool[i]; // 候補者

            // ★NGチェック: その人がNGリストに入っていなければ採用
            if (!ngList.includes(candidate)) {
                
                // 採用リストに追加
                assignedMembers.push(candidate);
                
                // プールから削除（もう他の場所には割り当たらない）
                currentPool.splice(i, 1);
                
                // 配列を削除してズレた分、インデックスを戻す
                i--; 
            }
        }

        // --- テーブルに行を追加 ---
        const tr = document.createElement('tr');
        
        // 場所名のセル
        const tdPlace = document.createElement('td');
        tdPlace.textContent = location.name;
        tr.appendChild(tdPlace);

        // 担当者名のセル
        const tdName = document.createElement('td');
        if (assignedMembers.length > 0) {
            // 名前を「、」区切りで表示
            tdName.textContent = assignedMembers.join('、 ');
        } else {
            // 誰も決まらなかった場合
            tdName.textContent = "（適任者なし・要調整）";
            tdName.style.color = "#e74c3c"; // 赤文字
        }
        tr.appendChild(tdName);
        
        tbody.appendChild(tr);
    });

    // --- 最後に余った人の処理 ---
    if (currentPool.length > 0) {
        const tr = document.createElement('tr');
        
        const tdPlace = document.createElement('td');
        tdPlace.textContent = "予備・待機";
        tdPlace.style.backgroundColor = "#fffde7"; // 背景を薄い黄色に
        tr.appendChild(tdPlace);
        
        const tdName = document.createElement('td');
        tdName.textContent = currentPool.join('、 ');
        tdName.style.backgroundColor = "#fffde7";
        tr.appendChild(tdName);
        
        tbody.appendChild(tr);
    }
}


/* ========================================
  5. ユーティリティ関数（便利な道具たち）
  ======================================== */

/**
 * 結果（メンバーの並び順）をURLパラメータとして保存する関数
 */
function saveResultToUrl(staffList) {
    // メンバー名をカンマ区切りにし、日本語をURLで使える文字コードに変換
    // （例: "佐藤,鈴木" → "%E4%BD%90%E8%97%A4,%E9%88%B4%E6%9C%A8"）
    const orderString = encodeURIComponent(staffList.join(','));
    
    // 現在のURLの後ろに「?order=...」を追加した新しいURLを作成
    const newUrl = window.location.pathname + '?order=' + orderString;
    
    // ブラウザの履歴を変更（画面のリロードはせずにURLだけ変える技術）
    window.history.pushState({path: newUrl}, '', newUrl);
}

/**
 * HTMLのリストからメンバー名を取得する関数
 */
function getStaffListFromHtml() {
    const listItems = document.querySelectorAll('#fixedMemberList li');
    if (listItems.length === 0) {
        alert("エラー：メンバーが見つかりません。");
        return null;
    }
    // テキストを取り出して配列にして返す
    return Array.from(listItems).map(li => li.textContent.trim());
}

/**
 * 配列をランダムにシャッフルする関数
 * （フィッシャー–イェーツのシャッフル アルゴリズム）
 */
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}