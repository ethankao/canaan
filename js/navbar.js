'use strict';

(() => {
  const logoUrl = 'https://www.test.com/';
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
        },
        {
          en: 'English Ministry',
          zh: '英語事工',
          enLink: '/ministries/english-ministry',
        },
        {
          en: 'Mandarin Ministry',
          zh: '華語事工',
          enLink: '/ministries/mandarin-ministry',
        },
        {
          en: 'Youth Ministry',
          zh: '青少年事工',
          enLink: '/ministries/youth-ministry',
        },
        {
          en: 'Children\'s Ministry',
          zh: '兒童事工',
          enLink: '/ministries/childrens-ministry',
        },
        {
          en: 'Family Ministry',
          zh: '家庭事工',
          enLink: '/ministries/family-ministry',
        },
      ]
    },
    {
      en: 'Growth',
      zh: '靈命成長',
      items: [
        {
          en: 'Sunday Schoool',
          zh: '主日學'
        }
      ]
    },
    {
      en: 'Fellowships',
      zh: '團契生活',
      items: [
        {
          en: 'TBD',
          zh: 'TBD'
        }
      ]
    },
    {
      en: '中文',
      zh: 'English',
      language: true
    }
  ];

  const ctas = [
    {
      en: 'Give',
      zh: '奉獻',
      enLink: 'https://tithe.ly/give_new/www/#/tithely/give-one-time/775254',
    }
  ];

  const entries = navbarItems
    .concat(navbarItems.flatMap((item) => item.items || []))
    .filter((item) => item.zhLink != null && item.enLink != null)
    .map((item) => [ item.zhLink, item.enLink ])
    .concat([[ '/', '/en']]);

  const toEnPaths = Object.fromEntries(entries);

  const toZhPaths = Object.fromEntries(
    entries.map(([key, value]) => [value, key])
  );

  function itemLi(item) {
    if (item.url) {
      return `      <li><a href="${item.url}">${item.text}</a></li>`;
    }
    return `      <li><a>${item.text}</a></li>`;
  }

  function parentItem(item) {
    const itemsTag = item.items.map(itemLi).join('\n  ');
    return `
      <li>
        <a>${item.text}</a>
        <ul class="p-2">
  ${itemsTag}
        </ul>
      </li>`;
  }

  function detailItem(item) {
    const itemsTag = item.items.map(itemLi).join('\n  ');
    return `
      <li>
      <details>
      <summary>${item.text}</summary>
      <ul class="p-2 z-[2]">
  ${itemsTag}
      </ul>
      </details>
      </li>`;
  }

  function navbarMenu(items) {
    let itemsTag = items
      .map(item => {
        if (item.items) {
          return detailItem(item);
        }
        return itemLi(item);
      })
      .join('\n');

    return `
    <ul class="menu menu-horizontal px-1">
      ${itemsTag}
    </ul>`;
  }

  function dropdown(items) {
    let itemsTag = items
      .map(item => {
        if (item.items) {
          return detailItem(item);
        }
        return itemLi(item);
      })
      .join('\n');

    return `
    <div class="dropdown dropdown-bottom dropdown-end">
      <div tabindex="0" role="button" class="btn btn-ghost lg:hidden">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h8m-8 6h16" /></svg>
      </div>
      <ul tabindex="0" class="dropdown-content z-[1] menu mt-3 p-2 shadow bg-base-100 rounded-box w-60">
${itemsTag}
      </ul>
    </div>`;
  }

  function itemConfig(isEn, item) {
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
      item.items.map((i) => itemConfig(isEn, i))
      : undefined;
    return {
      text: isEn ? item.en : item.zh,
      url: url,
      items: items
    };
  }

  function navbarStart(url) {
    return `
  <div class="navbar-start" >
    <a href="${url}">
    <img alt="Logo" width="96" height="40" decoding="async" data-nimg="1" style="color:transparent;object-fit:contain;object-position:left" src="https://cdn.jsdelivr.net/gh/ethankao/canaan@main/static/logo.png" />
    </a>
  </div>`;
  }

  function navbarCenter(items) {
    const menu = navbarMenu(items);
    return `
  <div class="navbar-center hidden lg:flex">
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
    const url = isEn ? '/en' : '/';
    const configs = navbarItems.map((item) => itemConfig(isEn, item));
    const ctasConfig = ctas.map((item) => itemConfig(isEn, item));
    const start = navbarStart(url);
    const center = navbarCenter(configs);
    const end = navbarEnd(ctasConfig, configs);
    return `
${start}
${center}
${end}
`;
  }

  function updateNavbar() {
    const nav = document.getElementsByTagName('nav')[0];
    if (!nav) { return; }

    const isEn = window.location.hash === '#en' || window.location.pathname === '/en';
    const html = navbar(isEn);
    nav.innerHTML = html;
  }

  updateNavbar();

})();
