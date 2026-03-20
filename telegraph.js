// ==UserScript==
// @name         【免费完整版】Telegraph 批量插入图床图片链接 + 简介工具
// @namespace    github.com/youkk425
// @version      1.0
// @description  批量插入图床图片链接 + 拖拽排序 + 一键清空列表 + 清除空行 + 快速添加带标签的简介信息（插入主内容区开头）
// @author       重写版（基于原脚本功能）
// @source       https://github.com/youkk425/telegraphGreasyFork
// @license      LGPL-3.0
// @match        https://telegra.ph/*
// @grant        none
// @require      https://cdn.jsdelivr.net/npm/sortablejs@1.15.0/Sortable.min.js
// ==/UserScript==

/* global Sortable */

//原脚本：https://greasyfork.org/zh-CN/scripts/532270

(function () {
    'use strict';

    let imageLinks = [];
    let sortedLinks = [];

    // ==================== 1. 创建左侧三个固定按钮 ====================
    const insertBtn = document.createElement('button');
    insertBtn.textContent = '📷 批量插入图片';
    Object.assign(insertBtn.style, {
        position: 'fixed', top: '10px', left: '10px',
        zIndex: '9999', padding: '8px 12px',
        background: '#4caf50', color: 'white',
        border: 'none', borderRadius: '6px', cursor: 'pointer',
        fontSize: '14px', fontWeight: 'bold'
    });
    document.body.appendChild(insertBtn);
    insertBtn.addEventListener('click', showInputBox);

    const introBtn = document.createElement('button');
    introBtn.textContent = '📝 添加简介';
    Object.assign(introBtn.style, {
        position: 'fixed', top: '10px', left: '170px',
        zIndex: '9999', padding: '8px 12px',
        background: '#9c27b0', color: 'white',
        border: 'none', borderRadius: '6px', cursor: 'pointer',
        fontSize: '14px', fontWeight: 'bold'
    });
    document.body.appendChild(introBtn);
    introBtn.addEventListener('click', showIntroPanel);

    const clearBtn = document.createElement('button');
    clearBtn.textContent = '🧹 清除空行';
    Object.assign(clearBtn.style, {
        position: 'fixed', top: '10px', left: '330px',
        zIndex: '9999', padding: '8px 12px',
        background: '#ff9800', color: 'white',
        border: 'none', borderRadius: '6px', cursor: 'pointer',
        fontSize: '14px', fontWeight: 'bold'
    });
    document.body.appendChild(clearBtn);
    clearBtn.addEventListener('click', clearEmptyLines);

    // ==================== 2. 输入框（粘贴链接） – 保持不变 ====================
    function showInputBox() {
        const overlay = document.createElement('div');
        Object.assign(overlay.style, {
            position: 'fixed', inset: '0',
            background: 'rgba(0,0,0,0.5)', zIndex: '10000',
            display: 'flex', justifyContent: 'center', alignItems: 'center'
        });

        const box = document.createElement('div');
        Object.assign(box.style, {
            background: '#fff', padding: '25px', borderRadius: '10px',
            width: '500px', maxWidth: '90vw', boxShadow: '0 6px 20px rgba(0,0,0,0.4)',
            display: 'flex', flexDirection: 'column', alignItems: 'center'
        });

        const title = document.createElement('h3');
        title.textContent = '批量插入图床图片链接';
        title.style.marginBottom = '15px';
        box.appendChild(title);

        const textarea = document.createElement('textarea');
        textarea.placeholder = '每行一个图片直链（jpg/png/webp/gif 等）';
        Object.assign(textarea.style, {
            width: '100%', height: '220px', marginBottom: '15px',
            padding: '12px', fontSize: '14px',
            border: '1px solid #ddd', borderRadius: '6px', resize: 'vertical'
        });
        box.appendChild(textarea);

        const buttonRow = document.createElement('div');
        Object.assign(buttonRow.style, {
            display: 'flex', justifyContent: 'space-between', width: '100%', gap: '10px'
        });

        const confirmBtn = document.createElement('button');
        confirmBtn.textContent = '✅ 确认并排序';
        styleBtn(confirmBtn);
        confirmBtn.style.background = '#4caf50';
        confirmBtn.onclick = () => {
            imageLinks = textarea.value.split('\n')
                .map(line => line.trim())
                .filter(line => line && /^https?:\/\/.*\.(jpe?g|png|webp|gif|bmp)$/i.test(line));
            overlay.remove();
            if (imageLinks.length === 0) {
                alert('未检测到有效的图片链接');
                return;
            }
            showSortBox();
        };

        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = '取消';
        styleBtn(cancelBtn);
        cancelBtn.onclick = () => overlay.remove();

        buttonRow.appendChild(confirmBtn);
        buttonRow.appendChild(cancelBtn);
        box.appendChild(buttonRow);
        overlay.appendChild(box);
        document.body.appendChild(overlay);
    }

    // ==================== 3. 拖拽排序预览框 – 保持不变 ====================
    function showSortBox() {
        const overlay = document.createElement('div');
        Object.assign(overlay.style, {
            position: 'fixed', inset: '0',
            background: 'rgba(0,0,0,0.5)', zIndex: '10000',
            display: 'flex', justifyContent: 'center', alignItems: 'center'
        });

        const box = document.createElement('div');
        Object.assign(box.style, {
            background: '#fff', padding: '20px', borderRadius: '10px',
            width: '860px', maxWidth: '95vw', maxHeight: '88vh', overflow: 'auto',
            boxShadow: '0 8px 25px rgba(0,0,0,0.35)',
            display: 'flex', flexDirection: 'column'
        });

        const title = document.createElement('h3');
        title.textContent = `拖拽排序图片（共 ${imageLinks.length} 张）`;
        title.style.marginBottom = '10px';
        title.style.textAlign = 'center';
        box.appendChild(title);

        const hint = document.createElement('p');
        hint.textContent = '鼠标拖动图片调整顺序 → 确认后插入编辑器';
        hint.style.fontSize = '13px';
        hint.style.color = '#666';
        hint.style.marginBottom = '15px';
        hint.style.textAlign = 'center';
        box.appendChild(hint);

        const sortableContainer = document.createElement('div');
        Object.assign(sortableContainer.style, {
            display: 'flex', flexWrap: 'wrap', gap: '12px',
            padding: '15px', background: '#f8f9fa',
            border: '2px dashed #ccc', borderRadius: '8px',
            minHeight: '320px'
        });

        imageLinks.forEach((link, i) => {
            const item = document.createElement('div');
            item.dataset.url = link;
            Object.assign(item.style, {
                width: '160px', cursor: 'move',
                border: '2px solid #ddd', borderRadius: '6px',
                padding: '6px', background: '#fff',
                textAlign: 'center', transition: 'all 0.2s'
            });

            const img = document.createElement('img');
            img.src = link;
            Object.assign(img.style, {
                maxWidth: '100%', maxHeight: '140px',
                objectFit: 'contain', borderRadius: '4px'
            });
            img.onerror = () => { item.style.opacity = '0.45'; item.title = '图片加载失败'; };

            const label = document.createElement('div');
            label.textContent = `图${i + 1}`;
            label.style.fontSize = '12px';
            label.style.marginTop = '6px';
            label.style.color = '#666';

            item.appendChild(img);
            item.appendChild(label);
            sortableContainer.appendChild(item);
        });

        box.appendChild(sortableContainer);

        new Sortable(sortableContainer, {
            animation: 180,
            ghostClass: 'sortable-ghost',
            chosenClass: 'sortable-chosen',
            forceFallback: true,
            easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
        });

        const buttonRow = document.createElement('div');
        Object.assign(buttonRow.style, {
            display: 'flex', justifyContent: 'space-between',
            marginTop: '20px', gap: '12px'
        });

        const clearAllBtn = document.createElement('button');
        clearAllBtn.textContent = '全部清空列表';
        styleBtn(clearAllBtn);
        clearAllBtn.style.background = '#f44336';
        clearAllBtn.onclick = () => {
            if (confirm('确定清空当前图片列表？（不影响已插入内容）')) {
                imageLinks = [];
                overlay.remove();
            }
        };

        const confirmBtn = document.createElement('button');
        confirmBtn.textContent = '✅ 确认插入编辑器';
        styleBtn(confirmBtn);
        confirmBtn.style.background = '#4caf50';
        confirmBtn.style.flex = '1';
        confirmBtn.onclick = () => {
            sortedLinks = Array.from(sortableContainer.children)
                .map(item => item.dataset.url)
                .filter(Boolean);
            overlay.remove();
            insertImages(sortedLinks);
        };

        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = '取消';
        styleBtn(cancelBtn);
        cancelBtn.onclick = () => overlay.remove();

        buttonRow.appendChild(clearAllBtn);
        buttonRow.appendChild(confirmBtn);
        buttonRow.appendChild(cancelBtn);
        box.appendChild(buttonRow);

        overlay.appendChild(box);
        document.body.appendChild(overlay);
    }

    // ==================== 4. 插入图片到编辑器 – 保持不变 ====================
    function insertImages(links) {
        const editor = document.querySelector('div[contenteditable="true"]');
        if (!editor) {
            alert('未找到 Telegraph 编辑器区域');
            return;
        }

        let range;
        const sel = window.getSelection();

        if (sel.rangeCount > 0 && editor.contains(sel.anchorNode)) {
            range = sel.getRangeAt(0);
        } else {
            range = document.createRange();
            range.selectNodeContents(editor);
            range.collapse(false);
        }

        const fragment = document.createDocumentFragment();

        links.forEach(url => {
            if (!url) return;

            const p = document.createElement('p');
            const img = document.createElement('img');
            img.src = url;
            Object.assign(img.style, {
                maxWidth: '100%', height: 'auto',
                display: 'block', margin: '12px auto',
                borderRadius: '4px'
            });

            p.appendChild(img);
            fragment.appendChild(p);
        });

        range.insertNode(fragment);
        range.setStartAfter(fragment.lastChild || fragment);
        range.setEndAfter(fragment.lastChild || fragment);
        sel.removeAllRanges();
        sel.addRange(range);

        setTimeout(clearEmptyLines, 800);
    }

    // ==================== 5. 清除空行 – 保持不变 ====================
    function clearEmptyLines() {
        const editor = document.querySelector('div[contenteditable="true"]');
        if (!editor) return;

        let count = 0;

        editor.querySelectorAll('p').forEach(p => {
            if (!p.textContent.trim() && !p.querySelector('img, figure, iframe, video')) {
                p.remove();
                count++;
            }
        });

        editor.querySelectorAll('br').forEach(br => {
            const parent = br.parentElement;
            if (!parent) return;
            if ((!br.previousSibling || (br.previousSibling.nodeType === 3 && !br.previousSibling.textContent.trim())) &&
                (!br.nextSibling || (br.nextSibling.nodeType === 3 && !br.nextSibling.textContent.trim()))) {
                br.remove();
                count++;
            }
        });

        if (count > 0) {
            console.log(`已移除 ${count} 个空行/空段落`);
        }
    }

    // ==================== 6. 简介面板 – 带标签插入 ====================
    function showIntroPanel() {
        const overlay = document.createElement('div');
        Object.assign(overlay.style, {
            position: 'fixed', inset: '0',
            background: 'rgba(0,0,0,0.5)', zIndex: '10000',
            display: 'flex', justifyContent: 'center', alignItems: 'center'
        });

        const panel = document.createElement('div');
        Object.assign(panel.style, {
            background: '#fff', padding: '24px', borderRadius: '10px',
            width: '420px', maxWidth: '90vw', boxShadow: '0 8px 30px rgba(0,0,0,0.3)'
        });

        const titleEl = document.createElement('h3');
        titleEl.textContent = '快速插入简介信息（带标签）';
        titleEl.style.margin = '0 0 20px';
        titleEl.style.textAlign = 'center';
        panel.appendChild(titleEl);

        const fields = [
            { key: 'title',label: '标题',placeholder: '文章标题' },
            { key: 'author',label: '作者',placeholder: '您的名字 / @ID' },
            { key: 'source',label: '原链接', placeholder: 'https://example.com' },
            { key: 'date',label: '发布日期', auto: true }
        ];

        const inputs = {};

        fields.forEach(f => {
            const row = document.createElement('div');
            row.style.marginBottom = '16px';

            const label = document.createElement('label');
            label.textContent = f.label;
            label.style.display = 'block';
            label.style.marginBottom = '6px';
            row.appendChild(label);

            if (f.auto) {
                const p = document.createElement('p');
                p.textContent = new Date().toLocaleDateString('zh-CN', {
                    year: 'numeric', month: 'long', day: 'numeric'
                });
                p.style.padding = '9px 12px';
                p.style.background = '#f5f5f5';
                p.style.borderRadius = '6px';
                row.appendChild(p);
            } else {
                const input = document.createElement('input');
                input.type = 'text';
                input.placeholder = f.placeholder;
                Object.assign(input.style, {
                    width: '100%', padding: '10px', fontSize: '14px',
                    border: '1px solid #ddd', borderRadius: '6px'
                });
                inputs[f.key] = input;
                row.appendChild(input);
            }

            panel.appendChild(row);
        });

        const btnRow = document.createElement('div');
        btnRow.style.display = 'flex';
        btnRow.style.gap = '12px';
        btnRow.style.marginTop = '24px';

        const confirm = document.createElement('button');
        confirm.textContent = '插入到内容区开头（带标签）';
        Object.assign(confirm.style, {
            flex: '1', padding: '12px', background: '#9c27b0',
            color: 'white', border: 'none', borderRadius: '6px',
            fontWeight: 'bold', cursor: 'pointer'
        });

        confirm.onclick = () => {
            const editor = document.querySelector('div[contenteditable="true"]');
            if (!editor) {
                alert('未找到编辑器');
                overlay.remove();
                return;
            }

            const frag = document.createDocumentFragment();

            const addLine = (text) => {
                if (!text) return;
                const p = document.createElement('p');
                p.textContent = text;
                frag.appendChild(p);
                frag.appendChild(document.createElement('br'));
            };

            // 标题
            if (inputs.title?.value.trim()) {
                addLine(`标题：${inputs.title.value.trim()}`);
            }

            // 作者
            if (inputs.author?.value.trim()) {
                addLine(`作者：${inputs.author.value.trim()}`);
            }

            // 原链接
            if (inputs.source?.value.trim()) {
                const text = inputs.source.value.trim();
                let lineText = `原链接：${text}`;

                if (/^https?:\/\//i.test(text)) {
                    const p = document.createElement('p');
                    const a = document.createElement('a');
                    a.href = text;
                    a.textContent = text;
                    a.target = '_blank';
                    a.rel = 'noopener noreferrer';
                    p.appendChild(document.createTextNode('原文：'));
                    p.appendChild(a);
                    frag.appendChild(p);
                    frag.appendChild(document.createElement('br'));
                } else {
                    addLine(lineText);
                }
            }

            // 发布日期（总是插入）
            addLine(`发布日期：${new Date().toLocaleDateString('zh-CN', {
                year: 'numeric', month: 'long', day: 'numeric'
            })}`);

            // 插入位置逻辑
            let firstP = editor.querySelector('p');
            if (firstP) {
                editor.insertBefore(frag, firstP);
                // 如果第一个 p 是空占位，移除它
                if (!firstP.textContent.trim() && !firstP.querySelector('*')) {
                    firstP.remove();
                }
            } else {
                editor.appendChild(frag);
            }

            overlay.remove();
            setTimeout(clearEmptyLines, 400);
        };

        const cancel = document.createElement('button');
        cancel.textContent = '取消';
        Object.assign(cancel.style, {
            padding: '12px 28px', background: '#e0e0e0',
            border: 'none', borderRadius: '6px', cursor: 'pointer'
        });
        cancel.onclick = () => overlay.remove();

        btnRow.appendChild(confirm);
        btnRow.appendChild(cancel);
        panel.appendChild(btnRow);

        overlay.appendChild(panel);
        document.body.appendChild(overlay);
    }

    // ==================== 辅助函数 ====================
    function styleBtn(btn) {
        Object.assign(btn.style, {
            padding: '10px 18px',
            color: 'white', border: 'none',
            borderRadius: '6px', cursor: 'pointer',
            fontSize: '14px', fontWeight: 'bold'
        });
    }

    console.log('Telegraph 批量插入 & 简介工具已加载');
})();