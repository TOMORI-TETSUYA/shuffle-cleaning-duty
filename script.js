/* ========================================
  1. マニュアルURLの設定 (JavaScript内で管理)
  ======================================== */

/**
 * ★URL設定エリア
 * 掃除箇所の名前とURLをここで紐づけます。
 * 画面でURL入力欄を削除したため、URLを変えたい場合は
 * 直接このコードの "" の中を書き換えてください。
 * * 左側: 掃除箇所の名前（管理画面で登録した名前と完全に一致させること）
 * 右側: リンク先のURL
 */
const manualLinks = {
    "トイレ(2ヵ所)": "https://docs.google.com/document/d/1d9M6AsLvhnZlsUbO__Lh2InYCsoxjx16uYjQ0IudrpE/edit?usp=drive_link",  // 例: "https://docs.google.com/..."
    "リフレッシュルーム": "https://docs.google.com/document/d/1dZvblus_RmpP5nOO_fD9WbUtDKZ23VnlPKeVDWV4U7s/edit?usp=drive_link",
    "面談室": "https://docs.google.com/document/d/1dZvblus_RmpP5nOO_fD9WbUtDKZ23VnlPKeVDWV4U7s/edit?usp=drive_link",
    "キッチン": "https://docs.google.com/document/d/142Cy7g8hoHZS01VHgTX-3EHJnRQt9fZi48eDlqXmjfY/edit?usp=drive_link",
    "1Fフロア(廊下込み)": "https://docs.google.com/document/d/1dZvblus_RmpP5nOO_fD9WbUtDKZ23VnlPKeVDWV4U7s/edit?usp=drive_link",
    "タオル洗濯": "https://docs.google.com/document/d/1z327jhEH6gfCnCOz7K_kjJOygrbFDdDe/edit?usp=drive_link&ouid=100143212392680874740&rtpof=true&sd=true",
    "玄関": "https://docs.google.com/document/d/16ZmweC387SXGCYYCWggILHcnkOfaqDakUeYgNyi7I54/edit?usp=drive_link",
    "外(屋外)*中庭無し": "https://docs.google.com/document/d/1ZSseBk10j3CD00gfsjXfSEGeSJbwbEYpEVUOmVWxynE/edit?usp=drive_link",
    "外(太陽光パネル下)": "https://docs.google.com/document/d/1sYhX8XCx311eaC-aZhY6buF5fQxhlxe4pAFjmZLLa-U/edit?usp=drive_link"
};


/* ========================================
  2. 初期データの定義 (初めて使う時用)
  ======================================== */

// 初期メンバーリスト
const defaultStaffList = [
    "又吉", "友利", "礼夫", "安藤", 
    "砂川", "玉城", "大空", "真栄城", 
    "宮城", "名城", "新里", "阿利"
];

// 初期掃除箇所リスト (名前と定員数のみ)
const defaultConfigList = [
    { name: "トイレ(2ヵ所)", capacity: 1 },
    { name: "リフレッシュルーム", capacity: 1 },
    { name: "面談室", capacity: 1 },
    { name: "キッチン", capacity: 1 },
    { name: "1Fフロア(廊下込み)", capacity: 3 },
    { name: "タオル洗濯", capacity: 1 },
    { name: "玄関", capacity: 1 },
    { name: "外(屋外)*中庭無し", capacity: 2 },
    { name: "外(太陽光パネル下)", capacity: 1 }
];

// 初期NG設定リスト
const defaultNgList = [
    { location: "トイレ(2ヵ所)", staff: "宮城" },
    { location: "トイレ(2ヵ所)", staff: "名城" }
];


/* ========================================
  3. 状態管理変数 (State)
  ======================================== */
let staffList = [];       // 現在のメンバーリスト
let cleaningConfig = [];  // 現在の掃除箇所リスト
let ngList = [];          // 現在のNGリスト


/* ========================================
  4. 起動時の処理
  ======================================== */
document.addEventListener('DOMContentLoaded', function() {
    
    // (A) ブラウザ保存データ、または初期データを読み込む
    loadData();

    // (B) 画面を表示する
    renderAll();

    // (C) ボタン操作の設定を行う
    setupEventListeners();

    // (D) 共有URLを開いた場合の処理
    checkUrlData();
});


/* ========================================
  5. データ保存・読み込み (Local Storage)
  ======================================== */

/**
 * データを読み込む関数
 * 保存データがなければ初期データを使います。
 */
function loadData() {
    const storedStaff = localStorage.getItem('cleaning_staffList');
    if (storedStaff) {
        staffList = JSON.parse(storedStaff);
    } else {
        staffList = [...defaultStaffList];
    }

    const storedConfig = localStorage.getItem('cleaning_config');
    if (storedConfig) {
        cleaningConfig = JSON.parse(storedConfig);
    } else {
        cleaningConfig = JSON.parse(JSON.stringify(defaultConfigList));
    }

    const storedNg = localStorage.getItem('cleaning_ngList');
    if (storedNg) {
        ngList = JSON.parse(storedNg);
    } else {
        ngList = JSON.parse(JSON.stringify(defaultNgList));
    }
}

/**
 * 現在のデータをブラウザに保存する関数
 */
function saveData() {
    localStorage.setItem('cleaning_staffList', JSON.stringify(staffList));
    localStorage.setItem('cleaning_config', JSON.stringify(cleaningConfig));
    localStorage.setItem('cleaning_ngList', JSON.stringify(ngList));
}

/**
 * 全データを初期化する関数
 */
function resetAllData() {
    if(!confirm("本当に全てのデータを初期状態に戻しますか？\n追加したメンバーや設定も消えます。")) return;
    
    localStorage.removeItem('cleaning_staffList');
    localStorage.removeItem('cleaning_config');
    localStorage.removeItem('cleaning_ngList');
    location.reload(); 
}


/* ========================================
  6. 画面描画 (Rendering)
  ======================================== */

/**
 * 画面の全要素を最新データで更新する
 */
function renderAll() {
    renderMainViewMember(); // メイン画面メンバー
    renderAdminStaff();     // 管理画面メンバー
    renderAdminLocation();  // 管理画面掃除場所
    renderAdminNg();        // 管理画面NG設定
    
    // NG設定のプルダウンの中身を更新
    updateNgSelectOptions(); 
}

// メイン画面のメンバー表示
function renderMainViewMember() {
    const ul = document.getElementById('displayMemberList');
    ul.innerHTML = "";
    staffList.forEach(name => {
        const li = document.createElement('li');
        li.textContent = name;
        ul.appendChild(li);
    });
    document.getElementById('memberCountTitle').textContent = `対象メンバー（計${staffList.length}名）`;
}

// 管理画面：担当者リスト
function renderAdminStaff() {
    const ul = document.getElementById('adminStaffList');
    ul.innerHTML = "";
    staffList.forEach((name, index) => {
        const li = document.createElement('li');
        li.innerHTML = `<span>${name}</span> <button class="btn-del" onclick="deleteStaff(${index})">削除</button>`;
        ul.appendChild(li);
    });
}

// 管理画面：掃除箇所リスト
function renderAdminLocation() {
    const ul = document.getElementById('adminLocList');
    ul.innerHTML = "";
    cleaningConfig.forEach((loc, index) => {
        const li = document.createElement('li');
        
        // コード内の manualLinks にURLがあるか確認
        const hasUrl = manualLinks[loc.name] && manualLinks[loc.name] !== "";
        let info = `<b>${loc.name}</b> (${loc.capacity}人)`;
        
        // URLがあれば「Linkあり」と表示（あくまで管理画面上の目印）
        if(hasUrl) {
            info += ` <span style="font-size:11px; color:#3498db;">[Link設定あり]</span>`;
        }
        
        li.innerHTML = `<span>${info}</span> <button class="btn-del" onclick="deleteLocation(${index})">削除</button>`;
        ul.appendChild(li);
    });
}

// 管理画面：NG設定リスト
function renderAdminNg() {
    const ul = document.getElementById('adminNgList');
    ul.innerHTML = "";
    ngList.forEach((item, index) => {
        const li = document.createElement('li');
        li.innerHTML = `<span>【${item.location}】NG: ${item.staff}</span> <button class="btn-del" onclick="deleteNg(${index})">解除</button>`;
        ul.appendChild(li);
    });
}

// NG設定用のプルダウン選択肢の更新
function updateNgSelectOptions() {
    // 場所の選択肢
    const locSelect = document.getElementById('ngLocSelect');
    locSelect.innerHTML = '<option value="">場所を選択...</option>';
    cleaningConfig.forEach(loc => {
        const option = document.createElement('option');
        option.value = loc.name;
        option.textContent = loc.name;
        locSelect.appendChild(option);
    });

    // 担当者の選択肢
    const staffSelect = document.getElementById('ngStaffSelect');
    staffSelect.innerHTML = '<option value="">人を選択...</option>';
    staffList.forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        staffSelect.appendChild(option);
    });
}


/* ========================================
  7. データ操作アクション (追加・削除)
  ======================================== */

// --- 担当者追加 ---
function addStaff() {
    const input = document.getElementById('newStaffName');
    const name = input.value.trim();
    if (!name) return alert("名前を入力してください");
    
    staffList.push(name);
    saveData(); 
    renderAll(); 
    input.value = "";
}

// --- 担当者削除 ---
function deleteStaff(index) {
    if(!confirm("削除しますか？")) return;
    
    const deletedName = staffList[index];
    staffList.splice(index, 1);
    
    // 関連するNG設定も削除
    ngList = ngList.filter(item => item.staff !== deletedName);

    saveData();
    renderAll();
}

// --- 掃除箇所追加 ---
function addLocation() {
    const nameInput = document.getElementById('newLocName');
    const capInput = document.getElementById('newLocCap');
    
    const name = nameInput.value.trim();
    const capacity = parseInt(capInput.value);

    if (!name) return alert("場所名を入力してください");
    if (capacity < 1) return alert("人数は1人以上にしてください");

    // UIからはURLを入力せず、名前と人数だけ登録
    cleaningConfig.push({ name, capacity });
    saveData();
    renderAll();
    
    nameInput.value = "";
    capInput.value = "1";
}

// --- 掃除箇所削除 ---
function deleteLocation(index) {
    if(!confirm("削除しますか？")) return;
    
    const deletedLocName = cleaningConfig[index].name;
    cleaningConfig.splice(index, 1);

    // 関連するNG設定も削除
    ngList = ngList.filter(item => item.location !== deletedLocName);

    saveData();
    renderAll();
}

// --- NG設定追加 (プルダウン) ---
function addNg() {
    const locSelect = document.getElementById('ngLocSelect');
    const staffSelect = document.getElementById('ngStaffSelect');
    
    const location = locSelect.value;
    const staff = staffSelect.value;

    if (!location) return alert("場所を選択してください");
    if (!staff) return alert("人を選択してください");

    // 重複チェック
    const exists = ngList.some(ng => ng.location === location && ng.staff === staff);
    if (exists) return alert("すでに設定済みです");

    ngList.push({ location, staff });
    saveData();
    renderAll();
    
    // 選択リセット
    locSelect.value = "";
    staffSelect.value = "";
}

// --- NG設定削除 ---
function deleteNg(index) {
    if(!confirm("設定を解除しますか？")) return;
    ngList.splice(index, 1);
    saveData();
    renderAll();
}

// HTML側から呼び出せるように登録
window.deleteStaff = deleteStaff;
window.deleteLocation = deleteLocation;
window.deleteNg = deleteNg;


/* ========================================
  8. イベント設定
  ======================================== */
function setupEventListeners() {
    // タブ切り替え
    document.getElementById('tabMain').addEventListener('click', () => switchTab('main'));
    document.getElementById('tabAdmin').addEventListener('click', () => switchTab('admin'));

    // メイン画面
    document.getElementById('shuffleBtn').addEventListener('click', handleShuffleClick);
    document.getElementById('copyUrlBtn').addEventListener('click', copyUrlToClipboard);
    document.getElementById('resetBtn').addEventListener('click', resetShuffle);

    // 管理画面
    document.getElementById('addStaffBtn').addEventListener('click', addStaff);
    document.getElementById('addLocBtn').addEventListener('click', addLocation);
    document.getElementById('addNgBtn').addEventListener('click', addNg);
    document.getElementById('resetAllDataBtn').addEventListener('click', resetAllData);
}

// タブ切り替え処理
function switchTab(tabName) {
    const mainView = document.getElementById('mainView');
    const adminView = document.getElementById('adminView');
    const tabMain = document.getElementById('tabMain');
    const tabAdmin = document.getElementById('tabAdmin');

    if (tabName === 'main') {
        mainView.classList.remove('hidden');
        adminView.classList.add('hidden');
        tabMain.classList.add('active');
        tabAdmin.classList.remove('active');
    } else {
        mainView.classList.add('hidden');
        adminView.classList.remove('hidden');
        tabMain.classList.remove('active');
        tabAdmin.classList.add('active');
    }
}


/* ========================================
  9. シャッフルロジック (メイン機能)
  ======================================== */

function handleShuffleClick() {
    if (staffList.length === 0) return alert("メンバーがいません。管理画面で追加してください。");

    // 1. シャッフル
    const currentPool = [...staffList];
    shuffleArray(currentPool);

    // 2. 割り当てて表示
    assignAndRender(currentPool);

    // 3. URLを書き換えて固定
    updateUrlAndLock(currentPool);
}

function assignAndRender(shuffledStaff) {
    let pool = [...shuffledStaff];
    const tbody = document.querySelector('#resultTable tbody');
    tbody.innerHTML = ""; 

    // 場所ごとにループ
    cleaningConfig.forEach(loc => {
        let assigned = [];
        
        // NGリストの取得
        const excludedNames = ngList
            .filter(ng => ng.location === loc.name)
            .map(ng => ng.staff);

        // 候補者選び
        for (let i = 0; i < pool.length; i++) {
            if (assigned.length >= loc.capacity) break;
            
            const candidate = pool[i];
            
            // NGに含まれていなければ採用
            if (!excludedNames.includes(candidate)) {
                assigned.push(candidate);
                pool.splice(i, 1);
                i--;
            }
        }

        // --- 行作成 ---
        const tr = document.createElement('tr');
        const tdPlace = document.createElement('td');
        
        // 場所名を表示
        tdPlace.appendChild(document.createTextNode(loc.name));
        
        // ★コード上部の manualLinks からURLを取得してリンク作成
        const manualUrl = manualLinks[loc.name];
        
        if (manualUrl && manualUrl !== "") {
            const link = document.createElement('a');
            link.href = manualUrl;
            link.textContent = "マニュアル";
            link.target = "_blank";
            link.rel = "noopener noreferrer";
            link.className = "manual-link";
            
            // 場所名の横に追加
            tdPlace.appendChild(link);
        }
        tr.appendChild(tdPlace);

        // 担当者セル
        const tdName = document.createElement('td');
        if (assigned.length > 0) {
            tdName.textContent = assigned.join('、 ');
        } else {
            tdName.textContent = "（適任者なし・要調整）";
            tdName.style.color = "#e74c3c";
        }
        tr.appendChild(tdName);
        tbody.appendChild(tr);
    });

    // 余り（予備）の表示
    if (pool.length > 0) {
        const tr = document.createElement('tr');
        const tdPlace = document.createElement('td');
        tdPlace.textContent = "予備・待機";
        tdPlace.style.backgroundColor = "#fffde7"; 
        tr.appendChild(tdPlace);
        const tdName = document.createElement('td');
        tdName.textContent = pool.join('、 ');
        tdName.style.backgroundColor = "#fffde7";
        tr.appendChild(tdName);
        tbody.appendChild(tr);
    }
}

// 配列シャッフル
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}


/* ========================================
  10. URL共有・復元機能
  ======================================== */

// 結果をURLに保存
function updateUrlAndLock(staffOrder) {
    const orderString = encodeURIComponent(staffOrder.join(','));
    const newUrl = window.location.pathname + '?order=' + orderString;
    window.history.pushState({path: newUrl}, '', newUrl);
    
    document.getElementById('shuffleBtn').style.display = 'none';
    document.getElementById('shareArea').classList.remove('hidden');
}

// ページロード時のURLチェック
function checkUrlData() {
    const urlParams = new URLSearchParams(window.location.search);
    const data = urlParams.get('order');
    if (data) {
        try {
            const savedOrder = decodeURIComponent(data).split(',');
            assignAndRender(savedOrder);
            document.getElementById('shuffleBtn').style.display = 'none';
            document.getElementById('shareArea').classList.remove('hidden');
        } catch (e) {
            console.error(e);
        }
    }
}

// リセットボタン
function resetShuffle() {
    if(!confirm("現在の結果をクリアして、シャッフル画面に戻りますか？")) return;
    const cleanUrl = window.location.pathname;
    window.history.pushState({}, '', cleanUrl);
    
    document.querySelector('#resultTable tbody').innerHTML = '<tr><td colspan="2" style="text-align:center;color:#999;">ボタンを押すと結果が表示されます</td></tr>';
    document.getElementById('shareArea').classList.add('hidden');
    document.getElementById('shuffleBtn').style.display = 'block';
}

// URLコピー
function copyUrlToClipboard() {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
        alert("URLをコピーしました！");
    }).catch(() => {
        prompt("コピーしてください:", url);
    });
}