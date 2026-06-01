# App Module

`app` is the Android application module for OpenClaw HWFace.

Current responsibilities:

- Android app entry point.
- Minimal control screen for development smoke testing.
- OpenClaw device model and command interface.
- Mock OpenClaw transport for development without hardware.

Current source layout:

```text
android/app/src/main/java/org/openclaw/hwface/
|-- MainActivity.java
`-- openclaw/
    |-- ConnectionState.java
    |-- MockOpenClawTransport.java
    |-- OpenClawCommand.java
    |-- OpenClawDevice.java
    |-- OpenClawEvent.java
    |-- OpenClawProtocol.java
    |-- OpenClawRepository.java
    |-- OpenClawTransport.java
    `-- TextOpenClawProtocol.java
```

The `openclaw` package is intentionally small and dependency-light. Once the protocol and transport boundaries settle, it can be moved into a dedicated `core` or `hardware` module.
