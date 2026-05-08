// ==UserScript==
// @name         Telegraph 图片导出工具 (轻量极速重构版)
// @namespace    https://telegra.ph
// @version      1.0
// @description  轻量级导出图片链接、Markdown，极速并行打包下载ZIP
// @author       winterkingdom
// @source       https://github.com/youkk425/telegraphGreasyFork
// @match        *://telegra.ph/*
// @require      file:///E:/GithubProject/telegraphGreasyFork/advanced-styles.js
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

    // 功能：导出纯文本链接
    function exportTxt() {
        const imgs = getImages();
        if (!imgs) return;
        const content = imgs.map(i => i.src).join('\n');
        downloadFile(content, `${document.title}.txt`);
        showToast('✓ 导出TXT成功', 'success');
    }

    // 功能：导出Markdown
    function exportMd() {
        const imgs = getImages();
        if (!imgs) return;
        const title = document.title.trim();
        const content = `# ${title}\n\n` + imgs.map(i => `![](${i.src})`).join('\n\n');
        downloadFile(content, `${title}.md`);
        showToast('✓ 导出Markdown成功', 'success');
    }

    // 功能：极速打包下载 (并行下载优化)
    async function packZip() {
        const imgs = getImages();
        if (!imgs) return;

        if (typeof JSZip === 'undefined') {
            showToast('打包组件加载失败，请刷新页面重试', 'error');
            return;
        }

        const zip = new JSZip();
        const folder = zip.folder(document.title.trim() || 'images');

        // 创建状态提示框 - 使用玻璃态
        const status = document.createElement('div');
        status.className = 'telegraph-modal';
        status.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            min-width: 300px;
            z-index: 10000;
        `;

        const title = document.createElement('h3');
        title.textContent = '正在下载图片...';
        title.style.margin = '0 0 15px';
        title.style.textAlign = 'center';
        status.appendChild(title);

        const progressContainer = document.createElement('div');
        progressContainer.className = 'telegraph-progress-bar';
        const progressFill = document.createElement('div');
        progressFill.className = 'telegraph-progress-fill';
        progressFill.style.width = '0%';
        progressContainer.appendChild(progressFill);
        status.appendChild(progressContainer);

        const countText = document.createElement('div');
        countText.style.textAlign = 'center';
        countText.style.marginTop = '10px';
        countText.style.fontSize = '14px';
        countText.style.color = '#666';
        countText.textContent = '0 / 0';
        status.appendChild(countText);

        const overlay = document.createElement('div');
        overlay.className = 'telegraph-modal-overlay';
        overlay.appendChild(status);
        document.body.appendChild(overlay);

        let count = 0;
        const total = imgs.length;

        // 并行下载所有图片
        const tasks = imgs.map(async (img, index) => {
            try {
                const response = await fetch(img.src);
                const blob = await response.blob();
                const ext = img.src.split('.').pop().split(/#|\?/)[0] || 'webp';
                folder.file(`image_${index + 1}.${ext}`, blob);
            } catch (e) {
                console.error(`图片 ${index + 1} 下载失败`, e);
            } finally {
                count++;
                const progress = (count / total) * 100;
                progressFill.style.width = `${progress}%`;
                countText.textContent = `${count} / ${total}`;
            }
        });

        // 等待所有下载任务完成
        await Promise.all(tasks);

        title.textContent = '正在生成压缩包...';

        try {
            const content = await zip.generateAsync({ type: 'blob' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(content);
            link.download = `${document.title.trim()}.zip`;
            link.click();
            URL.revokeObjectURL(link.href);

            // 成功动画
            showToast('✓ 打包完成，开始下载', 'success');
        } catch (e) {
            console.error(e);
            showToast('✕ 打包失败', 'error');
        } finally {
            // 淡出动画
            overlay.classList.add('hiding');
            setTimeout(() => overlay.remove(), 200);
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
