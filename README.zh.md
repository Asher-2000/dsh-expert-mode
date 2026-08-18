# DSH Expert Mode（专家模式）

> 一个 agent preset，让 DSH 变成「1 位协调官 + 11 位专家」的多代理团队。

[![dsh-plugin](https://img.shields.io/badge/dsh--plugin-ready-478CBF?logo=deepseek&logoColor=white)](https://github.com/topics/dsh-plugin)
[![Featured in Awesome DSH Plugin](https://img.shields.io/badge/awesome--dsh--plugin-featured-1a56db?logo=deepseek&logoColor=white)](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Stars](https://img.shields.io/github/stars/Asher-2000/dsh-expert-mode)](https://github.com/Asher-2000/dsh-expert-mode)

**中文** | [English](README.md)

---

## 它做了什么

装上这个 preset 后，DSH 会自动切换成「首席协调官」模式：

- 收到任务 → 判断领域 → 委派给最合适的专家子代理
- 复杂任务可同时调度多个专家并行
- 简单任务协调官自己搞定，不强行委派
- 专家完成任务后保持在线，可追加修改

不需要自己写 prompt，不需要维护多套配置——装上就用。

---

## 运行效果

![DSH Expert Mode 主界面](assets/main-ui.jpg)
*DSH 工作区中选择「专家模式」preset 即可使用*

![专家模式运行实况：多专家子代理并行](assets/expert-mode-run.jpg)
*5 个专家子代理同时工作，实时展示 token 消耗与耗时*

---

## 11 位专家

| 专家 | 工具 | 擅长 |
|------|------|------|
| 📊 数据分析师 | `expert_data_analyst` | 数据清洗、统计分析、可视化 |
| ✍️ 文案撰写 | `expert_copywriter` | 营销文案、内容创作、改写润色 |
| ⚖️ 合同/法务审查 | `expert_legal_review` | 合同条款审查、法律风险识别 |
| 📋 产品经理 | `expert_product_manager` | 需求分析、PRD 撰写、竞品调研 |
| 🖥️ 前端开发 | `expert_frontend_dev` | Web 前端实现、组件开发 |
| 🎨 UI/UX 设计 | `expert_uiux_design` | 界面设计、交互方案、设计系统 |
| 🏗️ 架构师 | `expert_architect` | 系统设计、技术选型、架构评审 |
| 📱 全社交平台运营 | `expert_social_media` | 多平台内容分发、账号运营 |
| 🚀 增长黑客 | `expert_growth` | 增长策略、转化漏斗、A/B 测试 |
| 💹 金融/量化 | `expert_quant_finance` | 量化模型、金融分析、风控 |
| 💰 财务 | `expert_finance` | 财务分析、报表解读、预算编制 |

---

## 核心机制

### 渐进式披露（v0.5.0）

协调官持有完整的专家方法论索引，按需注入——不是把所有专家的完整 persona 一次性塞进上下文。

| 指标 | 旧版 | 新版 | 提升 |
|------|------|------|------|
| 专家 persona tokens | 3850 chars | 533 chars | **-86%** |
| 总 prompt tokens | ~2205 | ~1582 | **-28%** |

**工作原理：**
- 协调官 persona 内置 11 位专家的「方法论索引」（方法论 + 产出格式 + 铁律）
- 专家子代理的 persona 精简到最小（只保留角色 + 铁律 + 完成标准）
- 委派时协调官从索引中提取对应方法论，通过近距离引导模板注入子代理
- 子代理一启动就获得完整的「我是谁、要做什么、怎么交付」信息

### 锚定不降智（v0.5.0）

解决系统 prompt 突变导致的「轨迹翻转」问题，确保推理风格稳定性：

| 锚点 | 作用 |
|------|------|
| **风格锁定** | 始终使用默认推理风格，不因上下文变化切换 |
| **证据优先** | 每个结论必须有数据/逻辑依据，不确定时标注「假设」 |
| **逐步推进** | 复杂任务分步执行，每步只做一件事，禁止跳步 |
| **一致性校验** | 输出前检查推理风格是否与上一轮一致，有矛盾则修正 |
| **防漂移** | 上下文窗口满时主动保存状态，确保下一轮无缝衔接 |

### 五锚约束

协调官每轮对话强制自检，防止跑题和低效循环：

| 锚点 | 作用 |
|------|------|
| **回顾** | 每轮开始前，一句话说清当前在做什么 |
| **收敛** | 每轮结束前，确认这一步是否推进了目标 |
| **反跑题** | 连续 2 轮无进展 → 强制换策略 |
| **协作检查** | 委派前判断是否需要跨专家协作 |
| **资源感知** | 全程监控 token，超 70% 自动精简 |

### 近距离引导

协调官委派专家时，从方法论索引中提取对应信息，填入结构化引导模板：

```
── 近距离引导 ──
身份：你是 [专家角色]
任务：{具体任务描述}
输入：{输入数据}
输出格式：[从方法论索引中取该专家的输出格式]
完成标准：[明确的交付标准]
```

子代理一启动就明确「我是谁、要做什么、怎么交付」。

### 专家间通信协议

跨专家协作时，协调官通过结构化消息路由：

```
[FROM:expert_data_analyst → TO:expert_frontend_dev]
任务：基于分析结论设计前端数据展示组件
数据：{专家 A 的结论摘要}
```

### 交叉评审

高风险任务（架构选型、合同审查、财务分析）自动触发多专家独立评审，协调官综合结论。

### 经验沉淀

专家完成重要任务后，提取经验写入 `.expert-mode/experts/{name}/lessons.md`，下次同类任务自动注入。

### 专家持久化

专家完成任务后不销毁，保持在线。协调官可以唤醒专家追加修改，上下文完整保留。

---

## 安装

**方式一：dsh plugin add（推荐）**

```bash
dsh plugin --profile web add github:Asher-2000/dsh-expert-mode
```

**方式二：git clone**

```bash
mkdir -p ~/.dsh/.agent-presets
git clone https://github.com/Asher-2000/dsh-expert-mode.git ~/.dsh/.agent-presets/expert-mode
```

**想要英文版？** 仓库内置 `expert-mode-en/` preset：

```bash
cp -r ~/.dsh/.agent-presets/expert-mode/expert-mode-en ~/.dsh/.agent-presets/expert-mode-en
```

**方式三：手动下载**

从 [Releases](https://github.com/Asher-2000/dsh-expert-mode/releases) 下载最新版，把 `preset.yml` + `agent.cordis.yml` 放到 `~/.dsh/.agent-presets/expert-mode/`。

---

## 使用

安装后，在 DSH **Web GUI 新建会话**时选择「专家模式」preset 即可。

---

## FAQ

**Q: 会额外消耗模型额度吗？**
A: 委派给专家子代理时会产生子代理的模型调用（DSH 子代理机制），与官方子代理功能一致；简单任务协调官直接回答，不产生额外调用。

**Q: 可以自己加专家吗？**
A: 可以。复制 `agent.cordis.yml` 中任意 expert 条目，修改工具名与 persona 即可。

**Q: 与官方 standard preset 的关系？**
A: 基于官方 standard preset 组合改造，保留完整工具集，仅增加专家委派层。

---

## 文件结构

```
.
├── preset.yml          # preset 元信息（名称 + 描述）
├── agent.cordis.yml    # 协调官 persona + 方法论索引 + 11 位专家子代理工具定义
├── expert-mode-en/     # 英文版 preset
├── README.md
├── README.zh.md
└── LICENSE
```

---

## 版本历史

- **v0.5.0** — 渐进式披露 + 锚定不降智（prompt tokens -28%，推理风格稳定性 9/10）
- **v0.4.0** — 五锚约束 + 近距离引导 + 交叉评审 + 经验沉淀
- **v0.3.0** — 专家持久化 + 通信协议

---

## 社区收录

- 📢 入选 **Awesome DSH Plugin 精选列表**：https://github.com/awesome-dsh-plugin/awesome-dsh-plugin
- 🏷️ GitHub `dsh-plugin` topic 收录：https://github.com/topics/dsh-plugin

## Tags

`dsh` `deepseek-harness` `agent-preset` `expert-mode` `multi-agent` `subagent` `ai-agent` `dsh-plugin`

## License

MIT License — see [LICENSE](LICENSE).
