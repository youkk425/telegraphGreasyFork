# telegraphGreasyFork
# telegraph.js
<p align="center">
  <img src="https://img.shields.io/badge/version-2.0-blue.svg" alt="Version">
  <img src="https://img.shields.io/badge/platform-Tampermonkey-orange.svg" alt="Platform">
</p>
一款专为 Telegra.ph 编辑器设计的图片插入增强脚本，提供批量图片插入、拖拽排序、一键清理空行、快速添加简介等实用功能，显著提升内容创作效率。  

# ✨ 功能特性

## 📷 批量插入图片
- 支持一次性粘贴多张图床图片直链（每行一个）
- 自动过滤无效链接，仅保留 `jpg/png/webp/gif/bmp` 格式的有效 URL
- 插入前提供缩略图预览，直观确认图片内容

## 🔄 拖拽排序
- 基于 SortableJS 实现流畅的拖拽交互
- 鼠标拖动即可调整图片插入顺序，所见即所得
- 支持动画过渡效果，操作体验更佳

## 🧹 一键清理空行
- 智能识别并删除编辑器中的空段落、纯空格段落
- 自动清理孤立的 `<br>` 标签，保持内容格式整洁
- 插入图片后自动触发清理，无需手动操作

## 📝 快速添加简介
- 表单式填写元数据：标题、作者、原链接、发布日期
- 发布日期自动填充当前日期，支持中文格式（如：2026 年 3 月 20 日）
- 原链接自动识别为可点击超链接，提升可读性
- 简介内容自动插入至文章开头，符合常规排版习惯

## 🎨 界面友好
- 三个功能按钮固定悬浮于页面左上角，随时调用
- 模态弹窗设计，操作聚焦不干扰主编辑区
- 色彩区分功能类型，降低认知负荷

# Telegraph 图片导出工具

🚀 轻量级 Telegraph 图片导出工具，支持导出链接、Markdown，以及极速并行打包下载 ZIP
<p align="center">
  <img src="https://img.shields.io/badge/version-1.0-blue.svg" alt="Version">
  <img src="https://img.shields.io/badge/license-MIT-green.svg" alt="License">
  <img src="https://img.shields.io/badge/platform-Tampermonkey-orange.svg" alt="Platform">
</p>


## ✨ 功能特性

- **📋 导出 TXT** - 一键导出所有图片链接为纯文本文件
- **📝 导出 Markdown** - 生成包含标题和图片引用的 Markdown 文档
- **📦 打包 ZIP** - 并行下载所有图片并打包为 ZIP 压缩包
- **🎨 精美动画** - 按钮悬停时的渐变色切换与晃动动画效果
- **⚡ 极速下载** - 采用 Promise.all 并行下载，速度提升数倍
- **📊 实时进度** - ZIP 打包时显示实时下载进度

## 📸 效果预览

### 按钮效果

| 状态 | 效果 |
|:---:|:---:|
| **默认** | 紫色渐变背景 `#667eea → #764ba2` |
| **悬停** | 粉红渐变背景 `#f093fb → #f5576c` + 晃动动画 |
| **点击** | 按钮缩小反馈 |

### 动画细节

- 🔄 **晃动动画** - 鼠标悬停时触发 0.6 秒的微妙左右晃动 + 轻微旋转效果
- 🎨 **渐变切换** - 从紫色系平滑过渡到粉红色系
- ⬆️ **上浮效果** - 悬停时按钮微微上浮 2px，增强立体感
- 💫 **阴影变化** - 配合颜色变化，阴影更加柔和明亮

# telegraph.js更新
## v2.0 更新日志
===================================================
 * 新增「移除简介」功能 - 一键移除已添加的简介信息
 * 新增「清空内容」功能 - 一键清空编辑器所有内容
 * 重新设计按钮布局 - 采用分组面板设计，更加合理美观
 * 添加完整的代码注释和安全说明
 
 ===================================================
 
 # Telegraph-lmage-Exporter.js更新
 
 ===================================================

 ===================================================




# 📥 安装指南

## 前置要求
安装浏览器扩展：
- Tampermonkey（推荐，支持 Chrome / Firefox / Edge / Safari）
- 或 Violentmonkey
- 或 Greasemonkey（Firefox）

确保可访问以下资源：
- GreasyFork 脚本源
- jsDelivr CDN（用于加载 SortableJS）

## 安装步骤

### 方式一：直接创建脚本
1. 点击浏览器扩展图标 →「添加新脚本」
2. 将本仓库中的完整代码粘贴至编辑器
3. 保存（Ctrl+S / Cmd+S）并启用

### 方式二：通过 GreasyFork 安装（推荐）
1. 访问脚本主页：[【免费完整版】Telegraph 批量插入图床图片链接 + 简介工具](https://greasyfork.org/zh-CN/scripts/570416)和[Telegraph 图片导出工具 (轻量极速重构版)](https://greasyfork.org/zh-CN/scripts/570515)
2. 点击「安装此脚本」按钮
3. 浏览器扩展弹出确认窗口，点击「安装」
4. 刷新或访问 https://telegra.ph 即可生效

# 📁 项目结构  
如题

## 📜 许可证
本项目采用 GNU Lesser General Public License v3.0 开源许可证。  
您可以根据许可证条款：

✅ **免费使用、修改、分发** 本脚本  
✅ **将本脚本集成** 到其他项目中（需遵守 LGPL 传染条款）  
❌ **不得移除** 原始版权声明与许可证声明  

详见 `LICENSE` 文件。
