/* ========================================
  1. ログインユーザー設定 (Javascript管理)
  ======================================== */

/**
 * ★ログイン情報リスト
 * ここで管理画面に入れるユーザーを定義します。
 * * 【ユーザーの追加方法】
 * { id: "ユーザー名", pass: "パスワード" }, 
 * の形式で行を増やせば、何人でも追加可能です。
 */
const allowedUsers = [
    // 1人目
    { id: "support",  pass: "sooness" },
    
    // 2人目
    { id: "admin",    pass: "tomori" },
    
    // 3人目
    { id: "sunagawa", pass: "postcl26" },

    // ★ユーザーを増やしたい場合は、下の行の // を消して書き換えてください
    // { id: "newuser",  pass: "password" },
];


/* ========================================
  2. 初期データの定義 (初めて使う時・リセット時用)
  ======================================== */

// 初期メンバーリスト（合計12名）
const defaultStaffList = [
    "又吉", "友利", "礼夫", "安藤", 
    "砂川", "玉城", "大空", "真栄城", 
    "宮城", "名城", "新里", "阿利"
];

// 初期掃除箇所リスト (名前, 定員, URL)
const defaultConfigList = [
    { name: "トイレ(2ヵ所)", capacity: 1, url: "https://docs.google.com/document/d/1d9M6AsLvhnZlsUbO__Lh2InYCsoxjx16uYjQ0IudrpE/edit?usp=drive_link" },
    { name: "リフレッシュルーム", capacity: 1, url: "https://docs.google.com/document/d/1dZvblus_RmpP5nOO_fD9WbUtDKZ23VnlPKeVDWV4U7s/edit?usp=drive_link" },
    { name: "面談室", capacity: 1, url: "https://docs.google.com/document/d/1dZvblus_RmpP5nOO_fD9WbUtDKZ23VnlPKeVDWV4U7s/edit?usp=drive_link" },
    { name: "キッチン", capacity: 1, url: "https://docs.google.com/document/d/142Cy7g8hoHZS01VHgTX-3EHJnRQt9fZi48eDlqXmjfY/edit?usp=drive_link" },
    { name: "1Fフロア(廊下込み)", capacity: 3, url: "https://docs.google.com/document/d/1dZvblus_RmpP5nOO_fD9WbUtDKZ23VnlPKeVDWV4U7s/edit?usp=drive_link" },
    { name: "タオル洗濯", capacity: 1, url: "https://docs.google.com/document/d/1z327jhEH6gfCnCOz7K_kjJOygrbFDdDe/edit?usp=drive_link&ouid=100143212392680874740&rtpof=true&sd=true" },
    { name: "玄関", capacity: 1, url: "https://docs.google.com/document/d/16ZmweC387SXGCYYCWggILHcnkOfaqDakUeYgNyi7I54/edit?usp=drive_link" },
    { name: "外(屋外)*中庭無し", capacity: 2, url: "https://docs.google.com/document/d/1ZSseBk10j3CD00gfsjXfSEGeSJbwbEYpEVUOmVWxynE/edit?usp=drive_link" },
    { name: "外(太陽光パネル下)", capacity: 1, url: "https://docs.google.com/document/d/1sYhX8XCx311eaC-aZhY6buF5fQxhlxe4pAFjmZLLa-U/edit?usp=drive_link" }
];

// 初期NG設定リスト
const defaultNgList = [
    { location: "トイレ(2ヵ所)", staff: "宮城" },
    { location: "トイレ(2ヵ所)", staff: "名城" }
];


/* ========================================
  3. 状態管理変数 (アプリ内のデータ)
  ======================================== */
let staffList = [];       // メンバーリスト
let cleaningConfig = [];  // 掃除箇所リスト (名前, 人数, URL)
let ngList = [];          // NG設定リスト
let isLoggedIn = false;   // ログイン状態フラグ


/* ========================================
  4. 起動時の処理
  ======================================== */
document.addEventListener('DOMContentLoaded', function() {
    
    // (A) ブラウザ保存データの読み込み
    // ※保存データがない場合やURLが空の場合は初期設定を使用します
    loadData();

    // (B) 画面の初期描画（リストや人数表示など）
    renderAll();

    // (C) ボタン操作の設定
    setupEventListeners();

    // (D) URL共有データの確認（結果URLを開いた場合）
    checkUrlData();
    
    // (E) 最初のタブをセット
    switchTab('main');
});


/* ========================================
  5. ログイン機能
  ======================================== */

/**
 * ログインボタンが押されたときの処理
 */
function handleLogin() {
    const userInput = document.getElementById('loginUser').value.trim();
    const passInput = document.getElementById('loginPass').value.trim();
    const errorMsg = document.getElementById('loginErrorMsg');

    errorMsg.textContent = "";

    // ユーザー照合
    // 設定された allowedUsers リストの中から一致する人を探します
    const validUser = allowedUsers.find(user => user.id === userInput && user.pass === passInput);

    if (validUser) {
        // ログイン成功
        isLoggedIn = true;
        document.getElementById('adminLoginPanel').classList.add('hidden');
        document.getElementById('adminConfigPanel').classList.remove('hidden');
        
        // 入力クリア
        document.getElementById('loginUser').value = "";
        document.getElementById('loginPass').value = "";

    } else {
        // 失敗
        errorMsg.textContent = "ユーザー名かパスワードが間違っています";
    }
}

/**
 * ログアウト処理
 */
function handleLogout() {
    isLoggedIn = false;
    document.getElementById('adminLoginPanel').classList.remove('hidden');
    document.getElementById('adminConfigPanel').classList.add('hidden');
}

/**
 * パスワード表示の切り替え
 */
function togglePasswordVisibility() {
    const passInput = document.getElementById('loginPass');
    const checkbox = document.getElementById('showPassCheck');
    passInput.type = checkbox.checked ? "text" : "password";
}


/* ========================================
  6. データ保存・読み込み (Local Storage)
  ======================================== */

/**
 * データを読み込む関数
 * ★保存データのURLが空でも、初期データにURLがあれば修復します
 */
function loadData() {
    // メンバーの読み込み
    const storedStaff = localStorage.getItem('cleaning_staffList');
    staffList = storedStaff ? JSON.parse(storedStaff) : [...defaultStaffList];

    // 掃除箇所の読み込み
    const storedConfig = localStorage.getItem('cleaning_config');
    if (storedConfig) {
        // 保存データを読み込む
        let loadedConfig = JSON.parse(storedConfig);
        
        // ★データの修復・補完処理
        // 保存データのURLが空の場合は、初期設定のURLを使って補完する
        cleaningConfig = loadedConfig.map(savedLoc => {
            // 初期設定から同じ名前の場所を探す
            const defaultLoc = defaultConfigList.find(d => d.name === savedLoc.name);
            
            // 保存データのURLが空 または 未定義 で、初期データにはURLがある場合
            if (defaultLoc && defaultLoc.url !== "" && (!savedLoc.url || savedLoc.url === "")) {
                return {
                    ...savedLoc,
                    url: defaultLoc.url // URLを復活させる
                };
            }
            return savedLoc;
        });
        
        // 補完したデータを再度保存しておく
        saveData();
    } else {
        // 保存データがなければ初期データをそのまま使う
        cleaningConfig = JSON.parse(JSON.stringify(defaultConfigList));
    }

    // NGリストの読み込み
    const storedNg = localStorage.getItem('cleaning_ngList');
    if (storedNg) {
        ngList = JSON.parse(storedNg);
    } else {
        // 保存データがなければ初期データ(defaultNgList)を使う
        ngList = JSON.parse(JSON.stringify(defaultNgList));
    }
}

/**
 * データをブラウザに保存する
 */
function saveData() {
    localStorage.setItem('cleaning_staffList', JSON.stringify(staffList));
    localStorage.setItem('cleaning_config', JSON.stringify(cleaningConfig));
    localStorage.setItem('cleaning_ngList', JSON.stringify(ngList));
}

/**
 * データを初期化する（リセットボタン）
 */
function resetAllData() {
    if(!confirm("本当に全てのデータを初期状態に戻しますか？\n追加したメンバーや設定も消えます。")) return;
    
    localStorage.removeItem('cleaning_staffList');
    localStorage.removeItem('cleaning_config');
    localStorage.removeItem('cleaning_ngList');
    location.reload(); // ページを再読み込みして初期状態を表示
}


/* ========================================
  7. 画面描画 (Rendering)
  ======================================== */

/**
 * 全ての画面要素を更新する関数
 */
function renderAll() {
    renderMainViewMember(); // メイン画面のメンバーと人数
    renderAdminStaff();     // 管理画面のメンバー
    renderAdminLocation();  // 管理画面の掃除場所
    renderAdminNg();        // 管理画面のNG設定
    updateNgSelectOptions(); // プルダウン更新
}

/**
 * メイン画面のメンバーリストと【人数表示】を更新
 */
function renderMainViewMember() {
    const ul = document.getElementById('displayMemberList');
    ul.innerHTML = "";
    staffList.forEach(name => {
        const li = document.createElement('li');
        li.textContent = name;
        ul.appendChild(li);
    });
    
    // ★ここで人数を自動更新します
    document.getElementById('memberCountTitle').textContent = `対象メンバー（計${staffList.length}名）`;
}

/**
 * 管理画面：担当者リスト更新
 */
function renderAdminStaff() {
    const ul = document.getElementById('adminStaffList');
    ul.innerHTML = "";
    staffList.forEach((name, index) => {
        const li = document.createElement('li');
        li.innerHTML = `<span>${name}</span> <button class="btn-del" onclick="deleteStaff(${index})">削除</button>`;
        ul.appendChild(li);
    });
}

/**
 * 管理画面：掃除箇所リスト更新
 * ★ここで「[Link設定あり]」の表示を行います
 */
function renderAdminLocation() {
    const ul = document.getElementById('adminLocList');
    ul.innerHTML = "";
    
    cleaningConfig.forEach((loc, index) => {
        const li = document.createElement('li');
        
        // 基本情報（名前と定員）
        let info = `<b>${loc.name}</b> (${loc.capacity}人)`;
        
        // ★保存されているデータ(loc.url)にURLがあるかチェック
        if(loc.url && loc.url !== "") {
            // 設定されていれば「[Link設定あり]」を追加表示
            info += ` <span class="url-status">[Link設定あり]</span>`;
        }
        
        li.innerHTML = `<span>${info}</span> <button class="btn-del" onclick="deleteLocation(${index})">削除</button>`;
        ul.appendChild(li);
    });
}

/**
 * 管理画面：NG設定リスト更新
 */
function renderAdminNg() {
    const ul = document.getElementById('adminNgList');
    ul.innerHTML = "";
    ngList.forEach((item, index) => {
        const li = document.createElement('li');
        li.innerHTML = `<span>【${item.location}】NG: ${item.staff}</span> <button class="btn-del" onclick="deleteNg(${index})">解除</button>`;
        ul.appendChild(li);
    });
}

/**
 * NG設定用のプルダウン選択肢を更新
 */
function updateNgSelectOptions() {
    const locSelect = document.getElementById('ngLocSelect');
    locSelect.innerHTML = '<option value="">場所を選択...</option>';
    cleaningConfig.forEach(loc => {
        const option = document.createElement('option');
        option.value = loc.name;
        option.textContent = loc.name;
        locSelect.appendChild(option);
    });

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
  8. データ操作 (追加・削除)
  ======================================== */

// --- 担当者 ---
function addStaff() {
    const input = document.getElementById('newStaffName');
    const name = input.value.trim();
    if (!name) return alert("名前を入力してください");
    staffList.push(name);
    saveData(); 
    renderAll(); // 追加後に画面更新
    input.value = "";
}

function deleteStaff(index) {
    if(!confirm("削除しますか？")) return;
    const deletedName = staffList[index];
    staffList.splice(index, 1);
    ngList = ngList.filter(item => item.staff !== deletedName);
    saveData(); 
    renderAll(); 
}

// --- 掃除箇所 (URLもここで登録) ---
function addLocation() {
    const nameInput = document.getElementById('newLocName');
    const capInput = document.getElementById('newLocCap');
    const urlInput = document.getElementById('newLocUrl'); // ★URL入力欄
    
    const name = nameInput.value.trim();
    const capacity = parseInt(capInput.value);
    const url = urlInput.value.trim(); // ★入力されたURL

    if (!name) return alert("場所名を入力してください");
    if (capacity < 1) return alert("人数は1人以上にしてください");

    // リストに名前、人数、URLをまとめて保存
    cleaningConfig.push({ name, capacity, url });
    
    saveData(); 
    renderAll();
    
    // 入力欄クリア
    nameInput.value = "";
    capInput.value = "1";
    urlInput.value = "";
}

function deleteLocation(index) {
    if(!confirm("削除しますか？")) return;
    const deletedLocName = cleaningConfig[index].name;
    cleaningConfig.splice(index, 1);
    ngList = ngList.filter(item => item.location !== deletedLocName);
    saveData(); renderAll();
}

// --- NG設定 ---
function addNg() {
    const locSelect = document.getElementById('ngLocSelect');
    const staffSelect = document.getElementById('ngStaffSelect');
    const location = locSelect.value;
    const staff = staffSelect.value;

    if (!location || !staff) return alert("場所と人を選択してください");

    const exists = ngList.some(ng => ng.location === location && ng.staff === staff);
    if (exists) return alert("すでに設定済みです");

    ngList.push({ location, staff });
    saveData(); renderAll();
    locSelect.value = ""; staffSelect.value = "";
}

function deleteNg(index) {
    if(!confirm("設定を解除しますか？")) return;
    ngList.splice(index, 1);
    saveData(); renderAll();
}

// HTMLから関数を呼べるようにwindowに登録
window.deleteStaff = deleteStaff;
window.deleteLocation = deleteLocation;
window.deleteNg = deleteNg;


/* ========================================
  9. イベント設定
  ======================================== */
function setupEventListeners() {
    document.getElementById('loginBtn').addEventListener('click', handleLogin);
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
    document.getElementById('showPassCheck').addEventListener('change', togglePasswordVisibility);

    document.getElementById('tabMain').addEventListener('click', () => switchTab('main'));
    document.getElementById('tabAdmin').addEventListener('click', () => switchTab('admin'));

    document.getElementById('shuffleBtn').addEventListener('click', handleShuffleClick);
    document.getElementById('copyUrlBtn').addEventListener('click', copyUrlToClipboard);
    document.getElementById('resetBtn').addEventListener('click', resetShuffle);

    document.getElementById('addStaffBtn').addEventListener('click', addStaff);
    document.getElementById('addLocBtn').addEventListener('click', addLocation);
    document.getElementById('addNgBtn').addEventListener('click', addNg);
    document.getElementById('resetAllDataBtn').addEventListener('click', resetAllData);
}

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

        // ログイン状態によって表示を切り替え
        if (isLoggedIn) {
            document.getElementById('adminLoginPanel').classList.add('hidden');
            document.getElementById('adminConfigPanel').classList.remove('hidden');
        } else {
            document.getElementById('adminLoginPanel').classList.remove('hidden');
            document.getElementById('adminConfigPanel').classList.add('hidden');
        }
    }
}


/* ========================================
  10. シャッフルロジック (メイン機能)
  ======================================== */

function handleShuffleClick() {
    if (staffList.length === 0) return alert("メンバーがいません。");
    const currentPool = [...staffList];
    shuffleArray(currentPool);
    assignAndRender(currentPool);
    updateUrlAndLock(currentPool);
}

function assignAndRender(shuffledStaff) {
    let pool = [...shuffledStaff];
    const tbody = document.querySelector('#resultTable tbody');
    tbody.innerHTML = ""; 

    cleaningConfig.forEach(loc => {
        let assigned = [];
        const excludedNames = ngList
            .filter(ng => ng.location === loc.name)
            .map(ng => ng.staff);

        for (let i = 0; i < pool.length; i++) {
            if (assigned.length >= loc.capacity) break;
            const candidate = pool[i];
            if (!excludedNames.includes(candidate)) {
                assigned.push(candidate);
                pool.splice(i, 1);
                i--;
            }
        }

        // 行作成
        const tr = document.createElement('tr');
        const tdPlace = document.createElement('td');
        
        tdPlace.appendChild(document.createTextNode(loc.name));
        
        // ★データに保存されたURLがある場合、リンクを作成して表示
        if (loc.url && loc.url !== "") {
            const link = document.createElement('a');
            link.href = loc.url;
            link.textContent = "マニュアル";
            link.target = "_blank";
            link.rel = "noopener noreferrer";
            link.className = "manual-link";
            tdPlace.appendChild(link);
        }
        tr.appendChild(tdPlace);

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

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}


/* ========================================
  11. URL共有・復元機能
  ======================================== */

function updateUrlAndLock(staffOrder) {
    const orderString = encodeURIComponent(staffOrder.join(','));
    const newUrl = window.location.pathname + '?order=' + orderString;
    window.history.pushState({path: newUrl}, '', newUrl);
    
    document.getElementById('shuffleBtn').style.display = 'none';
    document.getElementById('shareArea').classList.remove('hidden');
}

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

function resetShuffle() {
    if(!confirm("現在の結果をクリアして、シャッフル画面に戻りますか？")) return;
    const cleanUrl = window.location.pathname;
    window.history.pushState({}, '', cleanUrl);
    
    document.querySelector('#resultTable tbody').innerHTML = '<tr><td colspan="2" style="text-align:center;color:#999;">ボタンを押すと結果が表示されます</td></tr>';
    document.getElementById('shareArea').classList.add('hidden');
    document.getElementById('shuffleBtn').style.display = 'block';
}

function copyUrlToClipboard() {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
        alert("URLをコピーしました！");
    }).catch(() => {
        prompt("コピーしてください:", url);
    });
}