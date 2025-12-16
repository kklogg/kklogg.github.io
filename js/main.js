// ================= 用户配置 =================
const CONFIG = {
    username: 'kklogg',       
    repo: 'kklogg.github.io', 
    path: 'data.json',
    // 🔥 在这里设置你们的纪念日
    startDate: '2022-01-01' 
};

// ================= 每日暖心文案 (Tech & Sweet) =================
const sweetSentences = [
    "今天也是想念 KK 的一天 ☁️",
    "你是我所有 if-else 里唯一的 return ❤️",
    "Loading 99%... 对你的爱加载完成 🔋",
    "在这个 404 的世界里，你是我唯一的 200 OK ✨",
    "不管是 GAN 还是 Transformer，都算不出我对你的喜欢 🤖",
    "代码会有 Bug，但爱你是绝对正确的逻辑 ✔️",
    "今天记得喝水，不要太累哦 🥤",
    "小猪猪导航，带你去想去的地方 🚀",
    "遇见你，是我的全局最优解 (Global Optimum) 🌟"
];

function initDailyQuote() {
    // 随机选取一句
    const quote = sweetSentences[Math.floor(Math.random() * sweetSentences.length)];
    const quoteEl = document.getElementById('daily-quote');
    if(quoteEl) quoteEl.innerText = quote;
}

// ================= 时钟与搜索 =================
function updateClock() {
    const now = new Date();
    
    // 1. 基础时间显示
    document.getElementById('clock-time').innerText = now.toTimeString().slice(0, 5);
    document.getElementById('clock-date').innerText = now.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' });
    
    // 2. 问候语逻辑
    const hour = now.getHours();
    let greet = "你好呀 🐽";
    if (hour < 6) greet = "夜深了，早点睡 🌙";
    else if (hour < 9) greet = "早安，打工人 ☕";
    else if (hour < 12) greet = "上午好，加油 🌟";
    else if (hour < 14) greet = "干饭时间到 🍚";
    else if (hour < 18) greet = "下午好，摸会鱼 🐟";
    else if (hour < 23) greet = "晚上好，放松下 📺";
    document.getElementById('clock-greet').innerText = greet;

    // 3. 🔥 恋爱计时器逻辑 (Days Together)
    const start = new Date(CONFIG.startDate);
    // 计算天数差 (毫秒转天数)
    const diffTime = Math.abs(now - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    
    const loveEl = document.getElementById('love-counter');
    if (loveEl) {
        loveEl.innerHTML = `🐷 <span style="font-size:1.2em;color:#ffeb3b;">${diffDays}</span> Days with KK`;
    }
}
setInterval(updateClock, 1000); updateClock();

const engines = {
    'baidu': { url: 'https://www.baidu.com/s', name: 'wd', placeholder: '百度一下，你就知道...' },
    'google': { url: 'https://www.google.com/search', name: 'q', placeholder: 'Google Search...' },
    'bing': { url: 'https://www.bing.com/search', name: 'q', placeholder: '必应搜索...' },
    'bilibili': { url: 'https://search.bilibili.com/all', name: 'keyword', placeholder: '搜索哔哩哔哩...' },
    'zhihu': { url: 'https://www.zhihu.com/search', name: 'q', placeholder: '有问题，上知乎...' },
    'xhs': { url: 'https://www.xiaohongshu.com/search_result', name: 'keyword', placeholder: '小红书，标记我的生活...' }
};

function setSearch(type) {
    const form = document.getElementById('search-form');
    const input = document.getElementById('search-input');
    const engine = engines[type];
    form.action = engine.url; input.name = engine.name; input.placeholder = engine.placeholder;
    
    document.querySelectorAll('.search-tab').forEach(el => el.classList.remove('active'));
    const tabs = document.querySelectorAll('.search-tab');
    
    if(type === 'baidu') tabs[0].classList.add('active');
    if(type === 'google') tabs[1].classList.add('active');
    if(type === 'bing') tabs[2].classList.add('active');
    if(type === 'bilibili') tabs[3].classList.add('active');
    if(type === 'zhihu') tabs[4].classList.add('active');
    if(type === 'xhs') tabs[5].classList.add('active');
}

// ================= 数据加载与渲染 =================
let currentData = [];

async function loadLinks() {
    try {
        const res = await fetch(`./${CONFIG.path}?t=${new Date().getTime()}`);
        if (!res.ok) throw new Error("无法读取 data.json");
        currentData = await res.json();
        renderAll(currentData);
    } catch (err) {
        console.error(err);
        document.getElementById('main-container').innerHTML = `<p style="color:white;text-align:center;">读取失败: ${err.message}<br>请检查 data.json</p>`;
    }
}

function renderAll(data) {
    const mainContainer = document.getElementById('main-container');
    const select = document.getElementById('categorySelect');
    const gridKK = document.getElementById('grid-kk');
    const gridGG = document.getElementById('grid-gg');
    
    mainContainer.innerHTML = ''; select.innerHTML = ''; gridKK.innerHTML = ''; gridGG.innerHTML = '';

    data.forEach((category, index) => {
        const option = document.createElement('option');
        option.value = index; option.innerText = category.title; select.appendChild(option);

        if (category.isZone === 'kk') {
            renderLinksToContainer(category.links, gridKK);
        } else if (category.isZone === 'gg') {
            renderLinksToContainer(category.links, gridGG);
        } else {
            const title = document.createElement('div');
            title.className = 'category-title';
            title.innerText = category.title;
            mainContainer.appendChild(title);
            const grid = document.createElement('div');
            grid.className = 'links-grid';
            renderLinksToContainer(category.links, grid);
            mainContainer.appendChild(grid);
        }
    });
}

function renderLinksToContainer(links, containerElement) {
    if (!links || links.length === 0) {
        containerElement.innerHTML = '<div style="color:#fff;opacity:0.6;font-size:0.9em;width:100%;text-align:center;padding:20px 0;">(这里空空如也 🍃)</div>';
        return;
    }
    links.forEach(link => {
        const a = document.createElement('a');
        a.href = link.url; a.className = 'link-card'; a.target = '_blank';
        a.innerHTML = `<span style="font-size:1.2em">${link.icon}</span><span style="font-size:0.9em">${link.name}</span>`;
        containerElement.appendChild(a);
    });
}

// ================= GitHub API 保存逻辑 =================
async function saveToGithub() {
    const catIndex = document.getElementById('categorySelect').value;
    const name = document.getElementById('siteName').value;
    const url = document.getElementById('siteUrl').value;
    const icon = document.getElementById('siteIcon').value;
    const msgBox = document.getElementById('status-msg');

    if(!name || !url) { msgBox.innerText = "名字和网址不能为空哦！🐽"; return; }

    let token = localStorage.getItem('gh_token');
    const inputToken = document.getElementById('ghToken').value;

    if (!token) {
        if (inputToken) { token = inputToken; localStorage.setItem('gh_token', token); } 
        else { document.getElementById('tokenGroup').style.display = 'block'; msgBox.innerText = "第一次需要输入 GitHub Token"; return; }
    }
    msgBox.innerText = "正在呼叫 GitHub 卫星...📡";

    try {
        const apiUrl = `https://api.github.com/repos/${CONFIG.username}/${CONFIG.repo}/contents/${CONFIG.path}`;
        const getRes = await fetch(apiUrl, { headers: { 'Authorization': `token ${token}` } });
        if (!getRes.ok) throw new Error("获取文件失败，检查Token");
        const fileData = await getRes.json();
        
        const newData = JSON.parse(JSON.stringify(currentData));
        if (newData[catIndex]) { newData[catIndex].links.push({ name, url, icon }); } 
        else { throw new Error("分类选择出错"); }

        const content = btoa(unescape(encodeURIComponent(JSON.stringify(newData, null, 4))));
        const putRes = await fetch(apiUrl, {
            method: 'PUT',
            headers: { 'Authorization': `token ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: `feat: Add ${name} via Web`, content: content, sha: fileData.sha })
        });

        if (!putRes.ok) throw new Error("保存失败");
        msgBox.innerText = "保存成功！🎉";
        currentData = newData; renderAll(newData); setTimeout(closeModal, 1500);

    } catch (err) {
        console.error(err); msgBox.innerText = "出错啦: " + err.message;
        if(err.message.includes("Token")) document.getElementById('tokenGroup').style.display = 'block';
    }
}

// ================= 弹窗与特效 =================
function openModal() {
    document.getElementById('addModal').style.display = 'flex';
    document.getElementById('status-msg').innerText = "";
    if (!localStorage.getItem('gh_token')) document.getElementById('tokenGroup').style.display = 'block';
    else document.getElementById('tokenGroup').style.display = 'none';
}
function closeModal() {
    document.getElementById('addModal').style.display = 'none';
    document.getElementById('siteName').value = ''; document.getElementById('siteUrl').value = '';
}

function triggerPigRain() {
    for (let i = 0; i < 20; i++) setTimeout(createSingleFallingPig, i * 50);
}
function createSingleFallingPig() {
    const item = document.createElement('div');
    item.classList.add('falling-item'); item.innerText = '🐷'; 
    item.style.left = Math.random() * 95 + 'vw';
    item.style.fontSize = (Math.random() * 15 + 25) + 'px';
    const duration = Math.random() * 4 + 3; 
    item.style.animationDuration = duration + 's';
    document.body.appendChild(item); setTimeout(() => item.remove(), duration * 1000);
}
const bgItems = ['❤️', '✨', '🍀', '🌸', '🍬', '☁️']; 
function createBackgroundItem() {
    const item = document.createElement('div');
    item.classList.add('falling-item');
    item.innerText = bgItems[Math.floor(Math.random() * bgItems.length)];
    item.style.left = Math.random() * 95 + 'vw';
    item.style.fontSize = (Math.random() * 15 + 15) + 'px';
    const duration = Math.random() * 5 + 4;
    item.style.animationDuration = duration + 's';
    document.body.appendChild(item); setTimeout(() => item.remove(), duration * 1000);
}

// 初始化
setInterval(createBackgroundItem, 500); 
window.onload = function() {
    loadLinks();
    initDailyQuote(); // 🔥 初始化时加载一句情话
};
