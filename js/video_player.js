'use strict';

(() => {

  const allowedPrefix = [
    '/sermons',
    '/en/gatherings/sermons',
    '/growth/videos',
    'srcdoc'
];

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

    if (url.host === 'youtu.be') {
      return `https://www.youtube.com/embed${url.pathname}`
    }

    const v = url.searchParams.get('v');
    if (!v) { return null; }

    return `https://www.youtube.com/embed/${v}`
  }

  function updatePlayer() {
    const allowed = allowedPrefix.some((prefix) => window.location.pathname.startsWith(prefix));
    if (!allowed) { return; }

    const targetClassName = 'notion-collection-card gallery';
    const cards = Array.from(document.getElementsByClassName(targetClassName));

    if (cards.length === 0) { return; }

    cards.forEach((card) => {
      const image = card.getElementsByTagName('img')[0];
      const prop = card.getElementsByClassName('notion-property__url')[0]

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
      iframe.className = `${image.className} player`;

      image.replaceWith(iframe);
    })
  }

})();

