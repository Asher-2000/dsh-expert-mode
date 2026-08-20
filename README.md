# 🧠 DSH Expert Mode

<p align="center">
  <strong>1 Coordinator + 16 Experts — Full-Stack Multi-Agent Team</strong><br/>
  <em>首席协调官 + 16 位领域专家 — 全栈多智能体团队</em>
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

## 🧩 16 Experts

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
| ⚡ **Fault Recovery** | Auto-retry on timeout, strategy switch on failure |
| 📉 **Progressive Disclosure** | Methodology injected on-demand, 28% token savings |
| 🌐 **Bilingual** | Complete EN/ZH documentation |

---

## 📦 Installation

```bash
# In DSH workspace
dsh plugin add @deepseek-ai/dsh-expert-mode
```

Then select **"专家模式"** in the workspace preset selector.

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

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [User Guide](docs/user-guide.md) | Installation and usage |
| [Expert Methods](.expert-mode/experts/) | Detailed methodology for each expert |
| [Architecture](docs/architecture.md) | System design details |
| [Changelog](CHANGELOG.md) | Version history |

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
