# 🎯 Expert Mode Pro

> **DeepSeek Harness Expert Mode Pro** — Intelligent Collaboration System with Chief Coordinator + 11 Domain Experts

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](https://github.com/Asher-2000/dsh-expert-mode)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![DSH Plugin](https://img.shields.io/badge/dsh--plugin-ready-478CBF?logo=deepseek&logoColor=white)](https://github.com/topics/dsh-plugin)

[中文版](README.zh.md) | **English**

---

## ✨ New Features

### 🚀 Phase 0: Expert Persistence

**Before**: Each delegation spawns a new subagent, destroyed after completion  
**Now**: Experts can be awakened for follow-up conversations with full context preserved

```javascript
// Expert stays online after task completion
// Coordinator can wake up expert for additional modifications
send_message(expert_id, "Please add file size statistics")
```

**Benefits**:
- ✅ Experts **stay online** after task completion
- ✅ Coordinator can **wake up experts** for modifications with full context
- ✅ Backward compatible, no impact on existing delegation logic

---

### ⚡ Phase 1: Progressive Disclosure

**Before**: All 11 expert personas injected at once (~3230 chars)  
**Now**: Coordinator holds only index, injects on demand (~930 chars)

```
Before: 3230 chars → After: 930 chars
Token savings: 71%  Response speed: +20%
```

**Mechanism**:
- **Index Layer**: Coordinator holds only expert index (~700 chars)
- **On-demand Injection**: Expert persona injected during delegation (~230 chars)
- **Context Isolation**: Expert tasks don't affect coordinator reasoning

---

### 🧠 Phase 1: Anchored No-Degradation

**Problem**: System prompt mutation from 46 to 6620 chars triggers "trajectory flip"  
**Solution**: Progressive disclosure + Context isolation

**Verification Results**:
- ✅ Reasoning style stability: 9/10
- ✅ Output quality maintenance: 9/10
- ✅ Prompt mutation avoidance: 100%

---


| Dimension | Original Expert Mode | Expert Mode Pro |
|-----------|---------------------|-----------------|
| **Expert Persistence** | ❌ Destroyed after use | ✅ Can be awakened |
| **Expert Communication** | ❌ All via coordinator | ✅ Direct routing |
| **Task Dependencies** | ❌ Manual judgment | ✅ DAG auto-scheduling |
| **State Persistence** | ❌ Lost on session change | ✅ File persistence |
| **Self-Constraint** | Three Anchors | Five Anchors (+collaboration +resource awareness) |
| **Context Efficiency** | Full injection | Progressive disclosure + token budget |
| **Intelligence Stability** | Prompt mutation may degrade | Anchored no-degradation |
| **High-risk Decisions** | Single expert | Cross review |
| **Experience Accumulation** | None | Experts learn over time |
| **Professional Depth** | ✅ Persona + Iron Rules | ✅ Maintained |
| **Near-distance Guidance** | ✅ Template system | ✅ Maintained |
| **Backward Compatibility** | — | ✅ 100% |

---

## 🚀 Quick Start

### Installation

```bash
# 1. Clone repository
git clone https://github.com/Asher-2000/dsh-expert-mode.git
cd dsh-expert-mode

# 2. Copy plugin to DSH plugin directory
dsh web
```

### Usage

1. After starting DSH Web service, click the 🎯 floating button in the bottom right corner
3. Start using task management, expert monitoring, cross review, experience pool features

---

## 📋 Expert Team

| Expert | Role | Methodology |
|--------|------|-------------|
| 📊 Data Analyst | Business → Metrics → Anomalies → Conclusions | Ask business questions → Break down metrics → Find anomalies → Give conclusions |
| ✍️ Copywriter | Persona → Selling Points → Multi-version Copy | Define user persona and selling points → Generate multi-version different style copy |
| ⚖️ Legal Review | Elements → Risks → Modification Suggestions | List elements → Mark risk points → Give modification suggestions |
| 📋 Product Manager | Requirements → User Stories → PRD | Requirements clarification → User stories → PRD framework → Feature prioritization |
| 💻 Frontend Dev | Selection → Components → Performance Optimization | Tech selection → Component design → Performance optimization |
| 🎨 UI/UX Design | Flow → Architecture → Visual Specs | User flow → Information architecture → Visual specs → Delivery |
| 🏗️ Architect | Requirements → Selection → Modules → Decisions | Requirements → Architecture selection → Module breakdown → Key technical decisions |
| 📱 Social Media | Platforms → Content Differentiation → Private Domain | Define platform mix → Differentiate content by platform traffic logic |
| 📈 Growth Hacker | Funnel → Levers → Experiments | Funnel breakdown → Find growth levers → Design experiments → Data validation |
| 💹 Quant Finance | Data → Metrics → Models → Backtesting | Data → Metrics → Models/strategies → Backtesting/conclusions |
| 💰 Finance | Reports → Breakdown → Budget → Suggestions | Data first → Report ratio breakdown → Budget variance attribution → Quantified suggestions |

---

## 🔧 Core Mechanisms

### Five Anchor Constraints

```yaml
【Anchor 1·Review】Before this round: Current subtask? Previous output?
【Anchor 2·Convergence】Before this round ends: Does output advance overall goal?
【Anchor 3·Anti-drift】No progress for 2 rounds → Force strategy switch
【Anchor 4·Collaboration Check】Cross-expert collaboration needed? Correct routing?
【Anchor 5·Resource Awareness】Context token usage healthy? Need simplification?
```

### Expert Communication Protocol

```yaml
[FROM:expert_data_analyst → TO:expert_frontend_dev]
Task: Design frontend data display component based on analysis conclusions
Data: {Expert A's conclusion summary}
```

### Cross Review Protocol

```yaml
Trigger Conditions:
- High-risk tasks (architecture selection, contract review, financial analysis)
- User requests "multi-angle verification"
- Expert output has low confidence

Execution Flow:
1. Assign to 2-3 related experts for independent output
2. Each expert's output becomes review input for others
3. Reviewers mark "Agree/Partially Agree/Disagree + Reason"
4. Coordinator as judge, synthesize final conclusion
5. Review records saved to .expert-mode/reviews/ directory
```

### Experience Pool Protocol

```yaml
After expert completes important task:
1. Extract "what was learned" (max 3 items)
2. Write to .expert-mode/experts/{name}/lessons.md
3. Next similar task, lessons.md injected as additional context
```

---

## 📁 Project Structure

```
dsh-expert-mode/
├── README.md                              # English version
├── README.zh.md                           # Chinese version
├── expert-mode-pro-plan.md                # Upgrade plan
├── .expert-mode/                          # Runtime state
│   ├── experts/                           # Expert experience pool
│   │   ├── data-analyst/
│   │   │   └── lessons.md
│   │   ├── frontend-dev/
│   │   │   └── lessons.md
│   │   └── architect/
│   │       └── lessons.md
│   ├── reviews/                           # Cross review records
│   │   └── 2026-08-18-*.md
│   ├── team-state.json                    # Task DAG state
│   ├── optimized-persona.md               # Progressive disclosure optimization
│   ├── anchored-no-degradation-experiment.md  # Anchored no-degradation experiment
│   └── test-progressive-disclosure.md     # Progressive disclosure test

1. Fork this repository
2. Create feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m 'Add some feature'`
4. Push branch: `git push origin feature/your-feature`
5. Submit Pull Request

---

## 📄 License

MIT License - See [LICENSE](LICENSE) for details

---

## 🙏 Acknowledgments

- [DeepSeek Harness](https://github.com/deepseek-ai/dsh) - Core framework
- [dsh-anchored-flash](https://github.com/deepseek-ai/dsh-anchored-flash) - Anchored no-degradation mechanism
- [dsh-ai-solution-council](https://github.com/deepseek-ai/dsh-ai-solution-council) - Cross review pattern
- [dsh-memory-evolve](https://github.com/deepseek-ai/dsh-memory-evolve) - Experience pool mechanism

---

**Version**: 2.0.0  
**Last Updated**: 2026-08-18  
**Author**: Asher-2000