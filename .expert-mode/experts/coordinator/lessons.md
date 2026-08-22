# 通信能力经验沉淀 (2026-08-22)

## 关键教训

1. **真正的专家间通信有两条可行路径，都已验证可用**：
   - **文件消息总线**（`.expert-mode/comm/bus.py`）：内容落盘、异步、可审计，适合接力/广播/评审。专家写文件，另一专家读文件，协调官只路由不搬内容。
   - **P2P 代理直连**：专家持有 subagent 工具时可直接创建"孙代理"作为协作对象（实测成功：专家→财务孙代理，返回正确答案）。适合需要往返澄清的同步问答。

2. **判定"真通信"的三条铁律**（防止退回假通信）：
   - 内容不经协调官上下文转述
   - 消息持久化、可回放、可审计（bus.log 全留痕）
   - 专家能自主收发，协调官只做唤醒/路由

3. **实测验证方法（可复用）**：委派下游专家时提示词中**不注入**上游数据，只让它去总线邮箱读取。若它成功产出，即证明数据确实在专家之间直接流动——这是最强证据。

## 反模式（避免）

- ❌ 协调官把 A 的输出复制进自己上下文再塞给 B = 假通信（旧机制）
- ❌ 只有通信格式约定（[FROM→TO]）没有真实通道 = 纸上协议
- ✅ 消息内容零经手协调官 + 落盘留痕 = 真通信

## 实用命令速查

```bash
# 发送/读取/确认
python3 .expert-mode/comm/bus.py send <from> <to> "<subject>" "<body>"
python3 .expert-mode/comm/bus.py read <agent>
python3 .expert-mode/comm/bus.py ack <agent> <message_id>
# 广播/统计
python3 .expert-mode/comm/bus.py broadcast <from> "<subject>" "<body>"
python3 .expert-mode/comm/bus.py stats
```
