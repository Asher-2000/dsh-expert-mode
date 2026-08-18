# DSH Expert Mode

> One agent preset that turns DSH into a "1 Coordinator + 11 Experts" multi-agent team.

[![dsh-plugin](https://img.shields.io/badge/dsh--plugin-ready-478CBF?logo=deepseek&logoColor=white)](https://github.com/topics/dsh-plugin)
[![Featured in Awesome DSH Plugin](https://img.shields.io/badge/awesome--dsh--plugin-featured-1a56db?logo=deepseek&logoColor=white)](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Stars](https://img.shields.io/github/stars/Asher-2000/dsh-expert-mode)](https://github.com/Asher-2000/dsh-expert-mode)

[中文版](README.zh.md) | **English**

---

## What it does

Install this preset and DSH automatically becomes a "Chief Coordinator" mode:

- Receives task → identifies domain → delegates to the best expert subagent
- Complex tasks can dispatch multiple experts in parallel
- Simple tasks handled directly by the Coordinator — no forced delegation
- Experts stay online after completion for follow-up modifications

No custom prompts to write. No multi-config to maintain. Just install and use.

---

## Demo

![DSH Expert Mode main interface](assets/main-ui.jpg)
*Select the "Expert Mode" preset in DSH workspace to use*

![Expert Mode running: parallel multi-expert subagents](assets/expert-mode-run.jpg)
*5 expert subagents working in parallel, with real-time token usage and timing*

---

## 11 Experts

| Expert | Tool | Domain |
|--------|------|--------|
| 📊 Data Analyst | `expert_data_analyst` | Data cleaning, statistics, visualization |
| ✍️ Copywriter | `expert_copywriter` | Marketing copy, content creation, rewriting |
| ⚖️ Legal Review | `expert_legal_review` | Contract review, legal risk assessment |
| 📋 Product Manager | `expert_product_manager` | Requirements analysis, PRD writing, competitor research |
| 🖥️ Frontend Dev | `expert_frontend_dev` | Web frontend implementation, component development |
| 🎨 UI/UX Design | `expert_uiux_design` | Interface design, interaction patterns, design systems |
| 🏗️ Architect | `expert_architect` | System design, tech selection, architecture review |
| 📱 Social Media | `expert_social_media` | Multi-platform content distribution, account management |
| 🚀 Growth Hacker | `expert_growth` | Growth strategy, conversion funnels, A/B testing |
| 💹 Quant Finance | `expert_quant_finance` | Quantitative models, financial analysis, risk control |
| 💰 Finance | `expert_finance` | Financial analysis, report interpretation, budget planning |

---

## Core Mechanisms

### Five Anchor Constraints

The Coordinator self-checks five anchor points every turn to prevent drift and loops:

| Anchor | Purpose |
|--------|---------|
| **Review** | One-sentence recap of current subtask before each turn |
| **Convergence** | Confirm this step advanced the goal; stop if not |
| **Anti-drift** | 2 turns with no progress → force strategy switch |
| **Collaboration Check** | Before delegation, verify routing is correct |
| **Resource Awareness** | Monitor token usage; auto-simplify if >70% |

### Near-distance Guidance

Each expert has a built-in guidance template. The Coordinator fills in specifics during delegation:

```
── Near-distance Guidance ──
Identity: You are [expert role]
Task: {specific task description}
Input: {input data}
Output format: [this expert's delivery format]
Completion criteria: [what counts as done]
```

Subagents start with clear "who I am, what to do, how to deliver."

### Expert Communication Protocol

When cross-expert collaboration is needed, the Coordinator routes structured messages:

```
[FROM:expert_data_analyst → TO:expert_frontend_dev]
Task: Design frontend data display component based on analysis conclusions
Data: {Expert A's conclusion summary}
```

### Cross Review

High-risk tasks (architecture selection, contract review, financial analysis) trigger multi-expert independent review. The Coordinator synthesizes conclusions.

### Experience Pool

After completing important tasks, experts extract lessons to `.expert-mode/experts/{name}/lessons.md`, automatically injected for similar future tasks.

### Expert Persistence

Experts stay online after task completion. The Coordinator can wake them up for follow-up modifications with full context preserved.

---

## Installation

**Method 1: dsh plugin add (recommended)**

```bash
dsh plugin --profile web add github:Asher-2000/dsh-expert-mode
```

**Method 2: git clone**

```bash
mkdir -p ~/.dsh/.agent-presets
git clone https://github.com/Asher-2000/dsh-expert-mode.git ~/.dsh/.agent-presets/expert-mode
```

**Want English?** The repo includes an `expert-mode-en/` preset:

```bash
cp -r ~/.dsh/.agent-presets/expert-mode/expert-mode-en ~/.dsh/.agent-presets/expert-mode-en
```

**Method 3: Manual download**

Download from [Releases](https://github.com/Asher-2000/dsh-expert-mode/releases) and place `preset.yml` + `agent.cordis.yml` into `~/.dsh/.agent-presets/expert-mode/`.

---

## Usage

After installation, select the Expert Mode preset when creating a new session in DSH Web GUI.

---

## FAQ

**Q: Does Expert Mode consume extra model quota?**
A: Delegating to expert subagents triggers subagent model calls (DSH subagent mechanism), same as the official subagent feature. Simple tasks are handled directly by the Coordinator with no extra calls.

**Q: Can I add my own experts?**
A: Yes. Copy any expert entry in `agent.cordis.yml`, modify the tool name and persona.

**Q: How does it relate to the official standard preset?**
A: Built on top of the official standard preset combination, preserving the full toolset and only adding the expert delegation layer.

---

## File structure

```
.
├── preset.yml          # Preset metadata (name + description)
├── agent.cordis.yml    # Coordinator persona + 11 expert subagent tool definitions
├── expert-mode-en/     # English preset
├── README.md
├── README.zh.md
└── LICENSE
```

---

## Community

- 📢 Featured in **Awesome DSH Plugin**: https://github.com/awesome-dsh-plugin/awesome-dsh-plugin
- 🏷️ GitHub `dsh-plugin` topic: https://github.com/topics/dsh-plugin

## Tags

`dsh` `deepseek-harness` `agent-preset` `expert-mode` `multi-agent` `subagent` `ai-agent` `dsh-plugin`

## License

MIT License — see [LICENSE](LICENSE).
