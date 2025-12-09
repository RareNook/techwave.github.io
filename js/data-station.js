// 全局变量
let allPdfData = []; // 所有PDF数据
let favoritePdfs = JSON.parse(localStorage.getItem('techwaveFavorites')) || []; // 收藏数据
const isLogin = false; // 实际项目需从后端判断登录状态（true/false）
const userToken = localStorage.getItem('userToken') || ''; // 登录Token

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    // 1. 加载PDF数据（从JSON文件）
    loadPdfData();
    // 2. 初始化收藏列表
    renderFavoriteList();
    // 3. 绑定搜索事件
    bindSearchEvent();
    // 4. 绑定排序事件
    bindSortEvent();
    // 5. 登录状态下获取后端收藏
    if (isLogin && userToken) {
        fetchBackendFavorites();
    }
});

// 1. 从JSON加载PDF数据（批量管理核心）
function loadPdfData() {
    fetch('./pdf-list.json')
        .then(response => {
            if (!response.ok) throw new Error('PDF数据加载失败');
            return response.json();
        })
        .then(data => {
            allPdfData = data;
            // 渲染PDF列表
            renderPdfList(allPdfData);
            // 更新分类数量
            updateCategoryCount();
            // 渲染最新更新
            renderUpdateLog();
            // 渲染下载TOP5
            renderDownloadRank();
        })
        .catch(err => {
            console.error(err);
            const pdfContainer = document.getElementById('pdf-list-container');
            pdfContainer.innerHTML = '<p class="load-error">资料加载失败，请刷新页面重试</p>';
        });
}

// 2. 渲染PDF列表
function renderPdfList(filteredData = allPdfData) {
    const pdfContainer = document.getElementById('pdf-list-container');
    pdfContainer.innerHTML = '';

    if (filteredData.length === 0) {
        pdfContainer.innerHTML = '<p class="no-data">暂无匹配资料</p>';
        return;
    }

    filteredData.forEach(pdf => {
        const pdfItem = document.createElement('div');
        pdfItem.className = 'pdf-item';
        pdfItem.setAttribute('data-category', pdf.category);
        
        // 判断是否已收藏
        const isCollected = favoritePdfs.some(item => item.id === pdf.id);
        const collectBtnText = isCollected ? '已收藏' : '收藏';
        const collectBtnStyle = isCollected ? 
            'background-color: #567cb2; color: #fff;' : 
            'background-color: #f1faff; color: #567cb2;';

        pdfItem.innerHTML = `
            <div class="pdf-icon">📄</div>
            <div class="pdf-info">
                <h3>${pdf.title}</h3>
                <p class="pdf-desc">${pdf.desc}</p>
                <div class="pdf-meta">
                    <span class="category-tag">${getCategoryName(pdf.category)}</span>
                    <span class="update-time">${pdf.updateTime} 更新</span>
                    <span class="download-count">下载：${pdf.downloadCount}次</span>
                </div>
            </div>
            <div class="pdf-action">
                <a href="${pdf.url}" class="btn download-btn" target="_blank">下载</a>
                <button class="collect-btn" 
                        data-id="${pdf.id}" 
                        data-title="${pdf.title}" 
                        data-url="${pdf.url}"
                        style="${collectBtnStyle}">
                    ${collectBtnText}
                </button>
            </div>
        `;
        pdfContainer.appendChild(pdfItem);
    });

    // 绑定收藏按钮事件
    bindCollectBtns();
    // 更新顶部总数量
    document.querySelector('.total-count').textContent = `（共${filteredData.length}份）`;
}

// 3. 辅助函数：根据分类ID获取分类名称
function getCategoryName(categoryId) {
    const categoryMap = {
        'hardware': '硬件知识',
        'tech': '技术教程',
        'industry': '行业报告',
        'agent': '代理手册',
        'aftersale': '售后指南'
    };
    return categoryMap[categoryId] || '其他';
}

// 4. 更新左侧分类数量
function updateCategoryCount() {
    const categoryItems = document.querySelectorAll('.category-item');
    categoryItems.forEach(item => {
        const category = item.getAttribute('data-category');
        let count = 0;

        if (category === 'all') {
            count = allPdfData.length;
        } else {
            count = allPdfData.filter(pdf => pdf.category === category).length;
        }

        item.querySelector('.count').textContent = count;
        // 绑定分类筛选事件
        item.addEventListener('click', () => {
            categoryItems.forEach(cat => cat.classList.remove('active'));
            item.classList.add('active');
            
            let filteredData = allPdfData;
            if (category !== 'all') {
                filteredData = allPdfData.filter(pdf => pdf.category === category);
            }

            renderPdfList(filteredData);
            document.querySelector('.data-header h2').innerHTML = 
                `${getCategoryName(category)} <span class="total-count">（共${filteredData.length}份）</span>`;
        });
    });
}

// 5. 渲染最新更新（前5条）
function renderUpdateLog() {
    const logContainer = document.getElementById('update-log-list');
    logContainer.innerHTML = '';

    // 按更新时间排序（新→旧）
    const sortedData = [...allPdfData].sort((a, b) => 
        new Date(b.updateTime) - new Date(a.updateTime)
    );
    const latestData = sortedData.slice(0, 5);

    latestData.forEach(pdf => {
        const logItem = document.createElement('p');
        logItem.textContent = `${pdf.updateTime}：新增《${pdf.title}》`;
        logContainer.appendChild(logItem);
    });

    if (latestData.length === 0) {
        logContainer.innerHTML = '<p>暂无更新记录</p>';
    }
}

// 6. 渲染下载TOP5
function renderDownloadRank() {
    const rankContainer = document.getElementById('rank-list');
    rankContainer.innerHTML = '';

    // 按下载量排序（多→少）
    const sortedData = [...allPdfData].sort((a, b) => b.downloadCount - a.downloadCount);
    const topData = sortedData.slice(0, 5);

    topData.forEach((pdf, index) => {
        const rankItem = document.createElement('div');
        rankItem.className = 'rank-item';
        rankItem.innerHTML = `
            <span class="rank-num">${index + 1}</span>
            <span class="rank-name">${pdf.title}</span>
            <span class="rank-count">${pdf.downloadCount}次</span>
        `;
        rankContainer.appendChild(rankItem);
    });

    if (topData.length === 0) {
        rankContainer.innerHTML = '<p class="no-rank">暂无下载数据</p>';
    }
}

// 7. 绑定收藏按钮事件
function bindCollectBtns() {
    const collectBtns = document.querySelectorAll('.collect-btn');
    collectBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const pdfId = btn.getAttribute('data-id');
            const pdfTitle = btn.getAttribute('data-title');
            const pdfUrl = btn.getAttribute('data-url');

            // 切换收藏状态
            const isCollected = favoritePdfs.some(item => item.id === pdfId);
            if (isCollected) {
                // 取消收藏
                favoritePdfs = favoritePdfs.filter(item => item.id !== pdfId);
                btn.textContent = '收藏';
                btn.style.backgroundColor = '#f1faff';
                btn.style.color = '#567cb2';
            } else {
                // 添加收藏
                favoritePdfs.push({ id: pdfId, title: pdfTitle, url: pdfUrl });
                btn.textContent = '已收藏';
                btn.style.backgroundColor = '#567cb2';
                btn.style.color = '#fff';
            }

            // 保存收藏数据
            saveFavoriteData();
            // 重新渲染收藏列表
            renderFavoriteList();
        });
    });
}

// 8. 保存收藏数据（本地+后端同步）
function saveFavoriteData() {
    // 保存到本地存储
    localStorage.setItem('techwaveFavorites', JSON.stringify(favoritePdfs));
    
    // 登录状态下同步到后端
    if (isLogin && userToken) {
        fetch('/api/user/favorites', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userToken}`
            },
            body: JSON.stringify({ favorites: favoritePdfs })
        })
        .then(response => response.json())
        .catch(err => console.error('收藏同步失败：', err));
    }
}

// 9. 渲染收藏列表
function renderFavoriteList() {
    const favoriteContainer = document.getElementById('favorite-list');
    favoriteContainer.innerHTML = '';

    if (favoritePdfs.length === 0) {
        favoriteContainer.innerHTML = '<p class="empty-tip">暂无收藏，点击PDF旁的"收藏"按钮添加</p>';
        return;
    }

    favoritePdfs.forEach(item => {
        const favoriteItem = document.createElement('div');
        favoriteItem.className = 'favorite-item';
        favoriteItem.innerHTML = `
            <a href="${item.url}" target="_blank">${item.title}</a>
            <button class="remove-favorite" data-id="${item.id}">×</button>
        `;
        favoriteContainer.appendChild(favoriteItem);
    });

    // 绑定取消收藏事件
    document.querySelectorAll('.remove-favorite').forEach(btn => {
        btn.addEventListener('click', () => {
            const pdfId = btn.getAttribute('data-id');
            // 移除收藏
            favoritePdfs = favoritePdfs.filter(item => item.id !== pdfId);
            // 保存并更新UI
            saveFavoriteData();
            renderFavoriteList();
            // 更新PDF列表中的收藏按钮
            const collectBtn = document.querySelector(`.collect-btn[data-id="${pdfId}"]`);
            if (collectBtn) {
                collectBtn.textContent = '收藏';
                collectBtn.style.backgroundColor = '#f1faff';
                collectBtn.style.color = '#567cb2';
            }
        });
    });
}

// 10. 绑定搜索事件
function bindSearchEvent() {
    const searchInput = document.getElementById('pdf-search');
    const searchBtn = document.querySelector('.search-btn');

    function handleSearch() {
        const keyword = searchInput.value.trim().toLowerCase();
        if (!keyword) {
            renderPdfList(allPdfData);
            return;
        }

        // 模糊匹配标题/描述
        const filteredData = allPdfData.filter(pdf => 
            pdf.title.toLowerCase().includes(keyword) || 
            pdf.desc.toLowerCase().includes(keyword)
        );
        renderPdfList(filteredData);
    }

    searchBtn.addEventListener('click', handleSearch);
    searchInput.addEventListener('keyup', (e) => e.key === 'Enter' && handleSearch());
}

// 11. 绑定排序事件
function bindSortEvent() {
    const sortSelect = document.getElementById('sort-type');
    sortSelect.addEventListener('change', (e) => {
        const sortType = e.target.value;
        let sortedData = [...allPdfData];

        switch (sortType) {
            case 'newest':
                // 按更新时间排序（新→旧）
                sortedData.sort((a, b) => new Date(b.updateTime) - new Date(a.updateTime));
                break;
            case 'hot':
                // 按下载量排序（多→少）
                sortedData.sort((a, b) => b.downloadCount - a.downloadCount);
                break;
            case 'name':
                // 按名称排序（A→Z）
                sortedData.sort((a, b) => a.title.localeCompare(b.title));
                break;
        }

        renderPdfList(sortedData);
    });
}

// 12. 登录状态下从后端获取收藏
function fetchBackendFavorites() {
    fetch('/api/user/favorites', {
        headers: { 'Authorization': `Bearer ${userToken}` }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success && data.favorites) {
            favoritePdfs = data.favorites;
            localStorage.setItem('techwaveFavorites', JSON.stringify(favoritePdfs));
            renderFavoriteList();
            renderPdfList(allPdfData); // 重新渲染PDF列表以更新收藏状态
        }
    })
    .catch(err => console.error('获取后端收藏失败：', err));
}