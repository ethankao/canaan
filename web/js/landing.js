'use strict';

(() => {
  if (window.location.host.endsWith("super.so")) {
    return;
  }

  const lang = navigator.language || navigator.userLanguage;
  const isChinese = lang == null || lang.toLocaleLowerCase().startsWith('zh');
  const path = isChinese ? '/zh' : '/en';
  window.location.pathname = path;
})();
