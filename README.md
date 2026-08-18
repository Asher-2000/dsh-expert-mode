# DSH Expert Mode

> DeepSeek Harness (DSH) agent preset: a Chief Coordinator + 11 domain expert subagents that auto-delegate by task type.

[![dsh-plugin](https://img.shields.io/badge/dsh--plugin-ready-478CBF?logo=deepseek&logoColor=white)](https://github.com/topics/dsh-plugin)
[![Featured in Awesome DSH Plugin](https://img.shields.io/badge/awesome--dsh--plugin-featured-1a56db?logo=deepseek&logoColor=white)](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Stars](https://img.shields.io/github/stars/Asher-2000/dsh-expert-mode)](https://github.com/Asher-2000/dsh-expert-mode)

[中文版](README.zh.md) | **English**

---

## What is this

"Expert Mode" is a DSH agent preset. Once mounted, your agent becomes a Chief Coordinator with 11 domain expert subagents. When a task arrives, the Coordinator identifies the domain, delegates to the best expert, and delivers a consolidated result.

## Demo

![DSH Expert Mode main interface](assets/main-ui.jpg)

*Select the "Expert Mode" preset in DSH workspace to use*

![Expert Mode running: parallel multi-expert subagents](assets/expert-mode-run.jpg)

*Tasks auto-delegated to multiple expert subagents in parallel, with real-time token usage and timing*

**Who is this for**
- Users who want one agent covering multiple domains (code + design + finance + legal + operations...)
- Teams that want an out-of-the-box multi-expert workflow without maintaining separate prompts
- Developers interested in DSH subagent mechanisms

---

## 11 Experts

| Expert | Tool | Domain |
|--------|------|--------|
| Data Analyst | `expert_data_analyst` | Data processing, statistics, visualization |
| Copywriter | `expert_copywriter` | Marketing copy, content creation |
| Legal Review | `expert_legal_review` | Contract terms, legal risk |
| Product Manager | `expert_product_manager` | Requirements analysis, product planning |
| Frontend Dev | `expert_frontend_dev` | Web frontend implementation |
| UI/UX Design | `expert_uiux_design` | Interface design, interaction |
| Architect | `expert_architect` | System design, tech selection |
| Social Media | `expert_social_media` | Multi-platform content distribution |
| Growth Hacker | `expert_growth` | Growth strategy, conversion optimization |
| Quant Finance | `expert_quant_finance` | Quantitative models, financial analysis |
| Finance | `expert_finance` | Financial analysis, reporting |

---

## Installation

**Method 0: dsh plugin add (recommended)**

```bash
dsh plugin --profile web add github:Asher-2000/dsh-expert-mode
```

**Method 1: git clone**

```bash
mkdir -p ~/.dsh/.agent-presets
git clone https://github.com/Asher-2000/dsh-expert-mode.git ~/.dsh/.agent-presets/expert-mode
```

**Want English?** The repo includes an `expert-mode-en/` preset (Chief Coordinator + 11 experts, fully English):

```bash
cp -r ~/.dsh/.agent-presets/expert-mode/expert-mode-en ~/.dsh/.agent-presets/expert-mode-en
```

Then select **"Expert Mode"** (English) or **「专家模式」** (Chinese) in the DSH preset selector.

**Method 2: Manual download**

Download from [Releases](https://github.com/Asher-2000/dsh-expert-mode/releases) and place `preset.yml` + `agent.cordis.yml` into `~/.dsh/.agent-presets/expert-mode/`.

---

## Usage

After installation, select the Expert Mode preset when creating a new session in DSH Web GUI; or via CLI:

```bash
dsh --profile headless "Analyze this data and give recommendations" --preset expert-mode
```

---

## How it works

1. Receives a task, identifies which expert domain(s) it belongs to.
2. Domain match → delegates to the best expert subagent (complex tasks can run multiple experts in parallel), then consolidates.
3. Simple general tasks (Q&A, file ops, chat) → Chief Coordinator handles directly, no forced delegation.

Delegation passes clear objectives, inputs, and expected outputs. Consolidation preserves expert conclusions and data evidence without rewriting.

---

## Core mechanisms

### Five Anchor Constraints (v0.3.0)

The Chief Coordinator self-checks five anchor points every turn to prevent drift and inefficient loops:

| Anchor | Timing | Purpose |
|--------|--------|---------|
| **Review** | Before each turn | One-sentence recap of current subtask and previous output |
| **Convergence** | Before each turn ends | Confirm this step advanced the overall goal; if not, stop immediately |
| **Anti-drift** | After 2 turns with no progress | Force strategy switch: change expert, split subtask, or ask user |
| **Collaboration Check** | Before delegation | Check if cross-expert collaboration is needed and routing is correct |
| **Resource Awareness** | Throughout | Monitor context token usage; proactively simplify if >70% |

### Near-distance Guidance (v0.3.0)

Each expert subagent persona includes a built-in guidance template. The Coordinator fills in specifics during delegation:

```
── Near-distance Guidance ──
Identity: You are [expert role]
Task: {specific task description}
Input: {input data}
Output format: [this expert's delivery format]
Completion criteria: [what counts as done]
```

This lets subagents start with clear "who I am, what to do, how to deliver" — significantly improving routing accuracy and output quality.

### Expert Persistence (v0.3.0)

Experts stay online after task completion. The Coordinator can wake them up for follow-up modifications with full context preserved.

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

---

## File structure

```
.
├── preset.yml          # Preset metadata (name + description)
├── agent.cordis.yml    # Cordis composition: Coordinator persona + 11 expert subagent tools
├── README.md
├── README.zh.md
└── LICENSE
```

---

## FAQ

**Q: Does Expert Mode consume extra model quota?**
A: Delegating to expert subagents triggers subagent model calls (DSH subagent mechanism), same as the official subagent feature. Simple tasks are handled directly by the Coordinator with no extra calls.

**Q: Can I add my own experts?**
A: Yes. Copy any expert entry in `agent.cordis.yml`, modify the tool name and persona.

**Q: How does it relate to the official standard preset?**
A: Built on top of the official standard preset combination, preserving the full toolset and only adding the expert delegation layer.

---

## Community

- 📢 Featured in **Awesome DSH Plugin**: https://github.com/awesome-dsh-plugin/awesome-dsh-plugin
- 🏷️ GitHub `dsh-plugin` topic: https://github.com/topics/dsh-plugin

## Tags

`dsh` `deepseek-harness` `agent-preset` `expert-mode` `multi-agent` `subagent` `ai-agent` `dsh-plugin`

## License

MIT License — see [LICENSE](LICENSE).
