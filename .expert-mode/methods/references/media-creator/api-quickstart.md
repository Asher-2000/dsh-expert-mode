# Api Quickstart

## Agnes API 调用速查（已实测 2026-08-22，2026-08-24 更新）
- **Base URL**：`https://apihub.agnes-ai.com/v1`（OpenAI 兼容）或**国内镜像 `https://apihub.agnes-ai.cn/v1`**（同一 API Key 通用，官方公告确认；两站接口存在差异，422 时切换重试），认证 `Authorization: Bearer <key>`
- **API Key**：`<API_KEY_FILE>`（0600 文件），用 `KEY=$(cat <API_KEY_FILE>)` 读取；**禁止**把 key 写进提示词、命令回显、日志；不回显 key 值
- **生图（同步）**：`POST /v1/images/generations`，模型 `agnes-image-2.0-flash`（快速，推荐）/ `agnes-image-2.1-flash`（高密度复杂构图），参数 `prompt/seed/n`；**`size` 参数在国际站 422（2026-08-24 实测），国内站支持**；不带 size 默认输出 1024×1024；响应 `data[0].url` 或 `b64_json`
- **生视频 v2.0 旧模板（仅用于 `agnes-video-v2.0`，2026-08-26 起默认改用 2.5-flash）**：`POST /v1/videos`，参数 `prompt/mode=ti2vid/width/height/num_frames(≤441 且 8n+1)/frame_rate(1-60)/seed/negative_prompt`；ti2vid 首帧用 `image` 字段传 **base64**（文件路径无效）；**国内站文生视频 = 省略 mode 字段**（国内站 mode 只接受 keyframes 且需 2-3 图，t2v/ti2vid 均不识别）；返回 `video_id`；轮询 **必须在提交时的同站点** 查询：国际站提交 → `GET https://apihub.agnes-ai.com/agnesapi?video_id=<ID>`，国内站提交 → `GET https://apihub.agnes-ai.cn/agnesapi?video_id=<ID>`（跨站查询会 429，实测 2026-08-24；**用 video_id 不用 task_id**）→ completed 后 `metadata.url`（MP4 直链）
- **生视频 `agnes-video-2.5-flash` 官方 schema（2026-08-26 实测，默认优先）**：`POST https://apihub.agnes-ai.com/v1/videos`；`mode`=**`text`**（文生）| **`keyframe`**（图生首帧锚定，注意是**单数**）| **`reference`**（参考图）；图生首帧用 **`first_frame` 传图片公网 URL**（**不接受** base64 `image` 字段）；`size` 字符串 **`"720P"`**（数字 `width`/`height`、`num_frames`、`frame_rate`、`negative_prompt` 均为 **forbidden 字段**，提交即 400）；`aspect_ratio`：`"9:16"`/`"16:9"`；`seconds`：字符串 `"4"`-`"12"`；seed 官方文档未列但实测可传（兼容 <1000）；**负面约束无字段可传 → 内联进 prompt**（「画面严禁出现：…」）；轮询：`GET https://apihub.agnes-ai.com/agnesapi?video_id=<ID>&model_name=agnes-video-2.5-flash`（**keyframe 模式轮询必须带 model_name**）→ 直链在顶层 `url`；官方文档：`https://agnes-ai.com/zh-Hans/docs/agnes-video-25-flash`；720P 现价 $0/秒（限时免费，商用条款以官方为准）
- **时长**：`seconds = num_frames/frame_rate`；@24fps 下 41帧=1.71s / 81帧=3.375s / 121帧=5.04s / 241帧=10.04s / 441帧=18.38s（旧表「81帧=3s」为约数，精确值以 帧数/24 为准）；分辨率 480p/720p/1080p 自动归一化，画幅 16:9 / 9:16 / 1:1 / 4:3 / 3:4
- **常见错误**：401 鉴权（key 错）→ 检查 key 文件；**422 参数错误（detail 被吞）→ 排查顺序：先查 `seed`（已实测 `seed>=1000` 稳定触发 422，用 <1000），再查 `size`（国际站带 size 422，移除 size 或切国内站端点）**；间歇性 422 也可能是限流伪装，冷却 20-90s 单发可恢复**；429 限流（免费档生视频约 1 RPM）→ 退避重试 ≤3 次；5xx → 服务端重试；`fail_to_fetch_task` → 解析嵌套 message；**同步 curl 偶发 60s+ 无响应 → 拆成后台作业重试**（免费档排队不稳定）
- **代理**：环境有 HTTP_PROXY=<PROXY_ADDR>；外部 API 走代理（curl 显式 `-x` 或 NODE_USE_ENV_PROXY=1），本地地址 `--noproxy`；无代理直连 apihub 也可通（`--noproxy '*'` 实测 OK）


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
# 【2.5-flash keyframe 图生（2026-08-26 实测，默认）】
#   首帧需公网 URL（先用生图拿到图片 URL，或上传后取 URL）；size 用字符串；无 negative_prompt 字段 → 负面内联进 prompt
curl -sS --max-time 120 -x http://<PROXY_ADDR> \
  https://apihub.agnes-ai.com/v1/videos \
  -H "Authorization: Bearer $KEY" -H "Content-Type: application/json" \
  -d '{"model":"agnes-video-2.5-flash","prompt":"<完整提示词，末尾加：画面严禁出现：手部畸形、脸部崩坏、文字水印等>","mode":"keyframe","first_frame":"<关键帧公网URL>","size":"720P","aspect_ratio":"9:16","seconds":"8","seed":<seed<1000>}'
# 2.5-flash 轮询：必须带 model_name
curl -sS -x http://<PROXY_ADDR> "https://apihub.agnes-ai.com/agnesapi?video_id=<VIDEO_ID>&model_name=agnes-video-2.5-flash" \
  -H "Authorization: Bearer $KEY"
# completed 后取顶层 url 下载 MP4 -> output/media/<task>/videos/

# ---- 以下为 v2.0 旧模板（仅当 v2.0 模型时使用；2.5-flash 传这些字段会 400）----
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
