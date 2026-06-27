# Rose Nebula 架构说明

Rose Nebula 当前采用分层结构，后续开发必须继续保持这个边界。

## 目录职责

```txt
src/
  App.tsx                  # 最外层应用入口，只转到 app 层
  app/                     # 应用状态组合层
  data/                    # 数据入口、类型定义
  scene/                   # 3D 场景层
  scene/components/        # 3D 子组件
  scene/utils/             # 3D 工具函数
  ui/                      # HTML 悬浮 UI 组件
```

## app 层

`src/app/RoseNebulaApp.tsx` 只负责：

- 当前选中节点状态；
- Esc 返回总览；
- 星区切换；
- Canvas、3D 场景和 UI 的组合。

不应该在这里写粒子算法、点位生成、复杂 Three.js 逻辑。

## scene 层

`src/scene/RoseNebulaScene.tsx` 负责组合 3D 组件。

3D 子组件包括：

- `BackgroundDust`：远景星尘；
- `RoseNebulaCloud`：玫瑰星云主体粒子；
- `PetalField`：外围花瓣粒子；
- `RoseCore`：中心玫瑰光核；
- `NebulaShell`：外壳和星区环线；
- `MemoryNodeOrb`：可点击记忆节点；
- `ConnectionArcs`：节点关系弧线；
- `LocalMemoryField`：点击节点后的局部星域；
- `CameraFocus`：点击节点后的镜头推进。

## data 层

`src/data/roseNebulaData.ts` 是当前数据入口。

后续要把旧数据完全迁入 `src/data/`，最终删除根目录下的旧数据文件。

## config 层

`src/scene/roseSceneConfig.ts` 集中管理：

- 相机参数；
- DPR；
- 粒子数量；
- OrbitControls 参数；
- 主题色。

后续调视觉和性能，优先修改这里，不要在组件里到处写 magic number。

## 代码规则

1. App 层不写 3D 算法；
2. 3D 组件不写业务文案；
3. UI 组件不直接计算 3D 点位；
4. 数据结构改动先改类型；
5. 粒子数量和相机参数统一走 config；
6. 每次视觉增强前先保证 build 通过。
