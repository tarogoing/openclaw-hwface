(function () {
  const ext = globalThis.chrome || globalThis.browser;
  const i18n = globalThis.OpenClawI18n;

  const baseUrl = document.getElementById("baseUrl");
  const apiKey = document.getElementById("apiKey");
  const uiLanguage = document.getElementById("uiLanguage");
  const agentId = document.getElementById("agentId");
  const model = document.getElementById("model");
  const sessionKeyPrefix = document.getElementById("sessionKeyPrefix");
  const endpointMode = document.getElementById("endpointMode");
  const user = document.getElementById("user");
  const temperature = document.getElementById("temperature");
  const maxOutputTokens = document.getElementById("maxOutputTokens");
  const systemPrompt = document.getElementById("systemPrompt");
  const saveBtn = document.getElementById("saveBtn");
  const testBtn = document.getElementById("testBtn");
  const status = document.getElementById("status");
  const imageDebugOutput = document.getElementById("imageDebugOutput");
  const clearImageDebugBtn = document.getElementById("clearImageDebugBtn");
  const imageDebugDetails = document.getElementById("imageDebugDetails");
  const tabBtnSettings = document.getElementById("tabBtnSettings");
  const tabBtnImageDebug = document.getElementById("tabBtnImageDebug");
  const tabSettings = document.getElementById("tabSettings");
  const tabImageDebug = document.getElementById("tabImageDebug");

  function t(key) {
    return i18n ? i18n.t(key) : key;
  }

  function setStatus(text) {
    status.textContent = text || "";
  }

  function switchTab(name) {
    const states = {
      settings: name === "settings",
      imageDebug: name === "imageDebug",
    };
    tabBtnSettings.classList.toggle("active", states.settings);
    tabBtnImageDebug.classList.toggle("active", states.imageDebug);
    tabSettings.classList.toggle("active", states.settings);
    tabImageDebug.classList.toggle("active", states.imageDebug);
  }

  function applyLocale() {
    document.title = t("extSettingsTitle");
    document.getElementById("settingsTitle").textContent = t("extSettingsTitle");
    document.getElementById("settingsDesc").textContent = t("extSettingsDesc");
    document.getElementById("openclawHelpLinkLabel").textContent = t("openclawHelpLink");
    document.getElementById("openclawHelpHint").textContent = t("openclawHelpHint");
    document.getElementById("openclawHelpLink").textContent = t("openclawHelpLink");
    document.getElementById("labelBaseUrl").textContent = t("baseUrl");
    document.getElementById("labelGatewayToken").textContent = t("gatewayToken");
    document.getElementById("labelLanguage").textContent = t("language");
    document.getElementById("languageAuto").textContent = t("languageAuto");
    document.getElementById("languageEnUS").textContent = t("languageEnUS");
    document.getElementById("languageZhCN").textContent = t("languageZhCN");
    document.getElementById("languageZhTW").textContent = t("languageZhTW");
    document.getElementById("labelAgentId").textContent = t("agentId");
    document.getElementById("labelModel").textContent = t("model");
    document.getElementById("labelSessionKeyPrefix").textContent = t("sessionKeyPrefix");
    document.getElementById("labelEndpointMode").textContent = t("endpointMode");
    document.getElementById("endpointResponses").textContent = t("responsesApi");
    document.getElementById("endpointChat").textContent = t("chatApi");
    document.getElementById("labelUser").textContent = t("user");
    document.getElementById("labelTemperature").textContent = t("temperature");
    document.getElementById("labelMaxOutputTokens").textContent = t("maxOutputTokens");
    document.getElementById("labelSystemPrompt").textContent = t("systemPrompt");
    document.getElementById("imageDebugTitle").textContent = t("imageDebugTitle");
    document.getElementById("imageDebugDesc").textContent = t("imageDebugDesc");
    document.getElementById("imageDebugSummary").textContent = t("imageDebugTitle");
    tabBtnSettings.textContent = t("tabSettings");
    tabBtnImageDebug.textContent = t("tabImageDebug");
    saveBtn.textContent = t("saveSettings");
    testBtn.textContent = t("testConnection");
    clearImageDebugBtn.textContent = t("clearLog");
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

  async function loadSettings() {
    setStatus(t("loading"));
    const res = await sendRuntimeMessage({ type: "OPENCLAW_SETTINGS_GET" });
    if (!res.ok) throw new Error(res.error || "load settings failed");
    const settings = res.settings || {};
    baseUrl.value = settings.baseUrl || "";
    apiKey.value = settings.apiKey || "";
    uiLanguage.value = "";
    agentId.value = settings.agentId || "main";
    model.value = settings.model || "openclaw";
    sessionKeyPrefix.value = settings.sessionKeyPrefix || "openclaw-ext";
    endpointMode.value = settings.endpointMode || "responses";
    user.value = settings.user || "browser-extension";
    temperature.value = String(settings.temperature ?? "0.2");
    maxOutputTokens.value = settings.maxOutputTokens || "";
    systemPrompt.value = settings.systemPrompt || "";
    setStatus(t("loadReady"));
  }

  async function loadImageDebug() {
    const res = await sendRuntimeMessage({ type: "OPENCLAW_IMAGE_DEBUG_GET" });
    if (!res.ok) {
      imageDebugOutput.textContent = res.error || "Failed to load image debug.";
      return;
    }
    imageDebugOutput.textContent = res.debug ? JSON.stringify(res.debug, null, 2) : t("imageDebugEmpty");
  }

  saveBtn.addEventListener("click", async () => {
    setStatus(t("saving"));
    const res = await sendRuntimeMessage({
      type: "OPENCLAW_SETTINGS_SET",
      payload: {
        baseUrl: baseUrl.value.trim(),
        apiKey: apiKey.value.trim(),
        agentId: agentId.value.trim(),
        model: model.value.trim(),
        sessionKeyPrefix: sessionKeyPrefix.value.trim(),
        endpointMode: endpointMode.value,
        user: user.value.trim(),
        temperature: temperature.value.trim(),
        maxOutputTokens: maxOutputTokens.value.trim(),
        systemPrompt: systemPrompt.value.trim(),
      },
    });
    if (!res.ok) {
      setStatus(res.error || "save failed");
      return;
    }
    setStatus(t("saveSuccess"));
  });

  testBtn.addEventListener("click", async () => {
    setStatus(t("testing"));
    const res = await sendRuntimeMessage({
      type: "OPENCLAW_TEST_CONNECTION",
      payload: {
        endpointMode: endpointMode.value,
      },
    });
    if (!res.ok) {
      setStatus(`Test failed: ${res.error || "unknown error"}`);
      return;
    }
    setStatus(`${t("connected")}: HTTP ${res.status} via ${res.endpointMode}. Reply: ${res.text || "(empty)"}`);
  });

  clearImageDebugBtn.addEventListener("click", async () => {
    const res = await sendRuntimeMessage({ type: "OPENCLAW_IMAGE_DEBUG_CLEAR" });
    if (!res.ok) {
      setStatus(res.error || "clear image debug failed");
      return;
    }
    imageDebugOutput.textContent = t("imageDebugEmpty");
    imageDebugDetails.open = false;
    setStatus(t("cleared"));
  });

  tabBtnSettings.addEventListener("click", () => switchTab("settings"));
  tabBtnImageDebug.addEventListener("click", () => switchTab("imageDebug"));

  uiLanguage.addEventListener("change", async () => {
    if (!i18n || typeof i18n.setLocaleOverride !== "function") return;
    await i18n.setLocaleOverride(uiLanguage.value);
    applyLocale();
    await loadImageDebug();
    setStatus(t("loadReady"));
  });

  Promise.resolve(i18n && typeof i18n.init === "function" ? i18n.init() : null)
    .then(() => {
      if (i18n && typeof i18n.localeOverride === "function") {
        uiLanguage.value = i18n.localeOverride() || "";
      }
      applyLocale();
    });
  switchTab("settings");
  Promise.all([loadSettings(), loadImageDebug()]).catch((error) => {
    setStatus((error && error.message) || t("initializationFailed"));
  });
})();
