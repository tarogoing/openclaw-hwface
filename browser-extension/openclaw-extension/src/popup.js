(function () {
  const ext = globalThis.chrome || globalThis.browser;
  const i18n = globalThis.OpenClawI18n;
  const openPanelBtn = document.getElementById("openPanelBtn");
  const openSettings = document.getElementById("openSettings");
  const status = document.getElementById("status");
  const popupTitle = document.getElementById("popupTitle");
  const popupDesc = document.getElementById("popupDesc");

  function setStatus(text) {
    status.textContent = text || "";
  }

  function applyLocale() {
    if (!i18n) return;
    document.title = i18n.t("popupTitle");
    popupTitle.textContent = i18n.t("popupTitle");
    popupDesc.textContent = i18n.t("popupDesc");
    openPanelBtn.textContent = i18n.t("openPanel");
    openSettings.textContent = i18n.t("settings");
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

  function getActiveTab() {
    return new Promise((resolve, reject) => {
      if (!ext.tabs || typeof ext.tabs.query !== "function") {
        reject(new Error("tabs.query unavailable"));
        return;
      }
      try {
        ext.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          const err = ext.runtime && ext.runtime.lastError;
          if (err) return reject(new Error(err.message || "tabs.query failed"));
          resolve((tabs && tabs[0]) || null);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  async function openExtensionPanel() {
    if (ext.sidePanel && typeof ext.sidePanel.open === "function") {
      const tab = await getActiveTab();
      if (!tab || typeof tab.id !== "number") {
        throw new Error(i18n ? i18n.t("noActiveTab") : "No active tab found.");
      }
      if (typeof ext.sidePanel.setOptions === "function") {
        await ext.sidePanel.setOptions({
          tabId: tab.id,
          enabled: true,
          path: "panel.html",
        });
      }
      await ext.sidePanel.open({ tabId: tab.id });
      return;
    }

    if (ext.sidebarAction && typeof ext.sidebarAction.open === "function") {
      await ext.sidebarAction.open();
      return;
    }

    const fallback = await sendRuntimeMessage({ type: "OPENCLAW_OPEN_PANEL" });
    if (!fallback.ok) throw new Error(fallback.error || "Open side panel failed");
  }

  openPanelBtn.addEventListener("click", () => {
    Promise.resolve()
      .then(() => openExtensionPanel())
      .then(() => {
        setStatus(i18n ? i18n.t("opened") : "Right side panel opened.");
      })
      .catch((error) => {
        setStatus((error && error.message) || "Open side panel failed");
      });
  });

  openSettings.addEventListener("click", () => {
    if (ext.runtime && typeof ext.runtime.openOptionsPage === "function") {
      ext.runtime.openOptionsPage();
    }
  });

  Promise.resolve(i18n && typeof i18n.init === "function" ? i18n.init() : null)
    .then(() => {
      applyLocale();
    });
})();
