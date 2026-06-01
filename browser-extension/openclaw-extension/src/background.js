(function () {
  const ext = globalThis.chrome || globalThis.browser;

  const SETTINGS_KEY = "openclawSettings";
  const IMAGE_DEBUG_KEY = "openclawLastImageDebug";
  const MAX_INLINE_FILE_BYTES = 5 * 1024 * 1024;

  function defaultSettings() {
    return {
      baseUrl: "http://127.0.0.1:18789",
      apiKey: "",
      agentId: "main",
      model: "openclaw",
      sessionKeyPrefix: "openclaw-ext",
      endpointMode: "responses",
      user: "browser-extension",
      systemPrompt: "",
      temperature: 0.2,
      maxOutputTokens: "",
    };
  }

  function storageGet(keys) {
    return new Promise((resolve, reject) => {
      try {
        ext.storage.local.get(keys, (result) => {
          const err = ext.runtime && ext.runtime.lastError;
          if (err) return reject(new Error(err.message || "storage get failed"));
          resolve(result || {});
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  function storageSet(values) {
    return new Promise((resolve, reject) => {
      try {
        ext.storage.local.set(values, () => {
          const err = ext.runtime && ext.runtime.lastError;
          if (err) return reject(new Error(err.message || "storage set failed"));
          resolve();
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  async function loadSettings() {
    const data = await storageGet([SETTINGS_KEY]);
    const raw = data[SETTINGS_KEY] || {};
    const defaults = defaultSettings();
    const temp = Number(raw.temperature);
    return {
      baseUrl: String(raw.baseUrl || defaults.baseUrl).trim() || defaults.baseUrl,
      apiKey: String(raw.apiKey || "").trim(),
      agentId: String(raw.agentId || defaults.agentId).trim() || defaults.agentId,
      model: String(raw.model || defaults.model).trim() || defaults.model,
      sessionKeyPrefix: String(raw.sessionKeyPrefix || defaults.sessionKeyPrefix).trim() || defaults.sessionKeyPrefix,
      endpointMode: String(raw.endpointMode || defaults.endpointMode).trim() === "chat" ? "chat" : "responses",
      user: String(raw.user || defaults.user).trim() || defaults.user,
      systemPrompt: String(raw.systemPrompt || "").trim(),
      temperature: Number.isFinite(temp) ? Math.max(0, Math.min(2, temp)) : defaults.temperature,
      maxOutputTokens: String(raw.maxOutputTokens || "").trim(),
    };
  }

  function normalizeMessageHistory(messages) {
    if (!Array.isArray(messages)) return [];
    return messages
      .map((item) => ({
        role: String(item && item.role || "").trim(),
        content: String(item && item.content || "").trim(),
      }))
      .filter((item) => ["system", "developer", "user", "assistant"].includes(item.role) && item.content);
  }

  function normalizeAttachments(files) {
    if (!Array.isArray(files)) return [];
    return files
      .map((file) => ({
        name: String(file && file.name || "file").trim() || "file",
        type: String(file && file.type || "application/octet-stream").trim() || "application/octet-stream",
        data: String(file && file.data || "").trim(),
        size: Number(file && file.size || 0),
      }))
      .filter((file) => file.data);
  }

  function readChatContent(data) {
    const content = data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
    if (Array.isArray(content)) {
      return content
        .map((item) => item && typeof item.text === "string" ? item.text : typeof item === "string" ? item : "")
        .join("\n")
        .trim();
    }
    return typeof content === "string" ? content.trim() : "";
  }

  function readResponsesText(data) {
    const output = data && data.output;
    if (!Array.isArray(output)) return "";
    const parts = [];
    for (let i = 0; i < output.length; i += 1) {
      const item = output[i];
      const content = item && item.content;
      if (!Array.isArray(content)) continue;
      for (let j = 0; j < content.length; j += 1) {
        const part = content[j];
        if (part && typeof part.text === "string" && part.text.trim()) parts.push(part.text.trim());
      }
    }
    return parts.join("\n").trim();
  }

  function buildHeaders(settings) {
    const headers = { "Content-Type": "application/json" };
    if (settings.apiKey) headers.Authorization = "Bearer " + settings.apiKey;
    if (settings.agentId) headers["x-openclaw-agent-id"] = settings.agentId;
    return headers;
  }

  function buildHeadersWithSession(settings, sessionKey) {
    const headers = buildHeaders(settings);
    if (sessionKey) headers["x-openclaw-session-key"] = sessionKey;
    return headers;
  }

  function buildChatBody(settings, payload) {
    const messages = normalizeMessageHistory(payload.messages);
    const systemPrompt = String(payload.systemPrompt || settings.systemPrompt || "").trim();
    const bodyMessages = systemPrompt ? [{ role: "system", content: systemPrompt }, ...messages] : messages;
    const body = {
      model: settings.model,
      messages: bodyMessages,
      temperature: settings.temperature,
      user: settings.user,
      stream: false,
    };
    if (settings.maxOutputTokens) body.max_tokens = Number(settings.maxOutputTokens);
    return body;
  }

  function toResponseInputPart(file) {
    if (/^image\//i.test(file.type)) {
      return {
        type: "input_image",
        source: {
          type: "base64",
          media_type: file.type,
          data: file.data,
        },
      };
    }

    return {
      type: "input_file",
      source: {
        type: "base64",
        media_type: file.type,
        data: file.data,
        filename: file.name,
      },
    };
  }

  function buildResponsesBody(settings, payload) {
    const messages = normalizeMessageHistory(payload.messages);
    const systemPrompt = String(payload.systemPrompt || settings.systemPrompt || "").trim();
    const attachments = normalizeAttachments(payload.attachments);
    const imageAttachments = attachments.filter((file) => /^image\//i.test(file.type));
    const fileAttachments = attachments.filter((file) => !/^image\//i.test(file.type));
    const input = [];

    if (systemPrompt) {
      input.push({
        type: "message",
        role: "system",
        content: [{ type: "input_text", text: systemPrompt }],
      });
    }

    let attachedImagesToLastUser = false;
    for (let i = 0; i < messages.length; i += 1) {
      const isLastUserMessage =
        messages[i].role === "user" &&
        !messages.slice(i + 1).some((item) => item.role === "user");
      const content = [{ type: "input_text", text: messages[i].content }];
      if (isLastUserMessage && imageAttachments.length) {
        for (let j = 0; j < imageAttachments.length; j += 1) {
          content.push(toResponseInputPart(imageAttachments[j]));
        }
        attachedImagesToLastUser = true;
      }
      input.push({
        type: "message",
        role: messages[i].role,
        content,
      });
    }

    if (!attachedImagesToLastUser && imageAttachments.length) {
      input.push({
        type: "message",
        role: "user",
        content: imageAttachments.map((file) => toResponseInputPart(file)),
      });
    }

    for (let i = 0; i < fileAttachments.length; i += 1) input.push(toResponseInputPart(fileAttachments[i]));

    const body = {
      model: settings.model,
      input,
      temperature: settings.temperature,
      user: settings.user,
      stream: false,
    };
    if (settings.maxOutputTokens) body.max_output_tokens = Number(settings.maxOutputTokens);
    return body;
  }

  function getErrorMessage(data, response) {
    return (data && data.error && data.error.message) || response.statusText || "OpenClaw request failed";
  }

  function buildDetailedError(data, response) {
    const status = response && typeof response.status === "number" ? response.status : 0;
    const statusText = response && response.statusText ? response.statusText : "";
    const message = getErrorMessage(data, response);
    const detail = typeof data.detail === "string" ? data.detail : "";
    const parts = [];
    if (status) parts.push(`HTTP ${status}${statusText ? " " + statusText : ""}`);
    if (message) parts.push(message);
    if (detail && detail !== message) parts.push(detail);
    return parts.join(" | ") || "OpenClaw request failed";
  }

  function readAssistantText(data, endpointMode) {
    return endpointMode === "chat" ? readChatContent(data) : readResponsesText(data);
  }

  async function callOpenClaw(payload) {
    const settings = await loadSettings();
    const endpointMode = String(payload && payload.endpointMode || settings.endpointMode || "responses").trim() === "chat"
      ? "chat"
      : "responses";
    const attachments = normalizeAttachments(payload.attachments);
    for (let i = 0; i < attachments.length; i += 1) {
      if ((attachments[i].size || 0) > MAX_INLINE_FILE_BYTES) {
        throw new Error(`File too large: ${attachments[i].name}. Limit is 5MB.`);
      }
    }

    const baseUrl = settings.baseUrl.replace(/\/+$/, "");
    const endpointPath = endpointMode === "chat" ? "/v1/chat/completions" : "/v1/responses";
    const body = endpointMode === "chat"
      ? buildChatBody({ ...settings, endpointMode }, payload)
      : buildResponsesBody({ ...settings, endpointMode }, payload);

    const response = await fetch(baseUrl + endpointPath, {
      method: "POST",
      headers: buildHeadersWithSession(settings, payload.sessionKey),
      body: JSON.stringify(body),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(buildDetailedError(data, response));

    const text = String(readAssistantText(data, endpointMode) || "").trim();
    if (!text) throw new Error("OpenClaw returned an empty response.");

    return { ok: true, text, raw: data, endpointMode };
  }

  async function testOpenClawConnection(payload) {
    const settings = await loadSettings();
    const mode = String(payload && payload.endpointMode || settings.endpointMode || "responses").trim() === "chat"
      ? "chat"
      : "responses";
    const baseUrl = settings.baseUrl.replace(/\/+$/, "");
    const url = baseUrl + (mode === "chat" ? "/v1/chat/completions" : "/v1/responses");
    const testPayload = {
      messages: [{ role: "user", content: "Reply with exactly: pong" }],
      attachments: [],
      sessionKey: `${settings.sessionKeyPrefix || "openclaw-ext"}-test`,
    };
    const body = mode === "chat"
      ? buildChatBody({ ...settings, endpointMode: mode }, testPayload)
      : buildResponsesBody({ ...settings, endpointMode: mode }, testPayload);

    const response = await fetch(url, {
      method: "POST",
      headers: buildHeadersWithSession(settings, testPayload.sessionKey),
      body: JSON.stringify(body),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return {
        ok: false,
        endpointMode: mode,
        status: response.status,
        error: buildDetailedError(data, response),
      };
    }

    const text = String(readAssistantText(data, mode) || "").trim();
    return {
      ok: true,
      endpointMode: mode,
      status: response.status,
      text,
    };
  }

  async function openExtensionPanel() {
    if (ext.sidePanel && typeof ext.sidePanel.open === "function") {
      if (!ext.tabs || typeof ext.tabs.query !== "function") {
        throw new Error("tabs.query unavailable");
      }
      return new Promise((resolve, reject) => {
        ext.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
          const err = ext.runtime && ext.runtime.lastError;
          if (err) {
            reject(new Error(err.message || "tabs.query failed"));
            return;
          }
          const tab = tabs && tabs[0];
          if (!tab || typeof tab.id !== "number") {
            reject(new Error("No active tab found."));
            return;
          }
          try {
            if (typeof ext.sidePanel.setOptions === "function") {
              await ext.sidePanel.setOptions({
                tabId: tab.id,
                enabled: true,
                path: "panel.html",
              });
            }
            await ext.sidePanel.open({ tabId: tab.id });
            resolve();
          } catch (error) {
            reject(error);
          }
        });
      });
    }

    if (ext.sidebarAction && typeof ext.sidebarAction.open === "function") {
      await ext.sidebarAction.open();
      return;
    }

    throw new Error("Side panel is not available in this browser.");
  }

  ext.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (!message || typeof message !== "object") return;

    if (message.type === "OPENCLAW_SETTINGS_GET") {
      loadSettings()
        .then((settings) => sendResponse({ ok: true, settings }))
        .catch((error) => sendResponse({ ok: false, error: (error && error.message) || "load settings failed" }));
      return true;
    }

    if (message.type === "OPENCLAW_SETTINGS_SET") {
      const payload = message.payload || {};
      const defaults = defaultSettings();
      const temp = Number(payload.temperature);
      const settings = {
        baseUrl: String(payload.baseUrl || defaults.baseUrl).trim() || defaults.baseUrl,
        apiKey: String(payload.apiKey || "").trim(),
        agentId: String(payload.agentId || defaults.agentId).trim() || defaults.agentId,
        model: String(payload.model || defaults.model).trim() || defaults.model,
        sessionKeyPrefix: String(payload.sessionKeyPrefix || defaults.sessionKeyPrefix).trim() || defaults.sessionKeyPrefix,
        endpointMode: String(payload.endpointMode || defaults.endpointMode).trim() === "chat" ? "chat" : "responses",
        user: String(payload.user || defaults.user).trim() || defaults.user,
        systemPrompt: String(payload.systemPrompt || "").trim(),
        temperature: Number.isFinite(temp) ? Math.max(0, Math.min(2, temp)) : defaults.temperature,
        maxOutputTokens: String(payload.maxOutputTokens || "").trim(),
      };

      storageSet({ [SETTINGS_KEY]: settings })
        .then(() => sendResponse({ ok: true }))
        .catch((error) => sendResponse({ ok: false, error: (error && error.message) || "save settings failed" }));
      return true;
    }

    if (message.type === "OPENCLAW_CHAT") {
      callOpenClaw(message.payload || {})
        .then((result) => sendResponse(result))
        .catch((error) => sendResponse({ ok: false, error: (error && error.message) || "OpenClaw chat failed" }));
      return true;
    }

    if (message.type === "OPENCLAW_TEST_CONNECTION") {
      testOpenClawConnection(message.payload || {})
        .then((result) => sendResponse(result))
        .catch((error) => sendResponse({ ok: false, error: (error && error.message) || "OpenClaw test failed" }));
      return true;
    }

    if (message.type === "OPENCLAW_IMAGE_DEBUG_GET") {
      storageGet([IMAGE_DEBUG_KEY])
        .then((data) => sendResponse({ ok: true, debug: data[IMAGE_DEBUG_KEY] || null }))
        .catch((error) => sendResponse({ ok: false, error: (error && error.message) || "load image debug failed" }));
      return true;
    }

    if (message.type === "OPENCLAW_IMAGE_DEBUG_CLEAR") {
      storageSet({ [IMAGE_DEBUG_KEY]: null })
        .then(() => sendResponse({ ok: true }))
        .catch((error) => sendResponse({ ok: false, error: (error && error.message) || "clear image debug failed" }));
      return true;
    }

    if (message.type === "OPENCLAW_OPEN_PANEL") {
      openExtensionPanel()
        .then(() => sendResponse({ ok: true }))
        .catch((error) => sendResponse({ ok: false, error: (error && error.message) || "open side panel failed" }));
      return true;
    }
  });
})();
