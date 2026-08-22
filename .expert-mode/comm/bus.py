#!/usr/bin/env python3
"""
专家模式消息总线 (Blackboard Bus) — 专家间真正通信基础设施
=============================================================
设计原则：
1. 消息直接落在共享文件系统，专家A写、专家B读 —— 内容不经协调官转述
2. 异步、持久化、可审计（每条消息有唯一ID，可回放、可归档）
3. 协调官只负责"唤醒路由"（告诉接收方有消息），不搬运消息内容
4. 支持单播（send）与广播（broadcast）

用法:
  bus.py send <from> <to> <subject> [body]      # 发送单播消息；body 传 "-" 从 stdin 读
  bus.py broadcast <from> <subject> [body]      # 广播给除自己外的所有邮箱
  bus.py read <agent> [--all]                   # 读收件箱（默认只显示未读）
  bus.py list [agent]                           # 列消息（可指定某邮箱）
  bus.py ack <agent> <message_id>               # 确认已读（归档）
  bus.py stats                                  # 总线统计
  bus.py inboxes                                # 列出所有邮箱及其未读数

示例:
  bus.py send data-analyst copywriter "分析结果" - < /tmp/result.txt
  bus.py broadcast coordinator "状态同步" "各专家进度正常"
  bus.py read copywriter
"""
import os
import re
import sys
import json
import time
import shutil
from datetime import datetime, timezone

BASE = os.path.dirname(os.path.abspath(__file__))
MAILBOXES = os.path.join(BASE, "mailboxes")
ARCHIVE = os.path.join(BASE, "archive")
LOGS = os.path.join(BASE, "logs")
SEQ_FILE = os.path.join(BASE, ".seq")

# 合法参与者名单：协调官 + 全部专家
AGENTS = {
    "coordinator": "协调官",
    "data-analyst": "数据分析师",
    "copywriter": "文案撰写",
    "legal-review": "法务",
    "product-manager": "产品经理",
    "frontend-dev": "前端开发",
    "uiux-design": "UI/UX设计",
    "architect": "架构师",
    "social-media": "社交运营",
    "growth": "增长黑客",
    "quant-finance": "金融量化",
    "finance": "财务",
    "devops": "运维",
    "security": "安全",
    "qa": "测试",
    "database": "数据库",
}

VALID_AGENT = re.compile(r"^[a-z0-9-]+$")


def _now():
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def _ensure_dirs():
    """首次运行自动创建总线目录结构。"""
    for d in (MAILBOXES, ARCHIVE, LOGS):
        os.makedirs(d, exist_ok=True)


def _ensure_agent(agent):
    """校验参与者名，防止路径穿越。返回规范化名字。"""
    if agent not in AGENTS:
        # 允许自定义参与者，但必须安全
        if not VALID_AGENT.match(agent):
            sys.stderr.write(f"[bus] 非法参与者名: {agent!r}\n")
            sys.exit(2)
    d = os.path.join(MAILBOXES, agent)
    os.makedirs(d, exist_ok=True)
    return agent


def _next_seq():
    with open(SEQ_FILE, "a+") as f:
        f.seek(0)
        raw = f.read().strip()
        cur = int(raw) if raw else 0
        nxt = cur + 1
        f.seek(0)
        f.truncate()
        f.write(str(nxt))
        f.flush()
    return nxt


def _write_message(frm, to, subject, body, kind="direct"):
    ts = time.time()
    seq = _next_seq()
    mid = f"{int(ts)}_{frm}_{seq}"
    fname = os.path.join(MAILBOXES, to, f"{mid}.msg")
    payload = (
        f"ID: {mid}\n"
        f"FROM: {frm}\n"
        f"TO: {to}\n"
        f"SUBJECT: {subject}\n"
        f"TS: {_now()}\n"
        f"KIND: {kind}\n"
        f"---\n"
        f"{body}\n"
    )
    with open(fname, "w", encoding="utf-8") as f:
        f.write(payload)
    # 日志
    with open(os.path.join(LOGS, "bus.log"), "a", encoding="utf-8") as f:
        f.write(f"{_now()} | {frm} -> {to} | {subject} | {mid}\n")
    return mid


def _read_messages(agent, include_read=False):
    d = os.path.join(MAILBOXES, agent)
    if not os.path.isdir(d):
        return []
    out = []
    for fn in sorted(os.listdir(d)):
        if fn.endswith(".msg"):
            p = os.path.join(d, fn)
            with open(p, encoding="utf-8") as f:
                content = f.read()
            meta = {}
            body_start = 0
            for i, line in enumerate(content.splitlines()):
                if line == "---":
                    body_start = i + 1
                    break
                if ":" in line:
                    k, _, v = line.partition(":")
                    meta[k.strip()] = v.strip()
            body = "\n".join(content.splitlines()[body_start:])
            out.append({"meta": meta, "body": body, "path": p})
    return out


def cmd_send(argv):
    if len(argv) < 4:
        sys.stderr.write("用法: bus.py send <from> <to> <subject> [body 或 -]\n")
        sys.exit(2)
    frm, to, subject = argv[0], argv[1], argv[2]
    if len(argv) > 3 and argv[3] != "-":
        body = " ".join(argv[3:])
    else:
        body = sys.stdin.read()
    _ensure_agent(frm)
    _ensure_agent(to)
    mid = _write_message(frm, to, subject, body)
    print(f"[bus] 已发送 {mid} ({frm} -> {to})")
    print(f"[bus] 接收方读取: bus.py read {to}")
    return 0


def cmd_broadcast(argv):
    if len(argv) < 3:
        sys.stderr.write("用法: bus.py broadcast <from> <subject> [body 或 -]\n")
        sys.exit(2)
    frm, subject = argv[0], argv[1]
    body = " ".join(argv[2:]) if len(argv) > 2 and argv[2] != "-" else sys.stdin.read()
    _ensure_agent(frm)
    mids = []
    for to in AGENTS:
        if to == frm:
            continue
        _ensure_agent(to)
        mids.append(_write_message(frm, to, subject, body, kind="broadcast"))
    print(f"[bus] 已广播给 {len(mids)} 个邮箱")
    return 0


def cmd_read(argv):
    if not argv:
        sys.stderr.write("用法: bus.py read <agent> [--all]\n")
        sys.exit(2)
    agent = _ensure_agent(argv[0])
    include_read = "--all" in argv
    msgs = _read_messages(agent, include_read)
    if not msgs:
        print(f"[bus] {agent} 收件箱为空")
        return 0
    print(f"[bus] {agent} 收件箱（共 {len(msgs)} 条）:")
    for m in msgs:
        meta = m["meta"]
        print("=" * 60)
        print(f"ID: {meta.get('ID')} | FROM: {meta.get('FROM')} | TS: {meta.get('TS')}")
        print(f"SUBJECT: {meta.get('SUBJECT')}")
        print("-" * 60)
        print(m["body"].rstrip())
        print()
    return 0


def cmd_list(argv):
    agent = argv[0] if argv else None
    targets = [agent] if agent else list(AGENTS.keys())
    total = 0
    for a in targets:
        d = os.path.join(MAILBOXES, a)
        if os.path.isdir(d):
            n = len([f for f in os.listdir(d) if f.endswith(".msg")])
            total += n
            if n:
                print(f"  {a}: {n} 条未读")
    print(f"[bus] 总线未读总数: {total}")
    return 0


def cmd_ack(argv):
    if len(argv) < 2:
        sys.stderr.write("用法: bus.py ack <agent> <message_id>\n")
        sys.exit(2)
    agent, mid = argv[0], argv[1]
    d = os.path.join(MAILBOXES, agent)
    src = os.path.join(d, f"{mid}.msg")
    if not os.path.exists(src):
        sys.stderr.write(f"[bus] 未找到消息 {mid} 于 {agent}\n")
        return 1
    ad = os.path.join(ARCHIVE, agent)
    os.makedirs(ad, exist_ok=True)
    shutil.move(src, os.path.join(ad, f"{mid}.msg"))
    with open(os.path.join(LOGS, "bus.log"), "a", encoding="utf-8") as f:
        f.write(f"{_now()} | {agent} ack {mid}\n")
    print(f"[bus] {agent} 已确认并归档 {mid}")
    return 0


def cmd_stats(argv=None):
    print("[bus] 总线统计:")
    for a in AGENTS:
        d = os.path.join(MAILBOXES, a)
        n = len([f for f in os.listdir(d) if f.endswith(".msg")]) if os.path.isdir(d) else 0
        ad = os.path.join(ARCHIVE, a)
        na = len([f for f in os.listdir(ad) if f.endswith(".msg")]) if os.path.isdir(ad) else 0
        print(f"  {a:16s} 未读 {n:3d} | 已归档 {na:3d}")
    if os.path.exists(os.path.join(LOGS, "bus.log")):
        with open(os.path.join(LOGS, "bus.log"), encoding="utf-8") as f:
            lines = f.readlines()
        print(f"[bus] 日志条目: {len(lines)}")


def cmd_inboxes(argv=None):
    print("[bus] 参与者:")
    for a, zh in AGENTS.items():
        d = os.path.join(MAILBOXES, a)
        n = len([f for f in os.listdir(d) if f.endswith(".msg")]) if os.path.isdir(d) else 0
        mark = f" ({n} 未读)" if n else ""
        print(f"  {a:16s} {zh}{mark}")


CMDS = {
    "send": cmd_send,
    "broadcast": cmd_broadcast,
    "read": cmd_read,
    "list": cmd_list,
    "ack": cmd_ack,
    "stats": cmd_stats,
    "inboxes": cmd_inboxes,
}


def main():
    _ensure_dirs()
    if len(sys.argv) < 2 or sys.argv[1] not in CMDS:
        print(__doc__)
        sys.exit(2)
    rc = CMDS[sys.argv[1]](sys.argv[2:])
    sys.exit(rc)


if __name__ == "__main__":
    main()
