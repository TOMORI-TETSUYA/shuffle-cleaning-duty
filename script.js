/* ========================================
  1. 設定データ (掃除箇所・人数・URL・NG)
  ======================================== */

/**
 * 掃除箇所の設定リスト
 * * name:     画面に表示される掃除場所の名前
 * * capacity: その場所に割り当てる人数
 * * url:      マニュアルのURL
 * * ★使い方:
 * url: "" のダブルクォーテーションの中にURLを貼り付けると、
 * その掃除箇所の横に「マニュアル」ボタンが表示されます。
 * URLが空欄の場合はボタンは表示されません。
 */
const cleaningConfig = [
    { 
        name: "トイレ(2ヵ所)", 
        capacity: 1,      // 必要人数: 1人
        url: "https://docs.google.com/document/d/1d9M6AsLvhnZlsUbO__Lh2InYCsoxjx16uYjQ0IudrpE/edit?usp=drive_link"           // ←ここにURLを入力 (例: "https://docs.google.com/...")
    },
    
    { 
        name: "リフレッシュルーム", 
        capacity: 1,      // 必要人数: 1人
        url: "https://docs.google.com/document/d/1dZvblus_RmpP5nOO_fD9WbUtDKZ23VnlPKeVDWV4U7s/edit?usp=drive_link" 
    },
    
    { 
        name: "面談室", 
        capacity: 1,      // 必要人数: 1人
        url: "https://docs.google.com/document/d/1dZvblus_RmpP5nOO_fD9WbUtDKZ23VnlPKeVDWV4U7s/edit?usp=drive_link" 
    },
    
    { 
        name: "キッチン", 
        capacity: 1,      // 必要人数: 1人
        url: "https://docs.google.com/document/d/142Cy7g8hoHZS01VHgTX-3EHJnRQt9fZi48eDlqXmjfY/edit?usp=drive_link" 
    },
    
    { 
        name: "1Fフロア(廊下込み)", 
        capacity: 3,      // 必要人数: 3人
        url: "https://docs.google.com/document/d/1dZvblus_RmpP5nOO_fD9WbUtDKZ23VnlPKeVDWV4U7s/edit?usp=drive_link" 
    },
    
    { 
        name: "タオル洗濯", 
        capacity: 1,      // 必要人数: 1人
        url: "https://docs.google.com/document/d/1z327jhEH6gfCnCOz7K_kjJOygrbFDdDe/edit?usp=drive_link&ouid=104564937120962887372&rtpof=true&sd=true" 
    },
    
    { 
        name: "玄関", 
        capacity: 1,      // 必要人数: 1人
        url: "https://docs.google.com/document/d/16ZmweC387SXGCYYCWggILHcnkOfaqDakUeYgNyi7I54/edit?usp=drive_link" 
    },
    
    { 
        name: "外(屋外)*中庭無し", 
        capacity: 2,      // 必要人数: 3人
        url: "https://docs.google.com/document/d/1ZSseBk10j3CD00gfsjXfSEGeSJbwbEYpEVUOmVWxynE/edit?usp=drive_link" 
    },

    { 
        name: "外(太陽光パネル下)", 
        capacity: 1,      // 必要人数: 1人
        url: "https://docs.google.com/document/d/1sYhX8XCx311eaC-aZhY6buF5fQxhlxe4pAFjmZLLa-U/edit?usp=drive_link" 
    }
];

// ※掃除箇所の必要人数の合計は 13名 です。
// 現在のメンバーは12名なので、最後の箇所は「適任者なし」等の表示になる場合があります。


/**
 * NG設定（この場所にはこの人を選ばない）
 * "場所名": ["名前", "名前"] の形式で書きます。
 * ※場所名は上の cleaningConfig の name と完全に一致させてください。
 */
const ngConfig = {
    // 例：トイレには以下の3名を選ばない設定
    "トイレ(2ヵ所)": ["宮城", "名城"],

    // 追加したい場合は、下の行の // を消して書き換えてください
    // "外(屋外)*中庭無し": ["安藤"], 
};


/* ========================================
  2. 初期化・イベント設定
  ======================================== */

// ページ読み込み完了時に実行される処理
document.addEventListener('DOMContentLoaded', function() {
    
    // (1) シャッフルボタンの設定
    const shuffleBtn = document.getElementById('shuffleBtn');
    if (shuffleBtn) {
        shuffleBtn.addEventListener('click', handleShuffleClick);
    }

    // (2) URLコピーボタンの設定
    const copyBtn = document.getElementById('copyUrlBtn');
    if (copyBtn) {
        copyBtn.addEventListener('click', copyUrlToClipboard);
    }

    // (3) リセットボタンの設定
    const resetBtn = document.getElementById('resetBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetShuffle);
    }

    // (4) 共有URLチェック（リンクを開いたかどうかの確認）
    checkUrlData();
});


/* ========================================
  3. メイン処理フロー
  ======================================== */

/**
 * 【A】シャッフルボタンクリック時の処理
 * 名前取得 → シャッフル → 表示 → URL固定化
 */
function handleShuffleClick() {
    // HTMLから名前リストを取得
    const staffPool = getStaffListFromHtml();
    if (!staffPool) return;

    // シャッフル実行
    shuffleArray(staffPool);

    // 画面に表を描画
    assignAndRender(staffPool);

    // URLを書き換えて結果を固定し、ボタンを切り替える
    updateUrlAndLock(staffPool);
}

/**
 * 【B】ページ読み込み時の確認処理
 * URLにデータがあれば復元して固定モードにする
 */
function checkUrlData() {
    // URLのパラメータ(?以降)を取得
    const urlParams = new URLSearchParams(window.location.search);
    const data = urlParams.get('order');

    if (data) {
        try {
            // 保存されたデータを復元
            const savedOrder = decodeURIComponent(data).split(',');
            
            // 復元した順序で描画
            assignAndRender(savedOrder);

            // 固定モードへ切り替え
            switchModeToFixed();

        } catch (e) {
            console.error("データの復元に失敗しました", e);
        }
    }
}

/**
 * 【C】リセットボタンクリック時の処理
 * 固定を解除して初期状態に戻す
 */
function resetShuffle() {
    // 確認メッセージ
    if(!confirm("現在の結果をクリアして、シャッフル画面に戻りますか？")) {
        return; 
    }

    // URLを元に戻す
    const cleanUrl = window.location.pathname;
    window.history.pushState({}, '', cleanUrl);

    // テーブルをクリア
    const tbody = document.querySelector('#resultTable tbody');
    tbody.innerHTML = '<tr><td colspan="2" style="text-align:center;color:#999;">ボタンを押すと結果が表示されます</td></tr>';

    // ボタン表示を「シャッフル」に戻す
    document.getElementById('shareArea').classList.add('hidden');
    document.getElementById('shuffleBtn').style.display = 'block';
}


/* ========================================
  4. 表示切り替え・URL操作
  ======================================== */

/**
 * 結果確定後の処理：URL更新 ＆ 画面ロック
 */
function updateUrlAndLock(staffList) {
    // 配列を文字列に変換してURLパラメータを作成
    const orderString = encodeURIComponent(staffList.join(','));
    const newUrl = window.location.pathname + '?order=' + orderString;
    
    // URLを書き換え（リロードはしない）
    window.history.pushState({path: newUrl}, '', newUrl);

    // ボタン切り替え
    switchModeToFixed();
}

/**
 * ボタン表示を「固定モード」にする
 */
function switchModeToFixed() {
    const shuffleBtn = document.getElementById('shuffleBtn');
    const shareArea = document.getElementById('shareArea');

    if(shuffleBtn) shuffleBtn.style.display = 'none'; // シャッフルボタン隠す
    if(shareArea) shareArea.classList.remove('hidden'); // 共有ボタン表示
}

/**
 * URLをクリップボードにコピー
 */
function copyUrlToClipboard() {
    const url = window.location.href;
    // コピー機能実行
    navigator.clipboard.writeText(url).then(() => {
        alert("URLをコピーしました！\nこのURLを送れば、誰でも同じ結果を見られます。");
    }).catch(err => {
        // コピー失敗時の予備処理
        prompt("以下のURLをコピーしてください:", url);
    });
}


/* ========================================
  5. 割り当てロジック (Assign Logic)
  ======================================== */

/**
 * メンバーリストの順序に従って、掃除箇所を割り当てて表示する関数
 */
function assignAndRender(staffList) {
    let currentPool = [...staffList]; // リストのコピーを作成
    
    const tbody = document.querySelector('#resultTable tbody');
    if (!tbody) return; 
    tbody.innerHTML = ""; // テーブルをクリア

    // 設定された掃除箇所ごとにループ処理
    cleaningConfig.forEach(location => {
        let assignedMembers = [];
        const ngList = ngConfig[location.name] || [];

        // メンバープールから候補者を探す
        for (let i = 0; i < currentPool.length; i++) {
            // 定員に達したら終了
            if (assignedMembers.length >= location.capacity) break;

            const candidate = currentPool[i];
            
            // NGチェック（その場所がNGでなければ採用）
            if (!ngList.includes(candidate)) {
                assignedMembers.push(candidate);
                currentPool.splice(i, 1); // プールから削除
                i--; // インデックス調整
            }
        }

        // --- 行(tr)の作成 ---
        const tr = document.createElement('tr');
        
        // ★掃除箇所セル（URLがあれば「マニュアル」リンクを追加）
        const tdPlace = document.createElement('td');
        
        // 1. まず場所の名前を表示
        const textNode = document.createTextNode(location.name);
        tdPlace.appendChild(textNode);

        // 2. URL設定がある場合のみ、横にマニュアルリンクを追加
        if (location.url && location.url !== "") {
            
            // リンク要素を作成 (<a href="..." target="_blank">マニュアル</a>)
            const link = document.createElement('a');
            link.href = location.url;       // 設定したURL
            link.textContent = "マニュアル"; // 表示する文字
            link.target = "_blank";         // 新しいタブで開く
            link.rel = "noopener noreferrer"; // セキュリティ対策
            link.className = "manual-link"; // CSS用クラス(見た目を整える)
            
            // セルに追加
            tdPlace.appendChild(link);
        }
        
        tr.appendChild(tdPlace);

        // ★担当者セル
        const tdName = document.createElement('td');
        if (assignedMembers.length > 0) {
            tdName.textContent = assignedMembers.join('、 ');
        } else {
            // 人数が足りない場合の表示
            tdName.textContent = "（適任者なし・要調整）";
            tdName.style.color = "#e74c3c";
        }
        tr.appendChild(tdName);
        
        tbody.appendChild(tr);
    });

    // --- 余った人の表示（予備枠） ---
    if (currentPool.length > 0) {
        const tr = document.createElement('tr');
        const tdPlace = document.createElement('td');
        tdPlace.textContent = "予備・待機";
        tdPlace.style.backgroundColor = "#fffde7"; 
        tr.appendChild(tdPlace);
        
        const tdName = document.createElement('td');
        tdName.textContent = currentPool.join('、 ');
        tdName.style.backgroundColor = "#fffde7";
        tr.appendChild(tdName);
        tbody.appendChild(tr);
    }
}


/* ========================================
  6. ユーティリティ関数
  ======================================== */

/**
 * HTMLリストから名前を取得する関数
 */
function getStaffListFromHtml() {
    const listItems = document.querySelectorAll('#fixedMemberList li');
    if (listItems.length === 0) return null;
    return Array.from(listItems).map(li => li.textContent.trim());
}

/**
 * 配列をランダムに混ぜる関数
 */
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}