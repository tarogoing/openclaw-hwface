(function () {
  const ext = globalThis.chrome || globalThis.browser;
  const i18n = globalThis.OpenClawI18n;
  const STORAGE_KEY = "openclawConversations";
  const ACTIVE_KEY = "openclawActiveConversationId";

  const conversationSelect = document.getElementById("conversationSelect");
  const messagesEl = document.getElementById("messages");
  const userInput = document.getElementById("userInput");
  const fileInput = document.getElementById("fileInput");
  const fileList = document.getElementById("fileList");
  const sendBtn = document.getElementById("sendBtn");
  const statusEl = document.getElementById("status");
  const newChatBtn = document.getElementById("newChatBtn");
  const openSettings = document.getElementById("openSettings");
  const chatTitle = document.getElementById("chatTitle");
  const connectionHint = document.getElementById("connectionHint");
  const attachLabel = document.getElementById("attachLabel");

  let settings = null;
  let conversations = [];
  let activeId = "";
  let attachments = [];
  let isSending = false;

  function t(key) {
    return i18n ? i18n.t(key) : key;
  }

  function setStatus(text) {
    statusEl.textContent = text || "";
  }

  function setBusyState(busy) {
    sendBtn.disabled = !!busy;
    userInput.disabled = !!busy;
    conversationSelect.disabled = !!busy;
    fileInput.disabled = !!busy;
    if (busy) attachLabel.classList.add("isDisabled");
    else attachLabel.classList.remove("isDisabled");
  }

  function applyLocale() {
    document.title = "OpenClaw Side Panel";
    newChatBtn.textContent = t("newChat");
    openSettings.textContent = t("settings");
    sendBtn.textContent = t("send");
    attachLabel.textContent = t("attach");
    userInput.placeholder = t("panelPlaceholder");
  }

  function sendRuntimeMessage(message) {
    return new Promise((resolve, reject) => {
      try {
        ext.runtime.sendMessage(message, (response) => {
          const err = ext.runtime && ext.runtime.lastError;
          if (err) return reject(new Error(err.message || "runtime sendMessage failed"));
          resolve(response || {});
        });
      } catch (error) {
        reject(error);
      }
    });
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

  function uid(prefix) {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }

  function buildEphemeralSessionKey() {
    const prefix = settings && settings.sessionKeyPrefix ? settings.sessionKeyPrefix : "openclaw-ext";
    return `${prefix}-ephemeral-${uid("attach")}`;
  }

  function createConversation() {
    const prefix = settings && settings.sessionKeyPrefix ? settings.sessionKeyPrefix : "openclaw-ext";
    const id = uid("conv");
    return {
      id,
      title: t("newConversation"),
      sessionKey: `${prefix}-${id}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
    };
  }

  function currentConversation() {
    return conversations.find((item) => item.id === activeId) || null;
  }

  function titleFromConversation(conversation) {
    const firstUser = (conversation.messages || []).find((item) => item.role === "user" && item.content);
    if (!firstUser) return t("newConversation");
    return firstUser.content.slice(0, 28) || t("newConversation");
  }

  async function persist() {
    await storageSet({
      [STORAGE_KEY]: conversations,
      [ACTIVE_KEY]: activeId,
    });
  }

  function renderFiles() {
    fileList.innerHTML = "";
    attachments.forEach((file) => {
      const li = document.createElement("li");
      const kind = /^image\//i.test(file.type) ? "image" : "file";
      li.textContent = `${kind}: ${file.name}`;
      fileList.appendChild(li);
    });
  }

  function renderConversationList() {
    conversationSelect.innerHTML = "";
    conversations
      .slice()
      .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
      .forEach((conversation) => {
        const option = document.createElement("option");
        option.value = conversation.id;
        option.textContent = `${conversation.title || t("newConversation")} (${conversation.messages.length})`;
        if (conversation.id === activeId) option.selected = true;
        conversationSelect.appendChild(option);
      });
  }

  function renderMessages() {
    messagesEl.innerHTML = "";
    const conversation = currentConversation();
    if (!conversation) return;
    chatTitle.textContent = conversation.title || t("newConversation");
    if (!conversation.messages.length) {
      const welcome = document.createElement("article");
      welcome.className = "bubble assistant";
      welcome.textContent = t("panelWelcome");
      messagesEl.appendChild(welcome);
      return;
    }
    conversation.messages.forEach((message) => {
      const item = document.createElement("article");
      item.className = "bubble " + message.role + (message.pending ? " pending" : "");
      item.textContent = message.content;
      messagesEl.appendChild(item);
    });
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = String(reader.result || "");
        resolve({
          name: file.name,
          type: file.type || "application/octet-stream",
          size: file.size || 0,
          data: result.includes(",") ? result.split(",")[1] : result,
        });
      };
      reader.onerror = () => reject(new Error("file read failed"));
      reader.readAsDataURL(file);
    });
  }

  async function loadSettings() {
    const res = await sendRuntimeMessage({ type: "OPENCLAW_SETTINGS_GET" });
    if (!res.ok) throw new Error(res.error || "load settings failed");
    settings = res.settings || {};
    connectionHint.textContent = `${settings.baseUrl} · ${settings.endpointMode} · model ${settings.model} · agent ${settings.agentId}`;
  }

  async function loadConversations() {
    const data = await storageGet([STORAGE_KEY, ACTIVE_KEY]);
    conversations = Array.isArray(data[STORAGE_KEY]) ? data[STORAGE_KEY] : [];
    activeId = String(data[ACTIVE_KEY] || "");
    if (!conversations.length) {
      const conversation = createConversation();
      conversations = [conversation];
      activeId = conversation.id;
      await persist();
    }
    if (!conversations.some((item) => item.id === activeId)) {
      activeId = conversations[0].id;
      await persist();
    }
  }

  async function createNewChat() {
    const conversation = createConversation();
    conversations.push(conversation);
    activeId = conversation.id;
    attachments = [];
    renderFiles();
    renderConversationList();
    renderMessages();
    await persist();
  }

  async function sendChat() {
    if (isSending) return;
    const conversation = currentConversation();
    if (!conversation) return;
    const text = String(userInput.value || "").trim();
    if (!text && !attachments.length) {
      setStatus(t("inputRequired"));
      return;
    }
    if (!settings) {
      setStatus(t("settingsPending"));
      return;
    }
    const requestEndpointMode = attachments.length ? "responses" : settings.endpointMode;
    const isolatedAttachmentMode = attachments.length > 0;

    isSending = true;
    setBusyState(true);
    setStatus(
      isolatedAttachmentMode
        ? `${t("sending")}... ${t("attachmentIsolated")}`
        : `${t("sending")}... ${t("waitingReply")}`
    );

    if (text) {
      conversation.messages.push({ role: "user", content: text, createdAt: Date.now() });
    } else if (attachments.length) {
      conversation.messages.push({ role: "user", content: `[Attached ${attachments.length} item(s)]`, createdAt: Date.now() });
    }

    const assistantMessage = { role: "assistant", content: `${t("thinking")}...`, createdAt: Date.now(), pending: true };
    conversation.messages.push(assistantMessage);
    if (!isolatedAttachmentMode) {
      conversation.title = titleFromConversation(conversation);
    }
    conversation.updatedAt = Date.now();
    renderConversationList();
    renderMessages();
    userInput.value = "";

    const requestMessages = isolatedAttachmentMode
      ? (text ? [{ role: "user", content: text }] : [{ role: "user", content: "[Attached 1 item(s)]" }])
      : conversation.messages
          .filter((item) => item !== assistantMessage)
          .map((item) => ({ role: item.role, content: item.content }));
    const requestSessionKey = isolatedAttachmentMode ? buildEphemeralSessionKey() : conversation.sessionKey;

    try {
      await globalThis.OpenClawClient.stream(
        settings,
        {
          sessionKey: requestSessionKey,
          endpointMode: requestEndpointMode,
          messages: requestMessages,
          attachments,
        },
        {
          onText(accumulated) {
            assistantMessage.pending = false;
            assistantMessage.content = accumulated;
            renderMessages();
          },
          onDone(finalText) {
            assistantMessage.pending = false;
            assistantMessage.content = String(finalText || assistantMessage.content || "").trim();
          },
        },
      );
      conversation.updatedAt = Date.now();
      attachments = [];
      renderFiles();
      renderConversationList();
      renderMessages();
      await persist();
      setStatus(t("done"));
    } catch (error) {
      assistantMessage.pending = false;
      assistantMessage.content = assistantMessage.content || `Error: ${(error && error.message) || "unknown error"}`;
      renderMessages();
      await persist();
      setStatus((error && error.message) || t("sendFailed"));
    } finally {
      isSending = false;
      setBusyState(false);
    }
  }

  fileInput.addEventListener("change", async () => {
    const files = Array.from(fileInput.files || []);
    if (!files.length) return;
    setStatus(t("readingFiles"));
    try {
      attachments = [];
      for (let i = 0; i < files.length; i += 1) {
        attachments.push(await readFileAsBase64(files[i]));
      }
      renderFiles();
      setStatus(`${attachments.length} attachment(s) ready.`);
    } catch (error) {
      setStatus((error && error.message) || "Attachment read failed");
    } finally {
      fileInput.value = "";
    }
  });

  sendBtn.addEventListener("click", () => {
    sendChat().catch((error) => {
      setStatus((error && error.message) || t("sendFailed"));
      isSending = false;
    });
  });

  newChatBtn.addEventListener("click", () => {
    createNewChat().catch((error) => {
      setStatus((error && error.message) || "Create conversation failed");
    });
  });

  conversationSelect.addEventListener("change", () => {
    activeId = conversationSelect.value;
    renderConversationList();
    renderMessages();
    void persist();
  });

  openSettings.addEventListener("click", () => {
    if (ext.runtime && typeof ext.runtime.openOptionsPage === "function") ext.runtime.openOptionsPage();
  });

  Promise.resolve(i18n && typeof i18n.init === "function" ? i18n.init() : null)
    .then(() => {
      applyLocale();
      return Promise.all([loadSettings(), loadConversations()]);
    })
    .then(() => {
      renderConversationList();
      renderMessages();
      setStatus("");
    })
    .catch((error) => {
      setStatus((error && error.message) || t("initializationFailed"));
    });
})();
