# Rose Nebula 实施规划

> 目标：先把项目规划和代码结构打牢，再继续堆视觉效果。后续所有开发都围绕“稳定、清晰、可维护、可扩展”推进。

## 1. 当前状态判断

当前仓库已经完成了 Rose Nebula 的基础原型：

- React + TypeScript + Vite 项目结构已经存在；
- 入口已经切到 `RoseNebulaApp`；
- 3D 场景具备基础玫瑰星云、粒子云、节点、轨道、局部星域；
- UI 已经有悬浮标题、导航、统计、详情卡和底部提示；
- 数据层已经从诗人主题切换为浪漫记忆节点主题。

但当前代码还属于“快速原型”阶段，最大问题是：

- `RoseNebulaApp.tsx` 文件过大；
- 3D 场景、UI、数据逻辑混在同一个组件里；
- 点云、节点、相机、轨道、详情卡缺少明确模块边界；
- 后续继续美化时容易互相影响；
- 难以单独优化性能或替换视觉模块。

所以下一步不是继续直接叠效果，而是先做结构重构。

---

## 2. 最终代码架构目标

建议重构后的目录结构如下：

```txt
src/
  app/
    RoseNebulaApp.tsx

  data/
    roseNebulaData.ts
    roseNebulaTypes.ts

  scene/
    RoseNebulaScene.tsx
    components/
      BackgroundDust.tsx
      RoseNebulaCloud.tsx
      RoseCore.tsx
      PetalField.tsx
      NebulaShell.tsx
      ZoneRings.tsx
      MemoryNodes.tsx
      ConnectionArcs.tsx
      LocalMemoryField.tsx
      CameraFocus.tsx
      SceneControls.tsx
    utils/
      geometry.ts
      random.ts
      positions.ts
      colors.ts

  ui/
    RoseTitle.tsx
    IconRail.tsx
    TopStats.tsx
    DetailCard.tsx
    BottomHint.tsx

  styles/
    base.css
    rose-nebula.css
```

重构原则：

- `app/` 只负责整体状态组合；
- `scene/` 只负责 3D 画面；
- `ui/` 只负责 HTML 悬浮界面；
- `data/` 只负责内容和类型；
- `scene/utils/` 只放可复用算法；
- CSS 从单文件拆成基础样式和主题样式。

---

## 3. 分阶段开发计划

### Phase 1：安全重构，不改变视觉

目标：把当前大文件拆开，但页面效果尽量保持一致。

任务：

1. 新建 `src/app/RoseNebulaApp.tsx`；
2. 新建 `src/scene/RoseNebulaScene.tsx`；
3. 把 3D 组件拆到 `src/scene/components/`；
4. 把随机数、几何生成、节点坐标计算拆到 `src/scene/utils/`；
5. 把 UI 拆到 `src/ui/`；
6. 把类型拆到 `src/data/roseNebulaTypes.ts`；
7. 保持原入口可运行；
8. 构建通过后再删旧大文件。

验收标准：

- `npm run build` 通过；
- 页面入口仍然是 Rose Nebula；
- 拖动、缩放、点击节点、Esc 返回都正常；
- 视觉效果不明显退化；
- 单个组件文件尽量不超过 180 行。

---

### Phase 2：把 3D 主体写得更像效果图

目标：在结构稳定后，提升主体质感。

重点优化：

1. 中心玫瑰核更清楚：
   - 当前是光球 + torus；
   - 后续改成多层花瓣形曲线或 instanced petals；
   - 形成更明显的“玫瑰中心”。

2. 玫瑰云雾更有厚度：
   - 粒子不要只是均匀点；
   - 增加花瓣旋臂、云团密度区、暗部留白；
   - 让球体有中心、外壳、星环三个层次。

3. 节点更像可点击记忆泡泡：
   - 节点加入图标类型；
   - 核心节点有双层光环；
   - 普通节点降低亮度，避免全屏噪点。

4. 轨道线更精致：
   - 连接线改成弧线；
   - 选中节点时只增强相关连线；
   - 默认连线克制。

验收标准：

- 主体第一眼更接近“玫瑰星云球”；
- 不出现刺眼过曝；
- 不出现卡顿；
- 点击节点后局部星域更有冲击感。

---

### Phase 3：UI 细化和内容体验

目标：让界面不仅好看，还能承载内容。

任务：

1. 右侧详情卡增加“预览图片区”；
2. 节点根据 `type` 显示不同图标；
3. 增加当前星区说明；
4. 增加节点搜索；
5. 增加“沉浸详情层”雏形；
6. 增加音乐小组件，但默认不自动播放。

验收标准：

- UI 仍然是悬浮风格，不变成仪表盘；
- 右侧卡片更接近效果图；
- 内容信息更完整；
- 鼠标操作路径清楚。

---

### Phase 4：性能和质量整理

目标：让项目长期可继续做。

任务：

1. 稳定粒子数量和 DPR；
2. 所有大型 BufferGeometry 使用 `useMemo`；
3. 避免每帧创建对象；
4. 把 magic number 收敛到常量文件；
5. 加 `npm run lint` / `npm run build` 作为每轮修改前后的检查；
6. 整理 README 和开发说明。

验收标准：

- PC 浏览器交互流畅；
- 没有明显内存暴涨；
- 代码结构清楚；
- 后续新增星区、节点、视觉组件不需要改核心架构。

---

## 4. 代码质量标准

后续写代码必须遵守以下标准：

1. 不再把所有逻辑塞到一个文件；
2. 每个组件只负责一件事；
3. 3D 组件和 UI 组件分开；
4. 数据和渲染分开；
5. 大量随机点位必须使用固定 seed，保证每次打开画面稳定；
6. 不在 `useFrame` 里频繁 new 大对象；
7. 所有可复用算法放到 utils；
8. 所有主题色、粒子数量、半径、速度统一放常量；
9. 每次修改先小步提交，不一次性重写全部；
10. 优先保证稳定，再提升震撼感。

---

## 5. 下一次实际编码任务

下一次实际写代码建议只做 Phase 1，不做视觉大改。

具体提交内容：

- 拆分 `RoseNebulaApp.tsx`；
- 建立 `app / scene / ui / data / styles` 目录；
- 保持当前效果基本不变；
- 确认构建可通过；
- 然后再进入视觉增强。

这样后面再做“玫瑰主体更真实”“节点更高级”“详情页更漂亮”的时候，不会越写越乱。
