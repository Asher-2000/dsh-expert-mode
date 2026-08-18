# DSH Expert Mode（专家模式）

> DeepSeek Harness (DSH) 的 agent preset：一位「首席协调官」+ 11 位领域专家子代理，按任务特性自动委派。

[![dsh-plugin](https://img.shields.io/badge/dsh--plugin-ready-478CBF?logo=deepseek&logoColor=white)](https://github.com/topics/dsh-plugin)
[![Featured in Awesome DSH Plugin](https://img.shields.io/badge/awesome--dsh--plugin-featured-1a56db?logo=deepseek&logoColor=white)](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Stars](https://img.shields.io/github/stars/Asher-2000/dsh-expert-mode)](https://github.com/Asher-2000/dsh-expert-mode)

**中文** | [English](README.md)

---

## 这是什么

「专家模式」是 DSH 的一个 agent preset。挂载后，你的 agent 会变成一名首席协调官，手下有 11 位领域专家子代理（subagent）。收到任务后，首席协调官先判断任务属于哪个领域，再委派给最合适的专家，最后汇总交付。

## 运行效果

![DSH Expert Mode 主界面](assets/main-ui.jpg)

*DSH 工作区中选择「专家模式」preset 即可使用*

![专家模式运行实况：多专家子代理并行](assets/expert-mode-run.jpg)

*任务自动委派给多位领域专家子代理并行执行，实时展示 token 消耗与耗时*

**适合谁**
- 想让一个 agent 覆盖多个专业领域（代码 + 设计 + 财务 + 法务 + 运营…）的用户
- 不想自己维护多套 prompt/工具组合，想要"开箱即用"多专家工作流的团队
- 对 DSH 子代理（subagent）机制感兴趣的开发者

---

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

---

## 安装

**方式零：dsh plugin add（推荐）**

```bash
dsh plugin --profile web add github:Asher-2000/dsh-expert-mode
```

**方式一：git clone**

```bash
mkdir -p ~/.dsh/.agent-presets
git clone https://github.com/Asher-2000/dsh-expert-mode.git ~/.dsh/.agent-presets/expert-mode
```

**想要英文版？** 仓库内置 `expert-mode-en/` preset（首席协调官 Chief Coordinator + 11 位专家，全英文）。克隆后复制到 presets 目录即可：

```bash
cp -r ~/.dsh/.agent-presets/expert-mode/expert-mode-en ~/.dsh/.agent-presets/expert-mode-en
```

然后在 DSH preset 选择器里选 **"Expert Mode"**（英文）或 **「专家模式」**（中文）。

**方式二：手动下载**

从 [Releases](https://github.com/Asher-2000/dsh-expert-mode/releases) 下载最新版，把 `preset.yml` + `agent.cordis.yml` 放到 `~/.dsh/.agent-presets/expert-mode/`。

---

## 使用

安装后，在 DSH 的 **Web GUI 新建会话**时选择「专家模式」preset；或命令行指定：

```bash
dsh --profile headless "帮我分析这份数据并给出建议" --preset expert-mode
```

> 提示：preset 选择入口在会话创建界面的 Agent preset 下拉框。具体参数名以你安装的 DSH 版本为准。

---

## 工作方式

1. 收到任务，先判断它属于哪个（或哪几个）专家的领域。
2. 属于专家领域 → 委派给最合适的专家子代理（复杂任务可并行多个专家），再汇总交付。
3. 简单通用任务（问答、文件操作、闲聊）→ 首席协调官自己直接做，不强行委派。

委派时把任务目标、输入、期望产出说清楚，让专家子代理独立完成；汇总时保留专家的结论和数据依据，不改写。

---

## 核心机制

### 五锚约束（v0.3.0）

首席协调官每轮对话强制自检五个锚点，防止跑题和低效循环：

| 锚点 | 时机 | 作用 |
|------|------|------|
| **回顾** | 每轮开始前 | 一句话回顾当前子任务和上一步产出 |
| **收敛** | 每轮结束前 | 确认这一步是否推进了总体目标，没有则立即止损 |
| **反跑题** | 连续 2 轮无进展时 | 强制切换策略：换专家、拆子任务、或直接问用户 |
| **协作检查** | 委派前 | 判断是否需要跨专家协作，路由是否正确 |
| **资源感知** | 全程 | 监控上下文 token 占用，超 70% 时主动精简 |

### 近距离引导（v0.3.0）

每个专家子代理的 persona 内置引导模板，协调官委派时填入具体值：

```
── 近距离引导 ──
身份：你是 [专家角色]
任务：{具体任务描述}
输入：{输入数据}
输出格式：[该专家的交付格式]
完成标准：[怎样算完成]
```

这让子代理一启动就明确知道"我是谁、要做什么、怎么交付"，路由准确率和输出质量显著提升。

### 专家持久化（v0.3.0）

专家完成任务后不销毁，保持在线。协调官可以唤醒专家追加修改，上下文完整保留。

### 专家间通信协议

当任务需要跨专家协作时，协调官通过结构化消息路由：

```
[FROM:expert_data_analyst → TO:expert_frontend_dev]
任务：基于分析结论设计前端数据展示组件
数据：{专家 A 的结论摘要}
```

### 交叉评审

高风险任务（架构选型、合同审查、财务分析）自动触发多专家独立评审，协调官综合结论。

### 经验沉淀

专家完成重要任务后，提取经验写入 `.expert-mode/experts/{name}/lessons.md`，下次同类任务自动注入。

---

## 文件结构

```
.
├── preset.yml          # preset 元信息（名称 + 描述）
├── agent.cordis.yml    # cordis 组合：首席协调官 persona + 11 位专家子代理工具
├── README.md
├── README.zh.md
└── LICENSE
```

---

## 常见问题

**Q: 专家模式会额外消耗模型额度吗？**
A: 委派给专家子代理时会产生子代理的模型调用（DSH 子代理机制），与官方子代理功能一致；简单任务首席协调官直接回答，不产生额外调用。

**Q: 可以自己加专家吗？**
A: 可以。复制 `agent.cordis.yml` 中任意 expert 条目，修改工具名与 persona 即可。

**Q: 与官方 standard preset 的关系？**
A: 基于官方 standard preset 组合改造，保留完整工具集，仅增加专家委派层。

---

## 社区收录

- 📢 入选 **Awesome DSH Plugin 精选列表**（DeepSeek Harness 插件精选仓库）：https://github.com/awesome-dsh-plugin/awesome-dsh-plugin
- 🏷️ GitHub `dsh-plugin` topic 收录：https://github.com/topics/dsh-plugin

## Tags / 关键词

`dsh` `deepseek-harness` `agent-preset` `expert-mode` `multi-agent` `subagent` `ai-agent` `dsh-plugin`

## License

MIT License — see [LICENSE](LICENSE).
