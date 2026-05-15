/**
 * ==============================================================================
 *                        高级样式和动画模块
 * ==============================================================================
 * @description 新粗野主义（Neo-Brutalism）风格：粗黑边框、硬阴影、荧光配色、直角几何
 * @version 4.0
 */

(function() {
    'use strict';

    /**
     * 注入所有高级样式
     * @description 统一的样式注入入口，避免重复加载
     */
    function injectAdvancedStyles() {
        if (document.getElementById('telegraph-advanced-styles')) return;

        const style = document.createElement('style');
        style.id = 'telegraph-advanced-styles';
        style.textContent = `
            /* ============================================================================
             *                              CSS 变量系统
             * ============================================================================ */
            :root {
                /* 新粗野主义配色 */
                --tg-yellow: #CCFF00;
                --tg-purple: #6A00FF;
                --tg-pink: #FF6B9D;
                --tg-black: #000;
                --tg-white: #fff;
                --tg-light-gray: #f4f4f4;

                /* 功能色 */
                --tg-success: #10b981;
                --tg-error: #ef4444;
                --tg-info: #3b82f6;

                /* 硬阴影预设 */
                --tg-shadow-sm: 3px 3px 0px #000;
                --tg-shadow-md: 5px 5px 0px #000;
                --tg-shadow-lg: 7px 7px 0px #000;

                /* 边框 */
                --tg-border: 2px solid #000;
            }

            /* ============================================================================
             *                              工具栏样式
             * ============================================================================ */
            .telegraph-toolbar {
                position: fixed;
                top: 10px;
                left: 10px;
                z-index: 9999;
                display: flex;
                flex-direction: column;
                gap: 12px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }

            /* 工具栏分组 - 粗野主义卡片 */
            .telegraph-toolbar-group {
                background: var(--tg-white);
                border: var(--tg-border);
                padding: 14px;
                box-shadow: var(--tg-shadow-md);
                display: flex;
                flex-direction: column;
                gap: 8px;
                min-width: 150px;
                position: relative;
                transition: box-shadow 0.15s ease, transform 0.15s ease;
            }

            .telegraph-toolbar-group:hover {
                transform: translate(-2px, -2px);
                box-shadow: 8px 8px 0px #000;
            }

            /* 分组标题 */
            .telegraph-toolbar-title {
                font-size: 12px;
                font-weight: 900;
                text-transform: uppercase;
                letter-spacing: 1px;
                padding: 4px 8px;
                margin-bottom: 4px;
                color: var(--tg-black);
                background: var(--tg-yellow);
                display: inline-block;
                border: 2px solid #000;
            }

            /* ============================================================================
             *                              按钮样式
             * ============================================================================ */
            .telegraph-btn {
                position: relative;
                padding: 10px 14px;
                border: var(--tg-border);
                cursor: pointer;
                font-size: 13px;
                font-weight: 700;
                color: var(--tg-black);
                white-space: nowrap;
                text-align: left;
                background: var(--tg-white);
                box-shadow: var(--tg-shadow-sm);
                transition: all 0.12s ease;
            }

            .telegraph-btn:hover {
                background: var(--tg-yellow);
                transform: translate(-2px, -2px);
                box-shadow: 5px 5px 0px #000;
            }

            .telegraph-btn:active {
                transform: translate(1px, 1px);
                box-shadow: 1px 1px 0px #000;
            }

            /* 按钮波纹效果 */
            .telegraph-btn-ripple {
                position: absolute;
                background: rgba(0, 0, 0, 0.15);
                transform: scale(0);
                animation: rippleEffect 0.5s ease-out;
                pointer-events: none;
            }

            @keyframes rippleEffect {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }

            /* ============================================================================
             *                              导航按钮样式
             * ============================================================================ */
            .telegraph-nav-container {
                position: fixed;
                right: 20px;
                bottom: 80px;
                display: flex;
                flex-direction: column;
                gap: 15px;
                z-index: 9998;
            }

            /* 导航按钮 - 粗野主义圆形 */
            .telegraph-nav-btn {
                width: 54px;
                height: 54px;
                border: var(--tg-border);
                cursor: pointer;
                font-size: 22px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: var(--tg-yellow);
                color: var(--tg-black);
                position: relative;
                box-shadow: var(--tg-shadow-sm);
                transition: all 0.12s ease;
            }

            .telegraph-nav-btn:hover {
                background: var(--tg-purple);
                color: var(--tg-white);
                transform: translate(-3px, -3px);
                box-shadow: 6px 6px 0px #000;
            }

            .telegraph-nav-btn:active {
                transform: translate(1px, 1px);
                box-shadow: 1px 1px 0px #000;
            }

            /* ============================================================================
             *                              模态框样式
             * ============================================================================ */
            .telegraph-modal-overlay {
                position: fixed;
                inset: 0;
                background: rgba(0, 0, 0, 0.5);
                z-index: 10000;
                display: flex;
                justify-content: center;
                align-items: center;
                opacity: 0;
                animation: modalFadeIn 0.2s ease forwards;
            }

            .telegraph-modal-overlay.hiding {
                animation: modalFadeOut 0.15s ease forwards;
            }

            @keyframes modalFadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }

            @keyframes modalFadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
            }

            .telegraph-modal {
                background: var(--tg-white);
                border: var(--tg-border);
                box-shadow: var(--tg-shadow-lg);
                padding: 28px;
                max-width: 500px;
                width: 90%;
                transform: translateY(10px);
                opacity: 0;
                animation: modalSlideIn 0.25s ease forwards;
            }

            @keyframes modalSlideIn {
                to {
                    transform: translateY(0);
                    opacity: 1;
                }
            }

            .telegraph-modal h3 {
                margin: 0 0 20px;
                font-size: 20px;
                font-weight: 900;
                text-align: center;
                color: var(--tg-black);
                background: var(--tg-yellow);
                padding: 8px 16px;
                border: 2px solid #000;
                display: inline-block;
                width: 100%;
                box-sizing: border-box;
            }

            .telegraph-modal textarea,
            .telegraph-modal input {
                width: 100%;
                padding: 12px 16px;
                border: var(--tg-border);
                font-size: 14px;
                background: var(--tg-white);
                transition: box-shadow 0.15s ease;
                box-sizing: border-box;
                font-family: inherit;
            }

            .telegraph-modal textarea:focus,
            .telegraph-modal input:focus {
                outline: none;
                box-shadow: 3px 3px 0px var(--tg-purple);
            }

            /* ============================================================================
             *                              Toast 提示样式
             * ============================================================================ */
            .telegraph-toast {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) scale(0.9);
                padding: 16px 24px;
                color: var(--tg-black);
                font-size: 15px;
                font-weight: 700;
                z-index: 100001;
                opacity: 0;
                pointer-events: none;
                display: flex;
                align-items: center;
                gap: 10px;
                border: var(--tg-border);
            }

            .telegraph-toast.success {
                background: var(--tg-yellow);
                box-shadow: var(--tg-shadow-md);
                animation: toastPopIn 0.25s ease forwards;
            }

            .telegraph-toast.error {
                background: var(--tg-pink);
                box-shadow: var(--tg-shadow-md);
                animation: toastPopIn 0.25s ease forwards;
            }

            .telegraph-toast.info {
                background: var(--tg-white);
                box-shadow: var(--tg-shadow-md);
                animation: toastPopIn 0.25s ease forwards;
            }

            .telegraph-toast.hiding {
                animation: toastHide 0.2s ease forwards;
            }

            @keyframes toastPopIn {
                to {
                    transform: translate(-50%, -50%) scale(1);
                    opacity: 1;
                }
            }

            @keyframes toastHide {
                to {
                    transform: translate(-50%, -50%) scale(0.9);
                    opacity: 0;
                }
            }

            /* Toast 图标 */
            .telegraph-toast-icon {
                font-size: 20px;
            }

            /* ============================================================================
             *                              进度条样式
             * ============================================================================ */
            .telegraph-progress-bar {
                width: 100%;
                height: 6px;
                background: var(--tg-white);
                border: var(--tg-border);
                overflow: hidden;
                margin-top: 10px;
            }

            .telegraph-progress-fill {
                height: 100%;
                background: var(--tg-purple);
                transition: width 0.3s ease;
            }
        `;
        document.head.appendChild(style);
    }

    // 导出到全局
    window.TelegraphAdvancedStyles = {
        inject: injectAdvancedStyles
    };
})();