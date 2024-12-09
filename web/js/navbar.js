'use strict';

(() => {
  const logoUrl = 'https://cdn.jsdelivr.net/gh/ethankao/canaan@main/web/static/logo.png';
  const navbarItems = [
    {
      en: 'About Us',
      zh: '關於我們',
      enLink: '/en/about-us',
      zhLink: '/about-us'
    },
    {
      en: 'Gatherings',
      zh: '聚會與敬拜',
      items: [
        {
          en: 'Worship Gathering',
          zh: '時間與地點',
          enLink: '/en/gatherings/service-information',
          zhLink: '/worship/locations'
        },
        {
          en: 'Sermon Recordings',
          zh: '主日信息',
          enLink: '/en/gatherings/sermons',
          zhLink: '/sermons'
        }
      ]
    },
    {
      en: 'Ministries',
      zh: '教會事工',
      items: [
        {
          en: 'Taiwanese Ministry',
          zh: '台語事工',
          enLink: '/ministries/taiwanese-ministry',
          enOrder: 1,
        },
        {
          en: 'Mandarin Ministry',
          zh: '華語事工',
          enLink: '/ministries/mandarin-ministry',
          enOrder: 2,
        },
        {
          en: 'English Ministry',
          zh: '英語事工',
          enLink: '/ministries/english-ministry',
          enOrder: 0,
          items: [
            {
              en: 'Home',
              zh: '主頁',
              enLink: '/ministries/english-ministry',
            },
            {
              en: 'Announcements',
              zh: '最新公告',
              enLink: '/ministries/english-ministry/announcements',
            },
            {
              en: 'Fellowships',
              zh: '團契生活',
              enLink: '/en/fellowships/en',
            }
          ]
        },
        {
          en: 'Youth Ministry',
          zh: '青少事工',
          enLink: '/ministries/youth-ministry',
        },
        {
          en: 'Children\'s Ministry',
          zh: '兒童事工',
          items: [
            {
              en: 'Home',
              zh: '主頁',
              enLink: '/ministries/childrens-ministry',
            },
            {
              en: 'Sunday Programs',
              zh: '主日崇拜',
              enLink: '/ministries/childrens-ministry/sunday-programs',
            },
            {
              en: 'Announcements',
              zh: '最新公告',
              enLink: '/ministries/childrens-ministry/announcements',
            }
          ]
        },
        {
          en: 'Family Ministry',
          zh: '家庭事工',
          enLink: '/en/ministries/family-ministry',
          zhLink: '/ministries/family-ministry',
        },
      ]
    },
    {
      en: 'Growth',
      zh: '靈命成長',
      items: [
        {
          en: 'Sunday School',
          zh: '主日學',
          enLink: '/en/growth/sunday-school',
          zhLink: '/growth/sunday-school'
        },
        {
          en: 'Blog',
          zh: '文章分享',
          enLink: '/growth/blog'
        },
        {
          en: 'Testimony (Video)',
          zh: '見證分享 (影音)',
          enLink: '/growth/videos'
        },
        {
          en: 'Event Highlights',
          zh: '活動花絮',
          enLink: '/photos'
        }
      ]
    },
    {
      en: 'Fellowships',
      zh: '團契生活',
      items: [
        {
          en: 'Taiwanese Fellowships',
          zh: '台語團契',
          enLink: '/en/fellowships/tm',
          zhLink: '/fellowships/tm',
          enOrder: 1,
        },
        {
          en: 'Mandarin Fellowships',
          zh: '華語團契',
          zhLink: '/fellowships/mm',
          enOrder: 2,
        },
        {
          en: 'English Fellowships',
          zh: '英語團契',
          enLink: '/en/fellowships/en',
          enOrder: 0,
        }
      ]
    },
    {
      en: '中文',
      zh: 'English',
      language: true
    }
  ];

  const ctas = [];

  const zhEnPathes = [
    ['/zh', '/en'],
    ['/fellowships/tm/cupertino', '/en/fellowships/tm/cupertino'],
    ['/fellowships/tm/fremont', '/en/fellowships/tm/fremont'],
    ['/fellowships/tm/mid-peninsula', '/en/fellowships/tm/mid-peninsula'],
    ['/fellowships/tm/milpitas', '/en/fellowships/tm/milpitas'],
    ['/fellowships/tm/palo-alto', '/en/fellowships/tm/palo-alto'],
    ['/fellowships/tm/saratoga', '/en/fellowships/tm/saratoga'],
    ['/fellowships/tm/living-springs', '/en/fellowships/tm/living-springs'],
    ['/fellowships/tm/living-stones', '/en/fellowships/tm/living-stones'],
    ['/fellowships/tm/tyfm', '/en/fellowships/tm/tyfm'],
  ];

  const entries = navbarItems
    .concat(navbarItems.flatMap((item) => item.items || []))
    .filter((item) => item.zhLink != null && item.enLink != null)
    .map((item) => [ item.zhLink, item.enLink ])
    .concat(zhEnPathes);

  const toEnPaths = Object.fromEntries(entries);

  const toZhPaths = Object.fromEntries(
    entries.map(([key, value]) => [value, key])
  );

  // DOM observation

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
        updateNavbar()
        return ret;
      };
    })(window.history);

    if (MutationObserver) {
      const root = document.getElementsByClassName('super-root')[0];
      if (root) {
        const rootObserver = new MutationObserver(() => {
          updateLinks();
        });
        rootObserver.observe(root, {
          childList: true,
          subtree: true
        })
      }
    }

    updateNavbar();
  }

  // Navbar HTML

  function itemLi(item) {
    if (item.items) {
      return detailsItem(item);
    }

    let content;
    if (item.url) {
      content = `<a href="${item.url}">${item.text}</a>`;
    } else {
      content = `<a>${item.text}</a>`;
    }
    return `      <li>${content}</li>`
  }

  function dropdownItem(item) {
    const itemsTag = item.items.map(itemLi).join('\n  ');
    return `
      <li>
      <div class="dropdown dropdown-bottom dropdown-hover">
      <div tabindex="0">${item.text}</div>
      <ul class="menu dropdown-content p-2 z-[12] shadow bg-base-100 rounded-box min-w-32 max-2-80 w-max">
  ${itemsTag}
      </ul>
      </div>
      </li>
    `;
  }

  function navbarMenu(items) {
    let itemsTag = items
      .map(item => {
        if (item.items) {
          return dropdownItem(item);
        }
        return itemLi(item);
      })
      .join('\n');

    return `
    <ul class="menu lg:menu-lg menu-horizontal px-1">
      ${itemsTag}
    </ul>`;
  }

  function detailsItem(item) {
    const itemsTag = item.items.map(itemLi).join('\n  ');
    return `
     <li>
     <details>
     <summary>${item.text}</summary>
     <ul class="p-2 z-[12] md:min-w-32 md:max-2-80 md:w-max">
  ${itemsTag}
     </ul>
     </details>
     </li>`;
  }

  function dropdown(items) {
    let itemsTag = items
      .map(item => {
        if (item.items) {
          return detailsItem(item);
        }
        return itemLi(item);
      })
      .join('\n');

    return `
    <div class="dropdown dropdown-bottom dropdown-end">
      <div tabindex="0" role="button" class="btn btn-ghost lg:hidden md:hidden">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h8m-8 6h16" /></svg>
      </div>
      <ul tabindex="0" class="dropdown-content z-[12] menu menu-lg mt-3 p-2 shadow bg-base-100 rounded-box w-smenu">
${itemsTag}
      </ul>
    </div>`;
  }

  function itemConfig(isEn, item, index) {
    let url, addHash = isEn;
    if (item.language) {
      addHash = !isEn;
      url = window.location.pathname;
      const mapping = addHash ? toEnPaths: toZhPaths;
      url = mapping[url] || url;
    } else {
      url = isEn ? item.enLink || item.zhLink : item.zhLink || item.enLink;
    }
    if (addHash && url) {
      url = `${url}#en`;
    }

    const items = item.items ?
      item.items.map((i, index) => itemConfig(isEn, i, index))
      : undefined;

    let sortedItems;
    if (isEn && items) {
      sortedItems = items.sort((a, b) => { return a.enOrder - b.enOrder; })
    }
    const enOrder = item.enOrder !== undefined ? item.enOrder : index;
    return {
      text: isEn ? item.en : item.zh,
      url: url,
      items: sortedItems || items,
      enOrder: enOrder
    };
  }

  function navbarStart(url, logoUrl) {
    return `
  <div class="navbar-start" >
    <a href="${url}">
    <img alt="Logo" width="96" height="40" decoding="async" data-nimg="1" style="color:transparent;object-fit:contain;object-position:left" src="${logoUrl}" />
    </a>
  </div>`;
  }

  function navbarCenter(items) {
    const menu = navbarMenu(items);
    return `
  <div class="navbar-center hidden lg:flex md:flex">
${menu}
  </div>`;
  }

  function navbarEnd(ctas, items) {
    const buttons = ctas
      .map((cta) => `    <a class="btn  btn-neutral bg-[#462a6f] px-6 h-8 min-h-8" href="${cta.url}">${cta.text}</a>`)
      .join('\n');

    const dropdownTag = dropdown(items);
    return `
  <div class="navbar-end">
${buttons}
${dropdownTag}
  </div>`;
  }

  function navbar(isEn) {
    //const isEn = window.location.hash === '#en' || window.location.pathname === '/en';
    const configs = navbarItems.map((item) => itemConfig(isEn, item));
    const ctasConfig = ctas.map((item) => itemConfig(isEn, item));

    const url = isEn ? '/en' : '/zh';
    const start = navbarStart(url, logoUrl);
    const center = navbarCenter(configs);
    const end = navbarEnd(ctasConfig, configs);
    return `
${start}
${center}
${end}
`;
  }

  function updateLanguageSwitcher(nav, isEn) {
    Array.from(nav.getElementsByTagName('a'))
      .filter((item) => item.innerText.trim() === 'English' || item.innerText.trim() === '中文')
      .forEach((item) => {
        const href = window.location.pathname;
        updateLinkItem(item, href, item.getAttribute('href'), !isEn)
      });
  }

  function updateNavbar() {
    const nav = document.getElementsByTagName('nav')[0];
    if (!nav) { return; }

    const isEn = window.location.hash === '#en' || window.location.pathname === '/en';
    const loc = isEn ? 'en' : 'zh';
    if (nav.classList.length > 0 && nav.getAttribute('loc') == loc) {
      updateLanguageSwitcher(nav, isEn);
      return;
    }

    nav.className = 'navbar bg-base-100 py-2';
    nav.setAttribute('data-theme', 'light');
    nav.setAttribute('loc', loc);
    const html = navbar(isEn);
    nav.innerHTML = html;

    updateFooterIcons();
  }

  function updateFooterIcons() {
    const footerIconContainer = document.getElementsByClassName('super-footer__icons')[0];
    if (!footerIconContainer) { return; }

    const icons = footerIconContainer.getElementsByTagName('a');
    if (!icons) { return; }

    const lastIcon = icons[icons.length - 1];
    const href = lastIcon.href || '';
    if (href.includes('tithe.ly')) { return; }

    const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="24px" height="24px"><!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.-->
  <title>Give</title>
  <path fill="#434240" d="M256 416c114.9 0 208-93.1 208-208S370.9 0 256 0 48 93.1 48 208s93.1 208 208 208zM233.8 97.4V80.6c0-9.2 7.4-16.6 16.6-16.6h11.1c9.2 0 16.6 7.4 16.6 16.6v17c15.5 .8 30.5 6.1 43 15.4 5.6 4.1 6.2 12.3 1.2 17.1L306 145.6c-3.8 3.7-9.5 3.8-14 1-5.4-3.4-11.4-5.1-17.8-5.1h-38.9c-9 0-16.3 8.2-16.3 18.3 0 8.2 5 15.5 12.1 17.6l62.3 18.7c25.7 7.7 43.7 32.4 43.7 60.1 0 34-26.4 61.5-59.1 62.4v16.8c0 9.2-7.4 16.6-16.6 16.6h-11.1c-9.2 0-16.6-7.4-16.6-16.6v-17c-15.5-.8-30.5-6.1-43-15.4-5.6-4.1-6.2-12.3-1.2-17.1l16.3-15.5c3.8-3.7 9.5-3.8 14-1 5.4 3.4 11.4 5.1 17.8 5.1h38.9c9 0 16.3-8.2 16.3-18.3 0-8.2-5-15.5-12.1-17.6l-62.3-18.7c-25.7-7.7-43.7-32.4-43.7-60.1 .1-34 26.4-61.5 59.1-62.4zM480 352h-32.5c-19.6 26-44.6 47.7-73 64h63.8c5.3 0 9.6 3.6 9.6 8v16c0 4.4-4.3 8-9.6 8H73.6c-5.3 0-9.6-3.6-9.6-8v-16c0-4.4 4.3-8 9.6-8h63.8c-28.4-16.3-53.3-38-73-64H32c-17.7 0-32 14.3-32 32v96c0 17.7 14.3 32 32 32h448c17.7 0 32-14.3 32-32v-96c0-17.7-14.3-32-32-32z"/>
</svg>
    `;

    const giving = document.createElement('a');
    giving.href = 'https://tithe.ly/give_new/www/#/tithely/give-one-time/775254';
    giving.innerHTML = svg;
    giving.target = '_blank';
    giving.rel = 'noopener noreferrer';

    footerIconContainer.insertBefore(giving, lastIcon.nextSibling);
  }

  // Update Page Links

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
      const path = toZhPaths[href];
      if (path) {
        item.setAttribute('href', path);
      } else if (href !== currentHref) {
        item.setAttribute('href', href);
      }
    }
  }


  function updateLinks() {
    const isEn = window.location.hash === '#en' || window.location.pathname === '/en';
    updatePageLinks(isEn)
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
