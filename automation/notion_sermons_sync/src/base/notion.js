import { Client } from '@notionhq/client';

import { readFileAsJson } from './fs_utils.js';
import { sleep } from './utils.js';

import {
  titleBlock,
  richText,
  paragraphBlock,
  selectBlock,
  multiSelect,
  columnList,
  leftColumnBlocks,
  linkText,
  rightColumnBlocks,
  heading2Block,
  videoPlayerBlock,
  heading3Block,
} from './notion_blocks.js'

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

async function createVideoTestimonyRecord(notion, database_id, record, highlight) {
  const children = [
    heading2Block(record.topic),
    videoPlayerBlock(record.videoLink)
  ];

  const ministries = ministryMap[record.ministry];
  const propEntries = [
    [ 'Name', titleBlock(record.topic) ],
    [ 'Category', selectBlock('Testimony') ],
    [ 'Date', { date: { start: record.date } } ],
    [ 'Highlight', { checkbox: highlight } ],
    [ 'Ministry', multiSelect(ministries) ],
    [ 'Tags', multiSelect(record.tags) ],
    [ 'Speakers', multiSelect(record.speakers) ],
    [ 'Video Link', urlBox(record.videoLink) ]
  ].filter(n => !!n[1]);

  const pageBody = {
    parent: { database_id },
    cover: { external: { url: 'https://www.notion.so/images/page-cover/gradients_8.png' } },
    icon: null,
    properties: Object.fromEntries(propEntries),
    children
  };

  console.log(`Video Page Payload: ${JSON.stringify(pageBody)}`);
  const res = await notion.pages.create(pageBody);
  console.log(`Video Page Created ${res.id}`);
}

async function createSermonRecord(notion, database_id, record, highlight) {
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
    [ 'Video Link', urlBox(record.videoLink) ],
    [ 'Newsletter', urlBox(record.newsletter) ],
    [ 'Weekly Verse', richText(record.weeklyVerse) ],
  ].filter(n => !!n[1]);

  const pageBody = {
    parent: { database_id },
    cover: { external: { url: 'https://www.notion.so/images/page-cover/gradients_8.png' } },
    icon: null,
    properties: Object.fromEntries(propEntries),
    children
  };

  console.log(`Sermon Page Payload: ${JSON.stringify(pageBody)}`);
  const res = await notion.pages.create(pageBody);
  console.log(`Sermon Page Created ${res.id}`);
  return res.id;
}

async function latestSermon(notion, database_id, ministry) {
  if (!ministry) {
    console.log('Invalid Ministry');
    return;
  }

  const response = await notion.databases.query({
    database_id,
    filter: {
      and: [
        {
          property: 'Ministry',
          multi_select: { contains: ministry }
        },
      ],
    },
    sorts: [
      {
        property: 'Date',
        direction: 'descending',
      },
    ],
    page_size: 1
  });

  return response.results[0];
}

async function updateSermonHighlight(notion, database_id) {
  // find out what needs to be highlighted
  const latestMM = await latestSermon(notion, database_id, ministryMap['MM'][0]);
  await sleep(350);

  const latestEM = await latestSermon(notion, database_id, ministryMap['EM'][0]);
  await sleep(350);

  const latestTM = await latestSermon(notion, database_id, ministryMap['TM'][0]);

  const idSet = new Set();
  const newHighlights = [latestMM, latestEM, latestTM]
    .filter(n => !!n)
    .filter(n => { // unique
      const ret = !idSet.has(n.id);
      idSet.add(n.id);
      return ret;
    })
    .filter(n => !n.properties?.Highlight?.checkbox);

  if (newHighlights.length === 0) {
    console.log('No need to udpate');
    return;
  }

  console.log(`new highligt ${newHighlights.length}`);

  await sleep(350);

  // find out what needs to be unhighlighted
  var response = await notion.databases.query({
    database_id,
    filter: {
      and: [
        {
          property: 'Highlight',
          checkbox: { equals: true, },
        }
      ],
    },
    sorts: [
      {
        property: 'Date',
        direction: 'descending',
      },
    ],
  });

  const unhighlights = response.results
    .filter(n => !!n)
    .filter(n => !idSet.has(n.id)); // not in target set.
  console.log(`remove highlights ${unhighlights.length}`);

  for (const n of newHighlights) {
    await sleep(350);
    await updateRecordProperty(notion, n.id, { 'Highlight': { checkbox: true } });
  }

  for (const n of unhighlights) {
    await sleep(350);
    await updateRecordProperty(notion, n.id, { 'Highlight': { checkbox: false } });
  }

  // for updating mm website.
  if (latestMM.properties?.Highlight?.checkbox === false) {
    return latestMM;
  }
}

async function updateRecordProperty(notion, pageId, properties) {
  const response = await notion.pages.update({
    page_id: pageId,
    properties
  });
  const name = JSON.stringify(response?.properties?.Name?.title?.[0]?.text?.content || {});
  console.log(`Updated ${name} ${pageId} for ${JSON.stringify(properties)}`);
}

async function updateMMPage(notion, pageId, databaseRecord) {
  if (!databaseRecord) {
    return;
  }

  const weeklyVerse = databaseRecord.properties?.['Weekly Verse']?.rich_text?.[0]?.plain_text;
  const videoLink = databaseRecord.properties?.['Video Link']?.url;
  const newsletter = databaseRecord.properties?.['Newsletter']?.url;

  if (!videoLink && !weeklyVerse && !newsletter) {
    return;
  }
  // find the first column_list
  const blocks = await notion.blocks.children.list({
    block_id: pageId,
    page_size: 20,
  });

  const target = blocks?.results?.find(r => r.type === 'column_list');

  if (!target) {
    console.log('Not able to find column list.');
  }

  await sleep(350);

  const res = await notion.blocks.children.list({
    block_id: target.id,
    page_size: 5,
  });

  const currentChildren = res.results || [];
  console.log(`Current colums ${currentChildren.length}`);

  console.log(`Updating Mandarin Page. ${target.id}`);
  const rightBlocks = [ videoPlayerBlock(videoLink) ]
    .filter(n => !!n);

  const leftBlocks = [];

  if (weeklyVerse) {
    leftBlocks.push(
      heading3Block('本週金句', { color: 'pink' }),
      paragraphBlock(weeklyVerse, { color :'pink', bold: true }),
      { paragraph: { rich_text: [] } }
    );
  }

  if (newsletter) {
    leftBlocks.push(heading3Block('主日週報', { color :'blue', url: newsletter }));
  }

  const newTarget = columnList([leftBlocks, rightBlocks]);

  await sleep(350);

  // adding new colums
  await notion.blocks.children.append({
    block_id: target.id,
    children: newTarget.column_list.children
  });

  // delete old colums
  for (const n of currentChildren) {
    await sleep(350);
    await notion.blocks.delete({
      block_id: n.id
    });
  }

  console.log('Mandarin Page Updated.');
}

async function createSundaySchoolRecord(notion, database_id, record, isEnglish) {
  const handoutText = isEnglish ? '📄 Handout' : '📄 講義';
  const recordingText = isEnglish ? '▶️  Recording' : '▶️  錄音';
  const propEntries = [
    [ 'Date', { date: { start: record.date } } ],
    [ 'Title', titleBlock(record.title) ],
    [ 'Speakers', multiSelect(record.speakers) ],
    [ 'Handout', linkText(handoutText, record.handoutLink) ],
    [ 'Recording', linkText(recordingText, record.audioLink) ],
    [ 'Verses', multiSelect(record.verses) ],
    [ 'Tags', multiSelect(record.tags) ],
  ].filter(n => !!n[1]);

  const pageBody = {
    parent: { database_id },
    cover: null,
    icon: null,
    properties: Object.fromEntries(propEntries)
  };

  console.log(`Lesson Payload: ${JSON.stringify(pageBody)}`);
  const res = await notion.pages.create(pageBody);
  console.log(`Lesson Created ${res.id}`);
  return res.id;
}

export default {
  createNotionClient,
  createVideoTestimonyRecord,
  createSermonRecord,
  updateSermonHighlight,
  updateMMPage,
  createSundaySchoolRecord
};
