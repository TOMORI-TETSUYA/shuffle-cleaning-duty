/* ========================================
  1. ログインユーザー設定
  ======================================== */
const allowedUsers = [
    { id: "admin", pass: "tomori" },
    { id: "support",   pass: "sooness" },
    { id: "sunagawa", pass: "postcl26" }
];

/* ========================================
  2. 初期データの定義
  ======================================== */
const defaultStaffList = [
    "又吉", "友利", "礼夫", "安藤", 
    "砂川", "玉城", "大空", "真栄城", 
    "宮城", "名城", "新里", "阿利"
];

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

const defaultNgList = [
    { location: "トイレ(2ヵ所)", staff: "宮城" },
    { location: "トイレ(2ヵ所)", staff: "名城" }
];

/* ========================================
  3. 状態管理変数
  ======================================== */
let staffList = [];       
let cleaningConfig = [];  
let ngList = [];          
let isLoggedIn = false;   

/* ========================================
  4. 起動時の処理
  ======================================== */
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    renderAll();
    setupEventListeners();
    checkUrlData();
    switchTab('main');
});

/* ========================================
  5. ログイン機能
  ======================================== */
function handleLogin() {
    const userInput = document.getElementById('loginUser').value.trim();
    const passInput = document.getElementById('loginPass').value.trim();
    const errorMsg = document.getElementById('loginErrorMsg');
    errorMsg.textContent = "";

    const validUser = allowedUsers.find(user => user.id === userInput && user.pass === passInput);

    if (validUser) {
        isLoggedIn = true;
        document.getElementById('adminLoginPanel').classList.add('hidden');
        document.getElementById('adminConfigPanel').classList.remove('hidden');
        document.getElementById('loginUser').value = "";
        document.getElementById('loginPass').value = "";
    } else {
        errorMsg.textContent = "ユーザー名かパスワードが間違っています";
    }
}

function handleLogout() {
    isLoggedIn = false;
    document.getElementById('adminLoginPanel').classList.remove('hidden');
    document.getElementById('adminConfigPanel').classList.add('hidden');
}

function togglePasswordVisibility() {
    const passInput = document.getElementById('loginPass');
    const checkbox = document.getElementById('showPassCheck');
    passInput.type = checkbox.checked ? "text" : "password";
}

/* ========================================
  6. データ保存・読み込み
  ======================================== */
function loadData() {
    const storedStaff = localStorage.getItem('cleaning_staffList');
    staffList = storedStaff ? JSON.parse(storedStaff) : [...defaultStaffList];

    const storedConfig = localStorage.getItem('cleaning_config');
    if (storedConfig) {
        let loadedConfig = JSON.parse(storedConfig);
        cleaningConfig = loadedConfig.map(savedLoc => {
            const defaultLoc = defaultConfigList.find(d => d.name === savedLoc.name);
            if (defaultLoc && defaultLoc.url !== "" && (!savedLoc.url || savedLoc.url === "")) {
                return { ...savedLoc, url: defaultLoc.url };
            }
            return savedLoc;
        });
        saveData();
    } else {
        cleaningConfig = JSON.parse(JSON.stringify(defaultConfigList));
    }

    const storedNg = localStorage.getItem('cleaning_ngList');
    ngList = storedNg ? JSON.parse(storedNg) : JSON.parse(JSON.stringify(defaultNgList));
}

function saveData() {
    localStorage.setItem('cleaning_staffList', JSON.stringify(staffList));
    localStorage.setItem('cleaning_config', JSON.stringify(cleaningConfig));
    localStorage.setItem('cleaning_ngList', JSON.stringify(ngList));
}

/**
 * ★全データを初期状態に戻す処理
 * ログアウトしないように、ページリロードではなくデータの再読み込みを行います。
 */
function resetAllData() {
    if(!confirm("本当に全てのデータを初期状態に戻しますか？\n追加したメンバーや設定も消えます。")) return;
    
    // 1. 保存されているデータを削除する
    localStorage.removeItem('cleaning_staffList');
    localStorage.removeItem('cleaning_config');
    localStorage.removeItem('cleaning_ngList');
    
    // 2. データを初期状態から読み込み直す (loadData関数内で初期データがセットされる)
    loadData();

    // 3. 画面の表示を更新する
    renderAll();

    // 4. メッセージを表示
    alert("データを初期状態に戻しました。（ログアウトはしていません）");
    
    // ※以前あった location.reload() は削除しました
}

/* ========================================
  7. 画面描画 (Rendering)
  ======================================== */
function renderAll() {
    renderMainViewMember(); 
    renderAdminStaff();     
    renderAdminLocation();  
    renderAdminNg();        
    updateNgSelectOptions(); 
}

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

function renderAdminStaff() {
    const ul = document.getElementById('adminStaffList');
    ul.innerHTML = "";
    staffList.forEach((name, index) => {
        const li = document.createElement('li');
        li.innerHTML = `<span>${name}</span> <button class="btn-del" onclick="deleteStaff(${index})">削除</button>`;
        ul.appendChild(li);
    });
}

function renderAdminLocation() {
    const ul = document.getElementById('adminLocList');
    ul.innerHTML = "";
    cleaningConfig.forEach((loc, index) => {
        const li = document.createElement('li');
        let info = `<b>${loc.name}</b> (${loc.capacity}人)`;
        if(loc.url && loc.url !== "") {
            info += ` <span class="url-status">[Link設定あり]</span>`;
        }
        li.innerHTML = `<span>${info}</span> <button class="btn-del" onclick="deleteLocation(${index})">削除</button>`;
        ul.appendChild(li);
    });
}

function renderAdminNg() {
    const ul = document.getElementById('adminNgList');
    ul.innerHTML = "";
    ngList.forEach((item, index) => {
        const li = document.createElement('li');
        li.innerHTML = `<span>【${item.location}】NG: ${item.staff}</span> <button class="btn-del" onclick="deleteNg(${index})">解除</button>`;
        ul.appendChild(li);
    });
}

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
function addStaff() {
    const input = document.getElementById('newStaffName');
    const name = input.value.trim();
    if (!name) return alert("名前を入力してください");
    staffList.push(name);
    saveData(); 
    renderAll(); 
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

function addLocation() {
    const nameInput = document.getElementById('newLocName');
    const capInput = document.getElementById('newLocCap');
    const urlInput = document.getElementById('newLocUrl'); 
    
    const name = nameInput.value.trim();
    const capacity = parseInt(capInput.value);
    const url = urlInput.value.trim(); 

    if (!name) return alert("場所名を入力してください");
    if (capacity < 1) return alert("人数は1人以上にしてください");

    cleaningConfig.push({ name, capacity, url });
    saveData(); 
    renderAll();
    
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

    document.getElementById('excelBtn').addEventListener('click', exportToExcel);
    document.getElementById('pdfBtn').addEventListener('click', exportToPDF);
    document.getElementById('htmlBtn').addEventListener('click', openResultInNewTab);
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
  10. シャッフルロジック
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

        const tr = document.createElement('tr');
        const tdPlace = document.createElement('td');
        
        tdPlace.appendChild(document.createTextNode(loc.name));
        
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

    document.getElementById('copyUrlBtn').style.display = 'block';
    document.getElementById('resetBtn').style.display = 'block';
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

            document.getElementById('copyUrlBtn').style.display = 'none';
            document.getElementById('resetBtn').style.display = 'none';

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

/* ========================================
  12. ダウンロード・別タブ表示機能
  ======================================== */
function exportToExcel() {
    const table = document.getElementById('resultTable');
    let data = [];
    let urls = [];

    data.push(["掃除当番決定表"]);
    data.push(["掃除箇所", "マニュアルリンク", "担当者"]);
    
    for (let i = 1; i < table.rows.length; i++) {
        let row = table.rows[i];
        let place = row.cells[0].innerText.replace("マニュアル", "").trim();
        let url = "";
        const link = row.cells[0].querySelector('a');
        if (link) {
            url = link.href;
        }
        urls.push(url);
        let linkText = url ? "マニュアル" : "";
        let name = row.cells[1].innerText.trim();
        data.push([place, linkText, name]);
    }

    const ws = XLSX.utils.aoa_to_sheet(data);

    ws['!cols'] = [
        { wch: 25 },
        { wch: 20 },
        { wch: 40 }
    ];

    ws['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 2 } }
    ];

    const borderStyle = {
        top: { style: "thin" }, bottom: { style: "thin" },
        left: { style: "thin" }, right: { style: "thin" }
    };

    for (let cellAddress in ws) {
        if (cellAddress[0] === '!') continue;
        
        let cell = ws[cellAddress];
        if (!cell) continue;

        const range = XLSX.utils.decode_cell(cellAddress);
        const col = range.c;
        const row = range.r;

        cell.s = {
            border: borderStyle,
            alignment: { vertical: "center", wrapText: true }
        };

        if (row === 0 && col === 0) {
            cell.s.font = { sz: 14, bold: true };
            cell.s.alignment = { horizontal: "center", vertical: "center" };
        }

        if (row === 1) {
            cell.s.font = { bold: true };
            cell.s.alignment = { horizontal: "center", vertical: "center" };
        }

        if (col === 1 && row >= 2) {
            const urlIndex = row - 2;
            const targetUrl = urls[urlIndex];

            if (targetUrl) {
                cell.l = { Target: targetUrl };
                cell.s.font = { color: { rgb: "0000FF" }, underline: true };
                cell.s.alignment = { horizontal: "center", vertical: "center" };
            }
        }
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "掃除当番");
    const date = new Date();
    const filename = `掃除当番_${date.getFullYear()}${date.getMonth()+1}${date.getDate()}.xlsx`;
    XLSX.writeFile(wb, filename);
}

function exportToPDF() {
    const originalTable = document.getElementById('resultTable');
    const container = document.createElement('div');
    container.style.padding = "20px";
    container.style.fontFamily = "sans-serif";

    const title = document.createElement('h1');
    title.innerText = "掃除当番決定表";
    title.style.fontSize = "30px";
    title.style.textAlign = "center";
    title.style.marginBottom = "20px";
    title.style.color = "#333";
    container.appendChild(title);

    const tableClone = originalTable.cloneNode(true);
    tableClone.style.width = "100%";
    tableClone.style.borderCollapse = "collapse";
    
    const cells = tableClone.querySelectorAll('th, td');
    cells.forEach(cell => {
        cell.style.border = "1px solid #333";
        cell.style.padding = "8px";
        cell.style.textAlign = "left";
    });
    
    const headers = tableClone.querySelectorAll('th');
    headers.forEach(th => {
        th.style.backgroundColor = "#34495e";
        th.style.color = "#fff";
        th.style.textAlign = "center";
    });

    container.appendChild(tableClone);

    const opt = {
        margin:       10,
        filename:     '掃除当番表.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().from(container).set(opt).save();
}

function openResultInNewTab() {
    const tableHTML = document.getElementById('resultTable').outerHTML;
    const newWin = window.open('', '_blank');
    newWin.document.write(`
        <html>
        <head>
            <title>掃除当番決定表</title>
            <style>
                body { font-family: sans-serif; padding: 20px; }
                h1 { text-align: center; color: #333; font-size: 24px; margin-bottom: 20px; }
                table { width: auto; min-width: 600px; max-width: 800px; margin: 0 auto; border-collapse: collapse; }
                th, td { border: 1px solid #000; padding: 10px; text-align: left; }
                th { background-color: #f2f2f2; text-align: center; font-weight: bold; }
                a { text-decoration: none; color: #3498db; }
            </style>
        </head>
        <body>
            <h1>掃除当番決定表</h1>
            ${tableHTML}
            <div style="text-align:center; margin-top:20px;">
                <button onclick="window.print()" style="padding:10px 20px; font-size:16px;">印刷する</button>
            </div>
        </body>
        </html>
    `);
    newWin.document.close();
}