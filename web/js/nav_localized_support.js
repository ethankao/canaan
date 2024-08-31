'use strict';

(() => {

  // zh_TW to en copies
  const navbarConfig = {
    '關於我們': { value: 'About Us' },
    '聚會與敬拜': { value: 'Gatherings' },
    '時間與地點': { value: 'Worship Gathering' },
    '主日信息': { value: 'Sermon Recordings' },
    '教會事工': { value: 'Ministries' },
    '台語事工': { value: 'Taiwanese Ministry' },
    '英語事工': { value: 'English Ministry' },
    '華語事工': { value: 'Mandarin Ministry' },
    '青少年事工': { value: 'Youth Ministry' },
    '兒童事工': { value: 'Children\'s Ministry' },
    '靈命成長': { value: 'Growth' },
    '團契生活': { value: 'Fellowships' },
    '奉獻': { value: 'Give' },
    'English': { value: '中文' }
  };

  const toEnPaths = {
    '/': '/en',
    '/about-us': '/en/about-us',
    '/sermons': '/en/gatherings/sermons',
    '/worship/locations': '/en/service-information'
  };

  const toChPaths = Object.fromEntries(
    Object.entries(toEnPaths).map(([key, value]) => [value, key])
  );

  const flipped = Object.entries(navbarConfig)
    .map(([key, value]) => [ value.value, { value: key } ]);

  // en to zh_TW copies
  const enNavbarConfig = Object.fromEntries(flipped);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootstrap);
  } else {
    bootstrap();
  }

  function bootstrap() {
    window.addEventListener('popstate', updateNavAndLinks);

    (function(history) {
      var _pushState = history.pushState;
      history.pushState = function() {
        const ret = _pushState.apply(history, arguments);
        updateNavAndLinks();
        return ret;
      };
    })(window.history);

    if (MutationObserver) {
      const root = document.getElementsByClassName('super-root')[0];
      if (root) {
        const rootObserver = new MutationObserver((mutationList) => {
          updateMutations(mutationList);
        });
        rootObserver.observe(root, {
          childList: true,
          subtree: true
        })
      }
    }

    updateNavAndLinks();
  }

  function updateMutations(mutationList) {
    let nav, page, menuItem;
    mutationList.forEach((mutation) => {
      if (mutation.addedNodes.length > 0) {
        if (mutation.target.className.includes('super-navigation-menu__list')) {
          menuItem = true;
        } else if (mutation.target.className.includes('super-nav')) {
          nav = true;
        } else if (mutation.target.className !== '') {
          page = true;
        }
      }
    });

    if (nav) {
      updateNavBar();
    }
    if (menuItem) {
      // need to clean up somehow
      setTimeout(() => {
        updateOpenMenu();
      }, 80);
    }
    if (page) {
      updateLinksOnly()
    }
  }

  function updateNavAndLinks() {
    updateNavBar()
    updateLinksOnly()
  }

  function updateNavBar() {
    const isEn = window.location.hash === '#en' || window.location.pathname === '/en';
    const configuration = isEn ? navbarConfig : enNavbarConfig;
    toNavbar(configuration, isEn);
  }

  function updateOpenMenu() {
    const nav = document.getElementsByClassName('super-navbar')[0];
    if (!nav) { return; }

    const isEn = window.location.hash === '#en' || window.location.pathname === '/en';
    const configuration = isEn ? navbarConfig : enNavbarConfig;

    const items = Array.from(nav.getElementsByClassName('super-navigation-menu__list open'))
      .flatMap((list) => { return Array.from(list.getElementsByClassName('notion-link super-navigation-menu__item')) })
    toNavbarItrems(configuration, items, isEn)
  }

  function updateLinksOnly() {
    const isEn = window.location.hash === '#en' || window.location.pathname === '/en';
    updatePageLinks(isEn)
  }

  function updateLinkItem(item, href, currentHref, toEnglish) {
    if (!item || !href) {
      return;
    }

    if (toEnglish) {
      const path = toEnPaths[href];
      if (path) {
        item.setAttribute('href', path + '#en');
      } else if (!href.endsWith('#en')) {
        item.setAttribute('href', href + '#en');
      } else if (href !== currentHref){
        item.setAttribute('href', href);
      }
      item.addEventListener('click', (event) => {
        event.stopImmediatePropagation();
      }, true);
    } else {
      if (href.endsWith('#en')) {
        href = href.replace(/#en$/, '');
      }
      const path = toChPaths[href];
      if (path) {
        item.setAttribute('href', path);
      } else if (href !== currentHref) {
        item.setAttribute('href', href);
      }
    }
  }


  function toNavbar(configuration, toEn) {
    const nav = document.getElementsByClassName('super-navbar')[0];
    if (!nav) { return; }
    // loop through items and lists. (currently visible)
    const logos = Array.from(nav.getElementsByClassName('notion-link super-navbar__logo'));
    const ctas = Array.from(document.getElementsByClassName('super-navbar__cta'));

    let allItems;
    const menu = document.getElementsByClassName('super-navbar__menu-wrapper enter')[0] || document.getElementsByClassName('super-navbar__menu-wrapper enter-done')[0];
    if (menu) {
      // update side menu
      const items = Array.from(menu.getElementsByClassName('notion-link super-navigation-menu__item'));
      const lists = Array.from(menu.getElementsByClassName('super-navigation-menu__list'));
      allItems = logos.concat(ctas).concat(items).concat(lists);
    } else {
      const items = Array.from(nav.getElementsByClassName('notion-link super-navbar__item'));
      const lists = Array.from(nav.getElementsByClassName('super-navbar__list'));
      const listItems = Array.from(nav.getElementsByClassName('notion-link super-navbar__list-item'));
      allItems = logos.concat(ctas).concat(items).concat(lists).concat(listItems);
    }

    toNavbarItrems(configuration, allItems, toEn);
  }

  function toNavbarItrems(configuration, items, toEn) {
    items.forEach((item) => {
      const pTag = item.getElementsByTagName('p')[0];
      const textTag = pTag || item;
      if (textTag.innerText) {
        const config = configuration[textTag.innerText.trim()];
        if (config) {
          textTag.innerText = config.value;
        }
      }

      // update language switcher
      const currentHref = item.getAttribute('href');
      let href;
      let enTarget = toEn;
      if (textTag.innerText.trim() === 'English' || textTag.innerText.trim() === '中文') {
        item.removeAttribute('target');
        href = window.location.pathname;
        enTarget = !toEn;
      } else {
        enTarget = toEn;
        href = currentHref;
      }

      updateLinkItem(item, href, currentHref, enTarget);
    });
  }

  function updatePageLinks(isEn) {
    // links in page content
    const content = document.getElementsByTagName('main')[0];
    const footer = document.getElementsByClassName('super-footer')[0];

    const contentLinks = content ? Array.from(content.getElementsByTagName('a')) : [];
    const footerLinks = footer ? Array.from(footer.getElementsByTagName('a')) : [];

    contentLinks.concat(footerLinks)
      .forEach((item) => {
        const href = item.getAttribute('href');
        if (!href || !href.startsWith('/')) {
          return;
        }

        updateLinkItem(item, href, href, isEn);
      });
  }
})();
