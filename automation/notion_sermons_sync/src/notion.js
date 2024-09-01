import { Client } from '@notionhq/client';

import { readFileAsJson } from './fs_utils.js';

const DATABASE_ID = '5b3cd3c02a3b4b34890c19ce0a1492ce';

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

function multiSelect(selections) {
  const multi_select = (selections || []).map(n => {
    return { name: n };
  });
  return { multi_select };
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

function leftColumnBlocks(videoLink, audioLink) {
  const url = youtubeLink(videoLink);
  const blocks = [{
    video: { external: { url } }
  }];

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

const ministryMap = {
  'MM': ['Mandarin Ministry'],
  'EM': ['English Ministry'],
  'TM': ['Taiwanese Ministry'],
  'All': ['Taiwanese Ministry', 'Mandarin Ministry', 'English Ministry'],
};

async function createNotionClient() {
  const tokens = await readFileAsJson('notion_token.json');
  // Initializing a client
  return new Client({
    auth: tokens.value
  });
}
async function createSermonRecord(notion, record, highlight) {
  const leftBlocks = leftColumnBlocks(record.videoLink, record.audioLink);
  const rightBlocks = rightColumnBlocks(record.topic, record.speakers, record.verses);

  const children = [ columnList([leftBlocks, rightBlocks]) ];
  if (record.description) {
    children.push(paragraphBlock(record.description));
  }
  const ministries = ministryMap[record.ministry];

  const pageBody = {
    parent: { database_id: DATABASE_ID },
    conver: { external: { url: 'https://www.notion.so/images/page-cover/gradients_8.png' } },
    icon: null,
    properties: {
      Name: titleBlock(record.topic),
      Date: { date: { start: record.date } },
      Highlight: { checkbox: highlight },
      Ministry: multiSelect(ministries),
      Tags: multiSelect(record.tags),
      Speakers: multiSelect(record.speakers),
      Verses: multiSelect(record.verses),
      'Audio Link': { url: record.audioLink },
      'Video Link': { url: record.videoLink }
    },
    children
  };
  const res = await notion.pages.create(pageBody);
  console.log(`Page Created ${res.id}`);
}

export default { createNotionClient, createSermonRecord };
