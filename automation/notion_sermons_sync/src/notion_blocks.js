function textType(text) {
  return [ { text: { content: text } } ];
}

function titleBlock(text) {
  return { title: textType(text) };
}

function heading2Block(text) {
  return {  heading_2: { rich_text: textType(text) } };
}

function heading3Block(text) {
  return {  heading_3: { rich_text: textType(text) } };
}

function paragraphBlock(text) {
  if (!text) { return null };

  return { paragraph: {
    rich_text: textType(text)
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
    if (/watch/.test(href)) { return href; }

    const url = new URL(href);
    if (url.host === 'youtu.be') {
      return `https://www.youtube.com/watch?v=${url.pathname.replace('/', '')}`
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
    return { video: { external: { url: youtubeLink(videoLink)} } };
  }
}

function leftColumnBlocks(videoLink, audioLink) {
  const blocks = [];
  const videoBlock = videoPlayerBlock(videoLink);
  if (videoBlock) {
    blocks.push(videoBlock);
  }

  if (audioLink) {
    let url = audioLink;
    if (audioLink.endsWith('/view')) {
      url = audioLink.replace('/view', '/preview')
    }
    blocks.push(heading3Block('Audio'), {
      embed: { url }
    })
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
  heading2Block,
  heading3Block,
  paragraphBlock,
  selectBlock,
  multiSelect,
  columnList,
  leftColumnBlocks,
  rightColumnBlocks,
  vimeoLink,
  youtubeLink,
  videoPlayerBlock,
  createVerseString,
};
