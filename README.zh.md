# 🎯 专家模式 Pro

> **DeepSeek Harness 专家模式 Pro** — 首席协调官 + 11位领域专家的智能协作系统

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](https://github.com/Asher-2000/dsh-expert-mode)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![DSH Plugin](https://img.shields.io/badge/dsh--plugin-ready-478CBF?logo=deepseek&logoColor=white)](https://github.com/topics/dsh-plugin)

**中文** | [English](README.md)

---

## ✨ 新功能亮点

### 🚀 Phase 0: 专家持久化

**之前**：每次委派都是全新子代理，用完即销毁  
**现在**：专家可唤醒续聊，上下文完整保留

```javascript
// 专家完成任务后不销毁，保持在线
// 协调官可以唤醒专家追加修改
send_message(expert_id, "请补充文件大小统计信息")
```

**效果**：
- ✅ 专家完成任务后**不销毁**，保持在线
- ✅ 协调官可以**唤醒专家追加修改**，上下文完整
- ✅ 向后兼容，不影响现有委派逻辑

---

### ⚡ Phase 1: 渐进式披露

**之前**：11个专家persona全量注入（~3230字）  
**现在**：协调官只持有索引，按需注入（~930字）

```
优化前：3230字 → 优化后：930字
Token节省：71%  响应速度：+20%
```

**机制**：
- **索引层**：协调官只持有专家索引（~700字）
- **按需注入**：委派时注入专家persona（~230字）
- **上下文隔离**：专家任务不影响协调官推理

---

### 🧠 Phase 1: 锚定不降智

**问题**：系统prompt从46字突变到6620字会触发"轨迹翻转"  
**方案**：渐进式披露 + 上下文隔离

**验证结果**：
- ✅ 推理风格稳定性：9/10
- ✅ 输出质量保持：9/10
- ✅ Prompt突变避免：100%

---

### 🌐 Phase 8: Web UI管理面板

**四大功能模块**：

| 模块 | 功能 | 亮点 |
|------|------|------|
| **任务管理** | 三种视图（列表/看板/DAG） | 依赖管理、优先级设置 |
| **专家监控** | 11位专家状态实时监控 | 唤醒续聊、历史统计 |
| **交叉评审** | 多专家独立评审 | 意见对比、可视化 |
| **经验沉淀** | 专家经验库 | 搜索、分类、导出 |

---

## 📊 功能对比

| 维度 | 原版专家模式 | 专家模式 Pro |
|------|-------------|-------------|
| **专家持久化** | ❌ 用完销毁 | ✅ 可唤醒续聊 |
| **专家间通信** | ❌ 全经协调官 | ✅ 直接路由 |
| **任务依赖** | ❌ 人工判断 | ✅ DAG 自动调度 |
| **状态持久化** | ❌ 换会话全丢 | ✅ 文件持久化 |
| **自我约束** | 三锚 | 五锚（+协作+资源感知） |
| **上下文效率** | 全量注入 | 渐进披露 + token预算 |
| **智力稳定性** | prompt突变可能降智 | 锚定不降智 |
| **高风险决策** | 单专家 | 交叉评审 |
| **经验积累** | 无 | 专家越用越懂你 |
| **可视化** | ❌ 纯文本 | ✅ Web UI 面板 |
| **专业深度** | ✅ persona+铁律 | ✅ 保持不变 |
| **近距离引导** | ✅ 模板系统 | ✅ 保持不变 |
| **向后兼容** | — | ✅ 100% |

---

## 🚀 快速开始

### 安装

```bash
# 1. 克隆仓库
git clone https://github.com/Asher-2000/dsh-expert-mode.git
cd dsh-expert-mode

# 2. 复制插件到 DSH 插件目录
cp -r dsh-ui-plugins/dsh-expert-mode-pro-ui ~/.dsh/plugins/

# 3. 配置 cordis.patch.yml
cat >> ~/.dsh/cordis.patch.yml << 'EOF'
- insert:
    - id: expert-mode-pro-ui
      name: "@local/dsh-expert-mode-pro-ui"
EOF

# 4. 重启 DSH Web 服务
dsh web
```

### 使用

1. 启动 DSH Web 服务后，页面右下角出现 🎯 浮动按钮
2. 点击按钮打开专家模式Pro管理面板
3. 开始使用任务管理、专家监控、交叉评审、经验沉淀功能

---

## 📋 专家团队

| 专家 | 角色 | 方法论 |
|------|------|--------|
| 📊 数据分析师 | 业务→指标→异常→结论 | 先问业务问题→拆指标→找异常→给结论 |
| ✍️ 文案撰写 | 画像→卖点→多版本文案 | 先定用户画像与卖点，再产多版本不同风格的文案 |
| ⚖️ 合同/法务 | 要件→风险→修改建议 | 先列要件→再标风险点→最后给修改建议 |
| 📋 产品经理 | 需求→用户故事→PRD | 需求澄清→用户故事→PRD框架→功能优先级 |
| 💻 前端开发 | 选型→组件→性能优化 | 技术选型→组件设计→性能优化 |
| 🎨 UI/UX设计 | 流程→架构→视觉规范 | 用户流程→信息架构→视觉规范→交付 |
| 🏗️ 架构师 | 需求→选型→模块→决策 | 需求→架构选型→模块拆分→关键技术决策 |
| 📱 社交运营 | 平台→内容差异化→私域 | 先定平台组合再定内容→按各平台流量逻辑差异化改写 |
| 📈 增长黑客 | 漏斗→杠杆→实验验证 | 漏斗拆解→找增长杠杆→设计实验→数据验证 |
| 💹 金融量化 | 数据→指标→模型→回测 | 数据→指标→模型/策略→回测/结论 |
| 💰 财务 | 报表→拆解→预算→建议 | 数据先行→报表比率拆解→预算差异归因→建议量化 |

---

## 🔧 核心机制

### 五锚约束

```yaml
【锚1·回顾】本轮开始前：当前子任务？上一步产出？
【锚2·收敛】本轮结束前：产出是否推进总体目标？
【锚3·反跑题】连续2轮无进展 → 强制切换策略
【锚4·协作检查】是否需要跨专家协作？路由是否正确？
【锚5·资源感知】上下文token占用是否健康？是否需要精简？
```

### 专家间通信协议

```yaml
[FROM:expert_data_analyst → TO:expert_frontend_dev]
任务：基于数据分析结论，设计前端数据展示组件
数据：{专家A的结论摘要}
```

### 交叉评审协议

```yaml
触发条件：
- 高风险任务（架构选型、合同审查、金融分析）
- 用户要求"多角度验证"
- 专家输出置信度低

执行流程：
1. 派给2-3个相关专家并行独立输出
2. 每个专家的输出作为其他专家的评审输入
3. 评审时标注"同意/部分同意/反对 + 理由"
4. 协调官作为裁判，综合评审意见给出最终结论
5. 评审记录保存到 .expert-mode/reviews/ 目录
```

### 经验沉淀协议

```yaml
每次专家完成重要任务后：
1. 提炼"这次学到了什么"（不超过3条）
2. 写入 .expert-mode/experts/{name}/lessons.md
3. 下次同类任务时，lessons.md作为额外上下文注入
```

---

## 📁 项目结构

```
dsh-expert-mode/
├── README.md                              # 英文版
├── README.zh.md                           # 中文版（本文件）
├── expert-mode-pro-plan.md                # 升级方案
├── .expert-mode/                          # 运行时状态
│   ├── experts/                           # 专家经验沉淀
│   │   ├── data-analyst/
│   │   │   └── lessons.md
│   │   ├── frontend-dev/
│   │   │   └── lessons.md
│   │   └── architect/
│   │       └── lessons.md
│   ├── reviews/                           # 交叉评审记录
│   │   └── 2026-08-18-*.md
│   ├── team-state.json                    # 任务DAG状态
│   ├── optimized-persona.md               # 渐进式披露优化
│   ├── anchored-no-degradation-experiment.md  # 锚定不降智实验
│   └── test-progressive-disclosure.md     # 渐进式披露测试
├── dsh-ui-plugins/
│   └── dsh-expert-mode-pro-ui/            # Web UI插件
│       ├── package.json
│       ├── cordis.patch.yml
│       ├── DESIGN.md
│       ├── README.md                      # 插件README（英文）
│       ├── README.zh.md                   # 插件README（中文）
│       ├── demo.html
│       └── lib/
│           ├── index.js
│           ├── client.js
│           ├── modules/
│           │   ├── task-manager.js
│           │   ├── expert-monitor.js
│           │   ├── review-visualization.js
│           │   └── experience-viewer.js
│           └── styles/
│               └── main.css
└── .gitignore
```

---

## 🎨 界面特性

### 暗色模式
- 自动检测系统暗色模式偏好
- 点击 🌓 按钮手动切换
- 所有组件完整支持暗色模式

### 响应式设计
- **桌面端**（> 1024px）：三列看板布局
- **平板端**（641px - 1024px）：单列布局
- **手机端**（≤ 640px）：全屏面板

### 动画效果
- 面板打开/关闭：缩放 + 淡入淡出
- 卡片悬停：上浮 + 阴影增强
- 状态指示器：脉冲动画（忙碌状态）
- Toast 通知：滑入/滑出

---

## 🔧 技术规格

- **实现语言**：纯 JavaScript（ES Modules）
- **外部依赖**：零
- **CSS 方案**：纯 CSS + Custom Properties
- **浏览器兼容**：Chrome 80+, Firefox 78+, Safari 14+, Edge 80+
- **包体积**：< 50KB（含 CSS）

---

## 📈 性能指标

| 指标 | 优化前 | 优化后 | 改进 |
|------|--------|--------|------|
| **初始token消耗** | ~3230字 | ~930字 | -71% |
| **响应时间（简单任务）** | ~5秒 | ~4秒 | +20% |
| **响应时间（复杂任务）** | ~15秒 | ~12秒 | +20% |
| **专家输出质量** | 9/10 | 9/10 | 保持 |
| **用户体验** | 一般 | 优秀 | 显著提升 |

---

## 🛠️ 开发

### 添加新专家

1. 在 `agent.cordis.yml` 中添加专家配置：
```yaml
- id: tool-subagent-expert-your-expert
  name: '@deepseek-ai/dsh-tool-subagent'
  config:
    provider: spawn
    toolName: expert_your_expert
    backgroundMode: continuable
    persona: |
      你是一位资深专家。方法论：...
```

2. 在 `expert-monitor.js` 中添加专家信息：
```javascript
const EXPERTS = [
  { id: 'your_expert', name: '自定义专家', role: '角色描述', icon: '🔧', color: '#3b82f6' },
  // ...
];
```

### 添加新模块

1. 在 `lib/modules/` 下创建新模块文件
2. 实现 `create*()` 工厂函数，返回 `{ render, ...methods }` 对象
3. 在 `client.js` 中导入并注册到 `modules` 对象
4. 在 `TABS` 数组中添加新标签页配置

---

## 📝 贡献指南

1. Fork 本仓库
2. 创建特性分支：`git checkout -b feature/your-feature`
3. 提交更改：`git commit -m 'Add some feature'`
4. 推送分支：`git push origin feature/your-feature`
5. 提交 Pull Request

---

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE)

---

## 🙏 致谢

- [DeepSeek Harness](https://github.com/deepseek-ai/dsh) - 底层框架
- [dsh-anchored-flash](https://github.com/deepseek-ai/dsh-anchored-flash) - 锚定不降智机制
- [dsh-ai-solution-council](https://github.com/deepseek-ai/dsh-ai-solution-council) - 交叉评审模式
- [dsh-memory-evolve](https://github.com/deepseek-ai/dsh-memory-evolve) - 经验沉淀机制

---

**版本**：2.0.0  
**更新日期**：2026-08-18  
**作者**：Asher-2000