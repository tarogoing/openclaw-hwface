# AGENTS.md

本文档面向参与 `openclaw-hwface` 的维护者、贡献者和自动化编码 Agent，说明项目目标、协作边界和推荐工作流。

## 项目定位

`openclaw-hwface` 计划开发一个面向 OpenClaw 硬件/机械爪的 Android 接口 App。项目目标是提供稳定、可扩展、易调试的移动端控制入口，用于连接硬件、管理设备状态、发送控制指令，并为后续传感器、动作编排和远程控制能力预留架构空间。

当前仓库处于早期初始化阶段。Android 工程位于 `android/`，OpenClaw 接口规格位于 `openclaw/`，浏览器扩展位于 `browser-extension/`。

## 协作原则

- 优先保持小步提交，每个 PR 聚焦一个主题。
- 不在未讨论的情况下引入大型框架、云服务或协议栈。
- 所有硬件控制相关代码都要考虑失败、断连、重试、超时和权限拒绝。
- UI 文案、日志和错误提示应尽量帮助用户理解当前设备状态。
- 不提交密钥、证书、私有设备地址、个人调试配置或 IDE 工作区文件。

## 推荐技术方向

项目尚未锁定最终技术栈，建议初期采用以下方向：

- Language: Kotlin
- Build: Gradle Kotlin DSL
- Android UI: Jetpack Compose
- Architecture: MVVM + Repository
- Async: Kotlin Coroutines + Flow
- Local persistence: DataStore; 如需结构化历史记录再引入 Room
- Communication: 先抽象传输层，再分别实现 Bluetooth LE、USB Serial 或 Wi-Fi/MQTT 等具体通道

任何新增依赖都应先确认：

- 是否仍在维护。
- License 是否兼容开源项目。
- 是否会显著增加 App 体积或运行时权限。
- 是否可以被更小的标准库/AndroidX 能力替代。

## 目录约定

预期 Android 工程结构如下：

```text
.
├── android/                # Android App 工程，包含 Gradle Wrapper 与构建配置
├── browser-extension/      # OpenClaw 浏览器扩展
├── openclaw/               # OpenClaw 接口规格与示例
├── core/                   # 可选: 纯 Kotlin 核心逻辑模块
├── hardware/               # 可选: 设备协议与传输层模块
├── docs/                   # 可选: 协议、调试和发布文档
├── AGENTS.md
├── README.md
├── ARCHITECTURE.md
└── TASKS.md
```

在模块尚未建立前，不要在文档中声称功能已经完成。

## 分支与提交

建议分支命名：

- `feat/<short-name>`: 新功能
- `fix/<short-name>`: 缺陷修复
- `docs/<short-name>`: 文档更新
- `chore/<short-name>`: 构建、依赖、工具链维护

提交信息建议使用简短的英文 Conventional Commits：

```text
feat: add BLE device scanner
fix: handle device disconnect timeout
docs: describe hardware command protocol
```

## 开发检查清单

提交前建议至少完成：

- 在 `android/` 目录执行 `./gradlew tasks` 可正常运行。
- 新增 Kotlin/Android 代码可以通过本地构建。
- 修改硬件协议时同步更新 `ARCHITECTURE.md` 或 `docs/` 下的协议文档。
- 修改用户可见能力时同步更新 `README.md` 和 `TASKS.md`。
- 对权限、断连、设备不可用等失败路径进行基本验证。

## Agent 工作规则

自动化 Agent 修改本仓库时请遵守：

- 先阅读现有代码和文档，再进行实现。
- 保持改动范围与用户请求一致。
- 不要删除用户已有改动。
- 不要伪造已测试结果；无法运行测试时明确说明原因。
- 文档应区分“已完成”“计划中”“建议方向”。
- 涉及许可证、品牌归属、硬件安全边界等内容时，保守表述并提示维护者确认。

## 开源维护事项

项目正式公开前建议补齐：

- `LICENSE`: 已采用 MIT License；如需更换许可证需由项目所有者确认。
- `CONTRIBUTING.md`: 贡献流程、代码规范、PR 要求。
- `CODE_OF_CONDUCT.md`: 社区行为准则。
- `SECURITY.md`: 安全漏洞报告方式。
- Release notes / changelog: 版本变更记录。
