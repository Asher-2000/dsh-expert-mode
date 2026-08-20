<p align="center">
  <img src="assets/main-ui.jpg" alt="DSH Expert Mode" width="600" />
</p>

<h1 align="center">🧠 DSH Expert Mode</h1>

<p align="center">
  <strong>一个 Agent Preset，让 DSH 变成「1 位协调官 + 11 位专家」的多代理团队</strong>
</p>

<p align="center">
  <a href="https://github.com/topics/dsh-plugin"><img src="https://img.shields.io/badge/dsh--plugin-ready-478CBF?logo=deepseek&logoColor=white" alt="dsh-plugin"></a>
  <a href="https://github.com/awesome-dsh-plugin/awesome-dsh-plugin"><img src="https://img.shields.io/badge/awesome--dsh--plugin-featured-1a56db?logo=deepseek&logoColor=white" alt="Featured in Awesome DSH Plugin"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License: MIT"></a>
  <a href="https://github.com/Asher-2000/dsh-expert-mode"><img src="https://img.shields.io/github/stars/Asher-2000/dsh-expert-mode" alt="Stars"></a>
</p>

<p align="center">
  <a href="README.zh.md">中文</a> · <a href="README.md">English</a>
</p>

---

## ✨ 它做了什么

装上这个 preset 后，DSH 自动切换成「首席协调官」模式：

| 场景 | 行为 |
|------|------|
| 收到任务 | 判断领域 → 委派给最合适的专家 |
| 复杂任务 | 同时调度多个专家并行 |
| 简单任务 | 协调官自己搞定，不强行委派 |
| 任务完成 | 专家保持在线，可追加修改 |

不需要自己写 prompt，不需要维护多套配置——**装上就用**。

---

## 🖼️ 运行效果

<p align="center">
  <img src="assets/main-ui.jpg" alt="DSH Expert Mode 主界面" width="500" /><br/>
  <em>DSH 工作区中选择「专家模式」preset 即可使用</em>
</p>

<p align="center">
  <img src="assets/expert-mode-run.jpg" alt="专家模式运行实况" width="500" /><br/>
  <em>5 个专家子代理同时工作，实时展示 token 消耗与耗时</em>
</p>

---

## 🧩 11 位专家

| 专家 | 工具 | 擅长 |
|------|------|------|
| 📊 数据分析师 | `expert_data_analyst` | 数据清洗、统计分析、可视化 |
| ✍️ 文案撰写 | `expert_copywriter` | 营销文案、内容创作、改写润色 |
| ⚖️ 合同/法务审查 | `expert_legal_review` | 合同条款审查、法律风险识别 |
| 📋 产品经理 | `expert_product_manager` | 需求分析、PRD 撰写、竞品调研 |
| 🖥️ 前端开发 | `expert_frontend_dev` | Web 前端实现、组件开发 |
| 🎨 UI/UX 设计 | `expert_uiux_design` | 界面设计、交互方案、设计系统 |
| 🏗️ 架构师 | `expert_architect` | 系统设计、技术选型、架构评审 |
| 🖥️ 后端开发 | `expert_backend_dev` | API 开发、服务器逻辑、数据库集成 |
| 🛠️ DevOps | `expert_devops` | CI/CD、Docker、Kubernetes、部署自动化 |
| 🗄️ 数据库 | `expert_database` | Schema 设计、查询优化、数据建模 |
| 🧪 测试工程师 | `expert_qa_engineer` | 测试策略、自动化、质量保证 |
| 🔒 安全专家 | `expert_security` | 代码审计、漏洞评估、安全加固 |
| 📱 全社交平台运营 | `expert_social_media` | 多平台内容分发、账号运营 |
| 🚀 增长黑客 | `expert_growth` | 增长策略、转化漏斗、A/B 测试 |
| 💹 金融/量化 | `expert_quant_finance` | 量化模型、金融分析、风控 |
| 💰 财务 | `expert_finance` | 财务分析、报表解读、预算编制 |

---

## 🔧 核心机制

### 🚀 快速通道

以下情况协调官**直接回答**，不委派专家：

- 单文件读写/编辑
- 简单问答（不涉及专业知识）
- 闲聊/打招呼
- 用户明确说「你直接做」
- 任务能用一条命令完成

### ⚡ 故障恢复

- 专家调用超时/失败 → **自动重试 1 次**
- 连续失败 2 次 → 告知用户，建议换方案
- 专家输出明显跑题 → **召回并补充引导**

### 📋 渐进式披露

协调官持有完整的专家方法论索引，**按需注入**——不是把所有专家的完整 persona 一次性塞进上下文。

| 指标 | 旧版 | 新版 | 提升 |
|------|------|------|------|
| 专家 persona tokens | 3850 chars | 533 chars | **-86%** |
| 总 prompt tokens | ~2205 | ~1582 | **-28%** |

### 🎯 锚定不降智

解决系统 prompt 突变导致的「轨迹翻转」问题，确保推理风格稳定性：

| 锚点 | 作用 |
|------|------|
| **风格锁定** | 始终使用默认推理风格 |
| **证据优先** | 每个结论必须有数据/逻辑依据 |
| **逐步推进** | 复杂任务分步执行，禁止跳步 |
| **一致性校验** | 输出前检查推理风格是否一致 |
| **防漂移** | 上下文满时主动保存状态 |

### 🏗️ 五锚约束

协调官每轮对话强制自检，防止跑题和低效循环：

| 锚点 | 作用 |
|------|------|
| **回顾** | 每轮开始前，一句话说清当前在做什么 |
| **收敛** | 每轮结束前，确认这一步是否推进了目标 |
| **反跑题** | 连续 2 轮无进展 → 强制换策略 |
| **协作检查** | 委派前判断是否需要跨专家协作 |
| **资源感知** | 全程监控 token，超 70% 自动精简 |

### 🎯 近距离引导

协调官委派专家时，填入结构化引导模板：

```
┌─ 近距离引导 ─┐
身份：你是 [专家角色]
任务：{具体任务描述}
输入：{输入数据}
输出格式：[从方法论索引中取]
完成标准：[明确的交付标准]
└──────────────┘
```

子代理一启动就明确「我是谁、要做什么、怎么交付」。

### 🔗 专家间通信协议

跨专家协作时，协调官通过结构化消息路由：

```
[FROM:expert_data_analyst → TO:expert_frontend_dev]
任务：基于分析结论设计前端数据展示组件
数据：{专家 A 的结论摘要}
```

### 🔍 交叉评审

高风险任务（架构选型、合同审查、财务分析）自动触发多专家独立评审，协调官综合结论。

### 💾 经验沉淀

专家完成重要任务后，提取经验写入 `.expert-mode/experts/{name}/lessons.md`，下次同类任务自动注入。

### 🧠 专家持久化

专家完成任务后**不销毁**，保持在线。协调官可以唤醒专家追加修改，上下文完整保留。

---

## 📦 安装

### 方式一：dsh plugin add（推荐）

```bash
dsh plugin --profile web add github:Asher-2000/dsh-expert-mode
```

### 方式二：git clone

```bash
mkdir -p ~/.dsh/.agent-presets
git clone https://github.com/Asher-2000/dsh-expert-mode.git ~/.dsh/.agent-presets/expert-mode
```

**想要英文版？** 仓库内置 `expert-mode-en/` preset：

```bash
cp -r ~/.dsh/.agent-presets/expert-mode/expert-mode-en ~/.dsh/.agent-presets/expert-mode-en
```

### 方式三：手动下载

从 [Releases](https://github.com/Asher-2000/dsh-expert-mode/releases) 下载最新版，把 `preset.yml` + `agent.cordis.yml` 放到 `~/.dsh/.agent-presets/expert-mode/`。

---

## 🚀 使用

安装后，在 DSH **Web GUI 新建会话**时选择「专家模式」preset 即可。

---

## ❓ FAQ

**Q: 会额外消耗模型额度吗？**
A: 委派给专家子代理时会产生子代理的模型调用（DSH 子代理机制），与官方子代理功能一致；简单任务协调官直接回答，不产生额外调用。

**Q: 可以自己加专家吗？**
A: 可以。复制 `agent.cordis.yml` 中任意 expert 条目，修改工具名与 persona 即可。

**Q: 与官方 standard preset 的关系？**
A: 基于官方 standard preset 组合改造，保留完整工具集，仅增加专家委派层。

---

## 📁 文件结构

```
.
├── preset.yml              # preset 元信息（名称 + 描述）
├── agent.cordis.yml        # 协调官 persona + 方法论索引 + 专家子代理工具定义
├── expert-mode-en/         # 英文版 preset
│   ├── preset.yml
│   └── agent.cordis.yml
├── .expert-mode/           # 专家经验库
│   └── experts/            # 每个专家的 lessons.md
├── assets/                 # 截图
├── README.md               # English
├── README.zh.md            # 中文
└── LICENSE
```

---

## 📝 版本历史

| 版本 | 更新 |
|------|------|
| **v0.6.0** | 快速通道 + 故障恢复 + 双语支持完善 |
| **v0.5.0** | 渐进式披露 + 锚定不降智（prompt tokens -28%） |
| **v0.4.0** | 五锚约束 + 近距离引导 + 交叉评审 + 经验沉淀 |
| **v0.3.0** | 专家持久化 + 通信协议 |
| **v0.2.0** | 基础多专家委派 |

---

## 🏆 社区收录

- 📢 入选 **Awesome DSH Plugin 精选列表**：https://github.com/awesome-dsh-plugin/awesome-dsh-plugin
- 🏷️ GitHub `dsh-plugin` topic 收录：https://github.com/topics/dsh-plugin

---

## 🏷️ Tags

`dsh` `deepseek-harness` `agent-preset` `expert-mode` `multi-agent` `subagent` `ai-agent` `dsh-plugin`

---

## 📄 License

MIT License — see [LICENSE](LICENSE).

