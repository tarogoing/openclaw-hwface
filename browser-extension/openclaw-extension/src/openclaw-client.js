(function () {
  const ext = globalThis.chrome || globalThis.browser;
  const IMAGE_DEBUG_KEY = "openclawLastImageDebug";

  function normalizeMessages(messages) {
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

  function buildHeaders(settings, sessionKey) {
    const headers = { "Content-Type": "application/json" };
    if (settings.apiKey) headers.Authorization = "Bearer " + settings.apiKey;
    if (settings.agentId) headers["x-openclaw-agent-id"] = settings.agentId;
    if (sessionKey) headers["x-openclaw-session-key"] = sessionKey;
    return headers;
  }

  function buildChatBody(settings, payload, stream) {
    const messages = normalizeMessages(payload.messages);
    const systemPrompt = String(payload.systemPrompt || settings.systemPrompt || "").trim();
    const bodyMessages = systemPrompt ? [{ role: "system", content: systemPrompt }, ...messages] : messages;
    const body = {
      model: settings.model,
      messages: bodyMessages,
      temperature: settings.temperature,
      user: settings.user,
      stream: !!stream,
    };
    if (settings.maxOutputTokens) body.max_tokens = Number(settings.maxOutputTokens);
    return body;
  }

  function toResponseInputPart(file) {
    return toResponseInputPartWithMode(file, "base64_source");
  }

  function toResponseInputPartWithMode(file, imageMode) {
    if (/^image\//i.test(file.type)) {
      if (imageMode === "data_url_source") {
        return {
          type: "input_image",
          source: {
            type: "url",
            url: `data:${file.type};base64,${file.data}`,
          },
        };
      }
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

  function buildResponsesBody(settings, payload, stream, imageMode) {
    const messages = normalizeMessages(payload.messages);
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
          content.push(toResponseInputPartWithMode(imageAttachments[j], imageMode));
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
        content: imageAttachments.map((file) => toResponseInputPartWithMode(file, imageMode)),
      });
    }

    for (let i = 0; i < fileAttachments.length; i += 1) {
      input.push(toResponseInputPart(fileAttachments[i]));
    }

    const body = {
      model: settings.model,
      input,
      temperature: settings.temperature,
      user: settings.user,
      stream: !!stream,
    };
    if (settings.maxOutputTokens) body.max_output_tokens = Number(settings.maxOutputTokens);
    return body;
  }

  function redactForDebug(value) {
    if (Array.isArray(value)) return value.map((item) => redactForDebug(item));
    if (!value || typeof value !== "object") return value;
    const out = {};
    const keys = Object.keys(value);
    for (let i = 0; i < keys.length; i += 1) {
      const key = keys[i];
      const next = value[key];
      if (key === "data" && typeof next === "string") {
        out[key] = `[base64 len=${next.length}]`;
      } else if (key === "url" && typeof next === "string" && next.startsWith("data:")) {
        out[key] = `[data-url len=${next.length}]`;
      } else {
        out[key] = redactForDebug(next);
      }
    }
    return out;
  }

  function debugSet(values) {
    return new Promise((resolve) => {
      if (!ext || !ext.storage || !ext.storage.local) return resolve();
      try {
        ext.storage.local.set(values, () => resolve());
      } catch {
        resolve();
      }
    });
  }

  async function saveImageDebug(info) {
    await debugSet({
      [IMAGE_DEBUG_KEY]: {
        ...info,
        savedAt: Date.now(),
      },
    });
  }

  function extractChatText(data) {
    const content = data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
    if (Array.isArray(content)) {
      return content
        .map((item) => typeof item === "string" ? item : item && item.text ? item.text : "")
        .join("\n")
        .trim();
    }
    return typeof content === "string" ? content.trim() : "";
  }

  function extractResponsesText(data) {
    const output = data && data.output;
    if (!Array.isArray(output)) return "";
    const parts = [];
    for (let i = 0; i < output.length; i += 1) {
      const content = output[i] && output[i].content;
      if (!Array.isArray(content)) continue;
      for (let j = 0; j < content.length; j += 1) {
        const item = content[j];
        if (item && typeof item.text === "string" && item.text.trim()) parts.push(item.text.trim());
      }
    }
    return parts.join("\n").trim();
  }

  function extractText(data, endpointMode) {
    return endpointMode === "chat" ? extractChatText(data) : extractResponsesText(data);
  }

  async function sendOnce(settings, payload) {
    const endpointMode = String(payload && payload.endpointMode || settings.endpointMode || "responses").trim() === "chat"
      ? "chat"
      : "responses";
    const baseUrl = String(settings.baseUrl || "").replace(/\/+$/, "");
    const url = baseUrl + (endpointMode === "chat" ? "/v1/chat/completions" : "/v1/responses");
    const body = endpointMode === "chat"
      ? buildChatBody(settings, payload, false)
      : buildResponsesBody(settings, payload, false, "base64_source");
    const response = await fetch(url, {
      method: "POST",
      headers: buildHeaders(settings, payload.sessionKey),
      body: JSON.stringify(body),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error((data && data.error && data.error.message) || response.statusText || "OpenClaw request failed");
    }
    return {
      endpointMode,
      text: extractText(data, endpointMode),
      raw: data,
    };
  }

  function extractChatDelta(data) {
    const delta = data && data.choices && data.choices[0] && data.choices[0].delta && data.choices[0].delta.content;
    if (typeof delta === "string") return delta;
    if (Array.isArray(delta)) {
      return delta
        .map((item) => typeof item === "string" ? item : item && item.text ? item.text : "")
        .join("");
    }
    return "";
  }

  function extractResponsesDelta(eventType, data) {
    if (eventType === "response.output_text.delta" && typeof data.delta === "string") return data.delta;
    if (eventType === "response.output_text.done" && typeof data.text === "string") return "";
    if (typeof data.delta === "string") return data.delta;
    if (typeof data.text === "string" && eventType === "response.content_part.added") return data.text;
    return "";
  }

  async function stream(settings, payload, handlers) {
    const endpointMode = String(payload && payload.endpointMode || settings.endpointMode || "responses").trim() === "chat"
      ? "chat"
      : "responses";
    const baseUrl = String(settings.baseUrl || "").replace(/\/+$/, "");
    const url = baseUrl + (endpointMode === "chat" ? "/v1/chat/completions" : "/v1/responses");
    const attachments = normalizeAttachments(payload.attachments);
    const hasImages = attachments.some((file) => /^image\//i.test(file.type));
    const imageModes = hasImages ? ["base64_source", "data_url_source"] : ["base64_source"];

    async function streamAttempt(imageMode, attemptIndex) {
      const body = endpointMode === "chat"
        ? buildChatBody(settings, payload, true)
        : buildResponsesBody(settings, payload, true, imageMode);

      if (hasImages && endpointMode === "responses") {
        await saveImageDebug({
          endpointMode,
          attemptIndex,
          imageMode,
          baseUrl,
          model: settings.model,
          agentId: settings.agentId,
          sessionKey: payload.sessionKey || "",
          attachments: attachments.map((file) => ({
            name: file.name,
            type: file.type,
            size: file.size,
          })),
          request: redactForDebug(body),
        });
      }

      const response = await fetch(url, {
        method: "POST",
        headers: buildHeaders(settings, payload.sessionKey),
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        const message = (data && data.error && data.error.message) || response.statusText || "OpenClaw stream failed";
        if (hasImages && endpointMode === "responses") {
          await saveImageDebug({
            endpointMode,
            attemptIndex,
            imageMode,
            baseUrl,
            model: settings.model,
            agentId: settings.agentId,
            sessionKey: payload.sessionKey || "",
            attachments: attachments.map((file) => ({
              name: file.name,
              type: file.type,
              size: file.size,
            })),
            request: redactForDebug(body),
            error: message,
          });
        }
        throw new Error(message);
      }
      if (!response.body) {
        const single = await sendOnce(settings, payload);
        if (handlers && handlers.onText) handlers.onText(single.text);
        if (handlers && handlers.onDone) handlers.onDone(single.text, single.raw);
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let eventType = "message";
      let accumulated = "";
      let finalPayload = null;

      function processBlock(block) {
        const lines = block.split(/\r?\n/);
        let localEvent = eventType;
        const dataLines = [];
        for (let i = 0; i < lines.length; i += 1) {
          const line = lines[i];
          if (line.startsWith("event:")) {
            localEvent = line.slice(6).trim();
          } else if (line.startsWith("data:")) {
            dataLines.push(line.slice(5).trim());
          }
        }
        if (!dataLines.length) return;
        const dataText = dataLines.join("\n");
        if (dataText === "[DONE]") return;

        let data = {};
        try {
          data = JSON.parse(dataText);
        } catch {
          data = { raw: dataText };
        }

        if (handlers && handlers.onEvent) handlers.onEvent(localEvent, data);

        const delta = endpointMode === "chat" ? extractChatDelta(data) : extractResponsesDelta(localEvent, data);
        if (delta) {
          accumulated += delta;
          if (handlers && handlers.onText) handlers.onText(accumulated, delta);
        }

        if ((endpointMode === "chat" && data && Array.isArray(data.choices)) || localEvent === "response.completed") {
          finalPayload = data;
        }
        eventType = "message";
      }

      while (true) {
        const chunk = await reader.read();
        if (chunk.done) break;
        buffer += decoder.decode(chunk.value, { stream: true });
        const parts = buffer.split(/\r?\n\r?\n/);
        buffer = parts.pop() || "";
        for (let i = 0; i < parts.length; i += 1) {
          processBlock(parts[i]);
        }
      }
      if (buffer.trim()) processBlock(buffer);

      const finalText = accumulated || extractText(finalPayload || {}, endpointMode);
      if (hasImages && endpointMode === "responses") {
        await saveImageDebug({
          endpointMode,
          attemptIndex,
          imageMode,
          baseUrl,
          model: settings.model,
          agentId: settings.agentId,
          sessionKey: payload.sessionKey || "",
          attachments: attachments.map((file) => ({
            name: file.name,
            type: file.type,
            size: file.size,
          })),
          request: redactForDebug(body),
          resultPreview: String(finalText || "").slice(0, 500),
        });
      }
      if (handlers && handlers.onDone) handlers.onDone(finalText, finalPayload);
    }

    let lastError = null;
    for (let i = 0; i < imageModes.length; i += 1) {
      try {
        await streamAttempt(imageModes[i], i + 1);
        return;
      } catch (error) {
        lastError = error;
        if (!hasImages || i === imageModes.length - 1) throw error;
      }
    }
    if (lastError) throw lastError;
  }

  globalThis.OpenClawClient = {
    normalizeAttachments,
    sendOnce,
    stream,
  };
})();
