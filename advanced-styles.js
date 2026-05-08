/**
 * ==============================================================================
 *                        高级样式和动画模块
 * ==============================================================================
 * @description 包含所有高级视觉效果：玻璃态、霓虹灯、波纹、磁吸、3D效果等
 * @version 3.0
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
                --tg-primary: #667eea;
                --tg-secondary: #764ba2;
                --tg-success: #4caf50;
                --tg-warning: #ff9800;
                --tg-error: #f44336;
                --tg-info: #2196f3;

                --tg-glass-bg: rgba(255, 255, 255, 0.7);
                --tg-glass-border: rgba(255, 255, 255, 0.3);
                --tg-glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);

                --tg-neon-primary: 0 0 20px rgba(102, 126, 234, 0.5),
                                   0 0 40px rgba(102, 126, 234, 0.3),
                                   inset 0 0 20px rgba(102, 126, 234, 0.1);
                --tg-neon-success: 0 0 20px rgba(76, 175, 80, 0.5),
                                   0 0 40px rgba(76, 175, 80, 0.3),
                                   inset 0 0 20px rgba(76, 175, 80, 0.1);
                --tg-neon-error: 0 0 20px rgba(244, 67, 54, 0.5),
                                 0 0 40px rgba(244, 67, 54, 0.3),
                                 inset 0 0 20px rgba(244, 67, 54, 0.1);

                --tg-ease-smooth: cubic-bezier(0.23, 1, 0.32, 1);
                --tg-ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
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
                gap: 10px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                perspective: 1000px;
            }

            /* 工具栏分组 - 磨砂玻璃效果 */
            .telegraph-toolbar-group {
                background: linear-gradient(135deg,
                    rgba(255, 255, 255, 0.9) 0%,
                    rgba(255, 255, 255, 0.7) 100%);
                backdrop-filter: blur(20px);
                -webkit-backdrop-filter: blur(20px);
                border: 1px solid var(--tg-glass-border);
                border-radius: 12px;
                padding: 12px;
                box-shadow: var(--tg-glass-shadow);
                display: flex;
                flex-direction: column;
                gap: 8px;
                min-width: 150px;
                position: relative;
                overflow: hidden;
                transition: all 0.4s var(--tg-ease-smooth);
                transform-style: preserve-3d;
            }

            .telegraph-toolbar-group::before {
                content: '';
                position: absolute;
                inset: 0;
                background: linear-gradient(45deg,
                    transparent 40%,
                    rgba(255, 255, 255, 0.3) 50%,
                    transparent 60%);
                transform: translateX(-100%);
                transition: transform 0.6s ease;
            }

            .telegraph-toolbar-group:hover::before {
                transform: translateX(100%);
            }

            .telegraph-toolbar-group:hover {
                transform: translateY(-3px) rotateX(2deg);
                box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15),
                            0 0 30px rgba(102, 126, 234, 0.1);
            }

            /* 分组标题 */
            .telegraph-toolbar-title {
                font-size: 12px;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 1px;
                padding: 4px 8px;
                margin-bottom: 4px;
                border-radius: 6px;
                position: relative;
                text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                transition: all 0.3s ease;
            }

            .telegraph-toolbar-group:hover .telegraph-toolbar-title {
                text-shadow: 0 0 10px currentColor,
                             0 0 20px currentColor;
            }

            /* ============================================================================
             *                              按钮样式
             * ============================================================================ */
            .telegraph-btn {
                position: relative;
                padding: 10px 14px;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-size: 13px;
                font-weight: 600;
                color: white;
                white-space: nowrap;
                text-align: left;
                overflow: hidden;
                background: linear-gradient(135deg, var(--tg-primary), var(--tg-secondary));
                box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3),
                            inset 0 1px 0 rgba(255, 255, 255, 0.2);
                transition: all 0.4s var(--tg-ease-smooth);
                transform-style: preserve-3d;
                will-change: transform;
            }

            .telegraph-btn::before {
                content: '';
                position: absolute;
                inset: 0;
                background: radial-gradient(circle at 30% 30%,
                    rgba(255, 255, 255, 0.3) 0%,
                    transparent 60%);
                opacity: 0;
                transition: opacity 0.3s ease;
            }

            .telegraph-btn:hover {
                transform: translateY(-2px) translateX(5px) rotateY(-5deg);
                box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4),
                            0 0 30px rgba(102, 126, 234, 0.2),
                            inset 0 1px 0 rgba(255, 255, 255, 0.3);
            }

            .telegraph-btn:hover::before {
                opacity: 1;
            }

            .telegraph-btn:active {
                transform: translateY(0) scale(0.96);
                box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
            }

            /* 按钮波纹效果 */
            .telegraph-btn-ripple {
                position: absolute;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.4);
                transform: scale(0);
                animation: rippleEffect 0.6s ease-out;
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

            /* 导航按钮 - 流体渐变 + 霓虹灯 */
            .telegraph-nav-btn {
                width: 54px;
                height: 54px;
                border: none;
                border-radius: 50%;
                cursor: pointer;
                font-size: 22px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: linear-gradient(135deg, var(--tg-primary), var(--tg-secondary));
                background-size: 200% 200%;
                color: white;
                position: relative;
                overflow: hidden;
                transition: all 0.4s var(--tg-ease-smooth);
                box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
                will-change: transform, background-position;
            }

            .telegraph-nav-btn::before {
                content: '';
                position: absolute;
                inset: 0;
                background: radial-gradient(circle at 30% 30%,
                    rgba(255, 255, 255, 0.4) 0%,
                    transparent 60%);
                opacity: 0;
                transition: opacity 0.3s ease;
            }

            .telegraph-nav-btn::after {
                content: '';
                position: absolute;
                inset: -3px;
                border-radius: 50%;
                background: conic-gradient(from 0deg,
                    transparent,
                    rgba(255, 255, 255, 0.3),
                    transparent,
                    rgba(118, 75, 162, 0.3),
                    transparent);
                opacity: 0;
                z-index: -1;
                transition: opacity 0.4s ease;
            }

            .telegraph-nav-btn:hover {
                animation: gradientFlow 3s ease infinite;
                transform: translateY(-4px) scale(1.08);
                box-shadow: var(--tg-neon-primary),
                            0 8px 25px rgba(102, 126, 234, 0.5);
            }

            .telegraph-nav-btn:hover::before {
                opacity: 1;
            }

            .telegraph-nav-btn:hover::after {
                opacity: 1;
                animation: rotateGlow 4s linear infinite;
            }

            .telegraph-nav-btn:active {
                transform: translateY(-2px) scale(1);
                box-shadow: 0 2px 10px rgba(102, 126, 234, 0.4);
            }

            @keyframes gradientFlow {
                0%, 100% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
            }

            @keyframes rotateGlow {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }

            /* ============================================================================
             *                              模态框样式
             * ============================================================================ */
            .telegraph-modal-overlay {
                position: fixed;
                inset: 0;
                background: rgba(0, 0, 0, 0.6);
                backdrop-filter: blur(8px);
                -webkit-backdrop-filter: blur(8px);
                z-index: 10000;
                display: flex;
                justify-content: center;
                align-items: center;
                opacity: 0;
                animation: modalFadeIn 0.3s ease forwards;
            }

            .telegraph-modal-overlay.hiding {
                animation: modalFadeOut 0.2s ease forwards;
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
                background: linear-gradient(135deg,
                    rgba(255, 255, 255, 0.95) 0%,
                    rgba(255, 255, 255, 0.9) 100%);
                backdrop-filter: blur(20px);
                -webkit-backdrop-filter: blur(20px);
                border: 1px solid var(--tg-glass-border);
                border-radius: 16px;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3),
                            0 0 40px rgba(102, 126, 234, 0.1);
                padding: 28px;
                transform: scale(0.9) translateY(20px);
                opacity: 0;
                animation: modalSlideIn 0.4s var(--tg-ease-bounce) forwards;
            }

            @keyframes modalSlideIn {
                to {
                    transform: scale(1) translateY(0);
                    opacity: 1;
                }
            }

            .telegraph-modal h3 {
                margin: 0 0 20px;
                font-size: 20px;
                font-weight: 700;
                text-align: center;
                background: linear-gradient(135deg, var(--tg-primary), var(--tg-secondary));
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }

            .telegraph-modal textarea,
            .telegraph-modal input {
                width: 100%;
                padding: 12px 16px;
                border: 2px solid rgba(102, 126, 234, 0.2);
                border-radius: 10px;
                font-size: 14px;
                background: rgba(255, 255, 255, 0.8);
                transition: all 0.3s ease;
                box-sizing: border-box;
            }

            .telegraph-modal textarea:focus,
            .telegraph-modal input:focus {
                outline: none;
                border-color: var(--tg-primary);
                box-shadow: 0 0 20px rgba(102, 126, 234, 0.2);
                background: white;
            }

            /* ============================================================================
             *                              Toast 提示样式
             * ============================================================================ */
            .telegraph-toast {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) scale(0.8);
                padding: 16px 24px;
                border-radius: 12px;
                color: white;
                font-size: 15px;
                font-weight: 600;
                z-index: 100001;
                opacity: 0;
                pointer-events: none;
                display: flex;
                align-items: center;
                gap: 10px;
            }

            .telegraph-toast.success {
                background: linear-gradient(135deg,
                    rgba(76, 175, 80, 0.9) 0%,
                    rgba(67, 160, 71, 0.9) 100%);
                box-shadow: var(--tg-neon-success);
                animation: toastSlideUp 0.4s var(--tg-ease-smooth) forwards;
            }

            .telegraph-toast.error {
                background: linear-gradient(135deg,
                    rgba(244, 67, 54, 0.9) 0%,
                    rgba(229, 57, 53, 0.9) 100%);
                box-shadow: var(--tg-neon-error);
                animation: toastShake 0.5s ease forwards;
            }

            .telegraph-toast.info {
                background: linear-gradient(135deg,
                    rgba(33, 150, 243, 0.9) 0%,
                    rgba(25, 118, 210, 0.9) 100%);
                box-shadow: 0 0 20px rgba(33, 150, 243, 0.4);
                animation: toastSlideDown 0.4s var(--tg-ease-smooth) forwards;
            }

            .telegraph-toast.hiding {
                animation: toastHide 0.3s ease forwards;
            }

            @keyframes toastSlideUp {
                to {
                    transform: translate(-50%, -50%) scale(1);
                    opacity: 1;
                }
            }

            @keyframes toastSlideDown {
                to {
                    transform: translate(-50%, -50%) scale(1);
                    opacity: 1;
                }
            }

            @keyframes toastShake {
                0%, 100% {
                    transform: translate(-50%, -50%) scale(0.8) rotate(0deg);
                    opacity: 0;
                }
                20% {
                    transform: translate(-50%, -50%) scale(0.95) rotate(-5deg);
                    opacity: 1;
                }
                40% {
                    transform: translate(-50%, -50%) scale(1) rotate(5deg);
                }
                60% {
                    transform: translate(-50%, -50%) scale(1) rotate(-3deg);
                }
                80% {
                    transform: translate(-50%, -50%) scale(1) rotate(2deg);
                }
                90% {
                    transform: translate(-50%, -50%) scale(1) rotate(-1deg);
                }
            }

            @keyframes toastHide {
                to {
                    transform: translate(-50%, -50%) scale(0.8);
                    opacity: 0;
                }
            }

            /* Toast 图标动画 */
            .telegraph-toast-icon {
                font-size: 20px;
            }

            .telegraph-toast.success .telegraph-toast-icon {
                animation: iconCheck 0.6s ease forwards;
            }

            .telegraph-toast.error .telegraph-toast-icon {
                animation: iconError 0.5s ease forwards;
            }

            @keyframes iconCheck {
                0% { transform: scale(0) rotate(-180deg); }
                50% { transform: scale(1.2) rotate(0deg); }
                100% { transform: scale(1) rotate(10deg); }
            }

            @keyframes iconError {
                0%, 100% { transform: rotate(0deg); }
                20% { transform: rotate(-10deg); }
                40% { transform: rotate(10deg); }
                60% { transform: rotate(-8deg); }
                80% { transform: rotate(8deg); }
            }

            /* ============================================================================
             *                              进度条样式
             * ============================================================================ */
            .telegraph-progress-bar {
                width: 100%;
                height: 4px;
                background: rgba(0, 0, 0, 0.1);
                border-radius: 2px;
                overflow: hidden;
                margin-top: 10px;
            }

            .telegraph-progress-fill {
                height: 100%;
                background: linear-gradient(90deg,
                    var(--tg-primary),
                    var(--tg-secondary),
                    var(--tg-primary));
                background-size: 200% 100%;
                border-radius: 2px;
                transition: width 0.3s ease;
                animation: progressGradient 2s linear infinite;
            }

            @keyframes progressGradient {
                0% { background-position: 0% 0%; }
                100% { background-position: 200% 0%; }
            }
        `;
        document.head.appendChild(style);
    }

    // 导出到全局
    window.TelegraphAdvancedStyles = {
        inject: injectAdvancedStyles
    };
})();
