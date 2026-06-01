# openclaw-hwface

`openclaw-hwface` 是一个计划中的 OpenClaw Android 接口项目，目标是为 OpenClaw 硬件/机械爪提供移动端 App 控制入口。

项目当前处于早期阶段，仓库已初始化 Gradle 工程基础文件，并已创建最小 Android App 模块、OpenClaw 接口抽象和 Mock 设备实现。

## 项目目标

- 提供 Android App，用于连接、控制和调试 OpenClaw 设备。
- 抽象硬件通信层，方便后续支持 Bluetooth LE、USB Serial、Wi-Fi 或其他传输方式。
- 提供清晰的设备状态展示、动作控制和错误提示。
- 建立适合开源协作的文档、任务拆分和贡献流程。

## 计划能力

- 设备发现与连接管理。
- 设备状态监控，例如连接状态、电量、固件版本、运行模式等。
- 基础动作控制，例如打开、闭合、停止、复位、力度或速度调节。
- 命令发送队列、超时处理、失败重试与断线恢复。
- 调试日志与原始协议报文查看。
- 可扩展的动作预设、脚本或任务编排能力。

## 当前状态

| 模块 | 状态 |
| --- | --- |
| Gradle Wrapper | 已初始化 |
| Android App 模块 | 已创建最小骨架 |
| UI 原型 | 待设计 |
| 硬件协议抽象 | 已创建初始接口 |
| BLE/USB/Wi-Fi 传输实现 | 待确认 |
| 测试与 CI | 待建设 |
| 开源治理文档 | 初步补齐 |

## 快速开始

### 环境要求

建议准备：

- JDK: 17 或更高版本
- Android Studio: 最新稳定版
- Android Gradle Plugin: 8.9.1
- Gradle: 使用仓库内置 Wrapper

### 查看工程任务

Windows PowerShell:

```powershell
cd android
.\gradlew.bat tasks
```

macOS / Linux:

```bash
cd android
./gradlew tasks
```

当前仓库已创建 `app` 模块，可继续使用 Android Studio 打开工程并运行 App。

## 建议开发路线

1. 创建 Android `app` 模块并完成最小可运行 App。
2. 建立核心领域模型，例如 `Device`, `ConnectionState`, `ClawCommand`, `ClawTelemetry`。
3. 定义硬件通信抽象接口，先用 Mock Transport 支持 UI 与逻辑开发。
4. 实现第一种真实传输方式，例如 BLE 或 USB Serial。
5. 建立基础控制界面、连接界面和调试日志界面。
6. 补充单元测试、集成测试和 GitHub Actions。

更多任务拆分见 [TASKS.md](TASKS.md)，架构说明见 [ARCHITECTURE.md](ARCHITECTURE.md)。

## 代码结构

预期结构：

```text
.
├── android/                # Android App 工程，包含 Gradle Wrapper 与构建配置
├── browser-extension/      # OpenClaw 浏览器扩展移植目录
├── openclaw/               # OpenClaw 接口规格与示例
├── core/                   # 可选: 业务模型、命令状态机、协议编解码
├── hardware/               # 可选: BLE/USB/Wi-Fi 等硬件通信实现
├── docs/                   # 可选: 协议、设备调试、发布说明
├── AGENTS.md
├── ARCHITECTURE.md
├── README.md
└── TASKS.md
```

实际结构会随项目演进调整。

## 贡献

欢迎参与文档、App、硬件协议、测试和示例建设。贡献前建议先阅读：

- [AGENTS.md](AGENTS.md): 维护者与 Agent 协作规则。
- [ARCHITECTURE.md](ARCHITECTURE.md): 架构边界和模块设计。
- [TASKS.md](TASKS.md): 当前任务和路线图。

贡献流程见 [CONTRIBUTING.md](CONTRIBUTING.md)，安全问题报告见 [SECURITY.md](SECURITY.md)。

## 开源许可证

本项目使用 MIT License 开源，详见 [LICENSE](LICENSE)。

## 项目名称说明

OpenClaw 相关名称和硬件归属请由项目维护者进一步确认。本文档中的 OpenClaw 用作当前项目计划名称与目标硬件代称。
