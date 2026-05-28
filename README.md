# SeeDance 2.0 生成台

这是一个最小可用的视频生成网站示例。浏览器只访问本地后端，真正的
`https://<YOUR_RELAY_BASE_URL>`（中转站地址）和中转站密钥只在服务端使用。

## 中转站接口

- 创建任务：`POST https://<YOUR_RELAY_BASE_URL>/v1/video/generations`
- 查询任务：`GET https://<YOUR_RELAY_BASE_URL>/v1/video/generations/:task_id`
- 鉴权：`Authorization: Bearer <sk>`

## 素材接口

素材请求继续走中转站主机，并通过 `ARK_ASSET_API_PREFIX` 指定素材路由前缀，默认是 `/v1/ark/assets`（API Token 模式）。
`ARK_ASSET_API_STYLE` 默认 `path`，即调用 `/v1/ark/assets/{Action}`。如需兼容 `?Action=...&Version=...` 形式可改为 `query`。
素材请求必须带 `channel_id`（Query）或 `X-Ark-Channel-Id`（Header）。

## 配置

复制 `.env.example` 为 `.env`，填入你的中转站密钥：

```env
SEEDANCE_API_KEY=sk-your-api-token
SEEDANCE_BASE_URL=https://<YOUR_RELAY_BASE_URL> # 中转站地址
ARK_ASSET_API_PREFIX=/v1/ark/assets
ARK_ASSET_API_STYLE=path
SEEDANCE_STANDARD_MODEL=dreamina-seedance-2-0-260128
SEEDANCE_FAST_MODEL=dreamina-seedance-2-0-fast-260128
SEEDANCE_DEFAULT_PROFILE=fast
SEEDANCE_TIMEOUT_SECONDS=120
SEEDANCE_DEBUG_HTTP=true
SEEDANCE_DEBUG_SHOW_TOKEN=false
SEEDANCE_USER_AGENT=PostmanRuntime/7.43.0
```

> 注意：不要把 `.env` 提交到 GitHub。仓库只应保留 `.env.example` 作为配置模板。

## 启动

```bash
python main.py
```

也可以在 PowerShell 里执行：

```powershell
.\run.ps1
```

打开：

```text
http://127.0.0.1:8000
```

## 模型

页面内置两个模型：

- `Standard SeeDance`
- `Fast SeeDance`

页面只显示友好名称，真实模型 ID 在 `.env` 里映射：

- `SEEDANCE_STANDARD_MODEL`
- `SEEDANCE_FAST_MODEL`

默认选中项由 `.env` 里的 `SEEDANCE_DEFAULT_PROFILE` 控制，可填 `standard` 或 `fast`。

生成参数下拉框参考 Seedance 文档：

- `ratio`：`adaptive`、`21:9`、`16:9`、`4:3`、`1:1`、`3:4`、`9:16`
- `resolution`：`480p`、`720p`、`1080p`。Fast 模型不支持 `1080p`，页面会自动置灰
- `duration`：Seedance 2.0 / Fast 支持 `4-15` 秒

## 请求体适配

后端会组装并转发这些字段：

- 顶层：`model`、`prompt`、`images`、`duration`、`resolution`、`width`、`height`、`fps`、`seed`、`n`、`response_format`、`user`
- 扩展：`metadata`

`metadata` 里还可以带：

- `referenceVideoUrls`: 参考视频 URL 数组
- `referenceAudioUrls`: 参考音频 URL 数组
- `generate_audio`: 是否生成音频

创建视频时，页面会把“图片 URL / Base64”和本地上传图片作为图片输入：单张图片发送到顶层 `image` 字段，多张图片发送到顶层 `images` 数组。通过 `CreateAsset` 审核通过后的 `assetId` 可以填到“参考素材 ID”里，并选择 `image_url` / `video_url` / `audio_url` 类型；提交时会包装到 `metadata.content`，例如：

```json
{
  "metadata": {
    "content": [
      {
        "type": "video_url",
        "video_url": {
          "url": "asset://asset-20260318071009-abc"
        }
      }
    ]
  }
}
```

默认页面只会发送接近 Postman 成功示例的字段：

```json
{
  "model": "dreamina-seedance-2-0-260128",
  "prompt": "一辆汽车乘风破浪，冲向悉尼歌剧院",
  "duration": 4,
  "resolution": "720p"
}
```

`width`、`height`、`fps`、`seed`、`n`、`response_format`、`user` 等字段只有填写后才会发送。

页面里的 `Metadata JSON` 会作为 `metadata` 字段发送。比如：

```json
{
  "negative_prompt": "模糊",
  "style": "cinematic",
  "quality_level": "high"
}
```

页面里的“高级 JSON 参数”会直接合并到最终请求体。
如果高级 JSON 里写了同名字段，会覆盖页面表单组装出来的字段。

## 产品化建议

这个版本适合验证接口和演示流程。正式售卖前建议继续加：

- 用户登录
- 点数扣费
- 任务入库
- 并发限制
- 视频保存到 OSS/R2/COS
- 支付和订单系统
- 内容审核和失败退款策略

## 支持项目

如果这个示例对你有帮助，可以通过邀请链接注册中转站：
[Register with invite](https://www.168token.ai/register?ref=3wkrxnaelx)

## License

MIT License. See [LICENSE](./LICENSE) for details.
