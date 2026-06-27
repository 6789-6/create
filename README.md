# Rose Nebula · 玫瑰星云

一个独立的浪漫主题 3D 交互作品。它不是诗云项目，也不依赖旧仓库，而是一个围绕“浪漫回忆宇宙”展开的全新展示型项目。

## 项目定位

Rose Nebula 将回忆、地点、音乐、留言、礼物和未来约定组织成一个可旋转的 3D 玫瑰星云体。用户可以拖动旋转、滚轮缩放、点击发光节点进入细节层。

核心体验：

- 第一眼呈现大型玫瑰星云球，形成浪漫震撼感
- 所有信息以轻量悬浮 UI 呈现，不做传统仪表盘
- 每个发光节点代表一个记忆点、时刻、地点、音乐、礼物或承诺
- 点击节点后镜头推进，节点周围出现局部星域和详情卡
- 整体稳定，动态主要发生在拖动、缩放、悬停和点击时

## 视觉风格

关键词：浪漫、梦幻、高级、轻奢、沉浸、玫瑰星雾、玻璃悬浮 UI。

主色系统：

- 深背景：`#120818` / `#1b0d27`
- 玫瑰粉：`#ff6da8`
- 柔粉：`#ffd1e5`
- 深玫红：`#ff5f9d`
- 梦幻紫：`#b779ff`
- 暖白高光：`#fff1f7`

## 内容结构

当前内容分为 7 个星区：

1. First Date / 初见星环
2. City Lights / 城市灯海
3. Moon River / 月光河岸
4. Letters / 心动来信
5. Melodies / 旋律星尘
6. Surprises / 惊喜玫瑰
7. Promises / 誓约轨道

每个星区包含多个节点，每个节点都有：

- 标题
- 类型
- 重要等级
- 日期
- 地点
- 描述
- 标签
- 3D 分布参数

## 技术栈

- React
- TypeScript
- Vite
- Three.js
- React Three Fiber
- Drei OrbitControls

## 本地运行

```bash
npm install
npm run dev
```

## 构建

```bash
npm run build
```

## 部署

仓库使用 GitHub Actions 部署到 GitHub Pages。推送到 `main` 后会自动构建并发布。

页面地址：

```txt
https://6789-6.github.io/create/
```
