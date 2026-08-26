# 生图短视频专家方法论

## 核心职责
接收创意描述，走完整多媒体生产流水线：需求澄清 → 创意拆解 → 分镜 → 生图（prompt 工程）→ 生视频 → 成片自检 → 交付。产出可直接发布的图片/视频文件 + 完整生成记录。

## 生产流程
1. **需求澄清** - 明确用途（宣传/种草/封面/信息流）、平台（抖音/小红书/B站/私域）、时长、画幅（9:16/1:1/16:9）、风格、数量、是否商用；缺失关键项必须先问，不臆造
2. **创意拆解** - 将创意描述拆成 3-5 个关键画面（景别/主体/环境/动作/情绪），形成分镜表
3. **分镜** - 每镜头配：画面描述 + 旁白/字幕文案 + 时长；片头 0-2s 出钩子，片尾留 CTA；重要文字（标题/价格）不在生图里生成，留给后期剪辑
4. **生图提示词（prompt 工程）** - 结构化提示词：`[主体]+[场景环境]+[风格]+[光线]+[构图/镜头]+[画质词]+[负面词]`；系列素材固定风格词与角色描述，优先图生图/参考图保证一致性，记录 seed；首张样图先确认方向再批量
5. **生视频提示词** - 优先图生视频（以通过检查的关键帧为首帧）：`[首帧]+[运动描述：起幅→过程→落幅]+[时长/帧率/分辨率]+[风格一致]+[负面词]`；文生视频（省略 mode）作为无关键帧或队列满时的有效备选（2026-08-24 实测国内站文生视频质量达标可交付）
6. **成片自检 + 交付** - 逐镜头检查（手/脸/文字形变、镜头跳变、清晰度、音画同步），不合格定位到具体镜头重生成，不整体重跑；输出成片清单 + 生成记录

## Agnes API 调用速查（已实测 2026-08-22，2026-08-24 更新）
- **Base URL**：`https://apihub.agnes-ai.com/v1`（OpenAI 兼容）或**国内镜像 `https://apihub.agnes-ai.cn/v1`**（同一 API Key 通用，官方公告确认；两站接口存在差异，422 时切换重试），认证 `Authorization: Bearer <key>`
- **API Key**：`<API_KEY_FILE>`（0600 文件），用 `KEY=$(cat <API_KEY_FILE>)` 读取；**禁止**把 key 写进提示词、命令回显、日志；不回显 key 值
- **生图（同步）**：`POST /v1/images/generations`，模型 `agnes-image-2.0-flash`（快速，推荐）/ `agnes-image-2.1-flash`（高密度复杂构图），参数 `prompt/seed/n`；**`size` 参数在国际站 422（2026-08-24 实测），国内站支持**；不带 size 默认输出 1024×1024；响应 `data[0].url` 或 `b64_json`
- **生视频（异步）**：`POST /v1/videos`，模型 `agnes-video-2.5-flash`，参数 `prompt/mode=ti2vid/width/height/num_frames(≤441 且 8n+1)/frame_rate(1-60)/seed/negative_prompt`；ti2vid 首帧用 `image` 字段传 **base64**（文件路径无效）；**国内站文生视频 = 省略 mode 字段**（国内站 mode 只接受 keyframes 且需 2-3 图，t2v/ti2vid 均不识别）；返回 `video_id`；轮询 **必须在提交时的同站点** 查询：国际站提交 → `GET https://apihub.agnes-ai.com/agnesapi?video_id=<ID>`，国内站提交 → `GET https://apihub.agnes-ai.cn/agnesapi?video_id=<ID>`（跨站查询会 429，实测 2026-08-24；**用 video_id 不用 task_id**）→ completed 后 `metadata.url`（MP4 直链）
- **时长**：`seconds = num_frames/frame_rate`；@24fps 下 41帧=1.71s / 81帧=3.375s / 121帧=5.04s / 241帧=10.04s / 441帧=18.38s（旧表「81帧=3s」为约数，精确值以 帧数/24 为准）；分辨率 480p/720p/1080p 自动归一化，画幅 16:9 / 9:16 / 1:1 / 4:3 / 3:4
- **常见错误**：401 鉴权（key 错）→ 检查 key 文件；**422 参数错误（detail 被吞）→ 排查顺序：先查 `seed`（已实测 `seed>=1000` 稳定触发 422，用 <1000），再查 `size`（国际站带 size 422，移除 size 或切国内站端点）**；间歇性 422 也可能是限流伪装，冷却 20-90s 单发可恢复**；429 限流（免费档生视频约 1 RPM）→ 退避重试 ≤3 次；5xx → 服务端重试；`fail_to_fetch_task` → 解析嵌套 message；**同步 curl 偶发 60s+ 无响应 → 拆成后台作业重试**（免费档排队不稳定）
- **代理**：环境有 HTTP_PROXY=<PROXY_ADDR>；外部 API 走代理（curl 显式 `-x` 或 NODE_USE_ENV_PROXY=1），本地地址 `--noproxy`；无代理直连 apihub 也可通（`--noproxy '*'` 实测 OK）

## seed 复现性实测结论（2026-08-24）
- **图像模型同 seed 完全复现**：同 prompt + 同 seed=42 两次调用，下载文件 MD5 完全一致（773f0427...），字节级相同（即使 CDN URL 不同）
- **结论**：seed 是可靠的一致性锚点；关键帧/系列图同 seed 可复现，返工可精确重抽
- **注意**：seed 复现依赖「同模型版本 + 同服务端」，服务升级后需重新验证；视频长序列采样维度高，seed 确定性弱于图像，必须叠加「首帧锚定」（ti2vid）双保险

## 调用模板

### 生图（curl）
```bash
KEY=$(cat <API_KEY_FILE>)
mkdir -p output/media/<task>/images
# 2026-08-24 实测：国际站不带 size（默认 1024x1024 方图）稳定；竖屏用国内站 + size
# seed 必须 <1000（seed>=1000 触发 422）；请求间隔 ≥20-90s 防限流伪装 422
curl -sS --max-time 120 -x http://<PROXY_ADDR> \
  https://apihub.agnes-ai.com/v1/images/generations \
  -H "Authorization: Bearer $KEY" -H "Content-Type: application/json" \
  -d '{"model":"agnes-image-2.0-flash","prompt":"<完整提示词>","seed":<seed<1000>}' \
  | tee /tmp/img_resp.json | python3 -c 'import json,sys;print(json.load(sys.stdin)["data"][0].get("url") or "b64")'
# 竖屏（国内站）：
# curl ... https://apihub.agnes-ai.cn/v1/images/generations -d '{"model":"agnes-image-2.0-flash","prompt":"...","size":"720x1280","seed":<seed<1000>}'
# 下载：curl -o output/media/<task>/images/<name>.png <url>
```

### 生视频（异步提交 + 轮询）
```bash
KEY=$(cat <API_KEY_FILE>)
# 1) ti2vid 提交（国际站；num_frames 满足 8n+1；9:16 用 720x1280，16:9 用 1152x768）
#    image 字段必传 base64（首帧图），缺了会 422
IMG_B64=$(base64 -w0 < output/media/<task>/images/<keyframe>.png)
curl -sS --max-time 120 -x http://<PROXY_ADDR> \
  https://apihub.agnes-ai.com/v1/videos \
  -H "Authorization: Bearer $KEY" -H "Content-Type: application/json" \
  -d "{\"model\":\"agnes-video-2.5-flash\",\"prompt\":\"<完整提示词>\",\"mode\":\"ti2vid\",\"image\":\"$IMG_B64\",\"width\":720,\"height\":1280,\"num_frames\":121,\"frame_rate\":24,\"seed\":<seed<1000>}"
# 1b) 文生视频（国内站，省略 mode，无需 image）：
# curl ... https://apihub.agnes-ai.cn/v1/videos -d '{"model":"agnes-video-2.5-flash","prompt":"...","width":720,"height":1280,"num_frames":121,"frame_rate":24,"seed":<seed<1000>}'
# 2) 轮询（video_id 来自上一步响应；按提交站选轮询端点）
curl -sS -x http://<PROXY_ADDR> "https://apihub.agnes-ai.com/agnesapi?video_id=<VIDEO_ID>" \
  -H "Authorization: Bearer $KEY"
# 国内站提交则轮询：https://apihub.agnes-ai.cn/agnesapi?video_id=<VIDEO_ID>
# completed 后取 metadata.url 下载 MP4 到 output/media/<task>/videos/
```

## 输出格式
- **分镜脚本（表格）**：镜头号/时长/景别/画面描述/旁白字幕/生图提示词/生视频提示词
- **图片交付**：分辨率、格式（PNG/JPG/WebP）、风格一致性说明、seed
- **视频交付**：时长/帧率/分辨率/格式（MP4）、是否含字幕水印、seed
- **生成记录**：完整提示词 + 模型 + 参数 + seed，逐条列出（写入 output/media/<task>/prompts.json），便于返工复现

## 失败兜底（禁止假装成功）
- **限流/配额（429/quota）**：退避重试 ≤3 次 → 仍失败则**如实告知**，交付降级产物：分镜脚本 + 完整提示词 + 构图说明，注明「媒体待配额恢复后生成」
- **生图 422 连发**：优先查 seed（≥1000 必 422，用 <1000）；再查 size（国际站 422，切国内站）；间歇 422 是限流伪装 → 冷却 20-90s 单发
- **视频队列满（video_queue_full）**：**双端点切换**——国内站满切国际站、国际站满切国内站（2026-08-24 实测有效），间隔 15s 重试 ≤5 次
- **超时/服务端（5xx/网络）**：重试 ≤2 次（指数退避）→ 失败如实上报，不编造成片
- **生视频排队 >5 分钟**：检查接口（video_id 查询、端点、mode 参数）——用户提示「>5 分钟大概率接口搞错了」；确属服务端慢则先交付分镜 + 关键帧图 + video_id，稍后凭 video_id 续查
- **内容不合格**：定位到具体镜头/图片重生成（换 seed），不整体重跑；连续 2 次不合格 → 降级交付分镜脚本

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
- **响应**：`choices[0].message.content` = 结论（中文逐项【通过/不通过】+理由），`message.reasoning` = 思考过程；判定以 content 为准（finish_reason=stop 为完整）
- **一键脚本**：`inspect_frames.sh <img1> <img2> ...` → 逐帧质检（Go 订阅端点 + mimo-v2.5，key 读 auth.json、代理+非流式、非 200 冷却 30s 重试 ≤3 次；`OC_MODEL` 可换模型），输出 `output/media/<task>/inspection/results.jsonl`，末尾打印 ALL-PASS/FAIL 汇总
- **限流**：免费档约 1 RPM，连续请求会 429；批量目检建议帧间隔 ≥60s，失败按 30-60s 冷却重试（脚本已内置冷却重试，必要时调大间隔）
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

## 平台适配速查
- 抖音 9:16 1080×1920；小红书 3:4/1:1；B站 16:9；信息流 1:1/9:16
- 15s 视频 3-5 镜头、单镜头 3-5s、前 2s 出钩子
- **文字策略（2026-08-25 修订）**：生图阶段一律禁止文字（易乱码）；**后期字幕/标题默认不主动添加**——仅在用户明确要求时才叠加（避免遮挡画面、破坏电影感、风格漂移）。

## 通用经验
- 好成片 70% 在分镜与提示词，先想清楚画面再调用模型
- 一致性比单张惊艳更重要，系列素材统一风格词；seed 必记录，返工可复现
- 模型产出的文字易乱码，生图阶段一律禁止；后期字幕/标题遵循「**不主动添加，用户要求才加**」（2026-08-25 修订）
- 合规红线：不生成真实人物肖像冒充（尤其公众人物）、不生成受版权保护的 IP/商标角色、不生成违禁内容；商用前确认模型服务条款允许商用

## 10s 短视频帧数分配（2026-08-24 实测方案）
- 分镜 4 镜头 → 帧数 41/81/81/41（1.7s/3.4s/3.4s/1.7s @24fps），素材总 10.17s，转场（xfade 0.4s×3 重叠）后 ≈ 9.0s 成片，±10% 达标
- 钩子镜头（1）和点睛镜头（4）用 41 帧（短促有力），叙事中段（2/3）用 81 帧（充分展开）
- 多个视频任务**并行提交**：payload 按 NAME 写独立 JSON 文件（`--data-binary @file` 避免 Argument list too long），提交后统一轮询
- 成片字幕按**时间点抽帧验证**（check_*.png）：每个字幕区间起点/终点抽帧，白像素统计确认渲染，不漏检
