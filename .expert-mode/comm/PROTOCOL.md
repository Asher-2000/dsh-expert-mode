# 专家间通信协议 v1 — 文件消息总线（黑板模式）

**状态**: ✅ 已实现并验证
**创建**: 2026-08-22
**定位**: 专家模式基础设施 — 让专家之间的**内容直接流动**，协调官只做路由唤醒，不搬运消息内容。

**自举**: `bus.py` 首次运行自动创建 `mailboxes/`、`archive/`、`logs/` 目录，全新克隆即可直接使用，无需手工初始化。

---

## 1. 为什么是"真正的通信"

| 维度 | 旧机制（协调官中转） | 新机制（消息总线） |
|------|---------------------|-------------------|
| 内容流经 | 协调官上下文（转述=内容复制+失真风险） | 共享文件系统（专家A写 → 专家B读） |
| 异步性 | 协调官串行编排 | 专家可自主异步收发 |
| 持久化 | 无（协调官上下文易失） | 每条消息落盘，可回放、可归档 |
| 可审计 | 无日志 | `comm/logs/bus.log` 全量留痕 |
| 扩展性 | 每加一个专家，协调官负担+1 | 总线广播，O(1) 协调官负担 |

**核心原则**: 消息内容零经手协调官。协调官只在需要时通过 `send_message` 或任务提示告诉接收方"你的邮箱有消息"。

---

## 2. 快速上手

```bash
# 发单播（专家A → 专家B）
python3 /home/sam/deepcode/.expert-mode/comm/bus.py send data-analyst copywriter "分析结果" "发现3个关键数据点"

# 从文件读取正文发消息
python3 /home/sam/deepcode/.expert-mode/comm/bus.py send architect frontend-dev "架构决策" - < /tmp/decision.txt

# 读收件箱
python3 /home/sam/deepcode/.expert-mode/comm/bus.py read copywriter

# 确认已读（归档）
python3 /home/sam/deepcode/.expert-mode/comm/bus.py ack copywriter <message_id>

# 广播（除自己外所有邮箱）
python3 /home/sam/deepcode/.expert-mode/comm/bus.py broadcast coordinator "状态同步" "全体专家进度正常"

# 总线概况
python3 /home/sam/deepcode/.expert-mode/comm/bus.py stats
python3 /home/sam/deepcode/.expert-mode/comm/bus.py inboxes
```

**简便别名**（专家提示词里可注入）：
```bash
alias bus="python3 /home/sam/deepcode/.expert-mode/comm/bus.py"
```

---

## 3. 消息格式

每条消息是 `mailboxes/<接收方>/<message_id>.msg` 文件，UTF-8 明文：

```
ID: 1787363612_coordinator_1
FROM: coordinator
TO: data-analyst
SUBJECT: 自测消息
TS: 2026-08-22T01:53:32Z
KIND: direct | broadcast
---
<body 正文，可多行>
```

- **message_id** 格式: `<epoch秒>_<发送方>_<序号>`，全局唯一
- **KIND**: `direct`（单播）或 `broadcast`（广播）
- **ack 后**消息移动到 `archive/<接收方>/`，不再出现在收件箱

---

## 4. 参与方

| 总线名 | 角色 |
|--------|------|
| coordinator | 协调官 |
| data-analyst | 数据分析师 |
| copywriter | 文案撰写 |
| legal-review | 法务 |
| product-manager | 产品经理 |
| frontend-dev | 前端开发 |
| uiux-design | UI/UX设计 |
| architect | 架构师 |
| social-media | 社交运营 |
| growth | 增长黑客 |
| quant-finance | 金融量化 |
| finance | 财务 |
| devops | 运维 |
| security | 安全 |
| qa | 测试 |
| database | 数据库 |

---

## 5. 协作模式（协调官如何用）

### 模式A：接力协作（串行）
1. 委派专家A，任务里写"完成后用 bus.py send 把结果发给 <专家B>"
2. 专家A 完成后：`bus.py send <A> <B> "主题" "正文"`
3. 协调官委派专家B，任务里写"先用 bus.py read 读取 <A> 发来的消息"
4. 专家B 读取并基于其继续工作

### 模式B：并行收集（各干各的，总线汇合）
1. 同时委派专家A、B、C
2. 各自完成后向 coordinator 邮箱发结果
3. 协调官 `bus.py read coordinator --all` 一次性汇总

### 模式C：广播同步
- 全局状态变更用 `broadcast`，所有专家邮箱自动收到
- 适合"规则更新""版本冻结""新增方法论"等

### 模式D：交叉评审（高风险任务）
- 派专家A、B独立输出，各自 bus.py send 到对方邮箱
- 对方读取后给出"同意/部分同意/反对+理由"，再 send 回
- 协调官最终裁判（读双方消息即可，无需转述）

### 模式E：P2P 直接委派（专家直连，无需总线）
- 专家持有 subagent 工具时，可直接创建另一位专家作为自己的孙代理
- 例：专家A 需要法律意见时，直接创建 legal-review 子代理并接收其返回
- 适用：对话式、需要往返澄清的协作（总线是异步广播，P2P 是同步问答）
- 注意：P2P 无持久化日志，重要结论仍建议走总线留档

---

## 6. 目录结构

```
.expert-mode/comm/
├── bus.py               # 总线CLI（唯一入口）
├── mailboxes/<agent>/   # 各参与者收件箱（*.msg 文件）
├── archive/<agent>/     # 已读归档
├── logs/bus.log         # 全量通信日志（发送/确认）
└── .seq                 # 消息序号（单调递增）
```

---

## 7. 协议铁律

1. **内容零中转**：协调官不得把消息全文复制进自己上下文再转述。要传递信息时，给接收方"去邮箱读"的指令。
2. **发必署名**：FROM 必须是真实身份，禁止冒名。
3. **读必确认**：读完重要消息应 ack 归档，保持收件箱干净。
4. **路径安全**：参与者名只允许 `[a-z0-9-]`，bus.py 已做校验。
5. **日志为凭**：一切通信以 `logs/bus.log` 为准。
6. **失败不静默**：读取失败要报告，不能假装读过。

---

## 8. 验收清单（真通信判定）

- [x] 专家A 写入 → 专家B 直接读取，内容不经协调官
- [x] 异步收发（B 无需在线）
- [x] 持久化（重启不丢）
- [x] 可审计（bus.log 全留痕）
- [x] 广播能力
- [x] 已读归档机制
- [ ] 端到端：真实双专家走总线接力（待测）
