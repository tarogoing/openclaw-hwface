# Contributing

Thanks for helping improve OpenClaw HWFace.

## Development Layout

- `android/`: Android application project. Run Gradle commands from this directory.
- `openclaw/`: OpenClaw interface specifications and examples.
- `browser-extension/`: Browser extension source and store documentation.

## Before Opening a PR

- Keep changes focused on one topic.
- Do not commit local build caches, generated zips, secrets, private URLs, or personal IDE state.
- Update docs when behavior, commands, paths, permissions, or public APIs change.
- For Android changes, run `cd android` and then `./gradlew tasks`. Run `./gradlew :app:assembleDebug` when an Android SDK is available.
- For browser extension changes, rebuild the extension package locally before release, but do not commit generated zip files.

## Commit Style

Prefer concise Conventional Commits:

```text
feat: add gateway connection settings
fix: handle empty OpenClaw response
docs: clarify browser extension permissions
```

## Pull Request Checklist

- The change has a clear description.
- User-visible changes are reflected in README or module docs.
- Security and privacy implications have been considered.
- Any new dependency has a compatible license.
