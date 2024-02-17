'use strict';

(() => {

  // zh_TW to en copies
  const navbarConfig = {
    '關於我們': { value: 'About Us', linkPrefix: true },
    '聚會與敬拜': { value: 'Sermons', linkPrefix: true },
    '教會事工': { value: 'Ministries', linkPrefix: true },
    '台語事工': { value: 'Taiwanese Ministries' },
    '英語事工': { value: 'English Ministries' },
    '華語事工': { value: 'Mandarin Ministries' },
    '青少事工': { value: 'Youth Ministries' },
    '兒童事工': { value: 'Children\'s Ministries' },
    '靈命成長': { value: 'Growth', linkPrefix: true },
    '團契生活': { value: 'Fellowships', linkPrefix: true },
    '新朋友專區': { value: 'Welcome', linkPrefix: true },
    '奉獻': { value: 'Give' },
  };

  const flipped = Object.entries(navbarConfig)
    .map(([key, value]) => [ value.value, { value: key, linkPrefix: value.linkPrefix } ]);

  // en to zh_TW copies
  const enNavbarConfig = Object.fromEntries(flipped);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootstrap);
  }
  else {
    bootstrap();
  }

  function bootstrap() {
    window.addEventListener('popstate', updateNavbar);

    (function(history) {
      var _pushState = history.pushState;
      history.pushState = function() {
        const ret = _pushState.apply(history, arguments);
        updateNavbar();
        return ret;
      };
    })(window.history);

    updateNavbar();
  }

  function updateNavbar() {
    const isEnglishPage = window.location.pathname.startsWith('/en');
    if (isEnglishPage) {
      toNavbar(navbarConfig, true);
    } else {
      toNavbar(enNavbarConfig, false);
    }
  }

  /* global __NEXT_DATA__ */
  function toNavbar(configuration, addPrefix) {
    // loop through items and lists. (currently visible)
    const items = Array.from(document.getElementsByClassName('notion-link super-navbar__item'));
    const lists = Array.from(document.getElementsByClassName('super-navbar__list'));
    const ctas = Array.from(document.getElementsByClassName('super-navbar__cta'));
    items.concat(lists).concat(ctas).forEach((item) => {
      const config = configuration[item.innerText];
      if (!config) { return; }

      item.innerText = config.value;

      if (!config.linkPrefix) { return; }

      const href = item.getAttribute('href');
      if (href && config.linkPrefix) {
        if (addPrefix) {
          item.setAttribute('href', '/en' + href);
        } else if (href.startsWith('/en')) {
          item.setAttribute('href', href.replace(/^\/en/, ''));
        }
      }
    });

    const links = __NEXT_DATA__.props.pageProps.settings.navbar.links || [];
    const allNestedLinks = links.flatMap((link) => link.list || []);
    links.concat(allNestedLinks).forEach((link) => {
      const config = configuration[link.label];
      if (!config) { return; }

      link.label = config.value;
      if (link.link && config.linkPrefix) {
        if (addPrefix) {
          link.link = '/en' + link.link;
        } else if (link.link.startsWith('/en/')) {
          link.link = link.link.replace(/^\/en/, '');
        }
      }
    });
  }

})();
