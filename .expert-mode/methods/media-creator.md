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
- **生视频（异步）**：`POST /v1/videos`，模型 `agnes-video-v2.0`，参数 `prompt/mode=ti2vid/width/height/num_frames(≤441 且 8n+1)/frame_rate(1-60)/seed/negative_prompt`；ti2vid 首帧用 `image` 字段传 **base64**（文件路径无效）；**国内站文生视频 = 省略 mode 字段**（国内站 mode 只接受 keyframes 且需 2-3 图，t2v/ti2vid 均不识别）；返回 `video_id`；轮询 **必须在提交时的同站点** 查询：国际站提交 → `GET https://apihub.agnes-ai.com/agnesapi?video_id=<ID>`，国内站提交 → `GET https://apihub.agnes-ai.cn/agnesapi?video_id=<ID>`（跨站查询会 429，实测 2026-08-24；**用 video_id 不用 task_id**）→ completed 后 `metadata.url`（MP4 直链）
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
  -d "{\"model\":\"agnes-video-v2.0\",\"prompt\":\"<完整提示词>\",\"mode\":\"ti2vid\",\"image\":\"$IMG_B64\",\"width\":720,\"height\":1280,\"num_frames\":121,\"frame_rate\":24,\"seed\":<seed<1000>}"
# 1b) 文生视频（国内站，省略 mode，无需 image）：
# curl ... https://apihub.agnes-ai.cn/v1/videos -d '{"model":"agnes-video-v2.0","prompt":"...","width":720,"height":1280,"num_frames":121,"frame_rate":24,"seed":<seed<1000>}'
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

## 交付前验收清单（逐条自检）
- [ ] 图片：分辨率达标 / 风格一致 / 无畸形（手/脸/文字） / 无乱码文字 / 商用授权确认
- [ ] 视频：时长达标（±10%） / 帧率稳定 / 清晰度达标 / 镜头无跳变闪烁 / 音画字幕同步 / 水印合规
- [ ] 转场自检：抽相邻帧对比亮度差（<12% 无跳变/黑屏，2026-08-24 实测方法）；字幕按时间点抽帧验证渲染
- [ ] 无法目检时的技术验证（模型不支持读图时）：字幕存在性用「白色像素统计」（ffmpeg 抽帧 + 纯 Python 统计 R/G/B>200 像素数，四段字幕均有数千以上白像素）；规格用 ffprobe（时长/分辨率/帧率/编码）；形变/跳变需人工或换图模型复核
- [ ] 记录：prompts.json 完整（每图每段：prompt/模型/参数/seed）/ 成片清单含路径与规格
- [ ] 复现验证：图片阶段——关键帧同 seed 复抽 1 次对比（成本低，默认执行；2026-08-24 实测 MD5 可完全一致）；视频阶段——按需/抽样（高成本，仅在关键镜头或客户要求时启用）；结果记入 prompts.json
- [ ] 降级：若发生降级（占位/分镜替代），已如实交代并说明补位状态
- [ ] 合规：无肖像冒充 / 无版权 IP / 无违禁内容 / 商用条款已确认

## 平台适配速查
- 抖音 9:16 1080×1920；小红书 3:4/1:1；B站 16:9；信息流 1:1/9:16
- 15s 视频 3-5 镜头、单镜头 3-5s、前 2s 出钩子
- 重要文字（标题/价格）一律后期叠加，不在生图里生成（易乱码）

## 通用经验
- 好成片 70% 在分镜与提示词，先想清楚画面再调用模型
- 一致性比单张惊艳更重要，系列素材统一风格词；seed 必记录，返工可复现
- 模型产出的文字易乱码，重要文字一律后期加
- 合规红线：不生成真实人物肖像冒充（尤其公众人物）、不生成受版权保护的 IP/商标角色、不生成违禁内容；商用前确认模型服务条款允许商用

## 10s 短视频帧数分配（2026-08-24 实测方案）
- 分镜 4 镜头 → 帧数 41/81/81/41（1.7s/3.4s/3.4s/1.7s @24fps），素材总 10.17s，转场（xfade 0.4s×3 重叠）后 ≈ 9.0s 成片，±10% 达标
- 钩子镜头（1）和点睛镜头（4）用 41 帧（短促有力），叙事中段（2/3）用 81 帧（充分展开）
- 多个视频任务**并行提交**：payload 按 NAME 写独立 JSON 文件（`--data-binary @file` 避免 Argument list too long），提交后统一轮询
- 成片字幕按**时间点抽帧验证**（check_*.png）：每个字幕区间起点/终点抽帧，白像素统计确认渲染，不漏检
