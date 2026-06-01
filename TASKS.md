# Tasks

本文档用于跟踪 `openclaw-hwface` 的项目路线图。状态会随开发推进更新。

状态说明：

- `[ ]`: 未开始
- `[~]`: 进行中
- `[x]`: 已完成

## 0. 项目初始化

- [x] 初始化 Gradle Wrapper。
- [x] 配置根工程名称 `OpenClawHwFace`。
- [x] 补充基础开源项目文档。
- [x] 确认开源许可证并添加 `LICENSE`。
- [x] 整理 `android/` 与 `openclaw/` 顶层目录。
- [x] 移植 OpenClaw 浏览器扩展到 `browser-extension/openclaw-extension`。
- [x] 添加 `CONTRIBUTING.md`。
- [x] 添加 `CODE_OF_CONDUCT.md`。
- [x] 添加 `SECURITY.md`。
- [x] 配置基础 CI。

## 1. Android App 骨架

- [x] 创建 `app` Android 模块。
- [x] 配置 Android Gradle Plugin。
- [x] 建立最小可运行 Activity。
- [ ] 建立 Jetpack Compose 主题和导航。
- [ ] 添加 Debug/Release 构建类型。
- [ ] 配置基础 lint 和 ktlint/detekt 之一。

## 2. 领域模型与协议抽象

- [x] 定义 `ClawDevice`。
- [x] 定义 `ConnectionState`。
- [x] 定义 `ClawCommand`。
- [ ] 定义 `ClawTelemetry`。
- [x] 定义 `ClawTransport` 接口。
- [x] 定义 `ClawProtocol` 接口。
- [x] 添加 Mock Transport 以支持无硬件开发。
- [ ] 编写协议编解码单元测试。

## 3. 连接与设备管理

- [ ] 设计设备扫描页面。
- [ ] 实现设备列表 UI。
- [ ] 实现连接/断开状态展示。
- [ ] 添加连接超时处理。
- [ ] 添加断线恢复策略。
- [ ] 添加权限申请和权限拒绝提示。

## 4. 硬件传输实现

首个真实传输方式待项目维护者确认。

- [ ] 评估 BLE 传输可行性。
- [ ] 评估 USB Serial 传输可行性。
- [ ] 评估 Wi-Fi/MQTT 或 TCP 传输可行性。
- [ ] 确认 OpenClaw 固件协议格式。
- [ ] 实现第一种真实传输方式。
- [ ] 记录硬件联调步骤。

## 5. 控制界面

- [ ] 设计基础控制页面。
- [ ] 实现打开、闭合、停止、复位命令。
- [ ] 实现力度调节。
- [ ] 实现速度调节。
- [ ] 实现命令发送状态反馈。
- [ ] 对高风险动作加入范围限制或确认。

## 6. 状态与调试

- [ ] 展示设备固件版本。
- [ ] 展示电量或供电状态。
- [ ] 展示实时开合位置。
- [ ] 展示设备错误码。
- [ ] 添加调试日志页面。
- [ ] 支持导出调试日志。
- [ ] 支持查看原始收发报文。

## 7. 测试

- [ ] 添加核心模型单元测试。
- [ ] 添加协议编解码测试。
- [ ] 添加 ViewModel 测试。
- [ ] 添加 Mock Transport 集成测试。
- [ ] 添加 Compose UI smoke test。
- [ ] 在 CI 中运行测试。

## 8. 发布准备

- [ ] 配置应用图标。
- [ ] 补充隐私说明。
- [ ] 补充版本号策略。
- [ ] 补充变更日志。
- [ ] 配置签名说明。
- [ ] 产出首个预览版 APK。

## 9. 文档

- [x] README: 项目介绍和快速开始。
- [x] ARCHITECTURE: 架构方向。
- [x] TASKS: 路线图。
- [x] AGENTS: 协作规则。
- [x] openclaw/v1: OpenClaw v1 对话接口规格。
- [ ] docs/protocol.md: OpenClaw 协议说明。
- [ ] docs/hardware-debugging.md: 硬件调试指南。
- [ ] docs/release.md: 发布流程。
- [ ] docs/screenshots.md: 截图与演示材料。

## 近期建议里程碑

### Milestone 1: 最小可运行 App

目标：打开 App 后可看到设备列表和 Mock 设备，能够进入控制页面。

包含：

- Android `app` 模块。
- Compose 基础 UI。
- Mock Transport。
- 基础控制命令但不连接真实硬件。

### Milestone 2: 首个真实硬件连接

目标：App 可以连接至少一种 OpenClaw 设备传输方式，并发送基础控制命令。

包含：

- 真实传输实现。
- 权限处理。
- 连接状态展示。
- 基础动作控制。

### Milestone 3: 开源预览版

目标：形成可供外部开发者试用和贡献的预览版本。

包含：

- 基础测试。
- CI。
- 许可证和贡献指南。
- APK 构建说明。
- 硬件调试文档。
