import { Client } from '@notionhq/client';

import { readFileAsJson } from './fs_utils.js';

import {
  titleBlock,
  paragraphBlock,
  multiSelect,
  columnList,
  leftColumnBlocks,
  rightColumnBlocks,
} from './notion_blocks.js'

// const DATABASE_ID = '5b3cd3c02a3b4b34890c19ce0a1492ce'; // real
const DATABASE_ID = '223d59a574244c0b991871c3351bb714'; // test

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

function urlBox(url) {
  if (!url) {
    return null;
  }
  return { url };
}

async function createSermonRecord(notion, record, highlight) {
  const leftBlocks = leftColumnBlocks(record.videoLink, record.audioLink);
  const rightBlocks = rightColumnBlocks(record.topic, record.speakers, record.verses);

  const children = [ columnList([leftBlocks, rightBlocks]) ];
  if (record.description) {
    children.push(paragraphBlock(record.description));
  }
  const ministries = ministryMap[record.ministry];

  const propEntries = [
    [ 'Name', titleBlock(record.topic) ],
    [ 'Date', { date: { start: record.date } } ],
    [ 'Highlight', { checkbox: highlight } ],
    [ 'Ministry', multiSelect(ministries) ],
    [ 'Tags', multiSelect(record.tags) ],
    [ 'Speakers', multiSelect(record.speakers) ],
    [ 'Verses', multiSelect(record.verses) ],
    [ 'Audio Link', urlBox(record.audioLink) ],
    [ 'Video Link', urlBox(record.videoLink) ]
  ].filter(n => !!n[1]);

  const pageBody = {
    parent: { database_id: DATABASE_ID },
    conver: { external: { url: 'https://www.notion.so/images/page-cover/gradients_8.png' } },
    icon: null,
    properties: Object.fromEntries(propEntries),
    children
  };

  console.log(`Page Payload: ${JSON.stringify(pageBody)}`);
  const res = await notion.pages.create(pageBody);
  console.log(`Page Created ${res.id}`);
}

export default { createNotionClient, createSermonRecord };
