'use strict';

(() => {

  const allowedPaths = {
    '/': 1,
    '/en': 1,
    '/ministries/youth-ministry': 1,
    '/ministries/mandarin-ministry': 1,
    'srcdoc': 1
  }

  // DOM observation

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootstrap);
  } else {
    bootstrap();
  }

  function bootstrap() {
    window.addEventListener('popstate', updateGallery);

    (function(history) {
      var _pushState = history.pushState;
      history.pushState = function() {
        const ret = _pushState.apply(history, arguments);
        updateGallery()
        return ret;
      };
    })(window.history);

    if (MutationObserver) {
      const root = document.getElementsByClassName('super-root')[0];
      if (root) {
        const rootObserver = new MutationObserver(() => {
          updateGallery();
        });
        rootObserver.observe(root, {
          childList: true,
          subtree: true
        })
      }
    }

    updateGallery();
  }

  function updateGallery() {
    if (!allowedPaths[window.location.pathname]) { return; }

    const targetClassName = 'notion-collection-gallery large';
    const gallery = Array.from(document.getElementsByClassName(targetClassName));

    if (gallery.length === 0) { return; }

    gallery.forEach((item) => {
      const className = item.className.replace(targetClassName, 'notion-collection-gallery highlight');
      item.className = className;
    })
  }

})();
