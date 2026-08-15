# DSH Expert Mode（专家模式）

> DeepSeek Harness (DSH) 的 agent preset：一位「统筹团长」+ 11 位领域专家子代理，按任务特性自动委派。

[![dsh-plugin](https://img.shields.io/badge/dsh--plugin-ready-478CBF?logo=deepseek&logoColor=white)](https://github.com/topics/dsh-plugin)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Stars](https://img.shields.io/github/stars/Asher-2000/dsh-expert-mode)](https://github.com/Asher-2000/dsh-expert-mode)

## 这是什么

「专家模式」是 DSH 的一个 agent preset。挂载后，你的 agent 会变成一名统筹团长，手下有 11 位领域专家子代理（subagent）。收到任务后，团长先判断任务属于哪个领域，再委派给最合适的专家，最后汇总交付。

**适合谁**
- 想让一个 agent 覆盖多个专业领域（代码 + 设计 + 财务 + 法务 + 运营…）的用户
- 不想自己维护多套 prompt/工具组合，想要"开箱即用"多专家工作流的团队
- 对 DSH 子代理（subagent）机制感兴趣的开发者

## 11 位专家

| 专家 | 委派工具 | 擅长领域 |
|------|---------|---------|
| 数据分析师 | `expert_data_analyst` | 数据处理、统计、可视化 |
| 文案撰写 | `expert_copywriter` | 营销文案、内容创作 |
| 合同/法务审查 | `expert_legal_review` | 合同条款、法律风险 |
| 产品经理 | `expert_product_manager` | 需求分析、产品规划 |
| 前端开发 | `expert_frontend_dev` | Web 前端实现 |
| UI/UX 设计 | `expert_uiux_design` | 界面设计、交互 |
| 架构师 | `expert_architect` | 系统设计、技术选型 |
| 全社交平台运营 | `expert_social_media` | 多平台内容分发 |
| 增长黑客 | `expert_growth` | 增长策略、转化优化 |
| 金融/量化 | `expert_quant_finance` | 量化模型、金融分析 |
| 财务 | `expert_finance` | 财务分析、报表 |

## 安装

**方式一：git clone（推荐）**

```bash
mkdir -p ~/.dsh/.agent-presets
git clone https://github.com/Asher-2000/dsh-expert-mode.git ~/.dsh/.agent-presets/expert-mode
```

**方式二：手动下载**

从 [Releases](https://github.com/Asher-2000/dsh-expert-mode/releases) 下载最新版，把 `preset.yml` + `agent.cordis.yml` 放到 `~/.dsh/.agent-presets/expert-mode/`。

## 使用

安装后，在 DSH 的 **Web GUI 新建会话**时选择「专家模式」preset；或命令行指定：

```bash
dsh --profile headless "帮我分析这份数据并给出建议" --preset expert-mode
```

> 提示：preset 选择入口在会话创建界面的 Agent preset 下拉框。具体参数名以你安装的 DSH 版本为准。

## 工作方式

1. 收到任务，先判断它属于哪个（或哪几个）专家的领域。
2. 属于专家领域 → 委派给最合适的专家子代理（复杂任务可并行多个专家），再汇总交付。
3. 简单通用任务（问答、文件操作、闲聊）→ 团长自己直接做，不强行委派。

委派时把任务目标、输入、期望产出说清楚，让专家子代理独立完成；汇总时保留专家的结论和数据依据，不改写。

## 文件结构

```
.
├── preset.yml          # preset 元信息（名称 + 描述）
├── agent.cordis.yml    # cordis 组合：团长 persona + 11 位专家子代理工具
├── README.md
├── README.zh.md
└── LICENSE
```

## 常见问题

**Q: 专家模式会额外消耗模型额度吗？**
A: 委派给专家子代理时会产生子代理的模型调用（DSH 子代理机制），与官方子代理功能一致；简单任务团长直接回答，不产生额外调用。

**Q: 可以自己加专家吗？**
A: 可以。复制 `agent.cordis.yml` 中任意 expert 条目，修改工具名与 persona 即可。

**Q: 与官方 standard preset 的关系？**
A: 基于官方 standard preset 组合改造，保留完整工具集，仅增加专家委派层。

## Tags / 关键词

`dsh` `deepseek-harness` `agent-preset` `expert-mode` `multi-agent` `subagent` `ai-agent` `dsh-plugin`

## License

MIT License — see [LICENSE](LICENSE).
