# 诗云 · 中国诗歌三维星系

一个参考「诗云」视频效果设计的 PC 端沉浸式诗歌宇宙 Web App 原型。

## 功能

- 全屏星系画布
- 85,000 个程序化诗歌星点
- 诗人主星、朝代星云、发光星团
- 搜索诗人、诗名、意象
- 朝代筛选：先秦、汉魏六朝、唐、宋、元明清、近现代
- 关系网络模式：显示诗人之间的航线
- 巡航模式：自动旋转漫游
- 读诗模式：右侧沉浸式诗歌卡片
- PC 端优先，兼容移动端简化布局

## 技术栈

- React
- TypeScript
- Vite
- Canvas 2.5D / WebGL 风格星系渲染
- CSS Glassmorphism UI

## 本地运行

```bash
npm install
npm run dev
```

浏览器打开终端提示的地址，通常是：

```txt
http://localhost:5173
```

## 打包

```bash
npm run build
npm run preview
```

## GitHub Pages 部署

仓库已包含 `.github/workflows/deploy.yml`。进入仓库：

Settings → Pages → Source 选择 **GitHub Actions**。

之后推送到 `main` 分支会自动部署。

## 后续升级方向

- 接入真实古诗词 JSON 数据集。
- 使用 embedding / 主题模型把诗歌映射到三维坐标。
- 将诗人关系替换成真实师承、唱和、引用网络。
- 使用 WebGL InstancedMesh / Shader 做百万级星点。
- 增加时间轴飞行、格律筛选、诗体筛选和全文检索。
