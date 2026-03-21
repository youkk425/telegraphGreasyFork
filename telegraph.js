// ==UserScript==
// @name         【免费完整版】Telegraph 批量插入图床图片链接 + 简介工具
// @namespace    github.com/youkk425
// @version      2.2
// @description  批量插入图床图片链接 + 拖拽排序 + 一键清空列表 + 清除空行 + 快速添加带标签的简介信息+ 新增移除简介和清空内容功能+返回顶部按钮
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
 *                           v2.2 更新日志
 * ============================================================================
 * 1. 自动播放按钮位置调整 - 放置于返回顶部按钮正上方，与其对齐
 * 2. 新增拖拽移动功能 - 悬停显示移动开关，开启后可自由拖拽按钮位置
 * 3. 速度文本颜色调整 - 改为黑色，提升可读性
 *
 * ============================================================================
 *                           v2.1 更新日志
 * ============================================================================
 * 增加去到底部和回到顶部按钮键

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
    //                    导航按钮（回到顶部/到达底部）
    // ============================================================================

    /**
     * 注入导航按钮所需的 CSS 动画样式
     * @description 包含晃动、旋转、渐变等动画效果
     */
    function injectNavigationStyles() {
        const styleId = 'telegraph-nav-styles';
        if (document.getElementById(styleId)) return; // 避免重复注入

        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            /* 晃动 + 旋转动画 - 0.6秒 */
            @keyframes navWiggle {
                0% { transform: translateY(0) rotate(0deg); }
                15% { transform: translateY(-2px) rotate(-3deg); }
                30% { transform: translateY(0) rotate(2deg); }
                45% { transform: translateY(-2px) rotate(-2deg); }
                60% { transform: translateY(0) rotate(1deg); }
                75% { transform: translateY(-1px) rotate(-1deg); }
                100% { transform: translateY(-2px) rotate(0deg); }
            }

            /* 导航按钮基础样式 */
            .telegraph-nav-btn {
                width: 50px;
                height: 50px;
                border: none;
                border-radius: 50%;
                cursor: pointer;
                font-size: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%);
                color: white;
                box-shadow: 0 4px 15px rgba(156, 39, 176, 0.4);
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                position: relative;
                overflow: hidden;
            }

            /* 悬停效果：渐变切换 + 上浮 + 阴影变化 */
            .telegraph-nav-btn:hover {
                background: linear-gradient(135deg, #e91e63 0%, #f06292 100%);
                box-shadow: 0 6px 25px rgba(233, 30, 99, 0.5), 0 0 20px rgba(233, 30, 99, 0.3);
                transform: translateY(-2px);
                animation: navWiggle 0.6s ease-in-out;
            }

            /* 点击效果 */
            .telegraph-nav-btn:active {
                transform: translateY(0) scale(0.95);
                box-shadow: 0 2px 10px rgba(233, 30, 99, 0.4);
            }

            /* 按钮内部图标 */
            .telegraph-nav-btn::before {
                content: '';
                position: absolute;
                inset: 0;
                background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3) 0%, transparent 60%);
                pointer-events: none;
            }

            /* 导航按钮容器 */
            .telegraph-nav-container {
                position: fixed;
                right: 20px;
                bottom: 80px;
                display: flex;
                flex-direction: column;
                gap: 15px;
                z-index: 9998;
            }

            /* ======================================== */
            /* 自动滚动控制器样式 - 玻璃态高级设计 */
            /* ======================================== */

            /* 控制器容器 - 玻璃态效果 */
            .telegraph-autoscroll-container {
                position: fixed;
                right: 20px;
                bottom: 210px;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 12px;
                z-index: 9998;
            }

            /* 移动模式下的拖拽样式 */
            .telegraph-autoscroll-container.draggable {
                cursor: move;
            }

            .telegraph-autoscroll-container.dragging {
                opacity: 0.8;
                transform: scale(1.05);
            }

            /* 移动模式开关按钮 */
            .telegraph-move-toggle {
                position: absolute;
                top: -30px;
                left: 50%;
                transform: translateX(-50%);
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(240, 240, 240, 0.95) 100%);
                border: 1px solid rgba(0, 0, 0, 0.1);
                border-radius: 20px;
                padding: 4px 12px;
                font-size: 11px;
                font-weight: 600;
                color: #333;
                cursor: pointer;
                white-space: nowrap;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
                opacity: 0;
                transition: opacity 0.3s ease, transform 0.3s ease;
                z-index: 10;
            }

            .telegraph-autoscroll-container:hover .telegraph-move-toggle {
                opacity: 1;
            }

            .telegraph-move-toggle:hover {
                background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
                border-color: #2196f3;
            }

            .telegraph-move-toggle.active {
                background: linear-gradient(135deg, #4caf50 0%, #66bb6a 100%);
                color: white;
                border-color: #4caf50;
            }

            .telegraph-move-toggle.active:hover {
                background: linear-gradient(135deg, #66bb6a 0%, #81c784 100%);
            }

            /* 主控制按钮 - 玻璃态渐变 */
            .telegraph-autoscroll-btn {
                width: 56px;
                height: 56px;
                border: 1px solid rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                cursor: pointer;
                font-size: 22px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: linear-gradient(135deg,
                    rgba(138, 43, 226, 0.7) 0%,
                    rgba(75, 0, 130, 0.6) 50%,
                    rgba(148, 0, 211, 0.7) 100%);
                backdrop-filter: blur(12px);
                -webkit-backdrop-filter: blur(12px);
                color: white;
                box-shadow:
                    0 8px 32px rgba(138, 43, 226, 0.4),
                    inset 0 1px 1px rgba(255, 255, 255, 0.2),
                    0 0 0 1px rgba(255, 255, 255, 0.1);
                transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                position: relative;
                overflow: hidden;
            }

            /* 按钮内部光晕效果 */
            .telegraph-autoscroll-btn::before {
                content: '';
                position: absolute;
                inset: -2px;
                background: conic-gradient(from 0deg,
                    transparent,
                    rgba(255, 255, 255, 0.3),
                    transparent,
                    rgba(255, 182, 193, 0.3),
                    transparent);
                border-radius: 50%;
                animation: rotateGlow 4s linear infinite;
                opacity: 0;
                transition: opacity 0.4s ease;
            }

            .telegraph-autoscroll-btn:hover::before {
                opacity: 1;
            }

            @keyframes rotateGlow {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }

            /* 按钮悬停效果 */
            .telegraph-autoscroll-btn:hover {
                transform: translateY(-3px) scale(1.05);
                background: linear-gradient(135deg,
                    rgba(186, 85, 211, 0.85) 0%,
                    rgba(138, 43, 226, 0.75) 50%,
                    rgba(218, 112, 214, 0.85) 100%);
                box-shadow:
                    0 12px 40px rgba(186, 85, 211, 0.5),
                    inset 0 1px 1px rgba(255, 255, 255, 0.3),
                    0 0 20px rgba(218, 112, 214, 0.4);
            }

            /* 按钮激活状态（滚动中） */
            .telegraph-autoscroll-btn.active {
                background: linear-gradient(135deg,
                    rgba(255, 107, 107, 0.85) 0%,
                    rgba(255, 71, 87, 0.75) 50%,
                    rgba(255, 127, 80, 0.85) 100%);
                box-shadow:
                    0 8px 32px rgba(255, 107, 107, 0.5),
                    inset 0 1px 1px rgba(255, 255, 255, 0.2),
                    0 0 25px rgba(255, 107, 107, 0.5);
                animation: pulseActive 1.5s ease-in-out infinite;
            }

            @keyframes pulseActive {
                0%, 100% {
                    transform: scale(1);
                    box-shadow:
                        0 8px 32px rgba(255, 107, 107, 0.5),
                        0 0 25px rgba(255, 107, 107, 0.5);
                }
                50% {
                    transform: scale(1.02);
                    box-shadow:
                        0 8px 32px rgba(255, 107, 107, 0.6),
                        0 0 35px rgba(255, 107, 107, 0.6);
                }
            }

            /* 速度控制面板 - 玻璃态 */
            .telegraph-speed-panel {
                background: linear-gradient(135deg,
                    rgba(255, 255, 255, 0.15) 0%,
                    rgba(255, 255, 255, 0.08) 100%);
                backdrop-filter: blur(16px);
                -webkit-backdrop-filter: blur(16px);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 16px;
                padding: 14px 16px;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 10px;
                box-shadow:
                    0 8px 32px rgba(0, 0, 0, 0.15),
                    inset 0 1px 1px rgba(255, 255, 255, 0.1);
                min-width: 100px;
                transition: all 0.3s ease;
                opacity: 0;
                transform: translateY(10px);
                pointer-events: none;
            }

            .telegraph-speed-panel.visible {
                opacity: 1;
                transform: translateY(0);
                pointer-events: auto;
            }

            /* 速度标签 */
            .telegraph-speed-label {
                font-size: 11px;
                font-weight: 600;
                color: rgba(255, 255, 255, 0.9);
                text-transform: uppercase;
                letter-spacing: 1px;
                text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
            }

            /* 速度值显示 */
            .telegraph-speed-value {
                font-size: 18px;
                font-weight: bold;
                color: #000;
                text-shadow: none;
                min-width: 50px;
                text-align: center;
            }

            /* 渐变滑块轨道 */
            .telegraph-speed-slider {
                -webkit-appearance: none;
                appearance: none;
                width: 80px;
                height: 6px;
                border-radius: 3px;
                background: linear-gradient(90deg,
                    #4facfe 0%,
                    #00f2fe 25%,
                    #43e97b 50%,
                    #f9d423 75%,
                    #ff6b6b 100%);
                outline: none;
                cursor: pointer;
                box-shadow:
                    0 2px 10px rgba(79, 172, 254, 0.3),
                    inset 0 1px 2px rgba(0, 0, 0, 0.1);
            }

            /* 滑块滑块样式 - Webkit */
            .telegraph-speed-slider::-webkit-slider-thumb {
                -webkit-appearance: none;
                appearance: none;
                width: 18px;
                height: 18px;
                border-radius: 50%;
                background: linear-gradient(135deg, #fff 0%, #e0e0e0 100%);
                cursor: pointer;
                box-shadow:
                    0 2px 8px rgba(0, 0, 0, 0.3),
                    inset 0 1px 1px rgba(255, 255, 255, 0.8);
                transition: all 0.2s ease;
                border: 2px solid rgba(255, 255, 255, 0.8);
            }

            .telegraph-speed-slider::-webkit-slider-thumb:hover {
                transform: scale(1.15);
                box-shadow:
                    0 4px 15px rgba(0, 0, 0, 0.3),
                    0 0 15px rgba(255, 255, 255, 0.5);
            }

            /* 滑块滑块样式 - Firefox */
            .telegraph-speed-slider::-moz-range-thumb {
                width: 18px;
                height: 18px;
                border-radius: 50%;
                background: linear-gradient(135deg, #fff 0%, #e0e0e0 100%);
                cursor: pointer;
                box-shadow:
                    0 2px 8px rgba(0, 0, 0, 0.3),
                    inset 0 1px 1px rgba(255, 255, 255, 0.8);
                transition: all 0.2s ease;
                border: 2px solid rgba(255, 255, 255, 0.8);
            }

            .telegraph-speed-slider::-moz-range-thumb:hover {
                transform: scale(1.15);
            }

            /* 速度提示文字 */
            .telegraph-speed-hint {
                font-size: 9px;
                color: rgba(255, 255, 255, 0.6);
                letter-spacing: 0.5px;
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * 创建导航按钮（回到顶部/到达底部）
     * @description 创建带有精美动画效果的导航按钮，固定在页面右下角
     */
    function createNavigationButtons() {
        // 注入 CSS 样式
        injectNavigationStyles();

        // 创建导航按钮容器
        const navContainer = document.createElement('div');
        navContainer.className = 'telegraph-nav-container';

        // ========== 回到顶部按钮 ==========
        const scrollToTopBtn = document.createElement('button');
        scrollToTopBtn.className = 'telegraph-nav-btn';
        scrollToTopBtn.innerHTML = '⬆️';
        scrollToTopBtn.title = '回到顶部';
        scrollToTopBtn.setAttribute('aria-label', '回到顶部');

        /**
         * 回到顶部点击事件
         * @description 平滑滚动到页面顶部
         */
        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
            showToast('已回到顶部', 'info');
        });

        // ========== 到达底部按钮 ==========
        const scrollToBottomBtn = document.createElement('button');
        scrollToBottomBtn.className = 'telegraph-nav-btn';
        scrollToBottomBtn.innerHTML = '⬇️';
        scrollToBottomBtn.title = '到达底部';
        scrollToBottomBtn.setAttribute('aria-label', '到达底部');

        /**
         * 到达底部点击事件
         * @description 平滑滚动到页面底部
         */
        scrollToBottomBtn.addEventListener('click', () => {
            // 获取页面实际高度
            const scrollHeight = Math.max(
                document.documentElement.scrollHeight,
                document.body.scrollHeight
            );
            window.scrollTo({
                top: scrollHeight,
                behavior: 'smooth'
            });
            showToast('已到达底部', 'info');
        });

        // 组装导航容器
        navContainer.appendChild(scrollToTopBtn);
        navContainer.appendChild(scrollToBottomBtn);

        // 添加到页面
        document.body.appendChild(navContainer);
    }

    // ============================================================================
    //                    自动滚动功能
    // ============================================================================

    /**
     * 自动滚动状态管理
     */
    let autoScrollState = {
        isScrolling: false,
        speed: 2,// 默认速度 (0-100)
        animationId: null,// requestAnimationFrame ID
        direction: 1// 1: 向下, -1: 向上
    };

    /**
     * 自动滚动按钮位置状态
     */
    let autoScrollPosition = {
        isMoveMode: false,
        isDragging: false,
        startX: 0,
        startY: 0,
        startRight: 0,
        startBottom: 0
    };

    /**
     * 创建自动滚动控制器
     * @description 创建带有玻璃态效果的自动滚动控制面板，包含速度调节滑块
     */
    function createAutoScrollController() {
        // 创建控制器容器
        const container = document.createElement('div');
        container.className = 'telegraph-autoscroll-container';

        // ========== 移动模式开关按钮 ==========
        const moveToggle = document.createElement('button');
        moveToggle.className = 'telegraph-move-toggle';
        moveToggle.textContent = '🔘 移动';
        moveToggle.title = '点击开启/关闭移动模式，开启后可拖拽按钮位置';

        /**
         * 移动模式开关点击事件
         * @description 切换移动模式，启用/禁用拖拽功能
         */
        moveToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            autoScrollPosition.isMoveMode = !autoScrollPosition.isMoveMode;

            if (autoScrollPosition.isMoveMode) {
                moveToggle.classList.add('active');
                moveToggle.textContent = '✅ 移动中';
                container.classList.add('draggable');
                showToast('移动模式已开启，可拖拽按钮位置', 'success');
            } else {
                moveToggle.classList.remove('active');
                moveToggle.textContent = '🔘 移动';
                container.classList.remove('draggable');
                showToast('移动模式已关闭', 'info');
            }
        });

        container.appendChild(moveToggle);

        // ========== 速度控制面板 ==========
        const speedPanel = document.createElement('div');
        speedPanel.className = 'telegraph-speed-panel';

        // 速度标签
        const speedLabel = document.createElement('div');
        speedLabel.className = 'telegraph-speed-label';
        speedLabel.textContent = '速度';
        speedPanel.appendChild(speedLabel);

        // 速度值显示
        const speedValue = document.createElement('div');
        speedValue.className = 'telegraph-speed-value';
        speedValue.textContent = '2';
        speedPanel.appendChild(speedValue);

        // 渐变滑块
        const slider = document.createElement('input');
        slider.type = 'range';
        slider.min = '1';
        slider.max = '100';
        slider.value = '2';
        slider.className = 'telegraph-speed-slider';

        /**
         * 滑块值变化事件
         * @description 实时更新速度显示
         */
        slider.addEventListener('input', (e) => {
            const value = parseInt(e.target.value, 10);
            autoScrollState.speed = value;
            speedValue.textContent = value;

            // 速度文本保持黑色，不再根据速度变化颜色
            speedValue.style.color = '#000';
        });

        speedPanel.appendChild(slider);

        // 速度提示
        const speedHint = document.createElement('div');
        speedHint.className = 'telegraph-speed-hint';
        speedHint.textContent = '慢 ← → 快';
        speedPanel.appendChild(speedHint);

        container.appendChild(speedPanel);

        // ========== 主控制按钮 ==========
        const mainBtn = document.createElement('button');
        mainBtn.className = 'telegraph-autoscroll-btn';
        mainBtn.innerHTML = '▶️';
        mainBtn.title = '自动滚动（点击开始/暂停，悬停调节速度）';
        mainBtn.setAttribute('aria-label', '自动滚动控制');

        /**
         * 主按钮点击事件
         * @description 切换自动滚动状态
         */
        mainBtn.addEventListener('click', () => {
            // 如果处于移动模式，不执行滚动操作
            if (autoScrollPosition.isMoveMode) return;

            if (autoScrollState.isScrolling) {
                // 停止滚动
                stopAutoScroll();
                mainBtn.classList.remove('active');
                mainBtn.innerHTML = '▶️';
                showToast('已停止自动滚动', 'info');
            } else {
                // 开始滚动
                startAutoScroll();
                mainBtn.classList.add('active');
                mainBtn.innerHTML = '⏸️';
                showToast(`自动滚动中 (速度: ${autoScrollState.speed})`, 'success');
            }
        });

        /**
         * 鼠标悬停显示速度面板
         */
        mainBtn.addEventListener('mouseenter', () => {
            speedPanel.classList.add('visible');
        });

        container.addEventListener('mouseleave', () => {
            if (!autoScrollState.isScrolling) {
                speedPanel.classList.remove('visible');
            }
        });

        // 滚动时保持速度面板可见
        if (autoScrollState.isScrolling) {
            speedPanel.classList.add('visible');
        }

        container.insertBefore(mainBtn, speedPanel);

        // ========== 拖拽移动功能 ==========
        /**
         * 鼠标按下事件 - 开始拖拽
         */
        container.addEventListener('mousedown', (e) => {
            if (!autoScrollPosition.isMoveMode) return;

            e.preventDefault();
            autoScrollPosition.isDragging = true;
            autoScrollPosition.startX = e.clientX;
            autoScrollPosition.startY = e.clientY;

            // 获取当前位置
            const rect = container.getBoundingClientRect();
            autoScrollPosition.startRight = window.innerWidth - rect.right;
            autoScrollPosition.startBottom = window.innerHeight - rect.bottom;

            container.classList.add('dragging');
        });

        /**
         * 鼠标移动事件 - 拖拽中
         */
        document.addEventListener('mousemove', (e) => {
            if (!autoScrollPosition.isDragging) return;

            const deltaX = autoScrollPosition.startX - e.clientX;
            const deltaY = autoScrollPosition.startY - e.clientY;

            let newRight = autoScrollPosition.startRight + deltaX;
            let newBottom = autoScrollPosition.startBottom + deltaY;

            // 限制在可视区域内
            const containerRect = container.getBoundingClientRect();
            const maxRight = window.innerWidth - 50;
            const maxBottom = window.innerHeight - 50;

            newRight = Math.max(10, Math.min(newRight, maxRight));
            newBottom = Math.max(10, Math.min(newBottom, maxBottom));

            container.style.right = `${newRight}px`;
            container.style.bottom = `${newBottom}px`;
        });

        /**
         * 鼠标释放事件 - 结束拖拽
         */
        document.addEventListener('mouseup', () => {
            if (autoScrollPosition.isDragging) {
                autoScrollPosition.isDragging = false;
                container.classList.remove('dragging');
            }
        });

        // 添加到页面
        document.body.appendChild(container);
    }

    /**
     * 开始自动滚动
     * @description 使用 requestAnimationFrame 实现平滑滚动
     */
    function startAutoScroll() {
        autoScrollState.isScrolling = true;

        /**
         * 滚动动画帧函数
         */
        function scrollStep() {
            if (!autoScrollState.isScrolling) return;

            // 计算滚动速度（像素/帧）
            // 速度范围 1-100 映射到 0.5-10 像素/帧
            const pixelsPerFrame = (autoScrollState.speed / 100) * 10 + 0.5;

            // 获取当前滚动位置
            const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
            const maxScroll = Math.max(
                document.documentElement.scrollHeight - window.innerHeight,
                0
            );

            // 计算新滚动位置
            let newScroll = currentScroll + (pixelsPerFrame * autoScrollState.direction);

            // 边界检测 - 到达顶部或底部时反向
            if (newScroll >= maxScroll) {
                newScroll = maxScroll;
                autoScrollState.direction = -1; // 反向向上
                showToast('已到达底部，反向滚动', 'info');
            } else if (newScroll <= 0) {
                newScroll = 0;
                autoScrollState.direction = 1; // 反向向下
                showToast('已到达顶部，反向滚动', 'info');
            }

            // 执行滚动
            window.scrollTo(0, newScroll);

            // 继续下一帧
            autoScrollState.animationId = requestAnimationFrame(scrollStep);
        }

        // 启动滚动
        autoScrollState.animationId = requestAnimationFrame(scrollStep);
    }

    /**
     * 停止自动滚动
     * @description 取消动画帧并重置状态
     */
    function stopAutoScroll() {
        autoScrollState.isScrolling = false;
        if (autoScrollState.animationId) {
            cancelAnimationFrame(autoScrollState.animationId);
            autoScrollState.animationId = null;
        }
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

        // 创建取消按钮（红色背景）
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
            background: '#f44336', // 红色背景
            color: 'white',
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

    // 创建导航按钮（回到顶部/到达底部）
    createNavigationButtons();

    // 创建自动滚动控制器
    createAutoScrollController();

    // 输出加载成功日志
    console.log('Telegraph 批量插入 & 简介工具已加载');
})();
