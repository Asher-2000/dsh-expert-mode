#!/usr/bin/env python3
"""
专家模式任务调度器 (Taskboard) — 文件系统版真实任务调度
=============================================================
借鉴 dsh-agent-teams 的调度思想，但用 Python 文件系统实现，
与 comm/bus.py 同架构，适配专家模式现有体系：

状态机: pending -> ready -> running -> done | failed
  pending  已创建，等待依赖完成
  ready    依赖全部完成，可被认领
  running  某专家正在执行
  done     完成
  failed   失败（自动重试后仍失败）

核心能力:
1. running/idle/ready 状态机 — 原子认领（claim）
2. 依赖感知 DAG — 任务依赖未完成不可认领
3. 失败重试 — failed 任务可 retry，自动回 pending
4. 冷启动恢复 — 进程重启后读任务目录恢复 running -> ready（stale 恢复）

用法:
  taskboard.py create <title> [--owner 专家] [--dep 任务ID] [--desc 描述]
  taskboard.py list [--status pending|ready|running|done|failed|stale]
  taskboard.py show <task_id>
  taskboard.py claim <task_id> <agent>        # 原子认领（running）
  taskboard.py done <task_id> [summary]       # 标记完成
  taskboard.py fail <task_id> [reason]        # 标记失败
  taskboard.py retry <task_id>                # 失败/完成后重试（回 pending）
  taskboard.py recover                         # 冷启动恢复：stale running -> ready
  taskboard.py status                          # 看板总览
  taskboard.py deps <task_id>                  # 显示依赖链

状态存于 .expert-mode/tasks/ 目录，每个任务一个 .task 文件（JSON）。
"""
import os
import re
import sys
import json
import time
import shutil
from datetime import datetime, timezone

BASE = os.path.dirname(os.path.abspath(__file__))
TASKS_DIR = os.path.join(BASE, "tasks")
DONE_DIR = os.path.join(BASE, "tasks_done")

VALID_ID = re.compile(r"^[a-z0-9-]+$")

# 状态机合法迁移
ALLOWED_TRANSITIONS = {
    "pending": {"ready"},
    "ready": {"running"},
    "running": {"done", "failed"},
    "done": {"pending"},      # 允许重做
    "failed": {"pending", "ready"},  # 重试
}


def _now():
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def _ensure_dirs():
    for d in (TASKS_DIR, DONE_DIR):
        os.makedirs(d, exist_ok=True)


def _next_id():
    """生成任务 ID: task-NNN，单调递增（从 tasks_done 归档数 + 现有数）。"""
    _ensure_dirs()
    existing = []
    for d in (TASKS_DIR, DONE_DIR):
        if os.path.isdir(d):
            existing += [f for f in os.listdir(d) if f.endswith(".task")]
    nums = []
    for f in existing:
        m = re.match(r"task-(\d+)\.task$", f)
        if m:
            nums.append(int(m.group(1)))
    nxt = max(nums) + 1 if nums else 1
    return f"task-{nxt:03d}"


def _task_path(task_id):
    _ensure_dirs()
    return os.path.join(TASKS_DIR, f"{task_id}.task")


def _load_task(task_id):
    p = _task_path(task_id)
    if not os.path.exists(p):
        return None
    with open(p, encoding="utf-8") as f:
        return json.load(f)


def _save_task(task):
    p = _task_path(task["id"])
    with open(p, "w", encoding="utf-8") as f:
        json.dump(task, f, ensure_ascii=False, indent=2)


def _list_tasks():
    _ensure_dirs()
    out = []
    for fn in sorted(os.listdir(TASKS_DIR)):
        if fn.endswith(".task"):
            with open(os.path.join(TASKS_DIR, fn), encoding="utf-8") as f:
                out.append(json.load(f))
    return out


def _set_status(task, new_status, agent=None, reason=""):
    """状态迁移 + 校验。返回 (ok, error)。"""
    old = task.get("status", "pending")
    if new_status not in ALLOWED_TRANSITIONS.get(old, set()):
        return False, f"非法迁移 {old} -> {new_status}"
    task["status"] = new_status
    task["updated_at"] = _now()
    if agent:
        task["agent"] = agent
    if reason:
        task["reason"] = reason
    # 状态时间戳
    task.setdefault("history", []).append({
        "ts": _now(),
        "from": old,
        "to": new_status,
        "agent": agent or task.get("agent", ""),
        "reason": reason,
    })
    return True, ""


def _deps_done(task):
    """依赖是否全部完成。"""
    for dep in task.get("deps", []):
        d = _load_task(dep)
        if not d or d.get("status") != "done":
            return False
    return True


def _sync_ready():
    """把依赖已完成的 pending 任务提升为 ready。"""
    changed = []
    for t in _list_tasks():
        if t["status"] == "pending" and _deps_done(t):
            ok, _ = _set_status(t, "ready")
            if ok:
                _save_task(t)
                changed.append(t["id"])
    return changed


def _recover_stale():
    """冷启动恢复：running 状态超过 stale_after 秒的任务视为中断，回 ready。
    记录 recover 历史，保留 agent 信息但允许重新认领。"""
    stale_after = int(os.environ.get("TASKBOARD_STALE_AFTER", "300"))
    recovered = []
    now = time.time()
    for t in _list_tasks():
        if t["status"] == "running":
            updated = t.get("updated_at", "")
            # 解析 ISO 时间戳；解析失败按过期处理
            try:
                dt = datetime.strptime(updated, "%Y-%m-%dT%H:%M:%SZ").replace(tzinfo=timezone.utc)
                age = now - dt.timestamp()
            except Exception:
                age = stale_after + 1
            if age > stale_after:
                t["status"] = "ready"
                t["updated_at"] = _now()
                t.setdefault("history", []).append({
                    "ts": _now(), "from": "running", "to": "ready",
                    "agent": "system", "reason": "stale recovery (crash)",
                })
                _save_task(t)
                recovered.append(t["id"])
    return recovered


def cmd_create(argv):
    if not argv:
        sys.stderr.write("用法: taskboard.py create <title> [--owner X] [--dep id] [--desc ...]\n")
        return 2
    title = argv[0]
    owner = None
    deps = []
    desc = ""
    i = 1
    while i < len(argv):
        if argv[i] == "--owner" and i + 1 < len(argv):
            owner = argv[i + 1]; i += 2
        elif argv[i] == "--dep" and i + 1 < len(argv):
            deps.append(argv[i + 1]); i += 2
        elif argv[i] == "--desc" and i + 1 < len(argv):
            desc = argv[i + 1]; i += 2
        else:
            i += 1
    for dep in deps:
        if not _load_task(dep):
            sys.stderr.write(f"[taskboard] 依赖任务 {dep} 不存在\n")
            return 2
    task_id = _next_id()
    task = {
        "id": task_id,
        "title": title,
        "status": "pending",
        "agent": owner or "",
        "deps": deps,
        "desc": desc,
        "retries": 0,
        "created_at": _now(),
        "updated_at": _now(),
        "history": [{"ts": _now(), "from": "", "to": "pending", "agent": owner or "", "reason": "created"}],
    }
    _save_task(task)
    _sync_ready()
    print(f"[taskboard] 创建 {task_id} 「{title}」 status=pending")
    if deps:
        print(f"[taskboard] 依赖: {', '.join(deps)}（完成后自动转 ready）")
    return 0


def cmd_list(argv):
    status_filter = None
    if "--status" in argv:
        idx = argv.index("--status")
        if idx + 1 < len(argv):
            status_filter = argv[idx + 1]
    tasks = _list_tasks()
    if status_filter:
        tasks = [t for t in tasks if t["status"] == status_filter]
    tasks.sort(key=lambda t: t["id"])
    if not tasks:
        print("[taskboard] 无任务")
        return 0
    print(f"[taskboard] 任务列表（{len(tasks)} 个）:")
    for t in tasks:
        deps = f" dep:{','.join(t['deps'])}" if t.get("deps") else ""
        agent = f" {t['agent']}" if t.get("agent") else ""
        print(f"  {t['id']} [{t['status']:8s}] {t['title']}{agent}{deps}")
    return 0


def cmd_show(argv):
    if not argv:
        sys.stderr.write("用法: taskboard.py show <task_id>\n")
        return 2
    t = _load_task(argv[0])
    if not t:
        sys.stderr.write(f"[taskboard] 任务 {argv[0]} 不存在\n")
        return 1
    print(f"ID:     {t['id']}")
    print(f"标题:   {t['title']}")
    print(f"状态:   {t['status']}")
    print(f"负责人: {t.get('agent') or '未分配'}")
    print(f"依赖:   {', '.join(t.get('deps', [])) or '无'}")
    print(f"描述:   {t.get('desc') or '无'}")
    print(f"重试:   {t.get('retries', 0)}")
    print(f"创建:   {t['created_at']}")
    print(f"更新:   {t['updated_at']}")
    if t.get("reason"):
        print(f"原因:   {t['reason']}")
    if t.get("history"):
        print("历史:")
        for h in t["history"]:
            print(f"  {h['ts']} {h['from']:8s} -> {h['to']:8s} {h.get('agent', '')} {h.get('reason', '')}")
    return 0


def cmd_claim(argv):
    """原子认领：ready -> running。认领时检查依赖仍满足。"""
    if len(argv) < 2:
        sys.stderr.write("用法: taskboard.py claim <task_id> <agent>\n")
        return 2
    task_id, agent = argv[0], argv[1]
    t = _load_task(task_id)
    if not t:
        sys.stderr.write(f"[taskboard] 任务 {task_id} 不存在\n")
        return 1
    if not _deps_done(t):
        sys.stderr.write(f"[taskboard] {task_id} 依赖未完成，不可认领\n")
        return 1
    ok, err = _set_status(t, "running", agent=agent)
    if not ok:
        sys.stderr.write(f"[taskboard] {err}\n")
        return 1
    _save_task(t)
    print(f"[taskboard] {agent} 认领 {task_id} 「{t['title']}」 -> running")
    return 0


def cmd_done(argv):
    if not argv:
        sys.stderr.write("用法: taskboard.py done <task_id> [summary]\n")
        return 2
    task_id = argv[0]
    summary = " ".join(argv[1:]) if len(argv) > 1 else ""
    t = _load_task(task_id)
    if not t:
        sys.stderr.write(f"[taskboard] 任务 {task_id} 不存在\n")
        return 1
    ok, err = _set_status(t, "done", reason=summary)
    if not ok:
        sys.stderr.write(f"[taskboard] {err}\n")
        return 1
    _save_task(t)
    _sync_ready()
    print(f"[taskboard] {task_id} 「{t['title']}」 -> done")
    # 显示因本任务完成而新就绪的任务
    ready_now = [x["id"] for x in _list_tasks() if x["status"] == "ready" and task_id in x.get("deps", [])]
    if ready_now:
        print(f"[taskboard] 依赖已就绪: {', '.join(ready_now)}")
    return 0


def cmd_fail(argv):
    if not argv:
        sys.stderr.write("用法: taskboard.py fail <task_id> [reason]\n")
        return 2
    task_id = argv[0]
    reason = " ".join(argv[1:]) if len(argv) > 1 else ""
    t = _load_task(task_id)
    if not t:
        sys.stderr.write(f"[taskboard] 任务 {task_id} 不存在\n")
        return 1
    ok, err = _set_status(t, "failed", reason=reason)
    if not ok:
        sys.stderr.write(f"[taskboard] {err}\n")
        return 1
    _save_task(t)
    print(f"[taskboard] {task_id} 「{t['title']}」 -> failed ({reason or '无原因'})")
    return 0


def cmd_retry(argv):
    """失败/完成的任务重试：回 pending（若依赖完成则直接 ready）。"""
    if not argv:
        sys.stderr.write("用法: taskboard.py retry <task_id>\n")
        return 2
    task_id = argv[0]
    t = _load_task(task_id)
    if not t:
        sys.stderr.write(f"[taskboard] 任务 {task_id} 不存在\n")
        return 1
    if t["status"] not in ("failed", "done"):
        sys.stderr.write(f"[taskboard] 仅 failed/done 任务可 retry（当前 {t['status']}）\n")
        return 1
    ok, err = _set_status(t, "pending", reason="retry")
    if not ok:
        sys.stderr.write(f"[taskboard] {err}\n")
        return 1
    t["retries"] = t.get("retries", 0) + 1
    _save_task(t)
    if _deps_done(t):
        _set_status(t, "ready", reason="retry (deps done)")
        _save_task(t)
    print(f"[taskboard] {task_id} 重试 #{t['retries']} -> {t['status']}")
    return 0


def cmd_recover(argv=None):
    recovered = _recover_stale()
    ready = _sync_ready()
    if not recovered and not ready:
        print("[taskboard] 无 stale/待提升任务")
    if recovered:
        print(f"[taskboard] 恢复 {len(recovered)} 个 stale running: {', '.join(recovered)} -> ready")
    if ready:
        print(f"[taskboard] 提升 {len(ready)} 个 pending 依赖完成: {', '.join(ready)} -> ready")
    return 0


def cmd_status(argv=None):
    tasks = _list_tasks()
    counts = {}
    for t in tasks:
        counts[t["status"]] = counts.get(t["status"], 0) + 1
    print("[taskboard] 看板总览:")
    for s in ("pending", "ready", "running", "done", "failed"):
        n = counts.get(s, 0)
        bar = "█" * n if n <= 30 else "█" * 30 + f"({n})"
        print(f"  {s:8s} {n:3d} {bar}")
    # 下一个可认领任务
    ready = [t for t in tasks if t["status"] == "ready"]
    if ready:
        print(f"\n[taskboard] 下一个可认领: {ready[0]['id']} 「{ready[0]['title']}」")
    return 0


def cmd_deps(argv):
    if not argv:
        sys.stderr.write("用法: taskboard.py deps <task_id>\n")
        return 2
    task_id = argv[0]
    t = _load_task(task_id)
    if not t:
        sys.stderr.write(f"[taskboard] 任务 {task_id} 不存在\n")
        return 1
    print(f"「{t['title']}」依赖链:")
    seen = set()
    def walk(tid, depth):
        if tid in seen or depth > 10:
            return
        seen.add(tid)
        t2 = _load_task(tid)
        if not t2:
            return
        marker = "✅" if t2["status"] == "done" else ("🔄" if t2["status"] == "running" else "⬜")
        print(f"  {'  ' * depth}{marker} {tid} [{t2['status']}] {t2['title']}")
        for d in t2.get("deps", []):
            walk(d, depth + 1)
    walk(task_id, 0)
    return 0


CMDS = {
    "create": cmd_create,
    "list": cmd_list,
    "show": cmd_show,
    "claim": cmd_claim,
    "done": cmd_done,
    "fail": cmd_fail,
    "retry": cmd_retry,
    "recover": cmd_recover,
    "status": cmd_status,
    "deps": cmd_deps,
}


def main():
    _ensure_dirs()
    if len(sys.argv) < 2 or sys.argv[1] not in CMDS:
        print(__doc__)
        return 2
    rc = CMDS[sys.argv[1]](sys.argv[2:])
    sys.exit(rc)


if __name__ == "__main__":
    main()


