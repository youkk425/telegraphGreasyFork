// ==UserScript==
// @name         Telegraph 图片导出工具 (轻量极速重构版)
// @namespace    https://telegra.ph
// @version      1.1.1
// @description  轻量级导出图片链接、Markdown，极速并行打包下载ZIP
// @author       winterkingdom
// @source       https://github.com/youkk425/telegraphGreasyFork
// @match        *://telegra.ph/*
// @require      https://update.greasyfork.org/scripts/577173/1819105/advanced-stylesjs.js
// @require      https://cdn.jsdelivr.net/npm/jszip@3.7.1/dist/jszip.min.js
// @grant        none
// @license      MIT
// ==/UserScript==

/* global JSZip */

(function () {
    'use strict';

    // 注入高级样式
    if (window.TelegraphAdvancedStyles) {
        window.TelegraphAdvancedStyles.inject();
    }

    // 等待页面头部加载
    const timer = setInterval(() => {
        const headerAddress = document.querySelector('header address');
        if (headerAddress) {
            clearInterval(timer);
            initUI(headerAddress);
        }
    }, 200);

    // 初始化界面按钮
    function initUI(container) {
        const createBtn = (text, handler, color = 'var(--tg-primary)') => {
            const btn = document.createElement('button');
            btn.className = 'telegraph-btn';
            btn.textContent = text;
            btn.style.background = `linear-gradient(135deg, ${color}, ${adjustColor(color, -20)})`;
            btn.style.padding = '8px 16px';
            btn.style.fontSize = '14px';

            // 波纹效果
            btn.addEventListener('click', function(e) {
                const ripple = document.createElement('span');
                ripple.className = 'telegraph-btn-ripple';
                const rect = btn.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                ripple.style.width = ripple.style.height = size + 'px';
                ripple.style.left = e.clientX - rect.left - size / 2 + 'px';
                ripple.style.top = e.clientY - rect.top - size / 2 + 'px';
                btn.appendChild(ripple);
                setTimeout(() => ripple.remove(), 600);
            });

            btn.addEventListener('click', handler);
            return btn;
        };

        // 直接添加功能按钮
        container.appendChild(createBtn('📋 导出TXT', exportTxt, '#667eea'));
        container.appendChild(createBtn('📝 导出MD', exportMd, '#764ba2'));
        container.appendChild(createBtn('📦 打包ZIP', packZip, '#f093fb'));
    }

    // 获取图片列表
    function getImages() {
        const imgs = document.querySelectorAll('.ql-editor img');
        if (!imgs.length) {
            showToast('当前页面未找到图片', 'error');
            return null;
        }
        return Array.from(imgs);
    }

    // 触发文件下载
    function downloadFile(content, filename) {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(new Blob([content]));
        link.download = filename;
        link.click();
        URL.revokeObjectURL(link.href);
    }

    // 创建通用下载窗口
    function createDownloadWindow(titleText, showProgress = false) {
        // 创建遮罩层
        const overlay = document.createElement('div');
        overlay.className = 'telegraph-modal-overlay';

        // 创建弹窗 - 居中显示
        const modal = document.createElement('div');
        modal.className = 'telegraph-modal';
        modal.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            min-width: 300px;
            z-index: 10000;
        `;

        const title = document.createElement('h3');
        title.textContent = titleText;
        title.style.margin = '0 0 15px';
        title.style.textAlign = 'center';
        modal.appendChild(title);

        let progressFill = null;
        let countText = null;

        if (showProgress) {
            const progressContainer = document.createElement('div');
            progressContainer.className = 'telegraph-progress-bar';
            progressFill = document.createElement('div');
            progressFill.className = 'telegraph-progress-fill';
            progressFill.style.width = '0%';
            progressContainer.appendChild(progressFill);
            modal.appendChild(progressContainer);

            countText = document.createElement('div');
            countText.style.textAlign = 'center';
            countText.style.marginTop = '10px';
            countText.style.fontSize = '14px';
            countText.style.color = '#666';
            countText.textContent = '0 / 0';
            modal.appendChild(countText);
        }

        // 添加取消按钮
        const btnContainer = document.createElement('div');
        btnContainer.style.display = 'flex';
        btnContainer.style.justifyContent = 'center';
        btnContainer.style.gap = '10px';
        btnContainer.style.marginTop = '15px';

        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = '取消';
        cancelBtn.className = 'telegraph-btn';
        cancelBtn.style.background = 'linear-gradient(135deg, #ff6b6b, #ee5a5a)';
        cancelBtn.style.padding = '8px 16px';
        cancelBtn.style.fontSize = '14px';

        btnContainer.appendChild(cancelBtn);
        modal.appendChild(btnContainer);
        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        return {
            overlay,
            modal,
            title,
            progressFill,
            countText,
            cancelBtn
        };
    }

    // 功能：导出纯文本链接
    function exportTxt() {
        const imgs = getImages();
        if (!imgs) return;

        // 创建下载窗口
        const { overlay, cancelBtn } = createDownloadWindow('准备导出TXT...');

        // 设置取消按钮事件
        let cancelled = false;
        cancelBtn.addEventListener('click', () => {
            cancelled = true;
            overlay.classList.add('hiding');
            setTimeout(() => overlay.remove(), 200);
            showToast('已取消导出', 'info');
        });

        // 模拟处理过程
        setTimeout(() => {
            if (cancelled) return;
            const content = imgs.map(i => i.src).join('\n');
            downloadFile(content, `${document.title}.txt`);
            overlay.classList.add('hiding');
            setTimeout(() => overlay.remove(), 200);
            showToast('✓ 导出TXT成功', 'success');
        }, 500);
    }

    // 功能：导出Markdown
    function exportMd() {
        const imgs = getImages();
        if (!imgs) return;

        // 创建下载窗口
        const { overlay, cancelBtn } = createDownloadWindow('准备导出Markdown...');

        // 设置取消按钮事件
        let cancelled = false;
        cancelBtn.addEventListener('click', () => {
            cancelled = true;
            overlay.classList.add('hiding');
            setTimeout(() => overlay.remove(), 200);
            showToast('已取消导出', 'info');
        });

        // 模拟处理过程
        setTimeout(() => {
            if (cancelled) return;
            const title = document.title.trim();
            const content = `# ${title}\n\n` + imgs.map(i => `![](${i.src})`).join('\n\n');
            downloadFile(content, `${title}.md`);
            overlay.classList.add('hiding');
            setTimeout(() => overlay.remove(), 200);
            showToast('✓ 导出Markdown成功', 'success');
        }, 500);
    }

    // 功能：极速打包下载 (并行下载优化)
    async function packZip() {
        const imgs = getImages();
        if (!imgs) return;

        if (typeof JSZip === 'undefined') {
            showToast('打包组件加载失败，请刷新页面重试', 'error');
            return;
        }

        // 创建下载窗口 - 带进度条
        const { overlay, title, progressFill, countText, cancelBtn } = createDownloadWindow('正在下载图片...', true);

        let cancelled = false;
        let completedCount = 0;
        const total = imgs.length;

        // 设置取消按钮事件
        cancelBtn.addEventListener('click', () => {
            cancelled = true;
            overlay.classList.add('hiding');
            setTimeout(() => overlay.remove(), 200);
            showToast('已取消打包', 'info');
        });

        const zip = new JSZip();
        const folder = zip.folder(document.title.trim() || 'images');

        // 并行下载所有图片
        const tasks = imgs.map(async (img, index) => {
            if (cancelled) return;

            try {
                const response = await fetch(img.src);
                const blob = await response.blob();
                const ext = img.src.split('.').pop().split(/#|\?/)[0] || 'webp';
                folder.file(`image_${index + 1}.${ext}`, blob);
            } catch (e) {
                console.error(`图片 ${index + 1} 下载失败`, e);
            } finally {
                if (cancelled) return;

                completedCount++;
                const progress = (completedCount / total) * 100;
                if (progressFill) {
                    progressFill.style.width = `${progress}%`;
                }
                if (countText) {
                    countText.textContent = `${completedCount} / ${total}`;
                }
            }
        });

        // 等待所有下载任务完成
        await Promise.all(tasks);

        if (cancelled) return;

        if (title) {
            title.textContent = '正在生成压缩包...';
        }

        try {
            const content = await zip.generateAsync({ type: 'blob' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(content);
            link.download = `${document.title.trim()}.zip`;
            link.click();
            URL.revokeObjectURL(link.href);

            overlay.classList.add('hiding');
            setTimeout(() => overlay.remove(), 200);
            showToast('✓ 打包完成，开始下载', 'success');
        } catch (e) {
            console.error(e);
            overlay.classList.add('hiding');
            setTimeout(() => overlay.remove(), 200);
            showToast('✕ 打包失败', 'error');
        }
    }

    // Toast 提示函数
    function showToast(message, type = 'info') {
        const existingToast = document.querySelector('.telegraph-toast');
        if (existingToast) {
            existingToast.remove();
        }

        const toast = document.createElement('div');
        toast.className = `telegraph-toast ${type}`;

        const icon = document.createElement('span');
        icon.className = 'telegraph-toast-icon';
        icon.textContent = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';
        toast.appendChild(icon);

        const msg = document.createElement('span');
        msg.textContent = message;
        toast.appendChild(msg);

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('hiding');
            setTimeout(() => toast.remove(), 300);
        }, 2500);
    }

    // 辅助函数：调整颜色亮度
    function adjustColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }

})();
