(function () {
  const i18n = globalThis.OpenClawI18n;

  function t(key) {
    return i18n ? i18n.t(key) : key;
  }

  function setText(id, key) {
    const node = document.getElementById(id);
    if (node) node.textContent = t(key);
  }

  function applyLocale() {
    document.title = t("helpPageTitle");
    setText("helpBackToSettings", "helpBackToSettings");
    setText("helpHeroTitle", "helpHeroTitle");
    setText("helpHeroDesc", "helpHeroDesc");
    setText("helpNeedTitle", "helpNeedTitle");
    setText("helpNeedBody", "helpNeedBody");
    setText("helpDefaultTitle", "helpDefaultTitle");
    setText("helpDefaultBody", "helpDefaultBody");
    setText("helpStepsTitle", "helpStepsTitle");
    setText("helpStep1Title", "helpStep1Title");
    setText("helpStep1Body", "helpStep1Body");
    setText("helpStep2Title", "helpStep2Title");
    setText("helpStep2Body", "helpStep2Body");
    setText("helpStep3Title", "helpStep3Title");
    setText("helpStep3Body", "helpStep3Body");
    setText("helpStep4Title", "helpStep4Title");
    setText("helpStep4Body", "helpStep4Body");
    setText("helpStep5Title", "helpStep5Title");
    setText("helpStep5Body", "helpStep5Body");
    setText("helpTipsTitle", "helpTipsTitle");
    setText("helpTip1", "helpTip1");
    setText("helpTip2", "helpTip2");
    setText("helpTip3", "helpTip3");
    setText("helpTip4", "helpTip4");
    setText("helpNoteTitle", "helpNoteTitle");
    setText("helpNoteBody", "helpNoteBody");
  }

  Promise.resolve(i18n && typeof i18n.init === "function" ? i18n.init() : null).then(applyLocale);
})();
