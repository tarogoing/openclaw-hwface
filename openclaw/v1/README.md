# OpenClaw v1 Interface

This directory records the OpenClaw v1 conversation interface used by this project.

## Status

The public OpenClaw documentation currently exposes two relevant surfaces:

- Gateway WebSocket protocol for native clients and companion nodes.
- OpenAI-compatible HTTP endpoints on the Gateway port, including `/v1/models`, `/v1/chat/completions`, and `/v1/responses`.

Reference:

- https://docs.openclaw.ai/gateway
- https://docs.openclaw.ai/gateway/protocol
- https://docs.openclaw.ai/platforms/android

For this Android project:

- Use the v1 HTTP interface for simple chat-style compatibility and early integration tests.
- Use Gateway WebSocket node protocol for long-lived Android companion behavior, pairing, device capabilities, camera, voice, notification forwarding, and background presence.

## Files

```text
openclaw/v1/
├── README.md
├── openapi.yaml
└── examples/
    ├── chat-completions.request.json
    ├── responses.request.json
    └── models.response.json
```

## Default Endpoint

Local gateway default:

```text
http://127.0.0.1:18789
```

Android emulator bridge:

```text
http://10.0.2.2:18789
```

Private LAN examples may use `http://<gateway-host>.local:18789`. Remote/public deployments should use HTTPS/WSS through a trusted tunnel or reverse proxy.

## Authentication

Send a bearer token when the Gateway requires shared-secret auth:

```http
Authorization: Bearer <OPENCLAW_GATEWAY_TOKEN>
```

Do not store production tokens in source files.

## Minimal Chat Request

```http
POST /v1/chat/completions
Content-Type: application/json
Authorization: Bearer <token>
```

```json
{
  "model": "openclaw/default",
  "messages": [
    {
      "role": "user",
      "content": "Open the claw halfway and report device status."
    }
  ],
  "stream": false
}
```

## Notes

- `openclaw/default` should be treated as the stable default-agent alias.
- `openclaw/<agentId>` can target a specific configured agent.
- This spec intentionally keeps schemas permissive because Gateway-compatible responses may include additional fields.
- Hardware-control safety checks should still live in the Android/device-control layer, not only in the agent prompt.
