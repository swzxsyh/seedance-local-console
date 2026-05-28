const form = document.querySelector("#generateForm");
const submitButton = document.querySelector("#submitButton");
const pollButton = document.querySelector("#pollButton");
const taskIdInput = document.querySelector("#taskId");
const videoSlot = document.querySelector("#videoSlot");
const videoDrawer = document.querySelector("#videoDrawer");
const resultShowcase = document.querySelector("#resultShowcase");
const showcaseCopy = document.querySelector("#showcaseCopy");
const endpoint = document.querySelector("#endpoint");
const statusBanner = document.querySelector("#statusBanner");
const taskStatus = document.querySelector("#taskStatus");
const resultSummary = document.querySelector("#resultSummary");
const durationPreset = document.querySelector("#durationPreset");
const customDuration = document.querySelector("#customDuration");
const imageFiles = document.querySelector("#imageFiles");
const imagePreview = document.querySelector("#imagePreview");
const advancedToggle = document.querySelector("#advancedToggle");
const advancedPanel = document.querySelector("#advancedPanel");
const langToggle = document.querySelector("#langToggle");
const langLabel = document.querySelector("#langLabel");
const langOptions = document.querySelector("#langOptions");
const uploadModeButton = document.querySelector("#uploadModeButton");
const urlModeButton = document.querySelector("#urlModeButton");
const uploadPanel = document.querySelector("#uploadPanel");
const urlPanel = document.querySelector("#urlPanel");
const assetChannelId = document.querySelector("#assetChannelId");
const assetGroupId = document.querySelector("#assetGroupId");
const assetId = document.querySelector("#assetId");
const assetActionSelect = document.querySelector("#assetActionSelect");
const assetActionHint = document.querySelector("#assetActionHint");
const assetActionBadge = document.querySelector("#assetActionBadge");
const assetActionUses = document.querySelector("#assetActionUses");
const assetActionParams = document.querySelector("#assetActionParams");
const runAssetActionButton = document.querySelector("#runAssetActionButton");
const assetAuditBanner = document.querySelector("#assetAuditBanner");
const assetAuditOutput = document.querySelector("#assetAuditOutput");
const assetAuditDrawer = document.querySelector("#assetAuditDrawer");

const MAX_IMAGES = 12;
let pollTimer = null;
let uploadedImages = [];
let currentLang = localStorage.getItem("seedance_lang") || "zh";
let poweredHost = "SeeDance";

const i18n = {
  zh: {
    pageTitle: "SeeDance 2.0 生成台",
    heroTitle: "想创作什么视频？",
    heroSubtitle: "输入你的想法，上传参考图，选择比例和时长后提交生成任务。",
    tipPromptTitle: "提示词可以写清楚画面主体、镜头运动、光线和风格。",
    tipPromptBody: "例如：雨夜霓虹街道，一位舞者跳现代舞，电影感，稳定镜头，细腻光影。",
    tipImageTitle: "图片最多 12 张。",
    tipImageBody: "可以上传参考图，也可以在输入框里每行粘贴一个图片 URL 或 Base64。",
    addImage: "继续添加图片",
    generationResult: "生成结果",
    videoEmpty: "任务完成后，视频会显示在这里。",
    taskStatusLabel: "任务状态:",
    waitingSubmit: "等待提交任务",
    taskIdLabel: "任务ID:",
    taskIdPlaceholder: "提交后自动填入，也可以手动粘贴",
    queryOnce: "查询一次",
    status: "状态",
    task: "任务",
    video: "视频",
    pendingSubmit: "待提交",
    none: "暂无",
    waitingGeneration: "等待生成",
    referenceContent: "参考内容",
    uploadMode: "上传",
    urlMode: "URL/Base64",
    imageUrlLabel: "图片 URL / Base64",
    referenceAssetType: "素材类型",
    assetReferenceGroup: "素材引用",
    mediaReferenceGroup: "媒体 URL",
    jsonAdvancedGroup: "JSON 扩展",
    assetTypeImage: "图片",
    assetTypeAudio: "音频",
    assetTypeVideo: "视频",
    referenceAssetIds: "参考素材 ID",
    referenceAssetIdsPlaceholder: "已审核通过的 assetId，每行一个，可选；提交时会包装为 asset://...",
    referenceVideoUrls: "参考视频 URL",
    referenceVideoUrlsPlaceholder: "参考视频 URL，每行一个，可选",
    referenceAudioUrls: "参考音频 URL",
    referenceAudioUrlsPlaceholder: "参考音频 URL，每行一个，可选",
    generateAudio: "生成音频",
    generateAudioHelp: "开启后会在 metadata 里写入 generate_audio: true",
    assetAuditTitle: "素材资源审核",
    assetAuditSubtitle: "按渠道拉取素材并核验 asset 资源是否可访问。",
    assetActionTitle: "允许的 Action",
    assetActionLabel: "Action",
    runAssetAction: "执行当前 Action",
    assetChannelId: "渠道 ID（必填）",
    assetChannelIdPlaceholder: "例如 10001",
    assetGroupId: "素材组信息（可选）",
    assetGroupIdPlaceholder: "用于筛选列表，留空即可",
    assetId: "素材 ID（可选）",
    assetIdPlaceholder: "例如 asset-20260318071009-abc",
    listAssets: "拉取素材资源",
    checkAsset: "核验素材可访问",
    assetAuditEmpty: "尚未执行审核操作。",
    assetAuditNeedChannel: "请先填写渠道 ID。",
    assetAuditNeedLocalFile: "请先选择本地图片文件。",
    assetAuditNeedImageFile: "仅支持图片文件上传。",
    assetAuditNeedField: "请先填写 {field}。",
    assetAuditNeedHttpUrl: "CreateAsset 仅支持 HTTP/HTTPS URL。",
    assetAuditLoadingAction: "正在执行当前 Action...",
    assetAuditActionDone: "Action 执行完成。",
    assetAuditLoadingCreate: "正在上传本地图片并创建素材...",
    assetAuditCreateDone: "CreateAsset 成功，已回填素材 ID。",
    assetAuditNeedId: "请先填写素材 ID。",
    assetAuditLoadingList: "正在拉取素材列表...",
    assetAuditLoadingCheck: "正在核验素材权限...",
    assetAuditListDone: "素材列表拉取完成。",
    assetAuditCheckDone: "素材核验完成，可访问。",
    assetAuditFailed: "素材审核失败：{message}",
    prompt: "提示词",
    promptPlaceholder: "上传最多 12 个参考素材，输入文字描述你想要的视频画面、镜头、光线、风格与节奏。",
    imagePlaceholder: "图片 URL / Base64，每行一个，可选",
    defaultRatio: "默认比例",
    ratioAdaptive: "adaptive 自适应",
    ratio169: "16:9 横屏",
    ratio916: "9:16 竖屏",
    ratio11: "1:1 方形",
    ratio43: "4:3 横屏",
    ratio34: "3:4 竖屏",
    ratio219: "21:9 宽屏",
    noResolution: "不传清晰度",
    defaultDuration: "默认时长",
    custom: "自定义",
    seconds: "秒数",
    advanced: "高级",
    fps: "帧率",
    optional: "可留空",
    randomOptional: "随机可留空",
    generationCount: "生成数量",
    width: "宽度",
    height: "高度",
    responseFormat: "响应格式",
    doNotSend: "不传",
    userId: "用户标识",
    userPlaceholder: "例如 user-1234，可留空",
    extraJson: "高级 JSON 参数",
    openVideo: "打开视频链接",
    downloadVideo: "下载视频",
    maxImages: "最多只能上传 {count} 张图片。",
    imageReadFailed: "图片读取失败：{message}",
    removeImage: "移除图片 {index}",
    requestFailed: "请求失败",
    upstreamStatus: "上游接口返回 {status}",
    mustBeObject: "{label} 必须是对象，例如 {example}",
    fillTaskId: "请先填写任务 ID。",
    querying: "正在查询任务状态...",
    receivedResponse: "已收到响应",
    progress: "进度",
    generated: "已生成",
    notReturned: "未返回",
    completed: "任务已完成",
    completedBanner: "视频生成完成，已展开结果预览。",
    failed: "任务生成失败",
    statusPrefix: "任务状态：{status}",
    receivedStatus: "已收到任务状态",
    submitting: "正在提交生成任务...",
    customDurationRequired: "选择自定义时长后，请填写秒数。",
    customDurationRange: "Seedance 2.0 时长范围为 4-15 秒。",
    tooManyImages: "图片最多支持 {count} 张，请减少后再提交。",
    submitted: "已提交",
    ratio: "比例",
    duration: "时长",
    defaultValue: "默认",
    images: "图片",
    imageCount: "{count} 张",
    unused: "未使用",
    submitSuccess: "任务提交成功，正在自动查询生成状态。",
    noTaskId: "任务已返回，但没有识别到 task_id。",
    submitFailedStatus: "提交失败",
    submitFailed: "提交失败：{message}",
    submitFailedHttp: "提交失败：{message}（HTTP {status}）",
    queryFailed: "查询失败：{message}",
    queryFailedHttp: "查询失败：{message}（HTTP {status}）",
    configLoadFailed: "配置加载失败：{message}",
    imageAlt: "上传图片 {index}",
    imageName: "图片 {index}"
  },
  en: {
    pageTitle: "SeeDance 2.0 Studio",
    heroTitle: "What video do you want to create?",
    heroSubtitle: "Describe your idea, upload references, choose ratio and duration, then submit a generation task.",
    tipPromptTitle: "A good prompt describes the subject, camera movement, lighting, and style.",
    tipPromptBody: "Example: a dancer on a rainy neon street, modern dance, cinematic look, stable camera, delicate lighting.",
    tipImageTitle: "Up to 12 images are supported.",
    tipImageBody: "Upload reference images, or paste one image URL / Base64 item per line in the input box.",
    addImage: "Add more images",
    generationResult: "Generation Result",
    videoEmpty: "The video will appear here when the task is complete.",
    taskStatusLabel: "Task Status:",
    waitingSubmit: "Waiting for submission",
    taskIdLabel: "Task ID:",
    taskIdPlaceholder: "Auto-filled after submission, or paste one manually",
    queryOnce: "Query once",
    status: "Status",
    task: "Task",
    video: "Video",
    pendingSubmit: "Pending",
    none: "None",
    waitingGeneration: "Waiting",
    referenceContent: "References",
    uploadMode: "Upload",
    urlMode: "URL/Base64",
    imageUrlLabel: "Image URL / Base64",
    referenceAssetType: "Asset type",
    assetReferenceGroup: "Asset references",
    mediaReferenceGroup: "Media URLs",
    jsonAdvancedGroup: "JSON extensions",
    assetTypeImage: "Image",
    assetTypeAudio: "Audio",
    assetTypeVideo: "Video",
    referenceAssetIds: "Reference asset IDs",
    referenceAssetIdsPlaceholder: "Approved assetId values, one per line; submitted as asset://...",
    referenceVideoUrls: "Reference video URLs",
    referenceVideoUrlsPlaceholder: "Reference video URL, one per line, optional",
    referenceAudioUrls: "Reference audio URLs",
    referenceAudioUrlsPlaceholder: "Reference audio URL, one per line, optional",
    generateAudio: "Generate audio",
    generateAudioHelp: "When enabled, generate_audio: true will be sent in metadata",
    assetAuditTitle: "Asset resource audit",
    assetAuditSubtitle: "List channel assets and verify whether an asset resource is accessible.",
    assetActionTitle: "Allowed actions",
    assetActionLabel: "Action",
    runAssetAction: "Run current action",
    assetChannelId: "Channel ID (required)",
    assetChannelIdPlaceholder: "e.g. 10001",
    assetGroupId: "Group info (optional)",
    assetGroupIdPlaceholder: "Used to filter lists, optional",
    assetId: "Asset ID (optional)",
    assetIdPlaceholder: "e.g. asset-20260318071009-abc",
    listAssets: "List image assets",
    checkAsset: "Verify asset access",
    assetAuditEmpty: "No audit action has been run yet.",
    assetAuditNeedChannel: "Please fill channel ID first.",
    assetAuditNeedLocalFile: "Please choose a local image file first.",
    assetAuditNeedImageFile: "Only image files are supported.",
    assetAuditNeedField: "Please fill {field} first.",
    assetAuditNeedHttpUrl: "CreateAsset only accepts HTTP/HTTPS URLs.",
    assetAuditLoadingAction: "Running the selected action...",
    assetAuditActionDone: "Action completed.",
    assetAuditLoadingCreate: "Uploading local image and creating asset...",
    assetAuditCreateDone: "CreateAsset succeeded. Asset ID has been filled.",
    assetAuditNeedId: "Please fill asset ID first.",
    assetAuditLoadingList: "Loading asset list...",
    assetAuditLoadingCheck: "Verifying asset access...",
    assetAuditListDone: "Asset list loaded.",
    assetAuditCheckDone: "Asset verified and accessible.",
    assetAuditFailed: "Asset audit failed: {message}",
    prompt: "Prompt",
    promptPlaceholder: "Upload up to 12 references and describe the scene, camera, lighting, style, and rhythm you want.",
    imagePlaceholder: "Image URL / Base64, one per line, optional",
    defaultRatio: "Default ratio",
    ratioAdaptive: "adaptive",
    ratio169: "16:9 Landscape",
    ratio916: "9:16 Portrait",
    ratio11: "1:1 Square",
    ratio43: "4:3 Landscape",
    ratio34: "3:4 Portrait",
    ratio219: "21:9 Cinema",
    noResolution: "No resolution",
    defaultDuration: "Default duration",
    custom: "Custom",
    seconds: "Seconds",
    advanced: "Advanced",
    fps: "FPS",
    optional: "Optional",
    randomOptional: "Random if empty",
    generationCount: "Count",
    width: "Width",
    height: "Height",
    responseFormat: "Response format",
    doNotSend: "Do not send",
    userId: "User ID",
    userPlaceholder: "e.g. user-1234, optional",
    extraJson: "Advanced JSON",
    openVideo: "Open video link",
    downloadVideo: "Download video",
    maxImages: "You can upload up to {count} images.",
    imageReadFailed: "Failed to read image: {message}",
    removeImage: "Remove image {index}",
    requestFailed: "Request failed",
    upstreamStatus: "Upstream returned {status}",
    mustBeObject: "{label} must be an object, e.g. {example}",
    fillTaskId: "Please enter a task ID first.",
    querying: "Querying task status...",
    receivedResponse: "Response received",
    progress: "Progress",
    generated: "Generated",
    notReturned: "Not returned",
    completed: "Task completed",
    completedBanner: "Video generation completed. Preview expanded.",
    failed: "Task generation failed",
    statusPrefix: "Task status: {status}",
    receivedStatus: "Task status received",
    submitting: "Submitting generation task...",
    customDurationRequired: "Please enter seconds after selecting custom duration.",
    customDurationRange: "Seedance 2.0 duration must be 4-15 seconds.",
    tooManyImages: "Up to {count} images are supported. Please remove some before submitting.",
    submitted: "Submitted",
    ratio: "Ratio",
    duration: "Duration",
    defaultValue: "Default",
    images: "Images",
    imageCount: "{count} images",
    unused: "Unused",
    submitSuccess: "Task submitted. Auto-querying generation status.",
    noTaskId: "Task returned, but no task_id was detected.",
    submitFailedStatus: "Submit failed",
    submitFailed: "Submit failed: {message}",
    submitFailedHttp: "Submit failed: {message} (HTTP {status})",
    queryFailed: "Query failed: {message}",
    queryFailedHttp: "Query failed: {message} (HTTP {status})",
    configLoadFailed: "Failed to load config: {message}",
    imageAlt: "Uploaded image {index}",
    imageName: "Image {index}"
  }
};

function t(key, values = {}) {
  const template = i18n[currentLang]?.[key] || i18n.zh[key] || key;
  return template.replace(/\{(\w+)\}/g, (_, name) => values[name] ?? "");
}

function applyI18n() {
  document.documentElement.lang = currentLang === "zh" ? "zh-CN" : "en";
  document.title = t("pageTitle");
  langLabel.textContent = getLanguageName(currentLang);

  document.querySelectorAll("[data-i18n]").forEach((node) => {
    node.textContent = t(node.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((node) => {
    node.placeholder = t(node.dataset.i18nPlaceholder);
  });
  endpoint.textContent = `Powered by ${poweredHost}`;
  document.querySelectorAll("[data-lang]").forEach((node) => {
    node.classList.toggle("active", node.dataset.lang === currentLang);
  });

  if (assetActionSelect) {
    renderAssetActionSelect();
    currentAssetAction = assetActionSelect.value || currentAssetAction;
    renderAssetActionPanel();
  }
}

langToggle.addEventListener("click", () => {
  const open = langOptions.hidden;
  langOptions.hidden = !open;
  langToggle.setAttribute("aria-expanded", String(open));
});

uploadModeButton.addEventListener("click", () => setImageInputMode("upload"));
urlModeButton.addEventListener("click", () => setImageInputMode("url"));

function setImageInputMode(mode) {
  const uploadMode = mode === "upload";
  uploadModeButton.classList.toggle("active", uploadMode);
  urlModeButton.classList.toggle("active", !uploadMode);
  uploadPanel.hidden = !uploadMode;
  urlPanel.hidden = uploadMode;
}

langOptions.addEventListener("click", (event) => {
  const button = event.target.closest("[data-lang]");
  if (!button) return;
  currentLang = button.dataset.lang;
  localStorage.setItem("seedance_lang", currentLang);
  langOptions.hidden = true;
  langToggle.setAttribute("aria-expanded", "false");
  applyI18n();
});

document.addEventListener("click", (event) => {
  if (event.target.closest("#langMenu")) return;
  langOptions.hidden = true;
  langToggle.setAttribute("aria-expanded", "false");
});

function getLanguageName(lang) {
  return {
    zh: "中文",
    en: "English"
  }[lang] || lang;
}

function localizedText(value) {
  if (typeof value === "string") return value;
  if (!value) return "";
  return value[currentLang] || value.zh || value.en || "";
}

const ASSET_ACTION_ORDER = [
  "CreateAssetGroup",
  "CreateAsset",
  "ListAssetGroups",
  "ListAssets",
  "GetAsset",
  "GetAssetGroup",
  "UpdateAssetGroup",
  "UpdateAsset",
  "DeleteAsset",
  "DeleteAssetGroup",
  "CreateVisualValidateSession",
  "GetVisualValidateResult",
];

const ASSET_ACTION_DEFINITIONS = {
  CreateAssetGroup: {
    tone: "emerald",
    label: { zh: "创建素材组", en: "Create asset group" },
    summary: {
      zh: "创建素材组；官方字段为 Name、Description、GroupType、ProjectName。",
      en: "Create an asset group with Name, Description, GroupType, and ProjectName.",
    },
    badge: { zh: "创建", en: "Create" },
    uses: ["channelId"],
    showLocalUpload: false,
    requiredBaseFields: [],
    fields: [
      { key: "Name", label: { zh: "Name（必填，最多 64 字符）", en: "Name (required, up to 64 chars)" }, type: "text", required: true, placeholder: { zh: "例如：Seedance 参考图", en: "e.g. Seedance references" } },
      { key: "Description", label: { zh: "Description（最多 300 字符）", en: "Description (up to 300 chars)" }, type: "textarea", rows: 3, placeholder: { zh: "可选描述", en: "Optional description" } },
      {
        key: "GroupType",
        label: { zh: "GroupType", en: "GroupType" },
        type: "select",
        options: [
          { value: "AIGC", label: { zh: "AIGC（数字人，当前唯一支持值）", en: "AIGC - Digital characters" } },
        ],
        defaultValue: "AIGC",
      },
      { key: "ProjectName", label: { zh: "ProjectName", en: "ProjectName" }, type: "text", defaultValue: "default", placeholder: { zh: "默认 default", en: "Defaults to default" } },
      { key: "Extra", label: { zh: "扩展 JSON", en: "Extra JSON" }, type: "json", rows: 4, placeholder: { zh: '{"YourExtraField":"value"}', en: '{"YourExtraField":"value"}' } },
    ],
    bodyBuilder(values) {
      return cleanAssetActionBody({
        Name: values.Name,
        Description: values.Description,
        GroupType: values.GroupType || "AIGC",
        ProjectName: values.ProjectName || "default",
        ...parseJsonValue(values.Extra, "Extra JSON"),
      });
    },
  },
  CreateAsset: {
    tone: "blue",
    label: { zh: "创建素材", en: "Create asset" },
    summary: {
      zh: "在指定素材组内通过公开 URL 创建素材；创建后需轮询 GetAsset，状态为 Active 后再使用。",
      en: "Create an asset in a group by public URL. Poll GetAsset until the status becomes Active.",
    },
    badge: { zh: "上传", en: "Upload" },
    uses: ["channelId", "groupId"],
    showLocalUpload: false,
    requiredBaseFields: ["groupId"],
    fields: [
      {
        key: "URL",
        label: { zh: "URL（必填，仅支持 HTTP/HTTPS）", en: "URL (required, HTTP/HTTPS only)" },
        type: "text",
        placeholder: {
          zh: "例如：https://example.com/demo.png",
          en: "e.g. https://example.com/demo.png",
        },
      },
      {
        key: "AssetName",
        label: { zh: "Name（可选，最多 64 字符）", en: "Name (optional, up to 64 chars)" },
        type: "text",
        placeholder: { zh: "用于 ListAssets 模糊搜索", en: "Used for fuzzy search in ListAssets" },
      },
      {
        key: "AssetType",
        label: { zh: "AssetType（素材类型）", en: "AssetType" },
        type: "select",
        options: [
          { value: "Image", label: { zh: "Image（图片）", en: "Image" } },
          { value: "Video", label: { zh: "Video（视频）", en: "Video" } },
          { value: "Audio", label: { zh: "Audio（音频）", en: "Audio" } },
        ],
        defaultValue: "Image",
      },
      {
        key: "ModerationStrategy",
        label: { zh: "Moderation.Strategy", en: "Moderation.Strategy" },
        type: "select",
        options: [
          { value: "Default", label: { zh: "Default（开启内容预审）", en: "Default" } },
          { value: "Skip", label: { zh: "Skip（跳过大多数非基线审核）", en: "Skip" } },
        ],
        defaultValue: "Default",
      },
      { key: "ProjectName", label: { zh: "ProjectName", en: "ProjectName" }, type: "text", defaultValue: "default", placeholder: { zh: "需与素材组 ProjectName 一致", en: "Must match the asset group's ProjectName" } },
      { key: "Extra", label: { zh: "扩展 JSON", en: "Extra JSON" }, type: "json", rows: 4, placeholder: { zh: '{"YourExtraField":"value"}', en: '{"YourExtraField":"value"}' } },
    ],
    async bodyBuilder(values) {
      const assetUrl = String(values.URL || "").trim();
      if (!assetUrl) {
        throw new Error(t("assetAuditNeedField", { field: "URL" }));
      }
      if (!/^https?:\/\//i.test(assetUrl)) {
        throw new Error(t("assetAuditNeedHttpUrl"));
      }
      const groupId = assetGroupId.value.trim();
      if (!groupId) {
        throw new Error(t("assetAuditNeedField", { field: t("assetGroupId") }));
      }
      const moderationStrategy = String(values.ModerationStrategy || "").trim();
      return cleanAssetActionBody({
        GroupId: groupId,
        Name: String(values.AssetName || "").trim(),
        AssetType: String(values.AssetType || "Image").trim() || "Image",
        URL: assetUrl,
        Moderation: moderationStrategy ? { Strategy: moderationStrategy } : undefined,
        ProjectName: values.ProjectName || "default",
        ...parseJsonValue(values.Extra, "Extra JSON"),
      });
    },
  },
  ListAssetGroups: {
    tone: "amber",
    label: { zh: "列举素材组", en: "List asset groups" },
    summary: {
      zh: "按 GroupType、名称、ID、项目和排序条件列举素材组。",
      en: "List asset groups by GroupType, name, IDs, project, and sorting options.",
    },
    badge: { zh: "列表", en: "List" },
    uses: ["channelId", "groupId"],
    showLocalUpload: false,
    requiredBaseFields: [],
    fields: [
      { key: "PageNumber", label: { zh: "PageNumber", en: "PageNumber" }, type: "number", defaultValue: 1 },
      {
        key: "PageSize",
        label: { zh: "PageSize", en: "PageSize" },
        type: "select",
        options: [
          { value: "10", label: { zh: "10 条/页", en: "10 per page" } },
          { value: "20", label: { zh: "20 条/页", en: "20 per page" } },
          { value: "50", label: { zh: "50 条/页", en: "50 per page" } },
          { value: "100", label: { zh: "100 条/页（最大）", en: "100 per page (max)" } },
        ],
        defaultValue: "20",
      },
      {
        key: "GroupType",
        label: { zh: "GroupType（必填）", en: "GroupType (required)" },
        type: "select",
        options: [
          { value: "AIGC", label: { zh: "AIGC（数字人）", en: "AIGC - Digital characters" } },
          { value: "LivenessFace", label: { zh: "LivenessFace（真人肖像）", en: "LivenessFace - Real-person portrait" } },
        ],
        defaultValue: "AIGC",
        required: true,
      },
      {
        key: "Name",
        label: { zh: "Name（素材组名称）", en: "Name" },
        type: "text",
        placeholder: { zh: "最多 64 字符，可选", en: "Up to 64 characters, optional" },
      },
      {
        key: "GroupIds",
        label: { zh: "GroupIds（每行一个，可选）", en: "GroupIds (one per line, optional)" },
        type: "textarea",
        rows: 3,
        placeholder: { zh: "group-2026...", en: "group-2026..." },
      },
      {
        key: "SortBy",
        label: { zh: "SortBy", en: "SortBy" },
        type: "select",
        options: [
          { value: "CreateTime", label: { zh: "CreateTime（创建时间）", en: "CreateTime" } },
          { value: "UpdateTime", label: { zh: "UpdateTime（更新时间）", en: "UpdateTime" } },
        ],
        defaultValue: "CreateTime",
      },
      {
        key: "SortOrder",
        label: { zh: "SortOrder", en: "SortOrder" },
        type: "select",
        options: [
          { value: "Desc", label: { zh: "Desc（降序）", en: "Desc" } },
          { value: "Asc", label: { zh: "Asc（升序）", en: "Asc" } },
        ],
        defaultValue: "Desc",
      },
      {
        key: "ProjectName",
        label: { zh: "ProjectName", en: "ProjectName" },
        type: "text",
        placeholder: { zh: "默认 default", en: "Defaults to default" },
      },
      {
        key: "Filter",
        label: { zh: "扩展 Filter JSON", en: "Extra Filter JSON" },
        type: "json",
        rows: 4,
        placeholder: { zh: '{"YourExtraField":"value"}', en: '{"YourExtraField":"value"}' },
      },
    ],
    bodyBuilder(values) {
      const filter = parseJsonValue(values.Filter, "Filter JSON");
      const groupType = String(values.GroupType || "").trim();
      if (!groupType) {
        throw new Error(t("assetAuditNeedField", { field: "GroupType" }));
      }
      filter.GroupType = groupType;
      const name = String(values.Name || "").trim();
      if (name) filter.Name = name;
      const groupIds = parseLineList(values.GroupIds);
      if (groupIds.length) filter.GroupIds = groupIds;
      return cleanAssetActionBody({
        PageNumber: toInteger(values.PageNumber),
        PageSize: Math.min(toInteger(values.PageSize) || 10, 100),
        SortBy: values.SortBy || "CreateTime",
        SortOrder: values.SortOrder || "Desc",
        ProjectName: values.ProjectName,
        Filter: filter,
      });
    },
  },
  ListAssets: {
    tone: "amber",
    label: { zh: "列举素材", en: "List assets" },
    summary: {
      zh: "按 GroupType、素材名称、分组、状态和排序条件列举素材。",
      en: "List assets by GroupType, asset name, groups, status, and sorting options.",
    },
    badge: { zh: "列表", en: "List" },
    uses: ["channelId", "groupId"],
    showLocalUpload: false,
    requiredBaseFields: [],
    fields: [
      { key: "PageNumber", label: { zh: "PageNumber", en: "PageNumber" }, type: "number", defaultValue: 1 },
      {
        key: "PageSize",
        label: { zh: "PageSize", en: "PageSize" },
        type: "select",
        options: [
          { value: "10", label: { zh: "10 条/页", en: "10 per page" } },
          { value: "20", label: { zh: "20 条/页", en: "20 per page" } },
          { value: "50", label: { zh: "50 条/页", en: "50 per page" } },
          { value: "100", label: { zh: "100 条/页（最大）", en: "100 per page (max)" } },
        ],
        defaultValue: "10",
      },
      {
        key: "SortBy",
        label: { zh: "SortBy", en: "SortBy" },
        type: "select",
        options: [
          { value: "CreateTime", label: { zh: "CreateTime（创建时间）", en: "CreateTime" } },
          { value: "UpdateTime", label: { zh: "UpdateTime（更新时间）", en: "UpdateTime" } },
          { value: "GroupId", label: { zh: "GroupId（素材组 ID）", en: "GroupId" } },
        ],
        defaultValue: "CreateTime",
      },
      {
        key: "SortOrder",
        label: { zh: "SortOrder", en: "SortOrder" },
        type: "select",
        options: [
          { value: "Desc", label: { zh: "Desc（降序）", en: "Desc" } },
          { value: "Asc", label: { zh: "Asc（升序）", en: "Asc" } },
        ],
        defaultValue: "Desc",
      },
      {
        key: "ProjectName",
        label: { zh: "ProjectName", en: "ProjectName" },
        type: "text",
        placeholder: { zh: "默认 default", en: "Defaults to default" },
      },
      {
        key: "GroupType",
        label: { zh: "GroupType（必填）", en: "GroupType (required)" },
        type: "select",
        options: [
          { value: "AIGC", label: { zh: "AIGC（数字人）", en: "AIGC - Digital characters" } },
          { value: "LivenessFace", label: { zh: "LivenessFace（真人肖像）", en: "LivenessFace - Real-person portrait" } },
        ],
        defaultValue: "AIGC",
        required: true,
      },
      {
        key: "Name",
        label: { zh: "Name（素材名称）", en: "Name" },
        type: "text",
        placeholder: { zh: "可选", en: "Optional" },
      },
      {
        key: "GroupIds",
        label: { zh: "GroupIds（每行一个，可选）", en: "GroupIds (one per line, optional)" },
        type: "textarea",
        rows: 3,
        placeholder: { zh: "留空时可使用上方素材组 ID", en: "Defaults to the Group ID above if empty" },
      },
      {
        key: "Statuses",
        label: { zh: "Statuses（每行一个，可选）", en: "Statuses (one per line, optional)" },
        type: "textarea",
        rows: 3,
        defaultValue: "Active",
        placeholder: { zh: "Active\nProcessing\nFailed", en: "Active\nProcessing\nFailed" },
      },
      {
        key: "Filter",
        label: { zh: "扩展 Filter JSON", en: "Extra Filter JSON" },
        type: "json",
        rows: 4,
        placeholder: {
          zh: '{"YourExtraField":"value"}',
          en: '{"YourExtraField":"value"}',
        },
      },
    ],
    bodyBuilder(values) {
      const filter = parseJsonValue(values.Filter, "Filter JSON");
      const groupType = String(values.GroupType || "").trim();
      if (!groupType) {
        throw new Error(t("assetAuditNeedField", { field: "GroupType" }));
      }
      filter.GroupType = groupType;
      const name = String(values.Name || "").trim();
      if (name) filter.Name = name;
      const groupIds = parseLineList(values.GroupIds);
      const groupId = assetGroupId.value.trim();
      if (groupIds.length) {
        filter.GroupIds = groupIds;
      } else if (groupId && (!Array.isArray(filter.GroupIds) || !filter.GroupIds.length)) {
        filter.GroupIds = [groupId];
      }
      const statuses = parseLineList(values.Statuses);
      if (statuses.length) filter.Statuses = statuses;
      return cleanAssetActionBody({
        PageNumber: toInteger(values.PageNumber),
        PageSize: Math.min(toInteger(values.PageSize) || 10, 100),
        SortBy: values.SortBy || "CreateTime",
        SortOrder: values.SortOrder || "Desc",
        ProjectName: values.ProjectName,
        Filter: Object.keys(filter).length ? filter : undefined,
      });
    },
  },
  GetAsset: {
    tone: "sky",
    label: { zh: "查询素材", en: "Get asset" },
    summary: {
      zh: "查询单个素材详情；请使用上方的素材 ID。",
      en: "Fetch one asset by ID. Use the Asset ID field above.",
    },
    badge: { zh: "查询", en: "Read" },
    uses: ["channelId", "assetId"],
    showLocalUpload: false,
    requiredBaseFields: ["assetId"],
    fields: [
      { key: "ProjectName", label: { zh: "ProjectName", en: "ProjectName" }, type: "text", defaultValue: "default", placeholder: { zh: "默认 default", en: "Defaults to default" } },
    ],
    bodyBuilder(values) {
      return cleanAssetActionBody({
        Id: assetId.value.trim(),
        ProjectName: values.ProjectName,
      });
    },
  },
  GetAssetGroup: {
    tone: "sky",
    label: { zh: "查询素材组", en: "Get asset group" },
    summary: {
      zh: "查询单个素材组详情；请使用上方的素材组 ID。",
      en: "Fetch one asset group by ID. Use the Group ID field above.",
    },
    badge: { zh: "查询", en: "Read" },
    uses: ["channelId", "groupId"],
    showLocalUpload: false,
    requiredBaseFields: ["groupId"],
    fields: [
      { key: "ProjectName", label: { zh: "ProjectName", en: "ProjectName" }, type: "text", placeholder: { zh: "默认 default", en: "Defaults to default" } },
    ],
    bodyBuilder(values) {
      return cleanAssetActionBody({
        Id: assetGroupId.value.trim(),
        ProjectName: values.ProjectName,
      });
    },
  },
  UpdateAssetGroup: {
    tone: "violet",
    label: { zh: "更新素材组", en: "Update asset group" },
    summary: {
      zh: "更新素材组名称或描述；当前官方仅支持 Name 和 Description。",
      en: "Update the asset group name or description. Officially only Name and Description are supported.",
    },
    badge: { zh: "更新", en: "Update" },
    uses: ["channelId", "groupId"],
    showLocalUpload: false,
    requiredBaseFields: ["groupId"],
    fields: [
      { key: "Name", label: { zh: "Name（最多 64 字符）", en: "Name (up to 64 chars)" }, type: "text", placeholder: { zh: "可选", en: "Optional" } },
      { key: "Description", label: { zh: "Description（最多 300 字符）", en: "Description (up to 300 chars)" }, type: "textarea", rows: 3, placeholder: { zh: "可选", en: "Optional" } },
      { key: "ProjectName", label: { zh: "ProjectName", en: "ProjectName" }, type: "text", placeholder: { zh: "默认 default", en: "Defaults to default" } },
    ],
    bodyBuilder(values) {
      return cleanAssetActionBody({
        Id: assetGroupId.value.trim(),
        Name: values.Name,
        Description: values.Description,
        ProjectName: values.ProjectName,
      });
    },
  },
  UpdateAsset: {
    tone: "violet",
    label: { zh: "更新素材", en: "Update asset" },
    summary: {
      zh: "更新素材名称；当前官方仅支持 Name。",
      en: "Update the asset name. Officially only Name is supported.",
    },
    badge: { zh: "更新", en: "Update" },
    uses: ["channelId", "assetId"],
    showLocalUpload: false,
    requiredBaseFields: ["assetId"],
    fields: [
      { key: "Name", label: { zh: "Name（最多 64 字符）", en: "Name (up to 64 chars)" }, type: "text", placeholder: { zh: "可选", en: "Optional" } },
      { key: "ProjectName", label: { zh: "ProjectName", en: "ProjectName" }, type: "text", placeholder: { zh: "默认 default", en: "Defaults to default" } },
    ],
    bodyBuilder(values) {
      return cleanAssetActionBody({
        Id: assetId.value.trim(),
        Name: values.Name,
        ProjectName: values.ProjectName,
      });
    },
  },
  DeleteAsset: {
    tone: "rose",
    label: { zh: "删除素材", en: "Delete asset" },
    summary: {
      zh: "删除单个素材；只需要上方素材 ID。",
      en: "Delete one asset. Only the Asset ID field above is required.",
    },
    badge: { zh: "删除", en: "Delete" },
    uses: ["channelId", "assetId"],
    showLocalUpload: false,
    requiredBaseFields: ["assetId"],
    fields: [
      { key: "ProjectName", label: { zh: "ProjectName", en: "ProjectName" }, type: "text", placeholder: { zh: "默认 default", en: "Defaults to default" } },
    ],
    bodyBuilder(values) {
      return cleanAssetActionBody({
        Id: assetId.value.trim(),
        ProjectName: values.ProjectName,
      });
    },
  },
  DeleteAssetGroup: {
    tone: "rose",
    label: { zh: "删除素材组", en: "Delete asset group" },
    summary: {
      zh: "删除素材组及其全部素材；此操作不可撤销。",
      en: "Delete an asset group and all assets in it. This cannot be undone.",
    },
    badge: { zh: "删除", en: "Delete" },
    uses: ["channelId", "groupId"],
    showLocalUpload: false,
    requiredBaseFields: ["groupId"],
    fields: [
      { key: "ProjectName", label: { zh: "ProjectName", en: "ProjectName" }, type: "text", placeholder: { zh: "默认 default", en: "Defaults to default" } },
    ],
    bodyBuilder(values) {
      return cleanAssetActionBody({
        Id: assetGroupId.value.trim(),
        ProjectName: values.ProjectName,
      });
    },
  },
  CreateVisualValidateSession: {
    tone: "slate",
    label: { zh: "创建活体会话", en: "Create liveness session" },
    summary: {
      zh: "生成真人认证 H5 链接；H5Link 有效期约 120 秒，可在返回链接后缀使用 lng 指定语言。",
      en: "Generate a real-person verification H5 link. The H5Link is valid for about 120 seconds; use the returned link's lng suffix for language.",
    },
    badge: { zh: "活体", en: "Verify" },
    uses: ["channelId"],
    showLocalUpload: false,
    requiredBaseFields: [],
    fields: [
      {
        key: "CallbackURL",
        label: { zh: "CallbackURL（必填）", en: "CallbackURL (required)" },
        type: "text",
        required: true,
        placeholder: { zh: "https://example.com/callback", en: "https://example.com/callback" },
      },
      { key: "ProjectName", label: { zh: "ProjectName", en: "ProjectName" }, type: "text", placeholder: { zh: "默认 default", en: "Defaults to default" } },
      { key: "Extra", label: { zh: "扩展 JSON", en: "Extra JSON" }, type: "json", rows: 4, placeholder: { zh: '{"YourExtraField":"value"}', en: '{"YourExtraField":"value"}' } },
    ],
    bodyBuilder(values) {
      const callbackUrl = String(values.CallbackURL || "").trim();
      if (!/^https?:\/\//i.test(callbackUrl)) {
        throw new Error(t("assetAuditNeedField", { field: "CallbackURL (HTTP/HTTPS)" }));
      }
      return cleanAssetActionBody({
        CallbackURL: callbackUrl,
        ProjectName: values.ProjectName,
        ...parseJsonValue(values.Extra, "Extra JSON"),
      });
    },
  },
  GetVisualValidateResult: {
    tone: "slate",
    label: { zh: "查询活体结果", en: "Get liveness result" },
    summary: {
      zh: "用 BytedToken 查询真人认证创建的素材组 ID；BytedToken 有效期约 120 秒。",
      en: "Use BytedToken to retrieve the asset group ID created by verification. The token is valid for about 120 seconds.",
    },
    badge: { zh: "活体", en: "Verify" },
    uses: ["channelId"],
    showLocalUpload: false,
    requiredBaseFields: [],
    fields: [
      {
        key: "BytedToken",
        label: { zh: "BytedToken（必填）", en: "BytedToken (required)" },
        type: "text",
        required: true,
        placeholder: { zh: "20260331145619...", en: "20260331145619..." },
      },
      { key: "ProjectName", label: { zh: "ProjectName", en: "ProjectName" }, type: "text", placeholder: { zh: "默认 default", en: "Defaults to default" } },
      { key: "Extra", label: { zh: "扩展 JSON", en: "Extra JSON" }, type: "json", rows: 4, placeholder: { zh: '{"YourExtraField":"value"}', en: '{"YourExtraField":"value"}' } },
    ],
    bodyBuilder(values) {
      return cleanAssetActionBody({
        BytedToken: String(values.BytedToken || "").trim(),
        ProjectName: String(values.ProjectName || "default").trim() || "default",
        ...parseJsonValue(values.Extra, "Extra JSON"),
      });
    },
  },
};

let currentAssetAction = "CreateAsset";
const assetActionState = {};

function getAssetActionDefinition(action) {
  return ASSET_ACTION_DEFINITIONS[action] || ASSET_ACTION_DEFINITIONS.CreateAsset;
}

function getActionState(action) {
  if (!assetActionState[action]) {
    assetActionState[action] = {};
  }
  return assetActionState[action];
}

function cleanAssetActionBody(body) {
  return Object.fromEntries(
    Object.entries(body).filter(([, value]) => value !== undefined && value !== null && value !== "" && !(Array.isArray(value) && value.length === 0))
  );
}

function parseJsonValue(value, label) {
  const text = String(value || "").trim();
  if (!text) return {};
  const parsed = JSON.parse(text);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error(t("mustBeObject", { label, example: '{"key": "value"}' }));
  }
  return parsed;
}

function parseLineList(value) {
  return String(value || "")
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function toInteger(value) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.trunc(number) : undefined;
}

function syncAssetActionStateFromDom(action) {
  const state = getActionState(action);
  assetActionParams.querySelectorAll("[data-asset-action-field]").forEach((node) => {
    if (node.type === "checkbox") {
      state[node.dataset.assetActionField] = node.checked;
      return;
    }
    if (node.type === "file") {
      state[node.dataset.assetActionField] = node.files?.[0] || null;
      return;
    }
    state[node.dataset.assetActionField] = node.value;
  });
}

function renderAssetActionSelect() {
  const previous = assetActionSelect.value || currentAssetAction;
  assetActionSelect.innerHTML = "";

  ASSET_ACTION_ORDER.forEach((action) => {
    const definition = getAssetActionDefinition(action);
    const option = document.createElement("option");
    option.value = action;
    option.textContent = localizedText(definition.label);
    assetActionSelect.append(option);
  });

  assetActionSelect.value = ASSET_ACTION_DEFINITIONS[previous] ? previous : currentAssetAction;
  if (!assetActionSelect.value) {
    assetActionSelect.value = ASSET_ACTION_ORDER[0];
  }
}

function renderAssetActionChips(definition) {
  const usageLabels = {
    channelId: { zh: "channel_id", en: "channel_id" },
    groupId: { zh: "GroupId", en: "GroupId" },
    assetId: { zh: "素材 ID", en: "Asset ID" },
    localFile: { zh: "本地文件", en: "Local file" },
  };
  assetActionUses.innerHTML = "";
  definition.uses.forEach((useKey) => {
    const chip = document.createElement("span");
    chip.className = "assetActionChip active";
    chip.textContent = localizedText(usageLabels[useKey] || useKey);
    assetActionUses.append(chip);
  });
}

function renderAssetActionFields(definition) {
  assetActionParams.innerHTML = "";
  const state = getActionState(currentAssetAction);

  if (!definition.fields.length) {
    const note = document.createElement("div");
    note.className = "assetActionNote";
    note.textContent = localizedText(definition.summary);
    assetActionParams.append(note);
    return;
  }

  definition.fields.forEach((field) => {
    const actionForField = currentAssetAction;
    const fieldWrap = document.createElement("div");
    fieldWrap.className = `field ${field.wide ? "wide" : ""}`.trim();

    const label = document.createElement("label");
    if (field.key === "RawBody") {
      label.textContent = localizedText(field.label);
    } else {
      label.textContent = localizedText(field.label);
    }

    const inputId = `assetAction_${currentAssetAction}_${field.key}`;
    label.htmlFor = inputId;

    let control;
    if (field.type === "textarea" || field.type === "json") {
      control = document.createElement("textarea");
      control.rows = field.rows || 4;
      control.value = state[field.key] ?? field.defaultValue ?? "";
      control.placeholder = localizedText(field.placeholder);
    } else if (field.type === "file") {
      control = document.createElement("input");
      control.type = "file";
      control.accept = field.accept || "*/*";
      if (field.required) control.required = true;
      const fileName = state[field.key]?.name || "";
      if (fileName) control.dataset.selectedFileName = fileName;
    } else if (field.type === "select") {
      control = document.createElement("select");
      (field.options || []).forEach((optionDef) => {
        const option = document.createElement("option");
        option.value = optionDef.value;
        option.textContent = localizedText(optionDef.label);
        control.append(option);
      });
      control.value = state[field.key] ?? field.defaultValue ?? (field.options?.[0]?.value || "");
    } else if (field.type === "checkbox") {
      control = document.createElement("input");
      control.type = "checkbox";
      control.checked = Boolean(state[field.key] ?? field.defaultValue);
    } else {
      control = document.createElement("input");
      control.type = field.type === "number" ? "number" : "text";
      control.value = state[field.key] ?? field.defaultValue ?? "";
      control.placeholder = localizedText(field.placeholder);
      if (field.min !== undefined) control.min = field.min;
      if (field.max !== undefined) control.max = field.max;
    }

    control.id = inputId;
    control.dataset.assetActionField = field.key;
    if (field.required) control.required = true;
    const syncHandler = () => {
      syncAssetActionStateFromDom(actionForField);
      if (field.type === "file") {
        const file = control.files?.[0] || null;
        fieldWrap.querySelector(".assetActionFileName")?.replaceChildren(
          document.createTextNode(file ? file.name : "")
        );
      }
    };
    control.addEventListener("input", syncHandler);
    control.addEventListener("change", syncHandler);

    if (field.type === "file") {
      const fileHint = document.createElement("div");
      fileHint.className = "assetActionFileName";
      fileHint.textContent = state[field.key]?.name || "";
      fieldWrap.append(label, control, fileHint);
      assetActionParams.append(fieldWrap);
      return;
    }

    fieldWrap.append(label, control);
    assetActionParams.append(fieldWrap);
  });
}

function renderAssetActionPanel() {
  const definition = getAssetActionDefinition(currentAssetAction);
  assetAuditDrawer.dataset.actionTone = definition.tone || "slate";
  assetActionBadge.textContent = localizedText(definition.badge) || currentAssetAction;
  assetActionHint.textContent = `${localizedText(definition.summary)} · POST /v1/ark/assets · Version 2024-01-01`;
  renderAssetActionChips(definition);
  renderAssetActionFields(definition);
}

function getAssetActionBodyValues(action) {
  const state = getActionState(action);
  syncAssetActionStateFromDom(action);
  return state;
}

async function buildAssetActionBody(action) {
  const definition = getAssetActionDefinition(action);
  const values = getAssetActionBodyValues(action);
  const body = definition.bodyBuilder ? definition.bodyBuilder(values) : cleanAssetActionBody(values);
  return Promise.resolve(body);
}

function validateAssetActionInputs(action) {
  const definition = getAssetActionDefinition(action);
  const values = getAssetActionBodyValues(action);

  for (const baseField of definition.requiredBaseFields || []) {
    if (baseField === "assetId" && !assetId.value.trim()) {
      showAssetAuditBanner("warn", t("assetAuditNeedId"));
      return false;
    }
    if (baseField === "groupId" && !assetGroupId.value.trim()) {
      showAssetAuditBanner("warn", t("assetAuditNeedField", { field: t("assetGroupId") }));
      return false;
    }
  }

  for (const field of definition.fields || []) {
    if (!field.required) continue;
    const value = values[field.key];
    const missing = field.type === "checkbox"
      ? !value
      : field.type === "file"
        ? !value
        : !String(value || "").trim();
    if (missing) {
      showAssetAuditBanner("warn", t("assetAuditNeedField", { field: localizedText(field.label) }));
      return false;
    }
  }

  return true;
}

advancedToggle.addEventListener("click", () => {
  advancedPanel.hidden = !advancedPanel.hidden;
  advancedToggle.classList.toggle("active", !advancedPanel.hidden);
});

durationPreset.addEventListener("change", () => {
  const custom = durationPreset.value === "custom";
  customDuration.disabled = !custom;
  customDuration.required = custom;
  if (!custom) customDuration.value = "";
});

imageFiles.addEventListener("change", async () => {
  const files = Array.from(imageFiles.files || []);
  const availableSlots = MAX_IMAGES - uploadedImages.length;
  if (availableSlots <= 0) {
    imageFiles.value = "";
    showBanner("warn", t("maxImages", { count: MAX_IMAGES }));
    return;
  }

  const selectedFiles = files.slice(0, availableSlots);
  if (files.length > availableSlots) {
    showBanner("warn", t("maxImages", { count: MAX_IMAGES }));
  }

  try {
    const nextImages = [];
    const results = await Promise.allSettled(
      selectedFiles.map(async (file) => ({
        src: await readFileAsDataUrl(file),
        name: file.name,
      }))
    );

    results.forEach((result) => {
      if (result.status === "fulfilled") {
        nextImages.push(result.value);
      }
    });

    if (!nextImages.length) {
      throw new Error(t("imageReadFailed", { message: t("requestFailed") }));
    }

    uploadedImages = [...uploadedImages, ...nextImages];
    renderImagePreview();
  } catch (error) {
    showBanner("error", t("imageReadFailed", { message: error.message }));
  }

  imageFiles.value = "";
});

function showBanner(type, message) {
  statusBanner.hidden = false;
  statusBanner.className = `statusBanner ${type}`;
  statusBanner.textContent = message;
}

function hideBanner() {
  statusBanner.hidden = true;
  statusBanner.textContent = "";
}

function showAssetAuditBanner(type, message) {
  assetAuditBanner.hidden = false;
  assetAuditBanner.className = `statusBanner ${type}`;
  assetAuditBanner.textContent = message;
}

function setTaskStatus(type, message) {
  taskStatus.className = `taskStatus ${type}`;
  taskStatus.textContent = message;
}

function setSummary(items) {
  resultSummary.innerHTML = items
    .filter((item) => item.value !== undefined && item.value !== null && item.value !== "")
    .map(
      (item) => `
        <div class="${item.type || ""}">
          <span>${escapeHtml(item.label)}</span>
          <strong>${escapeHtml(String(item.value))}</strong>
        </div>
      `
    )
    .join("");
}

function extractErrorMessage(data, fallback = t("requestFailed")) {
  if (!data) return fallback;
  if (typeof data === "string") {
    const parsedFromString = parseErrorMessageFromString(data);
    return parsedFromString || data;
  }

  const candidates = [
    data.upstream_error?.message,
    data.upstream_error?.error?.message,
    data.upstream_error?.detail?.message,
    data.upstream_error?.detail?.error?.message,
    data.upstream_error?.detail,
    data.upstream_error,
    data.detail?.message,
    data.detail?.error?.message,
    data.detail,
    data.error?.message,
    data.message,
  ];

  for (const candidate of candidates) {
    if (!candidate) continue;
    if (typeof candidate === "string") {
      const parsed = parseErrorMessageFromString(candidate);
      if (parsed) return parsed;
      if (candidate.trim()) return candidate;
      continue;
    }
    if (typeof candidate === "object") {
      const parsed = extractErrorMessage(candidate, "");
      if (parsed) return parsed;
    }
  }

  if (data.upstream_status) return t("upstreamStatus", { status: data.upstream_status });
  return fallback;
}

function parseErrorMessageFromString(value) {
  const text = String(value || "").trim();
  if (!text) return "";

  const objectStart = text.indexOf("{");
  const objectEnd = text.lastIndexOf("}");
  if (objectStart >= 0 && objectEnd > objectStart) {
    const maybeJson = text.slice(objectStart, objectEnd + 1);
    try {
      const parsed = JSON.parse(maybeJson);
      const nested = extractErrorMessage(parsed, "");
      if (nested) return nested;
    } catch {
      // Ignore malformed JSON fragments and fall back to plain text.
    }
  }

  return "";
}

function getTaskId(data) {
  return data?.task_id || data?.id || data?.raw?.task_id || data?.raw?.id || data?.data?.task_id || data?.data?.id;
}

function getTaskStatus(data) {
  return String(
    data?.status ||
      data?.raw?.status ||
      data?.data?.status ||
      data?.data?.data?.status ||
      data?.code ||
      ""
  );
}

function findVideoUrl(data) {
  const found = [];
  function walk(value) {
    if (!value || found.length) return;
    if (typeof value === "string") {
      if (/^https?:\/\/.+\.(mp4|mov|webm)(\?|#|$)/i.test(value)) found.push(value);
      return;
    }
    if (Array.isArray(value)) {
      value.forEach(walk);
      return;
    }
    if (typeof value === "object") Object.values(value).forEach(walk);
  }

  const candidates = [
    data?.result_url,
    data?.video_url,
    data?.url,
    data?.output_url,
    data?.data?.result_url,
    data?.data?.video_url,
    data?.data?.content?.video_url,
    data?.data?.data?.content?.video_url,
    data?.raw?.data?.result_url,
    data?.raw?.data?.data?.content?.video_url,
  ];
  const direct = candidates.find((value) => typeof value === "string" && value);
  if (direct) return direct;
  walk(data);
  return found[0];
}

function renderVideo(data) {
  const url = findVideoUrl(data);
  if (!url) {
    showcaseCopy.hidden = false;
    resultShowcase.classList.remove("hasVideo");
    videoDrawer.hidden = true;
    videoDrawer.open = false;
    videoSlot.innerHTML = `<p class="emptyVideo">${escapeHtml(t("videoEmpty"))}</p>`;
    return;
  }

  showcaseCopy.hidden = true;
  resultShowcase.classList.add("hasVideo");
  videoDrawer.hidden = false;
  videoDrawer.open = true;
  videoSlot.innerHTML = "";

  const video = document.createElement("video");
  video.src = url;
  video.controls = true;
  video.playsInline = true;

  const actions = document.createElement("div");
  actions.className = "videoActions";

  const openLink = document.createElement("a");
  openLink.href = url;
  openLink.target = "_blank";
  openLink.rel = "noreferrer";
  openLink.textContent = t("openVideo");

  const downloadLink = document.createElement("a");
  downloadLink.href = url;
  downloadLink.download = `seedance-${Date.now()}.mp4`;
  downloadLink.textContent = t("downloadVideo");

  actions.append(openLink, downloadLink);
  videoSlot.append(video, actions);
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, options);
  const data = await response.json().catch(() => ({}));
  const businessFailed = data && typeof data === "object" && data.success === false;
  if (!response.ok) {
    const error = new Error(extractErrorMessage(data, response.statusText));
    error.status = response.status;
    error.data = data;
    throw error;
  }
  if (businessFailed) {
    const error = new Error(extractErrorMessage(data, t("requestFailed")));
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
}

function getExtra() {
  return parseObjectField("#extra", t("extraJson"));
}

function getMetadata() {
  return parseObjectField("#metadata", "Metadata JSON");
}

function getAssetContentItems() {
  const assetType = document.querySelector("#referenceAssetType").value || "image_url";
  return getUrlListField("#referenceAssetIds").map((assetId) => ({
    type: assetType,
    [assetType]: {
      url: assetId.startsWith("asset://") ? assetId : `asset://${assetId}`,
    },
  }));
}

function getUrlListField(selector) {
  return document
    .querySelector(selector)
    .value.split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseObjectField(selector, label) {
  const value = document.querySelector(selector).value.trim();
  if (!value) return {};
  const parsed = JSON.parse(value);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error(t("mustBeObject", { label, example: '{"seed": 12345}' }));
  }
  return parsed;
}

async function requestAssetAction(action, body, channelId) {
  const query = channelId ? `?channel_id=${encodeURIComponent(channelId)}` : "";
  return requestJson(`/api/ark/assets/${encodeURIComponent(action)}${query}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body || {}),
  });
}

function setAssetAuditOutput(data) {
  assetAuditOutput.textContent = JSON.stringify(data, null, 2);
}

function setAssetAuditButtonsDisabled(disabled) {
  runAssetActionButton.disabled = disabled;
  assetActionSelect.disabled = disabled;
}

function getCreatedAssetId(data) {
  const candidates = [
    data?.Id,
    data?.id,
    data?.AssetId,
    data?.asset_id,
    data?.Result?.Id,
    data?.Result?.AssetId,
    data?.Data?.Id,
    data?.Data?.AssetId,
    data?.data?.id,
    data?.data?.asset_id,
  ];
  const value = candidates.find((item) => typeof item === "string" && item.trim());
  return value || "";
}

function getCreatedGroupId(data) {
  const candidates = [
    data?.GroupId,
    data?.group_id,
    data?.Result?.GroupId,
    data?.Result?.group_id,
    data?.Data?.GroupId,
    data?.Data?.group_id,
    data?.data?.GroupId,
    data?.data?.group_id,
  ];
  const value = candidates.find((item) => typeof item === "string" && item.trim());
  return value || "";
}

async function pollTask() {
  const taskId = taskIdInput.value.trim();
  if (!taskId) {
    showBanner("warn", t("fillTaskId"));
    return;
  }

  setTaskStatus("loading", t("querying"));
  const data = await requestJson(`/api/video/generations/${encodeURIComponent(taskId)}`);
  const status = getTaskStatus(data);
  const videoUrl = findVideoUrl(data);

  setSummary([
    { label: t("status"), value: status || t("receivedResponse"), type: statusClass(status) },
    { label: t("taskIdLabel").replace(":", ""), value: taskId },
    { label: t("progress"), value: data?.data?.progress || data?.progress },
    { label: t("video"), value: videoUrl ? t("generated") : t("notReturned") },
  ]);

  const normalized = status.toLowerCase();
  if (["completed", "success", "succeeded"].includes(normalized)) {
    renderVideo(data);
    setTaskStatus("success", t("completed"));
    showBanner("success", t("completedBanner"));
    clearInterval(pollTimer);
  } else if (["failed", "error"].includes(normalized)) {
    const message = extractErrorMessage(data?.error || data, t("failed"));
    setTaskStatus("error", message);
    showBanner("error", message);
    clearInterval(pollTimer);
  } else if (status) {
    setTaskStatus("loading", t("statusPrefix", { status }));
  } else {
    setTaskStatus("muted", t("receivedStatus"));
  }
}

async function loadConfig() {
  const config = await requestJson("/api/config");
  poweredHost = formatHost(config.base_url);
  endpoint.textContent = `Powered by ${poweredHost}`;
  const modelSelect = document.querySelector("#model");
  modelSelect.innerHTML = "";
  config.models.forEach((model) => {
    const option = document.createElement("option");
    option.value = model.value;
    option.textContent = model.label;
    modelSelect.append(option);
  });
  modelSelect.value = config.default_profile;
  if (modelSelect.value !== config.default_profile && config.models[0]) {
    modelSelect.value = config.models[0].value;
  }
  syncResolutionOptions();
  modelSelect.addEventListener("change", syncResolutionOptions);
}

function syncResolutionOptions() {
  const modelValue = String(document.querySelector("#model").value || "").toLowerCase();
  const resolutionSelect = document.querySelector("#resolution");
  const isFastModel = modelValue.includes("fast");
  Array.from(resolutionSelect.options).forEach((option) => {
    option.disabled = isFastModel && option.value === "1080p";
  });
  if (isFastModel && resolutionSelect.value === "1080p") {
    resolutionSelect.value = "720p";
  }
}

function formatHost(value) {
  try {
    return new URL(value).host;
  } catch {
    return value || "SeeDance";
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearInterval(pollTimer);
  showcaseCopy.hidden = false;
  resultShowcase.classList.remove("hasVideo");
  videoDrawer.hidden = true;
  videoDrawer.open = false;
  videoSlot.innerHTML = `<p class="emptyVideo">${escapeHtml(t("videoEmpty"))}</p>`;
  hideBanner();
  setTaskStatus("loading", t("submitting"));
  submitButton.disabled = true;
  submitButton.textContent = "...";

  try {
    const duration = getDuration();
    const textImages = document
      .querySelector("#image")
      .value.split(/\r?\n/)
      .map((item) => item.trim())
      .filter(Boolean);
    const images = [...textImages, ...uploadedImages.map((item) => item.src)];
    const metadata = getMetadata();
    const assetContentItems = getAssetContentItems();
    if (assetContentItems.length) {
      metadata.content = [
        ...(Array.isArray(metadata.content) ? metadata.content : []),
        ...assetContentItems,
      ];
    }

    if (images.length > MAX_IMAGES) {
      throw new Error(t("tooManyImages", { count: MAX_IMAGES }));
    }

    const payload = {
      prompt: document.querySelector("#prompt").value.trim(),
      model: document.querySelector("#model").value,
      ratio: document.querySelector("#ratio").value || undefined,
      duration,
      resolution: document.querySelector("#resolution").value || undefined,
      width: Number(document.querySelector("#width").value) || undefined,
      height: Number(document.querySelector("#height").value) || undefined,
      fps: Number(document.querySelector("#fps").value) || undefined,
      seed: Number(document.querySelector("#seed").value) || undefined,
      n: Number(document.querySelector("#n").value) || undefined,
      response_format: document.querySelector("#responseFormat").value || undefined,
      user: document.querySelector("#user").value.trim() || undefined,
      metadata: {
        ...metadata,
        ...(document.querySelector("#generateAudio").checked ? { generate_audio: true } : {}),
        ...(getUrlListField("#referenceVideoUrls").length
          ? { referenceVideoUrls: getUrlListField("#referenceVideoUrls") }
          : {}),
        ...(getUrlListField("#referenceAudioUrls").length
          ? { referenceAudioUrls: getUrlListField("#referenceAudioUrls") }
          : {}),
      },
      extra: getExtra(),
    };
    if (images.length === 1) {
      payload.image = images[0];
    } else if (images.length > 1) {
      payload.images = images;
    }

    const data = await requestJson("/api/video/generations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const taskId = getTaskId(data);
    if (taskId) {
      taskIdInput.value = taskId;
      pollButton.disabled = false;
      setTaskStatus("loading", `${t("submitted")}: ${taskId}`);
      setSummary([
        { label: t("status"), value: t("submitted"), type: "active" },
        { label: t("taskIdLabel").replace(":", ""), value: taskId },
        { label: t("ratio"), value: payload.ratio || t("defaultValue") },
        { label: t("duration"), value: payload.duration ? `${payload.duration}s` : t("defaultValue") },
        { label: t("images"), value: images.length ? t("imageCount", { count: images.length }) : t("unused") },
      ]);
      showBanner("success", t("submitSuccess"));
      pollTimer = setInterval(() => {
        pollTask().catch((error) => {
          setTaskStatus("error", error.message);
          showBanner("error", error.message);
        });
      }, 8000);
    } else {
      setTaskStatus("warn", t("noTaskId"));
      showBanner("warn", t("noTaskId"));
    }
  } catch (error) {
    const responseMessage = extractErrorMessage(error?.data, error.message);
    const message = error.status
      ? t("submitFailedHttp", { message: responseMessage, status: error.status })
      : t("submitFailed", { message: responseMessage });
    setTaskStatus("error", t("submitFailedStatus"));
    showBanner("error", message);
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "↑";
  }
});

pollButton.addEventListener("click", () => {
  pollTask().catch((error) => {
    const message = error.status
      ? t("queryFailedHttp", { message: error.message, status: error.status })
      : t("queryFailed", { message: error.message });
    setTaskStatus("error", message);
    showBanner("error", message);
  });
});

taskIdInput.addEventListener("input", () => {
  pollButton.disabled = !taskIdInput.value.trim();
});

assetActionSelect.addEventListener("change", () => {
  currentAssetAction = assetActionSelect.value;
  renderAssetActionPanel();
});

runAssetActionButton.addEventListener("click", async () => {
  const channelId = assetChannelId.value.trim();
  if (!channelId) {
    showAssetAuditBanner("warn", t("assetAuditNeedChannel"));
    return;
  }

  const action = assetActionSelect.value || currentAssetAction;
  const definition = getAssetActionDefinition(action);

  if (!validateAssetActionInputs(action)) {
    return;
  }

  setAssetAuditButtonsDisabled(true);
  showAssetAuditBanner("warn", `${t("assetAuditLoadingAction")} ${localizedText(definition.label)}`);

  try {
    const body = await buildAssetActionBody(action);
    const data = await requestAssetAction(action, body, channelId);
    setAssetAuditOutput(data);

    if (action === "CreateAsset") {
      const createdId = getCreatedAssetId(data);
      if (createdId) {
        assetId.value = createdId;
      }
      showAssetAuditBanner("success", t("assetAuditCreateDone"));
    } else if (action === "ListAssets") {
      showAssetAuditBanner("success", t("assetAuditListDone"));
    } else if (action === "GetAsset") {
      showAssetAuditBanner("success", t("assetAuditCheckDone"));
    } else if (action === "GetVisualValidateResult") {
      const groupId = getCreatedGroupId(data);
      if (groupId) {
        assetGroupId.value = groupId;
      }
      showAssetAuditBanner("success", `${t("assetAuditActionDone")} ${localizedText(definition.label)}`);
    } else {
      showAssetAuditBanner("success", `${t("assetAuditActionDone")} ${localizedText(definition.label)}`);
    }
  } catch (error) {
    showAssetAuditBanner("error", t("assetAuditFailed", { message: error.message }));
    setAssetAuditOutput(error.data || { message: error.message });
  } finally {
    setAssetAuditButtonsDisabled(false);
  }
});

function getDuration() {
  if (durationPreset.value === "custom") {
    const value = Number(customDuration.value);
    if (!value) throw new Error(t("customDurationRequired"));
    if (value < 4 || value > 15) throw new Error(t("customDurationRange"));
    return value;
  }
  return Number(durationPreset.value) || undefined;
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error || new Error(t("imageReadFailed", { message: "" })));
    reader.readAsDataURL(file);
  });
}

function renderImagePreview() {
  imagePreview.innerHTML = "";

  if (!uploadedImages.length) {
    imagePreview.hidden = true;
    return;
  }

  imagePreview.hidden = false;

  const canAddMore = uploadedImages.length < MAX_IMAGES;
  const addTile = document.createElement("button");
  addTile.type = "button";
  addTile.className = "imageAddTile";
  addTile.disabled = !canAddMore;
  addTile.setAttribute("aria-label", t("addImage"));
  addTile.innerHTML = `
    <span class="imageAddIcon">+</span>
    <strong>${escapeHtml(t("addImage"))}</strong>
  `;
  addTile.addEventListener("click", () => {
    imageFiles.click();
  });
  if (canAddMore) {
    imagePreview.append(addTile);
  }

  uploadedImages.forEach((image, index) => {
    const displayIndex = index + 1;
    const card = document.createElement("div");
    card.className = "imageThumb";
    card.innerHTML = `
      <button type="button" class="imageRemove" aria-label="${escapeHtml(t("removeImage", { index: displayIndex }))}">×</button>
      <img src="${image.src}" alt="${escapeHtml(t("imageAlt", { index: displayIndex }))}" />
      <span class="imageName">${escapeHtml(image.name || t("imageName", { index: displayIndex }))}</span>
    `;
    card.querySelector(".imageRemove").addEventListener("click", () => {
      uploadedImages.splice(index, 1);
      if (!uploadedImages.length) {
        imageFiles.value = "";
      }
      renderImagePreview();
    });
    imagePreview.append(card);
  });
}

function statusClass(status = "") {
  const normalized = String(status).toLowerCase();
  if (["success", "succeeded", "completed"].includes(normalized)) return "ok";
  if (["failed", "error"].includes(normalized)) return "danger";
  if (["running", "processing", "pending", "queued"].includes(normalized)) return "active";
  return "";
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

applyI18n();
loadConfig()
  .then(applyI18n)
  .catch((error) => {
    showBanner("error", t("configLoadFailed", { message: error.message }));
  });
