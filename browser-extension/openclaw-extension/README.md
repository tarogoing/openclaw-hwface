# OpenClaw 浏览器扩展

这个扩展提供一个轻量的浏览器侧边栏聊天界面，用于连接用户自行配置的 OpenClaw Gateway。

当前 MVP 功能：

- 在浏览器右侧边栏中与 OpenClaw 对话
- 在 `/v1/chat/completions` 和 `/v1/responses` 之间切换
- 在侧边栏界面中流式显示回复
- 将本地会话保存在扩展存储中
- 通过 Responses API 以 `input_image` 和 `input_file` 形式附加图片和文件
- 将连接设置保存在扩展存储中

## 构建

在仓库根目录运行：

```powershell
powershell -ExecutionPolicy Bypass -File .\browser-extension\openclaw-extension\scripts\build.ps1 chrome
powershell -ExecutionPolicy Bypass -File .\browser-extension\openclaw-extension\scripts\build.ps1 edge
powershell -ExecutionPolicy Bypass -File .\browser-extension\openclaw-extension\scripts\build.ps1 firefox
```

## OpenClaw 说明

- 两个 endpoint 默认都处于关闭状态，需要在 Gateway 配置中启用。
- `/v1/responses` 支持携带 inline base64 payload 的 `input_file`。
- Gateway token 应视为操作员级访问凭证。

## 上架准备

- 隐私政策草稿：`browser-extension/openclaw-extension/PRIVACY_POLICY.md`
- 提交说明：`browser-extension/openclaw-extension/STORE_SUBMISSION.md`
- Chrome Web Store 文案：`browser-extension/openclaw-extension/CHROME_STORE_COPY.md`
- 截图清单：`browser-extension/openclaw-extension/SCREENSHOT_CHECKLIST.md`
- 开发日志：`../../docs/DEVLOG.md`

## Permissions

- `storage`: saves local extension settings and conversation state.
- `activeTab`: opens the side panel for the current browser tab after the user clicks the extension.
- `sidePanel`: provides the Chromium side-panel UI.
- `<all_urls>` / host permissions: allows requests to the user-configured OpenClaw Gateway URL. The extension does not inject content scripts into arbitrary pages.
