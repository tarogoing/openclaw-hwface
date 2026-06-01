# OpenClaw 扩展提交说明

最后更新：2026-03-21

## 单一用途

OpenClaw Browser Extension 是一个浏览器侧边栏聊天客户端，用于连接用户自行配置的 OpenClaw Gateway。

## 当前审核安全范围

- 用于打开侧边栏的 popup 入口
- 侧边栏聊天界面
- 用于配置用户自有 OpenClaw Gateway 的设置页
- 本地会话存储
- 可选的文件和图片附件，发送到用户配置的 Gateway
- 说明如何启用 OpenClaw endpoint 的帮助页

## 提交前已移除

- 通过 `window.postMessage` 暴露的网页桥接
- 任意站点内容脚本注入
- 向网页暴露扩展设置的能力

## 权限说明

- `storage`：存储设置、本地会话和已脱敏调试数据
- `tabs`：识别当前活动标签页，以便在该标签页上打开侧边栏
- `sidePanel`：在 Chrome 侧边栏中显示主要聊天界面
- `host_permissions: <all_urls>`：允许扩展连接用户自行配置的 OpenClaw Gateway；Gateway 可能部署在用户选择的任意本地或远程 HTTP(S) 地址

## 上传 Chrome Web Store 前

1. 确认公开隐私政策 URL 已可访问，并与扩展实际行为一致：`https://openclaw-hwface.github.io/privacy/browser-extension/`
2. 准备 Chrome Web Store 页面素材，包括截图和宣传文案。
3. 确认最终商店描述与实际行为一致，且不再提及已移除的网页桥接功能。
4. 在全新的 Chrome profile 中测试打包后的扩展。
5. 准备解释为什么需要较宽的 host access：用户可自行部署 Gateway，地址不固定。

## 推荐商店披露说明

- 扩展只会将 prompt、回复和附件发送到用户填写的 Gateway URL。
- 设置页中输入的凭证只用于连接用户配置的 Gateway。
- 扩展不会向任意站点暴露网页桥接。

## 本目录中的商店素材文件

- 页面文案：`CHROME_STORE_COPY.md`
- 截图计划：`SCREENSHOT_CHECKLIST.md`
- 隐私政策草稿：`PRIVACY_POLICY.md`
