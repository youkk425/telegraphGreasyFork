// ==UserScript==
// @name         【免费完整版】Telegraph 批量插入图床图片链接 + 简介工具
// @namespace    github.com/youkk425
// @version      2.0
// @description  批量插入图床图片链接 + 拖拽排序 + 一键清空列表 + 清除空行 + 快速添加带标签的简介信息（插入主内容区开头）+ 新增移除简介和清空内容功能
// @author       重写版（基于原脚本功能）
// @source       https://github.com/youkk425/telegraphGreasyFork
// @license      LGPL-3.0
// @match        https://telegra.ph/*
// @grant        none
// @require      https://cdn.jsdelivr.net/npm/sortablejs@1.15.0/Sortable.min.js
// ==/UserScript==

/* global Sortable */

//原脚本：https://greasyfork.org/zh-CN/scripts/532270



/*

 * ============================================================================
 *                           v2.0 更新日志
 * ============================================================================
 * 1. 新增「移除简介」功能 - 一键移除已添加的简介信息
 * 2. 新增「清空内容」功能 - 一键清空编辑器所有内容
 * 3. 重新设计按钮布局 - 采用分组面板设计，更加合理美观
 * 4. 添加完整的代码注释和安全说明

*/



(function () {
    'use strict';

    // ============================================================================
    //                           全局变量声明
    // ============================================================================
    
    /**
     * 存储用户输入的原始图片链接数组
     * @type {string[]}
     * @description 在用户确认输入后填充，用于后续排序和插入操作
     * @security 注意：此数组存储用户原始输入，未经清理，使用时需验证
     */
    let imageLinks = [];
    
    /**
     * 存储排序后的图片链接数组
     * @type {string[]}
     * @description 用户完成拖拽排序后，按新顺序存储的链接
     */
    let sortedLinks = [];
    
    /**
     * 简介标识属性名
     * @type {string}
     * @description 用于标记自动插入的简介段落，便于后续移除
     */
    const INTRO_MARKER = 'data-telegraph-intro';

    // ============================================================================
    //                    创建工具栏面板
    // ============================================================================
    
    /**
     * 创建主工具栏面板
     * @description 采用分组设计，将功能按钮按类别分组
     */
    function createToolbar() {
        // 创建工具栏容器
        const toolbar = document.createElement('div');
        toolbar.id = 'telegraph-tool-toolbar';
        Object.assign(toolbar.style, {
            position: 'fixed',
            top: '10px',
            left: '10px',
            zIndex: '9999',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        });
        
        // ========== 图片操作组 ==========
        const imageGroup = createButtonGroup('🖼️ 图片操作', '#4caf50');
        
        const insertBtn = createButton('📷 批量插入图片', '#4caf50', showInputBox);
        imageGroup.appendChild(insertBtn);
        
        toolbar.appendChild(imageGroup);
        
        // ========== 简介操作组 ==========
        const introGroup = createButtonGroup('📝 简介操作', '#9c27b0');
        
        const addIntroBtn = createButton('➕ 添加简介', '#9c27b0', showIntroPanel);
        const removeIntroBtn = createButton('➖ 移除简介', '#e91e63', removeIntro);
        introGroup.appendChild(addIntroBtn);
        introGroup.appendChild(removeIntroBtn);
        
        toolbar.appendChild(introGroup);
        
        // ========== 清理操作组 ==========
        const clearGroup = createButtonGroup('🧹 清理操作', '#ff9800');
        
        const clearEmptyBtn = createButton('清除空行', '#ff9800', clearEmptyLines);
        const clearAllBtn = createButton('清空内容', '#f44336', clearAllContent);
        clearGroup.appendChild(clearEmptyBtn);
        clearGroup.appendChild(clearAllBtn);
        
        toolbar.appendChild(clearGroup);
        
        // 添加到页面
        document.body.appendChild(toolbar);
    }

    /**
     * 创建按钮分组容器
     * @param {string} title - 分组标题
     * @param {string} color - 主题颜色
     * @returns {HTMLElement} 分组容器元素
     */
    function createButtonGroup(title, color) {
        const group = document.createElement('div');
        Object.assign(group.style, {
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '8px',
            padding: '8px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            minWidth: '140px'
        });
        
        // 分组标题
        const groupTitle = document.createElement('div');
        groupTitle.textContent = title;
        Object.assign(groupTitle.style, {
            fontSize: '11px',
            fontWeight: 'bold',
            color: color,
            padding: '2px 4px',
            borderBottom: `1px solid ${color}33`,
            marginBottom: '2px'
        });
        group.appendChild(groupTitle);
        
        return group;
    }

    /**
     * 创建按钮元素
     * @param {string} text - 按钮文本
     * @param {string} bgColor - 背景颜色
     * @param {Function} clickHandler - 点击事件处理函数
     * @returns {HTMLElement} 按钮元素
     */
    function createButton(text, bgColor, clickHandler) {
        const btn = document.createElement('button');
        btn.textContent = text;
        Object.assign(btn.style, {
            padding: '8px 12px',
            background: bgColor,
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 'bold',
            transition: 'all 0.2s ease',
            whiteSpace: 'nowrap',
            textAlign: 'left'
        });
        
        // 鼠标悬停效果
        btn.addEventListener('mouseenter', () => {
            btn.style.transform = 'translateX(3px)';
            btn.style.boxShadow = '0 2px 6px rgba(0,0,0,0.2)';
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'translateX(0)';
            btn.style.boxShadow = 'none';
        });
        
        // 绑定点击事件
        btn.addEventListener('click', clickHandler);
        
        return btn;
    }

    // ============================================================================
    //                    移除简介功能
    // ============================================================================
    
    /**
     * 移除已添加的简介信息
     * @description 移除带有 INTRO_MARKER 标记的段落，以及符合简介格式的段落
     * @security 安全：只操作DOM元素，不执行用户输入
     */
    function removeIntro() {
        const editor = document.querySelector('div[contenteditable="true"]');
        if (!editor) {
            showToast('未找到编辑器', 'error');
            return;
        }

        let removedCount = 0;
        
        // 方法1：移除带有标记的简介段落
        const markedElements = editor.querySelectorAll(`[${INTRO_MARKER}]`);
        markedElements.forEach(el => {
            el.remove();
            removedCount++;
        });
        
        // 方法2：移除符合简介格式的段落（兼容旧版本添加的简介）
        // 简介格式：标题：xxx、作者：xxx、原链接：xxx、原文：xxx、发布日期：xxx
        const introPatterns = [
            /^标题[：:]/,
            /^作者[：:]/,
            /^原链接[：:]/,
            /^原文[：:]/,
            /^发布日期[：:]/
        ];
        
        editor.querySelectorAll('p').forEach(p => {
            const text = p.textContent.trim();
            // 检查是否匹配简介格式
            if (introPatterns.some(pattern => pattern.test(text))) {
                p.remove();
                removedCount++;
            }
        });
        
        // 清理简介后面跟着的空br
        let prevWasIntro = false;
        editor.querySelectorAll('br').forEach(br => {
            const parent = br.parentElement;
            if (!parent) return;
            
            // 如果前一个元素是被移除的简介，移除这个br
            if (prevWasIntro && (!br.previousSibling || !br.previousSibling.textContent?.trim())) {
                br.remove();
            }
            prevWasIntro = false;
        });
        
        // 清理可能残留的空行
        clearEmptyLines();
        
        if (removedCount > 0) {
            showToast(`已移除 ${removedCount} 条简介信息`, 'success');
        } else {
            showToast('未找到可移除的简介信息', 'info');
        }
    }

    // ============================================================================
    //                    清空所有内容功能
    // ============================================================================
    
    /**
     * 清空编辑器所有内容
     * @description 弹出确认对话框后清空编辑器
     * @security 安全：使用 confirm 防止误操作
     */
    function clearAllContent() {
        const editor = document.querySelector('div[contenteditable="true"]');
        if (!editor) {
            showToast('未找到编辑器', 'error');
            return;
        }
        
        // 检查编辑器是否有内容
        if (!editor.textContent.trim() && !editor.querySelector('img, figure, iframe, video, a')) {
            showToast('编辑器已经是空的', 'info');
            return;
        }
        
        // 弹出确认对话框
        if (confirm('⚠️ 确定要清空所有内容吗？\n\n此操作不可撤销！')) {
            // 保留编辑器元素，清空内容
            editor.innerHTML = '';
            
            // 创建一个空段落，保持编辑器可编辑状态
            const placeholder = document.createElement('p');
            placeholder.innerHTML = '<br>';
            editor.appendChild(placeholder);
            
            showToast('已清空所有内容', 'success');
        }
    }

    // ============================================================================
    //                    Toast 提示功能
    // ============================================================================
    
    /**
     * 显示Toast提示消息
     * @param {string} message - 提示消息
     * @param {string} type - 类型：'success' | 'error' | 'info'
     */
    function showToast(message, type = 'info') {
        // 移除已存在的toast
        const existingToast = document.getElementById('telegraph-tool-toast');
        if (existingToast) {
            existingToast.remove();
        }
        
        // 创建toast元素
        const toast = document.createElement('div');
        toast.id = 'telegraph-tool-toast';
        toast.textContent = message;
        
        // 根据类型设置颜色
        const colors = {
            success: '#4caf50',
            error: '#f44336',
            info: '#2196f3'
        };
        
        Object.assign(toast.style, {
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: colors[type] || colors.info,
            color: 'white',
            padding: '16px 28px',
            borderRadius: '8px',
            fontSize: '15px',
            fontWeight: 'bold',
            zIndex: '100000',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            opacity: '0',
            transition: 'opacity 0.3s ease'
        });
        
        document.body.appendChild(toast);
        
        // 淡入动画
        requestAnimationFrame(() => {
            toast.style.opacity = '1';
        });
        
        // 自动消失
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    }

    // ============================================================================
    //                    2. 输入框（粘贴链接）
    // ============================================================================
    
    /**
     * 显示图片链接输入面板
     * @description 创建模态对话框，允许用户粘贴多行图片链接
     * @security 该函数创建了模态遮罩层，但需要验证用户输入的URL
     */
    function showInputBox() {
        // 创建半透明遮罩层
        const overlay = document.createElement('div');
        Object.assign(overlay.style, {
            position: 'fixed',
            inset: '0',
            background: 'rgba(0,0,0,0.5)',
            zIndex: '10000',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
        });

        // 创建对话框容器
        const box = document.createElement('div');
        Object.assign(box.style, {
            background: '#fff',
            padding: '25px',
            borderRadius: '10px',
            width: '500px',
            maxWidth: '90vw',
            boxShadow: '0 6px 20px rgba(0,0,0,0.4)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
        });

        // 创建标题
        const title = document.createElement('h3');
        title.textContent = '批量插入图床图片链接';
        title.style.marginBottom = '15px';
        box.appendChild(title);

        // 创建多行文本输入框
        const textarea = document.createElement('textarea');
        textarea.placeholder = '每行一个图片直链（jpg/png/webp/gif 等）';
        Object.assign(textarea.style, {
            width: '100%',
            height: '220px',
            marginBottom: '15px',
            padding: '12px',
            fontSize: '14px',
            border: '1px solid #ddd',
            borderRadius: '6px',
            resize: 'vertical'
        });
        box.appendChild(textarea);

        // 创建按钮容器
        const buttonRow = document.createElement('div');
        Object.assign(buttonRow.style, {
            display: 'flex',
            justifyContent: 'space-between',
            width: '100%',
            gap: '10px'
        });

        // 创建确认按钮
        const confirmBtn = document.createElement('button');
        confirmBtn.textContent = '✅ 确认并排序';
        styleBtn(confirmBtn);
        confirmBtn.style.background = '#4caf50';
        
        /**
         * 确认按钮点击事件处理
         * @description 解析用户输入，提取有效图片链接
         * @security 【高风险】URL验证正则表达式需要加强
         */
        confirmBtn.onclick = () => {
            // 解析并验证用户输入的链接
            imageLinks = textarea.value.split('\n')
                .map(line => line.trim())
                .filter(line => line && /^https?:\/\/.*\.(jpe?g|png|webp|gif|bmp)$/i.test(line));
            
            overlay.remove();
            
            if (imageLinks.length === 0) {
                showToast('未检测到有效的图片链接', 'error');
                return;
            }
            
            showSortBox();
        };

        // 创建取消按钮
        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = '取消';
        styleBtn(cancelBtn);
        cancelBtn.style.background = '#f44336'; // 红色背景
        cancelBtn.onclick = () => overlay.remove();

        buttonRow.appendChild(confirmBtn);
        buttonRow.appendChild(cancelBtn);
        box.appendChild(buttonRow);
        overlay.appendChild(box);
        document.body.appendChild(overlay);
    }

    // ============================================================================
    //                    3. 拖拽排序预览框
    // ============================================================================
    
    /**
     * 显示图片排序面板
     * @description 创建可拖拽排序的图片预览界面
     * @security 【高风险】直接将用户输入的URL设置为img.src
     */
    function showSortBox() {
        const overlay = document.createElement('div');
        Object.assign(overlay.style, {
            position: 'fixed',
            inset: '0',
            background: 'rgba(0,0,0,0.5)',
            zIndex: '10000',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
        });

        const box = document.createElement('div');
        Object.assign(box.style, {
            background: '#fff',
            padding: '20px',
            borderRadius: '10px',
            width: '860px',
            maxWidth: '95vw',
            maxHeight: '88vh',
            overflow: 'auto',
            boxShadow: '0 8px 25px rgba(0,0,0,0.35)',
            display: 'flex',
            flexDirection: 'column'
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
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
            padding: '15px',
            background: '#f8f9fa',
            border: '2px dashed #ccc',
            borderRadius: '8px',
            minHeight: '320px'
        });

        imageLinks.forEach((link, i) => {
            const item = document.createElement('div');
            item.dataset.url = link;
            Object.assign(item.style, {
                width: '160px',
                cursor: 'move',
                border: '2px solid #ddd',
                borderRadius: '6px',
                padding: '6px',
                background: '#fff',
                textAlign: 'center',
                transition: 'all 0.2s'
            });

            const img = document.createElement('img');
            img.src = link;
            Object.assign(img.style, {
                maxWidth: '100%',
                maxHeight: '140px',
                objectFit: 'contain',
                borderRadius: '4px'
            });
            img.onerror = () => {
                item.style.opacity = '0.45';
                item.title = '图片加载失败';
            };

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
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '20px',
            gap: '12px'
        });

        const clearAllBtn = document.createElement('button');
        clearAllBtn.textContent = '全部清空列表';
        styleBtn(clearAllBtn);
        clearAllBtn.style.background = '#f44336';
        clearAllBtn.onclick = () => {
            if (confirm('确定清空当前图片列表？（不影响已插入内容）')) {
                imageLinks = [];
                overlay.remove();
                showToast('已清空图片列表', 'success');
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
        cancelBtn.style.background = '#f44336'; // 红色背景
        cancelBtn.onclick = () => overlay.remove();

        buttonRow.appendChild(clearAllBtn);
        buttonRow.appendChild(confirmBtn);
        buttonRow.appendChild(cancelBtn);
        box.appendChild(buttonRow);

        overlay.appendChild(box);
        document.body.appendChild(overlay);
    }

    // ============================================================================
    //                    4. 插入图片到编辑器
    // ============================================================================
    
    /**
     * 将图片插入到 Telegraph 编辑器
     * @param {string[]} links - 要插入的图片URL数组
     * @description 在当前光标位置或编辑器末尾插入图片
     * @security 【高风险】直接使用用户提供的URL设置img.src
     */
    function insertImages(links) {
        const editor = document.querySelector('div[contenteditable="true"]');
        if (!editor) {
            showToast('未找到 Telegraph 编辑器区域', 'error');
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
                maxWidth: '100%',
                height: 'auto',
                display: 'block',
                margin: '12px auto',
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

        showToast(`已插入 ${links.length} 张图片`, 'success');
        setTimeout(clearEmptyLines, 800);
    }

    // ============================================================================
    //                    5. 清除空行
    // ============================================================================
    
    /**
     * 清除编辑器中的空行
     * @description 移除空的段落和多余的换行符
     * @security 安全：只操作DOM元素，不涉及用户输入的直接执行
     */
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
            showToast(`已清除 ${count} 个空行`, 'success');
        } else {
            showToast('没有需要清除的空行', 'info');
        }
    }

    // ============================================================================
    //                    6. 简介面板 – 带标签插入
    // ============================================================================
    
    /**
     * 显示简介信息输入面板
     * @description 创建表单让用户输入文章标题、作者、来源等信息
     * @security 【中等风险】用户输入的链接直接设置为 a.href
     */
    function showIntroPanel() {
        const overlay = document.createElement('div');
        Object.assign(overlay.style, {
            position: 'fixed',
            inset: '0',
            background: 'rgba(0,0,0,0.5)',
            zIndex: '10000',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
        });

        const panel = document.createElement('div');
        Object.assign(panel.style, {
            background: '#fff',
            padding: '24px',
            borderRadius: '10px',
            width: '420px',
            maxWidth: '90vw',
            boxShadow: '0 8px 30px rgba(0,0,0,0.3)'
        });

        const titleEl = document.createElement('h3');
        titleEl.textContent = '快速插入简介信息（带标签）';
        titleEl.style.margin = '0 0 20px';
        titleEl.style.textAlign = 'center';
        panel.appendChild(titleEl);

        const fields = [
            { key: 'title', label: '标题', placeholder: '文章标题' },
            { key: 'author', label: '作者', placeholder: '您的名字 / @ID' },
            { key: 'source', label: '原链接', placeholder: 'https://example.com' },
            { key: 'date', label: '发布日期', auto: true }
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
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
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
                    width: '100%',
                    padding: '10px',
                    fontSize: '14px',
                    border: '1px solid #ddd',
                    borderRadius: '6px'
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
            flex: '1',
            padding: '12px',
            background: '#9c27b0',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 'bold',
            cursor: 'pointer'
        });

        confirm.onclick = () => {
            const editor = document.querySelector('div[contenteditable="true"]');
            if (!editor) {
                showToast('未找到编辑器', 'error');
                overlay.remove();
                return;
            }

            const frag = document.createDocumentFragment();

            /**
             * 添加带标记的简介行
             * @param {string} text - 文本内容
             */
            const addIntroLine = (text) => {
                if (!text) return;
                const p = document.createElement('p');
                p.textContent = text;
                p.setAttribute(INTRO_MARKER, 'true'); // 添加标记，便于后续移除
                frag.appendChild(p);
                frag.appendChild(document.createElement('br'));
            };

            // 添加标题
            if (inputs.title?.value.trim()) {
                addIntroLine(`标题：${inputs.title.value.trim()}`);
            }

            // 添加作者
            if (inputs.author?.value.trim()) {
                addIntroLine(`作者：${inputs.author.value.trim()}`);
            }

            // 添加原链接
            if (inputs.source?.value.trim()) {
                const text = inputs.source.value.trim();

                if (/^https?:\/\//i.test(text)) {
                    const p = document.createElement('p');
                    p.setAttribute(INTRO_MARKER, 'true');
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
                    addIntroLine(`原链接：${text}`);
                }
            }

            // 添加发布日期（总是插入）
            addIntroLine(`发布日期：${new Date().toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })}`);

            // 插入位置逻辑
            let firstP = editor.querySelector('p');
            if (firstP) {
                editor.insertBefore(frag, firstP);
                if (!firstP.textContent.trim() && !firstP.querySelector('*')) {
                    firstP.remove();
                }
            } else {
                editor.appendChild(frag);
            }

            overlay.remove();
            showToast('简介已添加', 'success');
            setTimeout(clearEmptyLines, 400);
        };

        const cancel = document.createElement('button');
        cancel.textContent = '取消';
        Object.assign(cancel.style, {
            padding: '12px 28px',
            background: '#f44336',
            color:'while',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 'bold',
            cursor: 'pointer'
        });
        cancel.onclick = () => overlay.remove();

        btnRow.appendChild(confirm);
        btnRow.appendChild(cancel);
        panel.appendChild(btnRow);

        overlay.appendChild(panel);
        document.body.appendChild(overlay);
    }

    // ============================================================================
    //                           辅助函数
    // ============================================================================
    
    /**
     * 统一设置按钮样式的辅助函数
     * @param {HTMLElement} btn - 要设置样式的按钮元素
     */
    function styleBtn(btn) {
        Object.assign(btn.style, {
            padding: '10px 18px',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
        });
    }

    // ============================================================================
    //                           初始化
    // ============================================================================
    
    // 创建工具栏
    createToolbar();
    
    // 输出加载成功日志
    console.log('Telegraph 批量插入 & 简介工具 v2.0 已加载');
})();
