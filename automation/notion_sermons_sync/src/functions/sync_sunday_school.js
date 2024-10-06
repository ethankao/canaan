import gWorker from '../base/google_sheets.js';
import nWorker from '../base/notion.js';

const sundaySchoolConfigs = [
  { // 2024 Q1 約書亞記
    sheet: '1MBCCmEcH1Or-xb6cQxdJSZIMvNxcY1yxsj44CYkn8k8',
    tab: '2024 Q1 約書亞記',
    notionPage: '6c2ea71bcbbd418abdf9511875de40ad',
    importedField: 'H'
  },
  { // 舊約聖經人物
    sheet: '1MBCCmEcH1Or-xb6cQxdJSZIMvNxcY1yxsj44CYkn8k8',
    tab: '2024 Q4 舊約聖經人物',
    notionPage: '7246406bc3db431f8d412e87e5dde435',
    importedField: 'H'
  },
  { // 基督徒生活造就
    sheet: '1MBCCmEcH1Or-xb6cQxdJSZIMvNxcY1yxsj44CYkn8k8',
    tab: '2024 Q4 基督徒生活造就',
    notionPage: '0f82d566bb7449c4a2ad210574a3f97f',
    importedField: 'H'
  },
];

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

(async () => {
  const auth = await gWorker.authorize();
  const notion = await nWorker.createNotionClient();
  for (const config of sundaySchoolConfigs) {
    try {
      // const tabName = '2024';
      const records = await gWorker.fetchSundaySchoolSheetRecords(auth, config.sheet, config.tab);

      if (records.length == 0) {
        console.log(`${config.tab} are all imported.`)
        continue;
      }

      console.log(`Processing ${config.tab}. ${records.length}`)

      const blocks = await notion.blocks.children.list({
        block_id: config.notionPage,
        page_size: 50,
      });
      const database = blocks.results.filter((block) => block.type === 'child_database')[0];
      if (!database) {
        console.log(`Database for ${config.tab} not found.`)
        continue;
      }

      for (const r of records) {
        try {
          console.log(`Importing Sermon: ${JSON.stringify(r)}`);
          const pageId = await nWorker.createSundaySchoolRecord(notion, database.id, r, config.isEnglish);
          await gWorker.markRecordIsImported(auth, config.sheet, config.tab, r.rowIndex, config.importedField, pageId);
          console.log(`Importing: ${r.rowIndex} done.\n`);
          await sleep(350); // avoid rate limits
        } catch(error) {
          console.error(`Fail to create sermon record ${r.rowIndex}: ${error}\n`);
        }
      }
    } catch(error) {
      console.error(error);
    }
  }
})();
