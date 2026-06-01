(function () {
  const ext = globalThis.chrome || globalThis.browser;
  const LOCALE_KEY = "openclawLocaleOverride";
  const DICT = {
    "en-US": {
      popupTitle: "Right Panel Launcher",
      popupDesc: "The main chat UI now lives in the browser right side panel. This popup stays as a quick launcher.",
      openPanel: "Open Right Side Panel",
      settings: "Settings",
      extSettingsTitle: "Extension Settings",
      extSettingsDesc: "Configure the Gateway URL, auth, and request mode. `responses` is better for file input, while `chat` is better for plain text compatibility.",
      openclawHelpLink: "OpenClaw Setup Help",
      openclawHelpHint: "Need help enabling `/v1/chat/completions` or `/v1/responses` in OpenClaw? Open the guide.",
      baseUrl: "Base URL",
      gatewayToken: "Gateway Token / Password",
      language: "Language",
      languageAuto: "Auto",
      languageEnUS: "English",
      languageZhCN: "Simplified Chinese",
      languageZhTW: "Traditional Chinese",
      agentId: "Agent ID",
      model: "Model",
      sessionKeyPrefix: "Session Key Prefix",
      endpointMode: "Endpoint Mode",
      responsesApi: "Responses API",
      chatApi: "Chat Completions API",
      user: "User",
      temperature: "Temperature",
      maxOutputTokens: "Max Output Tokens",
      systemPrompt: "System Prompt",
      saveSettings: "Save Settings",
      testConnection: "Test Connection",
      imageDebugTitle: "Image Debug",
      imageDebugDesc: "Shows the last image request payload in a redacted form.",
      imageDebugEmpty: "No image debug data yet.",
      clearLog: "Clear Log",
      cleared: "Cleared",
      tabSettings: "Settings",
      tabImageDebug: "Image Debug",
      sidePanel: "Right Side Panel",
      newConversation: "New Conversation",
      newChat: "New Chat",
      panelWelcome: "The right panel is connected. Streaming chat, local conversation history, and file/image input are supported here.",
      panelPlaceholder: "Type your message. Images will be sent as input_image, and other documents as input_file to OpenClaw.",
      attach: "Attach",
      send: "Send",
      loading: "Loading settings...",
      opened: "Right side panel opened.",
      noActiveTab: "No active tab found.",
      saveSuccess: "Saved",
      loadReady: "Ready",
      saving: "Saving...",
      testing: "Testing connection...",
      connected: "Connected",
      initializationFailed: "Initialization failed",
      inputRequired: "Please enter a message or choose a file.",
      settingsPending: "Settings are still loading.",
      responsesOnly: "Files are only supported in responses mode. Please switch it in settings first.",
      readingFiles: "Reading attachments...",
      sendFailed: "Send failed",
      done: "Done",
      thinking: "Thinking",
      sending: "Sending",
      waitingReply: "Waiting for OpenClaw response",
      attachmentIsolated: "Attachment mode: using an isolated temporary session",
      helpPageTitle: "OpenClaw Setup Help",
      helpBackToSettings: "Back to Settings",
      helpHeroTitle: "How to enable OpenClaw API endpoints",
      helpHeroDesc: "OpenClaw Gateway often ships with `/v1/chat/completions` and `/v1/responses` disabled by default. This page explains what to turn on before testing the extension.",
      helpNeedTitle: "What this extension needs",
      helpNeedBody: "The extension calls the Gateway directly. Plain text chat can use `/v1/chat/completions`, while attachments require `/v1/responses`.",
      helpDefaultTitle: "Default behavior to watch for",
      helpDefaultBody: "If those endpoints are not enabled in your OpenClaw config, connection tests usually return 404, 405, or endpoint-disabled style errors.",
      helpStepsTitle: "Recommended setup steps",
      helpStep1Title: "1. Open your OpenClaw Gateway config",
      helpStep1Body: "Find the configuration file or admin panel you use to start OpenClaw Gateway.",
      helpStep2Title: "2. Enable the OpenAI-compatible chat endpoint",
      helpStep2Body: "Turn on the route for `/v1/chat/completions` if you want text-only compatibility mode in the extension.",
      helpStep3Title: "3. Enable the Responses endpoint",
      helpStep3Body: "Turn on `/v1/responses` as well. This is the recommended mode for this extension, and it is required for images and other file attachments.",
      helpStep4Title: "4. Restart or reload Gateway",
      helpStep4Body: "After saving the config, restart OpenClaw Gateway so the new endpoint switches take effect.",
      helpStep5Title: "5. Test from the extension settings page",
      helpStep5Body: "Set the Base URL, choose `Responses API` or `Chat Completions API`, then click `Test Connection`.",
      helpTipsTitle: "Quick tips",
      helpTip1: "If you only need normal text chat, enabling `/v1/chat/completions` may be enough.",
      helpTip2: "If you want image upload or document upload, you must enable `/v1/responses`.",
      helpTip3: "If your Gateway uses a token or password, fill it into `Gateway Token / Password` in the extension settings.",
      helpTip4: "Keep your Base URL pointed at the Gateway root, for example `http://127.0.0.1:18789`.",
      helpNoteTitle: "Important note",
      helpNoteBody: "Different OpenClaw versions may name the switches differently. If your config file does not use these exact labels, look for options that enable the OpenAI-compatible chat route and the Responses route."
    },
    "zh-CN": {
      popupTitle: "\u53f3\u4fa7\u8fb9\u680f\u542f\u52a8\u5668",
      popupDesc: "\u4e3b\u804a\u5929\u754c\u9762\u73b0\u5728\u653e\u5728\u6d4f\u89c8\u5668\u53f3\u4fa7\u8fb9\u680f\u91cc\uff0c\u8fd9\u91cc\u4f5c\u4e3a\u5feb\u901f\u5165\u53e3\u4fdd\u7559\u3002",
      openPanel: "\u6253\u5f00\u53f3\u4fa7\u8fb9\u680f",
      settings: "\u8bbe\u7f6e",
      extSettingsTitle: "\u6269\u5c55\u8bbe\u7f6e",
      extSettingsDesc: "\u914d\u7f6e Gateway \u5730\u5740\u3001\u8ba4\u8bc1\u548c\u8bf7\u6c42\u6a21\u5f0f\u3002`responses` \u66f4\u9002\u5408\u6587\u4ef6\u8f93\u5165\uff0c`chat` \u66f4\u9002\u5408\u7eaf\u6587\u672c\u517c\u5bb9\u8c03\u7528\u3002",
      openclawHelpLink: "OpenClaw \u914d\u7f6e\u5e2e\u52a9",
      openclawHelpHint: "\u5982\u679c\u4e0d\u786e\u5b9a\u600e\u4e48\u6253\u5f00 `/v1/chat/completions` \u6216 `/v1/responses`\uff0c\u53ef\u4ee5\u6253\u5f00\u8fd9\u4e2a\u6307\u5357\u3002",
      baseUrl: "Base URL",
      gatewayToken: "Gateway \u4ee4\u724c / \u5bc6\u7801",
      language: "\u8bed\u8a00",
      languageAuto: "\u8ddf\u968f\u6d4f\u89c8\u5668",
      languageEnUS: "\u82f1\u6587",
      languageZhCN: "\u7b80\u4f53\u4e2d\u6587",
      languageZhTW: "\u7e41\u9ad4\u4e2d\u6587",
      agentId: "Agent ID",
      model: "Model",
      sessionKeyPrefix: "Session Key Prefix",
      endpointMode: "Endpoint \u6a21\u5f0f",
      responsesApi: "Responses API",
      chatApi: "Chat Completions API",
      user: "User",
      temperature: "Temperature",
      maxOutputTokens: "Max Output Tokens",
      systemPrompt: "System Prompt",
      saveSettings: "\u4fdd\u5b58\u8bbe\u7f6e",
      testConnection: "\u6d4b\u8bd5\u8fde\u63a5",
      imageDebugTitle: "\u56fe\u7247\u8c03\u8bd5",
      imageDebugDesc: "\u663e\u793a\u6700\u8fd1\u4e00\u6b21\u56fe\u7247\u8bf7\u6c42\u7684\u8131\u654f\u8f7d\u8377\u3002",
      imageDebugEmpty: "\u6682\u65e0\u56fe\u7247\u8c03\u8bd5\u6570\u636e\u3002",
      clearLog: "\u6e05\u9664\u65e5\u5fd7",
      cleared: "\u5df2\u6e05\u9664",
      tabSettings: "\u8bbe\u7f6e",
      tabImageDebug: "\u56fe\u7247\u8c03\u8bd5",
      sidePanel: "\u53f3\u4fa7\u8fb9\u680f",
      newConversation: "\u65b0\u4f1a\u8bdd",
      newChat: "\u65b0\u5efa\u804a\u5929",
      panelWelcome: "\u53f3\u4fa7\u8fb9\u680f\u5df2\u8fde\u63a5\u3002\u8fd9\u91cc\u652f\u6301\u6d41\u5f0f\u5bf9\u8bdd\u3001\u672c\u5730\u4f1a\u8bdd\u8bb0\u5f55\uff0c\u4ee5\u53ca\u56fe\u7247/\u6587\u4ef6\u8f93\u5165\u3002",
      panelPlaceholder: "\u8f93\u5165\u6d88\u606f\u3002\u56fe\u7247\u4f1a\u4f5c\u4e3a input_image\uff0c\u5176\u4ed6\u6587\u6863\u4f1a\u4f5c\u4e3a input_file \u53d1\u9001\u7ed9 OpenClaw\u3002",
      attach: "\u6dfb\u52a0\u9644\u4ef6",
      send: "\u53d1\u9001",
      loading: "\u6b63\u5728\u52a0\u8f7d\u8bbe\u7f6e...",
      opened: "\u53f3\u4fa7\u8fb9\u680f\u5df2\u6253\u5f00\u3002",
      noActiveTab: "\u672a\u627e\u5230\u5f53\u524d\u6d3b\u52a8\u6807\u7b7e\u9875\u3002",
      saveSuccess: "\u5df2\u4fdd\u5b58",
      loadReady: "\u5c31\u7eea",
      saving: "\u6b63\u5728\u4fdd\u5b58...",
      testing: "\u6b63\u5728\u6d4b\u8bd5\u8fde\u63a5...",
      connected: "\u8fde\u63a5\u6210\u529f",
      initializationFailed: "\u521d\u59cb\u5316\u5931\u8d25",
      inputRequired: "\u8bf7\u8f93\u5165\u6d88\u606f\u6216\u9009\u62e9\u6587\u4ef6\u3002",
      settingsPending: "\u8bbe\u7f6e\u8fd8\u5728\u52a0\u8f7d\u4e2d\u3002",
      responsesOnly: "\u6587\u4ef6\u53ea\u80fd\u5728 responses \u6a21\u5f0f\u4e0b\u4f7f\u7528\uff0c\u8bf7\u5148\u5728\u8bbe\u7f6e\u4e2d\u5207\u6362\u3002",
      readingFiles: "\u6b63\u5728\u8bfb\u53d6\u9644\u4ef6...",
      sendFailed: "\u53d1\u9001\u5931\u8d25",
      done: "\u5b8c\u6210",
      thinking: "\u601d\u8003\u4e2d",
      sending: "\u53d1\u9001\u4e2d",
      waitingReply: "\u6b63\u5728\u7b49\u5f85 OpenClaw \u56de\u590d",
      attachmentIsolated: "\u9644\u4ef6\u6a21\u5f0f\uff1a\u6b63\u5728\u4f7f\u7528\u9694\u79bb\u7684\u4e34\u65f6\u4f1a\u8bdd",
      helpPageTitle: "OpenClaw \u914d\u7f6e\u5e2e\u52a9",
      helpBackToSettings: "\u8fd4\u56de\u8bbe\u7f6e\u9875",
      helpHeroTitle: "\u5982\u4f55\u6253\u5f00 OpenClaw API \u7aef\u70b9",
      helpHeroDesc: "OpenClaw Gateway \u5f88\u591a\u65f6\u5019\u9ed8\u8ba4\u4e0d\u4f1a\u6253\u5f00 `/v1/chat/completions` \u548c `/v1/responses`\u3002\u8fd9\u4e2a\u9875\u9762\u4f1a\u8bf4\u660e\u6269\u5c55\u6d4b\u8bd5\u4e4b\u524d\u9700\u8981\u5148\u5f00\u542f\u54ea\u4e9b\u80fd\u529b\u3002",
      helpNeedTitle: "\u8fd9\u4e2a\u6269\u5c55\u9700\u8981\u4ec0\u4e48",
      helpNeedBody: "\u6269\u5c55\u4f1a\u76f4\u63a5\u8c03\u7528 Gateway\u3002\u7eaf\u6587\u672c\u804a\u5929\u53ef\u4ee5\u4f7f\u7528 `/v1/chat/completions`\uff0c\u800c\u9644\u4ef6\u9700\u8981 `/v1/responses`\u3002",
      helpDefaultTitle: "\u9ed8\u8ba4\u884c\u4e3a\u9700\u8981\u7559\u610f",
      helpDefaultBody: "\u5982\u679c\u8fd9\u4e24\u4e2a\u7aef\u70b9\u6ca1\u6709\u5728 OpenClaw \u914d\u7f6e\u4e2d\u5f00\u542f\uff0c\u8fde\u63a5\u6d4b\u8bd5\u901a\u5e38\u4f1a\u8fd4\u56de 404\u3001405\uff0c\u6216\u7c7b\u4f3c\u201cendpoint disabled\u201d\u7684\u9519\u8bef\u3002",
      helpStepsTitle: "\u63a8\u8350\u914d\u7f6e\u6b65\u9aa4",
      helpStep1Title: "1. \u6253\u5f00 OpenClaw Gateway \u914d\u7f6e",
      helpStep1Body: "\u627e\u5230\u4f60\u7528\u6765\u542f\u52a8 OpenClaw Gateway \u7684\u914d\u7f6e\u6587\u4ef6\u6216\u7ba1\u7406\u9762\u677f\u3002",
      helpStep2Title: "2. \u6253\u5f00 OpenAI \u517c\u5bb9\u7684 Chat \u7aef\u70b9",
      helpStep2Body: "\u5982\u679c\u4f60\u60f3\u5728\u6269\u5c55\u91cc\u4f7f\u7528\u7eaf\u6587\u672c\u517c\u5bb9\u6a21\u5f0f\uff0c\u8bf7\u5f00\u542f `/v1/chat/completions` \u5bf9\u5e94\u7684\u8def\u7531\u3002",
      helpStep3Title: "3. \u6253\u5f00 Responses \u7aef\u70b9",
      helpStep3Body: "\u540c\u65f6\u5f00\u542f `/v1/responses`\u3002\u8fd9\u662f\u8fd9\u4e2a\u6269\u5c55\u66f4\u63a8\u8350\u7684\u6a21\u5f0f\uff0c\u4e5f\u662f\u56fe\u7247\u548c\u5176\u4ed6\u6587\u4ef6\u9644\u4ef6\u7684\u5fc5\u8981\u6761\u4ef6\u3002",
      helpStep4Title: "4. \u91cd\u542f\u6216\u91cd\u65b0\u52a0\u8f7d Gateway",
      helpStep4Body: "\u4fdd\u5b58\u914d\u7f6e\u540e\uff0c\u91cd\u542f OpenClaw Gateway\uff0c\u8ba9\u65b0\u7684\u7aef\u70b9\u5f00\u5173\u751f\u6548\u3002",
      helpStep5Title: "5. \u56de\u5230\u6269\u5c55\u8bbe\u7f6e\u9875\u6d4b\u8bd5",
      helpStep5Body: "\u586b\u5199 Base URL\uff0c\u9009\u62e9 `Responses API` \u6216 `Chat Completions API`\uff0c\u7136\u540e\u70b9\u51fb `\u6d4b\u8bd5\u8fde\u63a5`\u3002",
      helpTipsTitle: "\u5feb\u901f\u63d0\u793a",
      helpTip1: "\u5982\u679c\u4f60\u53ea\u9700\u8981\u666e\u901a\u6587\u672c\u804a\u5929\uff0c\u53ea\u6253\u5f00 `/v1/chat/completions` \u4e5f\u53ef\u4ee5\u3002",
      helpTip2: "\u5982\u679c\u4f60\u8981\u4f7f\u7528\u56fe\u7247\u4e0a\u4f20\u6216\u6587\u6863\u4e0a\u4f20\uff0c\u5fc5\u987b\u6253\u5f00 `/v1/responses`\u3002",
      helpTip3: "\u5982\u679c Gateway \u6709 token \u6216\u5bc6\u7801\uff0c\u8bb0\u5f97\u586b\u5230\u6269\u5c55\u8bbe\u7f6e\u91cc\u7684 `Gateway \u4ee4\u724c / \u5bc6\u7801`\u3002",
      helpTip4: "\u8bf7\u628a Base URL \u6307\u5411 Gateway \u6839\u5730\u5740\uff0c\u4f8b\u5982 `http://127.0.0.1:18789`\u3002",
      helpNoteTitle: "\u91cd\u8981\u8bf4\u660e",
      helpNoteBody: "\u4e0d\u540c OpenClaw \u7248\u672c\u7684\u5f00\u5173\u540d\u79f0\u53ef\u80fd\u4e0d\u5b8c\u5168\u4e00\u6837\u3002\u5982\u679c\u4f60\u7684\u914d\u7f6e\u6587\u4ef6\u6ca1\u6709\u8fd9\u4e9b\u5b57\u6bb5\uff0c\u8bf7\u67e5\u627e\u201c\u542f\u7528 OpenAI \u517c\u5bb9 Chat \u8def\u7531\u201d\u548c\u201c\u542f\u7528 Responses \u8def\u7531\u201d\u7c7b\u4f3c\u7684\u9009\u9879\u3002"
    },
    "zh-TW": {
      popupTitle: "\u53f3\u5074\u908a\u6b04\u555f\u52d5\u5668",
      popupDesc: "\u4e3b\u804a\u5929\u4ecb\u9762\u73fe\u5728\u653e\u5728\u700f\u89bd\u5668\u53f3\u5074\u908a\u6b04\uff0c\u9019\u88e1\u4f5c\u70ba\u5feb\u901f\u5165\u53e3\u4fdd\u7559\u3002",
      openPanel: "\u6253\u958b\u53f3\u5074\u908a\u6b04",
      settings: "\u8a2d\u5b9a",
      extSettingsTitle: "\u64f4\u5145\u5957\u4ef6\u8a2d\u5b9a",
      extSettingsDesc: "\u8a2d\u5b9a Gateway \u4f4d\u5740\u3001\u8a8d\u8b49\u8207\u8acb\u6c42\u6a21\u5f0f\u3002`responses` \u66f4\u9069\u5408\u6a94\u6848\u8f38\u5165\uff0c`chat` \u66f4\u9069\u5408\u7d14\u6587\u5b57\u76f8\u5bb9\u547c\u53eb\u3002",
      openclawHelpLink: "OpenClaw \u8a2d\u5b9a\u8aaa\u660e",
      openclawHelpHint: "\u5982\u679c\u4e0d\u78ba\u5b9a\u600e\u9ebc\u958b\u555f `/v1/chat/completions` \u6216 `/v1/responses`\uff0c\u53ef\u4ee5\u6253\u958b\u9019\u500b\u6307\u5357\u3002",
      baseUrl: "Base URL",
      gatewayToken: "Gateway Token / \u5bc6\u78bc",
      language: "\u8a9e\u8a00",
      languageAuto: "\u8ddf\u96a8\u700f\u89bd\u5668",
      languageEnUS: "English",
      languageZhCN: "\u7c21\u9ad4\u4e2d\u6587",
      languageZhTW: "\u7e41\u9ad4\u4e2d\u6587",
      agentId: "Agent ID",
      model: "Model",
      sessionKeyPrefix: "Session Key Prefix",
      endpointMode: "Endpoint \u6a21\u5f0f",
      responsesApi: "Responses API",
      chatApi: "Chat Completions API",
      user: "User",
      temperature: "Temperature",
      maxOutputTokens: "Max Output Tokens",
      systemPrompt: "System Prompt",
      saveSettings: "\u5132\u5b58\u8a2d\u5b9a",
      testConnection: "\u6e2c\u8a66\u9023\u7dda",
      imageDebugTitle: "\u5716\u7247\u9664\u932f",
      imageDebugDesc: "\u986f\u793a\u6700\u8fd1\u4e00\u6b21\u5716\u7247\u8acb\u6c42\u7684\u8131\u654f\u8f09\u8377\u3002",
      imageDebugEmpty: "\u76ee\u524d\u6c92\u6709\u5716\u7247\u9664\u932f\u8cc7\u6599\u3002",
      clearLog: "\u6e05\u9664\u65e5\u8a8c",
      cleared: "\u5df2\u6e05\u9664",
      tabSettings: "\u8a2d\u5b9a",
      tabImageDebug: "\u5716\u7247\u9664\u932f",
      sidePanel: "\u53f3\u5074\u908a\u6b04",
      newConversation: "\u65b0\u6703\u8a71",
      newChat: "\u65b0\u589e\u804a\u5929",
      panelWelcome: "\u53f3\u5074\u908a\u6b04\u5df2\u9023\u7dda\u3002\u9019\u88e1\u652f\u63f4\u4e32\u6d41\u5c0d\u8a71\u3001\u672c\u5730\u6703\u8a71\u8a18\u9304\uff0c\u4ee5\u53ca\u5716\u7247/\u6a94\u6848\u8f38\u5165\u3002",
      panelPlaceholder: "\u8f38\u5165\u8a0a\u606f\u3002\u5716\u7247\u6703\u4f5c\u70ba input_image\uff0c\u5176\u4ed6\u6587\u4ef6\u6703\u4f5c\u70ba input_file \u50b3\u9001\u7d66 OpenClaw\u3002",
      attach: "\u9644\u52a0",
      send: "\u9001\u51fa",
      loading: "\u6b63\u5728\u8f09\u5165\u8a2d\u5b9a...",
      opened: "\u53f3\u5074\u908a\u6b04\u5df2\u6253\u958b\u3002",
      noActiveTab: "\u627e\u4e0d\u5230\u76ee\u524d\u4f7f\u7528\u4e2d\u7684\u5206\u9801\u3002",
      saveSuccess: "\u5df2\u5132\u5b58",
      loadReady: "\u5c31\u7dd2",
      saving: "\u6b63\u5728\u5132\u5b58...",
      testing: "\u6b63\u5728\u6e2c\u8a66\u9023\u7dda...",
      connected: "\u9023\u7dda\u6210\u529f",
      initializationFailed: "\u521d\u59cb\u5316\u5931\u6557",
      inputRequired: "\u8acb\u8f38\u5165\u8a0a\u606f\u6216\u9078\u64c7\u6a94\u6848\u3002",
      settingsPending: "\u8a2d\u5b9a\u4ecd\u5728\u8f09\u5165\u4e2d\u3002",
      responsesOnly: "\u6a94\u6848\u53ea\u80fd\u5728 responses \u6a21\u5f0f\u4e0b\u4f7f\u7528\uff0c\u8acb\u5148\u5230\u8a2d\u5b9a\u5207\u63db\u3002",
      readingFiles: "\u6b63\u5728\u8b80\u53d6\u9644\u4ef6...",
      sendFailed: "\u9001\u51fa\u5931\u6557",
      done: "\u5b8c\u6210",
      thinking: "\u601d\u8003\u4e2d",
      sending: "\u50b3\u9001\u4e2d",
      waitingReply: "\u6b63\u5728\u7b49\u5f85 OpenClaw \u56de\u8986",
      attachmentIsolated: "\u9644\u4ef6\u6a21\u5f0f\uff1a\u6b63\u5728\u4f7f\u7528\u9694\u96e2\u7684\u66ab\u6642\u6703\u8a71",
      helpPageTitle: "OpenClaw \u8a2d\u5b9a\u8aaa\u660e",
      helpBackToSettings: "\u8fd4\u56de\u8a2d\u5b9a\u9801",
      helpHeroTitle: "\u5982\u4f55\u958b\u555f OpenClaw API \u7aef\u9ede",
      helpHeroDesc: "OpenClaw Gateway \u5f88\u591a\u6642\u5019\u9810\u8a2d\u4e0d\u6703\u958b\u555f `/v1/chat/completions` \u548c `/v1/responses`\u3002\u9019\u500b\u9801\u9762\u6703\u8aaa\u660e\u5728\u6e2c\u8a66\u64f4\u5145\u5957\u4ef6\u4e4b\u524d\uff0c\u9700\u8981\u5148\u6253\u958b\u54ea\u4e9b\u529f\u80fd\u3002",
      helpNeedTitle: "\u9019\u500b\u64f4\u5145\u5957\u4ef6\u9700\u8981\u4ec0\u9ebc",
      helpNeedBody: "\u64f4\u5145\u5957\u4ef6\u6703\u76f4\u63a5\u547c\u53eb Gateway\u3002\u7d14\u6587\u5b57\u804a\u5929\u53ef\u4ee5\u4f7f\u7528 `/v1/chat/completions`\uff0c\u9644\u4ef6\u5247\u9700\u8981 `/v1/responses`\u3002",
      helpDefaultTitle: "\u9810\u8a2d\u884c\u70ba\u9700\u8981\u7559\u610f",
      helpDefaultBody: "\u5982\u679c\u9019\u5169\u500b\u7aef\u9ede\u6c92\u6709\u5728 OpenClaw \u8a2d\u5b9a\u4e2d\u958b\u555f\uff0c\u9023\u7dda\u6e2c\u8a66\u901a\u5e38\u6703\u56de\u50b3 404\u3001405\uff0c\u6216\u985e\u4f3c\u201cendpoint disabled\u201d\u7684\u932f\u8aa4\u3002",
      helpStepsTitle: "\u5efa\u8b70\u7684\u8a2d\u5b9a\u6b65\u9a5f",
      helpStep1Title: "1. \u6253\u958b OpenClaw Gateway \u8a2d\u5b9a",
      helpStep1Body: "\u627e\u5230\u4f60\u7528\u4f86\u555f\u52d5 OpenClaw Gateway \u7684\u8a2d\u5b9a\u6a94\u6216\u7ba1\u7406\u9762\u677f\u3002",
      helpStep2Title: "2. \u958b\u555f OpenAI \u76f8\u5bb9\u7684 Chat \u7aef\u9ede",
      helpStep2Body: "\u5982\u679c\u4f60\u60f3\u5728\u64f4\u5145\u5957\u4ef6\u4e2d\u4f7f\u7528\u7d14\u6587\u5b57\u76f8\u5bb9\u6a21\u5f0f\uff0c\u8acb\u958b\u555f `/v1/chat/completions` \u5c0d\u61c9\u7684\u8def\u7531\u3002",
      helpStep3Title: "3. \u958b\u555f Responses \u7aef\u9ede",
      helpStep3Body: "\u540c\u6642\u958b\u555f `/v1/responses`\u3002\u9019\u662f\u9019\u500b\u64f4\u5145\u5957\u4ef6\u66f4\u63a8\u85a6\u7684\u6a21\u5f0f\uff0c\u4e5f\u662f\u5716\u7247\u8207\u5176\u4ed6\u6a94\u6848\u9644\u4ef6\u7684\u5fc5\u8981\u689d\u4ef6\u3002",
      helpStep4Title: "4. \u91cd\u555f\u6216\u91cd\u65b0\u8f09\u5165 Gateway",
      helpStep4Body: "\u5132\u5b58\u8a2d\u5b9a\u5f8c\uff0c\u91cd\u555f OpenClaw Gateway\uff0c\u8b93\u65b0\u7684\u7aef\u9ede\u958b\u95dc\u751f\u6548\u3002",
      helpStep5Title: "5. \u56de\u5230\u64f4\u5145\u5957\u4ef6\u8a2d\u5b9a\u9801\u6e2c\u8a66",
      helpStep5Body: "\u586b\u5beb Base URL\uff0c\u9078\u64c7 `Responses API` \u6216 `Chat Completions API`\uff0c\u7136\u5f8c\u9ede\u64ca `\u6e2c\u8a66\u9023\u7dda`\u3002",
      helpTipsTitle: "\u5feb\u901f\u63d0\u793a",
      helpTip1: "\u5982\u679c\u4f60\u53ea\u9700\u8981\u4e00\u822c\u6587\u5b57\u804a\u5929\uff0c\u53ea\u958b\u555f `/v1/chat/completions` \u4e5f\u53ef\u4ee5\u3002",
      helpTip2: "\u5982\u679c\u4f60\u9700\u8981\u4e0a\u50b3\u5716\u7247\u6216\u6587\u4ef6\uff0c\u5fc5\u9808\u958b\u555f `/v1/responses`\u3002",
      helpTip3: "\u5982\u679c Gateway \u4f7f\u7528 token \u6216\u5bc6\u78bc\uff0c\u8a18\u5f97\u586b\u5165\u64f4\u5145\u5957\u4ef6\u8a2d\u5b9a\u4e2d\u7684 `Gateway Token / \u5bc6\u78bc`\u3002",
      helpTip4: "\u8acb\u5c07 Base URL \u6307\u5411 Gateway \u6839\u4f4d\u5740\uff0c\u4f8b\u5982 `http://127.0.0.1:18789`\u3002",
      helpNoteTitle: "\u91cd\u8981\u8aaa\u660e",
      helpNoteBody: "\u4e0d\u540c OpenClaw \u7248\u672c\u7684\u958b\u95dc\u540d\u7a31\u53ef\u80fd\u4e0d\u5b8c\u5168\u4e00\u6a23\u3002\u5982\u679c\u4f60\u7684\u8a2d\u5b9a\u6a94\u6c92\u6709\u9019\u4e9b\u6a19\u7c64\uff0c\u8acb\u67e5\u627e\u985e\u4f3c\u201c\u555f\u7528 OpenAI \u76f8\u5bb9 Chat \u8def\u7531\u201d\u8207\u201c\u555f\u7528 Responses \u8def\u7531\u201d\u7684\u9078\u9805\u3002"
    }
  };

  function detectBrowserLocale() {
    const raw =
      (ext && ext.i18n && typeof ext.i18n.getUILanguage === "function" && ext.i18n.getUILanguage()) ||
      globalThis.navigator.language ||
      "en-US";
    const lang = String(raw || "").toLowerCase();
    if (lang.startsWith("zh-tw") || lang.startsWith("zh-hk") || lang.startsWith("zh-mo") || lang.includes("hant")) {
      return "zh-TW";
    }
    if (lang.startsWith("zh")) return "zh-CN";
    return "en-US";
  }

  function localStorageGet(key) {
    return new Promise((resolve) => {
      if (!ext || !ext.storage || !ext.storage.local) return resolve(null);
      try {
        ext.storage.local.get([key], (result) => {
          resolve(result && result[key] ? result[key] : null);
        });
      } catch {
        resolve(null);
      }
    });
  }

  function localStorageSet(values) {
    return new Promise((resolve) => {
      if (!ext || !ext.storage || !ext.storage.local) return resolve();
      try {
        ext.storage.local.set(values, () => resolve());
      } catch {
        resolve();
      }
    });
  }

  let localeOverride = null;

  function resolveLocale() {
    return localeOverride || detectBrowserLocale();
  }

  function t(key) {
    const locale = resolveLocale();
    return (DICT[locale] && DICT[locale][key]) || DICT["en-US"][key] || key;
  }

  async function init() {
    const saved = await localStorageGet(LOCALE_KEY);
    const next = String(saved || "").trim();
    localeOverride = next === "en-US" || next === "zh-CN" || next === "zh-TW" ? next : null;
    return resolveLocale();
  }

  async function setLocaleOverride(next) {
    const value = String(next || "").trim();
    localeOverride = value === "en-US" || value === "zh-CN" || value === "zh-TW" ? value : null;
    await localStorageSet({ [LOCALE_KEY]: localeOverride || "" });
    return resolveLocale();
  }

  globalThis.OpenClawI18n = {
    t,
    locale: resolveLocale,
    localeOverride: () => localeOverride,
    init,
    setLocaleOverride,
  };
})();
