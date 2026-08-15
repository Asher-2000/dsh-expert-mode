# DSH Expert Mode（专家模式）

> DeepSeek Harness (DSH) 的 agent preset：一位「统筹团长」+ 11 位领域专家子代理，按任务特性自动委派。

An [agent preset](https://github.com/deepseek-ai/deepseek-harness) for **DeepSeek Harness (DSH)**: a "chief coordinator" plus 11 domain-expert subagents with automatic task delegation.

## 这是什么 / What is this

「专家模式」是 DSH 的一个 agent preset。挂载后，你的 agent 会变成一名统筹团长，手下有 11 位领域专家子代理（subagent）。收到任务后，团长先判断任务属于哪个领域，再委派给最合适的专家，最后汇总交付。

## 11 位专家 / The 11 experts

| 专家 Expert | 委派工具 Tool |
|------------|---------------|
| 数据分析师 Data Analyst | `expert_data_analyst` |
| 文案撰写 Copywriter | `expert_copywriter` |
| 合同/法务审查 Legal Review | `expert_legal_review` |
| 产品经理 Product Manager | `expert_product_manager` |
| 前端开发 Frontend Dev | `expert_frontend_dev` |
| UI/UX 设计 UI/UX Design | `expert_uiux_design` |
| 架构师 Architect | `expert_architect` |
| 全社交平台运营 Social Media Ops | `expert_social_media` |
| 增长黑客 Growth Hacker | `expert_growth` |
| 金融/量化 Quant Finance | `expert_quant_finance` |
| 财务 Finance | `expert_finance` |

## 安装 / Install

把本仓库的两个文件放进 DSH 的 agent-presets 目录（`$DSH_HOME/.agent-presets/expert-mode/`）：

```bash
mkdir -p ~/.dsh/.agent-presets
git clone https://github.com/Asher-2000/dsh-expert-mode.git ~/.dsh/.agent-presets/expert-mode
```

然后在 DSH 的 Web GUI 或 headless 会话中选择「专家模式」preset 即可。

## 文件结构 / Files

```
.
├── preset.yml          # preset 元信息（名称 + 描述）
├── agent.cordis.yml    # cordis 组合：团长 persona + 10 位专家子代理工具
├── README.md
└── LICENSE
```

## 工作方式 / How it works

1. 收到任务，先判断它属于哪个（或哪几个）专家的领域。
2. 属于专家领域 → 委派给最合适的专家子代理（复杂任务可并行多个专家），再汇总交付。
3. 简单通用任务（问答、文件操作、闲聊）→ 团长自己直接做，不强行委派。

委派时把任务目标、输入、期望产出说清楚，让专家子代理独立完成；汇总时保留专家的结论和数据依据，不改写。

## Tags / 关键词

`dsh` `deepseek-harness` `agent-preset` `expert-mode` `multi-agent` `subagent` `ai-agent`
