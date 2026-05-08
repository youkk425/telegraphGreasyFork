<div align="center">

# telegraphGreasyFork

Telegra.ph 编辑器增强脚本集 — 批量插入图片、拖拽排序、导出打包，一站式提升创作效率

[![telegraph.js](https://img.shields.io/badge/telegraph.js-v2.2-blue.svg)](https://greasyfork.org/zh-CN/scripts/570416)
[![Exporter](https://img.shields.io/badge/Exporter-v1.0-9cf.svg)](https://greasyfork.org/zh-CN/scripts/570515)
[![Platform](https://img.shields.io/badge/platform-Tampermonkey-orange.svg)](https://www.tampermonkey.net/)
[![License](https://img.shields.io/badge/license-GPLv3-green.svg)](LICENSE)

</div>

---

## ✨ 功能特性

### 📷 telegraph.js — Telegraph 批量插入图床图片链接 + 简介工具

| 功能 | 说明 |
|:---|:---|
| 🖼️ 批量插入图片 | 一次粘贴多张图床链接，自动过滤无效链接（仅保留 jpg/png/webp/gif/bmp），插入前缩略图预览 |
| 🔀 拖拽排序 | 基于 SortableJS 的流畅拖拽，调整图片插入顺序 |
| 🧹 一键清理空行 | 智能删除空段落、纯空格段落、孤立 br 标签，插入图片后自动触发 |
| 📝 快速添加简介 | 表单填写元数据（标题、作者、原链接、发布日期），日期自动填充中文格式，原链接自动超链接，内容插入文章开头 |
| ❌ 移除简介 | 一键移除已添加的简介 |
| 🗑️ 清空内容 | 一键清空编辑器所有内容 |
| ⬆️⬇️ 导航按钮 | 回到顶部 / 到达底部 |
| 🎞️ 自动滚动 | 可调速度（1-100），可拖拽移动按钮位置 |

### 📦 Telegraph-Image-Exporter.js — Telegraph 图片导出工具

| 功能 | 说明 |
|:---|:---|
| 📋 导出 TXT | 一键导出所有图片链接为纯文本 |
| 📝 导出 Markdown | 生成包含标题和图片引用的 Markdown 文档 |
| 🗜️ 打包 ZIP | 并行下载所有图片并打包为 ZIP（Promise.all），实时进度显示 |

## 📸 效果预览

<!-- 在此处添加截图 -->
<!-- ![telegraph.js 截图](docs/screenshot-telegraph.png) -->
<!-- ![Exporter 截图](docs/screenshot-exporter.png) -->

> 🎨 界面采用磨砂玻璃、霓虹发光、波纹动画等高级视觉效果，详见 [advanced-styles.js](advanced-styles.js)

## 📥 安装指南

### 前置要求

安装浏览器扩展（任选其一）：

- [Tampermonkey](https://www.tampermonkey.net/)（推荐，支持 Chrome / Firefox / Edge / Safari）
- [Violentmonkey](https://violentmonkey.github.io/)
- [Greasemonkey](http://www.greasespot.net/)（Firefox）

### 方式一：通过 GreasyFork 安装（推荐）

1. 访问脚本页面，点击「安装此脚本」
   - telegraph.js → [GreasyFork](https://greasyfork.org/zh-CN/scripts/570416)
   - Exporter → [GreasyFork](https://greasyfork.org/zh-CN/scripts/570515)
2. 浏览器扩展弹出确认窗口，点击「安装」
3. 访问 [telegra.ph](https://telegra.ph) 即可生效

### 方式二：手动创建脚本

1. 点击浏览器扩展图标 →「添加新脚本」
2. 将本仓库中对应脚本的完整代码粘贴至编辑器
3. 保存（`Ctrl+S` / `Cmd+S`）并启用

## 📖 使用说明

### telegraph.js

1. 打开 [telegra.ph](https://telegra.ph) 编辑器
2. 页面左侧出现浮动功能面板
3. 点击对应按钮即可使用各项功能：
   - **批量插入** — 粘贴图床链接（每行一个），确认后自动插入
   - **添加简介** — 填写元数据表单，自动插入文章开头
   - **清理空行** — 一键清理多余空行（插入图片后自动触发）
   - **导航 / 滚动** — 使用右下角按钮快速定位或自动滚动

### Telegraph-Image-Exporter.js

1. 打开包含图片的 Telegraph 文章页面
2. 页面左侧出现导出按钮组
3. 选择导出方式：
   - **TXT** — 导出纯文本图片链接列表
   - **Markdown** — 生成带标题和图片引用的 MD 文件
   - **ZIP** — 并行下载图片并打包（显示实时进度）

## 📁 项目结构

```
telegraphGreasyFork/
├── telegraph.js                    # 主增强脚本 v2.2 (LGPL-3.0)
├── Telegraph-Image-Exporter.js     # 图片导出工具 v1.0 (MIT)
├── advanced-styles.js              # 高级视觉效果模块
├── README.md                       # 项目说明
└── LICENSE                         # GPLv3 许可证
```

## 📋 更新日志

### telegraph.js

- **v2.2** — 自动滚动按钮位置调整，新增拖拽移动功能，速度文本颜色调整
- **v2.1** — 增加到达底部和回到顶部按钮
- **v2.0** — 新增移除简介和清空内容功能，重新设计按钮布局（分组面板设计）
- **v1.x** — 基础功能：批量插入、拖拽排序、清理空行、添加简介

### Telegraph-Image-Exporter.js

- **v1.0** — 初始版本，支持导出 TXT / Markdown / ZIP

## 🤝 贡献指南

欢迎贡献代码！请遵循以下流程：

1. Fork 本仓库
2. 创建功能分支（`git checkout -b feature/your-feature`）
3. 提交更改（`git commit -m 'feat: add your feature'`）
4. 推送分支（`git push origin feature/your-feature`）
5. 创建 Pull Request

## 📜 许可证

本项目基于 [GNU General Public License v3.0](LICENSE) 开源。

各脚本独立许可：

| 脚本 | 许可证 |
|:---|:---|
| telegraph.js | LGPL-3.0 |
| Telegraph-Image-Exporter.js | MIT |
