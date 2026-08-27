# 🧠 DSH Expert Mode

<p align="center">
  <strong>1 Coordinator + 17 Experts — Full-Stack Multi-Agent Team</strong><br/>
  <em>首席协调官 + 17 位领域专家 — 全栈多智能体团队</em>
</p>

<p align="center">
  <a href="https://github.com/topics/dsh-plugin"><img src="https://img.shields.io/badge/dsh--plugin-ready-478CBF?logo=deepseek&logoColor=white" alt="dsh-plugin"></a>
  <a href="https://github.com/awesome-dsh-plugin/awesome-dsh-plugin"><img src="https://img.shields.io/badge/awesome--dsh--plugin-featured-1a56db?logo=deepseek&logoColor=white" alt="Featured in Awesome DSH Plugin"></a>
  <a href="https://github.com/Asher-2000/dsh-expert-mode/releases"><img src="https://img.shields.io/github/v/release/Asher-2000/dsh-expert-mode?label=release" alt="Release"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License: MIT"></a>
  <a href="https://github.com/Asher-2000/dsh-expert-mode"><img src="https://img.shields.io/github/stars/Asher-2000/dsh-expert-mode" alt="Stars"></a>
</p>

<p align="center">
  <a href="README.zh.md">中文</a> · <a href="README.md">English</a>
</p>

---

## ✨ What it does

Install this preset and DSH automatically becomes a "Chief Coordinator" mode:

| Scenario | Behavior |
|----------|----------|
| Receives task | Identifies domain → delegates to the best expert |
| Complex tasks | Dispatches multiple experts in parallel |
| Simple tasks | Coordinator handles directly — no forced delegation |
| Task complete | Experts stay online for follow-up modifications |

No custom prompts to write. No multi-config to maintain. **Just install and use.**

---

## 🖼️ Demo

<p align="center">
  <img src="assets/main-ui.jpg" alt="DSH Expert Mode main interface" width="500" /><br/>
  <em>Select the "Expert Mode" preset in DSH workspace to use</em>
</p>

<p align="center">
  <img src="assets/expert-mode-run.jpg" alt="Expert Mode running" width="500" /><br/>
  <em>5 expert subagents working in parallel, with real-time token usage and timing</em>
</p>

---

## 🧩 17 Experts

### 🎯 Full-Stack Core (6)

| Expert | Tool | Domain |
|--------|------|--------|
| 🖥️ Frontend Dev | `expert_frontend_dev` | Web frontend, React/Vue, CSS/UI |
| 🖥️ Backend Dev | `expert_backend_dev` | API, server logic, authentication |
| 🗄️ Database | `expert_database` | Schema design, SQL, optimization |
| 🏗️ Architect | `expert_architect` | System design, tech selection |
| 🛠️ DevOps | `expert_devops` | CI/CD, Docker, K8s, deployment |
| 🧪 QA Engineer | `expert_qa_engineer` | Testing strategy, automation |

### 🔒 Security & Data (3)

| Expert | Tool | Domain |
|--------|------|--------|
| 🔒 Security | `expert_security` | Code audit, vulnerabilities, hardening |
| 📊 Data Analyst | `expert_data_analyst` | Statistics, visualization, insights |
| 🎨 UI/UX Design | `expert_uiux_design` | Interface design, design systems |

### 💼 Business (7)

| Expert | Tool | Domain |
|--------|------|--------|
| 📋 Product Manager | `expert_product_manager` | PRD, requirements, competitor research |
| ✍️ Copywriter | `expert_copywriter` | Marketing copy, content creation |
| 🎬 Media Creator | `expert_media_creator` | Storyboard, AI image, AI video, final cut |
| ⚖️ Legal Review | `expert_legal_review` | Contract review, legal risk |
| 📱 Social Media | `expert_social_media` | Multi-platform distribution |
| 🚀 Growth Hacker | `expert_growth` | Growth strategy, A/B testing |
| 💹 Quant Finance | `expert_quant_finance` | Quantitative models, risk |
| 💰 Finance | `expert_finance` | Financial analysis, budget |

---

## 🛡️ Features

| Feature | Description |
|---------|-------------|
| 🎯 **Smart Delegation** | Auto-identifies task domain and routes to the best expert |
| 🚀 **Fast Track** | Simple tasks handled directly — no forced delegation |
| 🔄 **Five-Anchor Constraint** | Prevents topic drift with per-turn self-check |
| 🤝 **Cross Review** | High-risk tasks get multi-expert independent review |
| 💾 **Experience Pool** | Lessons learned are saved and injected next time |
| 💬 **Inter-Expert Bus** | File-based message bus (bus.py): experts send/read directly, zero coordinator relay, P2P capable |
| 📋 **Taskboard** | File-system task scheduler (taskboard.py): pending/ready/running/done/failed state machine, dependency DAG, retry, crash recovery — real scheduling, not just chat coordination |
| 🚦 **Quality Gates** | 5-stage pipeline for high-risk tasks: requirement clarity → implementation → verification → review → integration. Independent-expert review with 2-round rework limit |
| ⚡ **Fault Recovery** | Auto-retry on timeout, strategy switch on failure |
| 📉 **Progressive Disclosure** | Methodology injected on-demand, 28% token savings |
| 🌐 **Bilingual** | Complete EN/ZH documentation |

---

## 📦 Installation

### Option A: npm one-click (recommended) 🚀

The package is published on npm as [`dsh-expert-mode`](https://www.npmjs.com/package/dsh-expert-mode). You can install it with the DSH plugin manager or npm directly:

```bash
# In DSH workspace — via plugin manager
dsh plugin add dsh-expert-mode

# ...or install the npm package directly
npm install dsh-expert-mode
```

> ℹ️ **How agent-presets work**: this is an **agent-preset plugin**, not a Cordis service plugin. Installing the npm package pulls all files into your `node_modules` — but the preset only **activates** once its files are mounted into DSH's preset discovery directory. The preset ships a copy step (below) that makes this one command.

### Option B: One-command preset mount (recommended for activation)

After installing the npm package, mount the preset into DSH's preset discovery directory:

```bash
# 1. Find where npm put the package
#    (usually ./node_modules/dsh-expert-mode in your DSH workspace, or globally)

# 2. Mount the preset into DSH's agent-presets directory
mkdir -p ~/.dsh/.agent-presets/expert-mode
cp -r node_modules/dsh-expert-mode/agent.cordis.yml \
      node_modules/dsh-expert-mode/preset.yml \
      node_modules/dsh-expert-mode/cordis.patch.yml \
      ~/.dsh/.agent-presets/expert-mode/
# If you want the full methodology docs (methods/, experts/, comm/ bus, taskboard):
# cp -r node_modules/dsh-expert-mode/.expert-mode ~/.dsh/.agent-presets/expert-mode/

# 3. Restart DSH web, then select "专家模式" in the workspace preset selector
dsh web
```

> **Note**: `~/.dsh/.agent-presets/` is DSH's preset discovery directory. Each subdirectory = one preset. The preset name comes from `preset.yml`'s `name` field.

### Option C: Manual install from GitHub

Clone the repository, then copy the preset into DSH's agent-presets directory:

```bash
# 1. Clone anywhere
git clone https://github.com/Asher-2000/dsh-expert-mode.git
cd dsh-expert-mode

# 2. Copy the preset into DSH's agent-presets directory
mkdir -p ~/.dsh/.agent-presets/expert-mode
cp -r agent.cordis.yml preset.yml cordis.patch.yml ~/.dsh/.agent-presets/expert-mode/
# If you want the full methodology docs (methods/, experts/, comm/ bus), copy the whole tree:
# cp -r .expert-mode ~/.dsh/.agent-presets/expert-mode/

# 3. Restart DSH web, then select "专家模式" in the workspace preset selector
dsh web
```

> **Note**: `~/.dsh/.agent-presets/` is DSH's preset discovery directory. Each subdirectory = one preset. The preset name comes from `preset.yml`'s `name` field.

Then select **"专家模式"** in the workspace preset selector.

### Optional: Cross-session memory (recommended)

The expert-mode preset itself does **not** register the cross-session memory service — it is a HOST-PLANE plugin, and registering it inside a preset conflicts with the host composition (causing preset mount failure). To enable cross-session memory, install [dsh-memory-connect](https://github.com/Asher-2000/dsh-memory-connect) separately into the **host composition**:

```bash
# 1. Clone the memory plugin
git clone https://github.com/Asher-2000/dsh-memory-connect.git
cd dsh-memory-connect
npm install github:Asher-2000/dsh-memory-connect#v0.4.0  # or place it into the dsh dependency tree manually

# 2. Register it in the host composition (e.g. append to ~/.dsh/profiles/web/cordis.patch.yml):
# - id: cross-session-memory
#   name: '@deepseek-ai/dsh-memory-connect'
#   config:
#     path: ~/.dsh/memory.db
#     openAt: startup

# 3. Restart DSH web
dsh web
```

> ⚠️ **Important**: **Do NOT** add `@deepseek-ai/dsh-memory-connect` into this preset's `agent.cordis.yml`. It is a HOST-PLANE plugin (injects `sessions` + `systemPrompt`); registering it inside the preset throws `service has been registered at <cross-session-memory>`, which makes the expert-mode preset fail to mount and the UI fall back to the default preset. This preset ships with an explanatory comment about it.

---

## 🚀 Quick Start

1. Install the plugin
2. Select "专家模式" preset
3. Ask any question — the coordinator auto-delegates to the right expert

### Example

```
User: 帮我设计一个用户认证系统

Coordinator:
  → 识别领域: 后端开发 + 安全
  → 委派 Backend Dev: API 设计、JWT 实现
  → 委派 Security: 安全审计、漏洞防护
  → 汇总输出完整方案
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Expert Mode Architecture                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Chief Coordinator (协调官)                    │   │
│  │  • Task analysis    • Domain identification               │   │
│  │  • Expert routing   • Result aggregation                  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                           │                                      │
│           ┌───────────────┼───────────────┐                     │
│           ▼               ▼               ▼                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │  Frontend   │  │  Backend    │  │  DevOps     │            │
│  │  Database   │  │  Security   │  │  QA         │            │
│  │  Architect  │  │  ...        │  │  ...        │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---


### 💬 Inter-Expert Communication Bus (v0.8.0)

```
┌──────────────────────────────────────────────────────────────┐
│                 File Message Bus (comm/bus.py)                │
│   .expert-mode/comm/mailboxes/<expert>/*.msg                 │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│   data-analyst ──send──▶ frontend-dev   (direct, async)      │
│   copywriter   ──send──▶ social-media  (direct, async)       │
│   coordinator  ──broadcast──▶ all experts (global sync)      │
│   expert A     ──P2P subagent──▶ expert B  (synchronous)     │
│                                                              │
│   • Zero relay: content flows between experts, NOT through   │
│     coordinator context                                     │
│   • Durable: every message persisted as .msg file            │
│   • Auditable: full log at comm/logs/bus.log                 │
│   • Commands: send / read / ack / broadcast / stats          │
└──────────────────────────────────────────────────────────────┘
```

**Communication Modes**:
| Mode | How | Use case |
|------|-----|----------|
| **A. Relay** | Expert A sends result → Expert B reads | Sequential collaboration |
| **B. Parallel** | Experts send results to coordinator → read --all | Independent collection |
| **C. Broadcast** | One message → all mailboxes | Global state changes |
| **D. Review** | Experts send "agree/partial/disagree + reason" | Cross review |
| **E. P2P** | Expert spawns subagent for direct Q&A | Synchronous clarification |

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [Communication Protocol](.expert-mode/comm/PROTOCOL.md) | Inter-expert message bus protocol v1 |
| [Expert Methods](.expert-mode/methods/) | 16 expert methodology docs |
| [Experience Pool](.expert-mode/experts/) | Lessons learned per expert |
| [README.zh.md](README.zh.md) | 中文文档 |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgments

- [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) - The core framework
- [Cordis](https://github.com/cordiverse/cordis) - Plugin system
- [Awesome DSH Plugin](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin) - Community listing

