// ==UserScript==
// @name         Telegraph 图片导出工具 (轻量极速重构版)
// @namespace    https://telegra.ph
// @version      1.0
// @description  轻量级导出图片链接、Markdown，极速并行打包下载ZIP
// @author       winterkingdom
// @source       https://github.com/youkk425/telegraphGreasyFork
// @match        *://telegra.ph/*
// @require      https://cdn.jsdelivr.net/npm/jszip@3.7.1/dist/jszip.min.js
// @grant        none
// @license      MIT
// ==/UserScript==

/* global JSZip */

(function () {
    'use strict';

    // 注入按钮动画样式
    function injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* 按钮基础样式 */
            .telegraph-export-btn {
                margin-left: 8px;
                padding: 6px 14px;
                border-radius: 6px;
                cursor: pointer;
                border: none;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: #fff;
                font-size: 13px;
                font-weight: 500;
                box-shadow: 0 2px 8px rgba(102, 126, 234, 0.4);
                transition: all 0.3s ease;
                position: relative;
                overflow: hidden;
            }

            /* 按钮悬停渐变色变化 */
            .telegraph-export-btn:hover {
                background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                box-shadow: 0 4px 15px rgba(240, 147, 251, 0.5);
                transform: translateY(-2px);
            }

            /* 晃动动画 */
            @keyframes shake {
                0%, 100% { transform: translateX(0) rotate(0deg); }
                10% { transform: translateX(-2px) rotate(-1deg); }
                20% { transform: translateX(2px) rotate(1deg); }
                30% { transform: translateX(-2px) rotate(-1deg); }
                40% { transform: translateX(2px) rotate(1deg); }
                50% { transform: translateX(-1px) rotate(0deg); }
                60% { transform: translateX(1px) rotate(0deg); }
                70% { transform: translateX(-1px) rotate(0deg); }
                80% { transform: translateX(1px) rotate(0deg); }
                90% { transform: translateX(-1px) rotate(0deg); }
            }

            /* 悬停时触发晃动 */
            .telegraph-export-btn:hover {
                animation: shake 0.6s ease-in-out;
            }

            /* 点击反馈 */
            .telegraph-export-btn:active {
                transform: translateY(0) scale(0.96);
                box-shadow: 0 2px 5px rgba(102, 126, 234, 0.3);
            }
        `;
        document.head.appendChild(style);
    }

    // 页面加载时注入样式
    injectStyles();

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
        const createBtn = (text, handler) => {
            const btn = document.createElement('button');
            btn.textContent = text;
            btn.className = 'telegraph-export-btn';
            btn.addEventListener('click', handler);
            return btn;
        };

        // 直接添加功能按钮
        container.appendChild(createBtn('导出TXT', exportTxt));
        container.appendChild(createBtn('导出MD', exportMd));
        container.appendChild(createBtn('打包ZIP', packZip));
    }

    // 获取图片列表
    function getImages() {
        const imgs = document.querySelectorAll('.ql-editor img');
        if (!imgs.length) {
            alert('当前页面未找到图片');
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
    }

    // 功能：导出Markdown
    function exportMd() {
        const imgs = getImages();
        if (!imgs) return;
        const title = document.title.trim();
        const content = `# ${title}\n\n` + imgs.map(i => `![](${i.src})`).join('\n\n');
        downloadFile(content, `${title}.md`);
    }

    // 功能：极速打包下载 (并行下载优化)
    async function packZip() {
        const imgs = getImages();
        if (!imgs) return;

        if (typeof JSZip === 'undefined') {
            alert('打包组件加载失败，请刷新页面重试');
            return;
        }

        const zip = new JSZip();
        const folder = zip.folder(document.title.trim() || 'images');

        // 创建状态提示框
        const status = document.createElement('div');
        // 使用模板字符串分行定义样式，提高可读性
        status.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.8);
            color: #fff;
            padding: 10px 15px;
            border-radius: 5px;
            z-index: 9999;
            font-size: 14px;
        `;
        document.body.appendChild(status);

        let count = 0;
        const total = imgs.length;

        // 并行下载所有图片
        const tasks = imgs.map(async (img, index) => {
            try {
                const response = await fetch(img.src);
                const blob = await response.blob();
                // 提取扩展名，默认webp
                const ext = img.src.split('.').pop().split(/#|\?/)[0] || 'webp';
                folder.file(`image_${index + 1}.${ext}`, blob);
            } catch (e) {
                console.error(`图片 ${index + 1} 下载失败`, e);
            } finally {
                // 更新进度
                count++;
                status.textContent = `正在下载 ${count}/${total}...`;
            }
        });

        // 等待所有下载任务完成
        await Promise.all(tasks);

        status.textContent = '正在生成压缩包...';

        try {
            const content = await zip.generateAsync({ type: 'blob' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(content);
            link.download = `${document.title.trim()}.zip`;
            link.click();
            URL.revokeObjectURL(link.href);
        } catch (e) {
            console.error(e);
            alert('打包失败');
        } finally {
            status.remove();
        }
    }

})();