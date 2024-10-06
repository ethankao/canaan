function textType(text, options = {}) {
  const { url, color, bold } = options;

  const textBlock = {
    text: { content: text }
  };
  if (url) {
    textBlock.text.link = { url };
  }

  if (color) {
    textBlock.annotations = {
      bold: bold || false,
      color
    };
  }
  return [ textBlock ];
}

function titleBlock(text, options) {
  return { title: textType(text, options) };
}

function richText(text, options) {
  if (!text) {
    return;
  }
  return { rich_text: textType(text, options) };
}

function linkText(text, url) {
  if (!url) {
    return null;
  }

  return {
    rich_text: textType(text, { url })
  };
}

function heading2Block(text, options) {
  return {  heading_2: { rich_text: textType(text, options) } };
}

/// options. url, color, bold
function heading3Block(text, options) {
  return {  heading_3: { rich_text: textType(text, options) } };
}

/// options. url, color, bold
function paragraphBlock(text, options) {
  if (!text) { return null };

  return { paragraph: {
    rich_text: textType(text, options)
  } };
}

function selectBlock(selection) {
  if (!selection || selection.trim() === '') {
    return null;
  }

  return { select: { name: selection} };
}

function multiSelect(selections) {
  if (!selections || selections.length == 0) {
    return null;
  }

  const multi_select = (selections || []).map(n => {
    return { name: n };
  });
  return { multi_select };
}

function vimeoLink(href) {
  if (/player/.test(href)) {
    return href;
  }
  const url = new URL(href);
  if (url.pathname) {
    const paths = url.pathname.split('/');
    if (paths.length > 2) {
      return `https://player.vimeo.com/video/${paths[1]}?h=${paths[2]}`;
    }
  }
  return `https://player.vimeo.com/video${url.pathname}`;
}

function youtubeLink(href) {
  const url = new URL(href);
  var videoId;
  if (/watch/.test(href)) {
    videoId = url.searchParams.get('v') || url.searchParams.get('V');
  } else if (url.host === 'youtu.be') {
    videoId = url.pathname.replace('/', '');
  } else {
    return href;
  }

  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}`;
  }

  return href;
}

function createVerseString(verses) {
  if (!verses || verses.length == 0) {
    return null;
  }

  const seenBooks = [];
  return verses
    .reduce((acc, cur) => {
      const cArray = cur.split(' ');
      if (cArray.length < 2) {
        acc.push(cur);
        return acc;
      } else if (!seenBooks.includes(cArray[0])) {
        seenBooks.push(cArray[0]);
        acc.push(cur);
      } else {
        cArray.shift();
        acc.push(cArray.join(''));
      }

      return acc;
    }, [])
    .join(', ')
}

function videoPlayerBlock(videoLink) {
  if (/vimeo/i.test(videoLink)) {
    return { embed: { url: vimeoLink(videoLink) } };
  } else if (/youtu/i.test(videoLink)) {
    const link = youtubeLink(videoLink);
    const text = `super-embed:\n<iframe width="100%" style="aspect-ratio:16/9;border-radius:var(--callout-border-radii)" src="${link}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`;

    return { code: {
      rich_text: textType(text),
      language: 'javascript'
    } };
  }
  return { embed: { url: videoLink } };
}

function leftColumnBlocks(videoLink, audioLink) {
  const blocks = [];
  const videoBlock = videoPlayerBlock(videoLink);
  if (videoBlock) {
    blocks.push(videoBlock);
  }

  if (audioLink) {
    let url = audioLink;
    if (audioLink.includes('/view')) {
      url = audioLink.replace('/view', '/preview')
    }

    const text = `super-embed:\n<iframe width="100%" height="100%" style="aspect-ratio:2/1;border-radius:var(--callout-border-radii)" src="${url}" allow="autoplay"></iframe>`;
    const audioBlock = { code: {
      rich_text: textType(text),
      language: 'javascript'
    } };
    blocks.push(heading3Block('Audio'), audioBlock);
  }
  return blocks;
}

function rightColumnBlocks(title, speakers, verses) {
  const blocks = [heading2Block(title)];

  const vString = createVerseString(verses);
  if (vString) {
    blocks.push(heading3Block(vString));
  }

  if (speakers && speakers.length > 0) {
    const speakersStr = speakers.join(', ');
    blocks.push(paragraphBlock(speakersStr));
  }
  return blocks;
}

function columnList(columnBlocks) {
  const columns = columnBlocks.map( c => {
    return {
      column: { children: c }}
  });
  return { column_list: { children: columns } };
}

export {
  textType,
  titleBlock,
  richText,
  heading2Block,
  heading3Block,
  paragraphBlock,
  selectBlock,
  multiSelect,
  columnList,
  leftColumnBlocks,
  linkText,
  rightColumnBlocks,
  vimeoLink,
  youtubeLink,
  videoPlayerBlock,
  createVerseString,
};
