# Architecture

本文档描述 `openclaw-hwface` 的推荐架构方向。由于项目仍处于早期阶段，以下内容以目标设计和演进建议为主。当前仓库已在 `app` 模块内建立最小 Android 骨架和 OpenClaw 接口抽象，后续可按本文档继续拆分模块。

## 设计目标

- 将 UI、业务状态、硬件协议和具体传输方式解耦。
- 支持先用 Mock 设备开发 App，再接入真实硬件。
- 让连接、命令、状态上报和错误处理有统一模型。
- 方便未来扩展不同传输方式和不同 OpenClaw 硬件版本。
- 保持 Android App 代码可测试、可维护、易于开源协作。

## 分层架构

建议采用以下分层：

```text
┌──────────────────────────────────────────────┐
│ Android UI                                   │
│ Jetpack Compose screens, navigation, widgets │
└───────────────────────┬──────────────────────┘
                        │
┌───────────────────────▼──────────────────────┐
│ Presentation                                  │
│ ViewModel, UI state, user intents            │
└───────────────────────┬──────────────────────┘
                        │
┌───────────────────────▼──────────────────────┐
│ Domain                                       │
│ Device model, commands, use cases, policies  │
└───────────────────────┬──────────────────────┘
                        │
┌───────────────────────▼──────────────────────┐
│ Data / Hardware                              │
│ Repository, protocol codec, transport        │
└───────────────────────┬──────────────────────┘
                        │
┌───────────────────────▼──────────────────────┐
│ OpenClaw Device                              │
│ BLE, USB Serial, Wi-Fi, emulator, mock       │
└──────────────────────────────────────────────┘
```

## 推荐模块

### app

Android 应用入口，负责：

- Activity、导航和主题。
- Compose UI。
- ViewModel 绑定。
- Android 权限申请，例如 Bluetooth、Location、USB 或 Network。
- 与平台生命周期集成。

### core

纯 Kotlin 核心模块，可选但推荐尽早建立，负责：

- 领域模型。
- 命令定义。
- 状态机。
- 协议编解码接口。
- 不依赖 Android SDK 的单元测试。

### hardware

硬件通信模块，可根据复杂度独立出来，负责：

- 传输层接口。
- BLE/USB/Wi-Fi 具体实现。
- 连接重试、断线恢复、超时控制。
- 原始报文日志。

项目当前采用这种早期策略：先创建 `app` 模块，并在 `org.openclaw.hwface.openclaw` 包内放置设备、命令、协议和传输接口。等边界稳定后再拆出 `core` 或 `hardware` 模块。

## 核心模型建议

### Device

表示一个可连接的 OpenClaw 设备：

- `id`: 稳定设备标识。
- `name`: 用户可见名称。
- `transportType`: BLE、USB、Wi-Fi、Mock 等。
- `firmwareVersion`: 固件版本，可为空。
- `capabilities`: 设备能力集合。

### ConnectionState

统一描述连接状态：

- `Idle`
- `Scanning`
- `Connecting`
- `Connected`
- `Disconnecting`
- `Disconnected`
- `Failed`

状态变化应通过 `Flow` 或等价响应式机制向 UI 暴露。

### ClawCommand

控制命令建议显式建模，而不是在 UI 层拼接字节：

- `Open`
- `Close`
- `Stop`
- `Reset`
- `SetGripForce`
- `SetSpeed`
- `RunPreset`

命令进入硬件层后再由协议编解码器转换为具体报文。

### ClawTelemetry

设备状态上报：

- 连接质量。
- 电量或供电状态。
- 当前开合位置。
- 当前力度或负载。
- 温度、错误码、限位状态等可选字段。

## 通信抽象

建议定义传输层接口：

```kotlin
interface ClawTransport {
    val connectionState: Flow<ConnectionState>
    val incomingFrames: Flow<ByteArray>

    suspend fun scan(): List<ClawDevice>
    suspend fun connect(device: ClawDevice)
    suspend fun disconnect()
    suspend fun send(frame: ByteArray)
}
```

协议层负责将领域命令与二进制/文本报文互转：

```kotlin
interface ClawProtocol {
    fun encode(command: ClawCommand): ByteArray
    fun decode(frame: ByteArray): ClawEvent
}
```

Repository 将二者组合，向 ViewModel 暴露更高层能力：

```kotlin
interface ClawRepository {
    val devices: Flow<List<ClawDevice>>
    val state: Flow<ClawUiDeviceState>

    suspend fun refreshDevices()
    suspend fun connect(deviceId: String)
    suspend fun disconnect()
    suspend fun send(command: ClawCommand)
}
```

## 错误处理

硬件交互应默认认为网络、蓝牙、USB 和设备固件都可能失败。建议统一错误类型：

- 权限不足。
- 没有找到设备。
- 连接超时。
- 连接中断。
- 命令超时。
- 协议版本不兼容。
- 设备返回错误码。

UI 不应直接展示底层异常堆栈，而应展示可理解的状态和恢复动作。

## 权限与平台注意事项

Android 12 及以上 BLE 权限与旧版本不同。若实现 BLE，需要根据系统版本分别处理：

- `BLUETOOTH_SCAN`
- `BLUETOOTH_CONNECT`
- `ACCESS_FINE_LOCATION` 或旧版本扫描需求

若实现 USB Serial，需要处理：

- USB 设备发现。
- 用户授权。
- 设备拔插广播。
- 串口参数配置。

若实现 Wi-Fi/MQTT，需要处理：

- 网络可用性。
- 局域网发现或手动地址配置。
- TLS、认证和重连策略。

## 测试策略

建议优先建设：

- 协议编解码单元测试。
- 命令状态机测试。
- Repository 使用 Mock Transport 的测试。
- ViewModel UI state 测试。
- 关键 UI 的 Compose 测试。

硬件联调建议单独记录设备型号、固件版本、连接方式和复现步骤。

## 安全边界

机械爪属于可造成物理动作的设备，App 设计应包含基本安全约束：

- 提供停止或断开控制入口。
- 对连续动作、力度、速度设置合理范围。
- 对危险或高力度动作加入确认或限幅。
- 连接丢失时明确 UI 状态。
- 不在后台静默执行未确认动作。

## 未来扩展

- 动作预设与宏命令。
- 设备固件升级入口。
- 多设备管理。
- 远程控制或局域网控制。
- 数据记录与调试导出。
- 硬件模拟器，用于无设备开发和 CI 测试。
