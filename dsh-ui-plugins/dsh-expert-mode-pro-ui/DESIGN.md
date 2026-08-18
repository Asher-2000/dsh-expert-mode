# Expert Mode Pro UI - 设计文档

## 1. 概述

Expert Mode Pro UI 是一个为 DSH Expert Mode Pro 提供可视化管理界面的 Web UI 插件。它通过四大核心模块——任务管理、专家监控、交叉评审、经验沉淀——为用户提供直观的多专家协作管理体验。

### 1.1 设计目标

- **零依赖**：纯 JavaScript 实现，无任何外部库依赖
- **响应式设计**：完美适配桌面、平板、手机三种设备
- **暗色模式**：支持系统级暗色模式检测和手动切换
- **DSH 集成**：通过 ModuleLoader 系统无缝集成到 DSH Web UI
- **本地持久化**：使用 localStorage 存储所有数据，刷新不丢失

### 1.2 技术选型理由

| 决策点 | 选择 | 理由 |
|--------|------|------|
| UI 框架 | 纯 Vanilla JS | 零依赖要求，避免框架引入额外包体积 |
| 样式方案 | 纯 CSS + Custom Properties | 暗色模式支持，无 CSS-in-JS 运行时开销 |
| 数据存储 | localStorage | 无需后端，本地持久化，适合管理面板场景 |
| 组件模式 | 函数式工厂 + 模块化 | 每个功能模块独立，便于维护和扩展 |
| 渲染方式 | 模板字符串 + DOM API | 简单高效，无需虚拟 DOM |

---

## 2. 架构设计

### 2.1 目录结构

```
dsh-expert-mode-pro-ui/
├── package.json              # 插件元数据
├── cordis.patch.yml          # DSH 集成配置
├── DESIGN.md                 # 设计文档（本文件）
├── README.md                 # 使用文档
└── lib/
    ├── index.js              # 入口文件
    ├── client.js             # 客户端主插件
    ├── modules/
    │   ├── task-manager.js   # 任务管理模块
    │   ├── expert-monitor.js # 专家监控模块
    │   ├── review-visualization.js  # 交叉评审模块
    │   └── experience-viewer.js     # 经验沉淀模块
    └── styles/
        └── main.css          # 主样式表
```

### 2.2 模块架构

```
┌─────────────────────────────────────────────────────────────┐
│                    ExpertModeProUI                           │
├─────────────────────────────────────────────────────────────┤
│  Layer 4: 交互层（模态框、Toast、事件绑定）                    │
├─────────────────────────────────────────────────────────────┤
│  Layer 3: 模块层（TaskManager / ExpertMonitor /              │
│           ReviewViz / ExperienceViewer）                     │
├─────────────────────────────────────────────────────────────┤
│  Layer 2: 数据层（Storage 适配器、数据模型）                   │
├─────────────────────────────────────────────────────────────┤
│  Layer 1: 样式层（CSS Custom Properties、响应式）              │
├─────────────────────────────────────────────────────────────┤
│  Layer 0: 框架层（ModuleLoader 集成、DOM 初始化）             │
└─────────────────────────────────────────────────────────────┘
```

### 2.3 数据流

```
用户交互 → 事件监听 → 模块方法调用 → Storage 读写 → UI 重新渲染
                    ↓
              Toast 通知反馈
```

---

## 3. 模块详细设计

### 3.1 任务管理模块 (TaskManager)

**数据模型：**

```javascript
{
  id: 'task_xxx',           // 唯一标识
  name: '任务名称',          // 任务名
  description: '任务描述',   // 可选描述
  status: 'pending',        // pending | in_progress | completed | blocked
  assignee: 'expert_xxx',   // 分配的专家ID
  dependencies: ['task_yyy'], // 依赖的任务ID列表
  priority: 'medium',       // low | medium | high
  createdAt: 1234567890,    // 创建时间
  updatedAt: 1234567890,    // 更新时间
  completedAt: null          // 完成时间
}
```

**功能：**

- 三种视图：列表视图、看板视图、DAG 视图
- 任务 CRUD 操作
- 依赖关系管理（自动检查前置任务完成状态）
- 专家分配
- 优先级标记
- 过滤和筛选

**DAG 算法：**

使用拓扑排序算法确定任务执行顺序，自动检测循环依赖。

### 3.2 专家监控模块 (ExpertMonitor)

**11 位专家定义：**

| ID | 名称 | 角色 | 图标 | 颜色 |
|----|------|------|------|------|
| expert_data_analyst | 数据分析师 | 先问业务→拆指标→找异常→给结论 | 📊 | #3b82f6 |
| expert_copywriter | 文案撰写 | 先定画像→产多版本→差异化 | ✍️ | #8b5cf6 |
| expert_legal_review | 合同/法务 | 先列要件→标风险→给修改建议 | ⚖️ | #ef4444 |
| expert_product_manager | 产品经理 | 需求澄清→用户故事→PRD→优先级 | 📋 | #f59e0b |
| expert_frontend_dev | 前端开发 | 技术选型→组件设计→性能优化 | 💻 | #10b981 |
| expert_uiux_design | UI/UX设计 | 用户流程→信息架构→视觉规范 | 🎨 | #ec4899 |
| expert_architect | 架构师 | 需求→架构选型→模块拆分→决策 | 🏗️ | #6366f1 |
| expert_social_media | 社交运营 | 平台组合→内容差异化→私域闭环 | 📱 | #06b6d4 |
| expert_growth | 增长黑客 | 漏斗拆解→增长杠杆→实验验证 | 📈 | #84cc16 |
| expert_quant_finance | 金融量化 | 数据→指标→模型→回测 | 💹 | #f97316 |
| expert_finance | 财务 | 数据→报表拆解→预算归因→建议 | 💰 | #14b8a6 |

**专家状态：**

- `idle`：空闲，可接受任务
- `busy`：忙碌，当前有任务在执行
- `offline`：离线，不参与任务分配

**功能：**

- 专家卡片网格展示
- 状态指示器（实时脉冲动画）
- 当前任务显示
- 历史任务统计（已完成/进行中/总计）
- 唤醒/离线控制
- 专家详情模态框（含任务图表）

### 3.3 交叉评审模块 (ReviewVisualization)

**数据模型：**

```javascript
{
  id: 'review_xxx',
  title: '评审标题',
  description: '评审说明',
  participants: ['expert_xxx', 'expert_yyy'],  // 参与专家
  opinions: [
    {
      id: 'op_xxx',
      author: 'expert_xxx',
      verdict: 'agree',     // agree | partial | disagree
      content: '评审意见内容',
      createdAt: 1234567890
    }
  ],
  conclusion: '最终结论',
  status: 'in_progress',    // in_progress | completed
  createdAt: 1234567890,
  completedAt: null
}
```

**评审意见类型：**

- `agree`：同意（绿色标记）
- `partial`：部分同意（黄色标记）
- `disagree`：反对（红色标记）

**功能：**

- 评审任务创建和管理
- 参与专家选择
- 评审意见提交（带立场标记）
- 意见可视化对比（颜色编码）
- 评审统计（同意/部分同意/反对数量）
- 评审记录查看和删除

### 3.4 经验沉淀模块 (ExperienceViewer)

**数据模型：**

```javascript
{
  id: 'exp_xxx',
  expertId: 'expert_xxx',
  expertName: '专家名称',
  title: '经验标题',
  content: '经验内容',
  category: 'lesson',       // technical | process | communication | lesson | best_practice
  tags: ['tag1', 'tag2'],
  taskId: 'task_xxx',       // 可选关联任务
  taskName: '任务名称',
  createdAt: 1234567890,
  updatedAt: 1234567890
}
```

**经验分类：**

| 分类 | 标签 | 图标 |
|------|------|------|
| technical | 技术经验 | 🔧 |
| process | 流程经验 | 📋 |
| communication | 协作经验 | 🤝 |
| lesson | 踩坑教训 | ⚠️ |
| best_practice | 最佳实践 | ⭐ |

**功能：**

- 经验列表展示（带分类标签）
- 全文搜索（标题、内容、专家名、标签）
- 分类过滤
- 专家过滤
- JSON/Markdown 导出
- 经验删除

---

## 4. 样式系统

### 4.1 CSS Custom Properties

使用 CSS Custom Properties 实现主题系统，支持：

- 亮色模式（默认）
- 暗色模式（系统级检测 + 手动切换）

### 4.2 响应式断点

| 断点 | 布局调整 |
|------|----------|
| > 1024px | 桌面端，三列看板 |
| 641px - 1024px | 平板端，单列看板 |
| ≤ 640px | 手机端，全屏面板 |

### 4.3 设计令牌

```css
:root {
  /* 间距系统 */
  --emp-space-xs: 4px;
  --emp-space-sm: 8px;
  --emp-space-md: 12px;
  --emp-space-lg: 16px;
  --emp-space-xl: 24px;

  /* 圆角系统 */
  --emp-radius-sm: 6px;
  --emp-radius-md: 8px;
  --emp-radius-lg: 12px;

  /* 阴影系统 */
  --emp-shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --emp-shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);

  /* 动画系统 */
  --emp-transition-fast: 150ms ease;
  --emp-transition-normal: 300ms ease;
}
```

---

## 5. DSH 集成

### 5.1 ModuleLoader 集成

插件通过 `window.__ModuleLoader__.load()` 注册到 DSH 模块系统，作为浏览器端插件加载。

### 5.2 cordis.patch.yml

通过 `dsh.bundle.patch` 字段声明插件为 DSH bundle 的一部分，支持在 DSH 启动时自动加载。

### 5.3 数据持久化

使用 `localStorage` 存储数据，key 前缀为 `dsh_emp_`，确保与其他 DSH 插件数据隔离。

---

## 6. 性能优化

### 6.1 按需渲染

只有当前激活的标签页才执行渲染，避免不必要的 DOM 操作。

### 6.2 CSS 动画优化

- 使用 `transform` 和 `opacity` 进行动画，避免触发布局重排
- 使用 `will-change` 提示浏览器优化动画性能

### 6.3 事件委托

使用事件委托减少事件监听器数量，特别是在任务列表和专家网格中。

---

## 7. 可访问性

### 7.1 键盘导航

- `Tab`：在可交互元素间移动焦点
- `Enter`/`Space`：激活按钮
- `Escape`：关闭模态框

### 7.2 焦点样式

所有可交互元素都有清晰的焦点样式（蓝色轮廓）。

### 7.3 语义化 HTML

使用语义化 HTML 标签（`button`、`input`、`select`、`textarea`）确保屏幕阅读器兼容。

---

## 8. 扩展性

### 8.1 添加新模块

1. 在 `lib/modules/` 下创建新模块文件
2. 在 `client.js` 中导入并注册到 `modules` 对象
3. 在 `TABS` 数组中添加新标签页

### 8.2 自定义专家

修改 `expert-monitor.js` 中的 `EXPERTS` 数组即可自定义专家列表。

### 8.3 数据迁移

存储层使用简单的 key-value 模式，可通过 `storage.get()` / `storage.set()` 轻松迁移数据。
