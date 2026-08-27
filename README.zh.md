# 🧠 DSH 专家模式

<p align="center">
  <strong>首席协调官 + 17 位领域专家 — 全栈多智能体团队</strong><br/>
  <em>1 Coordinator + 17 Experts — Full-Stack Multi-Agent Team</em>
</p>

<p align="center">
  <img src="assets/main-ui.jpg" alt="DSH 专家模式主界面" width="600" />
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/dsh-expert-mode"><img src="https://img.shields.io/npm/v/dsh-expert-mode?style=flat-square&color=5B4CF0" alt="npm version"></a>
  <a href="https://www.npmjs.com/package/dsh-expert-mode"><img src="https://img.shields.io/npm/dm/dsh-expert-mode?style=flat-square&color=5B4CF0" alt="npm downloads"></a>
  <a href="https://dshfind.com/en/plugins/Asher-2000/dsh-expert-mode"><img src="https://dshfind.com/api/badge/Asher-2000/dsh-expert-mode" alt="dshfind"></a>
  <a href="https://dshfind.com/en/plugins/Asher-2000/dsh-expert-mode"><img src="https://dshfind.com/api/card/Asher-2000/dsh-expert-mode" alt="dshfind card" width="220"></a>
</p>

<p align="center">
  <a href="https://github.com/topics/dsh-plugin"><img src="https://img.shields.io/badge/dsh--plugin-ready-478CBF?logo=deepseek&logoColor=white" alt="dsh-plugin"></a>
  <a href="https://github.com/awesome-dsh-plugin/awesome-dsh-plugin"><img src="https://img.shields.io/badge/awesome--dsh--plugin-featured-1a56db?logo=deepseek&logoColor=white" alt="Featured in Awesome DSH Plugin"></a>
  <a href="https://github.com/Asher-2000/dsh-expert-mode/releases"><img src="https://img.shields.io/github/v/release/Asher-2000/dsh-expert-mode?label=release" alt="Release"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License: MIT"></a>
  <a href="https://github.com/Asher-2000/dsh-expert-mode"><img src="https://img.shields.io/github/stars/Asher-2000/dsh-expert-mode" alt="Stars"></a>
</p>

<p align="center">
  <a href="README.md">English</a> · <a href="README.zh.md">中文</a>
</p>

---

## ✨ 功能介绍

安装此预设后，DSH 自动变成「首席协调官」模式：

| 场景 | 行为 |
|------|------|
| 收到任务 | 识别领域 → 委派给最合适的专家 |
| 复杂任务 | 并行派发多个专家 |
| 简单任务 | 协调官直接处理 — 不强制委派 |
| 任务完成 | 专家在线等待后续修改 |

无需自定义提示词。无需多配置维护。**安装即用。**

---

## 🖼️ 演示

<p align="center">
  <img src="assets/main-ui.jpg" alt="DSH Expert Mode 主界面" width="500" /><br/>
  <em>在 DSH 工作区选择「专家模式」预设即可使用</em>
</p>

<p align="center">
  <img src="assets/expert-mode-run.jpg" alt="Expert Mode 运行中" width="500" /><br/>
  <em>5 个专家子代理并行工作，实时显示 token 用量和耗时</em>
</p>

---

## 🧩 17 位专家

### 🎯 全栈核心（6位）

| 专家 | 工具 | 领域 |
|------|------|------|
| 🖥️ 前端开发 | `expert_frontend_dev` | Web 前端、React/Vue、CSS/UI |
| 🖥️ 后端开发 | `expert_backend_dev` | API、服务器逻辑、认证授权 |
| 🗄️ 数据库 | `expert_database` | Schema 设计、SQL、优化 |
| 🏗️ 架构师 | `expert_architect` | 系统设计、技术选型 |
| 🛠️ DevOps | `expert_devops` | CI/CD、Docker、K8s、部署 |
| 🧪 测试工程师 | `expert_qa_engineer` | 测试策略、自动化 |

### 🔒 安全与数据（3位）

| 专家 | 工具 | 领域 |
|------|------|------|
| 🔒 安全专家 | `expert_security` | 代码审计、漏洞评估、加固 |
| 📊 数据分析师 | `expert_data_analyst` | 统计、可视化、洞察 |
| 🎨 UI/UX 设计 | `expert_uiux_design` | 界面设计、设计系统 |

### 💼 业务支持（7位）

| 专家 | 工具 | 领域 |
|------|------|------|
| 📋 产品经理 | `expert_product_manager` | PRD、需求分析、竞品调研 |
| ✍️ 文案专家 | `expert_copywriter` | 营销文案、内容创作 |
| 🎬 生图短视频 | `expert_media_creator` | 分镜、生图、AI 视频、成片 |
| ⚖️ 法务审核 | `expert_legal_review` | 合同审核、法律风险 |
| 📱 社交运营 | `expert_social_media` | 多平台分发、账号管理 |
| 🚀 增长黑客 | `expert_growth` | 增长策略、A/B 测试 |
| 💹 量化金融 | `expert_quant_finance` | 量化模型、风险控制 |
| 💰 财务专家 | `expert_finance` | 财务分析、预算规划 |

---

## 🛡️ 核心功能

| 功能 | 说明 |
|------|------|
| 🎯 **智能委派** | 自动识别任务领域，路由给最合适的专家 |
| 🚀 **快速通道** | 简单任务直接处理 — 不强制委派 |
| 🔄 **五锚约束** | 每轮自检，防止跑题和低效循环 |
| 🤝 **交叉评审** | 高风险任务多专家独立评审 |
| 💾 **经验沉淀** | 教训自动保存，下次注入 |
| 💬 **专家间总线** | 文件消息总线(bus.py)：专家直接收发，零协调官中转，支持 P2P |
| 📋 **任务调度器** | 文件系统任务看板(taskboard.py)：pending/ready/running/done/failed 状态机 + 依赖DAG + 重试 + 崩溃恢复 — 真实调度，不止对话协调 |
| 🚦 **质量门禁** | 高风险任务五段式流水线：需求澄清→实现→验证→审查→集成。独立专家评审，最多回炉 2 轮 |
| ⚡ **故障恢复** | 超时自动重试，连续失败换方案 |
| 📉 **渐进式披露** | 方法论按需注入，token 减少 28% |
| 🌐 **中英双语** | 完整中英文文档 |

---

## 📦 安装

### 方式 A：npm 一键安装（推荐）🚀

本包已发布到 npm：[`dsh-expert-mode`](https://www.npmjs.com/package/dsh-expert-mode)。可用 DSH 插件管理器或 npm 直接安装：

```bash
# 在 DSH 工作区 — 通过插件管理器
dsh plugin add dsh-expert-mode

# ...或直接安装 npm 包
npm install dsh-expert-mode
```

> ℹ️ **agent-preset 型插件说明**：本插件是 **agent-preset 型插件**，不是 Cordis 服务插件。安装 npm 包只是把所有文件拉进 `node_modules`——预设要**激活**还需要把文件挂载进 DSH 的预设发现目录。下方"方式 B"一步搞定。

### 方式 B：一键挂载预设（推荐激活方式）

安装 npm 包后，把预设挂载到 DSH 的预设发现目录：

```bash
# 1. 找到 npm 包的安装位置
#    （通常在 DSH 工作区的 ./node_modules/dsh-expert-mode，或全局安装位置）

# 2. 把预设挂载到 DSH 的 agent-presets 目录
mkdir -p ~/.dsh/.agent-presets/expert-mode
cp -r node_modules/dsh-expert-mode/agent.cordis.yml \
      node_modules/dsh-expert-mode/preset.yml \
      node_modules/dsh-expert-mode/cordis.patch.yml \
      ~/.dsh/.agent-presets/expert-mode/
# 如需完整方法论文档（methods/、experts/、comm/ 消息总线、taskboard），拷贝整个目录：
# cp -r node_modules/dsh-expert-mode/.expert-mode ~/.dsh/.agent-presets/expert-mode/

# 3. 重启 DSH web，然后在预设选择器中选择「专家模式」
dsh web
```

> **说明**：`~/.dsh/.agent-presets/` 是 DSH 的预设发现目录，每个子目录对应一个预设；预设名称取自 `preset.yml` 的 `name` 字段。

### 方式 C：从 GitHub 手动安装

克隆仓库，然后将预设拷贝到 DSH 的 agent-presets 目录：

```bash
# 1. 克隆到任意位置
git clone https://github.com/Asher-2000/dsh-expert-mode.git
cd dsh-expert-mode

# 2. 将预设拷贝到 DSH 的 agent-presets 目录
mkdir -p ~/.dsh/.agent-presets/expert-mode
cp -r agent.cordis.yml preset.yml cordis.patch.yml ~/.dsh/.agent-presets/expert-mode/
# 如需完整方法论文档（methods/、experts/、comm/ 消息总线），拷贝整个目录：
# cp -r .expert-mode ~/.dsh/.agent-presets/expert-mode/

# 3. 重启 DSH web，然后在预设选择器中选择「专家模式」
dsh web
```

> **说明**：`~/.dsh/.agent-presets/` 是 DSH 的预设发现目录，每个子目录对应一个预设；预设名称取自 `preset.yml` 的 `name` 字段。

然后在工作区预设选择器中选择 **「专家模式」**。

### 可选：跨会话记忆（recommended）

专家模式预设本身**不注册**跨会话记忆服务（它是 HOST-PLANE 插件，注册在预设里会与宿主冲突导致预设挂载失败）。如需启用跨会话记忆，请单独安装 [dsh-memory-connect](https://github.com/Asher-2000/dsh-memory-connect) 到**宿主组合**：

```bash
# 1. 克隆 memory 插件
git clone https://github.com/Asher-2000/dsh-memory-connect.git
cd dsh-memory-connect
npm install github:Asher-2000/dsh-memory-connect#v0.4.0  # 或手动放入 dsh 依赖树

# 2. 在宿主组合注册（以 web profile 为例，编辑 ~/.dsh/profiles/web/cordis.patch.yml 追加）：
# - id: cross-session-memory
#   name: '@deepseek-ai/dsh-memory-connect'
#   config:
#     path: ~/.dsh/memory.db
#     openAt: startup

# 3. 重启 DSH web
dsh web
```

> ⚠️ **重要**：**不要**把 `@deepseek-ai/dsh-memory-connect` 加进本预设的 `agent.cordis.yml`。它是 HOST-PLANE 插件（inject `sessions` + `systemPrompt`），预设内注册会报 `service has been registered at <cross-session-memory>`，导致专家模式挂载失败、UI 回退到默认预设。本预设已内置该说明注释。

---

## 🚀 快速开始

1. 安装插件
2. 选择「专家模式」预设
3. 提出任何问题 — 协调官自动委派给合适的专家

### 示例

```
用户：帮我设计一个用户认证系统

协调官：
  → 识别领域：后端开发 + 安全
  → 委派后端开发：API 设计、JWT 实现
  → 委派安全专家：安全审计、漏洞防护
  → 汇总输出完整方案
```

---

## 🏗️ 架构

```
┌─────────────────────────────────────────────────────────────────┐
│                    专家模式架构                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              首席协调官 (Coordinator)                      │   │
│  │  • 任务分析      • 领域识别                                │   │
│  │  • 专家路由      • 结果汇总                                │   │
│  └──────────────────────────────────────────────────────────┘   │
│                           │                                      │
│           ┌───────────────┼───────────────┐                     │
│           ▼               ▼               ▼                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │  前端开发   │  │  后端开发   │  │  DevOps     │            │
│  │  数据库     │  │  安全专家   │  │  测试       │            │
│  │  架构师     │  │  ...        │  │  ...        │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---


### 💬 专家间通信总线（v0.8.0）

```
┌──────────────────────────────────────────────────────────────┐
│                文件消息总线 (comm/bus.py)                      │
│   .expert-mode/comm/mailboxes/<专家>/*.msg                   │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│   数据分析师 ──send──▶ 前端开发    (直接、异步)                │
│   文案撰写 ──send──▶ 社交运营     (直接、异步)                │
│   协调官 ──broadcast──▶ 全体专家   (全局同步)                 │
│   专家A ──P2P子代理──▶ 专家B       (同步问答)                 │
│                                                              │
│   • 零中转：内容在专家间直接流动，不经协调官上下文              │
│   • 持久化：每条消息落盘为 .msg 文件                          │
│   • 可审计：全量日志 comm/logs/bus.log                        │
│   • 命令：send / read / ack / broadcast / stats              │
└──────────────────────────────────────────────────────────────┘
```

**协作模式**:
| 模式 | 方式 | 适用场景 |
|------|------|----------|
| **A. 接力** | 专家A发结果 → 专家B读取 | 串行协作 |
| **B. 并行** | 各专家发结果给协调官 → read --all | 独立收集 |
| **C. 广播** | 一条消息 → 全部邮箱 | 全局状态变更 |
| **D. 评审** | 互发"同意/部分同意/反对+理由" | 交叉评审 |
| **E. P2P** | 专家创建子代理直接问答 | 同步澄清 |

---

## 📚 文档

| 文档 | 说明 |
|------|------|
| [通信协议](.expert-mode/comm/PROTOCOL.md) | 专家间消息总线协议 v1 |
| [专家方法论](.expert-mode/methods/) | 16 份专家方法论 |
| [经验沉淀](.expert-mode/experts/) | 各专家经验教训 |
| [README.md](README.md) | English documentation |

---

## 🤝 贡献

1. Fork 仓库
2. 创建特性分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

---

## 📄 许可证

MIT 许可证 - 详见 [LICENSE](LICENSE)。

---

## 🙏 致谢

- [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) - 核心框架
- [Cordis](https://github.com/cordiverse/cordis) - 插件系统
- [Awesome DSH Plugin](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin) - 社区收录

