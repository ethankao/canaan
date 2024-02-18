'use strict';

(() => {

  // zh_TW to en copies
  const navbarConfig = {
    '關於我們': { value: 'About Us', linkPrefix: true },
    '聚會與敬拜': { value: 'Sermons', linkPrefix: true },
    '教會事工': { value: 'Ministries' },
    '台語事工': { value: 'Taiwanese Ministry' },
    '英語事工': { value: 'English Ministry' },
    '華語事工': { value: 'Mandarin Ministry' },
    '青少事工': { value: 'Youth Ministry' },
    '兒童事工': { value: 'Children\'s Ministry' },
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
  } else {
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

    if (MutationObserver) {
      const observer = new MutationObserver(() => {
        updateNavbar()}
      );
      const navbar = document.getElementsByClassName('super-navbar balanced')[0];
      if (navbar) {
        observer.observe(navbar, {
          subtree: true,
          childList: true
        })
      }
    }

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

  function toNavbar(configuration, addPrefix) {
    // loop through items and lists. (currently visible)
    const items = Array.from(document.getElementsByClassName('notion-link super-navbar__item'));
    const headingItems = Array.from(document.getElementsByClassName('super-navbar__list-item-heading'));
    // update side menu
    const menuList = Array.from(document.getElementsByClassName('super-navbar__menu-list'));
    const menuItems = menuList.flatMap((element) => Array.from(element.getElementsByTagName('span')));
    const lists = Array.from(document.getElementsByClassName('super-navbar__list'));
    const ctas = Array.from(document.getElementsByClassName('super-navbar__cta'));
    items.concat(headingItems).concat(menuItems).concat(lists).concat(ctas).forEach((item) => {
      const config = configuration[item.innerText];
      if (!config) { return; }

      item.innerText = config.value;

      if (!config.linkPrefix) { return; }

      const href = item.getAttribute('href');
      if (href && config.linkPrefix) {
        if (addPrefix) {
          item.setAttribute('href', '/en' + href);
          // stop React to handle the action
          item.addEventListener('click', (event) => {
            event.stopImmediatePropagation();
          }, true);
        } else if (href.startsWith('/en')) {
          item.setAttribute('href', href.replace(/^\/en/, ''));
        }
      }
    });
  }

})();
