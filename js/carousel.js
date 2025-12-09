// 公告弹窗功能
document.addEventListener('DOMContentLoaded', function() {
    const popup = document.getElementById('announcementPopup');
    const contentDiv = document.getElementById('announcementContent');
    const closeBtn = document.querySelector('.popup-close-btn');

    // 检查是否今天已经显示过弹窗（避免重复显示）
    const today = new Date().toDateString();
    if (!localStorage.getItem('announcementShown_' + today)) {
        // 读取根目录的announcement.txt文件
        fetch('announcement.txt')
            .then(response => {
                if (!response.ok) {
                    throw new Error('无法找到公告文件');
                }
                return response.text();
            })
            .then(text => {
                contentDiv.textContent = text;
                popup.classList.add('show');
                // 标记今天已显示
                localStorage.setItem('announcementShown_' + today, 'true');
            })
            .catch(error => {
                console.error('加载公告失败:', error);
                contentDiv.textContent = '公告加载失败，请稍后再试';
                popup.classList.add('show');
            });
    }

    // 关闭弹窗
    closeBtn.addEventListener('click', function() {
        popup.classList.remove('show');
    });

    // 点击弹窗外部关闭
    popup.addEventListener('click', function(e) {
        if (e.target === popup) {
            popup.classList.remove('show');
        }
    });
});

// 轮播逻辑
document.addEventListener('DOMContentLoaded', function() {
    const slides = document.querySelectorAll('.banner-slide');
    let currentIndex = 0;
    
    function showSlide(index) {
        slides.forEach(slide => slide.classList.remove('active'));
        slides[index].classList.add('active');
    }
    
    function nextSlide() {
        currentIndex = (currentIndex + 1) % slides.length;
        showSlide(currentIndex);
    }
    
    // 每5秒切换一次图片
    setInterval(nextSlide, 5000);
});

// 回到顶部按钮逻辑（保持不变）
const backToTopBtn = document.querySelector('.back-to-top');
window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
        backToTopBtn.style.display = 'block';
    } else {
        backToTopBtn.style.display = 'none';
    }
});
backToTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// 二维码弹窗逻辑（优化交互）
const qrcodeBtn = document.querySelector('.qrcode-btn');
const qrcodePopup = document.querySelector('.qrcode-popup');
const closeBtn = document.querySelector('.close-btn');

// 页面加载后强制隐藏弹窗
document.addEventListener('DOMContentLoaded', function() {
    qrcodePopup.style.display = 'none';
    qrcodePopup.classList.remove('show');
});

// 点击二维码按钮显示弹窗（阻止冒泡）
qrcodeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    qrcodePopup.style.display = 'block';
    qrcodePopup.classList.add('show');
});

// 点击关闭按钮隐藏弹窗
closeBtn.addEventListener('click', () => {
    qrcodePopup.style.display = 'none';
    qrcodePopup.classList.remove('show');
});

// 点击页面任意位置关闭弹窗（核心优化）
document.addEventListener('click', () => {
    qrcodePopup.style.display = 'none';
    qrcodePopup.classList.remove('show');
});

// 阻止点击弹窗内部时关闭（仅点击外部关闭）
qrcodePopup.addEventListener('click', (e) => {
    e.stopPropagation();
});

