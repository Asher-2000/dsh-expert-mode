# Visual Inspection

## 多模态目检补充链路（2026-08-25 实测）：OpenCode Zen mimo-v2.5
当当前模型不支持读图（read_image 不可用，如 deepseek-v4-flash）时，可调用 OpenCode Zen/Go 多模态模型做画面语义目检（手/脸/军装/反差/水印断言），补上 Mode B 无法覆盖的观感项。**按需调用**：只在成片/关键帧验收时触发，不占用 Agnes 生图/生视频配额与 key。

- **凭据**：`<OPENCODE_AUTH_FILE>`（`{"opencode":{"type":"api","key":"sk-..."}}`，0600；可用 `opencode auth login` 或直接写入）；脚本从该文件读 key，**禁止回显**
- **端点（订阅优先，2026-08-25 修正）**：**OpenCode Go 订阅 → `https://opencode.ai/zen/go/v1/chat/completions`**（models.dev provider id=`opencode-go`）；仅 Zen 预付费 key 时才用 `https://opencode.ai/zen/v1`（按 credits 扣费）。**「Go 订阅 key 打 Zen 端点必 401 CreditsError 'Insufficient balance'」是头号排查项——用户说『订阅有余量』时先切 /zen/go/v1 再谈充值**
- **模型 id**：Go 订阅用 **`mimo-v2.5`**（订阅涵盖，图像+音频+视频 omni，100 万上下文；可用环境变量 OC_MODEL 切换同套餐图像模型：kimi-k2.6/qwen3.7-plus/minimax-m3/grok-4.5/deepseek-v4-flash-vision-exp）；免费档 `mimo-v2.5-free` 仅为无订阅时的次选（约 1 RPM 限流）
- **mimo-v2.5 行为特征（实测 2026-08-25）**：文本请求快（秒级）；**图像请求慢**——带图超 120s 常见，批量目检 curl 超时须放到 300s；偶发 429/FreeUsageLimitError「Rate limit exceeded」是临时限流，冷却 60s+ 后恢复；同套餐图像模型实测连通性：minimax-m3/qwen3.7-plus/deepseek-v4-flash-vision-exp=200，kimi-k2.6/grok-4.5=503，gpt-5.6-luna=500（mimo-v2.5 不可用时按此选备用）
- **两条硬约束（实测 2026-08-25）**：
  1. **必须走代理** `-x <PROXY_ADDR>`：直连（或环境 NO_PROXY 含 opencode.ai 时）上游 503「Endpoint is unavailable」；常见环境 `NO_PROXY` 默认含 `opencode.ai`，直接调用须显式 `-x` 或覆盖 `NO_PROXY`
  2. **必须非流式**：`stream=true` 上游 503；省略 stream 字段 → 200，约 30-40s/帧（每帧 1-2MB base64 请求体 OK）
- **带图请求**：OpenAI content 数组——`{"role":"user","content":[{"type":"text","text":"<质检清单>"},{"type":"image_url","image_url":{"url":"data:image/png;base64,<b64>"}}]}`；mimo 是 reasoning 模型，`max_tokens` 建议 1024-2048（过小会截断在推理段，content 为 null）
- **响应**：`choices[0].message.content` = 结论（中文逐项【通过/不通过】+理由），`message.reasoning` = 思考过程；判定以 content 为准（**finish_reason=stop 为完整；`finish=length` 为截断——即使 content 非 null 也可能半截，应判无效并以 max_tokens≥2048 定点补测**，2026-08-26 沉香任务实测）
- **一键脚本**：`inspect_frames.sh <img1> <img2> ...` → 逐帧质检（Go 订阅端点 + mimo-v2.5，key 读 auth.json、代理+非流式、非 200 冷却 30s 重试 ≤3 次、临时文件按 PID 隔离、并发安全；环境变量：`OC_MODEL` 换模型 / `OC_CONCURRENCY` 并发数默认 2（Go 订阅 2-3 稳妥）/ `OC_MAXTOKENS` 默认 1024 / `OC_OUT_DIR` 指定任务目检目录），输出 `OC_OUT_DIR/results.jsonl`，末尾打印 ALL-PASS/FAIL 汇总
- **目检抽帧策略（2026-08-26 优化）**：先只抽 2-3 个关键时间点（起/中/尾）；**时间点必须对齐剧情节点**（人物出场/高潮/定格各一个）——否则「主角此时未现身」会被误判为缺陷（如沉香 0s 无三圣母属设计内，不算不通过）；**高要求任务用任务专属清单**（通用 6 项 + 任务要素项：主角形象/法器/特效/氛围），比通用清单更能抓住问题（示例：`inspect_frames_cxp.sh`）
- **限流**：免费档约 1 RPM，连续请求会 429；批量目检建议帧间隔 ≥60s，失败按 30-60s 冷却重试（脚本已内置冷却重试，必要时调大间隔）；Go 订阅实测并发 2-3 无 429，可安心开并发
- **注意**：opencode CLI run 模式对 mimo **不可用**——CLI 强制流式（上游 503 → 包装成 "UnknownError"）；且 run 的 message 位置参数会被当文件解析（报 File not found），须用 `--command`。mimo 目检一律走 curl/脚本直连 zen API。若日后 CLI 可用：`opencode run -m opencode/mimo-v2.5-free --command "<prompt>" -f <img>` 且 NO_PROXY 须去掉 opencode.ai
- **验收衔接**：模式 B 技术指标（规格/亮度/水印/帧差）+ mimo 语义目检（手/脸/军装/反差）双保险；mimo 判定结果记入 prompts.json，替代「待人工目检」占位（模式 A 优先于一切目检结论）


## 交付前验收清单（逐条自检）

### 模式 A：视觉模型可用时（优先执行）
- [ ] **关键帧目检**：逐张读取关键帧，检查——人物形变（手/脸/体态）、构图质量（主体位置/视觉引导线）、风格一致性（多帧色彩/光影/角色造型统一）、有无乱码文字、美感打分（1-10）
- [ ] **多帧一致性对比**：并列对比关键帧，检查角色造型/场景风格/色彩是否一致；发现不一致时记录（如「S2 老虎体型偏小」），记入 prompts.json 便于定向重抽
- [ ] **成片抽帧目检**：抽取成片 3-5 个时间点的帧（含转场点），检查跳变/黑屏/字幕渲染
- [ ] 规格校验：ffprobe 确认时长/分辨率/帧率/编码；字幕按时间点抽帧验证渲染
- [ ] 目检结果记入 prompts.json（每张关键帧：评分 + 发现的问题 + 是否需要重抽）

### 模式 B：视觉模型不可用时（降级方案）
- [ ] **技术指标替代**：字幕存在性用「白色像素统计」（ffmpeg 抽帧 + 纯 Python 统计 R/G/B>200 像素数，每段字幕区域有数千以上白像素）；规格用 ffprobe（时长/分辨率/帧率/编码）
- [ ] **转场自检**：抽相邻帧对比亮度差（<12% 无跳变/黑屏，2026-08-24 实测方法）
- [ ] **形变/跳变**：技术指标无法判断——需标注「技术指标正常，建议人工过目确认构图形变」
- [ ] **mimo 语义目检（可选补充）**：模式 B 下运行 `inspect_frames.sh`（见「多模态目检补充链路」）对关键帧/抽帧逐项断言（手/脸/军装/反差/水印），结果记入 prompts.json；模式 A 不可用时的观感项以此代替「待人工目检」占位
- [ ] 技术指标结果记入 prompts.json（白像素数/亮度差/ffprobe 规格）

### 通用项（两种模式均执行）
- [ ] 记录：prompts.json 完整（每图每段：prompt/模型/参数/seed）/ 成片清单含路径与规格
- [ ] 复现验证：图片阶段——关键帧同 seed 复抽 1 次对比（成本低，默认执行；2026-08-24 实测 MD5 可完全一致）；视频阶段——按需/抽样（高成本，仅在关键镜头或客户要求时启用）；结果记入 prompts.json
- [ ] 降级：若发生降级（占位/分镜替代/ti2vid 降为文生视频），已如实交代并说明补位状态
- [ ] 合规：无肖像冒充 / 无版权 IP / 无违禁内容 / 商用条款已确认

### 验收模式选择规则
- 协调官每轮任务启动时检查当前模型是否支持读图（`read_image` 工具可用→模式 A；否则→模式 B）
- 同一任务中模型可能变化（如中途切换）——以关键帧验收时的实际能力为准
- 模式 A 的目检结果优先级高于模式 B 的技术指标——目检发现问题时，技术指标可作为佐证
- 两种模式的检查结果都写入 prompts.json，便于事后追溯（「当时用视觉模型目检，评分 8/10」或「当时无视觉模型，技术指标正常」）
