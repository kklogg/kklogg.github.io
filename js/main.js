// ================= 用户配置 =================
const CONFIG = {
    username: 'kklogg',       
    repo: 'kklogg.github.io', 
    path: 'data.json'         
};

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
    const container = document.getElementById('main-container');
    const select = document.getElementById('categorySelect');
    container.innerHTML = ''; 
    select.innerHTML = '';

    data.forEach((category, index) => {
        // 渲染分类标题
        const title = document.createElement('div');
        title.className = 'category-title';
        title.innerText = category.title;
        container.appendChild(title);

        // 渲染链接卡片
        const grid = document.createElement('div');
        grid.className = 'links-grid';
        category.links.forEach(link => {
            const a = document.createElement('a');
            a.href = link.url;
            a.className = 'link-card';
            a.target = '_blank';
            a.innerHTML = `<span style="font-size:1.5em">${link.icon}</span><span>${link.name}</span>`;
            grid.appendChild(a);
        });
        container.appendChild(grid);

        // 填充下拉菜单
        const option = document.createElement('option');
        option.value = index; 
        option.innerText = category.title;
        select.appendChild(option);
    });
}

// ================= GitHub API 保存逻辑 =================
async function saveToGithub() {
    const catIndex = document.getElementById('categorySelect').value;
    const name = document.getElementById('siteName').value;
    const url = document.getElementById('siteUrl').value;
    const icon = document.getElementById('siteIcon').value;
    const msgBox = document.getElementById('status-msg');

    if(!name || !url) {
        msgBox.innerText = "名字和网址不能为空哦！🐽";
        return;
    }

    let token = localStorage.getItem('gh_token');
    const inputToken = document.getElementById('ghToken').value;

    if (!token) {
        if (inputToken) {
            token = inputToken;
            localStorage.setItem('gh_token', token);
        } else {
            document.getElementById('tokenGroup').style.display = 'block';
            msgBox.innerText = "第一次需要输入 GitHub Token";
            return;
        }
    }

    msgBox.innerText = "正在呼叫 GitHub 卫星...📡";

    try {
        const apiUrl = `https://api.github.com/repos/${CONFIG.username}/${CONFIG.repo}/contents/${CONFIG.path}`;
        const getRes = await fetch(apiUrl, { headers: { 'Authorization': `token ${token}` } });
        
        if (!getRes.ok) throw new Error("获取文件失败，检查Token");
        
        const fileData = await getRes.json();
        
        const newData = JSON.parse(JSON.stringify(currentData));
        if (newData[catIndex]) {
            newData[catIndex].links.push({ name, url, icon });
        } else {
            throw new Error("分类选择出错");
        }

        const content = btoa(unescape(encodeURIComponent(JSON.stringify(newData, null, 4))));

        const putRes = await fetch(apiUrl, {
            method: 'PUT',
            headers: { 'Authorization': `token ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: `feat: Add ${name} via Web`,
                content: content,
                sha: fileData.sha
            })
        });

        if (!putRes.ok) throw new Error("保存失败");

        msgBox.innerText = "保存成功！🎉";
        currentData = newData; 
        renderAll(newData);   
        setTimeout(closeModal, 1500);

    } catch (err) {
        console.error(err);
        msgBox.innerText = "出错啦: " + err.message;
        if(err.message.includes("Token")) document.getElementById('tokenGroup').style.display = 'block';
    }
}

// ================= 弹窗控制 =================
function openModal() {
    document.getElementById('addModal').style.display = 'flex';
    document.getElementById('status-msg').innerText = "";
    if (!localStorage.getItem('gh_token')) document.getElementById('tokenGroup').style.display = 'block';
    else document.getElementById('tokenGroup').style.display = 'none';
}
function closeModal() {
    document.getElementById('addModal').style.display = 'none';
    document.getElementById('siteName').value = '';
    document.getElementById('siteUrl').value = '';
}

// ================= 特效动画 =================
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
    document.body.appendChild(item);
    setTimeout(() => item.remove(), duration * 1000);
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
    document.body.appendChild(item);
    setTimeout(() => item.remove(), duration * 1000);
}

// 初始化
setInterval(createBackgroundItem, 500); 
window.onload = loadLinks;
