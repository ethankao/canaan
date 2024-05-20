'use strict';

(() => {

  // DOM observation

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootstrap);
  } else {
    bootstrap();
  }

  function bootstrap() {
    if (MutationObserver) {
      const root = document.getElementsByClassName('super-root')[0];
      if (root) {
        const rootObserver = new MutationObserver(() => {
          updatePlayer();
        });
        rootObserver.observe(root, {
          childList: true,
          subtree: true
        })
      }
    }

    updatePlayer();
  }

  function vimeoHref(href) {
    if (/player/.test(href)) {
      return href;
    }
    const url = new URL(href);
    return `https://player.vimeo.com/video${url.pathname}`;
  }

  function youtubeHref(href) {
    if (/embed/.test(href)) {
      return href;
    }
    const url = new URL(href);
    const v = url.searchParams.get('v');
    if (!v) { return null; }

    return `https://www.youtube.com/embed/${v}`
  }

  function updatePlayer() {
    const targetClassName = 'notion-collection-card gallery';
    const cards = Array.from(document.getElementsByClassName(targetClassName));

    if (cards.length === 0) { return; }

    cards.forEach((item) => {
      const image = item.getElementsByTagName('img')[0];
      const prop = item.getElementsByClassName('notion-property__url')[0]

      if (!image || !prop) { return; }

      const link = prop.getElementsByTagName('a')[0];
      if (!link) { return; }

      const href = link.getAttribute('href') || '';

      let url;
      if (/vimeo/i.test(href)) {
        url = vimeoHref(href);
      } else if (/youtu/i.test(href)) {
        url = youtubeHref(href);
      }

      if (!url) { return; }

      const iframe = document.createElement('iframe');
      iframe.setAttribute('src', url);
      iframe.setAttribute('frameborder', '0');
      iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
      iframe.setAttribute('allowfullscreen', '1');
      iframe.className = image.className;

      image.replaceWith(iframe);
    })
  }

})();

