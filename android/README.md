# Android

This directory contains the Android application project for OpenClaw HWFace.

Current Gradle module:

```text
android/app
```

Build from the repository root:

```powershell
cd android
.\gradlew.bat :app:assembleDebug
```

The module currently includes a minimal smoke-test UI and local mock device control. OpenClaw Gateway HTTP/WS integration should be implemented against the interface files under `../openclaw/v1`.
