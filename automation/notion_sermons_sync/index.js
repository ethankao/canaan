import gWorker from './src/google_sheets.js';
import nWorker from './src/notion.js';

const sermonsSheet = '1wS5R_yxItbRPVkO2BL0vOwxAq1T9PXnIzOikJTJGvmU';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

(async () => {
  try {
    const auth = await gWorker.authorize();
    const records = await gWorker.fetchSheetRecords(auth, sermonsSheet, '2024');

    if (records.length == 0) { return; }

    const notion = await nWorker.createNotionClient();

    for (const r of records) {
      try {
        console.log(`Importing: ${JSON.stringify(r)}`);
        await nWorker.createSermonRecord(notion, r, false);
        await gWorker.markRecordIsImported(auth, sermonsSheet, '2024', r.rowIndex);
        console.log(`Importing: ${r.rowIndex} done.\n`);
        await sleep(350); // avoid rate limits
      } catch(error) {
        console.error(`Fail to create record ${r.rowIndex}: ${error}\n`);
      }
    }
  } catch(error) {
    console.error(error);
  }
})();
